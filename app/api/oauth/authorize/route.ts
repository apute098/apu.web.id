export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { loadConfig, getStore } from '@/lib/oauth-store';

export async function GET(req: NextRequest) {
  try {
    const cfg = await loadConfig();
    const { searchParams } = new URL(req.url);
    const client_id = searchParams.get('client_id');
    const redirect_uri = searchParams.get('redirect_uri');
    const state = searchParams.get('state');
    const response_type = searchParams.get('response_type') || 'code';

    if (!client_id || !redirect_uri) {
      return NextResponse.json({ error: 'invalid_request', error_description: 'client_id dan redirect_uri wajib' }, { status: 400 });
    }
    if (client_id !== cfg.client_id) {
      return NextResponse.json({ error: 'unauthorized_client' }, { status: 400 });
    }
    if (!cfg.redirect_uris.includes(redirect_uri)) {
      return NextResponse.json({ error: 'invalid_redirect_uri' }, { status: 400 });
    }
    if (response_type !== 'code') {
      return NextResponse.json({ error: 'unsupported_response_type' }, { status: 400 });
    }

    // Personal dashboard — auto-approve (tanpa halaman login)
    const code = crypto.randomBytes(24).toString('hex');
    getStore().codes.set(code, { client_id, redirect_uri, expires: Date.now() + 10 * 60 * 1000 });

    const sep = redirect_uri.includes('?') ? '&' : '?';
    return NextResponse.redirect(`${redirect_uri}${sep}code=${code}${state ? `&state=${state}` : ''}`);
  } catch (err: unknown) {
    console.error('OAuth authorize gagal:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'server_error', error_description: 'Terjadi kesalahan internal — coba lagi nanti.' },
      { status: 500 }
    );
  }
}
