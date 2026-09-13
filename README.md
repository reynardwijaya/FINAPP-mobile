# 💰 FinApp

Aplikasi mobile pencatatan keuangan (income & expense tracker) dengan dashboard, analitik tren bulanan, dan insight keuangan berbasis AI — dibangun dengan **React Native (Expo)** di sisi mobile dan **Go (Gin + GORM)** di sisi backend.

![Frontend](https://img.shields.io/badge/Frontend-Expo%20%2B%20React%20Native-000020?logo=expo&logoColor=white)
![Backend](https://img.shields.io/badge/Backend-Go%20%2B%20Gin-00ADD8?logo=go&logoColor=white)
![Database](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white)

---

## ✨ Fitur Utama

- 🔐 **Login** dengan role admin/staff
- 📊 **Dashboard** — ringkasan saldo, income, dan pengeluaran per bulan
- ➕ **Catat transaksi** — tambah pemasukan & pengeluaran dengan kategori
- 📄 **Riwayat transaksi** — daftar pengeluaran & pemasukan yang bisa difilter per bulan
- 📈 **Analytics** — distribusi pengeluaran per kategori & tren bulanan (chart)
- 🤖 **AI Insights** — ringkasan naratif kondisi keuangan otomatis via Google Gemini
- 🧾 **Budget tracking** — alokasi anggaran per kategori

Detail lengkap tiap fitur, struktur project, dan referensi API ada di [DOCUMENTATION.md](./DOCUMENTATION.md).

---

## 🏗️ Tech Stack

| | |
|---|---|
| **Mobile** | Expo, Expo Router, React Native, TypeScript |
| **Backend** | Go, Gin, GORM |
| **Database** | MySQL |
| **AI** | Google Gemini API |

---

## 📁 Struktur Project

```
FINAPP-mobile/
├── backend-finance/     # REST API (Go + Gin + GORM)
└── frontend-finance/    # Mobile app (Expo + React Native)
```

---

## 🚀 Quick Start

### Prasyarat
Go ≥ 1.23 · Node.js ≥ 18 · npm · Expo Go (di HP) atau emulator Android/iOS

### 1. Jalankan Backend

```bash
cd backend-finance
cp .env.example .env      # isi DATABASE_URL (wajib) & GEMINI_API_KEY (opsional)
go mod download
go run .
```

Backend akan aktif di `http://localhost:8000`.

### 2. Jalankan Frontend

```bash
cd frontend-finance
npm install
npx expo start
```

Scan QR code dengan **Expo Go**, atau tekan `a` (Android) / `i` (iOS) / `w` (Web) di terminal.

> Tanpa konfigurasi tambahan, frontend otomatis terhubung ke backend production. Untuk connect ke backend lokal, lihat panduan environment variable di [DOCUMENTATION.md](./DOCUMENTATION.md#6-environment-variables).

---

## 📚 Dokumentasi Lengkap

Untuk penjelasan detail fitur, arsitektur, daftar endpoint API, environment variable, dan struktur setiap file, lihat **[DOCUMENTATION.md](./DOCUMENTATION.md)**.
