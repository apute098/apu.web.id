# RESULT — M3 apex landing (Etalase → Next.js 16)

Status: **SELESAI** — build hijau, verifikasi curl lulus, service produksi TIDAK disentuh.

## File yang diubah/dibuat

| Aksi | File |
|------|------|
| Dibuat | `components/SpotlightPanel.tsx` (client; spotlight kursor via `motion/react` `useMotionValue` + `useMotionTemplate`, dimatikan saat `useReducedMotion()` true) |
| Dibuat | `components/WorkGrid.tsx` (server; 6 karya nyata statis: apu.web.id, regsi.my.id, apute098/OpenBot, apute098/bot-wa-mulyono, 9Router, ARTEMIS — tiap kartu judul + deskripsi + tag + link publik) |
| Diubah (ditulis ulang) | `app/page.tsx` — landing apex server component: sticky nav glass pill (brand "Apu", `#karya`, `← Lab` → `https://regsi.my.id`, `/admin`), hero + CTA, `WorkGrid`, footer (nama, © 2026, `← Lab`, GitHub `apute098`), `export const metadata` (title/description/OpenGraph `url: https://apu.web.id`) |

Tidak menyentuh: `app/api/**`, `lib/**`, `data/**`, `app/admin/**`, `hooks/**`, `.env.local`, `next.config.ts`, `components/ui/*` (dipakai apa adanya), tanpa dependency baru, tanpa data mock.

## Output mentah `bun run build`

```
$ NODE_OPTIONS="--max-old-space-size=4096" next build
▲ Next.js 16.3.0 (Turbopack)
- Environments: .env.local
⚠ Warning: Next.js ignored pnpm-lock.yaml in /home/apu because it is outside the current Git repository (/home/apu/projects/apu.web.id).

✓ Running next.config.ts took 24ms

  Creating an optimized production build ...
✓ Compiled successfully in 168ms
  Running TypeScript ...
  Finished TypeScript in 2.3s ...
  Collecting page data using 3 workers ...
  Generating static pages using 3 workers (0/3) ...
✓ Generating static pages using 3 workers (3/3) in 94ms
  Finalizing page optimization ...

Route (app)
┌ ƒ /
├ ƒ /_not-found
├ ƒ /admin
├ ƒ /api/admin/telemetry
... (routes API tidak berubah) ...
└ ○ /sitemap.xml

○  (Static)   prerendered as static content
ƒ  (Dynamic)   server-rendered on demand
```

Exit code 0, tanpa error. (Warning `pnpm-lock.yaml` pre-existing, di luar repo.)

`./node_modules/.bin/tsc --noEmit` → bersih (0 error).

## Hasil curl (server sementara `PORT=3999 bun run start`, sudah dimatikan)

```
$ curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3999/
200

$ curl -s http://127.0.0.1:3999/ | grep -c "regsi.my.id"
4        (>= 1 ✅ kontrak cross-link)

$ curl -s http://127.0.0.1:3999/ | grep -o "<title>[^<]*"
<title>Apu — Systems &amp; Software Engineer
```

Pendukung (pemeriksaan tambahan): `aria-label="Navigasi utama"` = 1, `Systems &amp; Software Engineer` = 3, `ARTEMIS`/`9Router`/`apute098/OpenBot` semuanya ada, log server 0 error.
Server 3999 sudah dihentikan (listener hilang). `apu-webid.service` tetap `active (running)` sejak 21 jam lalu (tidak pernah di-restart), `http://127.0.0.1:3100/` masih `200` dan masih menyajikan halaman lama (proses produksi memegang modul lama di memori — perubahan baru aktif setelah restart yang jadi tugas koordinator).

## Yang TIDAK dikerjakan + alasan

1. **Restart `apu-webid.service` / deploy** — dilarang aturan keras; urusan koordinator.
2. **E2E `tests/e2e/*` tidak dijalankan/diperbaiki** — suite itu sudah merah SEBELUM perubahan ini (tes `visual`/`aihub`/`tier1` menuntut konten AI Hub lama seperti `DeepSeek R1`, `Prompt Library`, `#05050d`, `active:scale-[0.98]` yang tidak ada lagi di halaman live; diverifikasi lewat curl ke `:3100` sebelum mengedit). Mengganti konten tes = mengubah kontrak, bukan kewenangan executor.
3. **Menambah `motion`/`framer-motion` ke `package.json`** — `motion` ternyata **phantom dependency** (ada di `node_modules`, TIDAK ada di `package.json`/`bun.lock`). Aturan melarang tambah dependency, jadi dicatat di sini: koordinator perlu `bun add motion` supaya `bun install --frozen-lockfile` di mesin lain tidak menghapusnya.
4. **Halaman dashboard lama (`app/page.tsx` sebelumnya)** diganti sesuai spesifikasi M3; komponennya (`Navbar`, `OverviewTab`, dll) masih dipakai `app/admin/page.tsx` jadi tidak ada yang jadi dead-code total. Tidak dibuat route baru (mis. `/monitor`) — di luar scope, YAGNI.
5. **`components/ui/GlassCard.tsx` tidak diduplikasi** — dipakai langsung; `SpotlightPanel.tsx` hanya menambah hover-glow kursor sesuai butir B.
6. **Shader WebGL/gsap/three** — tidak dipakai; hero pakai gradien CSS statis + spotlight ringan.

## Catatan a11y/kontras

Nav punya `aria-label="Navigasi utama"`; cross-link `← Lab` punya `aria-label` eksplisit ("Buka Lab di regsi.my.id (tab baru)"); teks utama `slate-100`/`slate-300` di atas `#050609` (kontras jauh di atas 4.5:1); semua link punya `focus-visible` outline; animasi spotlight otomatis mati pada `prefers-reduced-motion`.
