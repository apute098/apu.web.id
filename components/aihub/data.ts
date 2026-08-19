import { AiModelSpec, AiPrompt, CodeSnippetItem } from './types';

export const AI_MODELS_DATA: AiModelSpec[] = [
  {
    id: 'deepseek-r1-v3',
    name: 'DeepSeek R1 / V3',
    provider: 'DeepSeek AI',
    providerSlug: 'deepseek',
    tag: 'Open-Weights King',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    accentColor: '#06b6d4',
    description: 'Model penalaran (reasoning) revolusioner dengan efisiensi biaya luar biasa & performa math/coding setara OpenAI o1.',
    architecture: '671B MoE (37B active per token) Multi-head Latent Attention (MLA)',
    contextWindow: 128000,
    contextWindowLabel: '128k Tokens',
    maxOutputTokens: 8192,
    speedTps: 95,
    speedLabel: '⚡ 95 t/s',
    pricing: {
      inputPer1M: 0.14,
      outputPer1M: 0.55,
      cachedInputPer1M: 0.014,
      note: 'Ultra hemat dengan cache hit 90%',
    },
    benchmarks: {
      reasoningScore: 98,
      codingScore: 96,
      generalMMLU: 84,
    },
    capabilities: {
      vision: false,
      audioInput: false,
      videoInput: false,
      reasoning: true,
      thinkingMode: true,
      toolCalling: true,
      search: true,
      openWeights: true,
    },
    bestFor: [
      'Deep Mathematical Reasoning & Logic',
      'Complex Code Refactoring & Debugging',
      'Algorithmic Problem Solving',
      'Autonomous Agent Chain-of-Thought',
    ],
    sampleQuery: {
      prompt: 'Jelaskan mekanisme Multi-Head Latent Attention (MLA) pada DeepSeek-V3 dan bandingkan dengan Multi-Query Attention (MQA).',
      thoughtProcess: 'Menganalisis arsitektur KV-cache compression pada MLA... Mengompresi representasi key dan value ke dalam latent vector berdimensi rendah untuk menghemat bandwidth GPU.',
      expectedResponse: 'MLA (Multi-Head Latent Attention) mengompresi Key-Value cache ke dalam representasi laten berdimensi rendah (low-rank joint compression), memangkas konsumsi VRAM KV-cache hingga 93% dibandingkan standard MHA tanpa menurunkan expressiveness model.',
    },
  },
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    providerSlug: 'anthropic',
    tag: 'Hybrid Reasoning',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    accentColor: '#f59e0b',
    description: 'Model hybrid pertama dengan mode instant & deep thought. Unggul mutlak dalam pemahaman konteks kode skala besar.',
    architecture: 'Hybrid Reasoning Transformer with Dynamic Thinking Budget Control',
    contextWindow: 200000,
    contextWindowLabel: '200k Tokens',
    maxOutputTokens: 128000,
    speedTps: 80,
    speedLabel: '⚡ 80 t/s',
    pricing: {
      inputPer1M: 3.0,
      outputPer1M: 15.0,
      cachedInputPer1M: 0.30,
      note: 'Prompt Caching diskon 90% read',
    },
    benchmarks: {
      reasoningScore: 99,
      codingScore: 99,
      generalMMLU: 89,
    },
    capabilities: {
      vision: true,
      audioInput: false,
      videoInput: false,
      reasoning: true,
      thinkingMode: true,
      toolCalling: true,
      search: false,
      openWeights: false,
    },
    bestFor: [
      'Full-stack Web Dev & Architecture',
      'Large Repository Codebase Refactoring',
      'Technical Specifications & RFC Writing',
      'Zero-Shot Code Generation',
    ],
    sampleQuery: {
      prompt: 'Desain arsitektur distributed task queue di Next.js 16 menggunakan Cloudflare Durable Objects.',
      thoughtProcess: 'Merancang topologi WebSocket duplex, transactional storage via DO SQLite, dan automatic retry exponential backoff...',
      expectedResponse: 'Implementasikan Durable Object kelas TaskCoordinator yang mengekspos stub RPC dan menyimpan state di local SQLite storage dengan alarm handlers untuk scheduling terdistribusi.',
    },
  },
  {
    id: 'gpt-4o-o3-mini',
    name: 'GPT-4o & o3-mini',
    provider: 'OpenAI',
    providerSlug: 'openai',
    tag: 'Multimodal Standard',
    badgeColor: 'bg-green-500/10 text-green-400 border-green-500/20',
    accentColor: '#10b981',
    description: 'Standar industri untuk tugas multimodal (teks, visi, audio) dan komputasi penalaran cepat o3-mini.',
    architecture: 'Omni-Native Multimodal MoE & High-Efficiency STEM Reasoner',
    contextWindow: 128000,
    contextWindowLabel: '128k Tokens',
    maxOutputTokens: 16384,
    speedTps: 110,
    speedLabel: '⚡ 110 t/s',
    pricing: {
      inputPer1M: 2.50,
      outputPer1M: 10.0,
      cachedInputPer1M: 1.25,
    },
    benchmarks: {
      reasoningScore: 95,
      codingScore: 94,
      generalMMLU: 88,
    },
    capabilities: {
      vision: true,
      audioInput: true,
      videoInput: true,
      reasoning: true,
      thinkingMode: false,
      toolCalling: true,
      search: true,
      openWeights: false,
    },
    bestFor: [
      'General AI & Multimodal Ingestion',
      'Vision Tasks & Diagram-to-Code',
      'Fast Structured JSON Tool Calling',
      'Low-Latency API Integrations',
    ],
    sampleQuery: {
      prompt: 'Ekstraksi skema relational database dari screenshot ERD diagram berikut dalam format Prisma schema.',
      expectedResponse: 'Menghasilkan skema datasource db { provider = "postgresql" } dengan relasi 1-to-many dan foreign key constraints yang tepat.',
    },
  },
  {
    id: 'gemini-1-5-pro-flash',
    name: 'Gemini 1.5 Pro / Flash',
    provider: 'Google DeepMind',
    providerSlug: 'google',
    tag: 'Ultra-Long Context',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    accentColor: '#a855f7',
    description: 'Kapasitas jendela konteks hingga 2 Juta Token. Sanggup memproses seluruh repository kode & buku tebal sekaligus.',
    architecture: 'Sparse MoE Transformer with Million-Token Multi-Head Memory',
    contextWindow: 2097152,
    contextWindowLabel: '2,000,000 Tokens',
    maxOutputTokens: 65536,
    speedTps: 140,
    speedLabel: '⚡ 140 t/s',
    pricing: {
      inputPer1M: 1.25,
      outputPer1M: 5.0,
      cachedInputPer1M: 0.31,
    },
    benchmarks: {
      reasoningScore: 93,
      codingScore: 92,
      generalMMLU: 86,
    },
    capabilities: {
      vision: true,
      audioInput: true,
      videoInput: true,
      reasoning: true,
      thinkingMode: false,
      toolCalling: true,
      search: true,
      openWeights: false,
    },
    bestFor: [
      'Large Repo Whole-Codebase Analysis',
      '1-Hour Video & Audio Audio Transcription',
      'Multi-PDF Cross Document Synthesis',
      'Massive Batch Ingestion',
    ],
    sampleQuery: {
      prompt: 'Audit 50 file source code proyek ini dan buat peta dependensi lengkap.',
      expectedResponse: 'Analisis komprehensif seluruh modul internal, eksternal dependencies, serta cyclical import analysis.',
    },
  },
  {
    id: 'nvidia-nemotron-llama',
    name: 'NVIDIA Nemotron-3 Super / Llama 3.3',
    provider: 'NVIDIA',
    providerSlug: 'nvidia',
    tag: 'Enterprise NIM Relay',
    badgeColor: 'bg-green-500/10 text-green-400 border-green-500/20',
    accentColor: '#22c55e',
    description: 'Model enterprise performa tinggi yang dioptimalkan dengan TensorRT-LLM untuk throughput masif pada kluster NVIDIA NIM.',
    architecture: '70B Dense / 120B Hybrid TensorRT-LLM Engine',
    contextWindow: 128000,
    contextWindowLabel: '128k Tokens',
    maxOutputTokens: 64000,
    speedTps: 125,
    speedLabel: '⚡ 125 t/s',
    pricing: {
      inputPer1M: 0.0,
      outputPer1M: 0.0,
      note: 'Gratis via 9Router NVIDIA NIM Relay',
    },
    benchmarks: {
      reasoningScore: 92,
      codingScore: 93,
      generalMMLU: 86,
    },
    capabilities: {
      vision: false,
      audioInput: false,
      videoInput: false,
      reasoning: true,
      thinkingMode: false,
      toolCalling: true,
      search: false,
      openWeights: true,
    },
    bestFor: [
      'High-Throughput Batch Inference',
      'Self-Hosted On-Premise Deployments',
      'Enterprise Guardrail Enforcement',
      'Fast Structured Output',
    ],
    sampleQuery: {
      prompt: 'Konversikan query SQL mentah berikut menjadi optimasi index multi-kolom B-Tree.',
      expectedResponse: 'CREATE INDEX idx_user_status_created ON transactions(user_id, status, created_at DESC);',
    },
  },
  {
    id: 'kimi-k2-6-minimax',
    name: 'Kimi k2.6 & MiniMax M3',
    provider: 'Moonshot AI',
    providerSlug: 'moonshot',
    tag: '262k Single-Pass Output',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    accentColor: '#f43f5e',
    description: 'Arsitektur ultra-long context dengan batas output terbesar di industri (262k tokens dalam satu respons tunggal).',
    architecture: '1M Ultra-Long Context MoE with 262k Max Generation Output',
    contextWindow: 1048576,
    contextWindowLabel: '1M Tokens',
    maxOutputTokens: 262144,
    speedTps: 75,
    speedLabel: '⚡ 75 t/s',
    pricing: {
      inputPer1M: 0.0,
      outputPer1M: 0.0,
      note: 'Akses tanpa biaya via 9Router BZL Relay',
    },
    benchmarks: {
      reasoningScore: 94,
      codingScore: 91,
      generalMMLU: 85,
    },
    capabilities: {
      vision: false,
      audioInput: false,
      videoInput: false,
      reasoning: true,
      thinkingMode: true,
      toolCalling: true,
      search: true,
      openWeights: false,
      massiveOutput: true,
    },
    bestFor: [
      'Generating Complete Books & Documentation',
      'Massive Monolithic Code File Synthesis',
      'Deep Multistep Research Reports',
      'Exhaustive Data Extraction',
    ],
    sampleQuery: {
      prompt: 'Tuliskan dokumentasi API lengkap 50 endpoint REST beserta contoh request dan response JSON.',
      expectedResponse: 'Generasi dokumentasi teknis komprehensif tanpa terpotong (up to 262k tokens).',
    },
  },
];

export const AI_PROMPTS_DATA: AiPrompt[] = [
  {
    id: 'p1',
    title: 'Senior Architect Code Reviewer',
    category: 'coding',
    categoryLabel: 'Coding & Architecture',
    description: 'Prompt audit kode ketat ala Principal Engineer — cek security vulnerabilities, O(N) complexity, & anti-pattern.',
    tags: ['Security', 'Big-O', 'Refactoring', 'Clean Code'],
    recommendedModels: ['Claude 3.7 Sonnet', 'DeepSeek R1 / V3'],
    difficulty: 'Advanced',
    tokenEstimate: 420,
    variables: [
      {
        key: 'LANGUAGE',
        label: 'Bahasa / Stack',
        placeholder: 'contoh: TypeScript / Next.js 16',
        defaultValue: 'TypeScript / Next.js 16',
        type: 'text',
      },
      {
        key: 'CODE',
        label: 'Potongan Kode',
        placeholder: 'Paste kode sumber di sini...',
        defaultValue: `export async function handleRequest(req: Request) {\n  const data = await req.json();\n  // process without validation\n  return Response.json({ status: 'ok', data });\n}`,
        type: 'textarea',
      },
    ],
    promptTemplate: `Bertindaklah sebagai Principal Software Engineer & Security Auditor untuk stack {{LANGUAGE}}. Tinjau kode berikut secara mendalam:

Kode:
\`\`\`{{LANGUAGE}}
{{CODE}}
\`\`\`

Panduan Penilaian:
1. Identifikasi vulnerability keamanan (OWASP Top 10, Injection, Auth Bypass, Timing Attacks).
2. Analisis kompleksitas waktu & ruang (Big-O).
3. Berikan saran refactoring nyata dengan contoh sintaks yang bersih, tipe yang aman (strict type safety), & modular.
4. Pastikan zero placeholder & fully runnable tanpa komentar TODO.`,
  },
  {
    id: 'p2',
    title: 'Agentic Workflow Task Planner',
    category: 'agent',
    categoryLabel: 'AI Agent & Autonomous Workflow',
    description: 'Prompt perencana tugas berjenjang untuk AI Agent (Antigravity/Claude Code) agar menyelesaikan masalah tanpa halusinasi.',
    tags: ['V-Model', 'Autonomous Agent', 'Zero Hallucination'],
    recommendedModels: ['Claude 3.7 Sonnet', 'DeepSeek R1 / V3'],
    difficulty: 'Advanced',
    tokenEstimate: 510,
    variables: [
      {
        key: 'OBJECTIVE',
        label: 'Tujuan Proyek / Fitur',
        placeholder: 'contoh: Implementasi modul pembayaran QRIS otomatis',
        defaultValue: 'Implementasi double-bezel card UI dengan spring physics di Tailwind CSS',
        type: 'text',
      },
      {
        key: 'CONSTRAINTS',
        label: 'Batasan Teknis',
        placeholder: 'contoh: Tanpa library eksternal, React 19',
        defaultValue: 'Next.js 16, React 19, Tailwind v4, OLED Dark #05050d',
        type: 'text',
      },
    ],
    promptTemplate: `Kamu adalah Autonomous Planning Agent dengan disiplin V-Model. Pecah tujuan berikut menjadi rencana aksi teknis:

Tujuan: {{OBJECTIVE}}
Batasan: {{CONSTRAINTS}}

Format Rencana:
- Tahap 1: Discovery & Audit Kode Eksisting (Path file, line number, dan bukti konkret)
- Tahap 2: Eksekusi Kode Berjenjang (Minimal change principle, zero facade)
- Tahap 3: Verifikasi Teknis (Command build/test spesifik & expected output)
- Tahap 4: Self-Critique & Rollback Plan jika terjadi kegagalan
Setiap langkah harus menyertakan syarat keberhasilan (Success Criteria) yang bisa diverifikasi secara otomatis.`,
  },
  {
    id: 'p3',
    title: 'System Prompt Anti-Halusinasi & Precision',
    category: 'system',
    categoryLabel: 'System Guardrails & Directives',
    description: 'System prompt untuk membatasi AI agar menjawab hanya berdasarkan data riil & dokumentasi resmi.',
    tags: ['System Prompt', 'Guardrails', 'Strict Output'],
    recommendedModels: ['DeepSeek R1 / V3', 'GPT-4o & o3-mini'],
    difficulty: 'Intermediate',
    tokenEstimate: 310,
    variables: [
      {
        key: 'ROLE_NAME',
        label: 'Nama Peran / Identitas',
        placeholder: 'contoh: Arch Linux Sysadmin & Specialist',
        defaultValue: 'Arch Linux Sysadmin & TypeScript Specialist',
        type: 'text',
      },
      {
        key: 'DOMAIN',
        label: 'Fokus Domain',
        placeholder: 'contoh: Server telemetry & systemd operations',
        defaultValue: 'Linux server management, systemd daemon control, & SQLite WAL integrity',
        type: 'text',
      },
    ],
    promptTemplate: `Identitas: Anda adalah {{ROLE_NAME}} yang berfokus pada {{DOMAIN}}.

Secara ketat patuhi aturan berikut:
1. Jangan pernah menebak nama fungsi, library, endpoint, atau API signature. Jika data tidak tersedia, nyatakan secara eksplisit.
2. Gunakan dokumentasi resmi dan state riil sistem sebagai rujukan tunggal.
3. Jawab dengan gaya telegrafis, padat, berorientasi aksi, tanpa kalimat basa-basi pengantar atau penutup.
4. Setiap klaim teknis harus disertai perintah verifikasi independen (shell command atau test).`,
  },
  {
    id: 'p4',
    title: 'High-End UI/UX Frontend Prompt',
    category: 'writing',
    categoryLabel: 'UI/UX & Design Systems',
    description: 'Panduan instruksi desain Awwwards-tier dengan Double-Bezel (Doppelrand), Glassmorphism, dan kurva fisika pegas.',
    tags: ['Awwwards', 'Glassmorphism', 'Doppelrand', 'Tailwind'],
    recommendedModels: ['Claude 3.7 Sonnet', 'GPT-4o & o3-mini'],
    difficulty: 'Expert',
    tokenEstimate: 620,
    variables: [
      {
        key: 'COMPONENT_NAME',
        label: 'Nama Komponen UI',
        placeholder: 'contoh: Interactive AI Model Benchmarking Card',
        defaultValue: 'Interactive AI Model Benchmarking Card',
        type: 'text',
      },
      {
        key: 'ACCENT_COLOR',
        label: 'Aksen Warna',
        placeholder: 'contoh: Cyan (#06b6d4)',
        defaultValue: 'Cyan & Emerald neon glow',
        type: 'text',
      },
    ],
    promptTemplate: `Desain komponen UI "{{COMPONENT_NAME}}" dengan standar Awwwards-tier menggunakan Tailwind CSS & React 19:

Aturan Desain:
- Tema: OLED Dark Mode (#05050d background murni).
- Doppelrand Architecture: Outer shell 'p-1 rounded-none bg-slate-900 border border-slate-700 border border-white/10 shadow-2xl ' dengan inner core 'rounded-none bg-slate-950'.
- Button-in-Button CTA: Tombol pill utama dengan icon circular badge terisolasi di sisi kanan.
- Motion Curve: Transition menggunakan kurva fisika pegas 'cubic-bezier(0.32, 0.72, 0, 1)'.
- Skema Warna: {{ACCENT_COLOR}}.
- Berikan kode TSX lengkap, responsive, dengan accessible ARIA attributes.`,
  },
  {
    id: 'p5',
    title: 'First-Principles Root Cause Analyzer',
    category: 'reasoning',
    categoryLabel: 'Deep Reasoning & Troubleshooting',
    description: 'Metodologi 5-Whys mendalam, dekonstruksi fakta vs asumsi, dan matriks hipotesis mitigasi insiden.',
    tags: ['5-Whys', 'Incident Response', 'Root Cause'],
    recommendedModels: ['DeepSeek R1 / V3', 'Claude 3.7 Sonnet'],
    difficulty: 'Expert',
    tokenEstimate: 480,
    variables: [
      {
        key: 'INCIDENT_SUMMARY',
        label: 'Ringkasan Insiden / Bug',
        placeholder: 'contoh: Database connection pool exhaustion under 500 RPS load',
        defaultValue: 'Database connection pool exhaustion under 500 RPS load',
        type: 'textarea',
      },
      {
        key: 'SYSTEM_STACK',
        label: 'Tech Stack',
        placeholder: 'contoh: PostgreSQL, Bun, Next.js 16',
        defaultValue: 'PostgreSQL, Bun, Next.js 16, Prisma/Kysely',
        type: 'text',
      },
    ],
    promptTemplate: `Lakukan analisis Root Cause berbasis First Principles untuk insiden berikut:

Insiden: {{INCIDENT_SUMMARY}}
Stack: {{SYSTEM_STACK}}

Langkah Analisis:
1. Pisahkan FAKTA teramati dari ASUMSI subjektif.
2. Terapkan metode 5-Whys untuk menelusuri akar masalah struktural.
3. Buat matriks 3 hipotesis penyebab utama beserta cara pengujian empirisnya.
4. Rancang solusi: (a) Hotfix mitigasi darurat (< 5 menit), dan (b) Solusi permanen arsitektural.`,
  },
  {
    id: 'p6',
    title: 'Zero-Trust SAST Vulnerability Hunter',
    category: 'security',
    categoryLabel: 'Security & Penetration Audit',
    description: 'Audit keamanan aplikasi statis terhadap BOLA, timing attacks, bypass token, dan privilege escalation.',
    tags: ['SAST', 'Zero-Trust', 'OWASP', 'Vulnerability'],
    recommendedModels: ['Claude 3.7 Sonnet', 'DeepSeek R1 / V3'],
    difficulty: 'Expert',
    tokenEstimate: 540,
    variables: [
      {
        key: 'TARGET_SOURCE',
        label: 'Kode / Endpoint Target',
        placeholder: 'Paste kode endpoint atau middleware di sini...',
        defaultValue: `export async function POST(req: NextRequest) {\n  const { action, pid } = await req.json();\n  exec(\`kill -9 \${pid}\`);\n  return NextResponse.json({ success: true });\n}`,
        type: 'textarea',
      },
    ],
    promptTemplate: `Lakukan audit Zero-Trust SAST pada kode berikut:

Target:
\`\`\`typescript
{{TARGET_SOURCE}}
\`\`\`

Periksa secara mendalam:
1. Command / SQL Injection vectors (apakah ada eksekusi shell tanpa parameterization?).
2. Broken Object Level Authorization (BOLA) & User ID Spoofing.
3. Timing attacks pada string comparison token rahasia.
4. Unhandled exception yang dapat membocorkan stack trace.
Berikan patch kode perbaikan lengkap yang siap pakai.`,
  },
  {
    id: 'p7',
    title: 'Technical Whitepaper & Value Proposition Synthesizer',
    category: 'creative',
    categoryLabel: 'Technical Writing & Architecture Specs',
    description: 'Format whitepaper terstruktur merangkum terobosan arsitektur, token economics, dan competitive moat.',
    tags: ['Whitepaper', 'Architecture', 'Tokenomics'],
    recommendedModels: ['Claude 3.7 Sonnet', 'Gemini 1.5 Pro / Flash'],
    difficulty: 'Intermediate',
    tokenEstimate: 600,
    variables: [
      {
        key: 'PROJECT_NAME',
        label: 'Nama Proyek / Sistem',
        placeholder: 'contoh: apu.web.id AI Hub & 9Router Gateway',
        defaultValue: 'apu.web.id AI Hub & 9Router Gateway',
        type: 'text',
      },
      {
        key: 'TARGET_AUDIENCE',
        label: 'Target Pembaca',
        placeholder: 'contoh: AI Engineers & Sysadmins',
        defaultValue: 'AI Engineers, Fullstack Developers, & Tech Enthusiasts',
        type: 'text',
      },
    ],
    promptTemplate: `Susun ringkasan Whitepaper Arsitektur untuk proyek "{{PROJECT_NAME}}" yang ditujukan kepada {{TARGET_AUDIENCE}}:

Struktur Dokumen:
1. Executive Summary & Problem Statement.
2. Architectural Breakthroughs (Local Gateway proxying, Zero-overhead SQLite WAL, Hybrid Model Routing).
3. Token Economics & Cost Efficiency Comparison.
4. Security & Zero-Trust Governance Matrix.
5. Developer Experience & Multi-language SDK Integration.`,
  },
];

export const NINEROUTER_SNIPPETS: CodeSnippetItem[] = [
  {
    lang: 'curl',
    label: 'cURL',
    filename: 'request.sh',
    code: `curl -N http://localhost:20128/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer \${NINEROUTER_API_KEY:-free-local}" \\
  -d '{
    "model": "oc/deepseek-v4-flash-free",
    "messages": [
      { "role": "system", "content": "Anda adalah asisten AI teknis yang presisi." },
      { "role": "user", "content": "Jelaskan konsep zero-copy buffer di Linux!" }
    ],
    "temperature": 0.3,
    "stream": true
  }'`,
  },
  {
    lang: 'typescript',
    label: 'TypeScript',
    filename: 'client.ts',
    code: `import OpenAI from 'openai';

// 9Router kompatibel 100% dengan OpenAI SDK resmi
const client = new OpenAI({
  baseURL: 'http://localhost:20128/v1',
  apiKey: process.env.NINEROUTER_API_KEY || 'free-local',
});

async function main() {
  const stream = await client.chat.completions.create({
    model: 'ds/deepseek-reasoner',
    messages: [
      { role: 'system', content: 'Anda adalah Senior Software Architect.' },
      { role: 'user', content: 'Bagaimana cara mencegah race condition pada SQLite WAL mode?' }
    ],
    stream: true,
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
  }
}

main().catch(console.error);`,
  },
  {
    lang: 'python',
    label: 'Python',
    filename: 'client.py',
    code: `from openai import OpenAI
import os

# Menggunakan standard OpenAI Python SDK v1.x
client = OpenAI(
    base_url="http://localhost:20128/v1",
    api_key=os.getenv("NINEROUTER_API_KEY", "free-local")
)

response = client.chat.completions.create(
    model="bzl/gemini-3.1-pro-preview",
    messages=[
        {"role": "system", "content": "Anda adalah analis server Linux profesional."},
        {"role": "user", "content": "Buatkan script bash untuk memantau penggunaan memory per-service systemd."}
    ],
    temperature=0.2,
    stream=True
)

for chunk in response:
    content = chunk.choices[0].delta.content
    if content:
        print(content, end="", flush=True)`,
  },
  {
    lang: 'go',
    label: 'Go',
    filename: 'client.go',
    code: `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type ChatPayload struct {
	Model    string        \`json:"model"\`
	Messages []ChatMessage \`json:"messages"\`
}

type ChatMessage struct {
	Role    string \`json:"role"\`
	Content string \`json:"content"\`
}

func main() {
	payload := ChatPayload{
		Model: "oc/deepseek-v4-flash-free",
		Messages: []ChatMessage{
			{Role: "system", Content: "Anda adalah pakar performa jaringan."},
			{Role: "user", Content: "Jelaskan perbedaan TCP BBR vs Cubic pada latency tinggi!"},
		},
	}

	body, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", "http://localhost:20128/v1/chat/completions", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+os.Getenv("NINEROUTER_API_KEY"))

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	fmt.Println(string(respBody))
}`,
  },
];
