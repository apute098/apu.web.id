# apu.web.id

**Portal pribadi & master gateway homelab APU** — landing page profesional + dashboard server monitor, AI Hub (9Router), financial telemetry, dan admin control panel. Self-hosted pada Arch Linux via systemd + Caddy, di depan Cloudflare Tunnel.

Live: https://apu.web.id

## Fitur

- **Landing page profesional** (personal brand): hero dengan badge status server live, tentang, skill, projects, pengalaman, kontak, footer. Design *liquid glass* (Apple iOS 26 vibe) dengan warna-lock cyan/green/red, pill buttons, mobile-first.
- **Dashboard AI Hub (`/#ai-hub`)**: direktori model AI + benchmark (DeepSeek, Claude, GPT, Gemini, dll), prompt library, 9Router gateway guide + curl builder, komparasi model.
- **Admin Control Panel (`/#admin`)**: manajemen user, proses & service Linux (kill/restart), kontrol sistem.
- **Financial Telemetry Hub**: pencatatan transaksi real-time via webhook Telegram/WhatsApp + ekstraksi AI (Gemini) + analisa finansial otomatis + auto-reply.
- **Server monitor**: telemetri Arch Linux (CPU, RAM, temp, HDD I/O, network) real-time dengan polling 4 detik.
- **Orkestrasi Hermes Agent**: webhook receiver layer untuk bot Telegram & WhatsApp.

## Tech Stack

| Layer | Stack |
|-------|-------|
| Framework | Next.js 16 (App Router) + TypeScript, Turbopack |
| Runtime | Node.js (Next standalone) via systemd, port 3100 |
| UI | Tailwind CSS 4 + lucide-react + recharts + motion |
| DB | SQLite (WAL mode) |
| AI | Hermes Agent (Nous Research) + 9Router AI Gateway (localhost:20128) |
| Proxy | Caddy (`apu.web.id`, `keuangan.apu.web.id` dkk) → Cloudflare Tunnel |

## Struktur

```
apu.web.id/
├── app/                    # Next.js App Router (pages + API)
│   ├── page.tsx            # landing (default) + dashboard (view toggle)
│   ├── api/v1/             # webhook bot, keuangan, system-status, processes, notifications, auth, oauth
│   └── layout.tsx          # metadata, OG, JSON-LD Person schema
├── components/
│   ├── landing/            # LandingPage (hero, tentang, skills, projects, pengalaman, kontak)
│   ├── aihub/              # model cards, prompt cards, drawer, guide, curl builder
│   ├── finance/            # finance tab, transaksi, form, detail modal
│   ├── Navbar.tsx          # floating glass navbar + bottom nav mobile
│   ├── AiHubTab.tsx / AdminControlTab.tsx / HardwareTab.tsx
│   └── LoginGate.tsx       # tidak dirender (buka langsung ke landing/dashboard)
├── lib/                    # helpers, oauth store
├── data/                   # SQLite (keuangan.db) — tidak di-commit
├── public/                 # aset statis
└── scripts/                # utilitas
```

## Rute & Endpoint API

| Endpoint | Fungsi |
|----------|--------|
| `GET /api/v1/system-status` | Telemetri hardware/server (CPU, RAM, temp, disk, network) |
| `GET/POST /api/v1/keuangan` | Data transaksi, `ai_parse_chat`, `ai_analyze_finance` |
| `GET/POST /api/v1/processes` | Daftar proses + `kill`/`restart_service` |
| `POST /api/v1/webhook/bot` | Webhook Telegram/WhatsApp (ekstraksi AI + auto-reply) |
| `GET/POST /api/v1/notifications` | Notifikasi Telegram |
| `GET/POST /api/v1/auth` | Autentikasi admin |
| `GET /api/v1/hermes` | Info/jembatan Hermes agent |
| `GET/POST /api/oauth/*` | OAuth token (internal) |

## Design System

- **Liquid glass**: `.liquid-glass` utility (blur 28px + saturate, layered highlight, inset border, reduced-transparency fallback). Konsep dari [rdev/liquid-glass-react](https://github.com/rdev/liquid-glass-react) & [nikdelvin/liquid-glass](https://github.com/nikdelvin/liquid-glass).
- **Color-lock**: cyan `#22d3ee` (accent), green `#22c55e` (success), red `#f43f5e` (danger). Dilarang ungu/emerald lama. Gradient border animated hanya di 1 focal point (hero CTA).
- **Tipe**: pill buttons (rounded-full), panel glass rounded-2xl, typography Outfit/Fira Code, separator `·` bukan `•`.

## Deploy (self-hosted)

```bash
bun install
bun run build          # wajib exit 0
sudo systemctl restart apu-webid.service   # Next on port 3100
```

Unit systemd: `/etc/systemd/system/apu-webid.service` (`ExecStart=next start -p 3100`). Caddy reverse proxy `apu.web.id → localhost:3100`, subdomain lain (`router.apu.web.id → 20128`, `api.apu.web.id → 8000`, dll).

## Environment

Salin `.env.example` ke `.env.local` dan isi:

- `GEMINI_API_KEY` — ekstraksi & analisa finansial AI
- `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` — notifikasi & auto-reply
- `WEBHOOK_TOKEN` — autentikasi webhook bot

## License

MIT — lihat [LICENSE](LICENSE).