'use client';

import React, { useRef, useState } from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';

/* ============================================================
   OTPVerification — 4 kotak OTP liquid glass (apu.web.id)
   Flow: request_otp → user ketik kode dari Telegram → verify_otp
   ============================================================ */

interface Props {
  onRequestOtp: () => Promise<string | null>; // return error message atau null
  onVerify: (code: string) => Promise<string | null>;
  onResend: () => void;
}

export default function OTPVerification({ onRequestOtp, onVerify, onResend }: Props) {
  const [otp, setOtp] = useState(Array(4).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const focusAt = (i: number) => refs.current[Math.max(0, Math.min(3, i))]?.focus();

  const handleChange = (value: string, index: number) => {
    // support paste ketebengan multi-digit di satu kotak
    const digits = value.replace(/\D/g, '');
    if (!digits) {
      const next = [...otp];
      next[index] = '';
      setOtp(next);
      return;
    }
    const next = [...otp];
    for (let d = 0; d < digits.length && index + d < 4; d++) next[index + d] = digits[d];
    setOtp(next);
    if (!sent) setSent(true);
    setError(null);
    focusAt(index + digits.length);
    // auto-submit saat penuh
    if (next.join('').length === 4) void submit(next.join(''));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key !== 'Backspace') return;
    e.preventDefault();
    const next = [...otp];
    if (next[index]) {
      next[index] = '';
    } else if (index > 0) {
      next[index - 1] = '';
      focusAt(index - 1);
    }
    setOtp(next);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!digits) return;
    e.preventDefault();
    const next = [...digits.padEnd(4)];
    setOtp(next);
    focusAt(digits.length);
    if (digits.length === 4) void submit(digits);
  };

  const submit = async (code?: string) => {
    const full = code ?? otp.join('');
    if (full.length !== 4 || busy) return;
    setBusy(true);
    setError(null);
    const err = await onVerify(full);
    if (err) {
      setError(err);
      setOtp(Array(4).fill(''));
      focusAt(0);
    }
    setBusy(false);
  };

  const handleRequest = async () => {
    setBusy(true);
    setError(null);
    const err = await onRequestOtp();
    if (err) setError(err);
    else focusAt(0);
    setBusy(false);
  };

  const filled = otp.join('').length === 4;

  return (
    <div className="space-y-5 text-center">
      <div className="flex items-center justify-center gap-3 border-b border-white/10 pb-4">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-left">
          <h2 className="text-base font-bold text-white">Verifikasi OTP</h2>
          <p className="text-xs text-slate-400">Kode 4-digit dikirim ke Telegram admin</p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 font-sans text-left">
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-center gap-3" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={4}
            value={digit}
            disabled={busy}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            aria-label={`Digit OTP ${i + 1}`}
            className={`w-14 h-16 rounded-xl bg-slate-950 border text-center text-2xl font-mono font-bold text-white outline-none transition-all duration-200
              ${digit ? 'border-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.25)]' : 'border-white/10'}
              focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40
              disabled:opacity-50`}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => void submit()}
        disabled={!filled || busy}
        className="w-full py-3 rounded-full bg-cyan-400 text-slate-950 font-sans text-xs font-extrabold hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
      >
        {busy ? 'Memverifikasi...' : 'Verifikasi & Masuk'}
      </button>

      <button
        type="button"
        onClick={() => { onResend(); setSent(false); }}
        disabled={busy}
        className="w-full py-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors flex items-center justify-center gap-1.5"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Kirim ulang OTP
      </button>
    </div>
  );
}
