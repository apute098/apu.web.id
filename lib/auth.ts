import { NextRequest, NextResponse } from 'next/server';

// Guard auth bersama untuk semua route mutasi (POST).
// Token = WEBHOOK_TOKEN di .env.local — dipakai webhook bot + dashboard admin.
export function isAuthorized(req: NextRequest): boolean {
  const token = process.env.WEBHOOK_TOKEN || process.env.MASTER_TOKEN;
  if (!token) return false;
  const auth = req.headers.get('authorization') || '';
  const xToken = req.headers.get('x-webhook-token') || '';
  const tgToken = req.headers.get('x-telegram-bot-api-secret-token') || '';
  return auth === `Bearer ${token}` || auth === token || xToken === token || tgToken === token;
}

export function unauthorized(): NextResponse {
  return NextResponse.json(
    {
      message: 'Access denied. Fuck you!',
      error: 'Forbidden',
      statusCode: 403,
    },
    { status: 403 }
  );
}
