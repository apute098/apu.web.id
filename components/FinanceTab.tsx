'use client';

import React, { useState, useEffect } from 'react';
import { authedPost } from '@/lib/api';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Trash2,
  Send,
  Search,
  Filter,
  CheckCircle2,
  Database,
  Calendar,
  FileText,
  CreditCard,
  MessageSquare,
  Sparkles,
  Bot,
  Zap,
  BrainCircuit,
  FileSpreadsheet,
  Cloud,
  Check,
  Copy,
  Terminal,
  AlertTriangle,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface Transaction {
  id: string;
  tanggal: string;
  tipe: 'Pemasukan' | 'Pengeluaran';
  kategori: string;
  jumlah: number;
  keterangan: string;
  metode: string;
  source?: string;
}

export const FinanceTab: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Add Transaction Form state
  const [showForm, setShowForm] = useState(false);
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [tipe, setTipe] = useState<'Pemasukan' | 'Pengeluaran'>('Pemasukan');
  const [kategori, setKategori] = useState('Client Development');
  const [jumlah, setJumlah] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [metode, setMetode] = useState('Bank Transfer (BCA)');
  const [submitting, setSubmitting] = useState(false);

  // Close transaction detail modal on Escape
  useEffect(() => {
    if (!selectedTx) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedTx(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedTx]);

  // Notification status state
  const [notifyStatus, setNotifyStatus] = useState<string | null>(null);
  const [sendingNotify, setSendingNotify] = useState(false);

  // AI Auto-Bot Chat Parser State
  const [botMessage, setBotMessage] = useState('');
  const [selectedBotSource, setSelectedBotSource] = useState<'WhatsApp Auto-Bot' | 'Telegram Bot'>('WhatsApp Auto-Bot');
  const [parsingBot, setParsingBot] = useState(false);
  const [botParseResult, setBotParseResult] = useState<any>(null);

  // AI Analisa Mandiri Report State
  const [analyzingFinance, setAnalyzingFinance] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);

  // Webhook Integration & Real-time Console State
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);
  const [webhookSimulatorMessage, setWebhookSimulatorMessage] = useState('Beli server SSD NVMe 1TB 1.450.000 via BCA');
  const [webhookPlatform, setWebhookPlatform] = useState<'WhatsApp' | 'Telegram'>('WhatsApp');
  const [simulatingWebhook, setSimulatingWebhook] = useState(false);
  const [simulatedWebhookResult, setSimulatedWebhookResult] = useState<any>(null);

  const fetchWebhookLogs = async () => {
    try {
      const res = await fetch('/api/v1/webhook/bot');
      const json = await res.json();
      if (json.webhookLogs) {
        setWebhookLogs(json.webhookLogs);
      }
    } catch (err) {
      console.error('Failed to fetch webhook logs', err);
    }
  };

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `/api/v1/keuangan?tipe=${filterType === 'All' ? '' : filterType}&q=${encodeURIComponent(
          searchQuery
        )}`
      );
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError('Gagal memuat data keuangan. Periksa koneksi server lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `/api/v1/keuangan?tipe=${filterType === 'All' ? '' : filterType}&q=${encodeURIComponent(
            searchQuery
          )}`
        );
        const json = await res.json();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (isMounted) setData(json);

        // Also fetch webhook logs
        const whRes = await fetch('/api/v1/webhook/bot');
        const whJson = await whRes.json();
        if (isMounted && whJson.webhookLogs) {
          setWebhookLogs(whJson.webhookLogs);
        }
      } catch (err) {
        if (isMounted) setError('Gagal memuat data keuangan. Periksa koneksi server lalu coba lagi.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [filterType, searchQuery]);

  const handleTriggerWebhookSimulate = async () => {
    if (!webhookSimulatorMessage.trim()) return;

    try {
      setSimulatingWebhook(true);
      setSimulatedWebhookResult(null);

      let payload: any = {};
      if (webhookPlatform === 'Telegram') {
        payload = {
          update_id: Date.now(),
          message: {
            from: { username: 'owner_apu_server', id: 98765432 },
            chat: { id: 98765432, type: 'private' },
            text: webhookSimulatorMessage,
          },
        };
      } else {
        payload = {
          sender: '+6281234567890',
          message: webhookSimulatorMessage,
          platform: 'WhatsApp',
        };
      }

      const res = await authedPost('/api/v1/webhook/bot', payload);
      const json = await res.json();
      setSimulatedWebhookResult(json);

      // Refresh financial data & logs
      fetchFinancialData();
      fetchWebhookLogs();
    } catch (err) {
      console.error('Failed to send webhook simulation', err);
    } finally {
      setSimulatingWebhook(false);
    }
  };

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
        setShowForm(false);
        setJumlah('');
        setKeterangan('');
        fetchFinancialData();
      }
    } catch (err) {
      console.error('Failed to add transaction', err);
    } finally {
      setSubmitting(false);
    }
  };

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
        fetchFinancialData();
      }
    } catch (err) {
      console.error('Failed to parse chat via Hermes Agent', err);
    } finally {
      setParsingBot(false);
    }
  };

  const handleAnalyzeFinance = async () => {
    try {
      setAnalyzingFinance(true);
      const res = await authedPost('/api/v1/keuangan', { action: 'ai_analyze_finance' });
      const json = await res.json();
      if (json.success) {
        setAiAnalysisResult(json);
      }
    } catch (err) {
      console.error('Failed to run AI financial analysis', err);
    } finally {
      setAnalyzingFinance(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await authedPost('/api/v1/keuangan', { action: 'delete', id });
      fetchFinancialData();
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const handleSendNotification = async (platform: 'telegram' | 'whatsapp') => {
    try {
      setSendingNotify(true);
      setNotifyStatus(null);
      const reportMessage = `📊 *Laporan Keuangan apu.web.id*\n- Total Pemasukan: Rp ${data?.summary?.totalPemasukan?.toLocaleString('id-ID')}\n- Total Pengeluaran: Rp ${data?.summary?.totalPengeluaran?.toLocaleString('id-ID')}\n- *Laba Bersih*: Rp ${data?.summary?.labaBersih?.toLocaleString('id-ID')}\n\nDisimpan di SQLite WAL Mode (HDD Optimized).`;

      const res = await authedPost('/api/v1/notifications', {
        platform,
        message: reportMessage,
      });
      const json = await res.json();
      if (json.success) {
        setNotifyStatus(json.status);
      }
    } catch (err) {
      setNotifyStatus('Gagal mengirim notifikasi.');
    } finally {
      setSendingNotify(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
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
            onClick={handleAnalyzeFinance}
            disabled={analyzingFinance}
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#22d3ee]/30 text-[#cffafe] border border-[#22d3ee]/40 hover:bg-[#22d3ee]/50 shadow-md transition-all"
          >
            <BrainCircuit className="w-4 h-4 text-[#22d3ee]" />
            {analyzingFinance ? 'Menganalisis...' : 'Analisa AI'}
          </button>

          <button
            onClick={() => handleSendNotification('telegram')}
            disabled={sendingNotify}
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#22d3ee]/20 text-[#67e8f9] border border-[#22d3ee]/30 hover:bg-[#22d3ee]/30 transition-all"
          >
            <Send className="w-3.5 h-3.5" /> Kirim TG
          </button>
          <button
            onClick={() => handleSendNotification('whatsapp')}
            disabled={sendingNotify}
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Kirim WA
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Manual
          </button>
        </div>
      </div>

      {notifyStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{notifyStatus}</span>
        </div>
      )}

      {/* AI BOT AUTO-CHAT DETECTOR SECTION (HERMES AGENT + 9ROUTER) — collapsible biar HP ringkas */}
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

      {/* DIRECT WEBHOOK ENDPOINT & SIMULATOR CONSOLE */}
      <details className="floating-card bg-slate-900 border-[#22d3ee]/40 space-y-4 group">
        <summary className="cursor-pointer list-none flex items-center justify-between gap-2 py-1 select-none">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#22d3ee]/10 text-[#67e8f9] border border-[#22d3ee]/30">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Webhook Endpoint & Simulator
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#22d3ee]/20 text-[#67e8f9] border border-[#22d3ee]/30">
                  Developer Tools
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Endpoint `/api/v1/webhook/bot`, simulasi payload, & log masuk.
              </p>
            </div>
          </div>
          <span className="text-[#22d3ee] transition-transform group-open:rotate-180">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
        </summary>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#22d3ee]/10 text-[#67e8f9] border border-[#22d3ee]/30">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Server Webhook Endpoint Receiver (`/api/v1/webhook/bot`)
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#22d3ee]/20 text-[#67e8f9] border border-[#22d3ee]/30">
                  HTTP POST / GET Webhook
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Alamat webhook resmi untuk menerima chat langsung dari Telegram Bot Webhook API / WhatsApp Fonnte / Baileys.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText('https://apu.web.id/api/v1/webhook/bot');
                setCopiedWebhookUrl(true);
                setTimeout(() => setCopiedWebhookUrl(false), 2000);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 text-xs font-mono font-semibold transition-all"
            >
              {copiedWebhookUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedWebhookUrl ? 'Copied URL!' : 'Copy Webhook URL'}
            </button>
          </div>
        </div>

        {/* Webhook Endpoint Info Box */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-[#67e8f9]">
            <Terminal className="w-4 h-4 text-[#67e8f9] flex-shrink-0" />
            <span className="text-slate-300">Endpoint:</span>
            <span className="text-emerald-400 font-bold bg-slate-900 px-2 py-1 rounded border border-slate-800">
              https://apu.web.id/api/v1/webhook/bot
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Telegram Webhook Cmd: <code className="text-[#67e8f9]">setWebhook?url=https://apu.web.id/api/v1/webhook/bot</code>
          </div>
        </div>

        {/* Webhook Simulator Form */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#22d3ee]" /> Simulasikan Pesan Masuk Webhook dari WhatsApp / Telegram
            </span>
            <div className="flex items-center gap-2 text-xs font-mono">
              <button
                onClick={() => setWebhookPlatform('WhatsApp')}
                className={`px-2.5 py-0.5 rounded text-[11px] transition-all ${
                  webhookPlatform === 'WhatsApp' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                WhatsApp Payload
              </button>
              <button
                onClick={() => setWebhookPlatform('Telegram')}
                className={`px-2.5 py-0.5 rounded text-[11px] transition-all ${
                  webhookPlatform === 'Telegram' ? 'bg-[#22d3ee] text-white font-bold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Telegram Payload
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-2">
            <input
              type="text"
              value={webhookSimulatorMessage}
              onChange={(e) => setWebhookSimulatorMessage(e.target.value)}
              placeholder="Isi pesan transaksi webhook..."
              className="flex-1 w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-[#22d3ee]/40"
            />
            <button
              onClick={handleTriggerWebhookSimulate}
              disabled={simulatingWebhook || !webhookSimulatorMessage.trim()}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#22d3ee] text-white hover:bg-[#0ea5e9] shadow-md disabled:opacity-50 transition-all whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              {simulatingWebhook ? 'Mengirim Webhook...' : 'Kirim Webhook POST'}
            </button>
          </div>

          {/* Simulated Result Box */}
          {simulatedWebhookResult && (
            <div className="p-3.5 rounded-xl bg-slate-900 border border-[#22d3ee]/40 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-[#67e8f9] font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> HTTP 200 OK — Webhook Processed
                </span>
                <span className="text-[10px] text-slate-400">SQLite WAL &amp; AI Analysis Completed</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 text-slate-300 text-[11px] whitespace-pre-wrap border border-slate-800">
                {simulatedWebhookResult.result?.autoReplyText || JSON.stringify(simulatedWebhookResult, null, 2)}
              </div>
            </div>
          )}
        </div>

        {/* Webhook Activity Logs Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-mono">
              <FileText className="w-3.5 h-3.5 text-[#22d3ee]" /> Webhook Activity Logs (Real-time Audit Trail)
            </span>
            <button
              onClick={fetchWebhookLogs}
              className="text-[11px] font-mono text-[#22d3ee] hover:underline"
            >
              Refresh Logs
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Waktu</th>
                  <th className="p-2.5">Platform</th>
                  <th className="p-2.5">Pengirim</th>
                  <th className="p-2.5">Pesan Chat</th>
                  <th className="p-2.5">Auto-Parsed Tx</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/50 text-slate-300">
                {webhookLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-500">
                      Belum ada webhook log.
                    </td>
                  </tr>
                ) : (
                  webhookLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-slate-400">{log.timestamp}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.platform === 'WhatsApp' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-[#22d3ee]/20 text-[#67e8f9]'
                          }`}
                        >
                          {log.platform}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-300">{log.sender}</td>
                      <td className="p-2.5 max-w-xs truncate text-slate-200">{log.message}</td>
                      <td className="p-2.5 text-emerald-400">
                        {log.parsedTx ? `${log.parsedTx.tipe}: Rp ${(log.parsedTx.jumlah || 0).toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </details>

      {/* AI ANALISA MANDIRI MODAL / CARD */}
      {aiAnalysisResult && (
        <div className="floating-card bg-slate-900 border-[#22d3ee]/40/50 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-[#22d3ee]" />
              <h3 className="text-sm font-bold text-white">
                Analisa Mandiri & Laporan Eksekutif (Hermes Financial AI)
              </h3>
            </div>
            <button
              onClick={() => setAiAnalysisResult(null)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
            >
              Tutup
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Total Pemasukan</div>
              <div className="text-sm font-bold text-emerald-400 font-mono">
                {formatRupiah(aiAnalysisResult.summary?.totalPemasukan || 0)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Total Pengeluaran</div>
              <div className="text-sm font-bold text-rose-400 font-mono">
                {formatRupiah(aiAnalysisResult.summary?.totalPengeluaran || 0)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Laba Bersih</div>
              <div className="text-sm font-bold text-[#67e8f9] font-mono">
                {formatRupiah(aiAnalysisResult.summary?.labaBersih || 0)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Profit Margin</div>
              <div className="text-sm font-bold text-emerald-400 font-mono">
                {aiAnalysisResult.summary?.profitMargin}%
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 whitespace-pre-line font-mono leading-relaxed">
            {aiAnalysisResult.analysisReport}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => handleSendNotification('telegram')}
              className="px-3 py-1.5 rounded-lg bg-[#22d3ee]/20 text-[#67e8f9] border border-[#22d3ee]/30 text-xs font-semibold hover:bg-[#22d3ee]/30"
            >
              Broadcast Laporan ke Telegram
            </button>
            <button
              onClick={() => handleSendNotification('whatsapp')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-600/30"
            >
              Broadcast Laporan ke WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* Add Transaction Form Drawer */}
      {showForm && (
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
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-[#22d3ee]/40"
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
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#22d3ee]/40"
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
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#22d3ee]/40"
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
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-[#22d3ee]/40"
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
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#22d3ee]/40"
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
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#22d3ee]/40"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#22d3ee] text-white hover:bg-[#22d3ee] shadow-md shadow-[#22d3ee]/40 disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      )}

      {/* Data area: skeleton while first load */}
      {loading && !data ? (
        <div className="space-y-4">
          <div className="floating-card h-24 animate-pulse bg-slate-800/50" />
          <div className="floating-card h-64 animate-pulse bg-slate-800/50" />
          <div className="floating-card h-48 animate-pulse bg-slate-800/50" />
        </div>
      ) : (
        <>
          {error && (
            <div className="floating-card border-rose-500/40 bg-rose-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-rose-300">Gagal memuat data keuangan</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Server tidak merespons. Periksa koneksi lalu coba lagi.
                  </p>
                </div>
              </div>
              <button
                onClick={fetchFinancialData}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#22d3ee] text-white hover:bg-[#0ea5e9] shadow-lg shadow-[#22d3ee]/30 transition-all"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Income */}
        <div className="floating-card">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Total Pemasukan
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono">
              INCOME
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-white font-mono">
            {formatRupiah(data?.summary?.totalPemasukan || 0)}
          </div>
        </div>

        {/* Total Expense */}
        <div className="floating-card">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <TrendingDown className="w-4 h-4 text-rose-400" /> Total Pengeluaran
            </span>
            <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-mono">
              EXPENSE
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-rose-400 font-mono">
            {formatRupiah(data?.summary?.totalPengeluaran || 0)}
          </div>
        </div>

        {/* Net Profit */}
        <div className="floating-card">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium">
              <DollarSign className="w-4 h-4 text-[#22d3ee]" /> Laba Bersih (Net)
            </span>
            <span className="text-[10px] bg-[#22d3ee]/10 text-[#22d3ee] px-2 py-0.5 rounded font-mono">
              NET PROFIT
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-[#67e8f9] font-mono">
            {formatRupiah(data?.summary?.labaBersih || 0)}
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="floating-card">
        <h3 className="font-bold text-white text-sm mb-4">
          Tren Keuangan Bulanan (Pemasukan vs Pengeluaran)
        </h3>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.monthlyTrends || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val: any) => formatRupiah(Number(val))}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="pemasukan" name="Pemasukan" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#f43f5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filterable Transactions Table */}
      <div className="floating-card space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <h3 className="font-bold text-white text-sm">
            Riwayat Transaksi (SQLite WAL Storage & Bot Auto-Logged)
          </h3>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#22d3ee]/40"
              />
            </div>

            {/* Type Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              {['All', 'Pemasukan', 'Pengeluaran'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filterType === type
                      ? 'bg-[#22d3ee] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
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
              {data?.transactions?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-[#22d3ee]/10 border border-[#22d3ee]/20 flex items-center justify-center">
                        <Wallet className="w-8 h-8 text-[#22d3ee]/60" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-300">Belum ada transaksi</p>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                          Kirim pesan transaksi via WhatsApp bot (contoh: "gaji 1.850.000") atau
                          tambah manual — data bakal muncul di sini.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowForm(true)}
                        aria-label="Tambah transaksi manual"
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#22d3ee] text-white hover:bg-[#0ea5e9] shadow-lg shadow-[#22d3ee]/30 transition-all"
                      >
                        + Tambah Transaksi
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.transactions?.map((tx: Transaction) => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-slate-400">{tx.tanggal}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-[#67e8f9] border border-slate-700">
                        <Bot className="w-3 h-3 text-emerald-400" />
                        {tx.source || 'Manual'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-mono text-[10px] ${
                          tx.tipe === 'Pemasukan'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
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
                        tx.tipe === 'Pemasukan' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.tipe === 'Pemasukan' ? '+' : '-'} {formatRupiah(tx.jumlah)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(tx.id);
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
          {data?.transactions?.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#22d3ee]/10 border border-[#22d3ee]/20 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-[#22d3ee]/60" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-300">Belum ada transaksi</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Kirim pesan transaksi via WhatsApp bot (contoh: "gaji 1.850.000") atau
                  tambah manual — data bakal muncul di sini.
                </p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                aria-label="Tambah transaksi manual dari kosong"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#22d3ee] text-white hover:bg-[#0ea5e9] shadow-lg shadow-[#22d3ee]/30 transition-all"
              >
                + Tambah Transaksi
              </button>
            </div>
          ) : (
            data?.transactions?.map((tx: Transaction) => (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="floating-card p-4 space-y-2 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-slate-400">{tx.tanggal}</span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                      tx.tipe === 'Pemasukan'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {tx.tipe}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{tx.keterangan}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono bg-slate-800 text-[#67e8f9] border border-slate-700">
                        <Bot className="w-2.5 h-2.5 text-emerald-400" />
                        {tx.source || 'Manual'}
                      </span>
                      {tx.kategori} &bull; {tx.metode}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`font-mono font-bold text-sm ${
                        tx.tipe === 'Pemasukan' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.tipe === 'Pemasukan' ? '+' : '-'} {formatRupiah(tx.jumlah)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(tx.id);
                      }}
                      aria-label={`Hapus transaksi ${tx.keterangan}`}
                      className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all flex items-center justify-center flex-shrink-0"
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
        </>
      )}

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setSelectedTx(null)}
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
                onClick={() => setSelectedTx(null)}
                aria-label="Tutup detail transaksi"
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span
                className={`px-2.5 py-1 rounded font-mono text-[10px] ${
                  selectedTx.tipe === 'Pemasukan'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {selectedTx.tipe}
              </span>
              <span
                className={`font-mono font-bold text-xl ${
                  selectedTx.tipe === 'Pemasukan' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {selectedTx.tipe === 'Pemasukan' ? '+' : '-'} {formatRupiah(selectedTx.jumlah)}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Tanggal</span>
                <span className="font-mono text-slate-200 text-right">{selectedTx.tanggal}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Kategori</span>
                <span className="text-slate-200 text-right">{selectedTx.kategori}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Metode</span>
                <span className="text-slate-200 text-right">{selectedTx.metode}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Sumber</span>
                <span className="text-slate-200 text-right">{selectedTx.source || 'Manual'}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">ID Transaksi</span>
                <span className="font-mono text-slate-400 text-right break-all">{selectedTx.id}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs text-slate-500">Keterangan</p>
              <p className="text-sm text-slate-200 whitespace-pre-wrap break-words">
                {selectedTx.keterangan}
              </p>
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full px-4 py-2.5 rounded-xl text-xs font-bold bg-[#22d3ee] text-white hover:bg-[#0ea5e9] shadow-lg shadow-[#22d3ee]/30 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
