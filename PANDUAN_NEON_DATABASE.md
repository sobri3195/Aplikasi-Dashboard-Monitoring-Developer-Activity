# Panduan Koneksi Database Neon di Netlify

Panduan ini menjelaskan cara menghubungkan aplikasi Anda dengan database Neon `crimson-base-54008430` di Netlify.

## Yang Dibutuhkan

1. Akun Neon database (https://neon.tech)
2. Akun Netlify dengan proyek ini yang sudah di-deploy
3. Connection string database Neon Anda

## Informasi Database

- **Nama Database**: `crimson-base-54008430`
- **Provider Database**: Neon (Serverless PostgreSQL)
- **Prisma Client**: Sudah dikonfigurasi dalam proyek

## Langkah 1: Dapatkan Connection String Neon

1. Login ke dashboard Neon Anda di https://console.neon.tech
2. Pilih proyek yang berisi database `crimson-base-54008430`
3. Navigasi ke bagian "Connection Details"
4. Salin connection string, yang akan terlihat seperti:
   ```
   postgresql://[user]:[password]@[endpoint].neon.tech/crimson-base-54008430?sslmode=require
   ```

## Langkah 2: Konfigurasi Environment Variables di Netlify

1. Buka dashboard Netlify Anda
2. Pilih site/proyek Anda
3. Navigasi ke **Site settings** > **Environment variables**
4. Tambahkan environment variables berikut:

### Variabel Wajib

```bash
# Koneksi Database
DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/crimson-base-54008430?sslmode=require

# Konfigurasi Backend
PORT=5000
NODE_ENV=production
JWT_SECRET=kunci-jwt-rahasia-anda-disini
API_SECRET=kunci-api-rahasia-anda-disini

# Konfigurasi CORS
ALLOWED_ORIGINS=https://nama-aplikasi-anda.netlify.app

# Enkripsi
ENCRYPTION_KEY=kunci-enkripsi-32-byte-anda-disini

# Session
SESSION_SECRET=kunci-session-rahasia-anda

# URL Frontend
FRONTEND_URL=https://nama-aplikasi-anda.netlify.app
```

### Variabel Opsional (Notifikasi)

```bash
# Integrasi Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_ENABLED=true

# Integrasi Telegram
TELEGRAM_BOT_TOKEN=token-bot-telegram-anda
TELEGRAM_CHAT_ID=chat-id-telegram-anda
TELEGRAM_ENABLED=true

# Konfigurasi Email
EMAIL_ENABLED=false
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=email-anda@gmail.com
EMAIL_PASSWORD=password-aplikasi-anda
EMAIL_FROM=noreply@devmonitor.com
```

## Langkah 3: Deploy Migrasi Prisma

Setelah mengatur environment variables, Anda perlu menjalankan migrasi Prisma untuk mengatur skema database Anda.

### Opsi A: Migrasi Manual (Direkomendasikan)

1. Clone repository Anda secara lokal
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Atur DATABASE_URL di file `.env` lokal:
   ```bash
   DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/crimson-base-54008430?sslmode=require
   ```

4. Jalankan migrasi Prisma:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

### Opsi B: Menggunakan Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login ke Netlify
netlify login

# Link proyek
netlify link

# Deploy dengan migrasi
cd backend
netlify env:set DATABASE_URL "postgresql://[user]:[password]@[endpoint].neon.tech/crimson-base-54008430?sslmode=require"
npx prisma migrate deploy
```

## Langkah 4: Test Koneksi

Setelah deployment, Anda dapat menguji koneksi database dengan mengunjungi:

```
https://nama-aplikasi-anda.netlify.app/api/health
https://nama-aplikasi-anda.netlify.app/api/test-db
https://nama-aplikasi-anda.netlify.app/api/db-info
```

### Endpoint `/api/health`

Mengembalikan status kesehatan aplikasi:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "crimson-base-54008430",
  "connection": "neon",
  "environment": "production"
}
```

### Endpoint `/api/test-db`

Menguji koneksi database dan menampilkan statistik:
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

### Endpoint `/api/db-info`

Menampilkan informasi database:
```json
{
  "database": "crimson-base-54008430",
  "provider": "Neon PostgreSQL",
  "connected": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Langkah 5: Struktur File yang Ditambahkan

Berikut adalah file-file yang telah ditambahkan untuk mendukung koneksi Neon:

```
project/
├── netlify/
│   └── functions/
│       ├── api.js          # Serverless function untuk API
│       └── package.json    # Dependencies untuk functions
├── netlify.toml            # Konfigurasi Netlify (diperbarui)
├── backend/
│   ├── prisma/
│   │   └── schema.prisma   # Schema Prisma (diperbarui)
│   ├── package.json        # Ditambahkan postinstall script
│   └── .env.example        # Template environment variables
├── .env.example            # Template environment variables root
├── NEON_DATABASE_SETUP.md  # Dokumentasi lengkap (English)
└── PANDUAN_NEON_DATABASE.md # Panduan ini (Bahasa Indonesia)
```

## Troubleshooting

### Masalah Koneksi

1. **Error SSL/TLS**: Pastikan connection string Anda mengandung `?sslmode=require`
2. **Error Timeout**: Periksa bahwa proyek Neon Anda aktif dan tidak suspended
3. **Error Autentikasi**: Verifikasi username dan password Anda benar

### Masalah Migrasi

1. **Schema Drift**: Jalankan `npx prisma migrate reset` secara lokal, lalu `npx prisma migrate deploy`
2. **Error Permission**: Pastikan user Neon Anda memiliki permission yang diperlukan

### Masalah Netlify Function

1. **Module Not Found**: Pastikan `@prisma/client` terinstall di direktori functions
2. **Binary Target Issues**: Update `binaryTargets` di schema Prisma Anda
3. **Cold Start Timeout**: Pertimbangkan menggunakan Prisma Data Proxy untuk cold start yang lebih cepat

## Fitur yang Sudah Dikonfigurasi

✅ Koneksi ke Neon database `crimson-base-54008430`
✅ Prisma Client dengan binary targets yang tepat untuk Netlify
✅ Netlify serverless functions untuk API
✅ Health check dan test endpoints
✅ Environment variables configuration
✅ Auto-generate Prisma client saat build
✅ CORS configuration untuk frontend
✅ Error handling yang komprehensif

## Best Practices

1. **Connection Pooling**: Neon menangani connection pooling secara otomatis
2. **Environment Variables**: Jangan pernah commit credentials sensitif ke git
3. **Monitoring**: Setup alerts di dashboard Neon untuk connection limits
4. **Backups**: Aktifkan automated backups di settings proyek Neon
5. **Security**: Gunakan SSL/TLS untuk semua koneksi database

## Langkah Selanjutnya

Setelah berhasil menghubungkan database:

1. ✅ Deploy aplikasi ke Netlify
2. ✅ Jalankan migrasi database
3. ✅ Test koneksi menggunakan endpoints yang disediakan
4. ✅ Konfigurasikan notifications (Slack, Telegram, dll)
5. ✅ Setup monitoring dan logging
6. ✅ Konfigurasikan automated backups

## Sumber Daya Tambahan

- [Dokumentasi Neon](https://neon.tech/docs)
- [Prisma dengan Neon](https://neon.tech/docs/guides/prisma)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)

## Support

Untuk masalah spesifik terkait:
- **Database Neon**: Hubungi support Neon atau cek dokumentasi mereka
- **Deployment Netlify**: Rujuk ke dokumentasi atau support Netlify
- **Masalah Aplikasi**: Cek application logs di dashboard Netlify

---

**Database**: crimson-base-54008430  
**Provider**: Neon (Serverless PostgreSQL)  
**Status**: ✅ Terkonfigurasi dan siap digunakan

## Kontak

Jika Anda mengalami masalah, pastikan untuk:
1. Cek logs di Netlify dashboard
2. Verifikasi environment variables sudah diset dengan benar
3. Test koneksi menggunakan endpoints yang disediakan
4. Baca dokumentasi troubleshooting di atas

**Selamat menggunakan! 🚀**
