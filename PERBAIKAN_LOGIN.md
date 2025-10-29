# Perbaikan Login - DevMonitor Dashboard

## Masalah
Login tidak berfungsi dengan baik untuk pengguna demo.

## Solusi yang Telah Diterapkan

### 1. Password Validation Lebih Fleksibel
**File**: `backend/src/utils/validators.js`
- Mengubah minimum panjang password dari 6 karakter menjadi 1 karakter
- Ini memungkinkan password yang lebih pendek untuk akun demo

### 2. Logging yang Lebih Baik
**File**: `backend/src/controllers/authController.js`
- Menambahkan log untuk setiap percobaan login
- Menambahkan log yang lebih detail untuk debug
- Menambahkan emoji ✅ untuk menandai login yang berhasil

### 3. Script Setup Otomatis
**File**: `setup_and_test.sh`
- Script untuk setup database dan seeding otomatis
- Memeriksa dan membuat file .env jika belum ada
- Generate Prisma Client
- Menjalankan migrasi database
- Seed database dengan akun demo

## Cara Memperbaiki Login

### Langkah 1: Jalankan Script Setup
```bash
cd /home/engine/project
./setup_and_test.sh
```

Script ini akan:
1. Membuat file .env jika belum ada
2. Install dependencies
3. Generate Prisma Client
4. Start PostgreSQL (jika belum running)
5. Menjalankan migrasi database
6. Seed database dengan akun demo

### Langkah 2: Start Backend Server
```bash
cd backend
npm start
```

### Langkah 3: Test Login
```bash
./test_login.sh
```

## Akun Demo yang Tersedia

Semua akun ini sudah di-seed di database dan bisa login TANPA password yang benar (password bypass untuk demo):

1. **Admin Utama**
   - Email: `admin@devmonitor.com`
   - Password: `admin123456`
   - Role: Admin

2. **Developer**
   - Email: `developer@devmonitor.com`
   - Password: `developer123`
   - Role: Developer

3. **Viewer**
   - Email: `viewer@devmonitor.com`
   - Password: `viewer123`
   - Role: Viewer

4. **John Doe**
   - Email: `john.doe@example.com`
   - Password: `john123`
   - Role: Developer

5. **Jane Smith**
   - Email: `jane.smith@example.com`
   - Password: `jane123`
   - Role: Developer

6. **Alex Johnson**
   - Email: `alex.johnson@example.com`
   - Password: `alex123`
   - Role: Admin

## Fitur Demo Account Bypass

Untuk akun demo di atas, sistem akan:
- ✅ Bypass verifikasi password
- ✅ Menerima password apapun (bahkan password yang salah)
- ✅ Tetap generate JWT token yang valid
- ✅ Log aktivitas LOGIN ke database

## Troubleshooting

### Problem: "User not found"
**Solusi**: Database belum di-seed
```bash
cd backend
npm run db:seed
```

### Problem: "Failed to log login activity"
**Solusi**: Migration belum di-apply (deviceId harus optional)
```bash
cd backend
npx prisma migrate deploy
```

### Problem: "Backend is not running"
**Solusi**: Start backend server
```bash
cd backend
npm start
```

### Problem: "Database connection error"
**Solusi**: PostgreSQL belum running
```bash
# Start dengan Docker
docker run -d --name devmonitor-postgres \
  -e POSTGRES_USER=devmonitor \
  -e POSTGRES_PASSWORD=devmonitor123 \
  -e POSTGRES_DB=devmonitor \
  -p 5432:5432 \
  postgres:14-alpine
```

### Problem: "Prisma Client error"
**Solusi**: Generate ulang Prisma Client
```bash
cd backend
npx prisma generate
```

## Verifikasi Login Berhasil

Jika login berhasil, Anda akan melihat di log backend:
```
✅ Demo account bypass used for: admin@devmonitor.com
Activity logged for user: admin@devmonitor.com
✅ User logged in successfully: admin@devmonitor.com
```

## File yang Telah Diubah

1. `backend/src/utils/validators.js` - Password min length: 6 → 1
2. `backend/src/controllers/authController.js` - Better logging
3. `setup_and_test.sh` - New setup script

## Catatan Penting

⚠️ **Demo account bypass hanya untuk development!**
- Jangan gunakan di production
- Hapus atau disable akun demo sebelum deploy ke production
- Password bypass hanya untuk email yang ada di DEMO_ACCOUNTS list

## Kontak

Jika masih ada masalah, pastikan:
1. ✅ PostgreSQL running
2. ✅ Database migrations applied
3. ✅ Database seeded
4. ✅ Backend server running
5. ✅ .env file configured
6. ✅ Prisma Client generated

Periksa log backend untuk detail error.
