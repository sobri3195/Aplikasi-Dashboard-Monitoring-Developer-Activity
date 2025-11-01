# Setup Database Neon untuk Backend

Panduan lengkap untuk menghubungkan backend ke database Neon PostgreSQL.

## 📋 Daftar Isi

1. [Persiapan](#persiapan)
2. [Langkah-langkah Setup](#langkah-langkah-setup)
3. [Konfigurasi Environment](#konfigurasi-environment)
4. [Menjalankan Migrasi Database](#menjalankan-migrasi-database)
5. [Testing Koneksi](#testing-koneksi)
6. [Troubleshooting](#troubleshooting)

## 📦 Persiapan

Sebelum memulai, pastikan Anda memiliki:

- ✅ Node.js (versi 16 atau lebih tinggi)
- ✅ npm atau yarn
- ✅ Akun Neon Database (gratis di [neon.tech](https://neon.tech))

## 🚀 Langkah-langkah Setup

### 1. Buat Akun Neon (Jika Belum Ada)

1. Kunjungi [https://console.neon.tech](https://console.neon.tech)
2. Klik "Sign Up" dan buat akun baru
3. Verifikasi email Anda

### 2. Buat Database Baru di Neon

1. Login ke [Neon Console](https://console.neon.tech)
2. Klik "Create Project" atau pilih project yang sudah ada
3. Buat database dengan nama: `crimson-base-54008430`
   - Atau gunakan nama lain dan sesuaikan di connection string
4. Pilih region yang terdekat dengan lokasi Anda
5. Tunggu hingga database selesai dibuat

### 3. Dapatkan Connection String

1. Di Neon Console, buka project Anda
2. Klik tab "Connection Details"
3. Copy connection string dengan format:
   ```
   postgresql://[username]:[password]@[endpoint].neon.tech/crimson-base-54008430?sslmode=require
   ```

**Contoh:**
```
postgresql://myuser:AbCd123!@ep-cool-name-123456.us-east-2.aws.neon.tech/crimson-base-54008430?sslmode=require
```

### 4. Konfigurasi Backend

#### Opsi A: Setup Otomatis (Recommended)

```bash
cd backend
./setup-neon-db.sh
```

Script ini akan:
- ✅ Membuat file `.env` jika belum ada
- ✅ Menginstall dependencies
- ✅ Generate Prisma Client
- ✅ Test koneksi database
- ✅ Menjalankan migrasi database

#### Opsi B: Setup Manual

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Konfigurasi Environment Variables**
   
   Buat file `.env` di folder `backend/`:
   ```bash
   cp .env.example .env
   ```

3. **Update Database URL**
   
   Edit file `backend/.env` dan ganti `DATABASE_URL`:
   ```env
   DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/crimson-base-54008430?sslmode=require
   ```

4. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

5. **Test Koneksi Database**
   ```bash
   npx prisma db execute --stdin <<< "SELECT 1;"
   ```

6. **Deploy Migrasi Database**
   ```bash
   npx prisma migrate deploy
   ```

## 🔧 Konfigurasi Environment

File `backend/.env` harus berisi minimal:

```env
# Database - WAJIB DIISI
DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/crimson-base-54008430?sslmode=require

# Backend Configuration
PORT=5000
NODE_ENV=development
JWT_SECRET=your-jwt-secret-key
API_SECRET=your-api-secret-key

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Encryption
ENCRYPTION_KEY=your-32-byte-encryption-key

# Frontend
FRONTEND_URL=http://localhost:3000
```

### ⚠️ Penting untuk Production

Untuk environment production:
1. Ganti semua secret keys dengan nilai yang kuat dan random
2. Set `NODE_ENV=production`
3. Update `ALLOWED_ORIGINS` dengan domain production Anda
4. Aktifkan notifikasi (Slack, Telegram, Email) jika diperlukan

## 🗄️ Menjalankan Migrasi Database

Migrasi database akan membuat semua tabel yang diperlukan di Neon PostgreSQL.

### Struktur Database yang Akan Dibuat

- ✅ `users` - User accounts dan authentication
- ✅ `devices` - Device tracking dan authorization
- ✅ `activities` - Activity logs dan monitoring
- ✅ `alerts` - Security alerts dan notifications
- ✅ `repositories` - Repository information
- ✅ `audit_logs` - Audit trail
- ✅ `system_performance` - Performance metrics
- ✅ `user_sessions` - Session management
- ✅ Dan 20+ tabel lainnya...

### Deploy Migrasi

```bash
cd backend
npx prisma migrate deploy
```

### Generate Prisma Client (Setelah Migrasi)

```bash
npx prisma generate
```

### Optional: Seed Database dengan Data Demo

```bash
npm run db:seed
```

## ✅ Testing Koneksi

### 1. Test dengan Prisma

```bash
cd backend
npx prisma studio
```

Browser akan terbuka dengan Prisma Studio untuk melihat data database.

### 2. Start Backend Server

```bash
npm start
```

atau untuk development dengan auto-reload:

```bash
npm run dev
```

### 3. Test API Endpoints

**Health Check:**
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

**Database Connection Status:**
```bash
curl http://localhost:5000/api/db/status
```

Response sukses:
```json
{
  "connected": true,
  "database": "crimson-base-54008430",
  "provider": "Neon PostgreSQL",
  "message": "Successfully connected to Neon database",
  "stats": {
    "users": 0,
    "devices": 0,
    "activities": 0
  }
}
```

**Database Connection Guide:**
```bash
curl http://localhost:5000/api/db/guide
```

**Test Database Query:**
```bash
curl http://localhost:5000/api/db/test
```

## 🐛 Troubleshooting

### Error: "Authentication failed"

**Penyebab:** Username atau password salah

**Solusi:**
1. Cek username dan password di Neon Console
2. Pastikan password di-encode dengan benar (jika ada karakter khusus)
3. Copy ulang connection string dari Neon
4. Update `DATABASE_URL` di `.env`
5. Restart server

### Error: "Connection timeout"

**Penyebab:** Database tidak dapat diakses

**Solusi:**
1. Cek status Neon project di console (pastikan tidak suspended)
2. Verifikasi koneksi internet Anda
3. Cek [Neon Status Page](https://neon.tech/status)
4. Coba region yang berbeda jika memungkinkan

### Error: "SSL/TLS connection required"

**Penyebab:** Connection string tidak memiliki `?sslmode=require`

**Solusi:**
1. Tambahkan `?sslmode=require` di akhir DATABASE_URL
2. Format: `postgresql://user:pass@host.neon.tech/db?sslmode=require`
3. Restart server

### Error: "Database does not exist"

**Penyebab:** Database belum dibuat di Neon

**Solusi:**
1. Login ke Neon Console
2. Buat database dengan nama `crimson-base-54008430`
3. Atau sesuaikan nama database di connection string
4. Update `.env` dan restart

### Error: "Prisma Client not generated"

**Penyebab:** Prisma Client belum di-generate

**Solusi:**
```bash
cd backend
npx prisma generate
npm start
```

### Error: "Table does not exist"

**Penyebab:** Migrasi database belum dijalankan

**Solusi:**
```bash
cd backend
npx prisma migrate deploy
npm start
```

### Error: "Environment variable not found: DATABASE_URL"

**Penyebab:** File `.env` tidak ada atau tidak terbaca

**Solusi:**
1. Pastikan file `.env` ada di folder `backend/`
2. Cek permission file (harus readable)
3. Restart terminal/IDE Anda
4. Coba jalankan dengan: `NODE_ENV=development npm start`

## 📊 Monitoring Database

### Melihat Database Schema

```bash
cd backend
npx prisma studio
```

### Melihat Migrations

```bash
npx prisma migrate status
```

### Reset Database (Development Only!)

⚠️ **PERHATIAN:** Ini akan menghapus semua data!

```bash
npx prisma migrate reset
```

## 🔐 Security Best Practices

1. **Jangan commit file `.env`** - Sudah ada di `.gitignore`
2. **Gunakan secret yang kuat** - Generate dengan `openssl rand -base64 32`
3. **Batasi akses database** - Gunakan IP whitelist di Neon jika diperlukan
4. **Aktifkan monitoring** - Setup alerts di Neon Console
5. **Backup regular** - Enable automated backups di Neon
6. **Rotate credentials** - Ganti password secara berkala

## 📚 Resource Tambahan

- [Neon Documentation](https://neon.tech/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma with Neon Guide](https://neon.tech/docs/guides/prisma)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🆘 Butuh Bantuan?

Jika masih mengalami masalah:

1. Cek logs backend: `npm start` dan perhatikan error messages
2. Cek Neon Console untuk status database
3. Cek dokumentasi di folder docs/
4. Contact support Neon jika masalah di sisi Neon

## ✨ Fitur Database

Database ini mendukung:

- ✅ User authentication & authorization
- ✅ Device tracking & verification
- ✅ Activity monitoring & logging
- ✅ Security alerts & notifications
- ✅ Audit trail & compliance
- ✅ Performance monitoring
- ✅ Backup & recovery
- ✅ API usage tracking
- ✅ Real-time synchronization
- ✅ Behavioral analytics

---

**Database Name:** `crimson-base-54008430`  
**Provider:** Neon PostgreSQL (Serverless)  
**ORM:** Prisma  
**Last Updated:** October 2024
