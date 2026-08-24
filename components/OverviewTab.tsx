'use client';

import React, { useState } from 'react';
import {
  Cpu,
  HardDrive,
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  Thermometer,
  Zap,
  Clock,
  Server,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Play,
  RotateCcw,
  Network,
  Layers,
  ChevronRight,
  Archive,
  Send,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

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
      onOpenAuthModal();
      return;
    }
    setRunningAction(action);
    try {
      await onTriggerAction(action);
    } finally {
      setRunningAction(null);
    }
  };

  const sys = systemData?.system || {};
  const cpu = systemData?.cpu || { totalUsage: 0, cores: [], model: 'Loading...', freqGhz: 2.5, temperatureC: 45 };
  const ram = systemData?.ram || { totalGB: 16, usedGB: 0, freeGB: 0, usagePercent: 0, cachedGB: 0, buffersGB: 0 };
  const swap = systemData?.swap || { totalGB: 8, usedGB: 0, freeGB: 0, usagePercent: 0 };
  const disks = systemData?.disks || [];
  const diskIO = systemData?.diskIO || { readMBps: 0, writeMBps: 0 };
  const net = systemData?.network || { downloadKbps: 0, uploadKbps: 0, activeInterface: 'wlan0', interfaces: [], localIp: '192.168.1.4', tailscaleIp: '100.122.52.32' };
  const temps = systemData?.temperatures || [];
  const healthScore = systemData?.healthScore ?? 100;

  // Format network throughput
  const formatSpeed = (kbps: number) => {
    if (kbps >= 1024) return `${(kbps / 1024).toFixed(2)} MB/s`;
    return `${kbps.toFixed(1)} KB/s`;
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner / Server Identity Bar */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-cyan-950/30 border border-white/10 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" />
                <span>ARCH LINUX</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {sys.hostname || 'archlinux'}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-semibold">
                ● ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {sys.kernel || 'Linux 6.x'} • {cpu.model} ({cpu.coreCount || 4} Cores @ {cpu.freqGhz} GHz)
            </p>
          </div>

          {/* Quick IP & Health Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
            <div className="bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2">
              <div className="text-[10px] text-slate-400">TAILSCALE IP</div>
              <div className="text-cyan-400 font-bold">{net.tailscaleIp}</div>
            </div>
            <div className="bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2">
              <div className="text-[10px] text-slate-400">LOCAL LAN</div>
              <div className="text-slate-200 font-bold">{net.localIp}</div>
            </div>
            <div className="bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
              <div>
                <div className="text-[10px] text-slate-400">HEALTH INDEX</div>
                <div className={`font-bold ${healthScore > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {healthScore}%
                </div>
              </div>
              <ShieldCheck className={`w-5 h-5 ${healthScore > 80 ? 'text-emerald-400' : 'text-amber-400'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Main Core Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* 1. CPU Usage Card */}
        <div className="rounded-2xl bg-slate-900/70 border border-white/10 p-5 backdrop-blur-md shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">CPU Total</h3>
                <p className="text-[10px] text-slate-400 font-mono">{cpu.coreCount || 4} Cores • {cpu.freqGhz} GHz</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              <Thermometer className="w-3 h-3" />
              <span>{cpu.temperatureC}°C</span>
            </div>
          </div>

          <div className="my-2 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white font-mono">{cpu.totalUsage}%</span>
            <span className="text-xs text-slate-400 font-mono">Load: {sys.loadAverage ? sys.loadAverage.join(', ') : '-'}</span>
          </div>

          <div className="h-14 w-full -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="cpu" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#cpuGrad)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {cpu.cores && cpu.cores.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                {cpu.cores.map((usage: number, idx: number) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between">
                      <span>C{idx}</span>
                      <span className="text-slate-200">{usage}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          usage > 80 ? 'bg-rose-500' : usage > 50 ? 'bg-amber-400' : 'bg-cyan-400'
                        }`}
                        style={{ width: `${Math.min(100, usage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Memory & Swap Card */}
        <div className="rounded-2xl bg-slate-900/70 border border-white/10 p-5 backdrop-blur-md shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Memory RAM</h3>
                <p className="text-[10px] text-slate-400 font-mono">Total: {ram.totalGB} GB</p>
              </div>
            </div>
            <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
              {ram.usagePercent}%
            </span>
          </div>

          <div className="my-2 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white font-mono">{ram.usedGB} <span className="text-lg text-slate-400 font-normal">GB</span></span>
            <span className="text-xs text-slate-400 font-mono">Free: {ram.availableGB || ram.freeGB} GB</span>
          </div>

          <div className="h-14 w-full -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="ram" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#ramGrad)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>RAM Breakdown</span>
                <span>Cache: {ram.cachedGB} GB</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div style={{ width: `${ram.usagePercent}%` }} className="bg-purple-500 transition-all duration-300" />
                <div style={{ width: `${Math.min(100 - ram.usagePercent, (ram.cachedGB / (ram.totalGB || 1)) * 100)}%` }} className="bg-purple-900" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Swap Usage</span>
                <span>{swap.usedGB} / {swap.totalGB} GB ({swap.usagePercent}%)</span>
              </div>
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div style={{ width: `${swap.usagePercent}%` }} className="bg-indigo-500 transition-all duration-300" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Storage & Disk I/O Card */}
        <div className="rounded-2xl bg-slate-900/70 border border-white/10 p-5 backdrop-blur-md shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Disks & Storage</h3>
                <p className="text-[10px] text-slate-400 font-mono">Mount: / (Root)</p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              {disks[0]?.usagePercent ?? 0}%
            </span>
          </div>

          <div className="my-2 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white font-mono">{disks[0]?.usedGB ?? 0} <span className="text-lg text-slate-400 font-normal">GB</span></span>
            <span className="text-xs text-slate-400 font-mono">Free: {disks[0]?.freeGB ?? 0} GB</span>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-2.5 border border-white/5 space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px] flex items-center gap-1">
                <ArrowDownCircle className="w-3 h-3 text-emerald-400" /> Read
              </span>
              <span className="text-emerald-400 font-bold">{diskIO.readMBps} MB/s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px] flex items-center gap-1">
                <ArrowUpCircle className="w-3 h-3 text-cyan-400" /> Write
              </span>
              <span className="text-cyan-400 font-bold">{diskIO.writeMBps} MB/s</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
            {disks.slice(0, 2).map((d: any, i: number) => (
              <div key={i} className="text-[10px] font-mono text-slate-400">
                <div className="flex justify-between mb-0.5">
                  <span className="truncate max-w-[120px]">{d.mount} ({d.type})</span>
                  <span>{d.usedGB}/{d.totalGB} GB</span>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${d.usagePercent}%` }}
                    className={`h-full ${d.usagePercent > 85 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Network & Ingress Throughput Card */}
        <div className="rounded-2xl bg-slate-900/70 border border-white/10 p-5 backdrop-blur-md shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Network className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Network I/O</h3>
                <p className="text-[10px] text-slate-400 font-mono">Iface: {net.activeInterface}</p>
              </div>
            </div>
            <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
              RX/TX
            </span>
          </div>

          <div className="my-2 space-y-1">
            <div className="flex items-center justify-between font-mono">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-400" /> DL
              </span>
              <span className="text-xl font-bold text-emerald-400">{formatSpeed(net.downloadKbps)}</span>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ArrowUpCircle className="w-3.5 h-3.5 text-cyan-400" /> UL
              </span>
              <span className="text-xl font-bold text-cyan-400">{formatSpeed(net.uploadKbps)}</span>
            </div>
          </div>

          <div className="h-14 w-full -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="rxKbps" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#netGrad)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Tailscale: {net.tailscaleIp}</span>
            <span className="text-slate-300 font-bold">{net.interfaces?.length || 1} Interfaces</span>
          </div>
        </div>
      </div>

      {/* Quick Server Control Actions Bar */}
      <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-4 sm:p-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Quick Server Controls & Maintenance
            </h3>
            <p className="text-xs text-slate-400">Eksekusi cepat perintah optimasi, snapshot backup, dan pemeliharaan server</p>
          </div>
          {isLocked && (
            <span className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
              Aksi memerlukan otorisasi Master PIN
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => handleAction('clean_cache')}
            disabled={runningAction === 'clean_cache'}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 text-xs font-semibold text-slate-200 hover:text-cyan-300 transition-all active:scale-95 disabled:opacity-50"
          >
            <Trash2 className={`w-3.5 h-3.5 ${runningAction === 'clean_cache' ? 'animate-spin' : 'text-cyan-400'}`} />
            <span>Drop Caches</span>
          </button>

          <button
            onClick={() => handleAction('trim_ssd')}
            disabled={runningAction === 'trim_ssd'}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/30 text-xs font-semibold text-slate-200 hover:text-emerald-300 transition-all active:scale-95 disabled:opacity-50"
          >
            <HardDrive className={`w-3.5 h-3.5 ${runningAction === 'trim_ssd' ? 'animate-spin' : 'text-emerald-400'}`} />
            <span>Trim SSD</span>
          </button>

          <button
            onClick={() => handleAction('backup_snapshot')}
            disabled={runningAction === 'backup_snapshot'}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 text-xs font-semibold text-slate-200 hover:text-purple-300 transition-all active:scale-95 disabled:opacity-50"
          >
            <Archive className={`w-3.5 h-3.5 ${runningAction === 'backup_snapshot' ? 'animate-spin' : 'text-purple-400'}`} />
            <span>Backup Snapshot</span>
          </button>

          <button
            onClick={() => handleAction('test_telegram_alert')}
            disabled={runningAction === 'test_telegram_alert'}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 text-xs font-semibold text-slate-200 hover:text-blue-300 transition-all active:scale-95 disabled:opacity-50"
          >
            <Send className={`w-3.5 h-3.5 ${runningAction === 'test_telegram_alert' ? 'animate-spin' : 'text-blue-400'}`} />
            <span>Test TG Alert</span>
          </button>

          <button
            onClick={() => handleAction('system_diagnostic')}
            disabled={runningAction === 'system_diagnostic'}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/30 text-xs font-semibold text-slate-200 hover:text-amber-300 transition-all active:scale-95 disabled:opacity-50"
          >
            <Activity className={`w-3.5 h-3.5 ${runningAction === 'system_diagnostic' ? 'animate-spin' : 'text-amber-400'}`} />
            <span>Diagnostic</span>
          </button>

          <button
            onClick={() => onNavigateTab('terminal')}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-xs font-semibold text-slate-200 hover:text-rose-300 transition-all active:scale-95"
          >
            <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
            <span>Open Terminal</span>
          </button>
        </div>
      </div>

      {/* Grid: System Vitals Breakdown & Thermal Sensors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Load Average & Process Stats */}
        <div className="rounded-2xl bg-slate-900/70 border border-white/10 p-5 backdrop-blur-md">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Load Average & Tasks
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center my-3 font-mono">
            <div className="bg-slate-950/80 border border-white/5 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 mb-1">1 MIN</div>
              <div className="text-lg font-bold text-cyan-400">{sys.loadAverage ? sys.loadAverage[0] : '0.00'}</div>
            </div>
            <div className="bg-slate-950/80 border border-white/5 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 mb-1">5 MIN</div>
              <div className="text-lg font-bold text-cyan-400">{sys.loadAverage ? sys.loadAverage[1] : '0.00'}</div>
            </div>
            <div className="bg-slate-950/80 border border-white/5 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 mb-1">15 MIN</div>
              <div className="text-lg font-bold text-cyan-400">{sys.loadAverage ? sys.loadAverage[2] : '0.00'}</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Running Tasks:</span>
              <span className="text-emerald-400 font-bold">{sys.runningProcesses || 1} running</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Total Process Threads:</span>
              <span className="text-slate-200 font-bold">{sys.totalProcesses || 150} processes</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>System Uptime:</span>
              <span className="text-slate-200">{sys.uptime}</span>
            </div>
          </div>
        </div>

        {/* Thermal Sensors */}
        <div className="rounded-2xl bg-slate-900/70 border border-white/10 p-5 backdrop-blur-md">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-amber-400" />
            Thermal Sensors
          </h3>
          <div className="space-y-2.5 my-2">
            {temps.map((t: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-white/5 font-mono text-xs">
                <span className="text-slate-300">{t.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${t.tempC > 75 ? 'text-rose-400' : t.tempC > 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {t.tempC}°C
                  </span>
                  <span className={`w-2 h-2 rounded-full ${t.tempC > 75 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Microservices Pulse */}
        <div className="rounded-2xl bg-slate-900/70 border border-white/10 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Ecosystem Pulse
            </h3>
            <button
              onClick={() => onNavigateTab('watchdog')}
              className="text-[10px] text-cyan-400 hover:underline font-mono"
            >
              View Watchdog →
            </button>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-white/5">
              <span className="text-slate-300">9Router AI Gateway (:20128)</span>
              <span className="text-emerald-400 font-bold">● ACTIVE</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-white/5">
              <span className="text-slate-300">Caddy Reverse Proxy (:80)</span>
              <span className="text-emerald-400 font-bold">● ACTIVE</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-white/5">
              <span className="text-slate-300">Cloudflare Tunnel Ingress</span>
              <span className="text-emerald-400 font-bold">● ACTIVE</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-white/5">
              <span className="text-slate-300">Hermes Agent Gateway (:8644)</span>
              <span className="text-emerald-400 font-bold">● ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
