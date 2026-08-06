# apu.web.id

Portal pribadi & master gateway — dashboard, telemetri hardware, dan financial telemetry hub. Self-hosted di homelab APU (Arch Linux, Cloudflare Tunnel, SQLite WAL).

## Tech Stack

| Layer | Stack |
|-------|-------|
| Framework | Next.js 15 + TypeScript |
| UI | Tailwind CSS |
| DB | SQLite (WAL mode) |
| AI | Hermes Orchestrator + 9router gateway |
| Proxy | Caddy → Cloudflare Tunnel |

## Struktur

```
|apu-webid/
├── app/          # Next.js app router (pages + API routes)
├── components/   # UI components
├── hooks/        # React hooks
├── lib/          # Shared logic
├── data/         # SQLite DB
└── scripts/      # Utility scripts
```

## Endpoint Utama (API v1)

- `GET/POST /api/v1/keuangan` — transaksi, AI parse chat, analisa finansial
- `GET/POST /api/v1/system-status` — telemetri CPU/RAM/temp/HDD/network
- `GET/POST /api/v1/processes` — monitoring & kontrol proses/systemd
- `POST /api/v1/webhook/bot` — webhook Telegram/WhatsApp bot
- `GET/POST /api/v1/notifications` — notifikasi Telegram
- `GET/POST /api/v1/hermes` — Hermes AI orchestrator endpoint
- `GET/POST /api/oauth/authorize` — OAuth authorization
- `GET/POST /api/oauth/token` — OAuth token exchange

## Run

```bash
bun install
bun run dev     # dev
bun run build && bun run start   # production
```

Deploy: unit systemd `apu-webid.service`, Caddy reverse proxy ke :3100, tunnel Cloudflare. Detail: `AGENTS.md`.
