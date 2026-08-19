'use client';

import React, { useState } from 'react';
import { Terminal, Copy, Check, Sliders, Sparkles } from 'lucide-react';

const AVAILABLE_MODELS = [
  { id: 'oc/deepseek-v4-flash-free', label: 'DeepSeek V4 Flash (Free Tier)' },
  { id: 'ds/deepseek-reasoner', label: 'DeepSeek R1 Reasoner (CoT)' },
  { id: 'bzl/gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro Preview' },
  { id: 'bzl/kimi-k2.6', label: 'Moonshot Kimi k2.6 (Long-Output)' },
  { id: 'nvidia/meta/llama-3.1-70b-instruct', label: 'NVIDIA NIM Llama 3.1 70B' },
];

export const NineRouterCurlBuilder: React.FC = () => {
  const [model, setModel] = useState('oc/deepseek-v4-flash-free');
  const [prompt, setPrompt] = useState('Jelaskan cara kerja event loop di Node.js dan Bun!');
  const [temperature, setTemperature] = useState('0.3');
  const [stream, setStream] = useState(true);
  const [copied, setCopied] = useState(false);

  const curlCommand = `curl -N http://localhost:20128/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer \${NINEROUTER_API_KEY:-free-local}" \\
  -d '{
    "model": "${model}",
    "messages": [
      { "role": "system", "content": "Anda adalah asisten AI teknis profesional." },
      { "role": "user", "content": "${prompt.replace(/"/g, '\\"')}" }
    ],
    "temperature": ${temperature},
    "stream": ${stream}
  }'`;

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-1 rounded-full bg-slate-900 border border-slate-700 border border-white/10 shadow-xl ">
      <div className="rounded-full bg-slate-950 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-slate-200">Interactive cURL Generator</h4>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-full border border-white/10">
            Endpoint: /v1/chat/completions
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Model Target</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              aria-label="Model Target"
              className="w-full rounded-full bg-slate-900/80 border border-white/10 px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500/50"
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium flex justify-between">
              <span>Temperature</span>
              <span className="font-mono text-cyan-400">{temperature}</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              aria-label="Temperature"
              className="w-full accent-cyan-400 mt-2"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Streaming Output</label>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="stream-check"
                checked={stream}
                onChange={(e) => setStream(e.target.checked)}
                className="rounded accent-cyan-400"
              />
              <label htmlFor="stream-check" className="text-slate-300 cursor-pointer">
                Enable Server-Sent Events (SSE)
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <label className="text-slate-400 font-medium">User Prompt Content</label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            aria-label="User Prompt Content"
            placeholder="Masukkan prompt..."
            className="w-full rounded-full bg-slate-900/80 border border-white/10 px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Generated Command Output */}
        <div className="relative rounded-full bg-slate-950/90 border border-white/10 p-4 font-mono text-[11px] text-cyan-300/90 overflow-x-auto">
          <pre className="whitespace-pre">{curlCommand}</pre>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 active:scale-95 transition-all text-xs font-semibold"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin cURL</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
