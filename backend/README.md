# DevMonitor Backend

Backend API untuk Developer Activity Monitoring Dashboard dengan Neon PostgreSQL Database.

## 🚀 Quick Start

### 1. Setup Database Neon (Otomatis)

```bash
npm install
npm run db:setup
```

Script ini akan memandu Anda melalui proses setup database Neon.

### 2. Setup Manual

```bash
# Install dependencies
npm install

# Konfigurasi environment variables
cp .env.example .env
# Edit .env dan isi DATABASE_URL dengan Neon connection string

# Generate Prisma Client
npx prisma generate

# Deploy migrations
npx prisma migrate deploy

# Start server
npm start
```

## 📋 Prasyarat

- Node.js 16+ 
- npm atau yarn
- Akun Neon Database ([daftar gratis](https://neon.tech))

## 🔧 Konfigurasi Database Neon

### Dapatkan Connection String dari Neon

1. Login ke [Neon Console](https://console.neon.tech)
2. Pilih atau buat project baru
3. Buat database: `crimson-base-54008430`
4. Copy connection string dari "Connection Details"

Format:
```
postgresql://[user]:[password]@[endpoint].neon.tech/crimson-base-54008430?sslmode=require
```

### Update Environment Variables

Edit file `.env`:

```env
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/crimson-base-54008430?sslmode=require
JWT_SECRET=your-secret-key
API_SECRET=your-api-secret
```

## 📦 npm Scripts

| Script | Deskripsi |
|--------|-----------|
| `npm start` | Start production server |
| `npm run dev` | Start development server dengan auto-reload |
| `npm run db:setup` | Setup database Neon (otomatis) |
| `npm run db:check` | Cek koneksi database |
| `npm run neon:check` | Verifikasi koneksi Neon |
| `npm run migrate` | Buat migration baru (development) |
| `npm run migrate:deploy` | Deploy migrations ke database |
| `npm run db:push` | Push schema tanpa migration |
| `npm run db:seed` | Seed database dengan data demo |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:studio` | Buka Prisma Studio |
| `npm test` | Run tests |

## 🧪 Testing Koneksi

### Check Database Connection

```bash
npm run db:check
```

Output akan menampilkan:
- ✅ Status koneksi
- ✅ Informasi database
- ✅ Jumlah records per table
- ✅ Status migrations
- ⚠️  Peringatan jika ada masalah

### Test API Endpoints

```bash
# Health check
curl http://localhost:5000/health

# Database status
curl http://localhost:5000/api/db/status

# Database test
curl http://localhost:5000/api/db/test

# Connection guide
curl http://localhost:5000/api/db/guide
```

## 🗄️ Database Schema

Database menggunakan Prisma ORM dengan schema lengkap untuk:

- **Users** - Authentication & authorization
- **Devices** - Device tracking & verification
- **Activities** - Activity monitoring & logging
- **Alerts** - Security alerts & notifications
- **Repositories** - Repository management
- **Audit Logs** - Compliance & audit trail
- **System Performance** - Performance monitoring
- **Sessions** - Session management
- Dan 20+ tabel lainnya...

## 🔐 Environment Variables

### Required (Wajib)

```env
DATABASE_URL=postgresql://...           # Neon connection string
JWT_SECRET=xxx                          # JWT token secret
API_SECRET=xxx                          # API authentication secret
ENCRYPTION_KEY=xxx                      # Data encryption key (32 bytes)
```

### Optional (Opsional)

```env
PORT=5000                               # Server port
NODE_ENV=development                    # Environment
ALLOWED_ORIGINS=http://localhost:3000   # CORS origins
FRONTEND_URL=http://localhost:3000      # Frontend URL

# Notifications
SLACK_WEBHOOK_URL=xxx
TELEGRAM_BOT_TOKEN=xxx
EMAIL_HOST=smtp.gmail.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📊 Database Management

### View Database dengan Prisma Studio

```bash
npm run prisma:studio
```

Browser akan terbuka di `http://localhost:5555` dengan interface untuk melihat dan edit data.

### Reset Database (Development Only!)

⚠️ **PERINGATAN:** Ini akan menghapus semua data!

```bash
npx prisma migrate reset
```

### Create New Migration

```bash
# Edit prisma/schema.prisma
# Then run:
npm run migrate
```

### Deploy Migrations (Production)

```bash
npm run migrate:deploy
```

## 🐛 Troubleshooting

### Error: "DATABASE_URL not configured"

**Solusi:**
1. Buat file `.env` di folder backend
2. Tambahkan `DATABASE_URL=postgresql://...`
3. Restart server

### Error: "Authentication failed"

**Solusi:**
1. Cek username dan password di connection string
2. Verifikasi di Neon Console
3. URL-encode special characters di password

### Error: "Table does not exist"

**Solusi:**
```bash
npx prisma migrate deploy
```

### Error: "SSL required"

**Solusi:**
Pastikan connection string memiliki `?sslmode=require` di akhir:
```
postgresql://user:pass@host.neon.tech/db?sslmode=require
```

## 📚 API Documentation

Server berjalan di `http://localhost:5000`

### Core Endpoints

- `GET /health` - Health check
- `GET /api/db/status` - Database connection status
- `GET /api/db/test` - Test database query
- `GET /api/db/guide` - Setup guide

### Authentication

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Activities

- `GET /api/activities` - List activities
- `POST /api/activities` - Create activity
- `GET /api/activities/:id` - Get activity

### Alerts

- `GET /api/alerts` - List alerts
- `PUT /api/alerts/:id/resolve` - Resolve alert

### Devices

- `GET /api/devices` - List devices
- `POST /api/devices/verify` - Verify device
- `PUT /api/devices/:id/authorize` - Authorize device

Dan masih banyak endpoint lainnya...

## 🚀 Deployment

### Deployment ke Production

1. Set environment variables di platform hosting
2. Set `NODE_ENV=production`
3. Deploy migrations: `npm run migrate:deploy`
4. Start server: `npm start`

### Deployment ke Netlify Functions

Lihat dokumentasi di `/netlify/README.md`

## 🔒 Security

- Helmet.js untuk security headers
- Rate limiting untuk API protection
- JWT untuk authentication
- Encryption untuk sensitive data
- CORS configuration
- SQL injection protection (Prisma)

## 📈 Monitoring

Server menyediakan:
- Real-time activity monitoring
- Performance metrics
- System health checks
- API usage tracking
- Security alerts

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License

## 📞 Support

Untuk bantuan lebih lanjut:
- Baca dokumentasi lengkap di `/docs`
- Cek troubleshooting guide di `SETUP_NEON_DATABASE.md`
- Review API documentation

---

**Database:** crimson-base-54008430  
**Provider:** Neon PostgreSQL  
**ORM:** Prisma  
**Framework:** Express.js  
**Version:** 1.0.0
