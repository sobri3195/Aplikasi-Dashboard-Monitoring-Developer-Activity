# 🔌 Cara Menghubungkan Database Neon

Panduan lengkap untuk menghubungkan aplikasi DevMonitor dengan database Neon PostgreSQL.

## 📋 Daftar Isi

1. [Persiapan](#persiapan)
2. [Langkah-langkah Koneksi](#langkah-langkah-koneksi)
3. [Cara Mengisi yang "Disconnected"](#cara-mengisi-yang-disconnected)
4. [Troubleshooting](#troubleshooting)
5. [Testing Koneksi](#testing-koneksi)

---

## 🎯 Persiapan

Sebelum memulai, pastikan Anda memiliki:

- ✅ Akun Neon (gratis di https://neon.tech)
- ✅ Node.js dan npm terinstall
- ✅ Akses ke source code aplikasi
- ✅ Text editor (VS Code, Sublime, dll)

---

## 🚀 Langkah-langkah Koneksi

### Step 1: Buat Akun Neon

1. Buka https://neon.tech
2. Klik "Sign Up" atau "Get Started"
3. Daftar menggunakan email atau GitHub
4. Verifikasi email Anda

### Step 2: Buat Database

1. Login ke Neon dashboard
2. Klik "New Project" atau pilih project yang sudah ada
3. Beri nama project (misalnya: "devmonitor-db")
4. Pilih region terdekat dengan Anda
5. Klik "Create Project"

### Step 3: Dapatkan Connection String

1. Di dashboard Neon, pilih project Anda
2. Klik tab "Connection Details" atau "Dashboard"
3. Cari bagian "Connection String"
4. Pilih bahasa: **PostgreSQL** atau **Node.js**
5. **COPY** connection string yang muncul

Connection string akan terlihat seperti ini:
```
postgresql://username:password@ep-cool-name-123456.neon.tech/neondb?sslmode=require
```

### Step 4: Konfigurasi File .env

1. Buka folder project Anda
2. Buka file `.env` di root folder atau di folder `backend`
3. Cari baris yang bertuliskan:
   ```bash
   # DATABASE_URL=postgresql://...
   ```

4. **HAPUS** tanda `#` di depannya
5. **GANTI** dengan connection string dari Neon:
   ```bash
   DATABASE_URL=postgresql://username:password@ep-cool-name-123456.neon.tech/crimson-base-54008430?sslmode=require
   ```

6. **Ganti** nama database di akhir dengan `crimson-base-54008430` atau sesuai kebutuhan:
   ```bash
   # Dari:
   postgresql://user:pass@host.neon.tech/neondb?sslmode=require
   
   # Menjadi:
   postgresql://user:pass@host.neon.tech/crimson-base-54008430?sslmode=require
   ```

7. **SAVE** file `.env`

### Step 5: Install Dependencies & Migrasi

Buka terminal/command prompt dan jalankan:

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
npm install

# Jalankan migrasi database
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### Step 6: Restart Aplikasi

```bash
# Di folder backend
npm start

# Atau jika menggunakan nodemon
npm run dev
```

---

## 💡 Cara Mengisi yang "Disconnected"

Ketika aplikasi menampilkan status **"Disconnected"**, artinya database belum terhubung. Berikut cara mengatasinya:

### ❌ Yang Perlu Diisi Ketika Disconnected:

#### 1. **DATABASE_URL** (WAJIB)

Ini adalah yang PALING PENTING! Tanpa ini, aplikasi tidak bisa terhubung ke database.

**Lokasi:** File `.env` di folder root atau `backend/.env`

**Format:**
```bash
DATABASE_URL=postgresql://[USERNAME]:[PASSWORD]@[ENDPOINT].neon.tech/[DATABASE_NAME]?sslmode=require
```

**Contoh Lengkap:**
```bash
DATABASE_URL=postgresql://neondb_owner:npg_abc123xyz@ep-wild-fire-123456.us-east-2.aws.neon.tech/crimson-base-54008430?sslmode=require
```

**Cara Mendapatkan:**
1. Login ke Neon dashboard
2. Pilih project Anda
3. Klik "Connection Details"
4. Copy connection string
5. Paste ke file .env

#### 2. **JWT_SECRET** (Recommended)

Untuk keamanan autentikasi:
```bash
JWT_SECRET=your-very-secret-jwt-key-here-minimum-32-characters
```

#### 3. **API_SECRET** (Recommended)

Untuk keamanan API:
```bash
API_SECRET=your-very-secret-api-key-here-minimum-32-characters
```

### ✅ Setelah Diisi:

1. **SAVE** file `.env`
2. **RESTART** aplikasi
3. **REFRESH** browser
4. Status akan berubah menjadi **"Connected"** ✓

### 📱 Cara Cek Status di Aplikasi:

1. Buka aplikasi DevMonitor di browser
2. Login ke dashboard
3. Lihat **sidebar** di sebelah kiri
4. Cari bagian **"Status"** di bagian bawah
5. Klik tombol **"Database Status"**
6. Modal akan muncul menampilkan:
   - ✅ Status koneksi (Connected/Disconnected)
   - 📊 Statistik database (jika connected)
   - 📝 Instruksi lengkap (jika disconnected)
   - 🔧 Panduan setup

---

## 🔧 Troubleshooting

### Problem 1: "DATABASE_URL not configured"

**Penyebab:** File .env tidak ada atau DATABASE_URL belum diset

**Solusi:**
1. Pastikan file `.env` ada
2. Pastikan DATABASE_URL sudah diisi (tidak ada tanda `#` di depan)
3. Restart aplikasi

### Problem 2: "Authentication failed"

**Penyebab:** Username atau password salah

**Solusi:**
1. Cek ulang connection string dari Neon dashboard
2. Pastikan tidak ada spasi atau karakter aneh
3. Copy-paste ulang connection string
4. Jika password punya karakter khusus, encode dengan URL encoder

### Problem 3: "Connection timeout"

**Penyebab:** 
- Project Neon di-suspend (free tier)
- Koneksi internet bermasalah
- Neon service down

**Solusi:**
1. Cek apakah project Neon aktif di dashboard
2. Tunggu beberapa saat (cold start untuk free tier)
3. Cek koneksi internet
4. Cek status Neon: https://neon.tech/status

### Problem 4: "SSL/TLS Error"

**Penyebab:** Connection string tidak punya parameter SSL

**Solusi:**
Pastikan connection string punya `?sslmode=require` di akhir:
```bash
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
                                                         ^^^^^^^^^^^^^^^^
```

### Problem 5: "Table does not exist"

**Penyebab:** Migrasi database belum dijalankan

**Solusi:**
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### Problem 6: Status masih "Disconnected" setelah setup

**Solusi:**
1. Cek file `.env` sudah save
2. Restart aplikasi (stop dan start lagi)
3. Clear cache browser (Ctrl + Shift + R)
4. Cek console browser untuk error (F12)
5. Cek terminal/logs backend untuk error

---

## ✅ Testing Koneksi

### Method 1: Via UI Dashboard

1. Login ke aplikasi
2. Klik **"Database Status"** di sidebar
3. Lihat status koneksi
4. Jika connected, akan muncul statistik database

### Method 2: Via API Endpoint

Buka browser atau gunakan Postman:

#### Test Basic Connection:
```
http://localhost:5000/api/db-connection/status
```

Response jika connected:
```json
{
  "connected": true,
  "database": "crimson-base-54008430",
  "provider": "Neon PostgreSQL",
  "message": "Successfully connected to Neon database",
  "stats": {
    "users": 10,
    "devices": 5,
    "activities": 100
  }
}
```

Response jika disconnected:
```json
{
  "connected": false,
  "database": "crimson-base-54008430",
  "provider": "Neon PostgreSQL",
  "message": "Database URL not configured",
  "instructions": [
    "1. Create a Neon database account...",
    "2. Copy your connection string...",
    "..."
  ]
}
```

#### Test Connection with Details:
```
http://localhost:5000/api/db-connection/test
```

#### Get Setup Guide:
```
http://localhost:5000/api/db-connection/guide
```

### Method 3: Via Terminal

```bash
cd backend
node -e "require('dotenv').config(); console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Configured ✓' : 'Not configured ✗')"
```

---

## 📝 Checklist Koneksi

Gunakan checklist ini untuk memastikan semuanya sudah benar:

- [ ] Akun Neon sudah dibuat
- [ ] Project Neon sudah dibuat
- [ ] Connection string sudah di-copy
- [ ] File `.env` sudah ada
- [ ] DATABASE_URL sudah diisi (tanpa `#`)
- [ ] Format connection string benar
- [ ] `?sslmode=require` ada di akhir URL
- [ ] Dependencies sudah di-install (`npm install`)
- [ ] Migrasi sudah dijalankan (`npx prisma migrate deploy`)
- [ ] Prisma client sudah di-generate (`npx prisma generate`)
- [ ] Aplikasi sudah di-restart
- [ ] Browser sudah di-refresh
- [ ] Status menampilkan "Connected" ✓

---

## 🆘 Masih Bermasalah?

Jika masih mengalami kesulitan:

1. **Cek Logs:**
   ```bash
   # Terminal backend akan menampilkan error
   # Baca pesan error dengan teliti
   ```

2. **Test Manual:**
   ```bash
   cd backend
   npx prisma studio
   # Akan membuka GUI untuk database
   # Jika bisa terbuka, berarti koneksi OK
   ```

3. **Reset & Start Fresh:**
   ```bash
   # Hapus .env
   # Copy dari .env.example
   # Isi ulang DATABASE_URL
   # Restart
   ```

4. **Resources:**
   - Dokumentasi Neon: https://neon.tech/docs
   - Prisma Docs: https://www.prisma.io/docs
   - Neon Status: https://neon.tech/status

---

## 📞 Support

Untuk bantuan lebih lanjut:

- 📧 Email: support@yourdomain.com
- 💬 Discord: [Your Discord Server]
- 📖 Docs: https://yourdomain.com/docs

---

**Selamat! Database Anda sekarang terhubung! 🎉**

Status: ✅ Connected
Database: crimson-base-54008430
Provider: Neon PostgreSQL
