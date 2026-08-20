'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Activity, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface NineRouterStatusBadgeProps {
  routerUrl?: string;
}

export const NineRouterStatusBadge: React.FC<NineRouterStatusBadgeProps> = ({
  routerUrl = 'http://localhost:20128',
}) => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    setStatus('checking');
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`${routerUrl}/api/health`, {
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);

      const elapsed = Math.round(performance.now() - start);

      if (res.ok) {
        setStatus('online');
        setLatencyMs(elapsed);
      } else {
        setStatus('offline');
        setLatencyMs(null);
      }
    } catch {
      setStatus('offline');
      setLatencyMs(null);
    } finally {
      setLastChecked(new Date());
    }
  }, [routerUrl]);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full liquid-glass border border-white/10 border border-white/10  shadow-lg">
      <div className="flex items-center gap-2">
        {status === 'online' ? (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
        ) : status === 'checking' ? (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-spin inline-flex rounded-full h-2.5 w-2.5 border border-cyan-400 border-t-transparent"></span>
          </span>
        ) : (
          <span className="relative flex h-2.5 w-2.5">
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
        )}

        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            9Router Gateway
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border ${
                status === 'online'
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : status === 'checking'
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              {status === 'online'
                ? `Online (${latencyMs}ms)`
                : status === 'checking'
                ? 'Ping...'
                : 'Offline'}
            </span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Port :20128 {lastChecked && `• ${lastChecked.toLocaleTimeString()}`}
          </span>
        </div>
      </div>

      <button
        onClick={checkHealth}
        disabled={status === 'checking'}
        title="Refresh Status"
        className="p-1 rounded-full text-slate-400 hover:text-cyan-400 hover:bg-slate-900 border border-white/10 active:scale-95 transition-all"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${status === 'checking' ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};
