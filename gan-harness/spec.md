# GAN Harness — Design Spec

## Brief
Redesign halaman landing **apu.web.id** — personal site Regsi Wahyu Saputra (homelab engineer & AI tinkerer, Purwokerto, Indonesia).

**Satu pekerjaan halaman ini:** membuktikan bahwa orang ini benar-benar menjalankan infrastruktur nyata. Semua keputusan desain tunduk pada itu.

### Konteks nyata yang WAJIB dipakai (no mock data)
- Server asli: Arch Linux x86_64, kernel zen 7.1.8, Intel i3-7100 (4 core), RAM 8 GB, HDD 500 GB ext4, Cloudflare Tunnel.
- API live `GET /api/v1/system-status` mengembalikan: `uptime` ("5d 14h 8m"), `cpu.usagePercent/cores/model`, `ram.usedGB/totalGB/usagePercent`, `hdd.usedTB/totalTB/usagePercent`, `temperature.currentC`, `loadAverage[]`, `services{}` (11 systemd unit), `network.downloadKbps/uploadKbps`, `diskIO`.
- Layanan nyata: apu-webid, 9router (AI gateway :20128), hermes-gateway, wa-bridge, mitm-router, mihomo, caddy, cloudflared.
- Kontak nyata: contact@apu.web.id, @locomaniac_bot, wa.me/62877511509544, github.com/apute098.

### Constraint brand (dari user memory)
- **Anti-AI-UI**: TANPA glassmorphism, permukaan kartu solid, vibe premium clean (Linear/Vercel/Stripe) — tapi boleh satu risiko estetika berani yang bisa dibela.
- Accent: cyan `#00f5ff` + orange `#f97316`. NO purple. Background OLED `#05050d`.
- Mobile-first, bahasa Indonesia untuk copy UI.
- Stack: Next.js 16 App Router, React 19, Tailwind v4, GSAP tersedia. Dashboard (`#ai-hub`/`#admin`) TIDAK boleh diubah — scope hanya landing (`components/landing/LandingPage.tsx` + token CSS scoped).
- Aksesibilitas: focus-visible, prefers-reduced-motion, tanpa horizontal scroll di 390px.

### Konten section
1. Hero (identitas + bukti hidup)
2. Tentang + skills
3. Project (3: portal, Hermes agent, 9Router gateway)
4. Pengalaman (4 entri kronologis: 2022-kini Seblak Dower, 2019-2022 Pempek Ny Kamto, 2018-2019 PT Propack, aktif Homelab Engineer)
5. Kontak
6. Footer

## Iteration protocol
- Generator tulis implementasi ke file target, screenshot desktop 1440px & mobile 390px.
- Evaluator nilai pakai rubric, kasih score weighted 0-10 + daftar perbaikan konkret.
- Score >= 7.5 → pass. Maksimum 10 iterasi.
