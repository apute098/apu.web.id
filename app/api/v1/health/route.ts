import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const uptimeSec = (() => {
    try {
      return Number(readFileSync('/proc/uptime', 'utf8').split(' ')[0]) || 0;
    } catch {
      return 0;
    }
  })();

  return NextResponse.json(
    {
      success: true,
      status: 'ok',
      service: 'apu.web.id Server Control Hub',
      uptimeSec: Math.round(uptimeSec),
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
