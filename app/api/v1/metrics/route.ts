import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';

export const dynamic = 'force-dynamic';

function readProc(path: string): string | null {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    let cpuPercent = 0;
    const stat = readProc('/proc/stat');
    if (stat) {
      const parts = stat.split('\n')[0].split(/\s+/).slice(1).map(Number);
      const total = parts.reduce((a, b) => a + b, 0);
      const idle = parts[3] + (parts[4] || 0);
      cpuPercent = total > 0 ? Math.round(((total - idle) / total) * 1000) / 10 : 0;
    }

    const meminfo = readProc('/proc/meminfo') || '';
    const getKB = (key: string) => {
      const m = meminfo.match(new RegExp(`^${key}:\\s+(\\d+)`, 'm'));
      return m ? Number(m[1]) * 1024 : 0;
    };
    const memTotal = getKB('MemTotal');
    const memAvailable = getKB('MemAvailable');
    const memUsed = memTotal - memAvailable;

    const loadavg = (readProc('/proc/loadavg') || '0 0 0').split(/\s+/);

    let tempC = 50;
    try {
      const tempRaw = readProc('/sys/class/thermal/thermal_zone0/temp');
      if (tempRaw) tempC = Number(tempRaw.trim()) / 1000;
    } catch {}

    const metrics = `
# HELP node_cpu_usage_percent CPU utilization percentage
# TYPE node_cpu_usage_percent gauge
node_cpu_usage_percent ${cpuPercent}

# HELP node_memory_bytes Memory usage in bytes
# TYPE node_memory_bytes gauge
node_memory_total_bytes ${memTotal}
node_memory_used_bytes ${memUsed}
node_memory_available_bytes ${memAvailable}

# HELP node_load_average Load average 1m, 5m, 15m
# TYPE node_load_average gauge
node_load_1m ${loadavg[0] || 0}
node_load_5m ${loadavg[1] || 0}
node_load_15m ${loadavg[2] || 0}

# HELP node_temperature_celsius System temperature
# TYPE node_temperature_celsius gauge
node_temperature_celsius ${tempC}
`.trim();

    return new NextResponse(metrics, {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return new NextResponse('# Error generating metrics', { status: 500 });
  }
}
