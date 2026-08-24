'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Search,
  RefreshCw,
  Copy,
  Download,
  Check,
  Filter,
  Play,
  Pause,
  Trash2,
} from 'lucide-react';

interface LogsTabProps {
  initialUnit?: string;
}

export function LogsTab({ initialUnit }: LogsTabProps) {
  const [unit, setUnit] = useState<string>(initialUnit || 'all');
  const [lines, setLines] = useState<number>(100);
  const [priority, setPriority] = useState<string>('all');
  const [searchGrep, setSearchGrep] = useState<string>('');
  const [logs, setLogs] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        unit,
        lines: String(lines),
        priority,
        grep: searchGrep,
      });

      const res = await fetch(`/api/v1/logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || 'No logs available.');
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialUnit) {
      setUnit(initialUnit);
    }
  }, [initialUnit]);

  useEffect(() => {
    fetchLogs();
    if (!isStreaming) return;
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, [unit, lines, priority, searchGrep, isStreaming]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogs = () => {
    const blob = new Blob([logs], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `journalctl-${unit}-${new Date().toISOString().slice(0, 19)}.log`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const availableUnits = [
    { id: 'all', label: 'All System Journal' },
    { id: 'apu-webid', label: 'apu-webid.service (Hub)' },
    { id: '9router', label: '9router.service (AI Gateway)' },
    { id: 'caddy', label: 'caddy.service (Reverse Proxy)' },
    { id: 'cloudflared', label: 'cloudflared.service (Argo Tunnel)' },
    { id: 'hermes-gateway', label: 'hermes-gateway.service' },
    { id: 'agy-telegram', label: 'agy-telegram.service' },
    { id: 'cf-ai-proxy', label: 'cf-ai-proxy.service' },
    { id: 'mimo-serve', label: 'mimo-serve.service' },
    { id: 'opencode-server', label: 'opencode-server.service' },
    { id: 'mihomo', label: 'mihomo.service' },
    { id: 'docker', label: 'docker.service' },
    { id: 'tailscaled', label: 'tailscaled.service' },
    { id: 'kernel', label: 'Kernel Messages (dmesg)' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Live Journalctl & Logs Streamer
          </h2>
          <p className="text-xs text-slate-400">
            Streaming real-time log journal systemd, kernel dmesg, error tracking, dan debug traces
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              isStreaming
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isStreaming ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isStreaming ? 'Streaming LIVE' : 'Paused'}</span>
          </button>

          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-cyan-400 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleCopyLogs}
            className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Copy Logs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownloadLogs}
            className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Download Log File"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900/60 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        {/* Unit Selector */}
        <div>
          <label className="block text-[10px] font-mono text-slate-400 mb-1">UNIT SERVICE</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-white/10 focus:border-cyan-400 rounded-xl text-xs text-white font-mono outline-none cursor-pointer"
          >
            {availableUnits.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-[10px] font-mono text-slate-400 mb-1">PRIORITY</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-white/10 focus:border-cyan-400 rounded-xl text-xs text-white font-mono outline-none cursor-pointer"
          >
            <option value="all">All Logs (Info, Warn, Err)</option>
            <option value="error">Errors Only (err..emerg)</option>
            <option value="warning">Warnings & Errors</option>
          </select>
        </div>

        {/* Lines Limit */}
        <div>
          <label className="block text-[10px] font-mono text-slate-400 mb-1">LINE COUNT</label>
          <select
            value={lines}
            onChange={(e) => setLines(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-950 border border-white/10 focus:border-cyan-400 rounded-xl text-xs text-white font-mono outline-none cursor-pointer"
          >
            <option value={50}>Last 50 lines</option>
            <option value={100}>Last 100 lines</option>
            <option value={250}>Last 250 lines</option>
            <option value={500}>Last 500 lines</option>
          </select>
        </div>

        {/* Grep / Search */}
        <div>
          <label className="block text-[10px] font-mono text-slate-400 mb-1">SEARCH / GREP</label>
          <div className="relative">
            <input
              type="text"
              value={searchGrep}
              onChange={(e) => setSearchGrep(e.target.value)}
              placeholder="Keyword filter..."
              className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-white/10 focus:border-cyan-400 rounded-xl text-xs text-white font-mono outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Terminal Log Console */}
      <div className="rounded-2xl border border-white/10 bg-slate-950 p-4 font-mono text-xs shadow-2xl overflow-hidden relative">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10 text-slate-400 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="ml-2 font-bold text-slate-300">journalctl — {unit} ({lines} lines)</span>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-white select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded bg-slate-900 border-white/10 text-cyan-400 focus:ring-0"
            />
            <span>Auto-scroll</span>
          </label>
        </div>

        {/* Console Box */}
        <div className="max-h-[600px] overflow-y-auto space-y-0.5 leading-relaxed text-slate-300 pr-2 select-text scrollbar-thin">
          {logs ? (
            logs.split('\n').map((line, i) => {
              const isError = line.toLowerCase().includes('err') || line.toLowerCase().includes('fail') || line.toLowerCase().includes('exception');
              const isWarn = line.toLowerCase().includes('warn');
              const isSuccess = line.toLowerCase().includes('started') || line.toLowerCase().includes('active') || line.toLowerCase().includes('ok');

              return (
                <div
                  key={i}
                  className={`py-0.5 px-1 rounded transition-colors hover:bg-white/5 ${
                    isError
                      ? 'text-rose-400 bg-rose-950/20'
                      : isWarn
                      ? 'text-amber-400'
                      : isSuccess
                      ? 'text-emerald-300'
                      : 'text-slate-300'
                  }`}
                >
                  {line}
                </div>
              );
            })
          ) : (
            <div className="text-slate-500 py-8 text-center">Menunggu stream log...</div>
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
