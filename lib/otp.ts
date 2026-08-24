// OTP in-memory store (single-process Next.js) — ponytail: hilang saat restart,
// upgrade ke DB table kalau butuh persist multi-instance.
import { createHash, randomInt } from 'node:crypto';

const TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

interface OtpEntry {
  hash: string;
  expires: number;
  attempts: number;
}

const store = new Map<string, OtpEntry>(); // key = purpose ('admin')

function hashCode(purpose: string, code: string): string {
  return createHash('sha256').update(`apu_otp_${purpose}_${code}`).digest('hex');
}

export function issueOtp(purpose: string): string {
  const code = String(randomInt(0, 10000)).padStart(4, '0');
  store.set(purpose, { hash: hashCode(purpose, code), expires: Date.now() + TTL_MS, attempts: 0 });
  return code;
}

export function verifyOtp(purpose: string, code: string): { ok: boolean; error?: string } {
  const entry = store.get(purpose);
  if (!entry || entry.expires < Date.now()) {
    store.delete(purpose);
    return { ok: false, error: 'OTP kadaluarsa / belum diminta. Login ulang.' };
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    store.delete(purpose);
    return { ok: false, error: 'Terlalu banyak percobaan salah. Minta OTP baru.' };
  }
  if (hashCode(purpose, code) !== entry.hash) {
    entry.attempts += 1;
    return { ok: false, error: `Kode OTP salah (${MAX_ATTEMPTS - entry.attempts} percobaan tersisa)` };
  }
  store.delete(purpose); // one-time use
  return { ok: true };
}
