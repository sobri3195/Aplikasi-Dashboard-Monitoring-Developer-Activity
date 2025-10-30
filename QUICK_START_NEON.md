# 🚀 Quick Start - Koneksi Database Neon

## ⚡ Ringkasan Cepat (5 Menit)

### 1️⃣ Dapatkan Connection String dari Neon

1. Login ke https://console.neon.tech
2. Pilih project Anda
3. Klik "Connection Details"
4. Copy connection string

### 2️⃣ Isi File .env

Edit file `backend/.env`:

```bash
# Hapus # dan ganti dengan connection string Anda
DATABASE_URL=postgresql://user:password@ep-xxx-xxx.neon.tech/crimson-base-54008430?sslmode=require
```

### 3️⃣ Install & Migrate

```bash
cd backend
npm install
npx prisma migrate deploy
npx prisma generate
```

### 4️⃣ Start Aplikasi

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd dashboard
npm start
```

### 5️⃣ Cek Status

- Buka browser: http://localhost:3000
- Login ke dashboard
- Klik "Database Status" di sidebar
- Status harus "Connected" ✅

---

## 🔍 Cek Status via API

```bash
# Cek status koneksi
curl http://localhost:5000/api/db-connection/status

# Test koneksi detail
curl http://localhost:5000/api/db-connection/test

# Lihat panduan setup
curl http://localhost:5000/api/db-connection/guide
```

---

## ❌ Jika Status "Disconnected"

### Yang Harus Diisi:

**FILE:** `backend/.env`

**WAJIB:**
```bash
DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/crimson-base-54008430?sslmode=require
```

**Ganti:**
- `[user]` → username dari Neon
- `[password]` → password dari Neon  
- `[endpoint]` → endpoint dari Neon (contoh: ep-cool-name-123456.us-east-2.aws)

**Contoh Lengkap:**
```bash
DATABASE_URL=postgresql://neondb_owner:AbCd1234XyZ@ep-wild-fire-123456.us-east-2.aws.neon.tech/crimson-base-54008430?sslmode=require
```

### Langkah Selanjutnya:

1. Save file `.env`
2. Restart aplikasi backend
3. Refresh browser
4. Cek status lagi

---

## 📚 Dokumentasi Lengkap

Untuk panduan detail, lihat:
- [CARA_KONEKSI_DATABASE.md](./CARA_KONEKSI_DATABASE.md) - Panduan lengkap Indonesia
- [PANDUAN_NEON_DATABASE.md](./PANDUAN_NEON_DATABASE.md) - Panduan deployment Netlify
- [NEON_DATABASE_SETUP.md](./NEON_DATABASE_SETUP.md) - Setup guide (English)

---

## 🆘 Troubleshooting Cepat

| Problem | Solusi |
|---------|--------|
| "DATABASE_URL not configured" | Isi DATABASE_URL di file `.env` |
| "Authentication failed" | Cek username/password di connection string |
| "Connection timeout" | Tunggu beberapa saat (cold start) atau cek Neon dashboard |
| "SSL/TLS Error" | Tambahkan `?sslmode=require` di akhir URL |
| "Table does not exist" | Jalankan: `npx prisma migrate deploy` |

---

## ✅ Checklist

- [ ] Akun Neon sudah ada
- [ ] Connection string sudah di-copy
- [ ] File `.env` sudah diisi dengan DATABASE_URL
- [ ] `npm install` sudah dijalankan
- [ ] `npx prisma migrate deploy` sudah dijalankan
- [ ] Aplikasi sudah running
- [ ] Status menampilkan "Connected" ✓

---

**Selesai! Database Anda sudah terhubung! 🎉**
