# Codebase Survey & Architectural Analysis — apu.web.id

**Date:** 2026-08-14  
**Explorer:** Explorer 1 (Codebase Survey)  
**Workspace:** `/home/apu/projects/apu.web.id`  
**Integrity Mode:** Development (Read-Only Survey)  

---

## 1. Executive Summary

Aplikasi `apu.web.id` adalah full-stack web application modern berbasis **Next.js 16.3.0** (App Router, Turbopack, React 19.2.8, Tailwind CSS v4) yang berjalan di lingkungan server **Arch Linux x86_64** di bawah port **3100**, dimanage oleh systemd user unit `apu-webid.service`, serta terhubung dengan Cloudflare Tunnel dan **9Router AI Gateway** (port 20128).

Sistem memiliki dua interface utama:
1. **Public AI Hub & Showcase (`/`)**: Direktori model AI interaktif (DeepSeek R1/V3, Claude 3.7 Sonnet, GPT-4o, Gemini 1.5 Pro), panduan integrasi 9Router AI Gateway (`http://localhost:20128/v1`), dan pustaka prompt engineering verified.
2. **Restricted Admin Master Control Area (`/#admin`)**: Panel terlindungi autentikasi master admin token / session dengan 4 sub-panel: **User Approval Management**, **Keuangan Dashboard (SQLite WAL)**, **Telemetri Hardware Server Arch Linux**, dan **Systemd Daemon Quick Control**.

---

## 2. Technology Stack & Framework Inventory

### A. Core Runtime & Framework
- **Framework**: Next.js `^16.3.0` (App Router)
- **Runtime / Package Manager**: Node.js v22+ / Bun (via `bun run build`, `next start`)
- **React**: `react@^19.2.8`, `react-dom@^19.2.8`
- **TypeScript**: `~5.9.0` (Target ES2017, bundler module resolution, `@/*` alias)
- **Compiler / Bundler**: Next.js Turbopack (`next.config.ts: turbopack: {}`)

### B. Styling & Design System
- **Tailwind CSS**: `tailwindcss@^4.3.3`, `@tailwindcss/postcss@^4.3.3`, `@tailwindcss/typography@^0.5.20`
- **PostCSS**: `postcss@^8.5.26`, `autoprefixer@^10.5.4`
- **Utility Libraries**: `clsx@^2.1.1`, `tailwind-merge@^3.6.0`, `class-variance-authority@^0.7.1`
- **Iconography**: `lucide-react@^1.31.0`

### C. Motion, 3D & Data Visualization
- **3D Graphics**: `three@^0.185.1`, `@types/three@^0.185.4` (Canvas WebGL Logo3D with font loader)
- **Animation Engines**: `gsap@^3.15.0`, `@gsap/react@^2.1.2`, `animejs@^4.5.0`
- **Charts & Graphs**: `recharts@^3.10.1` (Real-time hardware telemetry AreaChart & monthly financial BarChart)

### D. AI & Database Layer
- **AI SDK**: `@google/genai@^2.16.0` (Gemini 2.5 Flash for NLP transaction extraction & autonomous financial reports)
- **AI Gateway**: 9Router local REST gateway (`http://localhost:20128/v1`)
- **Database Engine**: SQLite WAL mode on HDD (`data/keuangan.db` using Node.js built-in `node:sqlite` / `DatabaseSync`) with atomic JSON fallback (`data/keuangan.json`)

---

## 3. Directory & File Structure Map

```
/home/apu/projects/apu.web.id/
├── app/
│   ├── api/
│   │   ├── oauth/
│   │   │   ├── authorize/route.ts   # OAuth2 authorize endpoint
│   │   │   └── token/route.ts       # OAuth2 token exchange
│   │   └── v1/
│   │       ├── auth/route.ts        # Admin login, user registration & approval actions
│   │       ├── hermes/route.ts      # Hermes AI conversational assistant with real server context
│   │       ├── keuangan/route.ts    # Financial CRUD, AI parse chat, & independent AI report
│   │       ├── notifications/route.ts # Telegram Bot notifications dispatcher
│   │       ├── processes/route.ts   # Linux process monitoring & systemd daemon controller
│   │       ├── system-status/route.ts # Real Arch Linux telemetry (CPU, RAM, HDD, Temp, Net, WAL)
│   │       └── webhook/bot/route.ts # Inbound Webhook receiver (Telegram & WhatsApp)
│   ├── error.tsx                    # Error boundary
│   ├── global-error.tsx             # Root error boundary
│   ├── globals.css                  # OLED dark theme, glassmorphism, glowing borders, custom tokens
│   ├── layout.tsx                   # HTML metadata & root layout
│   ├── not-found.tsx                # 404 handler
│   ├── page.tsx                     # Main client dashboard router (AI Hub & Admin Login/Control)
│   └── robots.ts                    # Dynamic Next.js robots.txt handler
├── components/
│   ├── Navbar.tsx                   # Floating Island Glass Navbar & mobile header/nav
│   ├── AiHubTab.tsx                 # AI Model Directory, 9Router guide, verified prompt library
│   ├── AdminControlTab.tsx          # 4-in-1 Admin panel: Users, Keuangan, Telemetri, Daemons
│   ├── HardwareTab.tsx              # Hardware metrics & real-time telemetry AreaChart
│   ├── LoginGate.tsx                # Cyberpunk 3D tilt biometric login component
│   ├── Logo3D.tsx                   # Three.js + Anime.js 3D extruded logo with floating shards
│   └── finance/
│       ├── FinanceTab.tsx           # Financial dashboard tab coordinator
│       ├── OverviewCards.tsx        # KPI income/expense/net profit & BarChart trends
│       ├── TransactionForm.tsx      # Manual transaction entry modal
│       ├── TransactionList.tsx      # Transaction table & mobile card view with search/filter
│       ├── TransactionDetailModal.tsx # Single transaction detail modal
│       └── shared.ts                # Financial types & Rupiah currency formatter
├── data/
│   ├── keuangan.db                  # Primary SQLite WAL database
│   ├── keuangan.db-shm / -wal       # SQLite WAL shared memory & write-ahead log
│   └── oauth.json                   # OAuth credentials configuration
├── lib/
│   ├── api.ts                       # Authenticated client fetch helpers
│   ├── auth.ts                      # Backend auth guards & 403 response builders
│   ├── db.ts                        # node:sqlite wrapper, WAL pragma, table schemas & CRUD
│   ├── keuangan.ts                  # Financial calculation, Gemini NLP extractor, rule-based fallback
│   ├── oauth-store.ts               # Shared in-memory OAuth2 store
│   └── utils.ts                     # Tailwind class merge utility (cn)
├── public/
│   ├── fonts/helvetiker_bold.typeface.json # 3D typeface for Three.js
│   └── robots.txt                   # Static robots.txt definition
├── scripts/
│   └── backup-db.sh                 # Automated SQLite database backup script (14-day retention)
├── package.json
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── eslint.config.mjs
```

---

## 4. Build, Server & Runtime Infrastructure

### A. Build Pipeline & Commands
- **Build Command**: `NODE_OPTIONS="--max-old-space-size=4096" bun run build`
- **Output Status**: Compiled in 188ms, TypeScript typecheck in 2.6s, 5 static pages generated, 9 dynamic API routes compiled cleanly with **0 errors and 0 warnings**.
- **Page Optimization**:
  - `○ /` (Static / Prerendered Client Root)
  - `○ /_not-found` (Static)
  - `○ /robots.txt` (Static)
  - `ƒ /api/*` (Dynamic server-rendered endpoints)

### B. Systemd Service Specification
- **Service Name**: `apu-webid.service` (User service: `systemctl --user status apu-webid.service`)
- **Unit Configuration Path**: `/home/apu/.config/systemd/user/apu-webid.service`
- **Configuration Details**:
  ```ini
  [Unit]
  Description=APU WebID Next (Next.js 15 dashboard, apu.web.id)
  After=network.target apu-ecosystem.service apu-backend.service 9router.service
  Wants=network.target

  [Service]
  Type=simple
  Restart=on-failure
  RestartSec=3
  User=apu
  Group=apu
  WorkingDirectory=/home/apu/projects/apu.web.id
  Environment=PORT=3100
  EnvironmentFile=/home/apu/projects/apu.web.id/.env.local
  ExecStart=/usr/sbin/node node_modules/next/dist/bin/next start

  [Install]
  WantedBy=default.target
  ```
- **Service Status**: Active (running), memory ~53.8 MB, managed under port 3100.

### C. Network & HTTP Verification
- **Port**: `3100` (`http://localhost:3100`)
- **HTTP Verification**:
  - `curl -i http://localhost:3100/` → Returns `HTTP/1.1 200 OK`
  - `curl -i http://localhost:3100/robots.txt` → Returns `HTTP/1.1 200 OK`
- **Robots.txt Rules**:
  ```
  User-agent: *
  Allow: /
  Disallow: /api/
  Disallow: /#admin
  Sitemap: https://apu.web.id/sitemap.xml
  ```

---

## 5. Visual Design & Styling Architecture

The frontend follows an **Awwwards-tier visual design** philosophy:

1. **Color Palette & Dark Mode**:
   - Background Base: `#05050d` (OLED Dark Mode)
   - Secondary Surfaces: `#0a0a10`, `rgba(255, 255, 255, 0.03)`
   - Accents: Cyan (`#22d3ee` / `rgba(34, 211, 238, 0.1)`), Emerald (`#22C55E`), Amber (`#FBBF24`), Rose (`#f43f5e`)
   - Selection Color: `bg-[#22d3ee]` with `text-[#030309]`

2. **Double-Bezel (Doppelrand) Nested Card Architecture**:
   - Outer shell: `p-1 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-2xl backdrop-blur-2xl`
   - Inner core: `rounded-[calc(2.5rem-0.25rem)] bg-[#05050d] p-6 sm:p-8`
   - Subtle inner border highlights with glowing ambient radial blurs (`bg-cyan-500/10 blur-3xl`).

3. **Floating Island Glass Navbar**:
   - Positioned sticky at `top-4` with rounded pill container `rounded-full bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl`.
   - Inner pill: `rounded-full bg-[#05050d]/90 px-6 py-2.5`.
   - Micro-interaction: Active pill highlight `bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20`.

4. **Fluid Motion & Physics**:
   - Spring transitions configured with `cubic-bezier(0.32, 0.72, 0, 1)` across all interactive elements.
   - Tactile feedback with `active:scale-[0.98]` on buttons and cards.
   - Conic animated rotating borders (`@property --angle`) with `@media (prefers-reduced-motion: reduce)` safety guards.

---

## 6. Authentication & Security Boundaries

1. **Public Boundary**:
   - Public visitors only see `AiHubTab` (Model Directory, 9Router guide, Prompts).
   - Direct access to `/#admin` requires authenticating via Master Token / registered approved credentials.
2. **Master Token Authorization**:
   - Handled via `lib/auth.ts` and `app/api/v1/auth/route.ts`.
   - Auth header accepts `Authorization: Bearer <token>`, `x-webhook-token`, or `x-telegram-bot-api-secret-token`.
   - Protected routes (`/api/v1/processes` daemon control, `/api/v1/keuangan` mutations, `/api/v1/auth` approval actions, `/api/v1/hermes` queries) return HTTP 403 `Access denied. Fuck you!` if unauthorized.

---

## 7. Key Findings & Observations Table

| Component / Subsystem | Current State | Verification Status | Notes |
| :--- | :--- | :--- | :--- |
| **Next.js App Router** | v16.3.0 + Turbopack | ✅ Verified | Fast compile, 0 type errors |
| **Styling & CSS** | Tailwind v4 + Custom Tokens | ✅ Verified | OLED dark `#05050d`, Doppelrand cards |
| **Systemd Service** | `apu-webid.service` | ✅ Active (Running) | Port 3100, managed via systemd user unit |
| **Public AI Hub** | AI Models + Prompts + 9Router | ✅ Fully Functional | Interactive showcase & 1-click copy |
| **Admin Control** | Users + Keuangan + Telemetri + Services | ✅ Fully Functional | Protected by Master Token & Auth Guard |
| **Database** | SQLite WAL on HDD (`keuangan.db`) | ✅ Active WAL | Atomic write, backup script in place |
| **Robots.txt** | Disallow `/api/` & `/#admin` | ✅ Verified HTTP 200 | Proper SEO shielding |
