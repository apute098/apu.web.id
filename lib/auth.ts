import { NextRequest, NextResponse } from 'next/server';

export const MASTER_PIN = process.env.MASTER_PIN || '';
const MASTER_SECRET = process.env.WEBHOOK_TOKEN || '';

export function getClientIp(req: NextRequest): string {
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return '127.0.0.1';
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

interface LockoutRecord {
  failures: number;
  lockedUntil: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const lockoutMap = new Map<string, LockoutRecord>();

export function checkRateLimit(ip: string, maxRequests = 30, windowMs = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count };
}

export function isIpLocked(ip: string): { locked: boolean; remainingSec: number } {
  const now = Date.now();
  const record = lockoutMap.get(ip);

  if (record && record.lockedUntil > now) {
    return { locked: true, remainingSec: Math.ceil((record.lockedUntil - now) / 1000) };
  }

  return { locked: false, remainingSec: 0 };
}

export function recordFailedAuth(ip: string): { locked: boolean; retryAfterSec: number } {
  const now = Date.now();
  const record = lockoutMap.get(ip) || { failures: 0, lockedUntil: 0 };

  record.failures += 1;

  // If 5 failed attempts within window, lock out for 15 minutes
  if (record.failures >= 5) {
    record.lockedUntil = now + 15 * 60 * 1000;
    lockoutMap.set(ip, record);
    return { locked: true, retryAfterSec: 900 };
  }

  lockoutMap.set(ip, record);
  return { locked: false, retryAfterSec: 0 };
}

export function resetFailedAuth(ip: string): void {
  lockoutMap.delete(ip);
}

export function isAuthorized(req: NextRequest): boolean {
  const envToken = process.env.WEBHOOK_TOKEN || MASTER_SECRET;
  const masterPin = process.env.MASTER_PIN || MASTER_PIN;

  const auth = req.headers.get('authorization') || '';
  const xToken = req.headers.get('x-webhook-token') || req.headers.get('x-admin-token') || '';
  const tgToken = req.headers.get('x-telegram-bot-api-secret-token') || '';

  const cleanAuth = auth.replace(/^Bearer\s+/i, '').trim();
  const cookiePin = req.cookies.get('auth_pin')?.value || '';

  // Strict check against Master PIN or Secret Token
  if (cleanAuth && (cleanAuth === masterPin || cleanAuth === envToken)) {
    return true;
  }

  if (xToken && (xToken === masterPin || xToken === envToken)) {
    return true;
  }

  if (tgToken && tgToken === envToken) {
    return true;
  }

  if (cookiePin && (cookiePin === masterPin || cookiePin === envToken)) {
    return true;
  }

  return false;
}

export function unauthorized(message = 'Akses ditolak. Token otorisasi tidak valid atau belum diisi.'): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
      error: 'Unauthorized',
      statusCode: 401,
    },
    { status: 401 }
  );
}
