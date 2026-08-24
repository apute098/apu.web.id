import { NextRequest, NextResponse } from 'next/server';
import { execFileSync, execSync } from 'child_process';
import { isAuthorized, unauthorized } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export interface ProcessItem {
  pid: number;
  user: string;
  cpu: number;
  memPercent: number;
  ramMB: number;
  vszMB: number;
  stat: string;
  status: 'running' | 'sleeping' | 'stopped' | 'zombie';
  time: string;
  name: string;
  command: string;
}

function parseProcesses(): ProcessItem[] {
  try {
    const raw = execSync('ps -eo pid,user,%cpu,%mem,rss,vsz,stat,time,comm,args --sort=-%cpu', {
      encoding: 'utf-8',
      timeout: 4000,
    });

    const lines = raw.trim().split('\n');
    const list: ProcessItem[] = [];

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(/\s+/);
      if (parts.length < 9) continue;

      const pid = parseInt(parts[0], 10);
      if (isNaN(pid) || pid <= 0) continue;

      const user = parts[1];
      const cpu = parseFloat(parts[2]) || 0;
      const memPercent = parseFloat(parts[3]) || 0;
      const rssKB = parseInt(parts[4], 10) || 0;
      const vszKB = parseInt(parts[5], 10) || 0;
      const stat = parts[6];
      const time = parts[7];
      const name = parts[8];
      const command = parts.slice(9).join(' ') || name;

      let status: ProcessItem['status'] = 'running';
      if (stat.startsWith('S') || stat.startsWith('I')) status = 'sleeping';
      else if (stat.startsWith('T')) status = 'stopped';
      else if (stat.startsWith('Z')) status = 'zombie';
      else if (stat.startsWith('R') || stat.startsWith('D')) status = 'running';

      list.push({
        pid,
        user,
        cpu: Math.round(cpu * 10) / 10,
        memPercent: Math.round(memPercent * 10) / 10,
        ramMB: Math.round(rssKB / 1024),
        vszMB: Math.round(vszKB / 1024),
        stat,
        status,
        time,
        name,
        command,
      });
    }

    return list;
  } catch (err) {
    console.error('Failed to parse processes:', err);
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    const processes = parseProcesses();
    const total = processes.length;
    const running = processes.filter(p => p.status === 'running').length;
    const sleeping = processes.filter(p => p.status === 'sleeping').length;
    const stopped = processes.filter(p => p.status === 'stopped').length;
    const zombie = processes.filter(p => p.status === 'zombie').length;

    // Top processes for dashboard summary
    const topCpu = [...processes].sort((a, b) => b.cpu - a.cpu).slice(0, 10);
    const topMem = [...processes].sort((a, b) => b.ramMB - a.ramMB).slice(0, 10);

    return NextResponse.json(
      {
        success: true,
        summary: { total, running, sleeping, stopped, zombie },
        processes: processes.slice(0, 150), // Send top 150 processes
        topCpu,
        topMem,
        timestamp: new Date().toISOString(),
      },
      {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: 'Gagal memuat proses' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  try {
    const body = await req.json();
    const { pid, signal, action } = body;

    const targetPid = parseInt(String(pid), 10);
    if (isNaN(targetPid) || targetPid <= 1) {
      return NextResponse.json({ success: false, error: 'PID tidak valid atau diproteksi (PID 1)' }, { status: 400 });
    }

    let targetSignal = 'SIGTERM';
    if (signal) {
      targetSignal = String(signal).toUpperCase();
    } else if (action === 'kill' || action === 'force_kill') {
      targetSignal = 'SIGKILL';
    } else if (action === 'terminate') {
      targetSignal = 'SIGTERM';
    } else if (action === 'pause') {
      targetSignal = 'SIGSTOP';
    } else if (action === 'resume') {
      targetSignal = 'SIGCONT';
    }

    const validSignals = ['SIGTERM', 'SIGKILL', 'SIGSTOP', 'SIGCONT', 'SIGHUP', 'SIGINT'];
    if (!validSignals.includes(targetSignal)) {
      return NextResponse.json({ success: false, error: `Signal ${targetSignal} tidak valid` }, { status: 400 });
    }

    // Try normal kill, fallback to sudo kill if needed
    try {
      process.kill(targetPid, targetSignal as NodeJS.Signals);
    } catch {
      execSync(`sudo -n kill -s ${targetSignal} ${targetPid}`, { encoding: 'utf-8', timeout: 3000 });
    }

    return NextResponse.json({
      success: true,
      message: `Signal ${targetSignal} berhasil dikirim ke PID ${targetPid}.`,
    });
  } catch (err: unknown) {
    console.error('Process action error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Gagal mengirim sinyal ke proses',
      },
      { status: 500 }
    );
  }
}
