'use client';

import React, { useState } from 'react';
import {
  Gift,
  Zap,
  ExternalLink,
  CheckCircle2,
  Server,
  Layers,
  Terminal,
  Cpu,
  Sparkles,
  ShieldCheck,
  Search,
} from 'lucide-react';

export interface FreeAiResource {
  id: string;
  name: string;
  provider: string;
  category: 'Cloud API Gratis' | 'Local / Offline' | 'Proxy & Gateway' | 'Web AI Gratis' | 'Serverless';
  badge: string;
  freeLimit: string;
  speed: string;
  topModels: string[];
  highlights: string[];
  url: string;
  codeQuickstart?: string;
}

export const FREE_AI_RESOURCES: FreeAiResource[] = [
  {
    id: 'google-ai-studio',
    name: 'Google AI Studio',
    provider: 'Google DeepMind',
    category: 'Cloud API Gratis',
    badge: '100% Free Tier',
    freeLimit: '15 RPM / 1M Tokens per menit',
    speed: '⚡ ~120 t/s',
    topModels: ['Gemini 2.5 Flash', 'Gemini 2.0 Flash', 'Gemini 2.0 Thinking'],
    highlights: [
      'Konteks hingga 1 Juta Token gratis',
      'Mendukung multimodal (Audio, Video, PDF, Gambar)',
      'Tanpa perlu input kartu kredit saat mendaftar',
      'SDK resmi Python, Node.js, Go, dan REST cURL',
    ],
    url: 'https://aistudio.google.com/',
    codeQuickstart: `curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$GEMINI_API_KEY" \\
  -H 'Content-Type: application/json' \\
  -d '{"contents": [{"parts":[{"text": "Halo Gemini!"}]}]}'`,
  },
  {
    id: 'groq-cloud',
    name: 'Groq Cloud LPU',
    provider: 'Groq',
    category: 'Cloud API Gratis',
    badge: 'Ultra Fast Free',
    freeLimit: '30 RPM / 6,000 TPM gratis',
    speed: '⚡ 500 - 800 t/s',
    topModels: ['Llama 3.3 70B Versatile', 'DeepSeek R1 Distill 70B', 'Qwen 2.5 32B'],
    highlights: [
      'Inference tercepat di dunia berbasis LPU hardware',
      'OpenAI-compatible API standard (/v1/chat/completions)',
      'Cocok untuk voice agent dan live streaming chatbot',
      'Gratis untuk testing, prototyping & developer tools',
    ],
    url: 'https://console.groq.com/',
    codeQuickstart: `curl https://api.groq.com/openai/v1/chat/completions \\
  -H "Authorization: Bearer $GROQ_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model": "llama-3.3-70b-versatile", "messages": [{"role": "user", "content": "Halo Groq!"}]}'`,
  },
  {
    id: '9router-local',
    name: '9Router Universal Gateway',
    provider: 'Self-Hosted (apu.web.id)',
    category: 'Proxy & Gateway',
    badge: 'Self-Hosted Relay',
    freeLimit: 'Unlimited Local Access',
    speed: '⚡ ~15ms Local TTFT',
    topModels: ['DeepSeek R1/V3', 'Gemini 3.1 Preview', 'NVIDIA NIM Pool', 'BZL Models'],
    highlights: [
      'Reverse proxy OpenAI-compatible pada port :20128',
      'Multi-provider fallback otomatis (zero downtime)',
      'Dapat diakses langsung oleh CLI tools (Aider, Claude Code, Cline)',
      'Tanpa rate limit tambahan pada jaringan lokal',
    ],
    url: '#ninerouter-guide',
    codeQuickstart: `curl http://localhost:20128/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{"model": "oc/deepseek-v4-flash-free", "messages": [{"role": "user", "content": "Halo 9Router!"}]}'`,
  },
  {
    id: 'ollama-local',
    name: 'Ollama Offline Engine',
    provider: 'Open Source Community',
    category: 'Local / Offline',
    badge: '100% Offline & Private',
    freeLimit: 'Tanpa Batas Kuota (Local Hardware)',
    speed: 'Tergantung GPU/RAM PC',
    topModels: ['DeepSeek-R1 (1.5B - 70B)', 'Llama 3.2 (1B - 3B)', 'Qwen 2.5 Coder', 'Phi-4'],
    highlights: [
      '100% data pribadi tidak keluar dari laptop/server',
      'Berjalan lancar di CPU, Apple Silicon, atau GPU NVIDIA',
      'CLI super simpel: `ollama run deepseek-r1`',
      'Menyediakan REST API lokal pada port :11434',
    ],
    url: 'https://ollama.com/',
    codeQuickstart: `# Install & Jalankan model gratis di terminal:
curl -fsSL https://ollama.com/install.sh | sh
ollama run deepseek-r1:8b`,
  },
  {
    id: 'openrouter-free',
    name: 'OpenRouter Free Models',
    provider: 'OpenRouter.ai',
    category: 'Cloud API Gratis',
    badge: 'Multi-Model Free Router',
    freeLimit: '20-50 RPD per model :free',
    speed: '⚡ ~80 t/s',
    topModels: ['meta-llama/llama-3.3-70b-instruct:free', 'deepseek/deepseek-r1:free', 'google/gemini-2.0-flash-exp:free'],
    highlights: [
      'Satu API key untuk mengakses puluhan model AI gratis',
      'Model dengan tag `:free` tidak memotong saldo',
      'Dukungan tool-calling & structured outputs',
      'OpenAI compatible base URL https://openrouter.ai/api/v1',
    ],
    url: 'https://openrouter.ai/models?max_price=0',
    codeQuickstart: `curl https://openrouter.ai/api/v1/chat/completions \\
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model": "deepseek/deepseek-r1:free", "messages": [{"role": "user", "content": "Halo!"}]}'`,
  },
  {
    id: 'cloudflare-workers-ai',
    name: 'Cloudflare Workers AI',
    provider: 'Cloudflare',
    category: 'Serverless',
    badge: 'Daily Free Allowance',
    freeLimit: '10,000 Neurons per hari (Gratis)',
    speed: '⚡ Edge Global Network',
    topModels: ['@cf/meta/llama-3.1-8b-instruct', '@cf/qwen/qwen1.5-14b-chat', '@cf/openai/whisper'],
    highlights: [
      'Inference serverless berjalan di 300+ kota di dunia',
      'Mendukung Text, Embeddings, Image Generation & Whisper STT',
      'Terintegrasi native dengan Cloudflare Workers & Pages',
      'Allowance harian di-reset otomatis setiap 24 jam',
    ],
    url: 'https://developers.cloudflare.com/workers-ai/',
    codeQuickstart: `// Jalankan di Cloudflare Worker:
const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
  prompt: 'Apa ibu kota Indonesia?'
});`,
  },
  {
    id: 'nvidia-nim',
    name: 'NVIDIA NIM API Catalog',
    provider: 'NVIDIA',
    category: 'Cloud API Gratis',
    badge: '1,000 Free Credits',
    freeLimit: '1,000 API Credits saat registrasi',
    speed: '⚡ TensorRT-LLM Acceleration',
    topModels: ['nvidia/llama-3.1-nemotron-70b-instruct', 'meta/llama-3.1-405b-instruct', 'mistralai/mistral-large-2-instruct'],
    highlights: [
      'Akses ke model raksasa 405B parameter secara cuma-cuma',
      'Dioptimasi penuh dengan NVIDIA TensorRT-LLM & vLLM',
      'Dukungan enterprise guardrails & function calling',
      'Format OpenAI compatible endpoints',
    ],
    url: 'https://build.nvidia.com/',
  },
  {
    id: 'huggingface-inference',
    name: 'Hugging Face Serverless',
    provider: 'Hugging Face',
    category: 'Cloud API Gratis',
    badge: 'Open Community Hub',
    freeLimit: 'Free tier rate-limited API',
    speed: '⚡ Variabel',
    topModels: ['Qwen 2.5 Coder', 'Mistral 7B v0.3', 'BGE Multilingual Embeddings', 'FLUX.1-schnell'],
    highlights: [
      'Akses ke ratusan ribu model open-source dunia',
      'Mendukung text generation, translation, summary, embeddings & TTS',
      'Gratis menggunakan HF User Access Token',
      'Pustaka model terbesar di dunia',
    ],
    url: 'https://huggingface.co/models',
  },
];

export const FreeAiDirectory: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredResources = FREE_AI_RESOURCES.filter((res) => {
    const matchesSearch =
      res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.topModels.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
      res.highlights.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      filterCategory === 'all' || res.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <section id="free-ai-catalog" className="space-y-8">
      {/* Header Banner */}
      <div className="p-1 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-transparent border border-emerald-500/30 shadow-2xl">
        <div className="rounded-3xl bg-slate-950 p-6 sm:p-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
                <Gift className="w-3.5 h-3.5" />
                <span>100% Free & Open Access Resources</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Direktori Platform & API AI <span className="text-emerald-400">100% Gratis</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Kompilasi lengkap provider AI yang menyediakan kuota gratis (Free Tier), model Open-Weights tanpa bayar, reverse proxy lokal 9Router, dan engine offline Ollama untuk developer & komunitas.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href="#ninerouter-guide"
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-cyan-400 text-slate-950 font-extrabold text-xs hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
              >
                <Server className="w-4 h-4" />
                <span>9Router Gateway Lokal</span>
              </a>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari provider, model gratis..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl liquid-glass border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-emerald-400/60"
              />
            </div>

            <div className="flex items-center gap-1.5 liquid-glass p-1 rounded-xl border border-white/10 text-xs overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'Semua Gratisan' },
                { id: 'Cloud API Gratis', label: 'Cloud API Free' },
                { id: 'Serverless', label: 'Serverless & Edge' },
                { id: 'Local / Offline', label: 'Local & Offline' },
                { id: 'Proxy & Gateway', label: 'Proxy & Gateway' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
                    filterCategory === tab.id
                      ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Free Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="group p-6 rounded-2xl liquid-glass border border-white/10 hover:border-emerald-400/40 transition-all flex flex-col justify-between space-y-5 bg-slate-950/60 shadow-xl"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {res.name}
                    </h4>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400">{res.provider}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {res.badge}
                </span>
              </div>

              {/* Free Limit & Speed specs */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-black/40 border border-white/5 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">Kuota Free</span>
                  <span className="font-semibold text-slate-200">{res.freeLimit}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Kecepatan</span>
                  <span className="font-mono text-cyan-400">{res.speed}</span>
                </div>
              </div>

              {/* Top Free Models */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Model Pilihan Siap Pakai:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {res.topModels.map((m, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-900 border border-white/10 text-slate-300"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Features */}
              <ul className="space-y-1.5 text-xs text-slate-300">
                {res.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-snug text-[11px] text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <a
                href={res.url}
                target={res.url.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
              >
                <span>Buka / Akses Gratis</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
