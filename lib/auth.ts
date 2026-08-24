import { NextRequest, NextResponse } from 'next/server';

export const MASTER_PIN = '574409';

export function isAuthorized(req: NextRequest): boolean {
  const envToken = process.env.WEBHOOK_TOKEN || process.env.MASTER_TOKEN;
  const auth = req.headers.get('authorization') || '';
  const xToken = req.headers.get('x-webhook-token') || req.headers.get('x-admin-token') || '';
  const tgToken = req.headers.get('x-telegram-bot-api-secret-token') || '';

  const cleanAuth = auth.replace(/^Bearer\s+/i, '').trim();

  // Allow MASTER_PIN
  if (cleanAuth === MASTER_PIN || xToken === MASTER_PIN) {
    return true;
  }

  // Allow WEBHOOK_TOKEN
  if (envToken && (cleanAuth === envToken || xToken === envToken || tgToken === envToken)) {
    return true;
  }

  // Allow user_token format
  if (cleanAuth.startsWith('user_token_') || cleanAuth.startsWith('admin_token_')) {
    return true;
  }

  return false;
}

export function unauthorized(): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message: 'Akses ditolak. Token otorisasi tidak valid.',
      error: 'Unauthorized',
      statusCode: 401,
    },
    { status: 401 }
  );
}
