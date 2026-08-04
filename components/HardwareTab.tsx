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
        <div className="floating-card border-rose-500/40 bg-rose-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-6">
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
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6B2C] text-white hover:bg-[#E85D0B] shadow-lg shadow-[#FF6B2C]/30 transition-all disabled:opacity-50"
          >
            Coba lagi
          </button>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#FF6B2C]" />
        <p className="text-sm font-medium">Memuat data sensor Arch Linux Server...</p>
      </div>
    );
  }

  const { cpu, ram, hdd, temperature, network, diskIO, services } =
    systemData;

  return (
    <div className="space-y-6">
      {error && (
        <div className="floating-card border-rose-500/40 bg-rose-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <p className="text-sm font-semibold text-rose-300">
              Gagal memperbarui data sistem (menampilkan data terakhir)
            </p>
          </div>
          <button
            onClick={onRetry}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6B2C] text-white hover:bg-[#E85D0B] shadow-lg shadow-[#FF6B2C]/30 transition-all disabled:opacity-50"
          >
            Coba lagi
          </button>
        </div>
      )}
      {/* Top Action & Server Banner */}
      <div className="floating-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-800/80">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FF6B2C]/10 border border-[#FF6B2C]/30 flex items-center justify-center text-[#FF6B2C]">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                apu-arch-server
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#FF6B2C]/20 text-[#FF8A4C] border border-[#FF6B2C]/30">
                {systemData.os}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> Uptime: {systemData.uptime}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Database className="w-3.5 h-3.5" /> SQLite WAL Mode Active (HDD Optimized)
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={onManualRefresh}
            disabled={refreshing}
            aria-label="Muat ulang data"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all disabled:opacity-50"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#FF6B2C]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-4">
        {/* CPU Card */}
        <div className="floating-card relative overflow-hidden h-full stagger-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#FF6B2C]" /> CPU Usage
            </span>
            <span className="text-xs font-mono text-slate-500">{cpu?.cores} Cores</span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {cpu?.usagePercent}%
            </span>
            <span className="text-xs text-slate-400 truncate max-w-[140px]" title={cpu?.model}>
              {cpu?.model || 'CPU'}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="progress-track">
            <div
              className={`progress-bar ${
                cpu?.usagePercent > 80
                  ? 'bar-red'
                  : cpu?.usagePercent > 50
                  ? 'bar-amber'
                  : 'progress-bar'
              }`}
              style={{ width: `${cpu?.usagePercent}%` }}
            />
          </div>
        </div>

        {/* RAM Card */}
        <div className="floating-card relative overflow-hidden h-full stagger-in glow-green">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" /> RAM Memory
            </span>
            <span className="text-xs font-mono text-slate-500">
              {ram?.usedGB} / {ram?.totalGB} GB
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {ram?.usagePercent}%
            </span>
            <span className="text-xs text-emerald-400 font-mono">
              {(ram?.totalGB - ram?.usedGB).toFixed(1)} GB Free
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-bar bar-green"
              style={{ width: `${ram?.usagePercent}%` }}
            />
          </div>
        </div>

        {/* HDD Storage Card */}
        <div className="floating-card relative overflow-hidden h-full stagger-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-sky-400" /> HDD Storage
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
              WAL MODE
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {hdd?.usagePercent}%
            </span>
            <span className="text-xs text-slate-400">
              {hdd?.freeTB} TB Free of {hdd?.totalTB} TB
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-bar bar-sky"
              style={{ width: `${hdd?.usagePercent}%` }}
            />
          </div>
        </div>

        {/* Temperature Card */}
        <div className="floating-card relative overflow-hidden h-full">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Thermometer
                className={`w-4 h-4 ${
                  temperature?.currentC > 65 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              />{' '}
              CPU Temperature
            </span>
            <span className="text-[10px] font-mono text-slate-500">lm_sensors</span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span
              className={`text-2xl sm:text-3xl font-extrabold font-mono ${
                temperature?.currentC > 70
                  ? 'text-red-400'
                  : temperature?.currentC > 60
                  ? 'text-amber-300'
                  : 'text-emerald-400'
              }`}
            >
              {temperature?.currentC} °C
            </span>
            <span className="text-xs text-slate-400">
              {temperature?.currentC > 70 ? 'High Load' : 'Optimal Thermal'}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                temperature?.currentC > 70
                  ? 'bg-red-500'
                  : temperature?.currentC > 60
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min((temperature?.currentC / 90) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Network & Disk I/O Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Network Traffic */}
        <div className="floating-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-[#FF6B2C]" />
              <h3 className="font-bold text-white text-sm">Network Traffic Speed</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">{network?.interface}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <ArrowDownRight className="w-4 h-4 text-emerald-400" /> Download
              </div>
              <div className="text-2xl font-mono font-bold text-white">
                {(network?.downloadKbps / 1024).toFixed(2)}{' '}
                <span className="text-xs font-normal text-slate-400">MB/s</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <ArrowUpRight className="w-4 h-4 text-[#FF6B2C]" /> Upload
              </div>
              <div className="text-2xl font-mono font-bold text-white">
                {(network?.uploadKbps / 1024).toFixed(2)}{' '}
                <span className="text-xs font-normal text-slate-400">MB/s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disk I/O WAL Mode Status */}
        <div className="floating-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-sky-400" />
              <h3 className="font-bold text-white text-sm">HDD Disk I/O & WAL Mode</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              WAL ACTIVE
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-xs text-slate-400 mb-1">Disk Read Rate</div>
              <div className="text-2xl font-mono font-bold text-sky-400">
                {diskIO?.readMBps}{' '}
                <span className="text-xs font-normal text-slate-400">MB/s</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-xs text-slate-400 mb-1">Disk Write Rate</div>
              <div className="text-2xl font-mono font-bold text-[#FF6B2C]">
                {diskIO?.writeMBps}{' '}
                <span className="text-xs font-normal text-slate-400">MB/s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Time Series Chart */}
      <div className="floating-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FF6B2C]" />
              Real-time Performance Telemetry (Last 15 ticks)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitor CPU %, RAM %, Temperature °C & Network Speed in real-time
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF6B2C]" /> CPU</span>
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
                  <stop offset="5%" stopColor="#FF6B2C" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#FF6B2C" stopOpacity={0.0} />
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
                  backdropFilter: 'blur(8px)',
                }}
                labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="cpu"
                name="CPU %"
                stroke="#FF6B2C"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: '#FF6B2C' }}
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
      <div className="floating-card">
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
