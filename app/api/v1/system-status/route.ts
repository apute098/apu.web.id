import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { isAuthorized, unauthorized } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const GB = 1024 ** 3;
const TB = 1024 ** 4;

// --- module-level state untuk delta rate (network & disk I/O) antar panggilan ---
let prevNet = new Map<string, { rx: number; tx: number; at: number }>();
let prevDisk = { sectorsRead: 0, sectorsWrite: 0, at: 0 };
let prevCpu = { total: 0, idle: 0 };

function readProc(path: string): string | null {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return null;
  }
}

function runCmd(cmd: string): string | null {
  try {
    return execSync(cmd, { encoding: 'utf8', timeout: 5000 }).trim();
  } catch {
    return null;
  }
}

function getCpuUsage(): number {
  const stat = readProc('/proc/stat');
  if (!stat) return 0;
  const parts = stat.split('\n')[0].split(/\s+/);
  if (parts[0] !== 'cpu' || parts.length < 8) return 0;
  const values = parts.slice(1).map(Number);
  const total = values.reduce((a, b) => a + b, 0);
  const idle = values[3] + (values[4] || 0); // idle + iowait
  if (prevCpu.total === 0) {
    prevCpu = { total, idle };
    return Math.round(((total - idle) / total) * 1000) / 10; // rata-rata sejak boot
  }
  const dTotal = total - prevCpu.total;
  const dIdle = idle - prevCpu.idle;
  prevCpu = { total, idle };
  if (dTotal <= 0) return 0;
  return Math.round(((dTotal - dIdle) / dTotal) * 1000) / 10;
}

function getRam() {
  const meminfo = readProc('/proc/meminfo');
  if (!meminfo) return { usedGB: 0, totalGB: 0, usagePercent: 0 };
  const get = (k: string) => {
    const m = meminfo.match(new RegExp(`^${k}:\\s+(\\d+)`, 'm'));
    return m ? Number(m[1]) * 1024 : 0; // kB -> bytes
  };
  const total = get('MemTotal');
  const available = get('MemAvailable');
  const used = total - available;
  const usedGB = Math.round((used / GB) * 10) / 10;
  const totalGB = Math.round((total / GB) * 10) / 10;
  return {
    usedGB,
    totalGB,
    usagePercent: total > 0 ? Math.round((used / total) * 1000) / 10 : 0,
  };
}

function getHdd() {
  const out = runCmd('df -B1 -T /');
  if (!out) {
    return { usedTB: 0, totalTB: 0, freeTB: 0, usagePercent: 0, filesystem: 'unknown' };
  }
  const lines = out.split('\n').filter((l) => l.trim().endsWith(' /'));
  if (lines.length === 0) {
    return { usedTB: 0, totalTB: 0, freeTB: 0, usagePercent: 0, filesystem: 'unknown' };
  }
  const cols = lines[0].split(/\s+/);
  // df -T: Filesystem Type 1B-blocks Used Available Use% Mounted
  const total = Number(cols[2]);
  const used = Number(cols[3]);
  const free = Number(cols[4]);
  const tb = (n: number) => Math.round((n / TB) * 100) / 100;
  return {
    usedTB: tb(used),
    totalTB: tb(total),
    freeTB: tb(free),
    usagePercent: total > 0 ? Math.round((used / total) * 1000) / 10 : 0,
    filesystem: `${cols[1]} (${cols[0]})`,
  };
}

function getWalMode(): boolean {
  // PRAGMA journal_mode pada database SQLite utama jika ada
  for (const db of ['data/keuangan.db', 'keuangan.db', 'src/data/keuangan.db']) {
    if (readProc(db) !== null) {
      const mode = runCmd(`sqlite3 '${db}' 'PRAGMA journal_mode;'`);
      if (mode !== null) return mode === 'wal';
    }
  }
  return false;
}

function getTemperature() {
  const zones = readProc('/sys/class/thermal/thermal_zone0/temp');
  if (!zones) {
    return { currentC: null, status: 'normal', sensor: 'lm-sensors tidak tersedia' };
  }
  const currentC = Math.round(Number(zones) / 10) / 100; // mili derajat -> °C
  const type = readProc('/sys/class/thermal/thermal_zone0/type')?.trim() || 'thermal_zone0';
  return {
    currentC,
    status: currentC > 75 ? 'warning' : 'normal',
    sensor: `${type} (/sys/class/thermal)`,
  };
}

function getNetwork() {
  const netdev = readProc('/proc/net/dev');
  if (!netdev) return { downloadKbps: 0, uploadKbps: 0, activeConnections: 0, interface: 'unknown' };
  const now = Date.now();
  let pick = '';
  let pickBytes = 0;
  const rates: Record<string, { rx: number; tx: number }> = {};
  for (const line of netdev.split('\n').slice(2)) {
    const m = line.match(/^\s*([^:]+):\s+(\d+)\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+(\d+)/);
    if (!m) continue;
    const iface = m[1];
    const rx = Number(m[2]);
    const tx = Number(m[3]);
    const prev = prevNet.get(iface);
    const elapsedSec = prev ? (now - prev.at) / 1000 : 0;
    let rxRate = 0;
    let txRate = 0;
    if (prev && elapsedSec > 0) {
      rxRate = Math.max(0, (rx - prev.rx) / elapsedSec);
      txRate = Math.max(0, (tx - prev.tx) / elapsedSec);
    }
    rates[iface] = { rx: rxRate, tx: txRate };
    prevNet.set(iface, { rx, tx, at: now });
    if (iface !== 'lo' && rx + tx > pickBytes) {
      pick = iface;
      pickBytes = rx + tx;
    }
  }
  const uptime = getUptimeSeconds();
  const sel = rates[pick] || { rx: 0, tx: 0 };
  let downloadKbps = sel.rx / 1024;
  let uploadKbps = sel.tx / 1024;
  if (downloadKbps === 0 && uptime > 0) {
    // panggilan pertama: rata-rata sejak boot
    const cum = prevNet.get(pick);
    if (cum) {
      downloadKbps = cum.rx / uptime / 1024;
      uploadKbps = cum.tx / uptime / 1024;
    }
  }
  // activeConnections dari /proc/loadavg (running/total tasks)
  const loadavg = readProc('/proc/loadavg');
  let activeConnections = 0;
  if (loadavg) {
    const m = loadavg.match(/(\d+)\/(\d+)/);
    if (m) activeConnections = Number(m[1]);
  }
  return {
    downloadKbps: Math.round(downloadKbps),
    uploadKbps: Math.round(uploadKbps),
    activeConnections,
    interface: pick || 'lo',
  };
}

function getDiskIO() {
  const stats = readProc('/proc/diskstats');
  const hdd = getHdd();
  if (!stats) {
    return { readMBps: 0, writeMBps: 0, status: 'WAL Mode Active' };
  }
  const dev = hdd.filesystem.split(' ')[1]?.replace(/[^a-zA-Z]/g, '') || 'sda';
  const now = Date.now();
  for (const line of stats.split('\n')) {
    const parts = line.trim().split(/\s+/);
    if (parts[2] !== dev) continue;
    const sectorsRead = Number(parts[5]);
    const sectorsWrite = Number(parts[9]);
    let readMBps = 0;
    let writeMBps = 0;
    const elapsedSec = prevDisk.at ? (now - prevDisk.at) / 1000 : 0;
    if (prevDisk.at && elapsedSec > 0) {
      readMBps = Math.max(0, ((sectorsRead - prevDisk.sectorsRead) * 512) / elapsedSec) / (1024 ** 2);
      writeMBps = Math.max(0, ((sectorsWrite - prevDisk.sectorsWrite) * 512) / elapsedSec) / (1024 ** 2);
    } else {
      // panggilan pertama: rata-rata sejak boot
      const uptime = getUptimeSeconds();
      if (uptime > 0) {
        readMBps = (sectorsRead * 512) / uptime / (1024 ** 2);
        writeMBps = (sectorsWrite * 512) / uptime / (1024 ** 2);
      }
    }
    prevDisk = { sectorsRead, sectorsWrite, at: now };
    return {
      readMBps: Math.round(readMBps * 10) / 10,
      writeMBps: Math.round(writeMBps * 10) / 10,
      status: 'WAL Mode Active',
    };
  }
  return { readMBps: 0, writeMBps: 0, status: 'WAL Mode Active' };
}

function getUptimeSeconds(): number {
  const uptime = readProc('/proc/uptime');
  if (!uptime) return 0;
  return Number(uptime.split(' ')[0]) || 0;
}

function getServices(): Record<string, string> {
  const userUnits = [
    'apu-webid',
    'apu-ecosystem',
    '9router',
    'mitm-router',
    'opencode-server',
    'grok-sse-filter',
    'teamwork-preview',
  ];
  const systemUnits = ['caddy', 'cloudflared', 'hermes-gateway', 'mihomo'];
  const services: Record<string, string> = {};
  const fmt = (state: string | null) =>
    state === 'active' ? 'active (running)' : `${state || 'unknown'} (dead)`;
  for (const u of userUnits) {
    const out = runCmd(`systemctl --user is-active '${u}'`);
    services[u] = fmt(out);
  }
  for (const u of systemUnits) {
    const out = runCmd(`systemctl is-active '${u}'`);
    services[u] = fmt(out);
  }
  return services;
}

export async function GET() {
  try {
    const cpu = getCpuUsage();
    const ram = getRam();
    const hdd = getHdd();
    const walMode = getWalMode();
    const temperature = getTemperature();
    const network = getNetwork();
    const diskIO = getDiskIO();
    const uptimeSec = getUptimeSeconds();
    const uptime = `${Math.floor(uptimeSec / 86400)}d ${Math.floor((uptimeSec % 86400) / 3600)}h ${Math.floor((uptimeSec % 3600) / 60)}m`;

    // load average 1/5/15 menit + jumlah proses (real dari /proc)
    let loadAverage: number[] = [0, 0, 0];
    let processCount = 0;
    const loadavg = readProc('/proc/loadavg');
    if (loadavg) {
      const parts = loadavg.split(/\s+/);
      loadAverage = parts.slice(0, 3).map((n) => Math.round(Number(n) * 100) / 100);
      processCount = Number(parts[3]?.split('/')[1] || 0);
    }

    const cpuinfo = readProc('/proc/cpuinfo');
    let model = 'unknown';
    let cores = 0;
    if (cpuinfo) {
      const mm = cpuinfo.match(/model name\s*:\s*(.+)/);
      if (mm) model = mm[1].trim();
      cores = cpuinfo.split('\n').filter((l) => l.startsWith('processor')).length;
    }
    const hostname = readProc('/proc/sys/kernel/hostname')?.trim() || 'unknown';
    const osrelease = readProc('/proc/sys/kernel/osrelease')?.trim() || 'unknown';

    return NextResponse.json(
      {
        success: true,
        status: 'online',
        serverName: hostname,
        os: `Arch Linux x86_64 (Linux ${osrelease})`,
        uptime,
        cpu: { usagePercent: cpu, cores, model },
        loadAverage,
        processCount,
        ram,
        hdd: { ...hdd, walMode },
        temperature,
        network,
        diskIO,
        services: getServices(),
        stressMode: false, // stress test dihapus — data selalu real
        timestamp: new Date().toISOString(),
      },
      {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  } catch (err: unknown) {
    console.error('GET /api/v1/system-status gagal:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, error: 'Gagal membaca status sistem — coba lagi nanti.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  return NextResponse.json(
    { success: false, error: 'Stress mode dihapus — endpoint read-only' },
    { status: 501 }
  );
}
