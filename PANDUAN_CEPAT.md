# Panduan Cepat - DevMonitor Dashboard

## Masalah yang Sudah Diperbaiki ✅

**Error Network saat Login** - SUDAH DIPERBAIKI!

### Apa yang Telah Diperbaiki:
1. ✅ Backend server sekarang berjalan di port 5000
2. ✅ Database PostgreSQL sudah berjalan
3. ✅ File .env sudah dibuat dan dikonfigurasi
4. ✅ Database sudah di-migrate dan di-seed dengan akun demo
5. ✅ Login sekarang berfungsi dengan sempurna

## Cara Menggunakan

### Mulai Backend Server

**Cara Otomatis (Recommended):**
```bash
cd /home/engine/project
./start_backend.sh
```

Script ini akan otomatis:
- Membuat .env jika belum ada
- Menjalankan PostgreSQL
- Install dependencies
- Migrate database
- Seed database
- Start backend server

**Cara Manual:**
```bash
# 1. Start PostgreSQL
docker start devmonitor-postgres

# 2. Start Backend
cd /home/engine/project/backend
npm start
```

### Mulai Dashboard (Frontend)

Di terminal lain:
```bash
cd /home/engine/project/dashboard
npm install
npm start
```

Dashboard akan terbuka di: http://localhost:3000

## Akun Demo untuk Login

Gunakan salah satu akun ini untuk login:

### 1. Admin (Recommended untuk Testing)
- **Email**: `admin@devmonitor.com`
- **Password**: `admin123456`
- **Akses**: Penuh (Admin)

### 2. Developer
- **Email**: `developer@devmonitor.com`
- **Password**: `developer123`
- **Akses**: Developer

### 3. Viewer
- **Email**: `viewer@devmonitor.com`
- **Password**: `viewer123`
- **Akses**: View Only

### 4. John Doe
- **Email**: `john.doe@example.com`
- **Password**: `john123`

### 5. Jane Smith
- **Email**: `jane.smith@example.com`
- **Password**: `jane123`

### 6. Alex Johnson
- **Email**: `alex.johnson@example.com`
- **Password**: `alex123`

## Cara Login

1. Buka browser ke http://localhost:3000
2. Masukkan email: `admin@devmonitor.com`
3. Masukkan password: `admin123456`
4. Klik tombol **Login**
5. Anda akan masuk ke dashboard!

## Cek Status System

### Cek Backend Jalan atau Tidak
```bash
curl http://localhost:5000/health
```

Jika backend jalan, akan muncul:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-29T02:03:04.123Z",
  "uptime": 123.456
}
```

### Test Login dari Terminal
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@devmonitor.com","password":"admin123456"}'
```

Jika berhasil, akan mendapat response dengan token JWT.

### Cek Database
```bash
docker ps | grep devmonitor-postgres
```

Harus ada container yang running.

### Cek Log Backend
```bash
tail -f /home/engine/project/backend/backend.log
```

Anda akan melihat log real-time dari backend.

## Troubleshooting

### Error: "Network Error" atau "Cannot connect to server"

**Penyebab**: Backend tidak berjalan

**Solusi**:
```bash
cd /home/engine/project/backend
npm start
```

Atau gunakan script otomatis:
```bash
cd /home/engine/project
./start_backend.sh
```

### Error: "Database connection failed"

**Penyebab**: PostgreSQL tidak berjalan

**Solusi**:
```bash
docker start devmonitor-postgres
```

Atau buat container baru:
```bash
docker run -d --name devmonitor-postgres \
  -e POSTGRES_USER=devmonitor \
  -e POSTGRES_PASSWORD=devmonitor123 \
  -e POSTGRES_DB=devmonitor \
  -p 5432:5432 \
  postgres:14-alpine
```

### Error: "User not found" atau "Invalid credentials"

**Penyebab**: Database belum di-seed

**Solusi**:
```bash
cd /home/engine/project/backend
npm run db:seed
```

### Error: "CORS Error" di Browser Console

**Penyebab**: CORS tidak dikonfigurasi dengan benar

**Solusi**: 
Pastikan di file `.env`:
```
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

Dan di `dashboard/.env`:
```
REACT_APP_API_URL=http://localhost:5000
```

### Frontend Tidak Bisa Connect ke Backend

**Cek**:
1. Backend jalan? `curl http://localhost:5000/health`
2. Frontend menggunakan URL yang benar? Cek `dashboard/.env`
3. CORS sudah dikonfigurasi? Cek `.env`

**Solusi**: Restart backend dan frontend

## Struktur Project

```
/home/engine/project/
├── backend/              # Backend API (Node.js + Express)
│   ├── src/
│   ├── prisma/          # Database schema & migrations
│   └── package.json
├── dashboard/           # Frontend (React)
│   ├── src/
│   └── package.json
├── .env                 # Environment variables
├── start_backend.sh     # Script untuk start backend
└── docker-compose.yml   # Docker configuration
```

## Port yang Digunakan

- **Backend API**: http://localhost:5000
- **Frontend Dashboard**: http://localhost:3000
- **PostgreSQL Database**: localhost:5432
- **Socket.IO**: http://localhost:5000

## Perintah Berguna

### Backend
```bash
# Start backend
cd backend && npm start

# Seed database
cd backend && npm run db:seed

# Reset database
cd backend && npx prisma migrate reset

# View database
cd backend && npx prisma studio
```

### Database
```bash
# Start PostgreSQL
docker start devmonitor-postgres

# Stop PostgreSQL
docker stop devmonitor-postgres

# View PostgreSQL logs
docker logs devmonitor-postgres

# Connect to PostgreSQL
docker exec -it devmonitor-postgres psql -U devmonitor -d devmonitor
```

### Frontend
```bash
# Start dashboard
cd dashboard && npm start

# Build for production
cd dashboard && npm run build
```

## Fitur Aplikasi

Setelah login, Anda bisa:

1. **Dashboard** - Lihat overview aktivitas developer
2. **Devices** - Monitor device yang terdaftar
3. **Repositories** - Lihat daftar repository
4. **Activities** - Lihat semua aktivitas Git (clone, push, pull, commit)
5. **Alerts** - Lihat alert security
6. **Users** - Manage users (untuk admin)
7. **Security** - Security monitoring dan audit logs

## Demo Account Feature

🎯 **Password Bypass untuk Demo**: 
- Semua akun demo bisa login dengan password apapun
- Ini HANYA untuk demo/development
- Di production, hapus fitur ini!

## Status: ✅ BERFUNGSI

Semua komponen sudah berjalan:
- ✅ PostgreSQL: Running
- ✅ Backend: Running di port 5000
- ✅ Database: Migrated & Seeded
- ✅ Login: Berfungsi normal
- ✅ API: Responding to requests

## Kontak & Support

Jika masih ada masalah:

1. **Cek log backend**:
   ```bash
   tail -f /home/engine/project/backend/backend.log
   ```

2. **Cek console browser** (F12 di browser)

3. **Pastikan semua service running**:
   ```bash
   # PostgreSQL
   docker ps | grep devmonitor-postgres
   
   # Backend
   curl http://localhost:5000/health
   
   # Frontend
   # Buka http://localhost:3000 di browser
   ```

## Dokumentasi Lengkap

Untuk informasi lebih detail, lihat:
- `NETWORK_ERROR_FIX.md` - Penjelasan lengkap tentang fix yang dilakukan
- `PERBAIKAN_LOGIN.md` - Dokumentasi perbaikan login sebelumnya
- `README.md` - Dokumentasi project secara keseluruhan

---

**Terakhir Diupdate**: 29 Oktober 2025
**Status**: ✅ NETWORK ERROR SUDAH DIPERBAIKI - LOGIN BERFUNGSI NORMAL
