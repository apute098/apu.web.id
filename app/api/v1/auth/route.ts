import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { createUser, findUserByUsernameOrEmail, listAllUsers, updateUserStatus } from '@/lib/db';
import { isAuthorized } from '@/lib/auth';
import { issueOtp, verifyOtp } from '@/lib/otp';

export const dynamic = 'force-dynamic';

function hashPassword(pwd: string): string {
  return createHash('sha256').update(`apu_salt_${pwd}`).digest('hex');
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { message: 'Access denied. Fuck you!', error: 'Forbidden', statusCode: 403 },
      { status: 403 }
    );
  }
  const users = listAllUsers();
  return NextResponse.json({ success: true, users });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || 'login';

    if (action === 'list_users') {
      if (!isAuthorized(req)) {
        return NextResponse.json(
          { message: 'Access denied. Fuck you!', error: 'Forbidden', statusCode: 403 },
          { status: 403 }
        );
      }
      const users = listAllUsers();
      return NextResponse.json({ success: true, users });
    }

    if (action === 'approve_user' || action === 'reject_user') {
      if (!isAuthorized(req)) {
        return NextResponse.json(
          { message: 'Access denied. Fuck you!', error: 'Forbidden', statusCode: 403 },
          { status: 403 }
        );
      }
      const targetId = String(body.userId);
      const newStatus = action === 'approve_user' ? 'approved' : 'rejected';
      const ok = updateUserStatus(targetId, newStatus);
      if (!ok) {
        return NextResponse.json({ success: false, error: 'User tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: `Status user #${targetId} berhasil diubah menjadi '${newStatus}'.`,
      });
    }

    if (action === 'register') {
      const { username, email, password } = body;
      if (!username || !email || !password) {
        return NextResponse.json(
          { success: false, error: 'Username, Email, dan Password wajib diisi!' },
          { status: 400 }
        );
      }
      if (password.length < 4) {
        return NextResponse.json(
          { success: false, error: 'Password minimal 4 karakter!' },
          { status: 400 }
        );
      }

      const existing = findUserByUsernameOrEmail(username) || findUserByUsernameOrEmail(email);
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Username atau Email sudah terdaftar!' },
          { status: 409 }
        );
      }

      const passwordHash = hashPassword(password);
      const user = createUser(username, email, passwordHash, 'user', 'pending');

      return NextResponse.json({
        success: true,
        pending: true,
        message: 'Registrasi berhasil! Akun Anda saat ini PENDING dan sedang menunggu konfirmasi/approval Admin.',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      });
    }

    // Default: Login
    const { identifier, password, token: providedToken } = body;

    // Check admin token fallback first — juga kena OTP biar gak bisa bypass 2FA
    const masterToken = process.env.WEBHOOK_TOKEN;
    if (providedToken && providedToken.trim() === masterToken) {
      const code = issueOtp('admin');
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      if (botToken && chatId) {
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `🔐 OTP Admin apu.web.id: *${code}*\nBerlaku 5 menit. Jangan share!`,
            parse_mode: 'Markdown',
          }),
        }).catch(() => {});
      }
      return NextResponse.json({ otpSent: true, success: true, message: 'OTP dikirim ke Telegram admin' });
    }

    // Step 1 admin login: master token valid → issue OTP, kirim ke Telegram (jangan kasih token dulu)
    if (action === 'verify_otp') {
      const { code } = body;
      if (!code || !/^\d{4}$/.test(String(code))) {
        return NextResponse.json({ success: false, error: 'Format OTP salah (4 digit)' }, { status: 400 });
      }
      const result = verifyOtp('admin', String(code));
      if (!result.ok) {
        return NextResponse.json({ success: false, error: result.error }, { status: 403 });
      }
      return NextResponse.json({
        success: true,
        message: 'Verifikasi OTP berhasil!',
        user: { id: '0', username: 'admin', email: 'admin@apu.web.id', role: 'admin', status: 'approved' },
        token: masterToken,
      });
    }

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Username/Email dan Password wajib diisi!' },
        { status: 400 }
      );
    }

    // Fallback: master token input as password → JANGAN kasih token langsung.
    // Issue OTP + kirim ke Telegram (2FA admin).
    if (password.trim() === masterToken || identifier.trim() === masterToken) {
      const code = issueOtp('admin');
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      if (botToken && chatId) {
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `🔐 OTP Admin apu.web.id: *${code}*\nBerlaku 5 menit. Jangan share!`,
            parse_mode: 'Markdown',
          }),
        }).catch(() => {});
      }
      return NextResponse.json({
        otpSent: true,
        success: true,
        message: 'OTP 4-digit dikirim ke Telegram admin',
      });
    }

    const user = findUserByUsernameOrEmail(identifier);
    if (!user) {
      return NextResponse.json(
        {
          message: 'Access denied. Fuck you!',
          error: 'Forbidden',
          statusCode: 403,
        },
        { status: 403 }
      );
    }

    const hash = hashPassword(password);
    if (hash !== user.password_hash) {
      return NextResponse.json(
        {
          message: 'Access denied. Fuck you!',
          error: 'Forbidden',
          statusCode: 403,
        },
        { status: 403 }
      );
    }

    if (user.status === 'pending') {
      return NextResponse.json(
        {
          message: 'Access denied. Fuck you!',
          error: 'Forbidden',
          statusCode: 403,
        },
        { status: 403 }
      );
    }

    if (user.status === 'rejected') {
      return NextResponse.json(
        {
          message: 'Access denied. Fuck you!',
          error: 'Forbidden',
          statusCode: 403,
        },
        { status: 403 }
      );
    }

    const token = `user_token_${user.id}_${user.username}`;

    return NextResponse.json({
      success: true,
      message: `Login berhasil! Selamat datang, @${user.username}`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      token,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: `Gagal autentikasi: ${msg}` }, { status: 500 });
  }
}
