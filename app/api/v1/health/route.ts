import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';

export const dynamic = 'force-dynamic';

/** Healthcheck ringan untuk uptime monitoring (CF/Telegram watchdog). */
export async function GET(req: NextRequest) {
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
      service: 'apu-webid',
      uptimeSec: Math.round(uptimeSec),
      db: 'keuangan.db (ditulis via webhook, dicek runtime)',
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}