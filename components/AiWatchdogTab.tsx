'use client';

import React, { useState, useEffect } from 'react';
import {
  Bot,
  Activity,
  RefreshCw,
  Zap,
  Globe,
  Server,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Clock,
  Sparkles,
} from 'lucide-react';

export function AiWatchdogTab() {
  const [watchdogData, setWatchdogData] = useState<any>({
    summary: { total: 0, online: 0, offline: 0, avgLatencyMs: 0 },
    services: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchWatchdog = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/watchdog');
      if (res.ok) {
        const data = await res.json();
        setWatchdogData(data);
      }
    } catch (err) {
      console.error('Failed to fetch watchdog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchdog();
    const interval = setInterval(fetchWatchdog, 5000);
    return () => clearInterval(interval);
  }, []);

  const summary = watchdogData.summary || { total: 0, online: 0, offline: 0, avgLatencyMs: 0 };
  const services = watchdogData.services || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            AI Ecosystem & Microservices Watchdog
          </h2>
          <p className="text-xs text-slate-400">
            Real-time ping, latency tracking, dan health checks untuk 9Router, Hermes Gateway, MiMo, OpenCode & Proxies
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 text-slate-300">
            Avg Latency: <strong className="text-cyan-400">{summary.avgLatencyMs} ms</strong>
          </span>
          <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            Online: <strong>{summary.online}/{summary.total}</strong>
          </span>
          <button
            onClick={fetchWatchdog}
            className="p-1.5 rounded-lg bg-slate-900 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-cyan-400"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((svc: any) => {
          const isOnline = svc.status === 'online';
          const isDegraded = svc.status === 'degraded';

          return (
            <div
              key={svc.id}
              className={`rounded-2xl border p-5 backdrop-blur-md transition-all flex flex-col justify-between ${
                isOnline
                  ? 'bg-slate-900/70 border-white/10 hover:border-cyan-500/30'
                  : isDegraded
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-slate-950/60 border-white/5 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-white text-sm tracking-tight">{svc.name}</h3>
                    <div className="text-[11px] font-mono text-cyan-400">{svc.url}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isOnline
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                        : isDegraded
                        ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                        : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isOnline ? 'bg-emerald-400' : isDegraded ? 'bg-amber-400' : 'bg-rose-400'
                      }`}
                    />
                    {svc.status}
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 my-3 py-2 border-y border-white/5 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[9px]">PORT</span>
                    <span className="text-slate-200 font-bold">:{svc.port}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">LATENCY</span>
                    <span className={`font-bold ${svc.latencyMs < 30 ? 'text-emerald-400' : svc.latencyMs < 100 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {svc.latencyMs} ms
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">HTTP CODE</span>
                    <span className="text-slate-200 font-bold">{svc.statusCode ?? 'ERR'}</span>
                  </div>
                </div>

                {svc.error && (
                  <div className="text-[10px] text-rose-400 font-mono bg-rose-950/20 p-2 rounded-lg border border-rose-500/20">
                    {svc.error}
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-2">
                <a
                  href={svc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 text-xs font-semibold text-slate-200 hover:text-cyan-300 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Local Endpoint</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
