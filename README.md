# 💰 FinApp

FinApp bikin arus kas usaha kecil kelihatan jelas dalam sekali buka — catat pemasukan & pengeluaran harian, lalu biarkan AI yang membacakan kondisi keuanganmu dalam bahasa manusia, bukan cuma deretan angka.

- 🔐 Login berbasis role (admin/staff) — menu yang tampil otomatis menyesuaikan siapa yang login
- 📊 Dashboard saldo bulanan — income, expense, dan sisa saldo dalam satu layar
- ➕ Catat transaksi dalam hitungan detik — pemasukan & pengeluaran lengkap dengan kategori
- 📈 Analytics & tren — distribusi pengeluaran per kategori plus grafik tren bulanan
- 🤖 Insight keuangan otomatis — ringkasan naratif dari Google Gemini, bukan angka mentah

## Tech Stack

| Layer | Teknologi |
|---|---|
| Mobile | React Native (Expo SDK 57), Expo Router, TypeScript |
| Backend | Go 1.23, Gin |
| Database | MySQL (via GORM) |
| AI | Google Gemini API |
| Hosting | Railway (backend & MySQL) |

## Environment Variables

**Backend** (`backend-finance/.env`)
- `DATABASE_URL` — connection string MySQL. Ambil dari Railway Dashboard → service MySQL → tab **Connect**, atau pakai instance lokal.
- `GEMINI_API_KEY` — opsional, dipakai untuk fitur AI Insights. Ambil dari [Google AI Studio](https://aistudio.google.com/apikey).
- `PORT` — opsional, default `8000`.

**Frontend** (`frontend-finance/.env`)
- `EXPO_PUBLIC_API_URL` — opsional, base URL backend. Tanpa ini, otomatis fallback ke backend production.

Template tersedia di masing-masing `.env.example`.

## Cara Instalasi & Menjalankan

**Prasyarat:** Go ≥ 1.23, Node.js ≥ 18 & npm, app **Expo Go** (di HP) atau emulator Android/iOS.

```bash
# 1. Clone repo
git clone https://github.com/reynardwijaya/FINAPP-mobile.git
cd FINAPP-mobile

# 2. Setup & jalankan backend
cd backend-finance
cp .env.example .env      # isi DATABASE_URL (wajib) & GEMINI_API_KEY (opsional)
go mod download
go run .

# 3. Setup & jalankan frontend (di terminal baru)
cd frontend-finance
cp .env.example .env      # opsional, isi EXPO_PUBLIC_API_URL untuk connect ke backend lokal
npm install
npx expo start
```

Setelah `expo start` jalan: scan QR dengan **Expo Go**, atau tekan `a` (Android) / `i` (iOS) / `w` (Web) di terminal.

Script tambahan yang tersedia di frontend: `npm test` (Jest) dan `npm run lint`.
