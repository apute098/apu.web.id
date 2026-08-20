'use client';

import React from 'react';
import { Cpu, Check, Plus, ArrowRight } from 'lucide-react';
import { AiModelSpec } from './types';

interface AiModelCardProps {
  model: AiModelSpec;
  isSelectedForCompare: boolean;
  onOpenDrawer: (model: AiModelSpec) => void;
  onToggleCompare: (model: AiModelSpec) => void;
}

export const AiModelCard: React.FC<AiModelCardProps> = ({
  model,
  isSelectedForCompare,
  onOpenDrawer,
  onToggleCompare,
}) => {
  const accent = model.accentColor || '#22d3ee';

  return (
    <div className="p-1.5 rounded-2xl liquid-glass border border-white/10 border border-white/10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-cyan-500/30 group">
      <div className="rounded-full bg-slate-950 p-5 sm:p-6 flex flex-col h-full relative overflow-hidden">
        
        {/* Glow effect from accent */}
        <div 
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full  opacity-20 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:opacity-40"
          style={{ backgroundColor: accent }}
        />

        <div className="flex-1 space-y-6 relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-white/10 liquid-glass border border-slate-700 text-[10px] uppercase tracking-[0.15em] font-medium text-slate-300 font-mono ">
                {model.provider}
              </span>
              <h4 className="text-xl font-medium text-white tracking-tight flex items-center gap-2 font-sans">
                {model.name}
              </h4>
            </div>
            
            <div className="relative overflow-hidden rounded-full px-3 py-1 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 opacity-10" style={{ backgroundColor: accent }} />
              <span className="relative text-[10px] uppercase tracking-[0.15em] font-medium font-mono" style={{ color: accent }}>
                {model.tag}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed font-sans font-light">
            {model.description}
          </p>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-full bg-white/[0.02] border border-white/5 ">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono block mb-1">Context Window</span>
              <span className="text-sm font-medium text-white font-sans block">
                {model.contextWindowLabel}
              </span>
            </div>
            <div className="p-3 rounded-full bg-white/[0.02] border border-white/5 ">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono block mb-1">Speed</span>
              <span className="text-sm font-medium text-white font-sans block">
                {model.speedLabel}
              </span>
            </div>
          </div>

          {/* Benchmark Visual Bars */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <span>Reasoning</span>
                <span className="text-white font-medium">{model.benchmarks.reasoningScore}/100</span>
              </div>
              <div className="w-full h-1.5 rounded-full liquid-glass border border-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  style={{ width: `${model.benchmarks.reasoningScore}%`, backgroundColor: accent }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <span>Coding</span>
                <span className="text-white font-medium">{model.benchmarks.codingScore}/100</span>
              </div>
              <div className="w-full h-1.5 rounded-full liquid-glass border border-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  style={{ width: `${model.benchmarks.codingScore}%`, backgroundColor: accent }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between gap-3 mt-8 pt-5 border-t border-white/10 relative z-10">
          <button
            onClick={() => onToggleCompare(model)}
            className={`min-h-[44px] min-w-[44px] w-11 h-11 flex items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] border ${
              isSelectedForCompare
                ? 'bg-white text-[#05050d] border-white'
                : 'bg-slate-900 border border-slate-700 text-slate-300 border-white/10 hover:bg-blue-600 text-white hover:text-white'
            }`}
            aria-label={isSelectedForCompare ? "Remove from compare" : "Add to compare"}
          >
            {isSelectedForCompare ? <Check className="w-4 h-4" strokeWidth={1.5} /> : <Plus className="w-4 h-4" strokeWidth={1.5} />}
          </button>

          <button
            onClick={() => onOpenDrawer(model)}
            className="flex-1 min-h-[44px] p-1.5 rounded-2xl liquid-glass border border-white/10 border border-white/10 text-white font-sans text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-blue-600 text-white group/btn flex items-center justify-between pl-5 "
          >
            <span>View Specifications</span>
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/btn:scale-105"
              style={{ backgroundColor: accent, color: '#05050d' }}
            >
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
