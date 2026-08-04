# INSTRUKSI OPERASIONAL ORCHESTRATOR SERVER & AGENT BOT (apu.web.id)

Dokumen ini adalah panduan instruksi utama untuk **Hermes Orchestrator Agent** dalam mengorkestrasi alur data, webhook bot, ekstraksi AI, dan penyimpanan data di `apu.web.id`.

---

## 1. ARSITEKTUR HERMES ORCHESTRATOR
Hermes Orchestrator bertindak sebagai Master Controller yang mengatur interaksi antara:
1. **Webhook Ingestion Layer**: Memproses pesan masuk dari WhatsApp Gateway & Telegram Bot API via `POST /api/v1/webhook/bot`.
2. **AI Deductive Parser Engine**: Memanggil Gemini 3.6 Flash / Rule Engine untuk mengabstraksi pesan natural language menjadi entitas transaksi terstruktur (`tipe`, `jumlah`, `kategori`, `keterangan`, `metode`).
3. **SQLite WAL Persistence Layer**: Menyimpan hasil parsial transaksi secara langsung ke database HDD dalam mode Write-Ahead Logging (WAL) tanpa mock data.
4. **AI Financial Analysis Orchestrator**: Menghitung metrics keuangan (Total Pemasukan, Total Pengeluaran, Laba Bersih, Profit Margin) dan menghasilkan **Analisa Mandiri AI Finansial** secara independen.
5. **Auto-Reply Broadcast Dispatcher**: Mengirimkan konfirmasi transaksi dan ringkasan kondisi keuangan server kembali ke pengguna via Telegram/WhatsApp.

---

## 2. WEBHOOK ENDPOINT CONFIGURATION
- **Endpoint**: `https://apu.web.id/api/v1/webhook/bot`
- **Supported Methods**:
  - `GET`: Webhook verification & handshake.
  - `POST`: Menerima payload chat dari Telegram (`body.message.text`) atau WhatsApp (`body.message` / `body.pesan`).

### A. Telegram Bot Webhook Integration:
Jalankan perintah berikut di terminal server atau cURL:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/setWebhook?url=https://apu.web.id/api/v1/webhook/bot"
```

### B. WhatsApp Gateway Integration (Fonnte / Wablas / Baileys):
Set Webhook URL pada Dashboard Provider WhatsApp:
```
https://apu.web.id/api/v1/webhook/bot
```

---

## 3. INSTRUKSI OPERASIONAL SERVER AGENT & ORCHESTRATOR
1. **Zero Mock Data Standard**:
   - Seluruh data transaksi, telemetri, dan log bersifat riil dan dinamis.
   - Tidak ada data dummy yang di-hardcode.

2. **Eksekusi API Endpoint**:
   - `GET /api/v1/keuangan`: Mengambil data transaksi & tren aktual.
   - `POST /api/v1/keuangan` (`action: "ai_parse_chat"`): Mengesekusi ekstraksi NLP untuk pesan transaksi.
   - `POST /api/v1/keuangan` (`action: "ai_analyze_finance"`): Memicu pembuatan laporan analisa finansial independen.
   - `GET /api/v1/system-status`: Mengambil statistik telemetri Arch Linux x86_64 (CPU, RAM, Temp, HDD I/O, Tunnel).
   - `GET /api/v1/processes`: Memantau proses Linux & systemd service (Cloudflared, Nginx, Hermes Agent, 9Router).
   - `GET /api/v1/export-json`: Ekspor bundle `project.json` untuk deployment 1-line extractor.

