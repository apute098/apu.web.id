import { NextRequest, NextResponse } from 'next/server';
import { isAuthorized, unauthorized } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Rate limit sederhana: 5 POST/menit per IP (in-memory).
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  if (arr.length >= 5) {
    hits.set(ip, arr);
    return true;
  }
  arr.push(now);
  hits.set(ip, arr);
  return false;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: 'Terlalu banyak permintaan — coba lagi nanti (maks 5/menit)' },
      { status: 429 }
    );
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Body JSON tidak valid' }, { status: 400 });
  }
  const { platform, target, message } = body as { platform?: string; target?: string; message?: string };

  if (!message) {
    return NextResponse.json({ success: false, error: 'Pesan tidak boleh kosong' }, { status: 400 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return NextResponse.json(
      { success: false, error: 'not configured', statusCode: 503 },
      { status: 503 }
    );
  }

  const chatIdStr = String(chatId);
  const targetLabel = target || platform || 'unknown';
  const text = `[${targetLabel}] ${message}`;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatIdStr, text }),
      signal: AbortSignal.timeout(15000),
    });

    const data = await res.json();
    if (!res.ok || data.ok === false) {
      return NextResponse.json(
        { success: false, error: data.description || 'Telegram API error', statusCode: res.status },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      platform: 'telegram',
      target: chatIdStr,
      messageSent: message,
      timestamp: new Date().toISOString(),
      status: 'Pesan berhasil dikirim via Telegram Bot API.',
    });
  } catch (err: unknown) {
    const timedOut = err instanceof Error && err.name === 'TimeoutError';
    console.error('Telegram sendMessage gagal:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      {
        success: false,
        error: timedOut
          ? 'Telegram API tidak merespons dalam 15 detik — coba lagi nanti.'
          : 'Gagal terhubung ke Telegram API — coba lagi nanti.',
      },
      { status: 502 }
    );
  }
}
