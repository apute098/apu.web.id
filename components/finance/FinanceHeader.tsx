import React from 'react';
import {
  Wallet,
  Database,
  BrainCircuit,
  Send,
  MessageSquare,
  Plus,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  analyzing: boolean;
  onAnalyze: () => void;
  sendingNotify: boolean;
  onSendNotify: (platform: 'telegram' | 'whatsapp') => void;
  showForm: boolean;
  onToggleForm: () => void;
  notifyStatus: string | null;
}

export const FinanceHeader: React.FC<Props> = ({
  analyzing,
  onAnalyze,
  sendingNotify,
  onSendNotify,
  showForm,
  onToggleForm,
  notifyStatus,
}) => (
  <>
    {/* Top Banner & Subdomain Header */}
    <div className="floating-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Keuangan
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#22d3ee]/20 text-[#67e8f9] border border-[#22d3ee]/30 font-mono">
              Integrated
            </span>
          </h2>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            SQLite WAL &bull; Auto-Detect Chat WA/Telegram
          </p>
        </div>
      </div>

      {/* Action buttons — grid 2 kolom di HP biar rapi, sejajar di desktop */}
      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
        <button
          onClick={onAnalyze}
          disabled={analyzing}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-[#22d3ee]/30 text-[#cffafe] border border-[#22d3ee]/40 hover:bg-[#22d3ee]/50 transition-all"
        >
          <BrainCircuit className="w-4 h-4 text-[#22d3ee]" />
          {analyzing ? 'Menganalisis...' : 'Analisa AI'}
        </button>

        <button
          onClick={() => onSendNotify('telegram')}
          disabled={sendingNotify}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold bg-[#22d3ee]/20 text-[#67e8f9] border border-[#22d3ee]/30 hover:bg-[#22d3ee]/30 transition-all"
        >
          <Send className="w-3.5 h-3.5" /> Kirim TG
        </button>
        <button
          onClick={() => onSendNotify('whatsapp')}
          disabled={sendingNotify}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all"
        >
          <MessageSquare className="w-3.5 h-3.5" /> Kirim WA
        </button>
        <button
          onClick={onToggleForm}
          className="flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all"
        >
          <Plus className="w-4 h-4" /> {showForm ? 'Tutup' : 'Manual'}
        </button>
      </div>
    </div>

    {notifyStatus && (
      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>{notifyStatus}</span>
      </div>
    )}
  </>
);