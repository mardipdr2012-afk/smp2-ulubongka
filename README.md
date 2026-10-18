# Absen SMP Negeri 2 Ulubongka — Frontend

Portal presensi digital berbasis QR Code. Frontend statis (HTML/CSS/JS) untuk GitHub Pages;
backend berupa Google Apps Script (REST API JSON) dengan Google Sheets sebagai database.

## Struktur

```
index.html        halaman utama (SPA)
css/style.css     seluruh gaya
js/config.js      GAS_URL — isi dengan URL /exec Apps Script
js/api.js         klien fetch ke backend
js/app.js         logika aplikasi
```

## Sebelum deploy

Isi `GAS_URL` di `js/config.js` dengan URL Web App Apps Script (berakhiran `/exec`).

Panduan lengkap ada di `PANDUAN-INSTALASI.md`.
