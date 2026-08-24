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
  ShieldCheck,
  Trash2,
  RotateCcw,
  Network,
  Layers,
  ChevronRight,
  Archive,
  Send,
  Radio,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
  const cpu = systemData?.cpu || { totalUsage: 0, cores: [], model: 'Loading...', freqGhz: 2.5, temperatureC: 45, coreCount: 4 };
  const ram = systemData?.ram || { totalGB: 16, usedGB: 0, freeGB: 0, usagePercent: 0, cachedGB: 0, buffersGB: 0 };
  const swap = systemData?.swap || { totalGB: 8, usedGB: 0, freeGB: 0, usagePercent: 0 };
  const disks = systemData?.disks || [];
  const diskIO = systemData?.diskIO || { readMBps: 0, writeMBps: 0 };
  const net = systemData?.network || { downloadKbps: 0, uploadKbps: 0, activeInterface: 'wlan0', interfaces: [], localIp: '192.168.1.4', tailscaleIp: '100.122.52.32' };
  const temps = systemData?.temperatures || [];
  const healthScore = systemData?.healthScore ?? 100;

  const formatSpeed = (kbps: number) => {
    if (kbps >= 1024) return `${(kbps / 1024).toFixed(2)} MB/s`;
    return `${kbps.toFixed(1)} KB/s`;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Asymmetrical Hero Banner: Doppelrand Architecture */}
      <div className="doppelrand-shell">
        <div className="doppelrand-core relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00f2fe]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full bg-[#00f2fe]/10 border border-[#00f2fe]/30 text-[#00f2fe] text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5" />
                  <span>ARCH LINUX NODE</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981] text-[11px] font-mono font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                  <span>TELEMETRY ACTIVE</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                {sys.hostname || 'archlinux'} <span className="text-slate-500 font-normal text-xl sm:text-2xl">/ Mission Control</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-400 font-mono flex items-center gap-2">
                <span>{sys.kernel || 'Linux 7.x'}</span>
                <span className="text-slate-700">•</span>
                <span>{cpu.model}</span>
                <span className="text-slate-700">•</span>
                <span className="text-[#00f2fe]">{cpu.coreCount} Cores @ {cpu.freqGhz} GHz</span>
              </p>
            </div>

            {/* Quick Badges Stack */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-black/40 border border-white/[0.08] rounded-2xl p-3.5 min-w-[140px]">
                <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">TAILSCALE IP</div>
                <div className="text-[#00f2fe] font-mono font-bold text-sm mt-0.5">{net.tailscaleIp}</div>
              </div>
              <div className="bg-black/40 border border-white/[0.08] rounded-2xl p-3.5 min-w-[140px]">
                <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">LOCAL LAN</div>
                <div className="text-slate-200 font-mono font-bold text-sm mt-0.5">{net.localIp}</div>
              </div>
              <div className="bg-black/40 border border-white/[0.08] rounded-2xl p-3.5 min-w-[140px] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">HEALTH SCORE</div>
                  <div className={`font-mono font-bold text-base mt-0.5 ${healthScore > 80 ? 'text-[#10b981]' : 'text-amber-400'}`}>
                    {healthScore}%
                  </div>
                </div>
                <ShieldCheck className={`w-6 h-6 ${healthScore > 80 ? 'text-[#10b981]' : 'text-amber-400'}`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. The Asymmetrical Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Bento 1: CPU Total & Core Matrix */}
        <div className="doppelrand-shell flex flex-col justify-between">
          <div className="doppelrand-core h-full flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#00f2fe]/10 border border-[#00f2fe]/20 flex items-center justify-center text-[#00f2fe]">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">CPU Compute</h3>
                    <p className="text-[10px] text-slate-400 font-mono">{cpu.coreCount} Cores • {cpu.freqGhz} GHz</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <Thermometer className="w-3 h-3" />
                  <span>{cpu.temperatureC}°C</span>
                </div>
              </div>

              <div className="my-3 flex items-baseline justify-between">
                <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">{cpu.totalUsage}%</span>
                <span className="text-xs text-slate-400 font-mono">Load: {sys.loadAverage ? sys.loadAverage[0] : '0.0'}</span>
              </div>

              {/* Sparkline */}
              <div className="h-14 w-full -mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyData}>
                    <defs>
                      <linearGradient id="bentoCpuGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#00f2fe" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="cpu" stroke="#00f2fe" strokeWidth={2} fillOpacity={1} fill="url(#bentoCpuGrad)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Per Core Usage */}
            {cpu.cores && cpu.cores.length > 0 && (
              <div className="pt-3 border-t border-white/[0.06] grid grid-cols-2 gap-2 text-[10px] font-mono">
                {cpu.cores.map((usage: number, idx: number) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between text-slate-400">
                      <span>C{idx}</span>
                      <span className="text-slate-200">{usage}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          usage > 80 ? 'bg-[#f43f5e]' : usage > 50 ? 'bg-amber-400' : 'bg-[#00f2fe]'
                        }`}
                        style={{ width: `${Math.min(100, usage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bento 2: Memory & Swap */}
        <div className="doppelrand-shell flex flex-col justify-between">
          <div className="doppelrand-core h-full flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center text-[#8b5cf6]">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Memory RAM</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Total: {ram.totalGB} GB</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#8b5cf6] bg-[#8b5cf6]/10 px-2 py-0.5 rounded-full border border-[#8b5cf6]/20">
                  {ram.usagePercent}%
                </span>
              </div>

              <div className="my-3 flex items-baseline justify-between">
                <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                  {ram.usedGB} <span className="text-sm text-slate-500 font-normal">GB</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">Free: {ram.availableGB || ram.freeGB} GB</span>
              </div>

              <div className="h-14 w-full -mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyData}>
                    <defs>
                      <linearGradient id="bentoRamGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="ram" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#bentoRamGrad)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* RAM Breakdown Meters */}
            <div className="pt-3 border-t border-white/[0.06] space-y-2 text-[10px] font-mono">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>RAM Allocated</span>
                  <span>Cache: {ram.cachedGB} GB</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div style={{ width: `${ram.usagePercent}%` }} className="bg-[#8b5cf6]" />
                  <div style={{ width: `${Math.min(100 - ram.usagePercent, (ram.cachedGB / (ram.totalGB || 1)) * 100)}%` }} className="bg-[#8b5cf6]/40" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Swap Usage</span>
                  <span>{swap.usedGB} / {swap.totalGB} GB</span>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div style={{ width: `${swap.usagePercent}%` }} className="bg-indigo-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bento 3: Storage & Disk I/O */}
        <div className="doppelrand-shell flex flex-col justify-between">
          <div className="doppelrand-core h-full flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981]">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Disks & Storage</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Mount: / (Root NVMe/SSD)</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-full border border-[#10b981]/20">
                  {disks[0]?.usagePercent ?? 0}%
                </span>
              </div>

              <div className="my-3 flex items-baseline justify-between">
                <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                  {disks[0]?.usedGB ?? 0} <span className="text-sm text-slate-500 font-normal">GB</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">Free: {disks[0]?.freeGB ?? 0} GB</span>
              </div>

              <div className="bg-black/50 rounded-xl p-2.5 border border-white/[0.06] space-y-1 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1 text-[10px]">
                    <ArrowDownRight className="w-3.5 h-3.5 text-[#10b981]" /> Read IO
                  </span>
                  <span className="text-[#10b981] font-bold">{diskIO.readMBps} MB/s</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1 text-[10px]">
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#00f2fe]" /> Write IO
                  </span>
                  <span className="text-[#00f2fe] font-bold">{diskIO.writeMBps} MB/s</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] space-y-1.5 font-mono text-[10px]">
              {disks.slice(0, 2).map((d: any, i: number) => (
                <div key={i} className="space-y-0.5">
                  <div className="flex justify-between text-slate-400">
                    <span className="truncate max-w-[120px]">{d.mount} ({d.type})</span>
                    <span>{d.usedGB}/{d.totalGB} GB</span>
                  </div>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${d.usagePercent}%` }}
                      className={`h-full ${d.usagePercent > 85 ? 'bg-[#f43f5e]' : 'bg-[#10b981]'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bento 4: Network & Throughput */}
        <div className="doppelrand-shell flex flex-col justify-between">
          <div className="doppelrand-core h-full flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Network className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Network I/O</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Iface: {net.activeInterface}</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                  LIVE
                </span>
              </div>

              <div className="my-3 space-y-1 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <ArrowDownRight className="w-3.5 h-3.5 text-[#10b981]" /> DL
                  </span>
                  <span className="text-xl font-extrabold text-[#10b981]">{formatSpeed(net.downloadKbps)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#00f2fe]" /> UL
                  </span>
                  <span className="text-xl font-extrabold text-[#00f2fe]">{formatSpeed(net.uploadKbps)}</span>
                </div>
              </div>

              <div className="h-14 w-full -mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyData}>
                    <defs>
                      <linearGradient id="bentoNetGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="rxKbps" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#bentoNetGrad)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Mesh: {net.tailscaleIp}</span>
              <span className="text-slate-300 font-bold">{net.interfaces?.length || 1} Interfaces</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Nested CTA Controls & Quick Operations Section */}
      <div className="doppelrand-shell">
        <div className="doppelrand-core space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00f2fe]" />
                Server Ops & Kinetic Actions
              </h3>
              <p className="text-xs text-slate-400">Eksekusi instan pemeliharaan, snapshot backup, dan diagnostik</p>
            </div>
            {isLocked && (
              <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                Otorisasi PIN Diperlukan
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Button-in-Button: Drop Caches */}
            <button
              onClick={() => handleAction('clean_cache')}
              disabled={runningAction === 'clean_cache'}
              className="btn-nested group"
            >
              <span>Drop Caches</span>
              <div className="btn-nested-icon">
                <Trash2 className={`w-3.5 h-3.5 ${runningAction === 'clean_cache' ? 'animate-spin' : ''}`} />
              </div>
            </button>

            {/* Button-in-Button: Trim SSD */}
            <button
              onClick={() => handleAction('trim_ssd')}
              disabled={runningAction === 'trim_ssd'}
              className="btn-nested group"
            >
              <span>Trim SSD</span>
              <div className="btn-nested-icon">
                <HardDrive className={`w-3.5 h-3.5 ${runningAction === 'trim_ssd' ? 'animate-spin' : ''}`} />
              </div>
            </button>

            {/* Button-in-Button: Backup Snapshot */}
            <button
              onClick={() => handleAction('backup_snapshot')}
              disabled={runningAction === 'backup_snapshot'}
              className="btn-nested group"
            >
              <span>Snapshot Backup</span>
              <div className="btn-nested-icon">
                <Archive className={`w-3.5 h-3.5 ${runningAction === 'backup_snapshot' ? 'animate-spin' : ''}`} />
              </div>
            </button>

            {/* Button-in-Button: Test TG Alert */}
            <button
              onClick={() => handleAction('test_telegram_alert')}
              disabled={runningAction === 'test_telegram_alert'}
              className="btn-nested group"
            >
              <span>Test TG Alert</span>
              <div className="btn-nested-icon">
                <Send className={`w-3.5 h-3.5 ${runningAction === 'test_telegram_alert' ? 'animate-spin' : ''}`} />
              </div>
            </button>

            {/* Button-in-Button: Diagnostic */}
            <button
              onClick={() => handleAction('system_diagnostic')}
              disabled={runningAction === 'system_diagnostic'}
              className="btn-nested group"
            >
              <span>Diagnostic</span>
              <div className="btn-nested-icon">
                <Activity className={`w-3.5 h-3.5 ${runningAction === 'system_diagnostic' ? 'animate-spin' : ''}`} />
              </div>
            </button>

            {/* Button-in-Button: Open Terminal */}
            <button
              onClick={() => onNavigateTab('terminal')}
              className="btn-nested group"
            >
              <span>Terminal CLI</span>
              <div className="btn-nested-icon">
                <ChevronRight className="w-3.5 h-3.5 text-[#00f2fe]" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Secondary Bento Row: Load Average & Thermals & Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Load Average */}
        <div className="doppelrand-shell">
          <div className="doppelrand-core space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00f2fe]" />
              Load Average & Schedulers
            </h3>

            <div className="grid grid-cols-3 gap-2.5 my-2 font-mono text-center">
              <div className="bg-black/50 border border-white/[0.06] rounded-xl p-3">
                <div className="text-[10px] text-slate-500 mb-0.5">1 MIN</div>
                <div className="text-lg font-extrabold text-[#00f2fe]">{sys.loadAverage ? sys.loadAverage[0] : '0.00'}</div>
              </div>
              <div className="bg-black/50 border border-white/[0.06] rounded-xl p-3">
                <div className="text-[10px] text-slate-500 mb-0.5">5 MIN</div>
                <div className="text-lg font-extrabold text-[#00f2fe]">{sys.loadAverage ? sys.loadAverage[1] : '0.00'}</div>
              </div>
              <div className="bg-black/50 border border-white/[0.06] rounded-xl p-3">
                <div className="text-[10px] text-slate-500 mb-0.5">15 MIN</div>
                <div className="text-lg font-extrabold text-[#00f2fe]">{sys.loadAverage ? sys.loadAverage[2] : '0.00'}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06] space-y-1.5 text-xs font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Active Tasks:</span>
                <span className="text-[#10b981] font-bold">{sys.runningProcesses || 1} running</span>
              </div>
              <div className="flex justify-between">
                <span>Total Threads:</span>
                <span className="text-slate-200 font-bold">{sys.totalProcesses || 150} processes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thermal Sensors */}
        <div className="doppelrand-shell">
          <div className="doppelrand-core space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-amber-400" />
              Thermal Matrix
            </h3>

            <div className="space-y-2 font-mono text-xs my-2">
              {temps.map((t: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-black/50 border border-white/[0.06]">
                  <span className="text-slate-300">{t.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${t.tempC > 75 ? 'text-[#f43f5e]' : t.tempC > 60 ? 'text-amber-400' : 'text-[#10b981]'}`}>
                      {t.tempC}°C
                    </span>
                    <span className={`w-2 h-2 rounded-full ${t.tempC > 75 ? 'bg-[#f43f5e] animate-pulse' : 'bg-[#10b981]'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Core Ecosystem Pulse */}
        <div className="doppelrand-shell">
          <div className="doppelrand-core space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#8b5cf6]" />
                Ecosystem Pulse
              </h3>
              <button
                onClick={() => onNavigateTab('watchdog')}
                className="text-[10px] text-[#00f2fe] hover:underline font-mono"
              >
                Watchdog →
              </button>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/50 border border-white/[0.06]">
                <span className="text-slate-300">9Router AI (:20128)</span>
                <span className="text-[#10b981] font-bold">● ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/50 border border-white/[0.06]">
                <span className="text-slate-300">Caddy Ingress (:80)</span>
                <span className="text-[#10b981] font-bold">● ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/50 border border-white/[0.06]">
                <span className="text-slate-300">Cloudflare Tunnel</span>
                <span className="text-[#10b981] font-bold">● ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/50 border border-white/[0.06]">
                <span className="text-slate-300">Hermes Gateway (:8644)</span>
                <span className="text-[#10b981] font-bold">● ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
