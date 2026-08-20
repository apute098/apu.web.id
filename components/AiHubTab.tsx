'use client';

import React, { useState } from 'react';
import {
  Cpu,
  Sparkles,
  Terminal,
  Zap,
  BookOpen,
  Layers,
  Code2,
  Bot,
  Search,
  ShieldCheck,
  ArrowRightLeft,
  X,
  Sliders,
} from 'lucide-react';
import { AI_MODELS_DATA, AI_PROMPTS_DATA } from './aihub/data';
import { AiModelSpec, AiPrompt, PromptCategory } from './aihub/types';
import { AiModelCard } from './aihub/AiModelCard';
import { AiModelDrawer } from './aihub/AiModelDrawer';
import { AiModelComparisonModal } from './aihub/AiModelComparisonModal';
import { AiPromptCard } from './aihub/AiPromptCard';
import { PromptVariableModal } from './aihub/PromptVariableModal';
import { NineRouterGuide } from './aihub/NineRouterGuide';

export const AiHubTab: React.FC = () => {
  // State for Models
  const [modelSearch, setModelSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [drawerModel, setDrawerModel] = useState<AiModelSpec | null>(null);
  const [compareModels, setCompareModels] = useState<AiModelSpec[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // State for Prompts
  const [promptSearch, setPromptSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customizingPrompt, setCustomizingPrompt] = useState<AiPrompt | null>(null);

  // Filtered Models
  const filteredModels = AI_MODELS_DATA.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.provider.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.description.toLowerCase().includes(modelSearch.toLowerCase());
    const matchesProvider =
      selectedProvider === 'all' || m.providerSlug === selectedProvider;
    return matchesSearch && matchesProvider;
  });

  // Filtered Prompts
  const filteredPrompts = AI_PROMPTS_DATA.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(promptSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(promptSearch.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(promptSearch.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Toggle Compare Model
  const handleToggleCompare = (model: AiModelSpec) => {
    if (compareModels.some((m) => m.id === model.id)) {
      setCompareModels(compareModels.filter((m) => m.id !== model.id));
    } else {
      if (compareModels.length >= 3) {
        alert('Maksimal 3 model dapat dibandingkan secara bersamaan.');
        return;
      }
      setCompareModels([...compareModels, model]);
    }
  };

  const handleRemoveCompareModel = (modelId: string) => {
    setCompareModels(compareModels.filter((m) => m.id !== modelId));
  };

  return (
    <div className="space-y-16 py-6 max-w-7xl mx-auto">
      {/* 1. Hero Section & Architecture Highlights */}
      <div className="relative p-1 rounded-full bg-gradient-to-br from-cyan-500/20 via-white/5 to-purple-500/10 border border-white/10 shadow-2xl  overflow-hidden">
        <div className="rounded-full bg-slate-950 p-8 sm:p-12 relative z-10 space-y-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Knowledge Hub & Local Relay Ecosystem</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                Pusat Intelijen AI & <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 via-green-400 to-cyan-600">
                  9Router Gateway Relay
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                Eksplorasi katalog model AI flagship SOTA dunia (DeepSeek, Claude 3.7, GPT-4o, Gemini), pustaka prompt presisi berstandar V-Model, dan integrasi gateway lokal 9Router port 20128.
              </p>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 gap-3 w-full lg:w-auto min-w-[280px]">
              <div className="p-4 rounded-full liquid-glass border border-white/10 border border-white/10 text-center">
                <span className="text-2xl font-black text-cyan-400 font-mono block">6</span>
                <span className="text-xs text-slate-400 font-medium">Flagship Models</span>
              </div>
              <div className="p-4 rounded-full liquid-glass border border-white/10 border border-white/10 text-center">
                <span className="text-2xl font-black text-green-400 font-mono block">7</span>
                <span className="text-xs text-slate-400 font-medium">Prompt Disciplines</span>
              </div>
              <div className="p-4 rounded-full liquid-glass border border-white/10 border border-white/10 text-center">
                <span className="text-2xl font-black text-amber-400 font-mono block">2M</span>
                <span className="text-xs text-slate-400 font-medium">Max Context Window</span>
              </div>
              <div className="p-4 rounded-full liquid-glass border border-white/10 border border-white/10 text-center">
                <span className="text-2xl font-black text-purple-400 font-mono block">:20128</span>
                <span className="text-xs text-slate-400 font-medium">9Router Local Port</span>
              </div>
            </div>
          </div>

          {/* Quick Anchor Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10 text-xs">
            <span className="text-slate-400 font-medium">Navigasi Cepat:</span>
            <a
              href="#models-showcase"
              className="px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 hover:bg-blue-600 text-white text-slate-300 border border-white/10 transition-all"
            >
              🚀 Model Directory
            </a>
            <a
              href="#ninerouter-guide"
              className="px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 hover:bg-blue-600 text-white text-slate-300 border border-white/10 transition-all"
            >
              ⚡ 9Router Gateway Guide
            </a>
            <a
              href="#prompt-library"
              className="px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 hover:bg-blue-600 text-white text-slate-300 border border-white/10 transition-all"
            >
              📚 Prompt Vault
            </a>
          </div>
        </div>
      </div>

      {/* 2. Flagship Models Showcase */}
      <section id="models-showcase" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">
              <Cpu className="w-4 h-4" />
              <span>Model Directory & Benchmarks</span>
            </div>
            <h3 className="text-2xl font-black tracking-tight text-white">
              State-of-the-Art Model Showcase
            </h3>
            <p className="text-xs text-slate-400">
              Spesifikasi teknis, batas jendela konteks, kecepatan throughput, dan efisiensi biaya.
            </p>
          </div>

          {/* Search & Provider Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            <div className="relative w-full sm:w-44">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                placeholder="Cari model AI..."
                className="w-full pl-8 pr-3 py-2 rounded-full liquid-glass border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="flex items-center gap-1 liquid-glass p-1 rounded-full border border-white/10 text-xs overflow-x-auto max-w-full no-scrollbar whitespace-nowrap shrink-0">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'deepseek', label: 'DeepSeek' },
                { id: 'anthropic', label: 'Anthropic' },
                { id: 'openai', label: 'OpenAI' },
                { id: 'google', label: 'Google' },
                { id: 'nvidia', label: 'NVIDIA' },
                { id: 'moonshot', label: 'Moonshot' },
              ].map((prov) => (
                <button
                  key={prov.id}
                  onClick={() => setSelectedProvider(prov.id)}
                  className={`px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 ${
                    selectedProvider === prov.id
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {prov.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Model Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => (
            <AiModelCard
              key={model.id}
              model={model}
              isSelectedForCompare={compareModels.some((m) => m.id === model.id)}
              onOpenDrawer={(m) => setDrawerModel(m)}
              onToggleCompare={handleToggleCompare}
            />
          ))}
        </div>
      </section>

      {/* 3. 9Router AI Gateway Section */}
      <section id="ninerouter-guide" className="space-y-6">
        <NineRouterGuide />
      </section>

      {/* 4. AI Prompt Library Section */}
      <section id="prompt-library" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-green-400 uppercase tracking-wider font-bold">
              <BookOpen className="w-4 h-4" />
              <span>Prompt Library & Vault</span>
            </div>
            <h3 className="text-2xl font-black tracking-tight text-white">
              Curated Prompt Vault (V-Model & Guardrails)
            </h3>
            <p className="text-xs text-slate-400">
              Template prompt presisi tinggi dengan parameter dinamis untuk implementasi, security audit, dan arsitektur.
            </p>
          </div>

          {/* Prompt Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            <div className="relative w-full sm:w-44">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={promptSearch}
                onChange={(e) => setPromptSearch(e.target.value)}
                placeholder="Cari prompt..."
                className="w-full pl-8 pr-3 py-2 rounded-full liquid-glass border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="flex items-center gap-1 liquid-glass p-1 rounded-full border border-white/10 text-xs overflow-x-auto max-w-full no-scrollbar whitespace-nowrap shrink-0">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'coding', label: 'coding' },
                { id: 'agent', label: 'agent' },
                { id: 'system', label: 'system' },
                { id: 'writing', label: 'writing' },
                { id: 'reasoning', label: 'reasoning' },
                { id: 'security', label: 'security' },
                { id: 'creative', label: 'creative' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-green-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prompt Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map((prompt) => (
            <AiPromptCard
              key={prompt.id}
              prompt={prompt}
              onCustomize={(p) => setCustomizingPrompt(p)}
            />
          ))}
        </div>
      </section>

      {/* Floating Comparison Action Bar */}
      {compareModels.length > 0 && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[45] animate-in slide-in-from-bottom-5 duration-300 w-max max-w-[90vw]">
          <div className="p-1 rounded-full bg-gradient-to-br from-cyan-500 via-green-500 to-cyan-700 shadow-2xl">
            <div className="flex items-center gap-4 bg-slate-950 px-5 py-2.5 rounded-full border border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Komparasi:</span>
                <div className="flex -space-x-2">
                  {compareModels.map((m) => (
                    <span
                      key={m.id}
                      title={m.name}
                      className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: m.accentColor }}
                    >
                      {m.name.charAt(0)}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="px-4 py-1.5 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-all active:scale-95 shadow-md shadow-cyan-500/20"
              >
                Bandingkan ({compareModels.length})
              </button>

              <button
                onClick={() => setCompareModels([])}
                className="text-slate-400 hover:text-rose-400 p-1"
                title="Batal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals & Drawers */}
      <AiModelDrawer
        model={drawerModel}
        isOpen={!!drawerModel}
        onClose={() => setDrawerModel(null)}
      />

      <AiModelComparisonModal
        selectedModels={compareModels}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onRemoveModel={handleRemoveCompareModel}
        onClearAll={() => {
          setCompareModels([]);
          setIsCompareModalOpen(false);
        }}
      />

      <PromptVariableModal
        prompt={customizingPrompt}
        isOpen={!!customizingPrompt}
        onClose={() => setCustomizingPrompt(null)}
      />
    </div>
  );
};

export default AiHubTab;
