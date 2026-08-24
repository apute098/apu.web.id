'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  RotateCcw,
  Square,
  Play,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Bot,
  Globe,
  HardDrive,
  Cpu,
  RefreshCw,
  Plus,
} from 'lucide-react';

interface ServicesTabProps {
  isLocked: boolean;
  onOpenAuthModal: () => void;
  onOpenLogModal: (unit: string) => void;
}

export function ServicesTab({
  isLocked,
  onOpenAuthModal,
  onOpenLogModal,
}: ServicesTabProps) {
  const [services, setServices] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ total: 0, active: 0, failed: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [customUnit, setCustomUnit] = useState('');
  const [customScope, setCustomScope] = useState<'system' | 'user'>('system');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
        setSummary(data.summary || {});
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    const interval = setInterval(fetchServices, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleServiceAction = async (unit: string, action: 'start' | 'stop' | 'restart', scope: 'system' | 'user') => {
    if (isLocked) {
      onOpenAuthModal();
      return;
    }

    const token = localStorage.getItem('apu_admin_token') || '574409';
    setActionInProgress(`${unit}-${action}`);

    try {
      const res = await fetch('/api/v1/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ unit, action, scope }),
      });

      if (res.ok) {
        await fetchServices();
      } else {
        const json = await res.json();
        alert(`Gagal: ${json.error || 'Terjadi kesalahan'}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.unit.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All Services', icon: Layers },
    { id: 'ai', label: 'AI Hub & Models', icon: Bot },
    { id: 'web', label: 'Web & Ingress', icon: Globe },
    { id: 'bot', label: 'Bots & Messaging', icon: Zap },
    { id: 'core', label: 'Core Daemons', icon: Cpu },
    { id: 'network', label: 'Network & Mesh', icon: HardDrive },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Category Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Systemd Services Controller
          </h2>
          <p className="text-xs text-slate-400">
            Kendali penuh unit systemd (System & User Scope) untuk 9Router, Caddy, Cloudflare, AI Engines & Bots
          </p>
        </div>

        {/* Stats Summary Pills */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 text-slate-300">
            Total: <strong>{summary.total}</strong>
          </span>
          <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            Active: <strong>{summary.active}</strong>
          </span>
          {summary.failed > 0 && (
            <span className="px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-pulse">
              Failed: <strong>{summary.failed}</strong>
            </span>
          )}
          <button
            onClick={fetchServices}
            className="p-1.5 rounded-lg bg-slate-900 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-cyan-400"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Controls Bar: Search & Category Tabs */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari service (nama, unit, deskripsi)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-white/10 focus:border-cyan-400 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none font-mono transition-all"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((svc) => {
          const isActive = svc.status === 'active';
          const isFailed = svc.status === 'failed';
          const isActivating = svc.status === 'activating';
          const isRestarting = actionInProgress === `${svc.unit}-restart`;
          const isStopping = actionInProgress === `${svc.unit}-stop`;
          const isStarting = actionInProgress === `${svc.unit}-start`;

          return (
            <div
              key={svc.unit}
              className={`rounded-2xl border p-5 backdrop-blur-md transition-all flex flex-col justify-between ${
                isFailed
                  ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/30'
                  : isActive
                  ? 'bg-slate-900/70 border-white/10 hover:border-cyan-500/30'
                  : 'bg-slate-950/60 border-white/5 opacity-75'
              }`}
            >
              {/* Card Top */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
                      {svc.name}
                    </h3>
                    <div className="text-[11px] font-mono text-cyan-400/80">{svc.unit}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isActive
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                        : isFailed
                        ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400 animate-pulse'
                        : isActivating
                        ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                        : 'bg-slate-800 border border-slate-700 text-slate-400'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? 'bg-emerald-400' : isFailed ? 'bg-rose-400' : 'bg-slate-400'
                      }`}
                    />
                    {svc.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 my-2 leading-relaxed">
                  {svc.description}
                </p>

                {/* Metadata Row */}
                <div className="grid grid-cols-3 gap-2 my-3 py-2 border-y border-white/5 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[9px]">SCOPE</span>
                    <span className="text-slate-300 font-bold uppercase">{svc.scope}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">MEMORY</span>
                    <span className="text-slate-300 font-bold">{svc.memoryMB ? `${svc.memoryMB} MB` : '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">PID / UP</span>
                    <span className="text-slate-300 font-bold">{svc.pid ? `#${svc.pid}` : svc.uptime || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => handleServiceAction(svc.unit, 'restart', svc.scope)}
                  disabled={isRestarting || isStopping || isStarting}
                  title="Restart Service"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 text-xs font-semibold text-slate-200 hover:text-cyan-300 transition-all active:scale-95 disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isRestarting ? 'animate-spin text-cyan-400' : 'text-cyan-400'}`} />
                  <span>Restart</span>
                </button>

                {isActive ? (
                  <button
                    onClick={() => handleServiceAction(svc.unit, 'stop', svc.scope)}
                    disabled={isStopping || isRestarting}
                    title="Stop Service"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-slate-300 hover:text-rose-400 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Square className={`w-3.5 h-3.5 ${isStopping ? 'animate-pulse text-rose-400' : 'text-rose-400'}`} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleServiceAction(svc.unit, 'start', svc.scope)}
                    disabled={isStarting || isRestarting}
                    title="Start Service"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-400 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 ${isStarting ? 'animate-pulse text-emerald-400' : 'text-emerald-400'}`} />
                  </button>
                )}

                <button
                  onClick={() => onOpenLogModal(svc.unit)}
                  title="View Service Journal Logs"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 text-slate-300 hover:text-purple-400 transition-all active:scale-95"
                >
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
