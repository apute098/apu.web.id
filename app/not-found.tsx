import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#05050d] text-white flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold font-mono text-rose-400 mb-2">404 - Halaman Tidak Ditemukan</h2>
      <p className="text-sm text-slate-400 font-mono mb-4">Halaman yang Anda cari tidak ada di server apu.web.id.</p>
      <Link
        href="/"
        className="px-4 py-2 rounded-xl bg-[#22d3ee] text-white font-mono text-xs font-bold hover:bg-[#0ea5e9] transition-all"
      >
        Kembali ke Dashboard Utama
      </Link>
    </div>
  );
}
