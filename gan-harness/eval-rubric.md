# Eval Rubric — apu.web.id landing design

Nilai tiap dimensi 0–10, kalikan bobot, jumlahkan. Pass jika total ≥ 7.5.

## Design Quality (weight: 0.35)
Apakah komposisi, hierarki, ritme tipografi, dan penggunaan warna terasa dirancang oleh manusia berbakat?
- Hero punya teks/tesis yang langsung mengena, bukan template "nama besar + badge status + gradient".
- Skala tipografi disengaja; display face punya karakter, tidak generik.
- Warna bekerja sebagai sistem (primer cyan, aksen oranye hemat), bukan hiasan acak.
- Ruang kosong dan grid terasa dikomposisi, bukan hasil stack utility Tailwind default.

## Originality (weight: 0.30)
Apakah elemen tanda tangan (signature) halaman ini tidak bisa ditemukan di ribuan portfolio lain?
- Signature element harus lahir dari dunia subjek (homelab Arch Linux, terminal, telemetri, self-hosting) — bukan dari vocabulary desain web umum.
- Hindari tiga cluster default AI: cream+serif+terracotta; near-black+acid-accent tunggal; broadsheet hairline zero-radius.
  - Catatan: near-black+cyan adalah mandat brand di sini — evaluator hanya menilai apakah eksekusinya cukup spesifik-subjek untuk lolos dari cluster, misal lewat artefak vernacular (fastfetch, systemd log, MOTD, ASCII, readout mono) atau komposisi yang tak biasa.
- Kalau signature element dihapus, apakah halaman jadi generik? (harus iya — artinya signature benar-benar membawa identitas)

## Craft (weight: 0.25)
Detail eksekusi:
- Spasi konsisten, alignment presisi, tidak ada elemen setengah jadi.
- Micro-interaction bermakna (bukan dekoratif berlebihan); motion punya satu momen orkestrasi.
- Responsive 390px benar-benar dikomposisi ulang, bukan sekadar collapse kolom.
- State hover/focus terasa selesai.

## Functionality (weight: 0.10)
- Data live dari `/api/v1/system-status` benar dirender, fallback rapi saat fetch gagal.
- Link kontak/dashboard bekerja; hash routing ke dashboard utuh.
- Tanpa error console, tanpa horizontal scroll.

## Format output evaluator
```
scores: design=X originality=Y craft=Z func=W
weighted: N.N / 10
verdict: PASS | REVISE
top-3 fixes (konkret, actionable, prioritas tertinggi dulu):
1. ...
2. ...
3. ...
one-line impression: ...
```
