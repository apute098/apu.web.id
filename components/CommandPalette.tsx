'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Cpu,
  BookOpen,
  Server,
  Wallet,
  ShieldCheck,
  Sparkles,
  Command,
  ArrowRight,
  X,
} from 'lucide-react';
import { AI_MODELS_DATA, AI_PROMPTS_DATA } from './aihub/data';
import { SubdomainTab } from './Navbar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: SubdomainTab) => void;
}

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Navigasi' | 'AI Model' | 'Prompt Vault' | 'Sistem';
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const items: SearchItem[] = [
    {
      id: 'nav-aihub',
      title: 'AI Hub & Direktori Model',
      subtitle: 'Katalog model AI flagship, benchmark & prompt vault',
      category: 'Navigasi',
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      action: () => {
        onNavigateTab('ai-hub');
        onClose();
      },
    },
    {
      id: 'nav-admin',
      title: 'Admin Master Control',
      subtitle: 'Manajemen approval user, daemon control & audit log',
      category: 'Navigasi',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onNavigateTab('admin');
        onClose();
      },
    },
    {
      id: 'nav-9router',
      title: '9Router Gateway Relay (:20128)',
      subtitle: 'Universal AI reverse proxy OpenAI-compatible local',
      category: 'Sistem',
      icon: <Server className="w-4 h-4 text-purple-400" />,
      action: () => {
        onNavigateTab('ai-hub');
        window.location.hash = '#ninerouter-guide';
        onClose();
      },
    },
    ...AI_MODELS_DATA.map((model) => ({
      id: `model-${model.id}`,
      title: `${model.name} (${model.provider})`,
      subtitle: `${model.tag} • Context: ${model.contextWindowLabel} • ${model.speedLabel}`,
      category: 'AI Model' as const,
      icon: <Cpu className="w-4 h-4 text-cyan-400" />,
      action: () => {
        onNavigateTab('ai-hub');
        onClose();
      },
    })),
    ...AI_PROMPTS_DATA.map((prompt) => ({
      id: `prompt-${prompt.id}`,
      title: prompt.title,
      subtitle: `[${prompt.category.toUpperCase()}] ${prompt.description}`,
      category: 'Prompt Vault' as const,
      icon: <BookOpen className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onNavigateTab('ai-hub');
        onClose();
      },
    })),
  ];

  const filteredItems = items.filter((item) => {
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? filteredItems.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-palette-title"
    >
      <div
        className="w-full max-w-2xl rounded-2xl liquid-glass border border-white/15 bg-slate-950/95 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            id="command-palette-title"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Cari navigasi, model AI, prompt (↑↓ untuk navigasi, Enter untuk memilih)..."
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none font-sans"
          />
          <div className="flex items-center gap-1 shrink-0">
            <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-[10px] font-mono text-slate-400">
              ESC
            </kbd>
            <button
              onClick={onClose}
              aria-label="Tutup command palette"
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Command className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-medium">Tidak ada hasil untuk &quot;{query}&quot;</p>
              <p className="text-xs text-slate-600">Coba cari &quot;DeepSeek&quot;, &quot;Admin&quot;, atau &quot;Claude&quot;</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-cyan-500/15 border border-cyan-500/30 text-white'
                      : 'text-slate-300 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-500/40'
                          : 'bg-slate-900 border-white/10'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-slate-900 border border-white/10 text-slate-400">
                      {item.category}
                    </span>
                    {isSelected && (
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2.5 bg-slate-900/60 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10">↓</kbd> Navigasi
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-white/10">↵</kbd> Buka
            </span>
          </div>
          <span className="text-cyan-400/80">apu.web.id Universal Command</span>
        </div>
      </div>
    </div>
  );
};
