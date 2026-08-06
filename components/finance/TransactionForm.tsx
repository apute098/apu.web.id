import React, { useState } from 'react';
import { authedPost } from '@/lib/api';
import { Plus } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export const TransactionForm: React.FC<Props> = ({ onClose, onSaved }) => {
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [tipe, setTipe] = useState<'Pemasukan' | 'Pengeluaran'>('Pemasukan');
  const [kategori, setKategori] = useState('Client Development');
  const [jumlah, setJumlah] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [metode, setMetode] = useState('Bank Transfer (BCA)');
  const [submitting, setSubmitting] = useState(false);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jumlah || !keterangan) return;

    try {
      setSubmitting(true);
      const res = await authedPost('/api/v1/keuangan', {
        tanggal,
        tipe,
        kategori,
        jumlah: Number(jumlah),
        keterangan,
        metode,
      });
      const result = await res.json();
      if (result.success) {
        setJumlah('');
        setKeterangan('');
        onClose();
        onSaved();
      }
    } catch (err) {
      console.error('Failed to add transaction', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleAddTransaction}
      className="floating-card border-[#22d3ee]/40 bg-slate-900/90 space-y-4"
    >
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <Plus className="w-4 h-4 text-emerald-400" /> Tambah Transaksi Keuangan Manual
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Tanggal
          </label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="w-full px-3 py-2.5 min-h-[44px] rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-[#22d3ee]/40"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Tipe Transaksi
          </label>
          <select
            value={tipe}
            onChange={(e) => setTipe(e.target.value as any)}
            className="w-full px-3 py-2.5 min-h-[44px] rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#22d3ee]/40"
          >
            <option value="Pemasukan">Pemasukan (Income)</option>
            <option value="Pengeluaran">Pengeluaran (Expense)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Kategori
          </label>
          <input
            type="text"
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            placeholder="Misal: Hosting, Client Payment, Listrik"
            className="w-full px-3 py-2.5 min-h-[44px] rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#22d3ee]/40"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Jumlah (Rp)
          </label>
          <input
            type="number"
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
            placeholder="Contoh: 1500000"
            className="w-full px-3 py-2.5 min-h-[44px] rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-[#22d3ee]/40"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Metode Pembayaran
          </label>
          <input
            type="text"
            value={metode}
            onChange={(e) => setMetode(e.target.value)}
            placeholder="Bank Transfer, Midtrans, Cash"
            className="w-full px-3 py-2.5 min-h-[44px] rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#22d3ee]/40"
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Keterangan
          </label>
          <input
            type="text"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Deskripsi transaksi..."
            className="w-full px-3 py-2.5 min-h-[44px] rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#22d3ee]/40"
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 min-h-[44px] rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 rounded-xl text-xs font-bold bg-[#22d3ee] text-white hover:bg-[#22d3ee] disabled:opacity-50"
        >
          {submitting ? 'Menyimpan...' : 'Simpan Transaksi'}
        </button>
      </div>
    </form>
  );
};