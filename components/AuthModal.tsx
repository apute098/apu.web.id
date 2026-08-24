'use client';

import React, { useState } from 'react';
import { Lock, Unlock, ShieldAlert, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('PIN tidak boleh kosong');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', pin }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        localStorage.setItem('apu_admin_token', data.token);
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'PIN Master Admin tidak valid');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal terhubung ke server autentikasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="doppelrand-shell max-w-md w-full">
        <div className="doppelrand-core space-y-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
          >
            ✕
          </button>

          <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
            <div className="w-10 h-10 rounded-full bg-[#00f2fe]/10 border border-[#00f2fe]/20 flex items-center justify-center text-[#00f2fe]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Unlock Admin Control</h2>
              <p className="text-xs text-slate-400">Masukkan Master PIN atau Webhook Secret Token</p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-[#f43f5e]/10 border border-[#f43f5e]/20 text-[#f43f5e] text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                MASTER ADMIN PIN / SECRET KEY
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Masukkan PIN (Default: 574409)..."
                  className="w-full px-4 py-3 bg-black/60 border border-white/[0.08] focus:border-[#00f2fe] rounded-full text-xs text-white placeholder:text-slate-600 font-mono outline-none transition-all"
                  autoFocus
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute right-4 top-3.5" />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-300 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-full bg-[#00f2fe] hover:bg-[#00f2fe]/80 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-[#00f2fe]/20 active:scale-95 disabled:opacity-50"
              >
                <Unlock className="w-4 h-4" />
                <span>{loading ? 'Verifying...' : 'Unlock System'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
