# ✅ Checklist: Setup Neon Database

Panduan checklist untuk memastikan setup database Neon berhasil.

## 📋 Pre-Setup Checklist

Sebelum memulai, pastikan:

- [ ] Node.js 16+ terinstall (`node --version`)
- [ ] npm atau yarn terinstall (`npm --version`)
- [ ] Git repository sudah di-clone
- [ ] Akses internet tersedia

## 🚀 Setup Checklist

### 1. Persiapan Neon Account

- [ ] Buka [https://console.neon.tech](https://console.neon.tech)
- [ ] Sign up / Login ke account Neon
- [ ] Verifikasi email jika baru sign up

### 2. Buat Database di Neon

- [ ] Klik "Create Project" di Neon Console
- [ ] Beri nama project (bebas)
- [ ] Buat database dengan nama: `crimson-base-54008430`
  - _Atau gunakan nama lain dan sesuaikan di connection string_
- [ ] Pilih region terdekat (mis: US East, Europe West, etc.)
- [ ] Tunggu hingga database selesai dibuat (~30 detik)

### 3. Dapatkan Connection String

- [ ] Buka project di Neon Console
- [ ] Klik tab "Connection Details"
- [ ] Copy connection string yang dimulai dengan `postgresql://`
- [ ] Pastikan ada `?sslmode=require` di akhir URL
- [ ] Simpan connection string di tempat aman (jangan share!)

Format yang benar:
```
postgresql://user:pass@ep-xxx-xxx.region.aws.neon.tech/crimson-base-54008430?sslmode=require
```

### 4. Setup Backend

- [ ] Buka terminal / command prompt
- [ ] Masuk ke folder backend:
  ```bash
  cd backend
  ```
- [ ] Install dependencies:
  ```bash
  npm install
  ```
- [ ] Jalankan setup wizard:
  ```bash
  npm run db:setup
  ```

### 5. Konfigurasi Environment

Jika setup wizard tidak berjalan otomatis:

- [ ] Buka file `backend/.env` dengan text editor
- [ ] Cari baris `DATABASE_URL=`
- [ ] Ganti placeholder dengan connection string dari Neon
- [ ] Pastikan tidak ada spasi sebelum/sesudah URL
- [ ] Simpan file

Example:
```env
DATABASE_URL=postgresql://myuser:mypass@ep-cool-name-123.us-east-2.aws.neon.tech/crimson-base-54008430?sslmode=require
```

### 6. Generate Prisma Client

- [ ] Jalankan:
  ```bash
  npx prisma generate
  ```
- [ ] Tunggu hingga selesai (~10-20 detik)
- [ ] Pastikan tidak ada error

### 7. Deploy Database Migrations

- [ ] Jalankan:
  ```bash
  npx prisma migrate deploy
  ```
- [ ] Tunggu hingga semua migrations selesai (~30 detik)
- [ ] Pastikan semua migrations SUCCESS

### 8. (Optional) Seed Demo Data

- [ ] Jalankan:
  ```bash
  npm run db:seed
  ```
- [ ] Tunggu hingga seeding selesai (~10 detik)
- [ ] Data demo akan ditambahkan ke database

## ✅ Verification Checklist

### Test 1: Check Connection

- [ ] Jalankan:
  ```bash
  npm run db:check
  ```
- [ ] Harus muncul: "✅ Successfully connected to database!"
- [ ] Harus muncul: "✅ All database tables are accessible!"
- [ ] Lihat statistik database (users, devices, activities, dll.)

### Test 2: Start Backend Server

- [ ] Jalankan:
  ```bash
  npm start
  ```
- [ ] Server harus start tanpa error
- [ ] Harus muncul: "🚀 Server running on port 5000"
- [ ] Harus muncul: "✅ Database connected successfully to Neon"

### Test 3: Test API Endpoints

Buka terminal baru (jangan tutup yang menjalankan server):

- [ ] Health check:
  ```bash
  curl http://localhost:5000/health
  ```
  Response: `{"status":"healthy",...}`

- [ ] Database status:
  ```bash
  curl http://localhost:5000/api/db/status
  ```
  Response: `{"connected":true,...}`

### Test 4: Open Prisma Studio

- [ ] Jalankan (di terminal baru):
  ```bash
  cd backend
  npm run prisma:studio
  ```
- [ ] Browser akan terbuka di http://localhost:5555
- [ ] Bisa melihat semua tables (users, devices, activities, dll.)
- [ ] Bisa browse data di database

### Test 5: Access Dashboard

- [ ] Buka terminal baru
- [ ] Masuk ke folder dashboard:
  ```bash
  cd dashboard
  ```
- [ ] Install dependencies:
  ```bash
  npm install
  ```
- [ ] Start dashboard:
  ```bash
  npm start
  ```
- [ ] Browser terbuka di http://localhost:3000
- [ ] Dashboard tampil dengan baik
- [ ] Bisa login dengan demo account

## 🎉 Success Indicators

Jika semua checklist di atas ✅, berarti setup berhasil!

Indicators:
- ✅ Backend server running tanpa error
- ✅ Database connected ke Neon
- ✅ Semua API endpoints working
- ✅ Prisma Studio bisa akses database
- ✅ Dashboard bisa akses backend
- ✅ Login berfungsi

## 🧪 Testing Login

Demo accounts untuk testing:

| Email | Password | Role |
|-------|----------|------|
| admin@devmonitor.com | admin123456 | Admin |
| developer@devmonitor.com | developer123 | Developer |
| viewer@devmonitor.com | viewer123 | Viewer |

- [ ] Buka http://localhost:3000
- [ ] Login dengan salah satu account di atas
- [ ] Harus berhasil masuk ke dashboard
- [ ] Bisa lihat statistics dan activities

## 🐛 Troubleshooting Checklist

### Problem: "DATABASE_URL not configured"

- [ ] Pastikan file `backend/.env` ada
- [ ] Pastikan `DATABASE_URL` sudah diisi
- [ ] Pastikan tidak ada typo di connection string
- [ ] Restart backend server

### Problem: "Authentication failed"

- [ ] Cek username dan password di Neon Console
- [ ] Copy ulang connection string dari Neon
- [ ] Pastikan password tidak mengandung karakter khusus yang perlu di-encode
- [ ] Update `DATABASE_URL` di `.env`
- [ ] Restart backend

### Problem: "Connection timeout"

- [ ] Cek koneksi internet
- [ ] Pastikan Neon project tidak suspended
- [ ] Cek [Neon Status](https://neon.tech/status)
- [ ] Coba region berbeda jika perlu

### Problem: "Table does not exist"

- [ ] Pastikan migrations sudah dijalankan:
  ```bash
  npx prisma migrate deploy
  ```
- [ ] Restart backend server

### Problem: "Module not found: @prisma/client"

- [ ] Generate Prisma Client:
  ```bash
  npx prisma generate
  ```
- [ ] Restart backend server

### Problem: "SSL required"

- [ ] Pastikan connection string punya `?sslmode=require` di akhir
- [ ] Format: `postgresql://user:pass@host/db?sslmode=require`
- [ ] Update `.env` dan restart

## 📚 Helpful Commands

```bash
# Check connection
npm run db:check

# View database
npm run prisma:studio

# Deploy migrations
npx prisma migrate deploy

# Seed data
npm run db:seed

# Start dev server
npm run dev

# Check logs
npm start (lihat output di terminal)
```

## 🆘 Need More Help?

Jika masih ada masalah:

1. **Cek dokumentasi lengkap**: [SETUP_NEON_DATABASE.md](./SETUP_NEON_DATABASE.md)
2. **Cek quick start**: [QUICK_START_NEON.md](./QUICK_START_NEON.md)
3. **Cek backend docs**: [backend/README.md](./backend/README.md)
4. **Cek Neon docs**: https://neon.tech/docs
5. **Cek Prisma docs**: https://prisma.io/docs

## 📊 What's Next?

Setelah semua checklist ✅:

- [ ] Explore dashboard features
- [ ] Try different demo accounts
- [ ] Check monitoring features
- [ ] Setup notifications (Slack/Telegram) - optional
- [ ] Read feature documentation
- [ ] Start developing!

## ✨ Optional: Production Setup

Untuk production deployment:

- [ ] Set `NODE_ENV=production` di `.env`
- [ ] Generate secure secrets (JWT_SECRET, API_SECRET, etc.)
- [ ] Enable notifications (Slack, Telegram, Email)
- [ ] Setup backup schedule
- [ ] Configure monitoring
- [ ] Setup SSL/HTTPS
- [ ] Configure rate limiting
- [ ] Read security best practices

---

**Selamat! 🎉**

Jika semua checklist di atas sudah ✅, setup Neon database Anda berhasil dan aplikasi siap digunakan!

**Happy Coding! 🚀**

---

_Last Updated: October 2024_  
_Database: crimson-base-54008430_  
_Provider: Neon PostgreSQL_
