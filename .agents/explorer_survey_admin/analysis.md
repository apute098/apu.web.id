# Survey & Technical Analysis: Restricted Admin Control Area & Telemetry System
**Target**: `apu.web.id` (Next.js 16 + React 19 + Bun/Node 26 + Arch Linux 7.1.6-zen)  
**Agent**: Explorer 2 (Admin Control Area & Telemetry Survey)  
**Timestamp**: 2026-08-14T04:40:00Z  

---

## 1. Executive Summary

Proyek `apu.web.id` dirancang dengan arsitektur portal publik (AI Hub, Direktori Model, Prompt Library) yang berdampingan dengan **Restricted Admin Master Control Area (`#admin`)**. Area admin ini mengelola data sensitif (Keuangan, Daftar Pengguna, Telemetri Server Kernel Arch Linux, dan Daemon Systemd Control).

Berdasarkan audit mendalam terhadap seluruh endpoint backend (`app/api/v1/*`), pustaka utilitas (`lib/*`), dan komponen antarmuka (`components/*`), ditemukan beberapa temuan arsitektural krusial dan celah keamanan (*security gaps*) yang perlu diperbaiki agar memenuhi standar keamanan produksi dan acceptance criteria.

---

## 2. Authentication & Session Management Architecture

### A. Current Implementation Analysis
1. **Master Token & Auth Guard (`lib/auth.ts`)**:
   - Fungsi `isAuthorized(req)` memeriksa token dari header:
     - `Authorization: Bearer <token>`
     - `x-webhook-token: <token>`
     - `x-telegram-bot-api-secret-token: <token>`
   - Nilai token diambil dari `process.env.WEBHOOK_TOKEN` (terdefinisi di `.env.local`).
2. **User Database & Hashing (`lib/db.ts` & `app/api/v1/auth/route.ts`)**:
   - Tabel `users` di SQLite `data/keuangan.db` menyimpan:
     `id`, `username`, `email`, `password_hash`, `role`, `status` (`pending` | `approved` | `rejected`), `created_at`.
   - Hashing password menggunakan SHA-256 (`createHash('sha256').update('apu_salt_' + pwd)`).
   - Registrasi pengguna baru secara otomatis berstatus `pending` dan memerlukan persetujuan Admin Master.
3. **Client-Side Session (`app/page.tsx` & `lib/api.ts`)**:
   - Token tersimpan di `localStorage.getItem('apu_admin_token')`.
   - Login form memvalidasi input terhadap `/api/v1/auth`.

### B. Identified Gaps & Vulnerabilities
| No | Komponen / Endpoint | Temuan Kerentanan | Tingkat Risiko |
|---|---|---|---|
| 1 | `GET /api/v1/keuangan` | **Tidak ada auth check**. Siapapun tanpa login dapat mengakses seluruh data transaksi keuangan dan ringkasan kas via HTTP GET biasa. | **HIGH** |
| 2 | `GET /api/v1/processes` | **Tidak ada auth check**. Siapapun dapat melihat daftar proses sistem, PID, memory, dan status daemon via HTTP GET. | **MEDIUM** |
| 3 | `AdminControlTab.tsx` (Service Restart) | `handleRestartService` memanggil `fetch('/api/v1/processes')` **tanpa header `Authorization: Bearer ${token}`**, sehingga aksi restart selalu ditolak 403. | **HIGH** (Bug Fungsional) |
| 4 | Schema Mismatch di Daemon Control | Frontend mengirim `{ command: 'restart_service', service: 'apu-webid.service' }` sedangkan backend mengharapkan `{ action: 'restart_service', serviceName: 'apu-webid' }`. | **HIGH** (Bug Fungsional) |
| 5 | Whitelist Service Belum Lengkap | `ALLOWED_SERVICE_NAMES` di backend belum mendaftarkan service utama (`apu-webid`, `9router`, `mitm-router`, `apu-backend`). | **HIGH** (Bug Fungsional) |

### C. Recommended Secure Architecture
1. **Endpoint Protection**: Tambahkan guard `if (!isAuthorized(req)) return unauthorized();` pada **semua** metode `GET` dan `POST` di `/api/v1/keuangan` dan `/api/v1/processes`.
2. **Session Verification API**: Sediakan endpoint `GET /api/v1/auth?action=verify` atau validasi token saat komponen dimuat agar session di `localStorage` tervalidasi secara real-time ke server.
3. **Double-Lock UI**:
   - Jika `!isAdminSession`, rute hash `#admin` merender form `LoginGate` / `Master Login`.
   - Data keuangan dan proses daemon tidak di-fetch sama sekali oleh browser sebelum token valid.

---

## 3. The 4 Admin Sub-Panels Architecture

### Sub-Panel 1: User Approval Management (`#admin -> users`)
- **Fungsi**: Meninjau, menyetujui, dan menolak pendaftaran akun pengguna baru.
- **Data Store**: Tabel `users` di `lib/db.ts` (SQLite WAL mode).
- **Metrik Cepat**:
  - `Pending Approval` (Badge Kuning / Pulse)
  - `User Disetujui` (Badge Hijau)
  - `User Ditolak` (Badge Merah)
- **Aksi Kontrol**:
  - `Setujui`: `POST /api/v1/auth` `{ action: 'approve_user', userId: id }` -> Update status ke `approved`.
  - `Tolak`: `POST /api/v1/auth` `{ action: 'reject_user', userId: id }` -> Update status ke `rejected`.
- **UI State**: Data table responsif dengan formatting tanggal lokal ID (`id-ID`), badge status dinamis, dan feedback notifikasi toast.

### Sub-Panel 2: Keuangan & Billing Dashboard (`#admin -> keuangan`)
- **Fungsi**: Pemantauan arus kas (Pemasukan, Pengeluaran, Laba Bersih, Margin Profit %), pelacakan biaya operasional AI (API Gemini, 9Router, DeepSeek), dan AI Financial Analysis.
- **Data Store**: Tabel `transaksi` di `data/keuangan.db` (SQLite WAL mode) dengan fallback atomic JSON (`data/keuangan.json`).
- **Komponen Utama**:
  - `OverviewCards`: Kartu metrik total pemasukan, pengeluaran, saldo bersih, persentase margin, dan mode storage (SQLite WAL Active).
  - `TransactionList`: Tabel filterable (pencarian teks, filter tipe: All, Pemasukan, Pengeluaran), modal detail transaksi, dan tombol input transaksi baru.
  - `AI Financial Analyzer`: Integrasi `@google/genai` (Gemini 2.5 Flash) via `generateFinanceReport()` untuk ringkasan analisis keuangan otomatis.
- **Keamanan**: Seluruh query data dan mutasi wajib menyertakan token autentikasi admin.

### Sub-Panel 3: Server Telemetry & Kernel Metrics (`#admin -> telemetri`)
- **Fungsi**: Memantau kesehatan perangkat keras dan sistem operasi Arch Linux secara real-time tanpa overhead.
- **Metrik Kernel & Procfs yang Dikumpulkan**:
  - **CPU**: Persentase penggunaan rata-rata via `/proc/stat`, jumlah core dan model prosesor via `/proc/cpuinfo`.
  - **RAM**: Penggunaan memori (Used/Free/Total GB dan %) via `/proc/meminfo`.
  - **HDD Storage & WAL**: Kapasitas disk root via `df -B1 -T /` dan status WAL mode pada SQLite (`PRAGMA journal_mode;`).
  - **Temperatur Thermal**: Suhu prosesor (°C) langsung dari sensor `/sys/class/thermal/thermal_zone0/temp`.
  - **Network Traffic**: Kecepatan Download dan Upload real-time (MB/s) dihitung melalui delta byte rate `/proc/net/dev`.
  - **Disk I/O**: Kecepatan baca dan tulis disk (MB/s) via `/proc/diskstats`.
  - **Runtime & Uptime**: Durasi server berjalan via `/proc/uptime`, status Bun runtime dan Node.js version.
- **Visualisasi**:
  - Recharts `AreaChart` real-time 15-tick live buffer dengan gradien warna cyan (`#22d3ee`), emerald (`#10b981`), dan sky (`#38bdf8`).
  - Polling interval otomatis (4 detik) dengan opsi refresh manual.

### Sub-Panel 4: Systemd Daemon Quick Control (`#admin -> services`)
- **Fungsi**: Panel kontrol cepat status, restart, stop, dan start untuk daemon lokal apu.web.id dan AI gateway.
- **Target Service Unit**:
  1. `apu-webid.service` — Dashboard Next.js 16 (Port 3100)
  2. `9router.service` — 9Router Local AI Gateway (Port 20128)
  3. `mitm-router.service` — MITM Router AI Model Proxy (Port 20129)
  4. `apu-backend.service` — Bun/Hono API Engine (Port 8000)
  5. `apu-ecosystem.service` — APU Ecosystem Daemon
  6. `caddy.service` & `cloudflared.service` — Web Server Reverse Proxy & Tunnel (System units)
- **Eksekusi Aman**:
  - User Services: `systemctl --user [restart|stop|start] <unit>.service` (dijalankan langsung dalam hak akses user `apu`, tanpa sudo).
  - System Services: `sudo -n systemctl [restart|stop|start] <unit>.service` (hanya untuk unit dalam whitelist statis).
  - Input Sanitization: Validasi regex `^[a-zA-Z0-9_.-]+$` untuk mencegah command injection.

---

## 4. Backend Endpoints & Route Specifications

| Endpoint | Method | Auth Required | Purpose | Payload / Parameters |
|---|---|---|---|---|
| `/api/v1/auth` | `GET` | **Yes** | Mengambil seluruh daftar pengguna untuk approval | - |
| `/api/v1/auth` | `POST` | **Conditional** | Login, Register, Approve User, Reject User, List Users | `{ action: 'login'\|'register'\|'approve_user'\|'reject_user'\|'list_users', ... }` |
| `/api/v1/keuangan` | `GET` | **Yes** *(Perlu diperketat)* | Mengambil ringkasan, tren, dan daftar transaksi | `?tipe=Pemasukan&q=...` |
| `/api/v1/keuangan` | `POST` | **Yes** | Input transaksi, delete, clear, AI parse chat, AI analyze | `{ action: 'delete'\|'ai_analyze_finance', ... }` |
| `/api/v1/system-status`| `GET` | **No / Public** | Data sensor telemetri kernel Arch Linux (CPU, RAM, Temp, Net, WAL) | - |
| `/api/v1/processes` | `GET` | **Yes** *(Perlu diperketat)* | Mengambil top 20 proses sistem dan status daftar unit systemd | - |
| `/api/v1/processes` | `POST` | **Yes** | Eksekusi restart/stop/start service dan kill process | `{ action: 'restart_service', serviceName: '9router' }` |
| `/api/v1/notifications`| `POST` | **Yes** | Mengirim notifikasi alert via Telegram Bot API | `{ message: '...' }` |

---

## 5. Concrete Code Fix Recommendations

### A. Fix `app/api/v1/keuangan/route.ts` (Protect GET)
```typescript
// BEFORE:
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    // ... no auth check
  }
}

// AFTER:
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const { searchParams } = new URL(req.url);
    // ...
  }
}
```

### B. Fix `app/api/v1/processes/route.ts` (Whitelist & GET Protection)
```typescript
// Update Whitelist:
const ALLOWED_SERVICE_NAMES = new Map<string, 'user' | 'system'>([
  ['apu-webid', 'user'],
  ['apu-webid-next', 'user'],
  ['9router', 'user'],
  ['mitm-router', 'user'],
  ['apu-backend', 'user'],
  ['apu-ecosystem', 'user'],
  ['caddy', 'system'],
  ['cloudflared', 'system'],
]);

// Normalisasi nama service (menghapus akhiran .service jika disertakan):
const cleanName = serviceName.replace(/\.service$/, '');
```

### C. Fix `components/AdminControlTab.tsx` (Pass Auth Token & Correct Schema)
```typescript
// In handleRestartService:
const handleRestartService = async (serviceName: string) => {
  try {
    setRestartingService(serviceName);
    const token = localStorage.getItem('apu_admin_token') || '';
    const cleanServiceName = serviceName.replace(/\.service$/, '');
    const res = await fetch('/api/v1/processes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: 'restart_service', serviceName: cleanServiceName }),
    });
    const data = await res.json();
    // ...
  }
};
```

---

## 6. Verification Plan

1. **API Security Verification**:
   - `curl -i http://localhost:3100/api/v1/keuangan` -> Harus mengembalikan `HTTP 403 Forbidden`.
   - `curl -i -H "Authorization: Bearer <WEBHOOK_TOKEN>" http://localhost:3100/api/v1/keuangan` -> Harus mengembalikan `HTTP 200 OK`.
   - `curl -i http://localhost:3100/api/v1/processes` -> Harus mengembalikan `HTTP 403 Forbidden` (jika diproteksi) atau `HTTP 200 OK` (jika telemetry terbuka).
2. **Sub-panel Functional Testing**:
   - User Approval: Request registrasi user baru -> muncul di tabel -> klik "Setujui" -> status berubah `approved` di database.
   - Keuangan: Input transaksi baru -> tersimpan di SQLite WAL -> grafik dan ringkasan ter-update.
   - Telemetri: Sensor CPU, RAM, Disk I/O, Network, dan Thermal ter-update setiap 4 detik.
   - Daemon Quick Control: Klik restart `9router.service` -> server merespons 200 dengan status sukses, `systemctl --user status 9router.service` tetap active.
