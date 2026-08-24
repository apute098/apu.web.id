import { NextRequest, NextResponse } from 'next/server';
import { MASTER_PIN, isAuthorized } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || 'login';
    const pin = body.pin || body.token || body.password || body.identifier;

    const masterToken = process.env.WEBHOOK_TOKEN || '76c7cb42f88363744ac20d23377a29dd';

    if (action === 'verify' || action === 'login') {
      const cleanPin = String(pin || '').trim();

      if (cleanPin === MASTER_PIN || cleanPin === masterToken) {
        return NextResponse.json({
          success: true,
          message: 'Autentikasi Master Admin Berhasil',
          token: masterToken,
          user: {
            username: 'apu',
            role: 'root_admin',
            hostname: 'archlinux',
          },
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: 'PIN atau Master Token tidak valid',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak dikenal' }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server autentikasi' },
      { status: 500 }
    );
  }
}
