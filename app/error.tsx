'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full rounded-none border border-[#22d3ee]/20 bg-[#111613] p-8 shadow-xl">
        <div className="text-5xl mb-4" aria-hidden="true">⚠️</div>
        <h1 className="text-2xl font-bold font-mono text-rose-400 mb-2">
          Terjadi Kesalahan
        </h1>
        <p className="text-sm text-slate-400 font-mono mb-6">
          Maaf, aplikasi mengalami gangguan saat memuat halaman ini.
          {error.digest ? (
            <span className="block mt-2 text-xs text-slate-600">
              Kode kesalahan: {error.digest}
            </span>
          ) : null}
        </p>
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-none bg-[#22d3ee] text-white font-mono text-xs font-bold hover:bg-[#0ea5e9] transition-all cursor-pointer"
        >
          Muat Ulang Halaman
        </button>
      </div>
    </div>
  );
}