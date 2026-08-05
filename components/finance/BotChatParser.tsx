import React, { useState } from 'react';
import { authedPost } from '@/lib/api';
import { Bot, Zap, Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  onRecorded: () => void;
}

export const BotChatParser: React.FC<Props> = ({ onRecorded }) => {
  const [botMessage, setBotMessage] = useState('');
  const [selectedBotSource, setSelectedBotSource] = useState<'WhatsApp Auto-Bot' | 'Telegram Bot'>('WhatsApp Auto-Bot');
  const [parsingBot, setParsingBot] = useState(false);
  const [botParseResult, setBotParseResult] = useState<any>(null);

  const handleBotChatParse = async (msgToSend?: string) => {
    const text = msgToSend || botMessage;
    if (!text.trim()) return;

    try {
      setParsingBot(true);
      setBotParseResult(null);
      const res = await authedPost('/api/v1/keuangan', {
        action: 'ai_parse_chat',
        chatMessage: text,
        source: selectedBotSource,
      });
      const json = await res.json();
      if (json.success) {
        setBotParseResult(json);
        setBotMessage('');
        onRecorded();
      }
    } catch (err) {
      console.error('Failed to parse chat via Hermes Agent', err);
    } finally {
      setParsingBot(false);
    }
  };

  return (
    <details className="floating-card bg-slate-900 border-[#22d3ee]/40 space-y-4 group">
      <summary className="cursor-pointer list-none flex items-center justify-between gap-2 py-1 select-none">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#22d3ee]/10 text-[#22d3ee] border border-[#22d3ee]/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Deteksi Chat Otomatis WA/Telegram
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono">
                <Zap className="w-3 h-3" /> Live Gateway
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Coba parser chat — ketik pesan transaksi, Hermes AI catat ke SQLite.
            </p>
          </div>
        </div>
        <span className="text-[#22d3ee] transition-transform group-open:rotate-180">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
      </summary>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#22d3ee]/10 text-[#22d3ee] border border-[#22d3ee]/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Deteksi Chat Otomatis WA/Telegram (Hermes AI Parser)
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono">
                <Zap className="w-3 h-3" /> Live Gateway
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Kirim atau ketik pesan biasa (misal: &quot;Beli token listrik PLN 250rb via QRIS&quot;), Hermes AI akan mengekstrak JSON &amp; mencatat ke SQLite WAL secara mandiri.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setSelectedBotSource('WhatsApp Auto-Bot')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedBotSource === 'WhatsApp Auto-Bot'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            WhatsApp Bot
          </button>
          <button
            onClick={() => setSelectedBotSource('Telegram Bot')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedBotSource === 'Telegram Bot'
                ? 'bg-[#22d3ee] text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Telegram Bot
          </button>
        </div>
      </div>

      {/* Preset Sample Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 font-mono text-[11px] whitespace-nowrap">Contoh Chat Bot:</span>
        <button
          onClick={() => handleBotChatParse('Beli token listrik PLN server 250rb via QRIS')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 text-[#67e8f9] hover:bg-slate-700 border border-slate-700 whitespace-nowrap font-mono text-[11px]"
        >
          &quot;Beli token listrik PLN server 250rb via QRIS&quot;
        </button>
        <button
          onClick={() => handleBotChatParse('Dapat transfer client website UMKM 2.500.000 via BCA')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 text-emerald-300 hover:bg-slate-700 border border-slate-700 whitespace-nowrap font-mono text-[11px]"
        >
          &quot;Dapat transfer client website 2.500.000 via BCA&quot;
        </button>
        <button
          onClick={() => handleBotChatParse('Beli RAM DDR4 16GB harga 750rb pake Mandiri')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 text-rose-300 hover:bg-slate-700 border border-slate-700 whitespace-nowrap font-mono text-[11px]"
        >
          &quot;Beli RAM DDR4 16GB harga 750rb pake Mandiri&quot;
        </button>
      </div>

      {/* Input Bar */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={botMessage}
          onChange={(e) => setBotMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleBotChatParse()}
          placeholder={`Ketik pesan dari ${selectedBotSource} (e.g. "Bayar perpanjangan SSL 150rb via Credit Card")...`}
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-[#22d3ee]/40 font-mono"
        />
        <button
          onClick={() => handleBotChatParse()}
          disabled={parsingBot || !botMessage.trim()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#22d3ee] text-white hover:bg-[#22d3ee] shadow-md disabled:opacity-50 transition-all whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4" />
          {parsingBot ? 'Parsing Chat...' : 'Kirim Ke Bot'}
        </button>
      </div>

      {/* Live Bot Parse Result Card */}
      {botParseResult && (
        <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Transaksi Berhasil Dideteksi & Dicatat Otomatis!
            </span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {botParseResult.transaction?.source}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap">
            {botParseResult.botConfirmation}
          </div>
        </div>
      )}
    </details>
  );
};