# Project: apu.web.id AI Knowledge Hub & Admin Master Control

## Architecture
- **Framework**: Next.js 16.3.0 (App Router, Turbopack), React 19, Tailwind CSS v4.
- **Runtime**: Bun / Node.js on Arch Linux (systemd user unit: `apu-webid.service`, port 3100).
- **Styling & Visual Design**:
  - OLED Dark Mode base (`#05050d`).
  - Doppelrand (Double-Bezel) nested card architecture (`p-1` outer gradient border + inner `#05050d`/80 backdrop).
  - Floating Island Glass Navbar with blur effects (`backdrop-blur-xl`).
  - Button-in-Button CTA buttons with trailing circular icons.
  - Fluid spring transitions: `cubic-bezier(0.32, 0.72, 0, 1)`.
- **Backend & Security**:
  - Master Token Bearer Authentication (`lib/auth.ts`, `app/api/v1/auth/route.ts`).
  - SQLite WAL mode database (`data/keuangan.db`) for transaction logging and user approvals.
  - Protected API routes (`/api/v1/keuangan`, `/api/v1/processes`, `/api/v1/users`, `/api/v1/system-status`).
  - Direct Linux kernel metrics parsing (`/proc/stat`, `/proc/meminfo`, `/proc/diskstats`, `/proc/net/dev`, `/sys/class/thermal`).
- **AI Gateway & Showcase**:
  - 9Router integration at `http://localhost:20128/v1`.
  - Curated model specs (DeepSeek R1/V3, Claude 3.7 Sonnet, GPT-4o, Gemini 1.5).
  - Interactive AI Prompt Library with category filters, parameter substitution, and 1-click copy.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| F1 | AI Models Showcase | Interactive cards & specs for DeepSeek R1/V3, Claude 3.7 Sonnet, GPT-4o, Gemini 1.5 | M2 | ORIGINAL_REQUEST §R1 | DONE |
| F2 | 1-Click Prompt Library | Categorized prompts with parameter replacement and instant clipboard copy | M2 | ORIGINAL_REQUEST §R1 | DONE |
| F3 | 9Router Gateway Guide | Integration guide, endpoints, multi-language snippets (cURL, TS, Python, Go), and health badge | M2 | ORIGINAL_REQUEST §R1 | DONE |
| F4 | Admin Authentication Gate | Restrict `#admin` tab and APIs to authenticated master sessions | M1, M3 | ORIGINAL_REQUEST §R2 | DONE |
| F5 | User Approvals Sub-panel | UI & backend for managing user access whitelist / approvals | M3 | ORIGINAL_REQUEST §R2 | DONE |
| F6 | Keuangan Dashboard Sub-panel | Financial dashboard with protected GET/POST `/api/v1/keuangan` | M1, M3 | ORIGINAL_REQUEST §R2 | DONE |
| F7 | Server Telemetry Sub-panel | Real-time Arch Linux telemetry (CPU, RAM, Disk, Net, Thermal, Bun runtime) | M3 | ORIGINAL_REQUEST §R2 | DONE |
| F8 | Systemd Daemon Control | Quick control & restart for user daemons (`apu-webid`, `9router`, `mitm-router`, `caddy`) | M1, M3 | ORIGINAL_REQUEST §R2 | DONE |
| F9 | Awwwards Visual System | Floating Island Navbar, Doppelrand cards, Button-in-Button CTA, OLED theme, Spring transitions | M4 | ORIGINAL_REQUEST §R3 | DONE |
| F10 | Build & Production Invariants | Clean TypeScript build, systemd service active, HTTP 200 on `/` and `/robots.txt` | M5 | ORIGINAL_REQUEST §Acceptance Criteria | DONE |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Security Hardening & API Protection | Protect GET `/api/v1/keuangan` & `/api/v1/processes`, update daemon service whitelist & payload schema | none | DONE |
| M2 | AI Hub & 9Router Integration | Interactive model showcase, 1-click prompt library, 9Router guide, code snippets & health badge | none | DONE |
| M3 | Admin Master Control Area | 4 sub-panels (User Approvals, Keuangan, Telemetry, Daemon Quick Control) with authenticated state | M1 | DONE |
| M4 | Visual Polish & Motion Architecture | Doppelrand nested card styling, Floating Navbar, Button-in-Button CTA, OLED dark mode, spring easing | M2, M3 | DONE |
| M5 | E2E Testing, Build & Service Verification | 100% E2E test pass, adversarial verification, bun build 0 errors, systemd service active, curl 200 | M1, M2, M3, M4 | DONE |

---

## Interface Contracts

### 1. Master Token Authentication (`/api/v1/auth`, `lib/auth.ts`)
- Header: `Authorization: Bearer <MASTER_TOKEN>`
- Validation: SHA-256 constant-time comparison against master secret or valid session cookie.
- Response on failure: `403 Forbidden` (`{ "error": "Forbidden", "statusCode": 403 }`).

### 2. Financial API (`/api/v1/keuangan`)
- `GET /api/v1/keuangan` (Auth required):
  - Response: `{ "success": true, "saldo": number, "pemasukan": number, "pengeluaran": number, "transaksi": Transaksi[] }`
- `POST /api/v1/keuangan` (Auth required):
  - Request: `{ "tipe": "pemasukan" | "pengeluaran", "nominal": number, "kategori": string, "keterangan": string }`
  - Response: `{ "success": true, "id": number }`

### 3. System Processes & Daemon Quick Control (`/api/v1/processes`)
- `GET /api/v1/processes` (Auth required):
  - Response: `{ "services": ServiceStatus[], "processes": ProcessInfo[] }`
- `POST /api/v1/processes` (Auth required):
  - Request: `{ "action": "restart_service" | "stop_service" | "start_service", "serviceName": string }`
  - Allowed services: `["apu-webid", "9router", "mitm-router", "apu-backend", "caddy", "cloudflared"]`
  - Response: `{ "success": true, "message": string }`

### 4. 9Router Gateway (`http://localhost:20128/v1`)
- Health Check: `GET http://localhost:20128/api/health` -> `{ "ok": true }`
- Models Endpoint: `GET http://localhost:20128/v1/models` -> OpenAI-compatible model list.
- Chat Completions: `POST http://localhost:20128/v1/chat/completions` (OpenAI format).

---

## Code Layout
- `app/layout.tsx` - Root layout with fonts, metadata, global styles.
- `app/page.tsx` - Main page orchestrating Navbar, Hero, AI Hub Tab, Admin Tab (#admin).
- `app/globals.css` - Design tokens, Doppelrand styles, OLED palette, cubic-bezier easing.
- `app/robots.ts` - Robots.txt definition.
- `app/api/v1/` - Next.js App Router API endpoints:
  - `auth/route.ts` - Session authentication & token verification.
  - `keuangan/route.ts` - Protected finance ledger API.
  - `processes/route.ts` - Protected daemon control and process management.
  - `system-status/route.ts` - Server telemetry endpoint.
- `components/` - Interactive UI components:
  - `Navbar.tsx` - Floating island glass navbar.
  - `AiHubTab.tsx` - Public AI Hub portal.
  - `components/aihub/*` - Modular AI model cards, drawers, prompt vault, 9Router guide, and live health badge.
  - `AdminControlTab.tsx` - Restricted master control panel (4 sub-panels).
  - `FinanceTab.tsx` - Keuangan financial management sub-panel.
  - `ProcessManagerTab.tsx` - Server process & daemon quick control.
  - `SystemStatusTab.tsx` - Real-time Arch Linux telemetry charts.
- `lib/` - Shared business logic and utilities:
  - `auth.ts` - Authentication & token verification helpers.
  - `db.ts` - SQLite WAL database connection & schema.
  - `keuangan.ts` - Finance business logic.
