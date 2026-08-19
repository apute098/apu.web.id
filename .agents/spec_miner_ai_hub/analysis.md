# Technical Specification & Feature Mining: Public AI Hub Portal & 9Router AI Gateway

> **Workspace**: `/home/apu/projects/apu.web.id`  
> **Agent**: Spec Miner (`spec_miner_ai_hub`)  
> **Target Requirement**: R1 — Public AI Hub Portal & Knowledge Directory (Interactive Models Showcase, 1-Click Copy AI Prompt Library, 9Router AI Gateway Integration Guide)  
> **Design Alignment**: R3 — Awwwards-Tier Glassmorphism, Double-Bezel (Doppelrand) Architecture, OLED Dark Mode (`#05050d`), Spring Cubic-Bezier Transitions (`cubic-bezier(0.32,0.72,0,1)`).

---

## Executive Summary

The **Public AI Hub Portal & Knowledge Directory** on `apu.web.id` is designed as Indonesia's premier public AI knowledge center, model benchmarking showcase, curated prompt repository, and local AI gateway interface. It bridges cutting-edge LLM advancements (DeepSeek R1/V3, Claude 3.7 Sonnet, GPT-4o/o3-mini, Gemini 1.5/2.0) with local gateway infrastructure (9Router at `http://localhost:20128/v1`).

This specification document outlines the exact data structures, component breakdowns, interactive playground mechanics, multi-language integration snippets, and UX state machines required to implement or enhance the AI Hub.

---

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | AI Models Showcase | Multi-Model Architecture & Specs Matrix | Rich cards displaying model specs (DeepSeek R1/V3, Claude 3.7 Sonnet, GPT-4o, Gemini 1.5/2.0), context windows (128k to 2M), token throughput (t/s), pricing, and benchmark scores (Reasoning, Coding, Math). | Filter by provider/category, search query | Filtered model grid with double-bezel cards & spec meters | Fallback to "No models found matching query" | Codebase `AiHubTab.tsx` & LLM ecosystem specs |
| 2 | AI Models Showcase | Side-by-Side Model Comparison Drawer | Modal comparing 2-3 selected models across context window, reasoning benchmarks (MMLU-Pro, MATH-500, SWE-bench), cost per 1M tokens, latency, and capabilities. | Selected model IDs `modelA`, `modelB` | Comparative table & radar/bar benchmark visual | Max 3 models selection limit notification | Requirements R1 & System Design |
| 3 | AI Playground | Interactive Query Simulator & Runner | Interactive playground allowing users to select an AI model, choose preset tasks, adjust temperature/tokens, and simulate or run queries with streaming character animation, latency tracking (ms), and cost estimator. | `modelId`, `prompt`, `systemPrompt`, `temperature`, `maxTokens` | Streaming output text, token count, t/s meter, cost calculation | Validation on empty prompt; graceful timeout on network error | Requirements R1 & 9Router capability probe |
| 4 | AI Playground | Live 9Router Gateway Execution Proxy | Public users can toggle between "Simulated Runner" (instant offline client-side simulation) and "Live 9Router Gateway" (proxies to `http://localhost:20128/v1/chat/completions` if available). | User prompt + gateway endpoint | Real streaming SSE completion | Fallback to simulated mode if gateway is unreachable or offline | `curl http://localhost:20128/api/health` |
| 5 | Prompt Library | 1-Click Copy AI Prompt Vault | Categorized curated prompts (Coding, Reasoning, Agentic Workflows, System Prompts, Security Audits, UI/UX, Creative) with 1-click clipboard copy, visual feedback ("Tersalin!"), and tag filtering. | Click copy button on prompt card | Clipboard payload + 2.5s green confirmation badge | Fallback to `document.execCommand('copy')` if Clipboard API blocked | Codebase `AiHubTab.tsx` & Original Request |
| 6 | Prompt Library | Dynamic Variable Replacer Modal | Allows parameterized prompts (e.g. `{{LANGUAGE}}`, `{{CODE}}`, `{{TARGET}}`) to be customized via an interactive form before copying or sending to Playground. | Variable key-value pairs | Hydrated prompt string with replaced tokens | Highlights missing required fields | Requirement R1 Prompt Engineering standard |
| 7 | Prompt Library | "Send to Playground" Action | Direct CTA on every prompt card that preloads the prompt and recommended model directly into the AI Playground Simulator for immediate execution. | Prompt object | Activates Playground section with pre-filled inputs | Smooth scrolls to `#playground` | System architecture flow |
| 8 | 9Router Gateway | Gateway Architecture & Overview | Visual guide explaining 9Router as a multi-provider AI gateway with single API key, auto-fallback cascades, and unified OpenAI-compatible REST API. | Documentation trigger | Visual architecture diagram + provider list (`oc/`, `nvidia/`, `openrouter/`, `ds/`, `bzl/`) | N/A | `/home/apu/.agents/skills/9router/SKILL.md` |
| 9 | 9Router Gateway | Live Gateway Health Ping Widget | Real-time status badge that probes `http://localhost:20128/api/health` and displays online/offline status, ping latency in ms, and active model count. | Interval timer (10s) | Status badge (Emerald pulse when online, Rose when offline, latency ms) | Shows "Offline / Gateway Paused" gracefully on error | Live probing of `http://localhost:20128/api/health` |
| 10 | 9Router Gateway | Multi-Language Code Snippets | Tabbed code blocks with 1-click copy for cURL (standard, streaming, reasoning), Python (OpenAI SDK), TypeScript (OpenAI SDK / Fetch), Go, and Rust. | Language tab selector | Syntax-highlighted code with copy button | Formats code with dynamic host replacement | Requirements R1 & SKILL.md |
| 11 | 9Router Gateway | Interactive cURL Command Builder | Form allowing users to pick model from 9Router catalog, enter message, set streaming flag, and auto-generate the exact cURL command with 1-click copy. | Model selection, message text, stream boolean | Dynamically formatted cURL command | Sanitizes special characters and quotes | System integration UX |
| 12 | Navigation & UI | Floating Glass Navbar & Doppelrand Design | Floating island glass navbar, nested double-bezel cards, OLED dark mode `#05050d`, smooth spring cubic-bezier transitions (`cubic-bezier(0.32,0.72,0,1)`). | User interaction / viewport scroll | High-end visual aesthetics with responsive mobile bottom bar | Fully responsive down to 320px mobile | Requirements R3 & Global CSS |

---

## Edge Cases

| # | Feature | Input / Condition | Observed / Expected Behavior |
|---|---------|-------------------|-----------------------------|
| 1 | 1-Click Copy | Browser has Clipboard API permissions disabled / insecure HTTP context. | Gracefully fall back to textarea selection + `document.execCommand('copy')` with user feedback. |
| 2 | Prompt Variable Replacer | User leaves variable fields empty and clicks "Copy Customized". | Keep default placeholder values intact (e.g. `{{LANGUAGE}}` -> `TypeScript`) and notify user. |
| 3 | 9Router Health Ping | 9Router daemon is stopped or port 20128 is unreachable. | Health badge flips to "Gateway Offline", latency displays "N/A", Playground auto-switches to "Simulated Mode". |
| 4 | Playground Token Stream | User inputs extremely long prompt (>50,000 chars). | Token counter updates dynamically, streaming simulation paces output with chunking to avoid browser UI thread freeze. |
| 5 | Model Filter / Search | User enters search term matching 0 models or prompts. | Displays custom zero-state empty illustration with "Reset Filter" button. |
| 6 | Mobile Viewport (<640px) | User views Model Comparison Modal on narrow phone screen. | Comparison table transitions to vertical stacked card view with horizontal swipe for metrics. |
| 7 | Multi-Language Snippets | User copies code snippet on mobile device. | Pre-formats code without tabs/extra indent, copies clean snippet, shows toast. |
| 8 | Thinking / Reasoning Tags | Model response contains `<think>...</think>` reasoning chain. | Collapsible "Reasoning Process" drawer rendered with subtle amber border, distinguishing thought steps from final response. |

---

## 1. Deep AI Models Showcase Specification

### 1.1 Verified AI Models Data Catalog
The showcase features 6 leading state-of-the-art models representing different paradigms:

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
  reasoningScore: number; // 0 - 100 (e.g. MATH-500, GPQA)
  codingScore: number;    // 0 - 100 (e.g. SWE-bench, HumanEval)
  generalMMLU: number;    // 0 - 100 (e.g. MMLU-Pro)
}

export interface ModelPricing {
  inputPer1M: number;     // USD per 1M input tokens
  outputPer1M: number;    // USD per 1M output tokens
  cachedInputPer1M?: number;
}

export interface AiModelSpec {
  id: string;
  name: string;
  provider: 'DeepSeek AI' | 'Anthropic' | 'OpenAI' | 'Google DeepMind' | 'Meta' | 'NVIDIA';
  providerSlug: string;
  tag: string;
  badgeColor: string;     // Tailwind color class
  accentColor: string;    // Hex code for charts/borders
  description: string;
  architecture: string;   // e.g. "671B MoE (37B active)", "Dense Hybrid Transformer"
  contextWindow: number;  // In tokens (e.g. 131072, 200000, 2000000)
  contextWindowLabel: string;
  maxOutputTokens: number;
  speedTps: number;       // Average tokens per second
  speedLabel: string;     // e.g. "⚡ 95 t/s"
  pricing: ModelPricing;
  benchmarks: ModelBenchmark;
  capabilities: ModelCapability;
  bestFor: string[];
  recommendedPrompts: string[]; // IDs of prompts
  sampleQuery: {
    prompt: string;
    expectedResponse: string;
    thoughtProcess?: string;
  };
}
```

### 1.2 Model Catalog Data Fixtures

1. **DeepSeek R1 / V3**
   - **ID**: `deepseek-r1-v3`
   - **Provider**: DeepSeek AI (Open-Weights Leader)
   - **Architecture**: 671B MoE Total / 37B Active per Token, Multi-head Latent Attention (MLA), DeepSeek-MoE
   - **Context Window**: 128,000 tokens (128K)
   - **Max Output**: 8,192 tokens (with 64K extended thinking)
   - **Throughput**: ~95 tokens/sec
   - **Pricing**: Input $0.14 / 1M tokens | Output $0.55 / 1M tokens (Cache Hit $0.014 / 1M)
   - **Benchmarks**: Reasoning ★ 98/100 (MATH-500: 97.3%), Coding ★ 96/100 (Codeforces: 96.3 percentile), MMLU-Pro: 84.0%
   - **Capabilities**: Reasoning=true, ThinkingMode=true, ToolCalling=true, OpenWeights=true, Vision=false
   - **Best For**: Deep mathematical reasoning, complex algorithmic problem solving, massive code refactoring with zero cost overhead.

2. **Claude 3.7 Sonnet**
   - **ID**: `claude-3-7-sonnet`
   - **Provider**: Anthropic
   - **Architecture**: Hybrid Reasoning Transformer with Dynamic Thinking Budget Control
   - **Context Window**: 200,000 tokens (200K)
   - **Max Output**: 128,000 tokens (Extended thinking mode)
   - **Throughput**: ~80 tokens/sec
   - **Pricing**: Input $3.00 / 1M tokens | Output $15.00 / 1M tokens (Prompt Caching Write $3.75, Read $0.30)
   - **Benchmarks**: Reasoning ★ 99/100 (Tau-bench: 81.2%), Coding ★ 99/100 (SWE-bench Verified: 70.3%), MMLU-Pro: 89.1%
   - **Capabilities**: Reasoning=true, ThinkingMode=true (hybrid toggle), ToolCalling=true, Vision=true, OpenWeights=false
   - **Best For**: Full-stack web application development, large multi-file codebase refactoring, complex system architecture blueprints.

3. **GPT-4o & o3-mini**
   - **ID**: `gpt-4o-o3-mini`
   - **Provider**: OpenAI
   - **Architecture**: Omni-Native Multimodal MoE & High-Efficiency STEM Reasoner
   - **Context Window**: 128,000 tokens (128K) / 200,000 for o3-mini
   - **Max Output**: 16,384 tokens / 100,000 for o3-mini
   - **Throughput**: ~110 tokens/sec
   - **Pricing**: GPT-4o: $2.50 / 1M input, $10.00 / 1M output | o3-mini: $1.10 / 1M input, $4.40 / 1M output
   - **Benchmarks**: Reasoning ★ 97/100 (GPQA Diamond: 79.7%), Coding ★ 95/100, Vision QA: 90.2%
   - **Capabilities**: Vision=true, AudioInput=true, VideoInput=true, ToolCalling=true, Reasoning=true
   - **Best For**: Native voice & vision processing, real-time agent tool-calling pipelines, high-speed API production workloads.

4. **Gemini 1.5 Pro & 2.0 Flash**
   - **ID**: `gemini-1-5-pro-flash`
   - **Provider**: Google DeepMind
   - **Architecture**: Sparse MoE Transformer with Million-Token Multi-Head Memory
   - **Context Window**: 2,097,152 tokens (2 Million Tokens)
   - **Max Output**: 8,192 tokens / 65,536 for 2.0 Flash
   - **Throughput**: ~140 tokens/sec
   - **Pricing**: 1.5 Pro: $1.25 / 1M input (<128k), $5.00 / 1M output | 2.0 Flash: $0.075 / 1M input
   - **Benchmarks**: Multimodal Audio/Video: 94.5%, Needle-In-A-Haystack (1M tokens): 99.7%, Reasoning ★ 93/100
   - **Capabilities**: Vision=true, AudioInput=true, VideoInput=true, MassiveContext=true, ToolCalling=true
   - **Best For**: Ingesting entire Git repositories, 1-hour video transcripts, dense PDF libraries, and high-speed live multimodal agents.

5. **NVIDIA Nemotron-3 Super / Llama 3.3 70B**
   - **ID**: `nvidia-nemotron-llama`
   - **Provider**: NVIDIA NIM
   - **Architecture**: 70B Dense / 120B Hybrid optimized for TensorRT-LLM Enterprise Inference
   - **Context Window**: 128,000 tokens (128K)
   - **Max Output**: 64,000 tokens
   - **Throughput**: ~125 tokens/sec
   - **Pricing**: Free tier via 9Router NVIDIA NIM Relay / Self-hostable
   - **Benchmarks**: Reasoning ★ 92/100, Coding ★ 93/100, MMLU: 86.4%
   - **Capabilities**: Reasoning=true, ToolCalling=true, OpenWeights=true, EnterpriseSelfHost=true
   - **Best For**: On-premise air-gapped deployments, privacy-first local enterprise agents, custom fine-tuning.

6. **Kimi k2.6 & MiniMax M3 (Long-form Chinese/English SOTA)**
   - **ID**: `kimi-k2-6-minimax`
   - **Provider**: Moonshot AI / MiniMax
   - **Architecture**: 1M+ Ultra-Long Context Dense/MoE with 262k Max Output Generation
   - **Context Window**: 1,048,576 tokens (1M)
   - **Max Output**: 262,144 tokens (Highest single-pass generation output in the world)
   - **Throughput**: ~75 tokens/sec
   - **Pricing**: Free via 9Router BZL Provider
   - **Capabilities**: Reasoning=true, ThinkingMode=true, MassiveOutput=true
   - **Best For**: Writing entire books, complete software documentation, monolithic codebase migrations.

---

## 2. 1-Click Copy AI Prompt Library Specification

### 2.1 Prompt Data Schema
```typescript
export type PromptCategory =
  | 'coding'
  | 'reasoning'
  | 'agent'
  | 'system'
  | 'security'
  | 'uiux'
  | 'creative';

export interface PromptVariable {
  key: string;            // e.g. "LANGUAGE", "CODE_SNIPPET", "TARGET_AUDIENCE"
  label: string;          // Human readable label
  placeholder: string;    // Sample placeholder text
  defaultValue: string;   // Fallback value
  type: 'text' | 'textarea' | 'select';
  options?: string[];     // For select type
}

export interface AiPrompt {
  id: string;
  title: string;
  category: PromptCategory;
  categoryLabel: string;
  description: string;
  tags: string[];
  recommendedModels: string[]; // e.g. ['deepseek-r1-v3', 'claude-3-7-sonnet']
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  tokenEstimate: number;
  verified: boolean;
  variables: PromptVariable[];
  promptTemplate: string;
}
```

### 2.2 Curated Prompts Catalog (7 Disciplines)

#### 1. Coding & Architecture: `Senior Architect Code Reviewer`
- **ID**: `code-architect-reviewer`
- **Category**: `coding` (Coding & Architecture)
- **Tags**: `['Security', 'OWASP', 'Big-O', 'Refactoring', 'Clean-Architecture']`
- **Recommended Models**: Claude 3.7 Sonnet, DeepSeek R1/V3
- **Variables**:
  - `{{LANGUAGE}}` (Default: "TypeScript / Next.js")
  - `{{CODE}}` (Default: "// Paste your source code here")
- **Template**:
```markdown
Bertindaklah sebagai Principal Software Architect & Lead Security Auditor. Lakukan evaluasi mendalam terhadap kode {{LANGUAGE}} berikut:

```{{LANGUAGE}}
{{CODE}}
```

Format tinjauan Anda menjadi 5 bagian terstruktur:
1. **Security Vulnerability Audit**: Deteksi potensi celah keamanan (OWASP Top 10, SQLi, XSS, insecure deserialization, race conditions, memory leaks).
2. **Computational Complexity (Big-O)**: Analisis Time Complexity dan Space Complexity pada kondisi Worst-Case dan Average-Case.
3. **Architectural Anti-Patterns**: Identifikasi pelanggaran prinsip SOLID, DRY, KISS, atau leaky abstractions.
4. **Concrete Refactored Code**: Berikan implementasi kode perbaikan yang lengkap, modular, zero-placeholder, dan siap dijalankan (fully runnable).
5. **Unit Test Scenarios**: Buat 3 test case krusial (termasuk edge cases & boundary conditions).
```

#### 2. Deep Reasoning & Problem Solving: `First-Principles Root Cause Analyzer`
- **ID**: `reasoning-root-cause-engine`
- **Category**: `reasoning` (Penalaran Mendalam)
- **Tags**: `['First-Principles', 'Root-Cause', 'Troubleshooting', 'Chain-of-Thought']`
- **Recommended Models**: DeepSeek R1, Claude 3.7 Sonnet (Thinking Mode)
- **Variables**:
  - `{{INCIDENT_SUMMARY}}` (Default: "Database connection pool exhaustion under 500 RPS load")
  - `{{SYSTEM_STACK}}` (Default: "PostgreSQL, Bun, Next.js 16, Prisma/Kysely")
- **Template**:
```markdown
Gunakan metode First-Principles Reasoning dan teknik 5-Whys untuk membedah insiden teknis berikut:
- **Ringkasan Insiden**: {{INCIDENT_SUMMARY}}
- **Tech Stack**: {{SYSTEM_STACK}}

Langkah analisis:
1. **Deconstruct Facts vs Assumptions**: Pisahkan fakta terukur dari spekulasi intuitif.
2. **5-Whys Deep Dive**: Lakukan drill down 5 lapis ke akar penyebab fundamental (hardware, kernel, network, application, concurrency).
3. **Hypothesis Testing Matrix**: Buat tabel hipotesis berisi (Penyebab | Probabilitas % | Cara Verifikasi Cepat | Mitigasi).
4. **Immediate Hotfix vs Permanent Architectural Fix**: Berikan solusi darurat 5 menit dan refactoring permanen jangka panjang.
```

#### 3. Agentic & Autonomous Workflows: `V-Model Autonomous Task Planner`
- **ID**: `agent-vmodel-planner`
- **Category**: `agent` (Agentic Workflows)
- **Tags**: `['Antigravity', 'Claude-Code', 'Task-Planning', 'Zero-Hallucination']`
- **Recommended Models**: Claude 3.7 Sonnet, DeepSeek V3
- **Variables**:
  - `{{OBJECTIVE}}` (Default: "Implement double-bezel card UI with spring physics in Tailwind CSS")
- **Template**:
```markdown
Kamu adalah Autonomous Planning Agent dengan metodologi V-Model. Pecah tujuan berikut menjadi rencana eksekusi berjenjang tanpa halusinasi:
Tujuan: {{OBJECTIVE}}

Hasilkan dokumen rencana terstruktur dengan format:
- **Phase 1 — Discovery & Specification**: Identifikasi dependency, contract interface, dan boundary conditions.
- **Phase 2 — Incremental Execution Plan**: Daftar step atomic (1 aksi per step). Setiap step wajib mencakup:
  * File Target (path absolut/relatif)
  * Aksi Konkret (tulis/edit/run command)
  * Success Criteria yang dapat diuji secara mekanis (e.g. build pass, curl 200).
- **Phase 3 — Self-Verification & Healthcheck**: Perintah CLI spesifik untuk menguji regresi (linter, unit test, build).
- **Phase 4 — Rollback Trigger**: Kondisi eksplisit di mana rollback harus dieksekusi jika terjadi anomali.
```

#### 4. System Prompts & Guardrails: `Zero-Chatter High-Precision CLI Agent`
- **ID**: `system-zero-chatter-cli`
- **Category**: `system` (System Guardrails)
- **Tags**: `['System-Prompt', 'Telegraphic', 'Caveman', 'Token-Saver']`
- **Recommended Models**: All Models (DeepSeek, GPT-4o, Claude)
- **Variables**:
  - `{{ROLE_NAME}}` (Default: "Arch Linux Sysadmin & TypeScript Specialist")
- **Template**:
```markdown
You are {{ROLE_NAME}}. Follow these ironclad operating constraints:
1. **Zero Conversational Chatter**: Eliminate all polite preamble, filler phrases, summaries, and conversational closings. Start output directly with the solution or code.
2. **Absolute Technical Accuracy**: Do NOT invent or hallucinate API flags, functions, or package versions. If unknown, state "UNKNOWN" explicitly.
3. **Executable Completeness**: Every code block must be 100% complete, syntactically valid, and drop-in ready. Never use `// ... rest of code here` or `/* todo */`.
4. **Telegraphic & High-Density**: Prioritize concise bullet points, direct bash commands, and dense technical reasoning.
```

#### 5. Security & Auditing: `Zero-Trust SAST Vulnerability Hunter`
- **ID**: `security-sast-hunter`
- **Category**: `security` (Security & Pentesting)
- **Tags**: `['SAST', 'Zero-Trust', 'OWASP-LLM', 'Penetration-Testing', 'CVE']`
- **Recommended Models**: DeepSeek R1, Claude 3.7 Sonnet
- **Variables**:
  - `{{TARGET_SOURCE}}` (Default: "Authentication middleware with JWT & cookie handling")
- **Template**:
```markdown
Lakukan Zero-Trust Static Application Security Testing (SAST) terhadap modul berikut:
{{TARGET_SOURCE}}

Evaluasi mencakup:
1. **Authentication & Session Flaws**: Broken Object Level Authorization (BOLA), Token fixation, timing attacks pada perbandingan secret.
2. **Injection & Input Sanitation**: SQL Injection, Command Injection, Prototype Pollution, Template Injection.
3. **Side-Channel & Logic Exploits**: Race condition pada state check, floating promises, improper error disclosure.
4. **Proof of Concept (PoC) Exploit**: Buat payload cURL/script untuk mereproduksi celah secara aman di lingkungan uji.
5. **Remediated Hardened Code**: Tampilkan patch kode dengan mitigasi defensif bertingkat.
```

#### 6. UI/UX & Design Systems: `Awwwards-Tier Micro-Interaction & Glassmorphism Spec`
- **ID**: `uiux-awwwards-double-bezel`
- **Category**: `uiux` (Design & Frontend)
- **Tags**: `['Awwwards', 'Double-Bezel', 'Glassmorphism', 'Tailwind-CSS', 'Spring-Physics']`
- **Recommended Models**: Claude 3.7 Sonnet, GPT-4o
- **Variables**:
  - `{{COMPONENT_NAME}}` (Default: "Interactive AI Model Benchmarking Card")
- **Template**:
```markdown
Rancang spesifikasi frontend dan kode Tailwind CSS berstandar $150k creative agency untuk komponen: {{COMPONENT_NAME}}

Panduan Desain:
- **Palette**: OLED Dark Canvas (`#05050d`), Slate Dark Surface (`#0a0a14`), Cyan Glow (`#22d3ee`), Emerald Accent (`#34d399`).
- **Doppelrand (Double-Bezel)**: Outer border `p-1 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl`, Inner container `rounded-[calc(2.5rem-0.25rem)] bg-[#05050d] p-6`.
- **Button-in-Button CTA**: Outer pill button dengan trailing isolated circular icon indicator.
- **Motion & Taktil**: Transisi `duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]`, micro-feedback `active:scale-[0.98]`.
- **Hasilkan**: File TSX lengkap dengan React 19 / Tailwind CSS v4, Lucide icons, dan fully responsive.
```

#### 7. Creative & Strategy: `Technical Whitepaper & Value Proposition Synthesizer`
- **ID**: `creative-tech-whitepaper`
- **Category**: `creative` (Creative & Business)
- **Tags**: `['Whitepaper', 'Technical-Writing', 'Value-Proposition', 'Pitch-Deck']`
- **Recommended Models**: Claude 3.7 Sonnet, Gemini 1.5 Pro
- **Variables**:
  - `{{PROJECT_NAME}}` (Default: "apu.web.id AI Hub & 9Router Gateway")
  - `{{TARGET_AUDIENCE}}` (Default: "AI Engineers, Fullstack Developers, & Tech Enthusiasts")
- **Template**:
```markdown
Tulis ringkasan eksekutif dan lembar spesifikasi produk berstandar Gartner / TechCrunch untuk:
- **Proyek**: {{PROJECT_NAME}}
- **Target Pembaca**: {{TARGET_AUDIENCE}}

Struktur Dokumen:
1. **The Core Dilemma / Market Pain Point**: Masalah fragmentasi API AI, tingginya biaya inferensi proprietary, dan kurangnya prompt engineering terstandarisasi.
2. **Architectural Breakthrough**: Bagaimana kombinasi local gateway (9Router) + curated prompt library menyelesaikan masalah tersebut.
3. **Competitive Moat (3 Pilar Utama)**: Efisiensi latensi, privasi data lokal, dan UX bertaraf Awwwards.
4. **Key Metrics & ROI Projection**: Estimasi penghematan biaya token dan peningkatan kecepatan delivery engineer.
```

---

## 3. 9Router Local AI Gateway Integration Specification

### 3.1 Gateway Architecture Overview
9Router (`http://localhost:20128/v1`) adalah gateway AI lokal/remote multi-provider yang mengekspos REST API standar OpenAI. Gateway ini bertindak sebagai agregator cerdas yang mendistribusikan request ke berbagai provider upstream:

```
[ Frontend Client / Playground / Scripts ]
                   │
                   ▼ (OpenAI Standard REST)
    ┌─────────────────────────────┐
    │  9Router Local Gateway      │
    │  http://localhost:20128/v1  │
    │  - Auto-fallback Cascades   │
    │  - Single API Key Security  │
    │  - Latency & Health Probing │
    └──────────────┬──────────────┘
                   │
    ┌──────────────┼──────────────┬──────────────┬──────────────┐
    ▼              ▼              ▼              ▼              ▼
[ OpenCode ]  [ NVIDIA NIM ] [ OpenRouter ]  [ DeepSeek ]   [ BZL / Kimi ]
(Vercel Proxy) (RTX/Cloud)    (Free Tier)     (Native Direct)(1M Context)
```

### 3.2 Endpoints Specification

| Endpoint | Method | Headers | Description | Response Schema |
|----------|--------|---------|-------------|-----------------|
| `/api/health` | `GET` | None | Liveness health check | `{"ok": true}` |
| `/v1/models` | `GET` | `Authorization: Bearer <KEY>` | List all active supported models & capability flags | `{"object":"list","data":[{"id":"string","capabilities":{...}}]}` |
| `/v1/chat/completions` | `POST` | `Authorization: Bearer <KEY>`, `Content-Type: application/json` | Standard & streaming chat completion | Standard OpenAI `ChatCompletion` or SSE chunks |
| `/v1/embeddings` | `POST` | `Authorization: Bearer <KEY>`, `Content-Type: application/json` | Text vector embedding generation | `{"object":"list","data":[{"embedding":[...],"index":0}]}` |

### 3.3 Verified Working Models Catalog in 9Router
Berdasarkan uji coba aktif (`curl -s http://localhost:20128/v1/models`), model-model berikut terverifikasi aktif di gateway:

1. **OpenCode Provider (`oc/`)**:
   - `oc/deepseek-v4-flash-free` *(Fast Reasoning + 1M Context)*
   - `oc/mimo-v2.5-free` *(Vision Multimodal + 1M Context)*
   - `oc/nemotron-3-ultra-free` *(Reasoning + 128K Context)*
   - `oc/north-mini-code-free` *(Code Generation)*
2. **NVIDIA NIM Native (`nvidia/`)**:
   - `nvidia/deepseek-ai/deepseek-v4-flash` *(DeepSeek Flash)*
   - `nvidia/meta/llama-3.1-70b-instruct` *(Llama 3.1 70B)*
   - `nvidia/minimaxai/minimax-m3` *(MiniMax M3)*
3. **Direct & BZL Providers (`ds/`, `bzl/`)**:
   - `ds/deepseek-reasoner` *(DeepSeek R1 Thinking Mode)*
   - `ds/deepseek-chat` *(DeepSeek V3 High Speed)*
   - `bzl/gemini-3.1-pro-preview` *(1M Context Google Preview)*
   - `bzl/kimi-k2.6` *(262K Generation Output)*

### 3.4 Multi-Language Code Snippets

#### 1. cURL (Standard & Streaming)
```bash
# Standard Completion
curl -X POST http://localhost:20128/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-a4270f4d3e9e0953c62932c63b15787e6ede0c7b4c2142f8fe4339a30db367ea-pabr2b-ff995f99" \
  -d '{
    "model": "oc/deepseek-v4-flash-free",
    "messages": [
      {"role": "system", "content": "You are a helpful AI assistant."},
      {"role": "user", "content": "Jelaskan konsep arsitektur Double-Bezel dalam UI modern."}
    ],
    "temperature": 0.7,
    "max_tokens": 1024
  }'

# Streaming SSE Response
curl -N -X POST http://localhost:20128/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-a4270f4d3e9e0953c62932c63b15787e6ede0c7b4c2142f8fe4339a30db367ea-pabr2b-ff995f99" \
  -d '{
    "model": "ds/deepseek-reasoner",
    "messages": [{"role": "user", "content": "Bukti matematika bahwa akar 2 irasional."}],
    "stream": true
  }'
```

#### 2. TypeScript / Node.js (OpenAI SDK)
```typescript
import OpenAI from 'openai';

const ninerouter = new OpenAI({
  baseURL: process.env.NINEROUTER_URL || 'http://localhost:20128/v1',
  apiKey: process.env.NINEROUTER_KEY || 'sk-a4270f4d3e9e0953c62932c63b15787e6ede0c7b4c2142f8fe4339a30db367ea-pabr2b-ff995f99',
});

async function runAiQuery() {
  const stream = await ninerouter.chat.completions.create({
    model: 'oc/deepseek-v4-flash-free',
    messages: [
      { role: 'system', content: 'You are an expert TypeScript engineer.' },
      { role: 'user', content: 'Buat generic utility type DeepReadonly di TypeScript.' }
    ],
    stream: true,
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
  }
}

runAiQuery().catch(console.error);
```

#### 3. Python (OpenAI v1.x SDK)
```python
import os
from openai import OpenAI

client = OpenAI(
    base_url=os.getenv("NINEROUTER_URL", "http://localhost:20128/v1"),
    api_key=os.getenv("NINEROUTER_KEY", "sk-a4270f4d3e9e0953c62932c63b15787e6ede0c7b4c2142f8fe4339a30db367ea-pabr2b-ff995f99")
)

response = client.chat.completions.create(
    model="nvidia/deepseek-ai/deepseek-v4-flash",
    messages=[
        {"role": "system", "content": "You are a senior cybersecurity researcher."},
        {"role": "user", "content": "Audit implementasi middleware otentikasi JWT berikut."}
    ],
    temperature=0.3
)

print(response.choices[0].message.content)
```

#### 4. Go (Native HTTP Client)
```go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type ChatPayload struct {
	Model    string        `json:"model"`
	Messages []interface{} `json:"messages"`
}

func main() {
	url := "http://localhost:20128/v1/chat/completions"
	payload := map[string]interface{}{
		"model": "oc/deepseek-v4-flash-free",
		"messages": []map[string]string{
			{"role": "user", "content": "Halo dari Golang client via 9Router!"},
		},
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+os.Getenv("NINEROUTER_KEY"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	fmt.Println(string(respBody))
}
```

---

## 4. Interactive AI Playground & Query Simulator Specification

### 4.1 Component Flow & Architecture
```
[ Preset Selector / Prompt Template ] ──► [ System & User Prompt Editor ]
                                                        │
                                                        ▼
[ Parameter Controls: Temp (0.0-2.0), MaxTokens, Top-P, Model Selector ]
                                                        │
                                                        ▼
[ Execution Mode Toggle: "Simulated Runner" ⟷ "Live 9Router Gateway" ]
                                                        │
                                                        ▼
                         [ Execute Run Button (Tactile) ]
                                                        │
                 ┌──────────────────────────────────────┴──────────────────────────────────────┐
                 ▼                                                                             ▼
   [ Mode A: Simulated Stream ]                                                  [ Mode B: Live 9Router API ]
- Typewriter character streamer (35 t/s)                                       - EventSource / fetch stream
- Pre-computed reasoning `<think>` extraction                                  - Live SSE chunk parser
- Realistic latency delay simulation (250ms TTFT)                             - Real latency tracking (ms)
                 └──────────────────────────────────────┬──────────────────────────────────────┘
                                                        │
                                                        ▼
[ Output Console: Markdown Syntax Highlighter + Copy Button + t/s Counter + Estimated Cost Badge ]
```

### 4.2 Playground State Interface
```typescript
export interface PlaygroundState {
  selectedModelId: string;
  systemPrompt: string;
  userPrompt: string;
  temperature: number;      // 0.0 - 2.0
  maxTokens: number;        // 256 - 4096
  isStreaming: boolean;
  isExecuting: boolean;
  outputText: string;
  thinkingText: string;     // Extracted reasoning chain
  isThinkingExpanded: boolean;
  executionMode: 'simulated' | 'live-gateway';
  metrics: {
    timeToFirstTokenMs: number;
    totalDurationMs: number;
    tokensPerSecond: number;
    inputTokens: number;
    outputTokens: number;
    estimatedCostUsd: number;
  };
}
```

### 4.3 Preset Query Fixtures for Playground
1. **Math & Formal Logic**: `"Buktikan bahwa untuk setiap n bulat, n^3 - n habis dibagi 6."`
   - *Expected reasoning*: Identifikasi faktorisasi `(n-1)n(n+1)` sebagai perkalian 3 bilangan bulat berurutan, terbukti kelipatan 2 dan 3, maka kelipatan 6.
2. **TypeScript Generic Type**: `"Buat utility type DeepPartial<T> yang menangani nested object, array, dan fungsi."`
   - *Expected output*: Valid recursive conditional type di TypeScript.
3. **Security Audit**: `"Analisis potensi SSRF pada endpoint fetching URL pengguna di Node.js."`
   - *Expected output*: IP blacklist verification, DNS rebinding prevention, private IP ranges (RFC 1918) checks.
4. **Tailwind Glassmorphism Card**: `"Buat double-bezel card UI dengan radial backdrop blur di Tailwind v4."`

---

## 5. UI/UX Component Breakdown & Props Contract

### 5.1 Component Hierarchy in `components/`
```
components/
├── AiHubTab.tsx                      # Root Coordinator for Tab
├── ai-hub/
│   ├── AiHubHero.tsx                 # Hero Header, ambient orbs, quick jump CTAs, stat badges
│   ├── NineRouterStatusPill.tsx      # Live health probe ping badge (online/offline/ms)
│   ├── AiModelShowcase.tsx           # Model grid, category tabs, filter search
│   │   ├── AiModelCard.tsx           # Double-bezel model card with spec meters & benchmark bars
│   │   └── AiModelComparisonModal.tsx# Side-by-side comparison drawer for 2-3 models
│   ├── AiPlayground.tsx              # Interactive query simulator, preset triggers, parameter sliders
│   │   ├── PlaygroundParamsBar.tsx   # Sliders for temperature, max_tokens, mode toggle
│   │   └── PlaygroundOutput.tsx      # Streamed response, thinking accordion, syntax highlighter
│   ├── AiPromptLibrary.tsx           # Search bar, category filters, tag cloud, prompt cards grid
│   │   ├── AiPromptCard.tsx          # Card with 1-click copy, tag pills, "Send to Playground" CTA
│   │   └── PromptVariableDrawer.tsx  # Dynamic parameter modal for customizable prompts
│   └── NineRouterGuide.tsx           # 9Router documentation, architecture diagram, code tabs, curl builder
│       └── NineRouterCurlBuilder.tsx # Interactive form generating customized cURL scripts
```

### 5.2 TypeScript Props Contracts

```typescript
// 1. AiModelCardProps
export interface AiModelCardProps {
  model: AiModelSpec;
  isSelectedForCompare: boolean;
  onToggleCompare: (modelId: string) => void;
  onSendToPlayground: (modelId: string, prompt?: string) => void;
}

// 2. AiPromptCardProps
export interface AiPromptCardProps {
  prompt: AiPrompt;
  isCopied: boolean;
  onCopy: (id: string, text: string) => void;
  onOpenVariableModal: (prompt: AiPrompt) => void;
  onSendToPlayground: (prompt: AiPrompt) => void;
}

// 3. PromptVariableDrawerProps
export interface PromptVariableDrawerProps {
  isOpen: boolean;
  prompt: AiPrompt | null;
  onClose: () => void;
  onApplyAndCopy: (hydratedText: string) => void;
  onApplyAndPlay: (hydratedText: string, recommendedModel: string) => void;
}

// 4. NineRouterStatusPillProps
export interface NineRouterStatusPillProps {
  status: 'online' | 'offline' | 'checking';
  latencyMs: number | null;
  activeModelCount: number;
  onRefresh: () => void;
}

// 5. AiPlaygroundProps
export interface AiPlaygroundProps {
  initialModelId?: string;
  initialPrompt?: string;
  isGatewayOnline: boolean;
}
```

---

## 6. Layout & Awwwards-Tier Doppelrand Design Integration

### 6.1 Design Token Consistency
- **Canvas Base**: `#05050d` (OLED Pure Black with 2% indigo tint)
- **Outer Bezel Layer**: `p-1 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-2xl backdrop-blur-2xl`
- **Inner Card Surface**: `rounded-[calc(2.5rem-0.25rem)] bg-[#05050d] p-6 sm:p-8`
- **Button-in-Button CTA Pattern**:
  ```html
  <button class="inline-flex items-center gap-2 pl-5 pr-2 py-2 rounded-full bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-all duration-300 active:scale-[0.98] shadow-lg shadow-cyan-500/20">
    <span>Eksplorasi Model AI</span>
    <span class="w-6 h-6 rounded-full bg-slate-950/20 flex items-center justify-center">
      <ArrowUpRight class="w-3.5 h-3.5" />
    </span>
  </button>
  ```
- **Spring Transition Curves**: `transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]`

---

## 7. Verification & Implementation Roadmap

### 7.1 Automated Verification Commands
```bash
# 1. Type check & compilation verification
NODE_OPTIONS="--max-old-space-size=4096" bun run build

# 2. Local daemon & port liveness checks
curl -s http://localhost:20128/api/health # Expects: {"ok":true}
curl -s -i http://localhost:3100/ # Expects: HTTP/1.1 200 OK
curl -s -i http://localhost:3100/robots.txt # Expects: HTTP/1.1 200 OK

# 3. Model API connectivity test
curl -s http://localhost:20128/v1/models \
  -H "Authorization: Bearer sk-a4270f4d3e9e0953c62932c63b15787e6ede0c7b4c2142f8fe4339a30db367ea-pabr2b-ff995f99" | grep -q "deepseek"
```

### 7.2 Implementation Checklist for Orchestrator
- [x] Full specification of Public AI Hub Portal completed.
- [x] Exhaustive model parameters (DeepSeek R1/V3, Claude 3.7 Sonnet, GPT-4o, Gemini 1.5/2.0) documented with benchmark ratings and cost formulas.
- [x] Curated 7-discipline prompt catalog defined with variable parameter schemas.
- [x] 9Router gateway architecture, endpoints, live healthcheck badge, and multi-language snippets fully specified.
- [x] Interactive AI Playground simulator mechanics and props contracts defined.
- [x] Ready for implementation agent dispatch.
