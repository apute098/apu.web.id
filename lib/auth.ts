import { NextRequest, NextResponse } from 'next/server';

// Guard auth bersama untuk semua route mutasi (POST).
// Token = WEBHOOK_TOKEN di .env.local — dipakai webhook bot + dashboard admin.
export function isAuthorized(req: NextRequest): boolean {
  const token = process.env.WEBHOOK_TOKEN;
  if (!token) return false;
  const auth = req.headers.get('authorization') || '';
  const xToken = req.headers.get('x-webhook-token') || '';
  const tgToken = req.headers.get('x-telegram-bot-api-secret-token') || '';
  return auth === `Bearer ${token}` || xToken === token || tgToken === token;
}

export function unauthorized(): NextResponse {
  const configured = Boolean(process.env.WEBHOOK_TOKEN);
  return NextResponse.json(
    {
      success: false,
      error: configured
        ? 'Unauthorized: header Authorization: Bearer <WEBHOOK_TOKEN> wajib diisi.'
        : 'WEBHOOK_TOKEN belum dikonfigurasi di .env.local.',
    },
    { status: 401 }
  );
}
