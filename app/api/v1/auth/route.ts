import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { createUser, findUserByUsernameOrEmail, listAllUsers, updateUserStatus } from '@/lib/db';
import { isAuthorized } from '@/lib/auth';

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

    // Check admin token fallback first
    const masterToken = process.env.WEBHOOK_TOKEN;
    if (providedToken && providedToken.trim() === masterToken) {
      return NextResponse.json({
        success: true,
        message: 'Login Admin Master berhasil!',
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

    // Fallback: master token input as password
    if (password.trim() === masterToken || identifier.trim() === masterToken) {
      return NextResponse.json({
        success: true,
        message: 'Login Admin Master berhasil!',
        user: { id: '0', username: 'admin', email: 'admin@apu.web.id', role: 'admin', status: 'approved' },
        token: masterToken,
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
