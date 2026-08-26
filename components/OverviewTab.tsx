'use client';

import React, { useState } from 'react';
import {
  Cpu,
  HardDrive,
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Thermometer,
  Zap,
  Server,
  RotateCcw,
  Network,
  Bot,
  Radio,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Send,
  Lock,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { GlassCard } from './ui/GlassCard';
import { StatusBadge } from './ui/StatusBadge';
import { triggerHaptic } from '@/lib/haptics';

interface OverviewTabProps {
  systemData: any;
  historyData: any[];
  onTriggerAction: (action: string) => Promise<void>;
  isLocked: boolean;
  onOpenAuthModal: () => void;
  onNavigateTab: (tab: any) => void;
}

export function OverviewTab({
  systemData,
  historyData,
  onTriggerAction,
  isLocked,
  onOpenAuthModal,
  onNavigateTab,
}: OverviewTabProps) {
  const [runningAction, setRunningAction] = useState<string | null>(null);

  const handleAction = async (action: string) => {
    if (isLocked) {
      triggerHaptic('light');
      onOpenAuthModal();
      return;
    }
    triggerHaptic('medium');
    setRunningAction(action);
    try {
      await onTriggerAction(action);
    } finally {
      setRunningAction(null);
    }
  };

  const isLoaded = Boolean(systemData && systemData.cpu);
  const sys = systemData?.system || {};
  const cpu = systemData?.cpu || { totalUsage: null, cores: [], model: '', freqGhz: null, temperatureC: null, coreCount: 0 };
  const ram = systemData?.ram || { totalGB: 0, usedGB: null, freeGB: null, usagePercent: null, cachedGB: 0 };
  const disks = systemData?.disks || [];
  const net = systemData?.network || { downloadKbps: null, uploadKbps: null, activeInterface: '', localIp: '', tailscaleIp: '' };

  const formatSpeed = (kbps: number | null | undefined) => {
    if (kbps === null || kbps === undefined) return '-- KB/s';
    if (kbps >= 1024) return `${(kbps / 1024).toFixed(2)} MB/s`;
    return `${kbps.toFixed(1)} KB/s`;
  };

  return (
    <div className="space-y-6">
      {/* 1. HERO SYSTEM HUD DECK */}
      <GlassCard className="p-6 sm:p-8 overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="hud-chip flex items-center gap-1.5 text-cyan-300 border-cyan-500/30">
                <Server className="w-3.5 h-3.5" />
                <span>ARCH LINUX NODE</span>
              </span>
              <StatusBadge status={isLoaded ? 'active' : 'activating'} label={isLoaded ? 'TELEMETRY ONLINE' : 'CONNECTING...'} />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
                {sys.hostname || 'archlinux'} <span className="text-slate-500 font-normal text-xl">/ Mission Control</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span>{sys.kernel || 'Linux 7.x'}</span>
                <span className="text-slate-700">•</span>
                <span>{cpu.model || 'Intel Core i3 @ 3.9 GHz'}</span>
                <span className="text-slate-700">•</span>
                <span className="text-emerald-400">IP: {net.tailscaleIp || '--'}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="flex items-center gap-3">
            <div className="bg-black/40 border border-white/10 rounded-xl p-3 min-w-[100px] text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Uptime</span>
              <span className="text-sm font-bold font-mono text-white">{sys.uptime || '24h+'}</span>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-xl p-3 min-w-[100px] text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">CPU Temp</span>
              <span className="text-sm font-bold font-mono text-cyan-400">
                {cpu.temperatureC ? `${cpu.temperatureC.toFixed(0)}°C` : '48°C'}
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 2. CORE TELEMETRY BENTO GRID (4 COLUMNS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU USAGE */}
        <GlassCard className="p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>CPU Processor</span>
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400">{cpu.totalUsage ?? 0}%</span>
          </div>

          <div className="space-y-1.5">
            <div className="hardware-bar-track h-2">
              <div
                className="hardware-bar-fill bg-gradient-to-r from-cyan-500 to-blue-500"
                style={{ width: `${Math.min(100, Math.max(2, cpu.totalUsage ?? 0))}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>{cpu.coreCount || 4} Cores Active</span>
              <span>Load: {sys.loadAvg ? sys.loadAvg.slice(0, 3).join(', ') : '1.2'}</span>
            </div>
          </div>
        </GlassCard>

        {/* MEMORY USAGE */}
        <GlassCard className="p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>RAM Memory</span>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">{ram.usagePercent ?? 0}%</span>
          </div>

          <div className="space-y-1.5">
            <div className="hardware-bar-track h-2">
              <div
                className="hardware-bar-fill bg-gradient-to-r from-emerald-500 to-teal-400"
                style={{ width: `${Math.min(100, Math.max(2, ram.usagePercent ?? 0))}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>{ram.usedGB?.toFixed(1) || '2.6'} GB Used</span>
              <span>{ram.totalGB || '8.0'} GB Total</span>
            </div>
          </div>
        </GlassCard>

        {/* STORAGE DISK */}
        <GlassCard className="p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-amber-400" />
              <span>NVMe Storage</span>
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">
              {disks[0]?.usePercent || '32%'}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="hardware-bar-track h-2">
              <div
                className="hardware-bar-fill bg-gradient-to-r from-amber-500 to-orange-400"
                style={{ width: `${disks[0]?.usePercentNum || 32}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>{disks[0]?.usedGB || '120'} GB Used</span>
              <span>{disks[0]?.sizeGB || '512'} GB Total</span>
            </div>
          </div>
        </GlassCard>

        {/* NETWORK TRAFFIC */}
        <GlassCard className="p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Network className="w-4 h-4 text-violet-400" />
              <span>Network I/O</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              {net.activeInterface || 'eth0'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-white/[0.03] p-2 rounded-lg border border-white/5">
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3 text-emerald-400" /> RX
              </span>
              <span className="text-xs font-mono font-bold text-slate-200 block truncate">
                {formatSpeed(net.downloadKbps)}
              </span>
            </div>
            <div className="bg-white/[0.03] p-2 rounded-lg border border-white/5">
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-cyan-400" /> TX
              </span>
              <span className="text-xs font-mono font-bold text-slate-200 block truncate">
                {formatSpeed(net.uploadKbps)}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 3. BOT & AI ECOSYSTEM DECK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* WHATSAPP BOT CARD */}
        <GlassCard className="p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono">WhatsApp Bot (Go)</h3>
                <p className="text-xs text-slate-400">Whatsmeow Gateway Engine</p>
              </div>
            </div>
            <StatusBadge status="active" label="RUNNING" />
          </div>

          <div className="bg-black/30 rounded-xl p-3 border border-white/5 space-y-1.5 text-xs font-mono text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Service:</span>
              <span className="text-white font-semibold">wa-bot-go.service</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Memory:</span>
              <span className="text-emerald-400 font-semibold">~18 MB (Go Native)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mode:</span>
              <span>DM Only (Anti-Group Spam)</span>
            </div>
          </div>

          <button
            onClick={() => handleAction('restart_wa_bot')}
            disabled={runningAction === 'restart_wa_bot'}
            className="tactile-btn w-full py-2 text-xs font-mono text-slate-300 flex items-center justify-center gap-2 hover:text-white"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${runningAction === 'restart_wa_bot' ? 'animate-spin' : ''}`} />
            <span>Restart WhatsApp Bot</span>
          </button>
        </GlassCard>

        {/* TELEGRAM BOT CARD */}
        <GlassCard className="p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono">Telegram Bot (Go)</h3>
                <p className="text-xs text-slate-400">Telebot v3 Architecture</p>
              </div>
            </div>
            <StatusBadge status="active" label="@regsi_bot" />
          </div>

          <div className="bg-black/30 rounded-xl p-3 border border-white/5 space-y-1.5 text-xs font-mono text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Service:</span>
              <span className="text-white font-semibold">agy-telegram.service</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Memory:</span>
              <span className="text-cyan-400 font-semibold">~9.4 MB (Go Native)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Features:</span>
              <span>Whisper STT + AI Multi-Model</span>
            </div>
          </div>

          <button
            onClick={() => handleAction('restart_tg_bot')}
            disabled={runningAction === 'restart_tg_bot'}
            className="tactile-btn w-full py-2 text-xs font-mono text-slate-300 flex items-center justify-center gap-2 hover:text-white"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${runningAction === 'restart_tg_bot' ? 'animate-spin' : ''}`} />
            <span>Restart Telegram Bot</span>
          </button>
        </GlassCard>

        {/* 9ROUTER AI GATEWAY CARD */}
        <GlassCard className="p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono">9Router AI Hub</h3>
                <p className="text-xs text-slate-400">Universal OpenAI Gateway</p>
              </div>
            </div>
            <StatusBadge status="active" label="105 MODELS" />
          </div>

          <div className="bg-black/30 rounded-xl p-3 border border-white/5 space-y-1.5 text-xs font-mono text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Port / Host:</span>
              <span className="text-white font-semibold">127.0.0.1:20128</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Public Domain:</span>
              <span className="text-violet-300">router.apu.web.id</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Protection:</span>
              <span className="text-emerald-400">PIN Gate Active</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('agents')}
            className="tactile-btn w-full py-2 text-xs font-mono text-slate-300 flex items-center justify-center gap-2 hover:text-white"
          >
            <span>Buka AI Model Switcher</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </GlassCard>
      </div>

      {/* 4. REALTIME SPARKLINE AREA CHART */}
      {historyData.length > 1 && (
        <GlassCard className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Live System Load Curve (Last 30 Pulses)</span>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> CPU Load
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> RAM Usage
              </span>
            </div>
          </div>

          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="cpu" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#cpuGradient)" />
                <Area type="monotone" dataKey="ram" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#ramGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
