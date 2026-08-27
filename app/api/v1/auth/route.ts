import { NextRequest, NextResponse } from 'next/server';
import { MASTER_PIN, getClientIp, checkRateLimit, isIpLocked, recordFailedAuth, resetFailedAuth, isAuthorized } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authorized = isAuthorized(req);
  if (authorized) {
    return NextResponse.json({
      authenticated: true,
      user: {
        username: 'apu',
        role: 'root_admin',
        hostname: 'archlinux',
      },
    });
  }
  return NextResponse.json({ authenticated: false });
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Berhasil logout',
  });
  response.cookies.set('auth_pin', '', {
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // Check IP Lockout
  const lockStatus = isIpLocked(ip);
  if (lockStatus.locked) {
    return NextResponse.json(
      {
        success: false,
        error: `Terlalu banyak percobaan PIN salah. IP diblokir sementara selama ${lockStatus.remainingSec} detik.`,
      },
      { status: 429 }
    );
  }

  // Rate limit: Max 10 login attempts per minute per IP
  const rateLimit = checkRateLimit(ip, 10, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: 'Terlalu banyak permintaan login. Coba lagi dalam 1 menit.',
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const action = body.action || 'login';
    const pin = body.pin || body.token || body.password || body.identifier;

    const masterToken = process.env.WEBHOOK_TOKEN;
    if (!masterToken) {
      return NextResponse.json({ success: false, error: 'Server misconfigured' }, { status: 500 });
    }

    if (action === 'verify' || action === 'login') {
      const cleanPin = String(pin || '').trim();

      if (cleanPin === MASTER_PIN || cleanPin === masterToken) {
        resetFailedAuth(ip);
        const response = NextResponse.json({
          success: true,
          message: 'Autentikasi Master Admin Berhasil',
          token: masterToken,
          user: {
            username: 'apu',
            role: 'root_admin',
            hostname: 'archlinux',
          },
        });

        // Set cookie for browser sessions and reverse proxy
        response.cookies.set('auth_pin', cleanPin, {
          path: '/',
          maxAge: 30 * 24 * 60 * 60, // 30 days
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });

        return response;
      }

      recordFailedAuth(ip);
      return NextResponse.json(
        {
          success: false,
          error: 'PIN atau Master Token tidak valid',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak dikenal' }, { status: 400 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server autentikasi' },
      { status: 500 }
    );
  }
}

