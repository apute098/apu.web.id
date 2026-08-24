'use client';

import React, { useState } from 'react';
import {
  Bot,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  Search,
  Sparkles,
  Zap,
  Globe,
  ShieldCheck,
  BookOpen,
  Code2,
  Cpu,
  Layers,
  Play,
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

interface AgentHubTabProps {
  onNavigateTab: (tab: any) => void;
}

export function AgentHubTab({ onNavigateTab }: AgentHubTabProps) {
  const [activeSection, setActiveSection] = useState<'agents' | 'tools'>('agents');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (id: string, text: string) => {
    triggerHaptic('light');
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const agentRepos = [
    {
      id: 'aider',
      name: 'Aider',
      desc: 'AI pair programming di terminal terintegrasi langsung dengan Git repo lokal.',
      github: 'https://github.com/Aider-AI/aider',
      badge: 'CLI INSTALLED',
      badgeColor: 'text-[#10b981] bg-[#10b981]/15 border-[#10b981]/30',
      cmd: 'aider --openai-api-base http://127.0.0.1:20128/v1 --openai-api-key not-needed',
      lang: 'Python / Git',
    },
    {
      id: 'browser-use',
      name: 'Browser Use',
      desc: 'Agent autonomous yang mengontrol browser Chromium untuk otomasi web & task completion.',
      github: 'https://github.com/browser-use/browser-use',
      badge: 'PYTHON SDK',
      badgeColor: 'text-[#00f2fe] bg-[#00f2fe]/15 border-[#00f2fe]/30',
      cmd: 'source ~/.agents-env/bin/activate && python -c "from browser_use import Agent; print(\'Browser-Use Ready\')"',
      lang: 'Python / Playwright',
    },
    {
      id: 'openhands',
      name: 'OpenHands',
      desc: 'Platform software developer agent autonomous untuk refactor, bugfix, & eksekusi terminal.',
      github: 'https://github.com/OpenHands/OpenHands',
      badge: 'DOCKER / WEB',
      badgeColor: 'text-[#8b5cf6] bg-[#8b5cf6]/15 border-[#8b5cf6]/30',
      cmd: 'docker run -it --pull=always -e SANDBOX_RUNTIME_CONTAINER_IMAGE=docker.all-hands.dev/all-hands-ai/runtime:0.28-nikola -v /var/run/docker.sock:/var/run/docker.sock -p 3001:3000 ghcr.io/all-hands-ai/openhands:0.28',
      lang: 'Python / React',
    },
    {
      id: 'agno',
      name: 'Agno',
      desc: 'High-performance multi-modal agent framework dengan persistent memory & reasoning tools.',
      github: 'https://github.com/agno-agi/agno',
      badge: 'FRAMEWORK',
      badgeColor: 'text-[#00f2fe] bg-[#00f2fe]/15 border-[#00f2fe]/30',
      cmd: 'source ~/.agents-env/bin/activate && python -c "from agno.agent import Agent; print(\'Agno Ready\')"',
      lang: 'Python',
    },
    {
      id: 'smolagents',
      name: 'SmolAgents',
      desc: 'Framework agent super ringan dari HuggingFace yang mengeksekusi kode Python langsung.',
      github: 'https://github.com/huggingface/smolagents',
      badge: 'LIGHTWEIGHT',
      badgeColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      cmd: 'source ~/.agents-env/bin/activate && python -c "from smolagents import CodeAgent; print(\'SmolAgents Ready\')"',
      lang: 'Python / HF',
    },
    {
      id: 'pydantic-ai',
      name: 'Pydantic AI',
      desc: 'GenAI agent framework type-safe dengan validasi data ketat berbasis Pydantic.',
      github: 'https://github.com/pydantic/pydantic-ai',
      badge: 'TYPE SAFE',
      badgeColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
      cmd: 'source ~/.agents-env/bin/activate && python -c "from pydantic_ai import Agent; print(\'PydanticAI Ready\')"',
      lang: 'Python / Types',
    },
    {
      id: 'crewai',
      name: 'CrewAI',
      desc: 'Multi-agent orchestration framework untuk membagi tugas ke tim agent dengan role spesifik.',
      github: 'https://github.com/crewAIInc/crewAI',
      badge: 'MULTI-AGENT',
      badgeColor: 'text-[#f43f5e] bg-[#f43f5e]/15 border-[#f43f5e]/30',
      cmd: 'source ~/.agents-env/bin/activate && python -c "from crewai import Agent, Crew; print(\'CrewAI Ready\')"',
      lang: 'Python',
    },
    {
      id: 'langgraph',
      name: 'LangGraph',
      desc: 'Stateful multi-actor agent workflows berbasis graf siklus terarah (DAG/Cyclic graphs).',
      github: 'https://github.com/langchain-ai/langgraph',
      badge: 'GRAPH WORKFLOW',
      badgeColor: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
      cmd: 'source ~/.agents-env/bin/activate && python -c "from langgraph.graph import StateGraph; print(\'LangGraph Ready\')"',
      lang: 'Python / TS',
    },
    {
      id: 'autogen',
      name: 'AutoGen',
      desc: 'Framework percakapan multi-agent modular dari Microsoft Research.',
      github: 'https://github.com/microsoft/autogen',
      badge: 'MICROSOFT',
      badgeColor: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
      cmd: 'source ~/.agents-env/bin/activate && python -c "import autogen; print(\'AutoGen Ready\')"',
      lang: 'Python',
    },
    {
      id: 'llama-index',
      name: 'LlamaIndex',
      desc: 'Data framework untuk menyambungkan LLM/Agent ke dokumen privat, database & REST API.',
      github: 'https://github.com/run-llama/llama_index',
      badge: 'DATA RAG',
      badgeColor: 'text-[#8b5cf6] bg-[#8b5cf6]/15 border-[#8b5cf6]/30',
      cmd: 'source ~/.agents-env/bin/activate && python -c "import llama_index.core; print(\'LlamaIndex Ready\')"',
      lang: 'Python / TS',
    },
    {
      id: 'mastra',
      name: 'Mastra',
      desc: 'Framework TypeScript modern untuk membangun agent, workflow terintegrasi, & memory store.',
      github: 'https://github.com/mastra-ai/mastra',
      badge: 'TYPESCRIPT',
      badgeColor: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30',
      cmd: 'npx create-mastra@latest',
      lang: 'TypeScript',
    },
    {
      id: 'letta',
      name: 'Letta (MemGPT)',
      desc: 'Stateful agent architecture dengan memori persisten tanpa batas antar sesi.',
      github: 'https://github.com/letta-ai/letta',
      badge: 'LONG-TERM MEMORY',
      badgeColor: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
      cmd: 'source ~/.agents-env/bin/activate && letta run',
      lang: 'Python',
    },
    {
      id: 'cline',
      name: 'Cline',
      desc: 'Autonomous coding agent extension di VS Code / OpenVSX dengan kontrol terminal & file diff.',
      github: 'https://github.com/cline/cline',
      badge: 'IDE EXTENSION',
      badgeColor: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
      cmd: 'code --install-extension saoudrizwan.claude-dev',
      lang: 'TypeScript / VSCode',
    },
  ];

  const webTools = [
    { name: 'Cobalt Tools', category: 'Media', desc: 'Download video medsos bebas iklan', url: 'https://cobalt.tools' },
    { name: 'Photopea', category: 'Media', desc: 'Photoshop di web full gratis', url: 'https://photopea.com' },
    { name: 'Temp Mail', category: 'Privacy', desc: 'Email sementara disposable', url: 'https://temp-mail.org' },
    { name: 'TinyWow', category: 'Utility', desc: '100+ converter PDF & video', url: 'https://tinywow.com' },
    { name: 'Archive.org', category: 'Research', desc: 'Wayback machine arsip web', url: 'https://archive.org' },
    { name: 'LibGen', category: 'Research', desc: 'Pustaka paper & buku ilmiah', url: 'https://libgen.li' },
    { name: 'Sci-Hub', category: 'Research', desc: 'Download artikel jurnal berbayar', url: 'https://sci-hub.al' },
    { name: 'AlternativeTo', category: 'Utility', desc: 'Cari alternatif software gratis', url: 'https://alternativeto.net' },
    { name: 'Remove.bg', category: 'Media', desc: 'Hapus background foto instan', url: 'https://remove.bg' },
    { name: 'Cleanup Pictures', category: 'Media', desc: 'Hapus objek dari foto via AI', url: 'https://cleanup.pictures' },
    { name: 'Squoosh', category: 'Media', desc: 'Kompresi gambar webp/avif', url: 'https://squoosh.app' },
    { name: 'Excalidraw', category: 'Design', desc: 'Whiteboard sketsa arsitektur', url: 'https://excalidraw.com' },
    { name: 'Ray.so', category: 'Dev', desc: 'Screenshot source code estetik', url: 'https://ray.so' },
    { name: 'Carbon', category: 'Dev', desc: 'Code image generator', url: 'https://carbon.now.sh' },
    { name: 'Have I Been Pwned', category: 'Security', desc: 'Cek kebocoran credential email', url: 'https://haveibeenpwned.com' },
    { name: 'VirusTotal', category: 'Security', desc: 'Multi-antivirus scan URL & file', url: 'https://virustotal.com' },
    { name: 'Privnote', category: 'Privacy', desc: 'Catatan self-destruct rahasia', url: 'https://privnote.com' },
    { name: 'File.io', category: 'Privacy', desc: 'File sharing 1-time download', url: 'https://file.io' },
    { name: 'Radio Garden', category: 'Media', desc: 'Streaming radio globe 3D dunia', url: 'https://radio.garden' },
    { name: 'Music For Programming', category: 'Dev', desc: 'Synth ambient fokus koding', url: 'https://musicforprogramming.net' },
    { name: 'Anna’s Archive', category: 'Research', desc: 'Pencarian jutaan buku & dokumen', url: 'https://annas-archive.org' },
    { name: 'Connected Papers', category: 'Research', desc: 'Grafik keterkaitan paper ilmiah', url: 'https://connectedpapers.com' },
    { name: 'Phind', category: 'Dev', desc: 'AI search engine untuk developer', url: 'https://phind.com' },
    { name: 'Regex101', category: 'Dev', desc: 'Debugger regex interaktif', url: 'https://regex101.com' },
    { name: 'ExplainShell', category: 'Dev', desc: 'Visualizer command bash Linux', url: 'https://explainshell.com' },
    { name: 'Flightradar24', category: 'Utility', desc: 'Radar tracking pesawat live', url: 'https://flightradar24.com' },
  ];

  const filteredAgents = agentRepos.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.desc.toLowerCase().includes(search.toLowerCase()) ||
      a.lang.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTools = webTools.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.desc.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-[#00f2fe]" />
            AI Agents Matrix & Power Tools Hub
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Direct integration with local 9Router (:20128) & 50 essential open-web productivity tools
          </p>
        </div>

        {/* Section Toggle */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveSection('agents');
            }}
            className={`px-4 py-1.5 rounded-full font-semibold transition-all ${
              activeSection === 'agents'
                ? 'bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/40 shadow-sm shadow-[#00f2fe]/20'
                : 'bg-white/[0.04] text-slate-400 hover:text-white'
            }`}
          >
            13 AI Agents ({agentRepos.length})
          </button>
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveSection('tools');
            }}
            className={`px-4 py-1.5 rounded-full font-semibold transition-all ${
              activeSection === 'tools'
                ? 'bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/40 shadow-sm shadow-[#8b5cf6]/20'
                : 'bg-white/[0.04] text-slate-400 hover:text-white'
            }`}
          >
            Power Tools ({webTools.length})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md w-full">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Filter ${activeSection === 'agents' ? 'agents (name, lang, sdk)...' : 'tools (name, category)...'}`}
          className="w-full pl-9 pr-4 py-2 bg-black/50 border border-white/[0.08] focus:border-[#00f2fe] rounded-full text-xs text-white placeholder:text-slate-500 outline-none font-mono transition-all"
        />
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
      </div>

      {/* SECTION 1: 13 AI AGENT FRAMEWORKS */}
      {activeSection === 'agents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredAgents.map((agent) => (
            <div key={agent.id} className="doppelrand-shell flex flex-col justify-between">
              <div className="doppelrand-core h-full flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-extrabold text-white text-base tracking-tight">{agent.name}</h3>
                      <span className="text-[10px] font-mono text-slate-500">{agent.lang}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border ${agent.badgeColor}`}>
                      {agent.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed my-2">
                    {agent.desc}
                  </p>

                  {/* Terminal Run Command Snippet */}
                  <div className="bg-black/60 rounded-xl p-2.5 border border-white/[0.06] font-mono text-[11px] text-slate-300 relative group my-2">
                    <div className="text-[9px] text-slate-500 uppercase mb-1 flex items-center justify-between">
                      <span>9Router CLI Exec:</span>
                      <button
                        onClick={() => copyToClipboard(agent.id, agent.cmd)}
                        className="text-[#00f2fe] hover:underline flex items-center gap-1"
                      >
                        {copiedId === agent.id ? <Check className="w-3 h-3 text-[#10b981]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === agent.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="truncate text-[#00f2fe]">{agent.cmd}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                  <a
                    href={agent.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 btn-nested group"
                  >
                    <span>GitHub Repo</span>
                    <div className="btn-nested-icon">
                      <ExternalLink className="w-3.5 h-3.5 text-[#00f2fe]" />
                    </div>
                  </a>

                  <button
                    onClick={() => {
                      triggerHaptic('medium');
                      onNavigateTab('terminal');
                    }}
                    className="p-2.5 rounded-full bg-white/[0.04] hover:bg-[#00f2fe]/20 text-slate-400 hover:text-[#00f2fe] transition-colors"
                    title="Open in Terminal"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 2: 50 POWER TOOLS DIRECTORY */}
      {activeSection === 'tools' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredTools.map((tool, idx) => (
            <div key={idx} className="doppelrand-shell">
              <div className="doppelrand-core p-3.5 flex flex-col justify-between h-full space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">{tool.name}</h4>
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/[0.04] text-[#8b5cf6] border border-white/[0.06]">
                      {tool.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">{tool.desc}</p>
                </div>

                <a
                  href={tool.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full btn-nested group text-xs py-1.5"
                >
                  <span className="truncate">{tool.url.replace('https://', '')}</span>
                  <div className="btn-nested-icon">
                    <ExternalLink className="w-3 h-3 text-[#00f2fe]" />
                  </div>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
