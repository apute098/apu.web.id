'use client';

import React from 'react';
import { X, Cpu, Zap, DollarSign, BarChart3, CheckCircle2, XCircle, Sparkles, Layers, Terminal } from 'lucide-react';
import { AiModelSpec } from './types';

interface AiModelDrawerProps {
  model: AiModelSpec | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AiModelDrawer: React.FC<AiModelDrawerProps> = ({ model, isOpen, onClose }) => {
  if (!isOpen || !model) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80  animate-in fade-in duration-300">
      <div className="p-1 rounded-full bg-gradient-to-br from-white/10 via-white/5 to-white/0 border border-white/10 shadow-2xl  w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="rounded-full bg-slate-950 p-6 sm:p-8 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center border shadow-lg"
                style={{
                  backgroundColor: `${model.accentColor}15`,
                  borderColor: `${model.accentColor}40`,
                }}
              >
                <Cpu className="w-5 h-5" style={{ color: model.accentColor }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white">{model.name}</h3>
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${model.badgeColor}`}
                  >
                    {model.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Provider: {model.provider} • Arsitektur: {model.architecture}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-blue-600 text-white active:scale-95 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1 custom-scrollbar">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-full liquid-glass border border-slate-700 border border-white/10 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Context Window
                </span>
                <span className="text-sm font-extrabold text-cyan-400 font-mono mt-1 block">
                  {model.contextWindowLabel}
                </span>
              </div>
              <div className="p-3 rounded-full liquid-glass border border-slate-700 border border-white/10 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Generation Speed
                </span>
                <span className="text-sm font-extrabold text-amber-400 font-mono mt-1 block">
                  {model.speedLabel}
                </span>
              </div>
              <div className="p-3 rounded-full liquid-glass border border-slate-700 border border-white/10 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Input / 1M Tokens
                </span>
                <span className="text-sm font-extrabold text-green-400 font-mono mt-1 block">
                  ${model.pricing.inputPer1M.toFixed(2)}
                </span>
              </div>
              <div className="p-3 rounded-full liquid-glass border border-slate-700 border border-white/10 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Output / 1M Tokens
                </span>
                <span className="text-sm font-extrabold text-purple-400 font-mono mt-1 block">
                  ${model.pricing.outputPer1M.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 rounded-full liquid-glass border border-slate-700 border border-white/10">
              <p className="text-xs text-slate-300 leading-relaxed">{model.description}</p>
            </div>

            {/* Benchmark Scores */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4" />
                Benchmark SOTA Scores (0-100)
              </h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>Reasoning & Logic (MATH-500 / GPQA)</span>
                    <span className="text-cyan-400 font-bold">{model.benchmarks.reasoningScore}/100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-blue-600 text-white overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                      style={{ width: `${model.benchmarks.reasoningScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>Coding & Engineering (SWE-bench / HumanEval)</span>
                    <span className="text-green-400 font-bold">{model.benchmarks.codingScore}/100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-blue-600 text-white overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${model.benchmarks.codingScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                    <span>General Knowledge & MMLU-Pro</span>
                    <span className="text-purple-400 font-bold">{model.benchmarks.generalMMLU}/100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-blue-600 text-white overflow-hidden">
                    <div
                      className="h-full bg-purple-400 rounded-full transition-all duration-500"
                      style={{ width: `${model.benchmarks.generalMMLU}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Capability Checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-slate-400" />
                Daftar Kapabilitas Model
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {Object.entries(model.capabilities).map(([key, enabled]) => (
                  <div
                    key={key}
                    className={`flex items-center gap-1.5 p-2 rounded-full border ${
                      enabled
                        ? 'bg-green-500/10 text-green-300 border-green-500/20'
                        : 'liquid-glass border border-slate-700 text-slate-500 border-white/5'
                    }`}
                  >
                    {enabled ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span className="capitalize font-mono text-[11px]">{key.replace(/([A-Z])/g, ' $1')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Use Cases */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Direkomendasikan Untuk:
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {model.bestFor.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-full liquid-glass border border-slate-700 border border-white/5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sample Query Box */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-slate-400" />
                Contoh Interaksi & Output
              </h4>
              <div className="rounded-full bg-slate-950 border border-white/10 p-4 space-y-3 font-mono text-xs shadow-inner">
                <div>
                  <span className="text-[10px] text-cyan-400 font-bold block mb-1">PROMPT:</span>
                  <p className="text-slate-300">{model.sampleQuery.prompt}</p>
                </div>
                {model.sampleQuery.thoughtProcess && (
                  <div className="border-t border-white/10 pt-2 text-[11px] text-slate-400 italic">
                    <span className="text-[10px] text-amber-400 font-bold not-italic block mb-1">THINKING PROCESS:</span>
                    {model.sampleQuery.thoughtProcess}
                  </div>
                )}
                <div className="border-t border-white/10 pt-2">
                  <span className="text-[10px] text-green-400 font-bold block mb-1">RESPONSE:</span>
                  <p className="text-slate-200">{model.sampleQuery.expectedResponse}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end border-t border-white/10 pt-4 mt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-white/15 text-slate-200 text-xs font-semibold active:scale-95 transition-all"
            >
              Tutup Spesifikasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
