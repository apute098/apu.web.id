# HERMES ORCHESTRATOR AGENT & SERVER INSTRUCTIONS — apu.web.id

## Overview
Aplikasi ini berjalan sebagai Master Gateway Portal, Financial Telemetry Hub, dan **Hermes Orchestrator Agent** di `apu.web.id` (Arch Linux x86_64, Cloudflare Tunnel, SQLite WAL HDD Storage, Hermes AI Agent, & 9Router Gateway).

---

## 1. TUGAS & TANGGUNG JAWAB HERMES ORCHESTRATOR
Hermes Orchestrator berfungsi sebagai pusat komando (Master Controller) yang mengkoordinasikan:
1. **Webhook Receiver Layer**: Menerima payload dari Telegram Bot & WhatsApp Gateway di `POST /api/v1/webhook/bot`.
2. **AI Extractor (gemini-2.5-flash)**: Mengolah pesan transaksi berbahasa manusia menjadi JSON transaksi terstruktur.
3. **Database Write Orchestration**: Mencatat transaksi secara real-time ke database SQLite WAL mode di HDD (`keuangan.db`).
4. **Autonomous AI Financial Analyzer**: Menghitung metrics keuangan dan membuat analisis kesehatan finansial server secara mandiri.
5. **Auto-Reply Broadcaster**: Mengirimkan konfirmasi otomatis dan rangkuman posisi finansial kembali ke WhatsApp/Telegram.

---

## 2. INTEGRASI BOT WHATSAPP & TELEGRAM (WEBHOOK REAL-TIME)

### Endpoint Webhook Server:
- `POST /api/v1/webhook/bot`
- `GET  /api/v1/webhook/bot` (Verification & Handshake)

### Cara Mendaftarkan Webhook Telegram Bot:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/setWebhook?url=https://apu.web.id/api/v1/webhook/bot"
```

### Cara Mendaftarkan Webhook WhatsApp (Fonnte / Wablas / Baileys Gateway):
Atur Webhook URL pada Dashboard Provider WhatsApp ke:
```
https://apu.web.id/api/v1/webhook/bot
```

---

## 3. ALUR KERJA ORCHESTRATOR (HERMES AI AGENT)

1. **Pesan Diterima**: User mengirim chat biasa di WhatsApp/Telegram, contoh:
   - *"Beli token listrik PLN server 250rb via QRIS"*
   - *"Dapat transfer pembayaran client website UMKM 3.500.000 via BCA"*
2. **Webhook Receiver**: Webhook `/api/v1/webhook/bot` menerima payload chat secara otomatis.
3. **Ekstraksi AI (gemini-2.5-flash)**:
   - Hermes Orchestrator mengekstrak bidang: `tipe`, `kategori`, `jumlah`, `keterangan`, `metode`, `source`.
4. **Penyimpanan SQLite WAL Mode**:
   - Transaksi langsung disimpan di database SQLite WAL (`keuangan.db`) pada HDD tanpa mock/dummy data.
5. **Analisa Mandiri Finansial (Independent Executive Report)**:
   - Hermes Orchestrator secara otomatis menghitung total pemasukan, pengeluaran, laba bersih, profit margin, dan membuat analisis kesehatan keuangan secara mandiri.
6. **Auto-Reply Broadcast**:
   - Server memberikan balasan balasan ringkasan transaksi & laporan finansial ke chat Telegram/WhatsApp user.

---

## 4. INSTRUKSI API ENDPOINT UNTUK SERVER AGENT

### A. Endpoint Keuangan & AI Analisa:
- `GET /api/v1/keuangan` -> Mendapatkan seluruh data transaksi & grafik tren riil.
- `POST /api/v1/keuangan` dengan `{ "action": "ai_parse_chat", "chatMessage": "...", "source": "..." }` -> Ekstraksi AI & pencatatan transaksi otomatis.
- `POST /api/v1/keuangan` dengan `{ "action": "ai_analyze_finance" }` -> Menghasilkan Analisa Mandiri AI Finansial.

### B. Endpoint Status Telemetri Hardware & Server:
- `GET /api/v1/system-status` -> Telemetri Arch Linux x86_64 (CPU, RAM, Temp, HDD I/O, Network, Cloudflare Tunnel).
- `POST /api/v1/system-status` -> Simulasi beban CPU (tidak tersedia di route ini).

### C. Endpoint Pengelolaan Proses & Service:
- `GET /api/v1/processes` -> Memantau daftar proses Linux & systemd service (Cloudflared, Nginx, Hermes Agent, 9Router).
- `POST /api/v1/processes` -> Eksekusi perintah `kill`, `terminate`, `pause`, `resume` proses atau `restart_service`.

### D. Endpoint Lainnya:
- `GET/POST /api/v1/notifications` — notifikasi Telegram

---

## 5. PERSISTENSI KODE & DATABASE
- Tanpa data dummy / mock data bawaan.
- Semua data bersifat dinamis dan tersimpan langsung dalam mode SQLite WAL HDD storage.

