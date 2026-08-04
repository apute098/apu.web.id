import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized, unauthorized } from '@/lib/auth';
import { execFileSync } from 'node:child_process';

export const dynamic = 'force-dynamic';

export interface ProcessItem {
  pid: number;
  name: string;
  user: string;
  cpu: number;
  ramMB: number;
  status: 'Running' | 'Sleeping' | 'Paused' | 'Stopped';
  command: string;
}

export interface ServiceItem {
  name: string;
  unit: string;
  status: 'active (running)' | 'inactive (dead)' | 'restarting' | 'failed';
  memory: string;
  description: string;
}

function parsePsOutput(raw: string): ProcessItem[] {
  const lines = raw.trim().split('\n');
  // Skip header line
  const entries: ProcessItem[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // ps -eo pid,user,%cpu,%mem,comm,args — columns are space-padded
    // pid is first, user second, cpu third, mem fourth, comm fifth, args rest
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Split on whitespace; pid/user/cpu/mem/comm are first 5 fields, args is the rest
    const parts = trimmed.split(/\s+/);
    if (parts.length < 5) continue;
    const pid = parseInt(parts[0], 10);
    if (isNaN(pid) || pid <= 0) continue;
    const user = parts[1];
    const cpu = parseFloat(parts[2]);
    const mem = parseFloat(parts[3]);
    const name = parts[4];
    // ramMB = (mem% * totalMem) / 100 — approximate from %MEM
    // Use /proc/meminfo for total RAM, fallback to 16384 (16GB)
    let totalMemKB = 16384 * 1024;
    try {
      const meminfo = execFileSync('cat', ['/proc/meminfo'], { encoding: 'utf-8' });
      const memTotalMatch = meminfo.match(/MemTotal:\s+(\d+)\s+kB/);
      if (memTotalMatch) totalMemKB = parseInt(memTotalMatch[1], 10);
    } catch {
      // fallback to 16GB
    }
    const ramMB = Math.round((mem / 100) * totalMemKB / 1024);
    // Determine status from /proc/<pid>/stat if possible
    let status: ProcessItem['status'] = 'Running';
    try {
      const stat = execFileSync('cat', [`/proc/${pid}/stat`], { encoding: 'utf-8' });
      const state = stat.split(' ')[2];
      if (state === 'S') status = 'Sleeping';
      else if (state === 'R') status = 'Running';
      else if (state === 'T') status = 'Paused';
      else if (state === 'Z') status = 'Stopped';
      else if (state === 'D') status = 'Running'; // uninterruptible sleep, treat as Running
    } catch {
      // process may have exited between ps and here
      status = 'Running';
    }
    const command = parts.slice(5).join(' ');
    entries.push({ pid, name, user, cpu, ramMB, status, command });
  }
  return entries;
}

function getUserServices(): ServiceItem[] {
  const services: ServiceItem[] = [];
  try {
    const output = execFileSync(
      'systemctl',
      ['--user', 'list-units', '--type=service', '--no-pager', '--no-legend'],
      { encoding: 'utf-8' }
    );
    const lines = output.trim().split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      // Format: unit-name load active sub description
      // Example: apu-webid-next.service loaded active running Next.js server
      const parts = line.split(/\s{2,}/); // split on 2+ spaces
      if (parts.length < 5) continue;
      const unit = parts[0].trim();
      const load = parts[1]?.trim() || '';
      const active = parts[2]?.trim() || '';
      const sub = parts[3]?.trim() || '';
      const desc = parts.slice(4).join(' ').trim();
      if (load !== 'loaded') continue;
      let status: ServiceItem['status'] = 'inactive (dead)';
      if (active === 'active' && sub === 'running') status = 'active (running)';
      else if (active === 'active' && sub === 'exited') status = 'active (running)';
      else if (active === 'inactive' && sub === 'dead') status = 'inactive (dead)';
      else if (active === 'failed') status = 'failed';
      else if (active === 'activating') status = 'active (running)';
      // memory: try systemctl --user show
      let memory = '0 MB';
      try {
        const memOut = execFileSync(
          'systemctl',
          ['--user', 'show', unit, '-p', 'MemoryCurrent', '--value'],
          { encoding: 'utf-8' }
        ).trim();
        const memBytes = parseInt(memOut, 10);
        if (!isNaN(memBytes) && memBytes > 0) {
          memory = `${Math.round(memBytes / 1024 / 1024)} MB`;
        }
      } catch {
        // no memory info available
      }
      services.push({ name: unit.replace(/\.service$/, ''), unit, status, memory, description: desc });
    }
  } catch {
    // systemctl --user failed (no user bus) — return empty
  }
  return services;
}

function getSystemServiceStatus(unit: string): string {
  try {
    const output = execFileSync('systemctl', ['is-active', unit], { encoding: 'utf-8' }).trim();
    return output;
  } catch {
    return 'unknown';
  }
}

function getSystemServices(): ServiceItem[] {
  const services: ServiceItem[] = [];
  const systemUnits = ['caddy', 'cloudflared'];
  for (const unit of systemUnits) {
    const status = getSystemServiceStatus(unit);
    let svcStatus: ServiceItem['status'] = 'inactive (dead)';
    if (status === 'active') svcStatus = 'active (running)';
    else if (status === 'inactive' || status === 'unknown') svcStatus = 'inactive (dead)';
    else if (status === 'failed') svcStatus = 'failed';
    // Try to get description from systemctl show
    let description = unit;
    let memory = '0 MB';
    try {
      const showOut = execFileSync('systemctl', ['show', unit, '-p', 'Description,MemoryCurrent', '--value'], { encoding: 'utf-8' });
      const lines = showOut.trim().split('\n');
      if (lines.length >= 1) description = lines[0].trim() || unit;
      if (lines.length >= 2) {
        const memBytes = parseInt(lines[1].trim(), 10);
        if (!isNaN(memBytes) && memBytes > 0) memory = `${Math.round(memBytes / 1024 / 1024)} MB`;
      }
    } catch {
      // no systemd info
    }
    services.push({ name: unit, unit: `${unit}.service`, status: svcStatus, memory, description });
  }
  return services;
}

// Service user (systemctl --user) vs system (sudo -n systemctl).
// caddy/cloudflared = system units → butuh sudo; apu-webid-next/apu-ecosystem = user units.
const ALLOWED_SERVICE_NAMES = new Map<string, 'user' | 'system'>([
  ['caddy', 'system'],
  ['cloudflared', 'system'],
  ['apu-webid-next', 'user'],
  ['apu-ecosystem', 'user'],
]);
const SERVICE_NAME_REGEX = /^[a-zA-Z0-9_.-]+$/;
const ALLOWED_PROCESS_ACTIONS = new Set(['kill', 'terminate', 'pause', 'resume']);
const ALLOWED_SERVICE_ACTIONS = new Set(['restart_service', 'stop_service', 'start_service']);

export async function GET(req: NextRequest) {
  let psOutput: string;
  try {
    psOutput = execFileSync('ps', ['-eo', 'pid,user,%cpu,%mem,comm,args', '--sort=-%cpu'], { encoding: 'utf-8' });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Gagal membaca daftar proses — coba lagi nanti.' },
      { status: 500 }
    );
  }

  try {
    const allProcesses = parsePsOutput(psOutput);
    const topProcesses = allProcesses.slice(0, 20);
    const totalProcesses = allProcesses.length;

    const userServices = getUserServices();
    const systemServices = getSystemServices();
    const allServices = [...userServices, ...systemServices];
    const activeServices = allServices.filter((s) => s.status === 'active (running)').length;

    return NextResponse.json({
      success: true,
      processes: topProcesses,
      services: allServices,
      totalProcesses,
      activeServices,
    });
  } catch (err: unknown) {
    console.error('GET /api/v1/processes gagal:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data proses — coba lagi nanti.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Body JSON tidak valid' }, { status: 400 });
  }
  try {
    const { action, pid, serviceName } = body as { action?: string; pid?: number; serviceName?: string };

    // Process Actions
    if (pid !== undefined && action) {
      if (!ALLOWED_PROCESS_ACTIONS.has(action)) {
        return NextResponse.json({ success: false, error: `Aksi tidak dikenal: ${action}` }, { status: 400 });
      }

      // Verify process belongs to user 'apu'
      let procUser = '';
      try {
        procUser = execFileSync('ps', ['-o', 'user=', '-p', String(pid)], { encoding: 'utf-8' }).trim();
      } catch {
        return NextResponse.json({ success: false, error: `Proses PID ${pid} tidak ditemukan` }, { status: 404 });
      }
      if (procUser !== 'apu') {
        return NextResponse.json({ success: false, error: `Proses PID ${pid} milik user '${procUser}', bukan 'apu'. Aksi ditolak.` }, { status: 403 });
      }

      const signalMap: Record<string, NodeJS.Signals> = {
        kill: 'SIGKILL',
        terminate: 'SIGTERM',
        pause: 'SIGSTOP',
        resume: 'SIGCONT',
      };
      const signal = signalMap[action];
      try {
        process.kill(pid, signal);
        return NextResponse.json({
          success: true,
          message: `Proses PID ${pid} menerima ${signal}.`,
        });
      } catch (err: unknown) {
        console.error(`Gagal ${action} PID ${pid}:`, err instanceof Error ? err.message : err);
        return NextResponse.json(
          { success: false, error: `Gagal mengirim ${signal} ke PID ${pid} — coba lagi nanti.` },
          { status: 500 }
        );
      }
    }

    // Service Actions
    if (serviceName && action) {
      if (!ALLOWED_SERVICE_ACTIONS.has(action)) {
        return NextResponse.json({ success: false, error: `Aksi service tidak dikenal: ${action}` }, { status: 400 });
      }
      if (!SERVICE_NAME_REGEX.test(serviceName)) {
        return NextResponse.json({ success: false, error: `Nama service tidak valid: ${serviceName}` }, { status: 400 });
      }
      const serviceMode = ALLOWED_SERVICE_NAMES.get(serviceName);
      if (!serviceMode) {
        return NextResponse.json({ success: false, error: `Service '${serviceName}' tidak terdaftar di daftar service real` }, { status: 403 });
      }

      const systemctlAction = action === 'restart_service' ? 'restart' : action === 'stop_service' ? 'stop' : 'start';
      try {
        if (serviceMode === 'system') {
          execFileSync('sudo', ['-n', 'systemctl', systemctlAction, `${serviceName}.service`], { encoding: 'utf-8' });
        } else {
          execFileSync('systemctl', ['--user', systemctlAction, `${serviceName}.service`], { encoding: 'utf-8' });
        }
        return NextResponse.json({
          success: true,
          message: `Executed: systemctl ${serviceMode === 'system' ? '' : '--user '}${systemctlAction} ${serviceName}.service — Done.`,
        });
      } catch (err: unknown) {
        console.error(`systemctl ${systemctlAction} ${serviceName}.service gagal:`, err instanceof Error ? err.message : err);
        return NextResponse.json(
          {
            success: false,
            error: `systemctl ${systemctlAction} ${serviceName}.service gagal — cek log sistem / izin sudo.`,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: false, error: 'Instruksi tidak dikenal' }, { status: 400 });
  } catch (err: unknown) {
    console.error('POST /api/v1/processes gagal:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal saat memproses permintaan — coba lagi nanti.' },
      { status: 500 }
    );
  }
}
