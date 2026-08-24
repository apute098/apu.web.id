'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  RotateCcw,
  Square,
  Play,
  FileText,
  Bot,
  Globe,
  HardDrive,
  Cpu,
  RefreshCw,
  Zap,
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
    { id: 'ai', label: 'AI Hub', icon: Bot },
    { id: 'web', label: 'Ingress & Web', icon: Globe },
    { id: 'bot', label: 'Bots & Agents', icon: Zap },
    { id: 'core', label: 'Core Daemons', icon: Cpu },
    { id: 'network', label: 'Mesh & Proxy', icon: HardDrive },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-[#00f2fe]" />
            Systemd Services Controller
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Direct controller for System & User systemd daemons (9Router, Caddy, Cloudflare, Hermes, MiMo)
          </p>
        </div>

        {/* Stats Summary Badges */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-300">
            Total: <strong className="text-white">{summary.total}</strong>
          </span>
          <span className="px-3.5 py-1 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981]">
            Active: <strong>{summary.active}</strong>
          </span>
          {summary.failed > 0 && (
            <span className="px-3.5 py-1 rounded-full bg-[#f43f5e]/15 border border-[#f43f5e]/30 text-[#f43f5e] animate-pulse">
              Failed: <strong>{summary.failed}</strong>
            </span>
          )}
          <button
            onClick={fetchServices}
            className="p-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-300 hover:text-[#00f2fe] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00f2fe]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  isActive
                    ? 'bg-[#00f2fe]/15 text-[#00f2fe] border border-[#00f2fe]/40 shadow-sm shadow-[#00f2fe]/20'
                    : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-white/[0.06]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter unit (name, desc)..."
            className="w-full pl-9 pr-4 py-2 bg-black/50 border border-white/[0.08] focus:border-[#00f2fe] rounded-full text-xs text-white placeholder:text-slate-500 outline-none font-mono transition-all"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
        </div>
      </div>

      {/* Services Grid with Doppelrand Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredServices.map((svc) => {
          const isActive = svc.status === 'active';
          const isFailed = svc.status === 'failed';
          const isActivating = svc.status === 'activating';
          const isRestarting = actionInProgress === `${svc.unit}-restart`;
          const isStopping = actionInProgress === `${svc.unit}-stop`;
          const isStarting = actionInProgress === `${svc.unit}-start`;

          return (
            <div key={svc.unit} className="doppelrand-shell flex flex-col justify-between">
              <div className="doppelrand-core h-full flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-extrabold text-white text-sm tracking-tight">{svc.name}</h3>
                      <div className="text-[11px] font-mono text-[#00f2fe]/90">{svc.unit}</div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981]'
                          : isFailed
                          ? 'bg-[#f43f5e]/15 border border-[#f43f5e]/30 text-[#f43f5e] animate-pulse'
                          : isActivating
                          ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                          : 'bg-slate-800 border border-slate-700 text-slate-400'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActive ? 'bg-[#10b981]' : isFailed ? 'bg-[#f43f5e]' : 'bg-slate-400'
                        }`}
                      />
                      {svc.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 my-2 leading-relaxed">
                    {svc.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 my-3 py-2 border-y border-white/[0.06] font-mono text-[11px]">
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

                {/* Control Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleServiceAction(svc.unit, 'restart', svc.scope)}
                    disabled={isRestarting || isStopping || isStarting}
                    className="flex-1 btn-nested group"
                  >
                    <span>Restart</span>
                    <div className="btn-nested-icon">
                      <RotateCcw className={`w-3.5 h-3.5 ${isRestarting ? 'animate-spin' : 'text-[#00f2fe]'}`} />
                    </div>
                  </button>

                  {isActive ? (
                    <button
                      onClick={() => handleServiceAction(svc.unit, 'stop', svc.scope)}
                      disabled={isStopping || isRestarting}
                      className="p-2.5 rounded-full bg-white/[0.04] hover:bg-[#f43f5e]/20 border border-white/[0.08] text-slate-400 hover:text-[#f43f5e] transition-colors"
                      title="Stop Unit"
                    >
                      <Square className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleServiceAction(svc.unit, 'start', svc.scope)}
                      disabled={isStarting || isRestarting}
                      className="p-2.5 rounded-full bg-white/[0.04] hover:bg-[#10b981]/20 border border-white/[0.08] text-slate-400 hover:text-[#10b981] transition-colors"
                      title="Start Unit"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => onOpenLogModal(svc.unit)}
                    className="p-2.5 rounded-full bg-white/[0.04] hover:bg-[#8b5cf6]/20 border border-white/[0.08] text-slate-400 hover:text-[#8b5cf6] transition-colors"
                    title="Inspect Journal Logs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
