'use client';

import React, { useState } from 'react';
import { Terminal, Copy, Check, Code2, Server, ShieldCheck, Zap, Layers, Sparkles } from 'lucide-react';
import { NINEROUTER_SNIPPETS } from './data';
import { NineRouterStatusBadge } from './NineRouterStatusBadge';
import { NineRouterCurlBuilder } from './NineRouterCurlBuilder';
import { CodeSnippetLang } from './types';

export const NineRouterGuide: React.FC = () => {
  const [activeLang, setActiveLang] = useState<CodeSnippetLang>('curl');
  const [copied, setCopied] = useState(false);

  const currentSnippet = NINEROUTER_SNIPPETS.find((s) => s.lang === activeLang) || NINEROUTER_SNIPPETS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-1 rounded-full bg-gradient-to-br from-white/10 via-white/5 to-white/0 border-2 border-slate-800 shadow-[8px_8px_0_0_rgba(37,99,235,1)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-cyan-500/30 group">
      <div className="rounded-full bg-slate-950 p-6 sm:p-8 space-y-8">
        {/* Header & Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Server className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  9Router AI Gateway
                  <span className="text-xs font-normal font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Local Proxy v1.x
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Universal AI reverse-proxy relay yang mengekspos OpenAI-compatible API pada port lokal :20128.
                </p>
              </div>
            </div>
          </div>

          <NineRouterStatusBadge />
        </div>

        {/* Core Specs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-full bg-slate-900 border border-slate-700 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
              <Zap className="w-4 h-4" />
              Base URL Standard
            </div>
            <div className="font-mono text-xs text-slate-200 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
              http://localhost:20128/v1
            </div>
            <p className="text-[11px] text-slate-400">
              Mendukung standard <code className="text-cyan-300">/v1/chat/completions</code> & <code className="text-cyan-300">/v1/models</code>.
            </p>
          </div>

          <div className="p-4 rounded-full bg-slate-900 border border-slate-700 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              Auth & Zero Rate-Limits
            </div>
            <div className="font-mono text-xs text-slate-200 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
              Bearer $NINEROUTER_API_KEY
            </div>
            <p className="text-[11px] text-slate-400">
              Otomatis merutekan request ke multi-provider pool (NVIDIA NIM, DeepSeek, Google, BZL).
            </p>
          </div>

          <div className="p-4 rounded-full bg-slate-900 border border-slate-700 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold">
              <Layers className="w-4 h-4" />
              Stream Acceleration
            </div>
            <div className="font-mono text-xs text-slate-200 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
              text/event-stream (SSE)
            </div>
            <p className="text-[11px] text-slate-400">
              Server-Sent Events dengan latensi First Token (TTFT) ultra rendah ~15ms pada jaringan lokal.
            </p>
          </div>
        </div>

        {/* Multi-Language Code Snippets */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-full border border-white/10">
              {NINEROUTER_SNIPPETS.map((snippet) => (
                <button
                  key={snippet.lang}
                  onClick={() => setActiveLang(snippet.lang)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeLang === snippet.lang
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-700'
                  }`}
                >
                  {snippet.label}
                </button>
              ))}
            </div>

            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              {currentSnippet.filename}
            </span>
          </div>

          <div className="relative rounded-full bg-slate-950 border border-white/10 p-5 font-mono text-xs text-slate-200 overflow-x-auto shadow-inner">
            <pre className="text-cyan-300/90 whitespace-pre">{currentSnippet.code}</pre>
            <button
              onClick={handleCopy}
              className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 text-white hover:bg-white/15 text-slate-200 border border-white/10 active:scale-95 transition-all text-xs font-semibold"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic cURL Command Generator */}
        <NineRouterCurlBuilder />
      </div>
    </div>
  );
};
