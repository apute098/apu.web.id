import React from 'react';
import { Search, Wallet, Bot, Trash2 } from 'lucide-react';
import { Transaction, formatRupiah } from './shared';

interface Props {
  transactions: Transaction[];
  filterType: string;
  searchQuery: string;
  onFilterChange: (type: string) => void;
  onSearchChange: (q: string) => void;
  onSelect: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export const TransactionList: React.FC<Props> = ({
  transactions,
  filterType,
  searchQuery,
  onFilterChange,
  onSearchChange,
  onSelect,
  onDelete,
  onAdd,
}) => (
  <div className="bento-premium overflow-hidden">
    <div className="p-6 md:p-8 border-b border-white/5">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h3 className="font-black text-white text-xl tracking-tight-super flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#22d3ee]" /> Transaction History
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium tracking-wide">
            SQLite WAL Storage & Auto-Logged Bot
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 min-h-[44px] rounded-2xl bg-black/20 border border-white/10 text-white text-sm focus:outline-none focus:border-[#22d3ee]/50 focus:bg-black/40 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1 bg-black/40 p-1.5 rounded-2xl border border-white/5 h-[44px]">
            {['All', 'Pemasukan', 'Pengeluaran'].map((type) => (
              <button
                key={type}
                onClick={() => onFilterChange(type)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all h-full flex items-center ${
                  filterType === type
                    ? 'bg-[#22d3ee] text-black shadow-lg shadow-[#22d3ee]/20'
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {type === 'All' ? 'Semua' : type}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Table — desktop only */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-700">
          <tr>
            <th className="py-3 px-4">Tanggal</th>
            <th className="py-3 px-4">Sumber</th>
            <th className="py-3 px-4">Tipe</th>
            <th className="py-3 px-4">Kategori</th>
            <th className="py-3 px-4">Keterangan</th>
            <th className="py-3 px-4">Metode</th>
            <th className="py-3 px-4 text-right">Jumlah</th>
            <th className="py-3 px-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 text-slate-300">
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-14 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#22d3ee]/10 border border-[#22d3ee]/20 flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-[#22d3ee]/60" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-300">Belum ada transaksi</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Kirim pesan transaksi via WhatsApp bot (contoh: &quot;gaji 1.850.000&quot;) atau
                      tambah manual — data bakal muncul di sini.
                    </p>
                  </div>
                  <button
                    onClick={onAdd}
                    aria-label="Tambah transaksi manual"
                    className="flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-[#22d3ee] text-white hover:bg-[#06b6d4] transition-all"
                  >
                    + Tambah Transaksi
                  </button>
                </div>
              </td>
            </tr>
          ) : (
            transactions.map((tx) => (
              <tr
                key={tx.id}
                onClick={() => onSelect(tx)}
                className="hover:bg-slate-800/40 cursor-pointer transition-colors"
              >
                <td className="py-3 px-4 font-mono text-slate-400">{tx.tanggal}</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-[#06b6d4] border border-slate-700">
                    <Bot className="w-3 h-3 text-[#22C55E]" />
                    {tx.source || 'Manual'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-2 py-0.5 rounded font-mono text-[10px] ${
                      tx.tipe === 'Pemasukan'
                        ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20'
                         : 'bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/20'
                    }`}
                  >
                    {tx.tipe}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium text-slate-200">{tx.kategori}</td>
                <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={tx.keterangan}>
                  {tx.keterangan}
                </td>
                <td className="py-3 px-4 text-slate-400">{tx.metode}</td>
                <td
                  className={`py-3 px-4 text-right font-mono font-bold ${
                    tx.tipe === 'Pemasukan' ? 'text-[#22C55E]' : 'text-[#f43f5e]'
                  }`}
                >
                  {tx.tipe === 'Pemasukan' ? '+' : '-'} {formatRupiah(tx.jumlah)}
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(tx.id);
                    }}
                    aria-label={`Hapus transaksi ${tx.keterangan}`}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
                    title="Hapus Transaksi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* Mobile card list */}
    <div className="md:hidden space-y-3">
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#22d3ee]/10 border border-[#22d3ee]/20 flex items-center justify-center">
            <Wallet className="w-8 h-8 text-[#22d3ee]/60" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-300">Belum ada transaksi</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Kirim pesan transaksi via WhatsApp bot (contoh: &quot;gaji 1.850.000&quot;) atau
              tambah manual — data bakal muncul di sini.
            </p>
          </div>
          <button
            onClick={onAdd}
            aria-label="Tambah transaksi manual dari kosong"
            className="flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-[#22d3ee] text-white hover:bg-[#06b6d4] transition-all"
          >
            + Tambah Transaksi
          </button>
        </div>
      ) : (
        transactions.map((tx) => (
          <div
            key={tx.id}
            onClick={() => onSelect(tx)}
            className="bento-premium p-5 space-y-3 cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-slate-400 font-medium tracking-widest">{tx.tanggal}</span>
              <span
                className={`px-3 py-1 rounded-full font-mono text-[10px] uppercase font-bold tracking-widest ${
                  tx.tipe === 'Pemasukan'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                     : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {tx.tipe}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{tx.keterangan}</p>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-2 font-medium tracking-wide">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono bg-black/40 text-[#06b6d4] border border-white/5">
                    <Bot className="w-3 h-3 text-emerald-400" />
                    {tx.source || 'Manual'}
                  </span>
                  {tx.kategori}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className={`font-mono font-black text-sm md:text-base ${
                    tx.tipe === 'Pemasukan' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {tx.tipe === 'Pemasukan' ? '+' : '-'} {formatRupiah(tx.jumlah)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(tx.id);
                  }}
                  aria-label={`Hapus transaksi ${tx.keterangan}`}
                  className="w-10 h-10 rounded-xl bg-black/40 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all flex items-center justify-center flex-shrink-0"
                  title="Hapus Transaksi"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);