# 🚀 Quick Start: Setup Neon Database

Panduan cepat untuk menghubungkan backend ke Neon PostgreSQL dalam 5 menit.

## ⚡ Setup Cepat (Recommended)

```bash
# 1. Masuk ke folder backend
cd backend

# 2. Install dependencies
npm install

# 3. Jalankan setup script otomatis
npm run db:setup
```

Script akan memandu Anda langkah demi langkah! 🎯

## 📝 Setup Manual

### Step 1: Buat Account Neon

1. Kunjungi [https://console.neon.tech](https://console.neon.tech)
2. Sign up (gratis!)
3. Verifikasi email

### Step 2: Buat Database

1. Klik "Create Project"
2. Buat database dengan nama: `crimson-base-54008430`
3. Pilih region terdekat
4. Copy connection string

### Step 3: Konfigurasi Backend

```bash
cd backend

# Buat file .env
cp .env.example .env

# Edit .env dan update DATABASE_URL
nano .env
```

Paste connection string dari Neon:
```env
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/crimson-base-54008430?sslmode=require
```

### Step 4: Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Deploy migrations
npx prisma migrate deploy

# (Optional) Seed data demo
npm run db:seed
```

### Step 5: Start Server

```bash
# Development mode
npm run dev

# atau Production mode
npm start
```

Server akan berjalan di `http://localhost:5000` 🎉

## ✅ Verifikasi Setup

### Test 1: Check Connection

```bash
npm run db:check
```

Harus menampilkan:
```
✅ Database connected successfully!
✅ All database tables are accessible!
```

### Test 2: API Health Check

```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test 3: Database Status

```bash
curl http://localhost:5000/api/db/status
```

Response:
```json
{
  "connected": true,
  "database": "crimson-base-54008430",
  "provider": "Neon PostgreSQL",
  "message": "Successfully connected to Neon database"
}
```

## 🎯 Next Steps

### 1. Explore Database

```bash
npm run prisma:studio
```

Browser akan membuka Prisma Studio di `http://localhost:5555`

### 2. Seed Demo Data (Optional)

```bash
npm run db:seed
```

Ini akan membuat:
- ✅ Demo user accounts
- ✅ Sample activities
- ✅ Test devices
- ✅ Sample alerts

### 3. Start Dashboard (Frontend)

```bash
cd ../dashboard
npm install
npm start
```

Dashboard akan berjalan di `http://localhost:3000`

## 🔧 Useful Commands

| Command | Purpose |
|---------|---------|
| `npm run db:check` | Check database connection |
| `npm run db:setup` | Automated setup wizard |
| `npm run prisma:studio` | Open database GUI |
| `npm run dev` | Start dev server |
| `npm run db:seed` | Seed demo data |

## ❓ Troubleshooting

### "DATABASE_URL not configured"

```bash
cd backend
cp .env.example .env
# Edit .env dan tambahkan DATABASE_URL
```

### "Authentication failed"

- Cek username/password di Neon Console
- Copy ulang connection string
- Pastikan `?sslmode=require` ada di akhir URL

### "Table does not exist"

```bash
cd backend
npx prisma migrate deploy
```

### "Cannot connect to database"

- Pastikan Neon project aktif (tidak suspended)
- Cek koneksi internet
- Verifikasi connection string benar

## 📚 Documentation

- **Full Setup Guide:** [SETUP_NEON_DATABASE.md](./SETUP_NEON_DATABASE.md)
- **Backend README:** [backend/README.md](./backend/README.md)
- **Neon Docs:** [https://neon.tech/docs](https://neon.tech/docs)
- **Prisma Docs:** [https://www.prisma.io/docs](https://www.prisma.io/docs)

## 🎊 Success!

Jika semua test berhasil, Anda sudah siap untuk:
- ✅ Develop aplikasi
- ✅ Monitor developer activities
- ✅ Track security alerts
- ✅ Manage devices
- ✅ View analytics

Happy coding! 🚀

---

**Need Help?** Check [SETUP_NEON_DATABASE.md](./SETUP_NEON_DATABASE.md) for detailed troubleshooting.
