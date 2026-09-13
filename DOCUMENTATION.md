# FinApp — Dokumentasi Project

Dokumentasi lengkap untuk aplikasi FinApp: apa itu project ini, fitur-fiturnya, struktur folder/file, arsitektur, dan cara instalasi dari nol.

---

## 1. Tentang Project

**FinApp** adalah aplikasi mobile manajemen keuangan (income & expense tracker) yang terdiri dari dua bagian:

- **Frontend** (`frontend-finance/`) — aplikasi mobile/web berbasis **React Native + Expo (Expo Router)**, ditulis dengan TypeScript.
- **Backend** (`backend-finance/`) — REST API berbasis **Go (Gin framework)** dengan **GORM** sebagai ORM ke database **MySQL**.

Aplikasi ini memungkinkan user (admin/staff) untuk mencatat pemasukan & pengeluaran, melihat ringkasan saldo per bulan, serta melihat analitik/tren keuangan — termasuk insight otomatis berbasis AI (Google Gemini).

---

## 2. Fitur

| Fitur | Halaman | Deskripsi |
|---|---|---|
| Login | `Login.tsx` | Login dengan username & password, redirect sesuai role (admin/staff) |
| Dashboard | `(app)/home.tsx` | Ringkasan saldo (income − expense) per bulan, daftar transaksi terbaru, hapus transaksi |
| Tambah Pemasukan | `(app)/add-balance.tsx` | Form input transaksi tipe `income` |
| Tambah Pengeluaran | `(app)/add-expense.tsx` | Form input transaksi tipe `expense`, dengan kategori |
| Daftar Pengeluaran | `(app)/expenses.tsx` | List pengeluaran, filter per bulan, hapus item |
| Daftar Pemasukan | `(app)/income.tsx` | List pemasukan, filter per bulan, hapus item |
| Analytics | `(app)/analytics.tsx` | Distribusi pengeluaran per kategori, tren bulanan income & expense, serta **insight AI** (ringkasan naratif dari Gemini) |
| Budget | `(app)/budget.tsx` | Tampilan alokasi budget per kategori — **catatan:** saat ini masih memakai data statis/dummy, belum terhubung ke API backend |

---

## 3. Tech Stack

**Frontend**
- Expo `^54.0.0` + Expo Router `~4.0.20` (file-based routing)
- React Native `0.76.9`, React `18.3.1`
- TypeScript
- `react-native-chart-kit` — grafik di halaman Analytics
- `expo-linear-gradient`, `@expo/vector-icons` — UI

**Backend**
- Go `1.23.6`
- Gin (`github.com/gin-gonic/gin`) — HTTP router/framework
- GORM (`gorm.io/gorm`) + MySQL driver — ORM & koneksi database
- `gin-contrib/cors` — CORS middleware
- `google/generative-ai-go` (Gemini API) — generate insight keuangan

**Database & Hosting**
- MySQL (di-hosting di Railway)
- Backend production dideploy di Railway (`backendreact-production-e680.up.railway.app`)

---

## 4. Struktur Folder & File Penting

```
FINAPP-mobile/
├── backend-finance/        # REST API (Go)
│   ├── main.go
│   ├── config/
│   │   └── config.go
│   ├── database/
│   │   └── connection.go
│   ├── routes/
│   │   └── routes.go
│   ├── handlers/
│   │   ├── auth.go
│   │   ├── balance.go
│   │   ├── transaction.go
│   │   └── analytics.go
│   ├── models/
│   │   ├── user.go
│   │   └── transaction.go
│   ├── .env.example
│   ├── go.mod / go.sum
│
└── frontend-finance/        # Mobile app (Expo / React Native)
    ├── app/                 # Expo Router — file-based routing
    │   ├── _layout.tsx
    │   ├── index.tsx
    │   ├── Login.tsx
    │   └── (app)/
    │       ├── _layout.tsx
    │       ├── home.tsx
    │       ├── add-balance.tsx
    │       ├── add-expense.tsx
    │       ├── expenses.tsx
    │       ├── income.tsx
    │       ├── analytics.tsx
    │       └── budget.tsx
    ├── constants/
    │   ├── Api.ts
    │   └── Colors.ts
    ├── components/
    ├── hooks/
    ├── assets/
    ├── app.json
    ├── .env.example
    └── package.json
```

### Backend — penjelasan file

| File | Fungsi |
|---|---|
| `main.go` | Entry point aplikasi. Urutan boot: load `.env` → connect database → setup router → jalankan server di port tertentu. |
| `config/config.go` | Loader `.env` sederhana (tanpa dependency eksternal) yang membaca file `.env` di root backend dan meng-inject ke environment process. Juga menyediakan helper `GetEnv(key, fallback)`. |
| `database/connection.go` | Membuka koneksi ke MySQL lewat GORM menggunakan DSN dari `DATABASE_URL`, lalu menjalankan `AutoMigrate` untuk model `Transaction`. |
| `routes/routes.go` | Satu-satunya tempat semua endpoint REST didaftarkan (lihat tabel API di bawah), termasuk middleware CORS. |
| `handlers/auth.go` | `Login` — cek kombinasi username+password ke tabel `users`, balikan role, nama, user_id, dan token dummy. |
| `handlers/balance.go` | `GetBalance` — hitung `income - expense` untuk user & periode (bulan/tahun) tertentu. |
| `handlers/transaction.go` | CRUD transaksi: `GetExpenses`, `GetIncome`, `GetTransactions` (10 terbaru), `CreateTransaction`, `DeleteTransaction`. |
| `handlers/analytics.go` | Agregasi data untuk grafik (`GetSpendingDistribution`, `GetMonthlySpendingTrend`, `GetMonthlyIncomeTrend`) dan `GetInsights` yang mengirim data keuangan ke Gemini API untuk dibuatkan ringkasan naratif. |
| `models/user.go` | Struct `User` (id, username, password, role, name) — dipetakan ke tabel `users`. |
| `models/transaction.go` | Struct `Transaction` (id, title, amount, date, category, type, user_id, created_at) — dipetakan ke tabel `transactions`. |

### Frontend — penjelasan file

| File/Folder | Fungsi |
|---|---|
| `app/_layout.tsx` | Root layout Expo Router. Mendaftarkan stack screen: `index`, `Login`, `(app)`. Juga handle splash screen & font loading. |
| `app/index.tsx` | Route awal (`/`) — langsung redirect ke `/Login`. |
| `app/Login.tsx` | Halaman login, memanggil endpoint `POST /login`. |
| `app/(app)/_layout.tsx` | Layout stack untuk grup route setelah login (route group `(app)` tidak muncul di URL). |
| `app/(app)/*.tsx` | Halaman-halaman utama aplikasi setelah login (home, add-balance, add-expense, expenses, income, analytics, budget). |
| `constants/Api.ts` | **Konfigurasi terpusat** untuk base URL backend — dibaca dari `process.env.EXPO_PUBLIC_API_URL`, dengan fallback ke URL production Railway. Semua pemanggilan `fetch()` di halaman-halaman di atas mengimpor `API_BASE_URL` dari sini. |
| `constants/Colors.ts` | Definisi warna tema light/dark. |
| `components/` | Komponen UI reusable bawaan template Expo (ThemedText, ThemedView, Collapsible, dll). |
| `hooks/` | Custom hooks, contoh: `useColorScheme`, `useThemeColor`. |
| `app.json` | Konfigurasi project Expo (nama app, icon, splash screen, plugin). |

> **Catatan:** Project ini sebelumnya sempat menyisakan `app/App.tsx`, `app/Home.tsx`, dan `app/layout.tsx` — boilerplate `@react-navigation` dari sebelum migrasi ke Expo Router yang sudah tidak dipakai dalam routing aktif. File-file tersebut sudah dihapus; routing sekarang sepenuhnya lewat `_layout.tsx` + file-based routing di atas.

---

## 5. Arsitektur & Alur Data (Frontend ↔ Backend)

```
[Expo App / React Native]  --fetch(JSON, HTTP)-->  [Gin REST API]  --GORM-->  [MySQL (Railway)]
                                                          |
                                                          '--> Gemini API (khusus endpoint /analytics/insights)
```

Base URL API dikonfigurasi lewat env var `EXPO_PUBLIC_API_URL` di frontend (lihat `constants/Api.ts`), sehingga frontend bisa diarahkan ke backend lokal (dev) atau backend production tanpa mengubah kode.

### Daftar Endpoint API

| Method | Path | Handler | Dipakai di halaman |
|---|---|---|---|
| POST | `/login` | `Login` | `Login.tsx` |
| GET | `/balance` | `GetBalance` | `home.tsx` |
| GET | `/expenses` | `GetExpenses` | `expenses.tsx` |
| GET | `/income` | `GetIncome` | `income.tsx` |
| GET | `/transactions` | `GetTransactions` | `home.tsx` |
| POST | `/transactions` | `CreateTransaction` | `add-balance.tsx`, `add-expense.tsx` |
| DELETE | `/transactions/:id` | `DeleteTransaction` | `home.tsx`, `expenses.tsx`, `income.tsx` |
| GET | `/analytics/spending-distribution` | `GetSpendingDistribution` | `analytics.tsx` |
| GET | `/analytics/monthly-trend` | `GetMonthlySpendingTrend` | `analytics.tsx` |
| GET | `/analytics/monthly-income-trend` | `GetMonthlyIncomeTrend` | `analytics.tsx` |
| GET | `/analytics/insights` | `GetInsights` | `analytics.tsx` |

---

## 6. Environment Variables

### Backend (`backend-finance/.env`)

| Variabel | Wajib? | Keterangan |
|---|---|---|
| `DATABASE_URL` | Ya | DSN MySQL, format: `user:password@tcp(host:port)/dbname?parseTime=true` |
| `GEMINI_API_KEY` | Opsional | Diperlukan hanya untuk endpoint `/analytics/insights`. Tanpa ini, endpoint lain tetap berfungsi normal. |
| `PORT` | Opsional | Port server, default `8000` jika tidak diset. |

Template tersedia di `backend-finance/.env.example`.

### Frontend (`frontend-finance/.env`)

| Variabel | Wajib? | Keterangan |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Opsional | Base URL backend. Jika tidak diset, otomatis fallback ke backend production Railway. Diperlukan hanya jika ingin connect ke backend lokal. |

Template tersedia di `frontend-finance/.env.example`. Perlu diingat: Expo hanya meng-embed env var yang diawali `EXPO_PUBLIC_` ke dalam bundle JS.

---

## 7. Cara Instalasi Lengkap

### Prasyarat

- **Go** ≥ 1.23 — cek dengan `go version`
- **Node.js** ≥ 18 dan **npm** — cek dengan `node -v` dan `npm -v`
- **Expo Go** app (di HP) untuk testing cepat, atau Android Studio/Xcode jika ingin pakai emulator
- Akses ke database MySQL (bisa pakai kredensial Railway yang sudah disediakan tim, atau setup MySQL sendiri)

### A. Setup Backend

```bash
cd backend-finance

# 1. Salin template env lalu isi nilainya
cp .env.example .env
# Edit .env: isi DATABASE_URL (wajib) dan GEMINI_API_KEY (opsional)

# 2. Download dependency Go
go mod download

# 3. Jalankan server
go run .
```

Jika berhasil, akan muncul log `Successful Connection to Railway` (atau DB yang kamu pakai) dan server aktif di `http://localhost:8000` (atau sesuai `PORT`).

### B. Setup Frontend

```bash
cd frontend-finance

# 1. Install dependency
npm install

# 2. (Opsional) Salin template env jika ingin connect ke backend lokal
cp .env.example .env
# Edit .env, isi EXPO_PUBLIC_API_URL dengan IP lokal komputer, contoh:
# EXPO_PUBLIC_API_URL=http://192.168.1.10:8000
# (gunakan IP lokal, BUKAN localhost/127.0.0.1, agar bisa diakses dari HP fisik/emulator)

# 3. Jalankan Expo dev server
npx expo start
```

Setelah `expo start` berjalan, kamu bisa:
- Scan QR code dengan aplikasi **Expo Go** di HP
- Tekan `a` untuk buka di Android emulator
- Tekan `i` untuk buka di iOS simulator (macOS only)
- Tekan `w` untuk buka di browser (web)

> Jika `frontend-finance/.env` tidak dibuat sama sekali, aplikasi tetap bisa jalan — otomatis memakai backend production Railway yang sudah live.

### C. Verifikasi

- Buka aplikasi → halaman Login harus tampil.
- Login dengan akun yang ada di tabel `users` pada database yang dipakai.
- Setelah login, dashboard (`home.tsx`) harus menampilkan saldo & transaksi (kosong jika database masih baru).

---

## 8. Catatan & Known Issues

- **`budget.tsx` masih dummy** — data kategori & angka budget di halaman Budget adalah data statis di kode, belum terhubung ke endpoint backend manapun.
- **Kredensial database** — pastikan `.env` tidak pernah di-commit ke git (`backend-finance/.gitignore` sudah meng-exclude `.env`). Jika kamu memakai kredensial Railway yang sebelumnya sempat ter-commit plaintext di histori git, disarankan untuk merotasi password database tersebut.
- **Password user** disimpan plaintext di tabel `users` (dibandingkan langsung di query SQL pada `handlers/auth.go`) — cukup untuk skala prototipe/internal, tapi bukan praktik yang aman untuk production sesungguhnya.
