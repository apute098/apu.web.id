import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

export const dynamic = 'force-dynamic';

const GB = 1024 ** 3;
const TB = 1024 ** 4;
const MB = 1024 ** 2;

// Module-level tracking for delta calculations
let prevNet = new Map<string, { rx: number; tx: number; at: number }>();
let prevDisk = { sectorsRead: 0, sectorsWrite: 0, at: 0 };
let prevCpu = { total: 0, idle: 0 };
let prevPerCoreCpu: Array<{ total: number; idle: number }> = [];

function readProc(path: string): string | null {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return null;
  }
}

function runCmd(cmd: string): string | null {
  try {
    return execSync(cmd, { encoding: 'utf8', timeout: 4000 }).trim();
  } catch {
    return null;
  }
}

function getCpuStats() {
  const stat = readProc('/proc/stat');
  if (!stat) {
    return {
      totalUsage: 0,
      cores: [],
      model: 'Intel Core i5-7200U',
      coreCount: 4,
      freqGhz: 2.5,
      temperatureC: 45,
    };
  }

  const lines = stat.split('\n');
  
  // Total CPU calculation
  const totalParts = lines[0].split(/\s+/);
  let totalUsage = 0;
  if (totalParts[0] === 'cpu' && totalParts.length >= 8) {
    const values = totalParts.slice(1).map(Number);
    const total = values.reduce((a, b) => a + b, 0);
    const idle = values[3] + (values[4] || 0); // idle + iowait
    
    if (prevCpu.total === 0) {
      prevCpu = { total, idle };
      totalUsage = total > 0 ? Math.round(((total - idle) / total) * 1000) / 10 : 0;
    } else {
      const dTotal = total - prevCpu.total;
      const dIdle = idle - prevCpu.idle;
      prevCpu = { total, idle };
      totalUsage = dTotal > 0 ? Math.max(0, Math.min(100, Math.round(((dTotal - dIdle) / dTotal) * 1000) / 10)) : 0;
    }
  }

  // Per Core CPU calculation
  const coreLines = lines.filter(l => /^cpu\d+/.test(l));
  const coresUsage: number[] = [];
  
  if (prevPerCoreCpu.length !== coreLines.length) {
    prevPerCoreCpu = coreLines.map(() => ({ total: 0, idle: 0 }));
  }

  coreLines.forEach((line, idx) => {
    const parts = line.split(/\s+/);
    const values = parts.slice(1).map(Number);
    const total = values.reduce((a, b) => a + b, 0);
    const idle = values[3] + (values[4] || 0);
    
    if (prevPerCoreCpu[idx].total === 0) {
      prevPerCoreCpu[idx] = { total, idle };
      coresUsage.push(total > 0 ? Math.round(((total - idle) / total) * 1000) / 10 : 0);
    } else {
      const dTotal = total - prevPerCoreCpu[idx].total;
      const dIdle = idle - prevPerCoreCpu[idx].idle;
      prevPerCoreCpu[idx] = { total, idle };
      const usage = dTotal > 0 ? Math.max(0, Math.min(100, Math.round(((dTotal - dIdle) / dTotal) * 1000) / 10)) : 0;
      coresUsage.push(usage);
    }
  });

  // CPU Model and Frequency
  const cpuinfo = readProc('/proc/cpuinfo');
  let model = 'x86_64 Processor';
  let coreCount = coreLines.length || 4;
  if (cpuinfo) {
    const mm = cpuinfo.match(/model name\s*:\s*(.+)/);
    if (mm) model = mm[1].trim();
  }

  // Current Frequency from sysfs
  let freqGhz = 2.5;
  try {
    const freqRaw = readProc('/sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq');
    if (freqRaw) {
      freqGhz = Math.round((Number(freqRaw.trim()) / 1000000) * 100) / 100;
    }
  } catch {
    // fallback
  }

  // Temperature
  let temperatureC = 50;
  try {
    const zones = readProc('/sys/class/thermal/thermal_zone0/temp');
    if (zones) {
      temperatureC = Math.round(Number(zones.trim()) / 100) / 10;
    }
  } catch {
    // fallback
  }

  return {
    totalUsage,
    cores: coresUsage,
    model,
    coreCount,
    freqGhz,
    temperatureC,
  };
}

function getDetailedTemperatures() {
  const temps: Array<{ name: string; tempC: number; status: 'normal' | 'warm' | 'hot' }> = [];
  
  // Try reading lm-sensors or sysfs thermal zones
  for (let i = 0; i < 6; i++) {
    const tempFile = readProc(`/sys/class/thermal/thermal_zone${i}/temp`);
    const typeFile = readProc(`/sys/class/thermal/thermal_zone${i}/type`);
    if (tempFile && typeFile) {
      const tempC = Math.round(Number(tempFile.trim()) / 100) / 10;
      if (tempC > 0 && tempC < 120) {
        temps.push({
          name: typeFile.trim(),
          tempC,
          status: tempC > 80 ? 'hot' : tempC > 65 ? 'warm' : 'normal',
        });
      }
    }
  }

  if (temps.length === 0) {
    temps.push({ name: 'CPU Package', tempC: 52, status: 'normal' });
  }

  return temps;
}

function getRamAndSwap() {
  const meminfo = readProc('/proc/meminfo');
  if (!meminfo) {
    return {
      ram: { totalGB: 16, usedGB: 8, freeGB: 4, availableGB: 8, cachedGB: 4, buffersGB: 0.5, usagePercent: 50 },
      swap: { totalGB: 8, usedGB: 1, freeGB: 7, usagePercent: 12.5 },
    };
  }

  const getKB = (key: string): number => {
    const m = meminfo.match(new RegExp(`^${key}:\\s+(\\d+)`, 'm'));
    return m ? Number(m[1]) : 0;
  };

  const memTotal = getKB('MemTotal') * 1024;
  const memFree = getKB('MemFree') * 1024;
  const memAvailable = getKB('MemAvailable') * 1024;
  const buffers = getKB('Buffers') * 1024;
  const cached = getKB('Cached') * 1024;
  const memUsed = memTotal - memAvailable;

  const swapTotal = getKB('SwapTotal') * 1024;
  const swapFree = getKB('SwapFree') * 1024;
  const swapUsed = swapTotal - swapFree;

  const toGB = (n: number) => Math.round((n / GB) * 100) / 100;

  return {
    ram: {
      totalGB: toGB(memTotal),
      usedGB: toGB(memUsed),
      freeGB: toGB(memFree),
      availableGB: toGB(memAvailable),
      cachedGB: toGB(cached),
      buffersGB: toGB(buffers),
      usagePercent: memTotal > 0 ? Math.round((memUsed / memTotal) * 1000) / 10 : 0,
    },
    swap: {
      totalGB: toGB(swapTotal),
      usedGB: toGB(swapUsed),
      freeGB: toGB(swapFree),
      usagePercent: swapTotal > 0 ? Math.round((swapUsed / swapTotal) * 1000) / 10 : 0,
    },
  };
}

function getDisks() {
  const disks: Array<{
    mount: string;
    filesystem: string;
    type: string;
    totalGB: number;
    usedGB: number;
    freeGB: number;
    usagePercent: number;
  }> = [];

  const dfOut = runCmd('df -B1 -T -x tmpfs -x devtmpfs -x squashfs -x overlay');
  if (dfOut) {
    const lines = dfOut.split('\n').slice(1);
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 7) {
        const filesystem = parts[0];
        const type = parts[1];
        const total = Number(parts[2]);
        const used = Number(parts[3]);
        const free = Number(parts[4]);
        const mount = parts[6];

        if (total > 0 && (mount === '/' || mount.startsWith('/home') || mount.startsWith('/mnt') || mount.startsWith('/boot'))) {
          disks.push({
            mount,
            filesystem,
            type,
            totalGB: Math.round((total / GB) * 10) / 10,
            usedGB: Math.round((used / GB) * 10) / 10,
            freeGB: Math.round((free / GB) * 10) / 10,
            usagePercent: Math.round((used / total) * 1000) / 10,
          });
        }
      }
    }
  }

  if (disks.length === 0) {
    disks.push({
      mount: '/',
      filesystem: '/dev/sda2',
      type: 'ext4',
      totalGB: 256,
      usedGB: 48,
      freeGB: 208,
      usagePercent: 18.7,
    });
  }

  return disks;
}

function getDiskIO() {
  const stats = readProc('/proc/diskstats');
  const now = Date.now();
  if (!stats) return { readMBps: 0, writeMBps: 0 };

  let totalReadSectors = 0;
  let totalWriteSectors = 0;

  for (const line of stats.split('\n')) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 14) {
      const dev = parts[2];
      if (/^(sd[a-z]|nvme\d+n\d+|vd[a-z]|mmcblk\d+)$/.test(dev)) {
        totalReadSectors += Number(parts[5]);
        totalWriteSectors += Number(parts[9]);
      }
    }
  }

  let readMBps = 0;
  let writeMBps = 0;
  const elapsedSec = prevDisk.at ? (now - prevDisk.at) / 1000 : 0;

  if (prevDisk.at && elapsedSec > 0) {
    readMBps = Math.max(0, ((totalReadSectors - prevDisk.sectorsRead) * 512) / elapsedSec) / MB;
    writeMBps = Math.max(0, ((totalWriteSectors - prevDisk.sectorsWrite) * 512) / elapsedSec) / MB;
  }

  prevDisk = { sectorsRead: totalReadSectors, sectorsWrite: totalWriteSectors, at: now };

  return {
    readMBps: Math.round(readMBps * 100) / 100,
    writeMBps: Math.round(writeMBps * 100) / 100,
  };
}

function getNetwork() {
  const netdev = readProc('/proc/net/dev');
  const now = Date.now();
  if (!netdev) {
    return {
      downloadKbps: 0,
      uploadKbps: 0,
      totalRxMB: 0,
      totalTxMB: 0,
      activeInterface: 'eth0',
      interfaces: [],
      localIp: '192.168.1.4',
      tailscaleIp: '100.122.52.32',
    };
  }

  const interfaces: Array<{ name: string; rxKbps: number; txKbps: number; totalRxMB: number; totalTxMB: number }> = [];
  let aggregateRx = 0;
  let aggregateTx = 0;
  let primaryIface = 'wlan0';
  let maxTraffic = 0;

  for (const line of netdev.split('\n').slice(2)) {
    const m = line.match(/^\s*([^:]+):\s+(\d+)\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+(\d+)/);
    if (!m) continue;

    const iface = m[1].trim();
    const rxBytes = Number(m[2]);
    const txBytes = Number(m[3]);

    if (iface === 'lo') continue;

    const prev = prevNet.get(iface);
    const elapsedSec = prev ? (now - prev.at) / 1000 : 0;

    let rxRate = 0;
    let txRate = 0;

    if (prev && elapsedSec > 0) {
      rxRate = Math.max(0, (rxBytes - prev.rx) / elapsedSec) / 1024;
      txRate = Math.max(0, (txBytes - prev.tx) / elapsedSec) / 1024;
    }

    prevNet.set(iface, { rx: rxBytes, tx: txBytes, at: now });

    aggregateRx += rxRate;
    aggregateTx += txRate;

    if (rxBytes + txBytes > maxTraffic) {
      maxTraffic = rxBytes + txBytes;
      primaryIface = iface;
    }

    interfaces.push({
      name: iface,
      rxKbps: Math.round(rxRate * 10) / 10,
      txKbps: Math.round(txRate * 10) / 10,
      totalRxMB: Math.round((rxBytes / MB) * 10) / 10,
      totalTxMB: Math.round((txBytes / MB) * 10) / 10,
    });
  }

  let tailscaleIp = '100.122.52.32';
  let localIp = '192.168.1.4';

  return {
    downloadKbps: Math.round(aggregateRx * 10) / 10,
    uploadKbps: Math.round(aggregateTx * 10) / 10,
    activeInterface: primaryIface,
    interfaces,
    localIp,
    tailscaleIp,
  };
}

function getSystemInfo() {
  const uptimeRaw = readProc('/proc/uptime');
  const uptimeSec = uptimeRaw ? Number(uptimeRaw.split(' ')[0]) || 0 : 0;
  const days = Math.floor(uptimeSec / 86400);
  const hours = Math.floor((uptimeSec % 86400) / 3600);
  const mins = Math.floor((uptimeSec % 3600) / 60);
  const secs = Math.floor(uptimeSec % 60);

  const loadavg = readProc('/proc/loadavg');
  let loadAverage = [0.1, 0.2, 0.2];
  let runningProcesses = 1;
  let totalProcesses = 150;

  if (loadavg) {
    const parts = loadavg.split(/\s+/);
    loadAverage = parts.slice(0, 3).map(n => Math.round(Number(n) * 100) / 100);
    const procParts = parts[3]?.split('/') || [];
    runningProcesses = Number(procParts[0]) || 1;
    totalProcesses = Number(procParts[1]) || 150;
  }

  const hostname = readProc('/proc/sys/kernel/hostname')?.trim() || 'archlinux';
  const osrelease = readProc('/proc/sys/kernel/osrelease')?.trim() || '6.x';

  return {
    hostname,
    os: `Arch Linux x86_64`,
    kernel: `Linux ${osrelease}`,
    uptime: `${days}d ${hours}h ${mins}m ${secs}s`,
    uptimeSeconds: Math.floor(uptimeSec),
    loadAverage,
    runningProcesses,
    totalProcesses,
  };
}

export async function GET() {
  try {
    const cpu = getCpuStats();
    const temperatures = getDetailedTemperatures();
    const { ram, swap } = getRamAndSwap();
    const disks = getDisks();
    const diskIO = getDiskIO();
    const network = getNetwork();
    const system = getSystemInfo();

    let healthScore = 100;
    if (cpu.totalUsage > 85) healthScore -= 25;
    else if (cpu.totalUsage > 65) healthScore -= 10;

    if (ram.usagePercent > 90) healthScore -= 25;
    else if (ram.usagePercent > 75) healthScore -= 10;

    if (cpu.temperatureC > 80) healthScore -= 20;
    else if (cpu.temperatureC > 70) healthScore -= 10;

    const mainDisk = disks.find(d => d.mount === '/') || disks[0];
    if (mainDisk && mainDisk.usagePercent > 90) healthScore -= 20;
    else if (mainDisk && mainDisk.usagePercent > 80) healthScore -= 10;

    healthScore = Math.max(10, Math.min(100, healthScore));

    return NextResponse.json(
      {
        success: true,
        status: 'online',
        timestamp: new Date().toISOString(),
        healthScore,
        system,
        cpu,
        temperatures,
        ram,
        swap,
        disks,
        diskIO,
        network,
      },
      {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  } catch (err: unknown) {
    console.error('GET /api/v1/system-status error:', err);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat telemetri sistem' },
      { status: 500 }
    );
  }
}
