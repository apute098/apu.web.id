# EXEC TASK — apu.web.id apex: Etalase statis → Next.js 16 (M3)

ROLE: EXECUTOR. Repo: `/home/apu/projects/apu.web.id` (Next.js 16 App Router, React 19, Tailwind 4, Bun).
Service produksi: `apu-webid.service` di **port 3100**, WorkingDirectory = repo ini, `bun run start`.

## Konteks
- `https://apu.web.id` (apex) SAAT INI masih statis dari `/srv/www/etalase` (Caddy `file_server`).
  Aplikasi Next.js di `:3100` sudah live untuk subdomain lain (keuangan/next/panel).
- `app/page.tsx` = halaman apex/landing yang harus dibangun ulang (Etalase: portofolio + karya).
- Dependensi yang SUDAH ADA: `motion`, `framer-motion`, `lucide-react`, `recharts`, `clsx`,
  `tailwind-merge`, `class-variance-authority`. Komponen UI internal: `components/ui/*`.
- Desain yang harus dipertahankan: **liquid glass** — pill/circle, `border 1px white/10`,
  backdrop-blur, gradasi halus. Identitas: portal pribadi + showcase karya.

## ATURAN KERAS (pelanggaran = tugas gagal)
1. **JANGAN** menyentuh: `app/api/**`, `lib/auth.ts`, `lib/telemetry.ts`, `data/**` (termasuk `keuangan.db`),
   `app/admin/**`, `hooks/**`, `.env.local`, `next.config.ts`. Task ini hanya lapisan tampilan apex.
2. **JANGAN** tambah dependency baru. Tidak ada `gsap`, `three`, `ogl`, `react-router-dom`.
3. **JANGAN** pakai data mock/dummy. Semua angka/karya harus nyata atau dari data yang sudah ada.
4. Layout harus jalan tanpa error hidrasi. Verifikasi: `bun run build` sukses TANPA error.
5. Jangan mengubah nama/isi `components/ui/*` yang sudah dipakai halaman lain kecuali menambah export baru.

## Yang harus dikerjakan
### A. `app/page.tsx` — landing apex (server component)
Struktur minimal:
1. **Nav** (sticky, liquid glass pill): brand "Apu" + link ke `/admin` dan cross-link
   `← Lab` → `https://regsi.my.id` (**kontrak wajib, ada test e2e**).
2. **Hero**: nama, satu kalimat posisi (Systems & Software Engineer, Purwokerto), CTA ke karya.
   Background boleh satu shader/animasi halus berbasis CSS/motion — **bukan WebGL**, ringan.
3. **Work grid**: `components/WorkGrid.tsx` (baru) — daftar karya nyata dengan penjelasan singkat.
   Sumber karya: pakai data statis yang kamu tulis sendiri di `components/WorkGrid.tsx` dari daftar ini
   (jangan fetch API, jangan pakai data yang tidak ada):
   - `apu.web.id` — portal + master gateway homelab (Next.js 16, telemetri, kontrol systemd)
   - `regsi.my.id` — blog/lab teknik (Astro 5, Cloudflare)
   - `apute098/OpenBot` — open-source AI coworkers with a computer of their own
   - `apute098/bot-wa-mulyono` — WhatsApp bot
   - `9Router` — gateway multi-model lokal
   - `ARTEMIS` — natural-language Android automation
   Tiap kartu: judul, satu baris deskripsi, tag teknologi, link (kalau publik).
4. **Footer**: nama, tahun, cross-link `← Lab`, link GitHub `https://github.com/apute098`.

### B. `components/GlassCard.tsx` — TIDAK BOLEH menghapus yang lama
Kalau `components/ui/GlassCard.tsx` sudah ada, **pakai yang itu**, jangan duplikasi. Kalau belum
memenuhi kebutuhan hover-glow, tambahkan komponen baru `components/SpotlightPanel.tsx` (klien)
dengan spotlight mengikuti kursor memakai `motion` + `useMotionValue` — tanpa dependency baru.

### C. Requirements teknis wajib
- `app/page.tsx` diekspor sebagai server component; interaktivitas dipisah ke komponen `'use client'`.
- Semua animasi menghormati `prefers-reduced-motion` (pakai `useReducedMotion` dari `motion/react`).
- Metadata: `export const metadata` di `app/page.tsx` dengan `title`, `description`, OpenGraph
  (`title`, `description`, `url: 'https://apu.web.id'`). Jangan hapus metadata global di `app/layout.tsx`.
- Aksesibilitas: nav punya `aria-label`, link cross-link punya teks yang jelas, kontras teks ≥ 4.5:1.

## Verifikasi WAJIB sebelum lapor selesai (sertakan output mentah)
1. `bun run build` → sukses, tanpa error/warning fatal.
2. Jalankan server sementara di port 3999:
   `PORT=3999 bun run start` (background), lalu
   - `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3999/` → harus `200`
   - `curl -s http://127.0.0.1:3999/ | grep -c "regsi.my.id"` → harus ≥ 1 (kontrak cross-link)
   - `curl -s http://127.0.0.1:3999/ | grep -o "<title>[^<]*"` → laporkan hasilnya
   Matikan server itu setelah selesai.
3. **JANGAN** restart `apu-webid.service` dan **JANGAN** deploy. Koordinator yang urus itu.

## Laporan akhir (tulis ke file ini, lalu akhiri)
Tulis ke `/home/apu/projects/apu.web.id/.agents/RESULT-m3.md`:
- daftar file yang diubah/dibuat
- output mentah `bun run build` (bagian ringkasan) + 3 hasil curl
- apa yang TIDAK dikerjakan + alasan
