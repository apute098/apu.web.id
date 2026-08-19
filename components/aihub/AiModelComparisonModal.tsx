'use client';

import React from 'react';
import { X, CheckCircle2, XCircle, Sliders, Cpu, ArrowRightLeft, Trash2 } from 'lucide-react';
import { AiModelSpec } from './types';

interface AiModelComparisonModalProps {
  selectedModels: AiModelSpec[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveModel: (modelId: string) => void;
  onClearAll: () => void;
}

export const AiModelComparisonModal: React.FC<AiModelComparisonModalProps> = ({
  selectedModels,
  isOpen,
  onClose,
  onRemoveModel,
  onClearAll,
}) => {
  if (!isOpen || selectedModels.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80  animate-in fade-in duration-300">
      <div className="p-1 rounded-full bg-gradient-to-br from-white/10 via-white/5 to-white/0 border border-white/10 shadow-2xl  w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="rounded-full bg-slate-950 p-6 sm:p-8 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <ArrowRightLeft className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  Komparasi Model Flagship AI
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {selectedModels.length} Model Terpilih
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Matriks perbandingan spesifikasi arsitektur, efisiensi harga, dan benchmark.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClearAll}
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-blue-600 text-white active:scale-95 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Comparison Matrix Table */}
          <div className="flex-1 overflow-x-auto overflow-y-auto py-4 space-y-4 pr-1 custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-3 text-slate-400 font-bold uppercase tracking-wider w-1/4">
                    Metrik & Fitur
                  </th>
                  {selectedModels.map((m) => (
                    <th key={m.id} className="p-3 text-white font-bold w-1/3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: m.accentColor }}
                          />
                          <span className="font-extrabold">{m.name}</span>
                        </div>
                        <button
                          onClick={() => onRemoveModel(m.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal block mt-0.5">
                        {m.provider}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {/* Context Window */}
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Context Window</td>
                  {selectedModels.map((m) => (
                    <td key={m.id} className="p-3 font-mono font-bold text-cyan-400">
                      {m.contextWindowLabel}
                    </td>
                  ))}
                </tr>

                {/* Speed */}
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Generation Speed</td>
                  {selectedModels.map((m) => (
                    <td key={m.id} className="p-3 font-mono text-amber-400 font-bold">
                      {m.speedLabel}
                    </td>
                  ))}
                </tr>

                {/* Pricing Input */}
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Input / 1M Tokens</td>
                  {selectedModels.map((m) => (
                    <td key={m.id} className="p-3 font-mono text-green-400 font-bold">
                      ${m.pricing.inputPer1M.toFixed(2)}
                    </td>
                  ))}
                </tr>

                {/* Pricing Output */}
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Output / 1M Tokens</td>
                  {selectedModels.map((m) => (
                    <td key={m.id} className="p-3 font-mono text-purple-400 font-bold">
                      ${m.pricing.outputPer1M.toFixed(2)}
                    </td>
                  ))}
                </tr>

                {/* Reasoning Benchmark */}
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Reasoning Score (MATH/GPQA)</td>
                  {selectedModels.map((m) => (
                    <td key={m.id} className="p-3 font-mono font-bold text-slate-200">
                      ★ {m.benchmarks.reasoningScore}/100
                    </td>
                  ))}
                </tr>

                {/* Coding Benchmark */}
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Coding Score (SWE-bench)</td>
                  {selectedModels.map((m) => (
                    <td key={m.id} className="p-3 font-mono font-bold text-slate-200">
                      ★ {m.benchmarks.codingScore}/100
                    </td>
                  ))}
                </tr>

                {/* Vision Capability */}
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Vision & Multimodal</td>
                  {selectedModels.map((m) => (
                    <td key={m.id} className="p-3">
                      {m.capabilities.vision ? (
                        <span className="flex items-center gap-1.5 text-green-400 font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> Ya
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <XCircle className="w-4 h-4" /> Tidak
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Thinking Mode */}
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Thinking Mode (CoT)</td>
                  {selectedModels.map((m) => (
                    <td key={m.id} className="p-3">
                      {m.capabilities.thinkingMode ? (
                        <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> Didukung
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <XCircle className="w-4 h-4" /> Direct
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Open Weights */}
                <tr>
                  <td className="p-3 font-semibold text-slate-300">Open-Weights Availability</td>
                  {selectedModels.map((m) => (
                    <td key={m.id} className="p-3">
                      {m.capabilities.openWeights ? (
                        <span className="flex items-center gap-1.5 text-green-400 font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> Open-Weights
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
                          Proprietary API
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end border-t border-white/10 pt-4 mt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-all active:scale-95"
            >
              Selesai Membandingkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
