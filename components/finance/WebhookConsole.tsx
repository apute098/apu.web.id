import React, { useState, useEffect } from 'react';
import { authedPost } from '@/lib/api';
import {
  Cloud,
  Zap,
  Send,
  CheckCircle2,
  Check,
  Copy,
  Terminal,
  FileText,
} from 'lucide-react';

interface Props {
  onWebhookProcessed: () => void;
}

export const WebhookConsole: React.FC<Props> = ({ onWebhookProcessed }) => {
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

  useEffect(() => {
    fetchWebhookLogs();
  }, []);

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
          sender: '+628****7890',
          message: webhookSimulatorMessage,
          platform: 'WhatsApp',
        };
      }

      const res = await authedPost('/api/v1/webhook/bot', payload);
      const json = await res.json();
      setSimulatedWebhookResult(json);

      // Refresh financial data & logs
      onWebhookProcessed();
      fetchWebhookLogs();
    } catch (err) {
      console.error('Failed to send webhook simulation', err);
    } finally {
      setSimulatingWebhook(false);
    }
  };

  return (
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
            className="flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 text-xs font-mono font-semibold transition-all"
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
          <span className="text-emerald-400 font-bold bg-slate-900 px-2 py-1 rounded border border-slate-800 break-all">
            https://apu.web.id/api/v1/webhook/bot
          </span>
        </div>
        <div className="text-[11px] text-slate-400 break-all">
          Telegram Webhook Cmd: <code className="text-[#67e8f9] break-all">setWebhook?url=https://apu.web.id/api/v1/webhook/bot</code>
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
            className="flex-1 w-full px-3.5 py-2.5 min-h-[44px] rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-[#22d3ee]/40"
          />
          <button
            onClick={handleTriggerWebhookSimulate}
            disabled={simulatingWebhook || !webhookSimulatorMessage.trim()}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-[#22d3ee] text-white hover:bg-[#0ea5e9] shadow-md disabled:opacity-50 transition-all whitespace-nowrap"
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
  );
};