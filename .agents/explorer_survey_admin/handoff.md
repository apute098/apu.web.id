# Handoff Report — Explorer 2: Admin Control Area & Telemetry Survey

## 1. Observation
1. **Unprotected Financial GET Endpoint**:
   - File: `/home/apu/projects/apu.web.id/app/api/v1/keuangan/route.ts` (lines 33-77).
   - Method: `export async function GET(req: NextRequest)` tidak memiliki pemanggilan `isAuthorized(req)`. Siapapun dapat mengambil riwayat transaksi keuangan dan ringkasan kas tanpa token admin.
2. **Unprotected Process GET Endpoint**:
   - File: `/home/apu/projects/apu.web.id/app/api/v1/processes/route.ts` (lines 174-209).
   - Method: `export async function GET(req: NextRequest)` tidak memverifikasi otorisasi.
3. **Daemon Control Header & Payload Mismatch**:
   - File: `/home/apu/projects/apu.web.id/components/AdminControlTab.tsx` (lines 106-110).
   - Fetch call: `fetch('/api/v1/processes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ command: 'restart_service', service: serviceName }) })`.
   - Tidak ada header `Authorization: Bearer ${token}`, dan menggunakan payload key `command` / `service`, sedangkan `/api/v1/processes/route.ts` (line 220) mengharapkan `action` / `serviceName`.
4. **Service Whitelist Omission**:
   - File: `/home/apu/projects/apu.web.id/app/api/v1/processes/route.ts` (lines 164-169).
   - `ALLOWED_SERVICE_NAMES` hanya mendaftarkan `caddy`, `cloudflared`, `apu-webid-next`, `apu-ecosystem`. Service aktif `apu-webid`, `9router`, `mitm-router`, dan `apu-backend` belum terdaftar.
5. **Database & Telemetry Sensors Verified**:
   - SQLite WAL mode aktif di `/home/apu/projects/apu.web.id/data/keuangan.db` dengan tabel `transaksi` dan `users` (`lib/db.ts`).
   - Telemetri Linux membaca langsung `/proc/stat`, `/proc/meminfo`, `/proc/diskstats`, `/proc/net/dev`, `/sys/class/thermal/thermal_zone0/temp` tanpa overhead shell.
   - User services `apu-webid.service`, `9router.service`, `mitm-router.service` aktif dan berjalan di bawah `systemctl --user`.

## 2. Logic Chain
1. *Acceptance Criteria* R2 & R4 mensyaratkan: *"Non-authenticated users cannot access Keuangan or Router control panels without admin authentication."*
2. Dari Observasi 1 dan 2, `GET /api/v1/keuangan` dan `GET /api/v1/processes` mengembalikan data lengkap kepada klien yang tidak terotentikasi. Oleh karena itu, proteksi `isAuthorized(req)` wajib ditambahkan pada method `GET`.
3. Dari Observasi 3 dan 4, fitur "Daemon Quick Control" pada tab Admin gagal berfungsi karena permintaan POST ditolak 403 (tanpa token) dan ditolak 400/403 (nama service tidak ada dalam whitelist serta nama properti payload salah).
4. Menambahkan token otentikasi pada `handleRestartService`, menyesuaikan skema JSON payload (`action`, `serviceName`), dan memperbarui `ALLOWED_SERVICE_NAMES` akan mengaktifkan kontrol daemon secara aman.
5. Seluruh 4 sub-panel (`User Approvals`, `Keuangan Dashboard`, `Server Telemetry`, `Daemon Quick Control`) telah memiliki fondasi modul dan komponen yang siap disempurnakan.

## 3. Caveats
- Investigasi bersifat read-only tanpa modifikasi berkas kode sumber.
- Pengujian eksekusi `sudo -n systemctl` untuk system unit (seperti Caddy) bergantung pada konfigurasi sudoers user `apu` tanpa password. Untuk user unit (`systemctl --user`), sudo tidak diperlukan.

## 4. Conclusion
Arsitektur Admin Master Control (`#admin`) dan Telemetri Server Arch Linux sudah terpetakan secara lengkap.
Langkah perbaikan implementer yang direkomendasikan:
1. Pasang `if (!isAuthorized(req)) return unauthorized();` pada `GET /api/v1/keuangan` dan `GET /api/v1/processes`.
2. Perbarui `ALLOWED_SERVICE_NAMES` di `app/api/v1/processes/route.ts` dengan menyertakan `apu-webid`, `9router`, `mitm-router`, `apu-backend`.
3. Perbaiki fungsi `handleRestartService` di `components/AdminControlTab.tsx` untuk menyertakan `Authorization: Bearer ${token}` dan payload `{ action: 'restart_service', serviceName: cleanName }`.
4. Pastikan `AdminControlTab.tsx` dan `FinanceTab.tsx` menyertakan token otentikasi saat memanggil API.

## 5. Verification Method
- **Command 1**: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/api/v1/keuangan` (Ekspektasi: `403` jika unauthenticated).
- **Command 2**: `curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer 76c7cb42f88363744ac20d23377a29dd" http://localhost:3100/api/v1/keuangan` (Ekspektasi: `200`).
- **Command 3**: `curl -s http://localhost:3100/api/v1/system-status | grep '"status":"online"'` (Ekspektasi: telemetry aktif).
- **Command 4**: `bun run build` (Ekspektasi: exit code 0 tanpa error TypeScript).
