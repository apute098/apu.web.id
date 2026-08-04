export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { loadConfig, getStore } from '@/lib/oauth-store';

export async function POST(req: NextRequest) {
  try {
    const cfg = await loadConfig();
    const body = await req.json().catch(() => ({}));
    const { grant_type, code, client_id, client_secret, redirect_uri } = body;

    if (grant_type !== 'authorization_code') {
      return NextResponse.json({ error: 'unsupported_grant_type' }, { status: 400 });
    }
    if (client_id !== cfg.client_id || client_secret !== cfg.client_secret) {
      return NextResponse.json({ error: 'invalid_client' }, { status: 401 });
    }
    const entry = getStore().codes.get(code);
    if (!entry || entry.client_id !== client_id || entry.expires < Date.now()) {
      return NextResponse.json({ error: 'invalid_grant' }, { status: 400 });
    }
    if (redirect_uri && entry.redirect_uri !== redirect_uri) {
      return NextResponse.json({ error: 'invalid_grant' }, { status: 400 });
    }
    getStore().codes.delete(code);

    const access_token = crypto.randomBytes(32).toString('hex');
    const expires_in = cfg.token_ttl_seconds;
    getStore().tokens.set(access_token, { client_id, expires: Date.now() + expires_in * 1000 });

    return NextResponse.json({
      access_token,
      token_type: 'Bearer',
      expires_in,
      scope: 'profile',
    });
  } catch (err: unknown) {
    console.error('OAuth token gagal:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'server_error', error_description: 'Terjadi kesalahan internal — coba lagi nanti.' },
      { status: 500 }
    );
  }
}
