'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Activity,
  Layers,
  Cpu,
  Boxes,
  Network,
  FileText,
  Terminal,
  Bot,
  Zap,
  Trash2,
  HardDrive,
  RotateCcw,
  Unlock,
} from 'lucide-react';
import { ActiveTab } from './Navbar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onTriggerAction: (action: string) => Promise<void>;
  onOpenAuthModal: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onNavigateTab,
  onTriggerAction,
  onOpenAuthModal,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = [
    { id: 'tab-overview', label: 'Go to Overview / Mission Control', category: 'Navigation', icon: Activity, action: () => onNavigateTab('overview') },
    { id: 'tab-services', label: 'Go to Services Hub', category: 'Navigation', icon: Layers, action: () => onNavigateTab('services') },
    { id: 'tab-processes', label: 'Go to Process Manager (Top)', category: 'Navigation', icon: Cpu, action: () => onNavigateTab('processes') },
    { id: 'tab-docker', label: 'Go to Docker & Containers', category: 'Navigation', icon: Boxes, action: () => onNavigateTab('docker') },
    { id: 'tab-network', label: 'Go to Network, Ports & Ingress', category: 'Navigation', icon: Network, action: () => onNavigateTab('network') },
    { id: 'tab-logs', label: 'Go to Live Journal Logs Streamer', category: 'Navigation', icon: FileText, action: () => onNavigateTab('logs') },
    { id: 'tab-terminal', label: 'Go to Server Terminal', category: 'Navigation', icon: Terminal, action: () => onNavigateTab('terminal') },
    { id: 'tab-watchdog', label: 'Go to AI Ecosystem Watchdog', category: 'Navigation', icon: Bot, action: () => onNavigateTab('watchdog') },

    { id: 'act-drop-cache', label: 'Quick Action: Drop RAM Caches', category: 'Server Actions', icon: Trash2, action: () => onTriggerAction('clean_cache') },
    { id: 'act-trim', label: 'Quick Action: Trim SSD Storage', category: 'Server Actions', icon: HardDrive, action: () => onTriggerAction('trim_ssd') },
    { id: 'act-caddy', label: 'Quick Action: Reload Caddy Reverse Proxy', category: 'Server Actions', icon: RotateCcw, action: () => onTriggerAction('restart_caddy') },
    { id: 'act-diag', label: 'Quick Action: Run Health Diagnostic', category: 'Server Actions', icon: Zap, action: () => onTriggerAction('system_diagnostic') },

    { id: 'act-unlock', label: 'Security: Enter Master PIN to Unlock Admin', category: 'Security', icon: Unlock, action: () => onOpenAuthModal() },
  ];

  const filtered = items.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-xl w-full p-4 space-y-3 shadow-2xl overflow-hidden">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik perintah, navigasi tab, atau aksi cepat..."
            className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-white/10 focus:border-cyan-400 rounded-xl text-sm text-white placeholder:text-slate-500 font-mono outline-none"
            autoFocus
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
          {filtered.length === 0 ? (
            <div className="text-slate-500 py-6 text-center">Perintah tidak ditemukan.</div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-transparent text-left text-slate-200 hover:text-cyan-300 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase px-1.5 py-0.5 rounded bg-slate-800">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-mono text-slate-500">
          <span>Navigasi Cepat Server</span>
          <span>ESC untuk menutup</span>
        </div>
      </div>
    </div>
  );
}
