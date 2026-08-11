'use client';

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  HardDrive,
  Thermometer,
  Wifi,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Layers,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Database,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface HardwareTabProps {
  systemData: any;
  refreshing: boolean;
  onManualRefresh: () => void;
  error?: string | null;
  onRetry?: () => void;
}

export const HardwareTab: React.FC<HardwareTabProps> = ({
  systemData,
  refreshing,
  onManualRefresh,
  error,
  onRetry,
}) => {
  const [chartHistory, setChartHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!systemData) return;

    const timer = setTimeout(() => {
      const nowString = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const newPoint = {
        time: nowString,
        cpu: systemData.cpu?.usagePercent || 0,
        ram: systemData.ram?.usagePercent || 0,
        temp: systemData.temperature?.currentC || 0,
        netDown: Math.round((systemData.network?.downloadKbps || 0) / 1024),
        diskIO: systemData.diskIO?.readMBps || 0,
      };

      setChartHistory((prev) => [...prev, newPoint].slice(-15));
    }, 0);

    return () => clearTimeout(timer);
  }, [systemData]);

  if (!systemData) {
    if (error) {
      return (
        <div className="border border-rose-500/30 bg-rose-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-rose-300">Gagal memuat data sistem</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Server tidak merespons. Periksa koneksi lalu coba lagi.
              </p>
            </div>
          </div>
          <button
            onClick={onRetry}
            disabled={refreshing}
            className="px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-all disabled:opacity-50"
          >
            Coba lagi
          </button>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#22d3ee]" />
        <p className="text-sm font-medium">Memuat data sensor Arch Linux Server...</p>
      </div>
    );
  }

  const { cpu, ram, hdd, temperature, network, diskIO, services } =
    systemData;

  return (
    <div className="space-y-6">
      {error && (
        <div className="border border-rose-500/30 bg-rose-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <p className="text-sm font-semibold text-rose-300">
              Gagal memperbarui data sistem (menampilkan data terakhir)
            </p>
          </div>
          <button
            onClick={onRetry}
            disabled={refreshing}
            className="px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-all disabled:opacity-50"
          >
            Coba lagi
          </button>
        </div>
      )}
      {/* Top Action & Server Banner */}
      <div className="bento-premium flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 md:p-6 mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700 pointer-events-none" />
        <div className="flex items-center gap-5 z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#22d3ee] shadow-inner">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight-super">
                apu-arch-server
              </h2>
              <span className="px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest bg-white/10 text-white/80 border border-white/5">
                {systemData.os}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1.5 flex items-center gap-4 flex-wrap font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" /> Uptime: {systemData.uptime}
              </span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1.5 text-emerald-400/90">
                <Database className="w-4 h-4" /> SQLite WAL Mode
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto z-10">
          <button
            onClick={onManualRefresh}
            disabled={refreshing}
            className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 transition-all disabled:opacity-50 flex items-center gap-2 text-sm active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#22d3ee]' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metric Cards Grid — Asymmetric layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 mb-8">
        
        {/* CPU Card — Wide 7 cols */}
        <div className="md:col-span-7 bento-premium p-6 md:p-8 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#22d3ee]/5 rounded-full blur-2xl group-hover:bg-[#22d3ee]/10 transition-all duration-700 pointer-events-none" />
          <div className="flex items-center justify-between mb-8">
            <span className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#22d3ee]" /> CPU Compute
            </span>
            <span className="text-xs font-mono font-medium text-slate-500 bg-black/30 px-3 py-1 rounded-full">{cpu?.cores} Cores</span>
          </div>
          <div>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-2">
              <span className="text-5xl md:text-7xl font-black text-white font-mono tracking-tighter leading-none">
                {cpu?.usagePercent}%
              </span>
              <span className="text-sm text-slate-400 truncate w-full md:max-w-[200px] md:text-right font-medium" title={cpu?.model}>
                {cpu?.model || 'CPU'}
              </span>
            </div>
            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
              <div
                className={`h-full transition-all duration-700 ease-out ${
                  cpu?.usagePercent > 80 ? 'bg-rose-500' : cpu?.usagePercent > 50 ? 'bg-amber-400' : 'bg-[#22d3ee]'
                }`}
                style={{ width: `${cpu?.usagePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Temperature Card — Tall 5 cols */}
        <div className="md:col-span-5 bento-premium p-6 md:p-8 flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Thermometer className={`w-5 h-5 ${temperature?.currentC > 65 ? 'text-amber-400' : 'text-emerald-400'}`} />
              Thermals
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">lm_sensors</span>
          </div>
          <div className="text-center py-4">
            <div className={`text-6xl md:text-7xl font-black font-mono tracking-tighter mb-2 ${
                temperature?.currentC > 70 ? 'text-rose-400' : temperature?.currentC > 60 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
              {temperature?.currentC}°
            </div>
            <div className="text-sm font-medium text-slate-400 uppercase tracking-widest">
              {temperature?.currentC > 70 ? 'High Load' : 'Optimal'}
            </div>
          </div>
        </div>

        {/* RAM Card — 4 cols */}
        <div className="md:col-span-4 bento-premium p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" /> Memory
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-white font-mono mb-1">{ram?.usagePercent}%</div>
            <div className="text-xs text-emerald-400/80 font-mono mb-4">
              {ram?.usedGB} / {ram?.totalGB} GB
            </div>
            <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-emerald-400 transition-all duration-700" style={{ width: `${ram?.usagePercent}%` }} />
            </div>
          </div>
        </div>

        {/* Network Traffic — 8 cols */}
        <div className="md:col-span-8 bento-premium p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-[#22d3ee]" /> Network Flow
            </span>
            <span className="text-[10px] font-mono text-slate-500 bg-black/30 px-2 py-1 rounded-full">{network?.interface}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="flex flex-col justify-end p-4 rounded-2xl bg-black/20 border border-white/5">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">
                <ArrowDownRight className="w-4 h-4 text-emerald-400" /> Ingress
              </div>
              <div className="text-3xl font-black text-white font-mono">
                {(network?.downloadKbps / 1024).toFixed(2)} <span className="text-sm font-medium text-slate-500">MB/s</span>
              </div>
            </div>
            <div className="flex flex-col justify-end p-4 rounded-2xl bg-black/20 border border-white/5">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">
                <ArrowUpRight className="w-4 h-4 text-[#22d3ee]" /> Egress
              </div>
              <div className="text-3xl font-black text-white font-mono">
                {(network?.uploadKbps / 1024).toFixed(2)} <span className="text-sm font-medium text-slate-500">MB/s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disk I/O — 12 cols (Full width at bottom) */}
        <div className="md:col-span-12 bento-premium p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-sky-400" /> Disk I/O & Storage
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-widest font-bold">
              WAL Active
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0">
            <div className="flex flex-col justify-end md:pr-6 pb-6 md:pb-0 border-b md:border-b-0 md:border-r border-white/5">
              <div className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-widest">HDD Space</div>
              <div className="text-3xl md:text-4xl font-black text-white font-mono tracking-tighter">
                {hdd?.usagePercent}% <span className="text-sm font-medium text-slate-500 tracking-normal">Used</span>
              </div>
              <div className="text-xs text-sky-400 font-mono mt-1">{hdd?.freeTB} TB Free</div>
            </div>
            <div className="flex flex-col justify-end md:px-6 pb-6 md:pb-0 border-b md:border-b-0 md:border-r border-white/5">
              <div className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-widest">Read Rate</div>
              <div className="text-3xl md:text-4xl font-black text-white font-mono tracking-tighter">
                {diskIO?.readMBps} <span className="text-sm font-medium text-slate-500 tracking-normal">MB/s</span>
              </div>
            </div>
            <div className="flex flex-col justify-end md:pl-6">
              <div className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-widest">Write Rate</div>
              <div className="text-3xl md:text-4xl font-black text-white font-mono tracking-tighter">
                {diskIO?.writeMBps} <span className="text-sm font-medium text-slate-500 tracking-normal">MB/s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Time Series Chart */}
      <div className="border border-slate-700/50 bg-slate-900/50 p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="min-w-0">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 flex-wrap">
              <Activity className="w-4 h-4 text-[#22d3ee] flex-shrink-0" />
              Real-time Performance Telemetry (Last 15 ticks)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitor CPU %, RAM %, Temperature °C & Network Speed in real-time
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#22d3ee]" /> CPU</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> RAM</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Temp</span>
          </div>
        </div>

        {chartHistory.length < 2 ? (
          <div className="h-40 rounded-xl border border-dashed border-slate-700/70 flex flex-col items-center justify-center gap-2 text-slate-500">
            <Activity className="w-6 h-6 text-slate-600" />
            <p className="text-xs">Menunggu data telemetry — chart muncul dalam beberapa detik...</p>
          </div>
        ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartHistory} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172aee',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 8px 24px -4px rgba(0,0,0,0.5)',
                }}
                labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="cpu"
                name="CPU %"
                stroke="#22d3ee"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: '#22d3ee' }}
                fillOpacity={1}
                fill="url(#cpuGrad)"
                isAnimationActive
                animationDuration={400}
              />
              <Area
                type="monotone"
                dataKey="ram"
                name="RAM %"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: '#10b981' }}
                fillOpacity={1}
                fill="url(#ramGrad)"
                isAnimationActive
                animationDuration={400}
              />
              <Area
                type="monotone"
                dataKey="temp"
                name="Temp °C"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: '#38bdf8' }}
                fillOpacity={1}
                fill="url(#tempGrad)"
                isAnimationActive
                animationDuration={400}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        )}
      </div>

      {/* Services Status Grid */}
      <div className="border border-slate-700/50 bg-slate-900/50 p-4 rounded-2xl">
        <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Arch Systemd Services Status
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(services || {}).map(([serviceName, statusText]: [string, any]) => (
            <div
              key={serviceName}
              className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex flex-col justify-between"
            >
              <span className="text-xs font-mono font-semibold text-slate-200 capitalize truncate">
                {serviceName}
              </span>
              <span
                className={`inline-flex items-center gap-1 mt-2 text-[11px] font-medium ${
                  statusText?.startsWith('active') ? 'text-emerald-400' : 'text-rose-400'
                }`}
                title={statusText || 'unknown'}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    statusText?.startsWith('active') ? 'bg-emerald-400' : 'bg-rose-400'
                  } animate-pulse`}
                />
                {statusText || 'unknown'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
