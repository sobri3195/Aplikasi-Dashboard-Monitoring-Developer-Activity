# Setup Guide: Netlify + Neon Database Connection

## 🎯 Tujuan / Objective

Menghubungkan aplikasi yang di-deploy di Netlify dengan Neon PostgreSQL Database bernama **crimson-base-54008430**.

Connect the application deployed on Netlify with Neon PostgreSQL Database named **crimson-base-54008430**.

---

## 📋 Ringkasan Perubahan / Summary of Changes

### File yang Ditambahkan / Added Files:
1. `netlify/functions/api.js` - Serverless function untuk koneksi database
2. `netlify/functions/package.json` - Dependencies untuk Netlify functions
3. `NEON_DATABASE_SETUP.md` - Dokumentasi lengkap (English)
4. `PANDUAN_NEON_DATABASE.md` - Panduan lengkap (Bahasa Indonesia)
5. `scripts/deploy-migrations.sh` - Script untuk deploy migrasi

### File yang Dimodifikasi / Modified Files:
1. `netlify.toml` - Ditambahkan konfigurasi functions dan build command
2. `backend/prisma/schema.prisma` - Ditambahkan binary targets untuk Netlify
3. `backend/package.json` - Ditambahkan postinstall script
4. `.env.example` - Diperbarui dengan konfigurasi Neon
5. `backend/.env.example` - Diperbarui dengan konfigurasi Neon

---

## 🚀 Quick Start

### 1. Dapatkan Connection String dari Neon

```bash
# Format connection string:
postgresql://[username]:[password]@[endpoint].neon.tech/crimson-base-54008430?sslmode=require
```

### 2. Set Environment Variables di Netlify

Buka: **Netlify Dashboard** → **Site Settings** → **Environment Variables**

**Wajib / Required:**
```bash
DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/crimson-base-54008430?sslmode=require
NODE_ENV=production
JWT_SECRET=your-secure-jwt-secret
API_SECRET=your-secure-api-secret
ENCRYPTION_KEY=your-32-byte-encryption-key
SESSION_SECRET=your-session-secret
ALLOWED_ORIGINS=https://your-app.netlify.app
FRONTEND_URL=https://your-app.netlify.app
```

### 3. Deploy Migrasi Database

**Opsi A: Menggunakan Script (Recommended)**
```bash
# Set DATABASE_URL secara lokal
export DATABASE_URL='postgresql://[user]:[password]@[endpoint].neon.tech/crimson-base-54008430?sslmode=require'

# Jalankan script
./scripts/deploy-migrations.sh
```

**Opsi B: Manual**
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
```

### 4. Deploy ke Netlify

```bash
# Push ke git repository
git add .
git commit -m "Add Neon database connection"
git push origin main

# Atau deploy manual dengan Netlify CLI
netlify deploy --prod
```

### 5. Test Koneksi

Kunjungi endpoint berikut untuk memverifikasi koneksi:

```
https://your-app.netlify.app/api/health
https://your-app.netlify.app/api/test-db
https://your-app.netlify.app/api/db-info
```

---

## 🔧 Konfigurasi Detail / Detailed Configuration

### Netlify Configuration (`netlify.toml`)

```toml
[build]
  base = "dashboard"
  command = "cd ../backend && npm install && npx prisma generate && cd ../dashboard && npm install && npm run build"
  publish = "build"

[build.environment]
  CI = "false"
  NODE_VERSION = "18"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
  external_node_modules = ["@prisma/client", ".prisma/client"]

[functions.api]
  included_files = ["backend/prisma/**", "backend/node_modules/.prisma/**", "backend/node_modules/@prisma/**"]

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Prisma Schema Updates

Binary targets ditambahkan untuk kompatibilitas Netlify:

```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-1.0.x", "rhel-openssl-3.0.x"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 📡 API Endpoints

### 1. Health Check
**URL:** `/api/health`  
**Method:** `GET`  
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "crimson-base-54008430",
  "connection": "neon",
  "environment": "production"
}
```

### 2. Database Test
**URL:** `/api/test-db`  
**Method:** `GET`  
**Response:**
```json
{
  "message": "Database connection successful",
  "database": "crimson-base-54008430",
  "provider": "Neon PostgreSQL",
  "stats": {
    "users": 0,
    "devices": 0,
    "activities": 0
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 3. Database Info
**URL:** `/api/db-info`  
**Method:** `GET`  
**Response:**
```json
{
  "database": "crimson-base-54008430",
  "provider": "Neon PostgreSQL",
  "connected": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## ✅ Checklist Deployment

- [ ] Dapatkan connection string dari Neon Console
- [ ] Set DATABASE_URL di Netlify Environment Variables
- [ ] Set semua environment variables yang required
- [ ] Deploy migrasi Prisma ke database
- [ ] Push code ke repository
- [ ] Trigger Netlify build
- [ ] Test endpoint `/api/health`
- [ ] Test endpoint `/api/test-db`
- [ ] Verifikasi data di Neon Console

---

## 🔍 Troubleshooting

### Error: "Can't reach database server"
```bash
# Periksa connection string Anda
echo $DATABASE_URL

# Pastikan menggunakan SSL
# Connection string harus mengandung: ?sslmode=require
```

### Error: "Binary target not found"
```bash
# Regenerate Prisma Client
cd backend
npx prisma generate

# Pastikan binaryTargets di schema.prisma sudah benar
```

### Error: "Module not found: @prisma/client"
```bash
# Install dependencies di backend
cd backend
npm install
npx prisma generate

# Pastikan postinstall script ada di package.json
```

### Build Failed di Netlify
```bash
# Cek build logs di Netlify dashboard
# Pastikan build command benar di netlify.toml
# Verifikasi NODE_VERSION di environment variables
```

---

## 📚 Dokumentasi Lengkap

- **English:** Lihat [NEON_DATABASE_SETUP.md](./NEON_DATABASE_SETUP.md)
- **Bahasa Indonesia:** Lihat [PANDUAN_NEON_DATABASE.md](./PANDUAN_NEON_DATABASE.md)

---

## 🎉 Selesai!

Setelah semua langkah di atas selesai, aplikasi Anda sudah terhubung dengan Neon database **crimson-base-54008430** dan siap digunakan di Netlify!

After completing all the steps above, your application is now connected to Neon database **crimson-base-54008430** and ready to use on Netlify!

---

**Database:** crimson-base-54008430  
**Provider:** Neon PostgreSQL  
**Platform:** Netlify  
**Status:** ✅ Configured

---

## 📞 Support

Jika mengalami masalah / If you encounter issues:

1. Cek logs di Netlify Dashboard → **Deploys** → **Function logs**
2. Verifikasi environment variables di **Site Settings**
3. Test koneksi dengan endpoint yang tersedia
4. Baca dokumentasi lengkap di file MD yang tersedia

**Happy Deploying! 🚀**
