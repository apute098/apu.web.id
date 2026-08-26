'use client';

import React, { useState, useEffect } from 'react';
import {
  Bot,
  RefreshCw,
  ExternalLink,
  Zap,
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
    <div className="space-y-6 sm:space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-[#00f2fe]" />
            AI Ecosystem Watchdog
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Active health ping & response latency probe for 9Router, Hermes, MiMo, OpenCode & Gateways
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-300">
            Avg Latency: <strong className="text-[#00f2fe]">{summary.avgLatencyMs} ms</strong>
          </span>
          <span className="px-3.5 py-1 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981]">
            Online: <strong>{summary.online}/{summary.total}</strong>
          </span>
          <button
            onClick={fetchWatchdog}
            className="p-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 hover:text-[#00f2fe] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00f2fe]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Services Grid in Doppelrand Shell */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {services.map((svc: any) => {
          const isOnline = svc.status === 'online';
          const isDegraded = svc.status === 'degraded';

          return (
            <div key={svc.id} className="doppelrand-shell flex flex-col justify-between">
              <div className="doppelrand-core h-full flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-extrabold text-white text-sm tracking-tight">{svc.name}</h3>
                      <div className="text-[11px] font-mono text-[#00f2fe]">{svc.url}</div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        isOnline
                          ? 'bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981]'
                          : isDegraded
                          ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                          : 'bg-[#f43f5e]/15 border border-[#f43f5e]/30 text-[#f43f5e]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isOnline ? 'bg-[#10b981]' : isDegraded ? 'bg-amber-400' : 'bg-[#f43f5e]'
                        }`}
                      />
                      {svc.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-3 py-2 border-y border-white/[0.06] font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[9px]">PORT</span>
                      <span className="text-slate-200 font-bold">:{svc.port}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px]">LATENCY</span>
                      <span className={`font-bold ${svc.latencyMs < 30 ? 'text-[#10b981]' : svc.latencyMs < 100 ? 'text-amber-400' : 'text-[#f43f5e]'}`}>
                        {svc.latencyMs} ms
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px]">HTTP CODE</span>
                      <span className="text-slate-200 font-bold">{svc.statusCode ?? 'ERR'}</span>
                    </div>
                  </div>

                  {svc.error && (
                    <div className="text-[10px] text-[#f43f5e] font-mono bg-[#f43f5e]/10 p-2.5 rounded-xl border border-[#f43f5e]/20">
                      {svc.error}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <a
                    href={svc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full btn-nested group"
                  >
                    <span>Inspect Local Endpoint</span>
                    <div className="btn-nested-icon">
                      <ExternalLink className="w-3.5 h-3.5 text-[#00f2fe]" />
                    </div>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
