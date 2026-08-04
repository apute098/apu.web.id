'use client';

// global-error.tsx = fallback terakhir (render tree rusak total).
// Wajib sertakan <html> & <body> sendiri karena layout root tidak di-render di sini.
// TIDAK boleh memakai hooks (useEffect, dll) dan tidak boleh import Layout/font di sini
// — hanya tombol reload polos via window.location.reload().
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html lang="id">
      <body
        className="bg-[#0B0F0D]"
        style={{ margin: 0, minHeight: '100vh' }}
      >
        <main className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
          <div className="max-w-md w-full rounded-2xl border border-[#FF6B2C]/20 bg-[#111714] p-8 shadow-xl">
            <h1 className="text-2xl font-bold font-mono text-rose-400 mb-2">
              Terjadi Kesalahan Fatal
            </h1>
            <p className="text-sm text-slate-400 font-mono mb-4">
              Aplikasi gagal dimuat. Silakan coba lagi.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-[#FF6B14] text-white font-mono text-xs font-bold hover:bg-[#E85D0B] transition-all cursor-pointer"
            >
              Muat Ulang
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}