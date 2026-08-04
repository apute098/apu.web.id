import { NextRequest, NextResponse } from 'next/server';
import { parseChatAndInsert } from '@/lib/keuangan';
import { isAuthorized, unauthorized } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Webhook Receiver Layer untuk WhatsApp & Telegram.
// Tidak mengirim pesan keluar — hanya menerima, mengekstrak via Gemini, dan mencatat ke DB.

function extractMessage(body: Record<string, any>): { messageText: string; platform: string; sender: string } {
  if (body.message && typeof body.message === 'object' && (body.message.text || body.message.caption)) {
    // Telegram structure: { message: { text, from: { username }, chat: { id } } }
    return {
      messageText: String(body.message.text || body.message.caption || ''),
      platform: 'Telegram',
      sender: body.message.from?.username
        ? `@${body.message.from.username}`
        : `Chat #${body.message.chat?.id || 'Telegram'}`,
    };
  }
  if (typeof body.message === 'string' || typeof body.pesan === 'string' || typeof body.text === 'string') {
    return {
      messageText: String(body.message || body.pesan || body.text || ''),
      platform: 'WhatsApp',
      sender: String(body.sender || body.from || body.phone || body.username || 'Unknown'),
    };
  }
  return { messageText: '', platform: 'WhatsApp', sender: 'Unknown' };
}

// GET: Webhook verification handshake (WhatsApp / Meta style: hub.mode, hub.verify_token, hub.challenge)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe') {
    if (!process.env.WEBHOOK_TOKEN) {
      return NextResponse.json(
        { success: false, error: 'WEBHOOK_TOKEN belum dikonfigurasi di .env.local. Tambahkan lalu deploy ulang.' },
        { status: 403 }
      );
    }
    if (token !== process.env.WEBHOOK_TOKEN) {
      return NextResponse.json({ success: false, error: 'hub.verify_token tidak cocok.' }, { status: 403 });
    }
    return new Response(challenge || 'VERIFIED_OK', { status: 200 });
  }

  return NextResponse.json({
    success: true,
    status: 'online',
    endpoint: '/api/v1/webhook/bot',
    mode: 'receive-only (parse & save, no outbound send)',
    supportedPlatforms: ['WhatsApp Webhook (Fonnte/Baileys/Meta)', 'Telegram Bot Webhook'],
  });
}

// POST: Real Webhook Receiver untuk WhatsApp & Telegram
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  // Handler TIDAK BOLEH pernah throw: Telegram/WhatsApp akan retry loop kalau
  // dapat 5xx/exception. Selalu balas 200 cepat setelah payload diterima.
  try {
    const body = await req.json();
    const result = await processBodyPayload(body);
    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    // AI parse error / error internal -> tetap 200 sukses dengan field error
    // (bot sudah kirim balasan; Telegram clear queue, tidak retry abadi).
    return NextResponse.json(
      {
        success: true,
        status: 'OK',
        processed: false,
        error: `Webhook diterima tapi gagal diproses: ${errMsg} — silakan kirim ulang pesan Anda.`,
      },
      { status: 200 }
    );
  }
}

// Ekstrak + parse payload; dipisah agar POST tidak pernah throw (diserap oleh catch di atas).
async function processBodyPayload(body: Record<string, any>) {
  const { messageText, platform, sender } = extractMessage(body);

  if (!messageText) {
    // Update non-teks (sticker/photo/dll) diabaikan — 200 biar Telegram clear queue, bukan 400 yang bikin retry abadi.
    return {
      success: true,
      ignored: true,
      error: 'Pesan webhook kosong atau format payload tidak dikenali — diabaikan.',
    };
  }

  const extra = {
    tanggal: typeof body.tanggal === 'string' ? body.tanggal : undefined,
    refId: typeof body.refId === 'string' ? body.refId : undefined,
  };
  const result = await parseChatAndInsert(messageText, `${platform} Bot (${sender})`, extra);

  if (result.duplicate) {
    return {
      success: true,
      status: 'DUPLICATE',
      processed: true,
      platform,
      sender,
      messageText,
      matchedId: result.matchedId,
      result: { success: false, duplicate: true, transaction: result.transaction },
    };
  }

  return {
    success: true,
    status: 'OK',
    processed: true,
    platform,
    sender,
    messageText,
    result: {
      success: true,
      transaction: result.transaction,
    },
  };
}
