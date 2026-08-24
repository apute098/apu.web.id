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
  Archive,
  Send,
  Sparkles,
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
    { id: 'tab-overview', label: 'Go to Vitals / Mission Control', category: 'Navigation', icon: Activity, action: () => onNavigateTab('overview') },
    { id: 'tab-services', label: 'Go to Services Controller', category: 'Navigation', icon: Layers, action: () => onNavigateTab('services') },
    { id: 'tab-processes', label: 'Go to Process Manager (Top)', category: 'Navigation', icon: Cpu, action: () => onNavigateTab('processes') },
    { id: 'tab-docker', label: 'Go to Docker & Containers', category: 'Navigation', icon: Boxes, action: () => onNavigateTab('docker') },
    { id: 'tab-network', label: 'Go to Network, Ports & Ingress', category: 'Navigation', icon: Network, action: () => onNavigateTab('network') },
    { id: 'tab-agents', label: 'Go to AI Agents Matrix & Power Tools Hub', category: 'Navigation', icon: Sparkles, action: () => onNavigateTab('agents') },
    { id: 'tab-logs', label: 'Go to Live Journal Logs Streamer', category: 'Navigation', icon: FileText, action: () => onNavigateTab('logs') },
    { id: 'tab-terminal', label: 'Go to Server Terminal', category: 'Navigation', icon: Terminal, action: () => onNavigateTab('terminal') },
    { id: 'tab-watchdog', label: 'Go to AI Ecosystem Watchdog', category: 'Navigation', icon: Bot, action: () => onNavigateTab('watchdog') },

    { id: 'act-drop-cache', label: 'Quick Action: Drop RAM Caches', category: 'Server Ops', icon: Trash2, action: () => onTriggerAction('clean_cache') },
    { id: 'act-trim', label: 'Quick Action: Trim SSD Storage', category: 'Server Ops', icon: HardDrive, action: () => onTriggerAction('trim_ssd') },
    { id: 'act-backup', label: 'Quick Action: Create Snapshot Backup', category: 'Server Ops', icon: Archive, action: () => onTriggerAction('backup_snapshot') },
    { id: 'act-tg', label: 'Quick Action: Send Test Telegram Alert', category: 'Server Ops', icon: Send, action: () => onTriggerAction('test_telegram_alert') },
    { id: 'act-caddy', label: 'Quick Action: Reload Caddy Reverse Proxy', category: 'Server Ops', icon: RotateCcw, action: () => onTriggerAction('restart_caddy') },
    { id: 'act-diag', label: 'Quick Action: Run System Diagnostic', category: 'Server Ops', icon: Zap, action: () => onTriggerAction('system_diagnostic') },

    { id: 'act-unlock', label: 'Security: Enter Master PIN to Unlock Admin', category: 'Security', icon: Unlock, action: () => onOpenAuthModal() },
  ];

  const filtered = items.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-24 p-4">
      <div className="doppelrand-shell max-w-xl w-full">
        <div className="doppelrand-core space-y-3">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search commands, tabs, or quick actions..."
              className="w-full pl-10 pr-4 py-3 bg-black/60 border border-white/[0.08] focus:border-[#00f2fe] rounded-full text-sm text-white placeholder:text-slate-500 font-mono outline-none"
              autoFocus
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          </div>

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
                    className="w-full flex items-center justify-between p-2.5 rounded-full hover:bg-[#00f2fe]/10 hover:border-[#00f2fe]/30 border border-transparent text-left text-slate-200 hover:text-[#00f2fe] transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-[#00f2fe]" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase px-2 py-0.5 rounded-full bg-white/[0.04]">
                      {item.category}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[11px] font-mono text-slate-500">
            <span>Server Command Palette</span>
            <span>ESC untuk menutup</span>
          </div>
        </div>
      </div>
    </div>
  );
}
