# Installation Guide

## Panduan Instalasi Dashboard Monitoring Developer Activity

Dokumen ini menyediakan panduan instalasi lengkap dalam Bahasa Indonesia dan English.

---

## 🇮🇩 Bahasa Indonesia

### Ringkasan Sistem

Dashboard Monitoring Developer Activity adalah sistem komprehensif untuk memantau aktivitas developer, mengelola perangkat yang diotorisasi, dan memastikan keamanan repository.

### Komponen Sistem

1. **Backend API** (Node.js + Express)
2. **Dashboard Web** (React.js + Tailwind CSS)
3. **Database** (PostgreSQL)
4. **Monitoring Agent** (Python)
5. **Integrasi** (GitLab Webhooks, Slack Notifications)

### Persyaratan Sistem

#### Minimum:
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB
- OS: Linux (Ubuntu 20.04+) atau Windows Server 2019+

#### Recommended:
- CPU: 4 cores
- RAM: 8GB
- Storage: 50GB SSD
- OS: Ubuntu 22.04 LTS

### Software yang Diperlukan

- Docker & Docker Compose (untuk instalasi mudah)
- Node.js 18+ (untuk instalasi manual)
- Python 3.8+ (untuk monitoring agent)
- PostgreSQL 14+ (untuk instalasi manual)
- Git

### Langkah Instalasi Cepat (Docker)

#### 1. Clone Repository

```bash
git clone <repository-url>
cd dashboard-monitoring-dev-activity
```

#### 2. Konfigurasi Environment

```bash
cp .env.example .env
nano .env
```

Edit file `.env` dan ubah nilai berikut:

```env
# PENTING: Ganti semua secret dengan nilai unik Anda!

# Keamanan
JWT_SECRET=rahasia-jwt-anda-disini-minimal-64-karakter
API_SECRET=kunci-api-rahasia-anda-disini
ENCRYPTION_KEY=kunci-enkripsi-32-byte-anda-disini
SESSION_SECRET=rahasia-sesi-anda-disini

# Database
DATABASE_URL=postgresql://devmonitor:password-anda@postgres:5432/devmonitor
POSTGRES_PASSWORD=password-database-anda

# GitLab
GITLAB_WEBHOOK_SECRET=rahasia-webhook-gitlab-anda
GITLAB_TOKEN=token-akses-gitlab-anda

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/ANDA/WEBHOOK/URL
SLACK_ENABLED=true
```

#### 3. Generate Kunci Keamanan

```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate API Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Encryption Key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Salin output dari perintah di atas ke file `.env` Anda.

#### 4. Jalankan Aplikasi

```bash
# Start semua service
docker-compose up -d

# Cek status
docker-compose ps

# Lihat logs
docker-compose logs -f
```

#### 5. Inisialisasi Database

```bash
# Run database migrations
docker-compose exec backend npm run migrate
```

#### 6. Akses Dashboard

Buka browser dan kunjungi:
- **Dashboard**: http://localhost:3000
- **API Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

#### 7. Buat Akun Admin

1. Kunjungi http://localhost:3000/register
2. Isi form registrasi dengan email dan password Anda
3. Klik "Create account"
4. Login dengan kredensial yang baru dibuat

### Setup Monitoring Agent (pada Komputer Developer)

#### 1. Install Agent

```bash
cd monitoring-agent

# Buat virtual environment
python -m venv venv

# Aktifkan virtual environment
source venv/bin/activate  # Linux/Mac
# atau
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

#### 2. Konfigurasi Agent

```bash
cp .env.example .env
nano .env
```

Edit `.env`:

```env
API_URL=http://localhost:5000  # atau URL server production Anda
API_KEY=api-secret-dari-backend-env
HEARTBEAT_INTERVAL=60
LOG_LEVEL=INFO
MONITORED_PATHS=/home/user/projects
```

#### 3. Register Device

```bash
python agent.py register --email developer@perusahaan.com --device-name "Laptop Developer"
```

#### 4. Approve Device (di Dashboard)

1. Login ke dashboard sebagai admin
2. Buka menu "Devices"
3. Cari device yang baru didaftarkan
4. Klik "Approve"

#### 5. Mulai Monitoring

```bash
python agent.py monitor
```

Agent akan mulai memantau aktivitas git di folder yang dikonfigurasi.

### Integrasi GitLab

#### 1. Buat Webhook Secret

```bash
openssl rand -hex 32
```

Tambahkan ke backend `.env`:

```env
GITLAB_WEBHOOK_SECRET=hasil-generate-di-atas
```

#### 2. Buat GitLab Personal Access Token

1. Buka GitLab → Settings → Access Tokens
2. Nama: DevMonitor
3. Scope: Pilih `api`
4. Klik "Create personal access token"
5. Salin token dan tambahkan ke `.env`:

```env
GITLAB_TOKEN=token-gitlab-anda
```

#### 3. Konfigurasi Webhook di GitLab

Untuk setiap repository yang ingin dipantau:

1. Buka Repository → Settings → Webhooks
2. URL: `http://server-anda:5000/api/webhooks/gitlab`
3. Secret token: (gunakan nilai GITLAB_WEBHOOK_SECRET)
4. Trigger: Centang "Push events" dan "Merge request events"
5. Klik "Add webhook"

#### 4. Test Webhook

Klik tombol "Test" → "Push events" untuk verifikasi.

### Integrasi Slack

#### 1. Buat Slack App

1. Kunjungi https://api.slack.com/apps
2. Klik "Create New App"
3. Pilih "From scratch"
4. Nama: DevMonitor
5. Pilih workspace Anda

#### 2. Aktifkan Incoming Webhooks

1. Di app settings, buka "Incoming Webhooks"
2. Aktifkan "Activate Incoming Webhooks"
3. Klik "Add New Webhook to Workspace"
4. Pilih channel (misal: #security-alerts)
5. Salin Webhook URL

#### 3. Konfigurasi Backend

Tambahkan ke backend `.env`:

```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/ANDA/WEBHOOK/URL
SLACK_ENABLED=true
```

#### 4. Restart Backend

```bash
docker-compose restart backend
```

### Fitur Keamanan

1. **Device Registration & Authorization**
   - Setiap developer harus mendaftarkan device mereka
   - Admin harus approve device sebelum bisa digunakan
   - Device yang tidak authorized otomatis di-flag

2. **Monitoring Aktivitas Git**
   - Clone, pull, push, commit dipantau real-time
   - Copy repository terdeteksi otomatis
   - Log aktivitas lengkap tersimpan

3. **Alert Real-time**
   - Notifikasi di dashboard
   - Notifikasi Slack
   - Email alert (optional)

4. **Enkripsi Otomatis**
   - Repository yang diakses dari device tidak authorized
   - Otomatis ter-enkripsi AES-256
   - Admin dapat melihat daftar repository ter-enkripsi

5. **Security Score**
   - Kalkulasi otomatis berdasarkan metrics
   - Indikator visual di dashboard
   - Rekomendasi perbaikan

### Troubleshooting

#### Backend tidak bisa start

```bash
# Cek logs
docker-compose logs backend

# Restart service
docker-compose restart backend
```

#### Database connection error

```bash
# Cek PostgreSQL
docker-compose ps postgres

# Restart database
docker-compose restart postgres
```

#### Dashboard tidak bisa connect ke API

- Periksa REACT_APP_API_URL di dashboard/.env
- Pastikan backend running
- Cek CORS setting di backend

#### Monitoring agent tidak bisa connect

- Verifikasi API_URL dan API_KEY
- Pastikan backend accessible dari komputer developer
- Cek logs: `tail -f agent.log`

### Maintenance

#### Backup Database

```bash
# Manual backup
docker-compose exec postgres pg_dump -U devmonitor devmonitor > backup.sql

# Restore
cat backup.sql | docker-compose exec -T postgres psql -U devmonitor devmonitor
```

#### Update System

```bash
# Pull latest code
git pull

# Rebuild containers
docker-compose build

# Restart
docker-compose up -d

# Run new migrations
docker-compose exec backend npm run migrate
```

### Support & Dokumentasi

- **README.md** - Overview dan quick start
- **DEPLOYMENT.md** - Panduan deployment production lengkap
- **monitoring-agent/README.md** - Dokumentasi monitoring agent

---

## 🇬🇧 English

### Quick Installation (Docker)

1. Clone repository
2. Copy `.env.example` to `.env` and configure
3. Generate secure keys
4. Run `docker-compose up -d`
5. Run migrations: `docker-compose exec backend npm run migrate`
6. Access dashboard at http://localhost:3000

For detailed English documentation, see DEPLOYMENT.md

### Key Features

- Real-time developer activity monitoring
- Device authorization management
- Automatic encryption for unauthorized access
- GitLab webhook integration
- Slack notifications
- Security scoring and alerts
- Comprehensive dashboard with charts

### Tech Stack

- **Backend**: Node.js, Express, Socket.IO, Prisma ORM
- **Frontend**: React.js, Tailwind CSS, Recharts
- **Database**: PostgreSQL
- **Agent**: Python, cryptography, watchdog
- **Integrations**: GitLab API, Slack Webhooks

---

## Garansi & Dukungan

- ✅ Garansi 1 bulan
- ✅ Revisi gratis hingga sempurna
- ✅ Review progres harian
- ✅ Virtual meeting untuk briefing
- ✅ Dokumentasi lengkap

Target penyelesaian: **2 minggu**

## License

MIT License

---

**Catatan Penting:**
- Ganti semua password dan secret default sebelum production
- Gunakan HTTPS untuk production deployment
- Backup database secara rutin
- Monitor logs untuk aktivitas mencurigakan
- Update sistem secara berkala
