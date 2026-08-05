import React from 'react';
import { BrainCircuit } from 'lucide-react';
import { formatRupiah } from './shared';

interface Props {
  result: any;
  onClose: () => void;
  onBroadcast: (platform: 'telegram' | 'whatsapp') => void;
}

export const AiAnalysisCard: React.FC<Props> = ({ result, onClose, onBroadcast }) => (
  <div className="floating-card bg-slate-900 border-[#22d3ee]/40/50 space-y-4">
    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
      <div className="flex items-center gap-2">
        <BrainCircuit className="w-5 h-5 text-[#22d3ee]" />
        <h3 className="text-sm font-bold text-white">
          Analisa Mandiri & Laporan Eksekutif (Hermes Financial AI)
        </h3>
      </div>
      <button
        onClick={onClose}
        className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
      >
        Tutup
      </button>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
        <div className="text-[10px] text-slate-400 font-mono uppercase">Total Pemasukan</div>
        <div className="text-sm font-bold text-emerald-400 font-mono">
          {formatRupiah(result.summary?.totalPemasukan || 0)}
        </div>
      </div>
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
        <div className="text-[10px] text-slate-400 font-mono uppercase">Total Pengeluaran</div>
        <div className="text-sm font-bold text-rose-400 font-mono">
          {formatRupiah(result.summary?.totalPengeluaran || 0)}
        </div>
      </div>
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
        <div className="text-[10px] text-slate-400 font-mono uppercase">Laba Bersih</div>
        <div className="text-sm font-bold text-[#67e8f9] font-mono">
          {formatRupiah(result.summary?.labaBersih || 0)}
        </div>
      </div>
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
        <div className="text-[10px] text-slate-400 font-mono uppercase">Profit Margin</div>
        <div className="text-sm font-bold text-emerald-400 font-mono">
          {result.summary?.profitMargin}%
        </div>
      </div>
    </div>

    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 whitespace-pre-line font-mono leading-relaxed">
      {result.analysisReport}
    </div>

    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => onBroadcast('telegram')}
        className="px-3 py-2 min-h-[44px] rounded-lg bg-[#22d3ee]/20 text-[#67e8f9] border border-[#22d3ee]/30 text-xs font-semibold hover:bg-[#22d3ee]/30 flex items-center gap-1.5"
      >
        Broadcast Laporan ke Telegram
      </button>
      <button
        onClick={() => onBroadcast('whatsapp')}
        className="px-3 py-2 min-h-[44px] rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-600/30 flex items-center gap-1.5"
      >
        Broadcast Laporan ke WhatsApp
      </button>
    </div>
  </div>
);