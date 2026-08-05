import React from 'react';
import { X } from 'lucide-react';
import { Transaction, formatRupiah } from './shared';

interface Props {
  tx: Transaction;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<Props> = ({ tx, onClose }) => (
  <div
    className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div
      className="floating-card stagger-in w-full max-w-md mx-auto bg-slate-900/95 border-[#22d3ee]/40 p-6 space-y-5"
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label="Detail Transaksi"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-white">
          Detail Transaksi
        </h3>
        <button
          onClick={onClose}
          aria-label="Tutup detail transaksi"
          className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span
          className={`px-2.5 py-1 rounded font-mono text-[10px] ${
            tx.tipe === 'Pemasukan'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}
        >
          {tx.tipe}
        </span>
        <span
          className={`font-mono font-bold text-xl ${
            tx.tipe === 'Pemasukan' ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {tx.tipe === 'Pemasukan' ? '+' : '-'} {formatRupiah(tx.jumlah)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 text-xs">
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">Tanggal</span>
          <span className="font-mono text-slate-200 text-right">{tx.tanggal}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">Kategori</span>
          <span className="text-slate-200 text-right">{tx.kategori}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">Metode</span>
          <span className="text-slate-200 text-right">{tx.metode}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">Sumber</span>
          <span className="text-slate-200 text-right">{tx.source || 'Manual'}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-500">ID Transaksi</span>
          <span className="font-mono text-slate-400 text-right break-all">{tx.id}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs text-slate-500">Keterangan</p>
        <p className="text-sm text-slate-200 whitespace-pre-wrap break-words">
          {tx.keterangan}
        </p>
      </div>

      <button
        onClick={onClose}
        className="w-full flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-[#22d3ee] text-white hover:bg-[#0ea5e9] shadow-lg shadow-[#22d3ee]/30 transition-all"
      >
        Tutup
      </button>
    </div>
  </div>
);