# Technical Implementation Architecture: AI Hub & 9Router Frontend (Milestone M2)

> **Agent**: Explorer M2 (`explorer_m2_aihub`)  
> **Workspace**: `/home/apu/projects/apu.web.id`  
> **Target Scope**: Public AI Hub Portal, Interactive Models Showcase, Comparison Drawer, 1-Click Prompt Vault with Parameter Replacer, 9Router Local Gateway Guide with Live Health Badge & Multi-Language Snippets.  
> **Design Language**: Awwwards-Tier Glassmorphism, Double-Bezel (Doppelrand) Architecture, Button-in-Button CTAs, OLED Dark Mode (`#05050d`), Spring Easing (`cubic-bezier(0.32,0.72,0,1)`).

---

## 1. Executive Summary & Gap Analysis

### 1.1 Current State Analysis (`components/AiHubTab.tsx`)
The existing `AiHubTab.tsx` is a monolithic 380-line component with:
- Static 4-model list (DeepSeek, Claude, GPT-4o, Gemini) without interactive drawers, benchmarks comparison, pricing breakdown, or architectural deep dive.
- Basic prompt list with 4 hardcoded prompts and a simple copy button; lacking parameterization (`{{VARIABLES}}`), parameter replacer modal, tags, and category coverage.
- Basic static cURL box for 9Router without live health ping, multi-language snippets (TypeScript, Python, Go), or interactive cURL builder.
- Missing model comparison side-by-side matrix.

### 1.2 Target Architecture for Milestone M2
Deconstruct and modularize the AI Hub into a clean, highly extensible component directory `components/aihub/` orchestrated by `components/AiHubTab.tsx`:

```
components/
├── AiHubTab.tsx                      # Root Coordinator Tab Component
└── aihub/
    ├── types.ts                      # Shared TypeScript interfaces & types
    ├── data.ts                       # Verified model catalog, 7-category prompts, code snippets
    ├── AiModelCard.tsx               # Doppelrand model card with spec meters & drawer trigger
    ├── AiModelDrawer.tsx             # Slide-over/expanded drawer for deep architectural specs
    ├── AiModelComparisonModal.tsx    # Side-by-side multi-model comparison modal (2-3 models)
    ├── AiPromptCard.tsx              # Prompt card with 1-click copy & customize CTA
    ├── PromptVariableModal.tsx       # Dynamic parameter replacer modal ({{VAR}} parser)
    ├── NineRouterGuide.tsx           # Multi-language code tabs, gateway docs, cURL builder
    ├── NineRouterStatusBadge.tsx     # Real-time health polling widget (:20128/api/health)
    └── NineRouterCurlBuilder.tsx     # Dynamic cURL command generator form
```

---

## 2. Shared Data Models & Types (`components/aihub/types.ts`)

```typescript
export interface ModelCapability {
  vision: boolean;
  audioInput: boolean;
  videoInput: boolean;
  reasoning: boolean;
  thinkingMode: boolean;
  toolCalling: boolean;
  search: boolean;
  openWeights: boolean;
}

export interface ModelBenchmark {
  reasoningScore: number; // 0-100 (MATH-500 / GPQA)
  codingScore: number;    // 0-100 (SWE-bench / HumanEval)
  generalMMLU: number;    // 0-100 (MMLU-Pro)
}

export interface ModelPricing {
  inputPer1M: number;     // USD per 1M input tokens
  outputPer1M: number;    // USD per 1M output tokens
  cachedInputPer1M?: number;
}

export interface AiModelSpec {
  id: string;
  name: string;
  provider: 'DeepSeek AI' | 'Anthropic' | 'OpenAI' | 'Google DeepMind' | 'Meta' | 'NVIDIA' | 'Moonshot AI';
  providerSlug: string;
  tag: string;
  badgeColor: string;     // Tailwind classes
  accentColor: string;    // Hex code
  description: string;
  architecture: string;   // e.g. "671B MoE (37B active per token)"
  contextWindow: number;  // Number of tokens
  contextWindowLabel: string;
  maxOutputTokens: number;
  speedTps: number;
  speedLabel: string;     // e.g. "⚡ 95 t/s"
  pricing: ModelPricing;
  benchmarks: ModelBenchmark;
  capabilities: ModelCapability;
  bestFor: string[];
  sampleQuery: {
    prompt: string;
    expectedResponse: string;
    thoughtProcess?: string;
  };
}

export type PromptCategory =
  | 'coding'
  | 'reasoning'
  | 'agent'
  | 'system'
  | 'security'
  | 'uiux'
  | 'creative';

export interface PromptVariable {
  key: string;            // e.g. "LANGUAGE", "CODE"
  label: string;          // Human-readable label
  placeholder: string;    // Placeholder
  defaultValue: string;   // Fallback value
  type: 'text' | 'textarea';
}

export interface AiPrompt {
  id: string;
  title: string;
  category: PromptCategory;
  categoryLabel: string;
  description: string;
  tags: string[];
  recommendedModels: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  tokenEstimate: number;
  variables: PromptVariable[];
  promptTemplate: string;
}

export type CodeSnippetLang = 'curl' | 'typescript' | 'python' | 'go';

export interface CodeSnippetItem {
  lang: CodeSnippetLang;
  label: string;
  filename: string;
  code: string;
}
```

---

## 3. Data Catalog Fixtures (`components/aihub/data.ts`)

### 3.1 Model Catalog (6 SOTA Models)
1. **DeepSeek R1 / V3** (`deepseek-r1-v3`):
   - Provider: DeepSeek AI | Tag: Open-Weights King
   - Architecture: 671B MoE (37B active), Multi-head Latent Attention (MLA), DeepSeek-MoE
   - Context: 128,000 (128k) | Max Output: 8,192 (64k extended thinking) | Speed: 95 t/s
   - Pricing: Input $0.14/1M | Output $0.55/1M | Cache Hit $0.014/1M
   - Benchmarks: Reasoning 98/100 (MATH-500: 97.3%), Coding 96/100, MMLU-Pro 84.0%
   - Capabilities: Reasoning: true, ThinkingMode: true, OpenWeights: true, ToolCalling: true, Vision: false
2. **Claude 3.7 Sonnet** (`claude-3-7-sonnet`):
   - Provider: Anthropic | Tag: Hybrid Reasoning Leader
   - Architecture: Hybrid Reasoning Transformer with Dynamic Thinking Budget Control
   - Context: 200,000 (200k) | Max Output: 128,000 | Speed: 80 t/s
   - Pricing: Input $3.00/1M | Output $15.00/1M | Cache Write $3.75, Read $0.30
   - Benchmarks: Reasoning 99/100 (Tau-bench: 81.2%), Coding 99/100 (SWE-bench: 70.3%), MMLU-Pro 89.1%
   - Capabilities: Reasoning: true, ThinkingMode: true, Vision: true, ToolCalling: true, OpenWeights: false
3. **GPT-4o & o3-mini** (`gpt-4o-o3-mini`):
   - Provider: OpenAI | Tag: Multimodal SOTA
   - Architecture: Omni-Native Multimodal MoE & High-Efficiency STEM Reasoner
   - Context: 128,000 (128k) | Max Output: 16,384 | Speed: 110 t/s
   - Pricing: Input $2.50/1M | Output $10.00/1M
   - Benchmarks: Reasoning 97/100 (GPQA: 79.7%), Coding 95/100, Vision QA 90.2%
   - Capabilities: Vision: true, Audio: true, Video: true, ToolCalling: true, Reasoning: true
4. **Gemini 1.5 Pro & 2.0 Flash** (`gemini-1-5-pro-flash`):
   - Provider: Google DeepMind | Tag: 2 Million Context King
   - Architecture: Sparse MoE Transformer with Million-Token Multi-Head Memory
   - Context: 2,097,152 (2M Tokens) | Max Output: 65,536 | Speed: 140 t/s
   - Pricing: Input $1.25/1M (<128k) | Output $5.00/1M
   - Benchmarks: Multimodal 94.5%, Needle-in-Haystack 99.7%, Reasoning 93/100
   - Capabilities: Vision: true, Audio: true, Video: true, ToolCalling: true, Reasoning: true
5. **NVIDIA Nemotron-3 Super / Llama 3.3 70B** (`nvidia-nemotron-llama`):
   - Provider: NVIDIA | Tag: Enterprise NIM Relay
   - Architecture: 70B Dense / 120B Hybrid TensorRT-LLM Engine
   - Context: 128,000 (128k) | Max Output: 64,000 | Speed: 125 t/s
   - Pricing: Free via 9Router NVIDIA NIM Relay / Self-hostable
   - Benchmarks: Reasoning 92/100, Coding 93/100, MMLU 86.4%
   - Capabilities: OpenWeights: true, ToolCalling: true, Reasoning: true
6. **Kimi k2.6 & MiniMax M3** (`kimi-k2-6-minimax`):
   - Provider: Moonshot AI | Tag: 262k Single-Pass Output
   - Architecture: 1M Ultra-Long Context MoE with 262k Max Generation
   - Context: 1,048,576 (1M) | Max Output: 262,144 | Speed: 75 t/s
   - Pricing: Free via 9Router BZL Provider
   - Benchmarks: Reasoning 94/100, Coding 91/100, Long-Context 98/100
   - Capabilities: Reasoning: true, ThinkingMode: true, MassiveOutput: true

### 3.2 Curated Prompts Catalog (7 Disciplines)
1. `code-architect-reviewer` (Category: `coding`):
   - Title: Senior Architect Code Reviewer
   - Description: Comprehensive security audit, Big-O complexity analysis, anti-patterns identification, and zero-placeholder refactored code.
   - Variables: `{{LANGUAGE}}` (Default: "TypeScript / Next.js"), `{{CODE}}` (Default: "// Paste your source code here")
2. `reasoning-root-cause-engine` (Category: `reasoning`):
   - Title: First-Principles Root Cause Analyzer
   - Description: 5-Whys deep dive, deconstruction of facts vs assumptions, hypothesis matrix, and hotfix vs permanent fix.
   - Variables: `{{INCIDENT_SUMMARY}}` (Default: "Database connection pool exhaustion under 500 RPS load"), `{{SYSTEM_STACK}}` (Default: "PostgreSQL, Bun, Next.js 16, Prisma/Kysely")
3. `agent-vmodel-planner` (Category: `agent`):
   - Title: V-Model Autonomous Task Planner
   - Description: Multi-phase zero-hallucination agentic breakdown (Discovery, Incremental Execution, Self-Verification, Rollback trigger).
   - Variables: `{{OBJECTIVE}}` (Default: "Implement double-bezel card UI with spring physics in Tailwind CSS")
4. `system-zero-chatter-cli` (Category: `system`):
   - Title: Zero-Chatter High-Precision CLI Agent
   - Description: Strict system guardrails eliminating preamble, filler, and conversational fluff with 100% executable completeness.
   - Variables: `{{ROLE_NAME}}` (Default: "Arch Linux Sysadmin & TypeScript Specialist")
5. `security-sast-hunter` (Category: `security`):
   - Title: Zero-Trust SAST Vulnerability Hunter
   - Description: Static application security testing for BOLA, timing attacks, injection flaws, and race conditions with remediated patch.
   - Variables: `{{TARGET_SOURCE}}` (Default: "Authentication middleware with JWT & cookie handling")
6. `uiux-awwwards-double-bezel` (Category: `uiux`):
   - Title: Awwwards-Tier Micro-Interaction & Glassmorphism Spec
   - Description: Frontend specs for OLED (#05050d), Doppelrand architecture, Button-in-Button CTAs, and spring physics.
   - Variables: `{{COMPONENT_NAME}}` (Default: "Interactive AI Model Benchmarking Card")
7. `creative-tech-whitepaper` (Category: `creative`):
   - Title: Technical Whitepaper & Value Proposition Synthesizer
   - Description: Executive summary, architectural breakthroughs, competitive moat, and token ROI projections.
   - Variables: `{{PROJECT_NAME}}` (Default: "apu.web.id AI Hub & 9Router Gateway"), `{{TARGET_AUDIENCE}}` (Default: "AI Engineers, Fullstack Developers, & Tech Enthusiasts")

### 3.3 Multi-Language 9Router Snippets
- **cURL**: Standard chat completion and streaming SSE (`curl -N ...`) with `Authorization: Bearer <API_KEY>` and `oc/deepseek-v4-flash-free` or `ds/deepseek-reasoner`.
- **TypeScript**: `import OpenAI from 'openai'` using `baseURL: 'http://localhost:20128/v1'`, async iterable stream parsing.
- **Python**: `from openai import OpenAI` v1.x client with `base_url="http://localhost:20128/v1"`.
- **Go**: Native standard library `net/http` and `encoding/json` POST payload to `http://localhost:20128/v1/chat/completions`.

---

## 4. Component Hierarchy & Detailed Specifications

### 4.1 Component Breakdown

```
components/AiHubTab.tsx (Root Coordinator)
│
├── [ Hero Section with Ambient Orbs & Quick Metrics Bar ]
│   └── Quick Jump CTAs (Model Directory, Prompt Vault, 9Router Gateway Guide)
│
├── [ Model Directory Section ]
│   ├── Filter Bar (Provider Filter Tabs: All, DeepSeek, Anthropic, OpenAI, Google, NVIDIA, Moonshot + Text Search)
│   ├── Active Comparison Floating Bar (Visible when 1-3 models selected, displays avatars & "Bandingkan (N)" button)
│   ├── Grid of AiModelCard.tsx
│   │   ├── Double-bezel outer container (`p-1 rounded-[2.5rem] bg-white/5 border border-white/10`)
│   │   ├── Inner OLED container (`rounded-[calc(2.5rem-0.25rem)] bg-[#05050d]`)
│   │   ├── Model Header (Tag pill, Provider badge, Architecture line)
│   │   ├── Metric Meters (Context Window, Speed TPS, Reasoning ★, Coding ★, MMLU ★)
│   │   ├── Pricing Pill ($ Input / $ Output per 1M)
│   │   ├── Capability Badges (Vision, Audio, Reasoning, Tools, Open-Weights)
│   │   └── Action Row:
│   │       ├── "Detail Spesifikasi" (Opens AiModelDrawer)
│   │       └── "Bandingkan" Checkbox Button (Toggles selection for AiModelComparisonModal)
│   ├── AiModelDrawer.tsx (Slide-over drawer with full architectural details, cache pricing, sample prompt/response)
│   └── AiModelComparisonModal.tsx (Side-by-side table comparing selected 2-3 models)
│
├── [ 9Router AI Gateway Guide Section ]
│   ├── Header with NineRouterStatusBadge.tsx (Live polling http://localhost:20128/api/health)
│   ├── Architectural Diagram / Multi-provider explanation
│   ├── Tabbed Code Snippets Selector (cURL, TypeScript, Python, Go) with 1-click copy & syntax highlighting
│   └── NineRouterCurlBuilder.tsx (Interactive form to select model, prompt, stream, and copy customized cURL)
│
└── [ AI Prompt Library Section ]
    ├── Search & Category Filter Pills (all, coding, reasoning, agent, system, security, uiux, creative)
    ├── Grid of AiPromptCard.tsx
    │   ├── Category tag, Difficulty badge, Token estimate
    │   ├── Title & Description
    │   ├── Parameter badges (e.g. `{{LANGUAGE}}`, `{{CODE}}`)
    │   ├── Formatted prompt preview box
    │   └── Action Row:
    │       ├── 1-Click "Salin Prompt" (Instant copy with "Tersalin!" toast)
    │       └── "Kustomisasi Parameter" (Opens PromptVariableModal)
    └── PromptVariableModal.tsx (Dynamic input form for prompt variables, live hydrated preview, and 1-click copy)
```

---

## 5. UI/UX & Visual Architecture Alignment

### 5.1 Doppelrand (Double-Bezel) Pattern
```tsx
<div className="p-1 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-2xl backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-cyan-500/30 group">
  <div className="rounded-[calc(2.5rem-0.25rem)] bg-[#05050d] p-6 sm:p-8 h-full flex flex-col justify-between">
    {/* Inner Card Content */}
  </div>
</div>
```

### 5.2 Button-in-Button CTA Pattern
```tsx
<button
  onClick={handleAction}
  className="inline-flex items-center gap-2.5 pl-5 pr-2 py-2 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-all duration-300 active:scale-[0.98] shadow-lg shadow-cyan-500/20 group"
>
  <span>Eksplorasi Model AI</span>
  <span className="w-6 h-6 rounded-full bg-slate-950/20 group-hover:bg-slate-950/30 flex items-center justify-center transition-colors">
    <ArrowUpRight className="w-3.5 h-3.5 text-slate-950" />
  </span>
</button>
```

### 5.3 Live Health Check Polling (`NineRouterStatusBadge.tsx`)
- Fetches `/api/health` from `http://localhost:20128/api/health` with a 2-second timeout and 10-second polling interval.
- When online: displays emerald pulsing dot `w-2 h-2 rounded-full bg-emerald-400 animate-ping`, latency in milliseconds (e.g. `24ms`), and status `Active (Port :20128)`.
- When offline: displays muted rose dot, status `Gateway Offline (Offline Mode)`, and a manual "Refresh Ping" icon button.

---

## 6. Implementation Step-by-Step Plan for Implementer

| Step | Target File | Action | Details |
|------|-------------|--------|---------|
| 1 | `components/aihub/types.ts` | Create | Define TypeScript interfaces for models, prompts, variables, benchmarks, pricing, snippets. |
| 2 | `components/aihub/data.ts` | Create | Populate comprehensive data fixtures for 6 AI models, 7 curated prompt templates, and multi-language snippets. |
| 3 | `components/aihub/NineRouterStatusBadge.tsx` | Create | Live health probe component with ping latency calculation, online/offline badge, and manual refresh. |
| 4 | `components/aihub/NineRouterCurlBuilder.tsx` | Create | Interactive cURL command generator with model selection, prompt input, streaming checkbox, and 1-click copy. |
| 5 | `components/aihub/NineRouterGuide.tsx` | Create | 9Router documentation, architecture overview, multi-language tabs (cURL, TS, Python, Go), and cURL builder integration. |
| 6 | `components/aihub/PromptVariableModal.tsx` | Create | Interactive modal for parameterized prompts (`{{KEY}}`), text inputs, live preview, and 1-click copy. |
| 7 | `components/aihub/AiPromptCard.tsx` | Create | Double-bezel prompt card with category pills, token estimate, 1-click copy with toast, and "Kustomisasi" button. |
| 8 | `components/aihub/AiModelDrawer.tsx` | Create | Deep specification slide-over drawer displaying architecture, context limits, pricing math, capabilities, and sample queries. |
| 9 | `components/aihub/AiModelComparisonModal.tsx` | Create | Side-by-side comparison modal for 2-3 selected models with radar/bar metrics and comparison table. |
| 10 | `components/aihub/AiModelCard.tsx` | Create | Double-bezel model card with benchmark meters, speed TPS, pricing, drawer toggle, and comparison checkbox. |
| 11 | `components/AiHubTab.tsx` | Update | Re-orchestrate AI Hub with Hero Banner, Quick Metrics, Model Directory, 9Router Gateway Guide, Prompt Library, and Floating Comparison Bar. |
| 12 | Root Verification | Run Tests | Execute `NODE_OPTIONS="--max-old-space-size=4096" bun run build` to verify 0 TypeScript errors. |

---

## 7. Verification Method & Test Command Matrix

1. **Build & Typecheck**:
   ```bash
   NODE_OPTIONS="--max-old-space-size=4096" bun run build
   ```
   *Expected: Zero compilation errors, clean Next.js 16 build.*

2. **9Router Health Probe Verification**:
   ```bash
   curl -s http://localhost:20128/api/health
   ```
   *Expected: `{"ok":true}`.*

3. **HTTP 200 Liveness Check**:
   ```bash
   curl -s -i http://localhost:3100/ | grep "HTTP/1.1 200"
   ```
   *Expected: `HTTP/1.1 200 OK`.*

4. **Interactive Feature Verification**:
   - Model cards render benchmark meters (Reasoning, Coding, MMLU).
   - Clicking "Detail Spesifikasi" opens `AiModelDrawer`.
   - Selecting 2 models activates the comparison bar and opens `AiModelComparisonModal`.
   - Prompt cards copy to clipboard and show green "Tersalin!" badge.
   - Parameter Replacer Modal correctly replaces `{{KEY}}` placeholders and copies hydrated prompt.
   - 9Router code tabs switch seamlessly between cURL, TypeScript, Python, and Go.
