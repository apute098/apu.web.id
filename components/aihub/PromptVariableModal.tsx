'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Sparkles, Sliders, FileText } from 'lucide-react';
import { AiPrompt } from './types';

interface PromptVariableModalProps {
  prompt: AiPrompt | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PromptVariableModal: React.FC<PromptVariableModalProps> = ({
  prompt,
  isOpen,
  onClose,
}) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (prompt) {
      const initial: Record<string, string> = {};
      prompt.variables.forEach((v) => {
        initial[v.key] = v.defaultValue || '';
      });
      setValues(initial);
    }
  }, [prompt]);

  if (!isOpen || !prompt) return null;

  // Hydrate template
  let hydratedPrompt = prompt.promptTemplate;
  Object.entries(values).forEach(([key, val]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    hydratedPrompt = hydratedPrompt.replace(regex, val || `{{${key}}}`);
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(hydratedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80  animate-in fade-in duration-300">
      <div className="p-1 rounded-full bg-gradient-to-br from-white/10 via-white/5 to-white/0 border border-white/10 shadow-2xl  w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="rounded-full bg-slate-950 p-6 sm:p-8 flex flex-col overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Sliders className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {prompt.title}
                </h3>
                <p className="text-xs text-slate-400">
                  Kustomisasi variabel prompt dinamis untuk injeksi ke AI Agent.
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

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1 custom-scrollbar">
            {/* Input Variables Form */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Parameter Input
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {prompt.variables.map((v) => (
                  <div key={v.key} className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                      <span>{v.label}</span>
                      <code className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                        {`{{${v.key}}}`}
                      </code>
                    </label>
                    {v.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        value={values[v.key] || ''}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, [v.key]: e.target.value }))
                        }
                        placeholder={v.placeholder}
                        className="w-full rounded-full liquid-glass border border-white/10 px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 font-mono"
                      />
                    ) : (
                      <input
                        type="text"
                        value={values[v.key] || ''}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, [v.key]: e.target.value }))
                        }
                        placeholder={v.placeholder}
                        className="w-full rounded-full liquid-glass border border-white/10 px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Live Hydrated Preview */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Live Hydrated Prompt Preview
              </h4>
              <div className="rounded-full bg-slate-950 border border-white/10 p-4 text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed shadow-inner">
                {hydratedPrompt}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
            <span className="text-[11px] text-slate-400 font-mono">
              Estimasi Tokens: ~{prompt.tokenEstimate}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-700 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 pl-5 pr-2 py-2 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-all duration-300 active:scale-[0.98] shadow-lg shadow-cyan-500/20 group"
              >
                <span>{copied ? 'Tersalin!' : 'Salin Prompt Terkustomisasi'}</span>
                <span className="w-6 h-6 rounded-full bg-slate-950/20 group-hover:bg-slate-950/30 flex items-center justify-center transition-colors">
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-slate-950" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-950" />
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
