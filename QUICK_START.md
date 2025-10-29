# Quick Start - DevMonitor Dashboard

## 🚀 Cara Cepat Menjalankan Aplikasi

### Langkah 1: Setup Database dan Backend
```bash
# Jalankan script setup otomatis
./setup_and_test.sh
```

### Langkah 2: Start Backend Server
```bash
cd backend
npm start
```

Backend akan berjalan di: http://localhost:5000

### Langkah 3: Start Frontend Dashboard
```bash
# Buka terminal baru
cd dashboard
npm install  # Jika belum install dependencies
npm start
```

Dashboard akan berjalan di: http://localhost:3000

### Langkah 4: Login
Buka browser dan akses: http://localhost:3000/login

Gunakan salah satu akun demo:
- **Admin**: admin@devmonitor.com / admin123456
- **Developer**: developer@devmonitor.com / developer123
- **Viewer**: viewer@devmonitor.com / viewer123

Atau klik tombol Quick Login yang tersedia di halaman login!

## ✅ Test Login dari Command Line
```bash
./test_login.sh        # Test login admin
./test_login_all.sh    # Test semua akun demo
```

## 🔧 Troubleshooting

### Backend tidak bisa start?
```bash
cd backend
npm install
npx prisma generate
```

### Database connection error?
```bash
# Start PostgreSQL dengan Docker
docker run -d --name devmonitor-postgres \
  -e POSTGRES_USER=devmonitor \
  -e POSTGRES_PASSWORD=devmonitor123 \
  -e POSTGRES_DB=devmonitor \
  -p 5432:5432 \
  postgres:14-alpine

# Tunggu beberapa detik, lalu seed database
cd backend
npm run db:seed
```

### Login masih gagal?
1. Pastikan backend running: `curl http://localhost:5000/health`
2. Periksa database seeded: `cd backend && npm run db:seed`
3. Cek log backend untuk detail error

## 📚 Dokumentasi Lengkap

- `PERBAIKAN_LOGIN.md` - Penjelasan detail perbaikan login
- `DEMO_ACCOUNTS.md` - Informasi akun demo
- `DEMO_ACCOUNT_BYPASS.md` - Cara kerja bypass password
- `FIX_LOGIN_FAILURE.md` - History fix sebelumnya

## 💡 Tips

- Untuk demo accounts, password apapun akan diterima!
- Backend log akan menampilkan "✅ Demo account bypass used" untuk login demo
- Gunakan test scripts untuk verify semua working correctly
