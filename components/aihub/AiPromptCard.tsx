'use client';

import React, { useState } from 'react';
import { Copy, Check, Sliders, Sparkles, Code2, ArrowUpRight } from 'lucide-react';
import { AiPrompt } from './types';

interface AiPromptCardProps {
  prompt: AiPrompt;
  onCustomize: (prompt: AiPrompt) => void;
}

export const AiPromptCard: React.FC<AiPromptCardProps> = ({ prompt, onCustomize }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.promptTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'coding':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'agent':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'system':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'writing':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'reasoning':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'security':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="p-1 rounded-full bg-gradient-to-br from-white/10 via-white/5 to-white/0 border border-white/10 shadow-lg shadow-black/20 transition-all duration-500 group hover:border-cyan-500/30 flex flex-col justify-between">
      <div className="rounded-full bg-slate-950 p-6 sm:p-7 flex flex-col justify-between h-full space-y-5">
        {/* Header Badges */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${getCategoryColor(
                prompt.category
              )}`}
            >
              {prompt.category}
            </span>

            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
              <span className="liquid-glass border border-white/10 px-2 py-0.5 rounded-full border border-white/10">
                {prompt.difficulty}
              </span>
              <span className="liquid-glass border border-white/10 px-2 py-0.5 rounded-full border border-white/10">
                ~{prompt.tokenEstimate} tok
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
              {prompt.title}
            </h4>
            <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
              {prompt.description}
            </p>
          </div>

          {/* Variables Pills */}
          {prompt.variables.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-medium">Variabel:</span>
              {prompt.variables.map((v) => (
                <span
                  key={v.key}
                  className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20"
                >
                  {`{{${v.key}}}`}
                </span>
              ))}
            </div>
          )}

          {/* Prompt Preview Snippet */}
          <div className="relative rounded-full bg-slate-950/80 border border-white/10 p-3.5 text-[11px] font-mono text-slate-400 line-clamp-3 leading-relaxed">
            {prompt.promptTemplate}
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
          <button
            onClick={() => onCustomize(prompt)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-cyan-400 hover:bg-slate-900 border border-white/10 transition-all active:scale-95"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Kustomisasi</span>
          </button>

          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full font-bold text-xs transition-all duration-300 active:scale-[0.98] shadow-md group ${
              copied
                ? 'bg-green-500 text-slate-950 shadow-green-500/20'
                : 'bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-cyan-500/20'
            }`}
          >
            <span>{copied ? 'Tersalin!' : 'Salin Prompt'}</span>
            <span className="w-5 h-5 rounded-full bg-slate-950/20 group-hover:bg-slate-950/30 flex items-center justify-center transition-colors">
              {copied ? (
                <Check className="w-3 h-3 text-slate-950" />
              ) : (
                <Copy className="w-3 h-3 text-slate-950" />
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
