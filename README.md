# Dashboard Monitoring Developer Activity

A comprehensive system for monitoring developer activities, managing authorized devices, and ensuring repository security.

## Features

- 🔍 Real-time monitoring of git activities (clone, pull, push, commit, checkout)
- 🔒 Device registration and authorization
- 🚨 Automated alerts for suspicious activities
- 🔐 **NEW! Auto-Encryption Mechanism** - Automatic repository encryption on suspicious alerts
- 📊 Interactive dashboard with security indicators
- 🔔 Slack notifications
- 🌐 GitLab webhook integration
- 💾 **Offline Mode with LocalStorage** - Fully functional without backend
- 🛡️ **NEW! Access Detection & Protection** - Real-time monitoring and auto-encryption for unauthorized access

> 📖 **NEW! Offline Mode Documentation:**
> - [LOCALSTORAGE_OFFLINE_MODE.md](LOCALSTORAGE_OFFLINE_MODE.md) - Complete offline mode guide with repository input management

> 🚨 **NEW! Access Detection & Protection:**
> - [ACCESS_DETECTION_PROTECTION.md](ACCESS_DETECTION_PROTECTION.md) - Complete access detection and protection guide
> - Real-time monitoring of clone, pull, and push operations
> - Automatic encryption when unauthorized access detected
> - Alerts to Slack and dashboard in real-time
> - Skip encryption for authorized transfers through official channels
>
> 🔒 **NEW! Auto-Encryption Mechanism:**
> - [AUTO_ENCRYPTION_MECHANISM.md](AUTO_ENCRYPTION_MECHANISM.md) - Technical documentation (English)
> - [PANDUAN_AUTO_ENKRIPSI.md](PANDUAN_AUTO_ENKRIPSI.md) - Panduan lengkap (Bahasa Indonesia)
> - Automatic repository encryption when suspicious alerts detected
> - Manual verification by security admin required to decrypt
> - Transparent access for authorized devices on approved paths
> - Complete audit trail for compliance

### Core Monitoring Features

- 🔄 **Git Activity Monitoring** - Clone, pull, push, commit, checkout operations
- 🚫 **Unauthorized Access Detection** - Block access from unregistered devices
- 📋 **Repository Copy Detection** - Detect and prevent repo duplication to external devices
- 🌍 **Location-based Monitoring** - Unusual location detection with alerts
- 🔐 **Automatic Encryption** - Auto-encrypt repos on unauthorized access
- 📊 **Security Status Indicators** - Real-time repository and device security status
- 🔔 **Real-time Notifications** - Slack, Telegram, and dashboard alerts for suspicious activities
- 🔒 **Device Verification on Clone** - Verify device ID when repository is cloned
- ⚡ **Real-time Copy Detection** - Immediate alerts and encryption on unauthorized copy
- 🛡️ **Trusted Paths** - Configure trusted locations for repository access

### 🆕 Monitoring Dashboard (New!)

Real-time monitoring dashboard untuk pantau aktivitas developer:

- **📊 Live Activity Feed**: Real-time git operations (clone, pull, push)
- **💻 Device Status**: Monitor authorized/unauthorized devices
- **🔒 Security Indicators**: Repository status (aman, terduga, terenkripsi)
- **📜 Alert History**: Riwayat alert dan system responses
- **🔔 Multi-Channel Notifications**: 
  - Slack integration untuk team alerts
  - Telegram bot untuk personal notifications
  - Dashboard real-time notifications via WebSocket

> 📖 **For detailed monitoring features documentation, see:**
> - [MONITORING_NOTIFICATIONS_GUIDE.md](MONITORING_NOTIFICATIONS_GUIDE.md) - **NEW!** Complete monitoring & notifications guide
> - [QUICK_SETUP_MONITORING.md](QUICK_SETUP_MONITORING.md) - **NEW!** Quick 5-minute setup guide
> - [MONITORING_FEATURES.md](MONITORING_FEATURES.md) - Complete feature documentation (English)
> - [PANDUAN_MONITORING.md](PANDUAN_MONITORING.md) - Panduan lengkap (Bahasa Indonesia)
> - [DEVICE_VERIFICATION_AND_COPY_PROTECTION.md](DEVICE_VERIFICATION_AND_COPY_PROTECTION.md) - Device verification & copy detection (English)
> - [PANDUAN_PROTEKSI_COPY.md](PANDUAN_PROTEKSI_COPY.md) - Panduan proteksi copy (Bahasa Indonesia)

### System Features

- 📈 **System Performance Monitoring** - Real-time CPU, memory, and disk usage tracking
- 💾 **Backup Management** - Automated database backups with scheduling
- 📊 **API Usage Analytics** - Track API usage patterns and rate limit violations
- 📝 **System Logs Viewer** - Centralized log management with filtering and search
- ⚙️ **Configuration Management** - Dynamic system settings management

## Architecture

### Components

1. **Monitoring Agent** (Python) - Runs on developer machines
2. **Backend API** (Node.js + Express) - Central management server
3. **Dashboard** (React.js + Tailwind CSS) - Web monitoring interface
4. **Database** (PostgreSQL) - Data persistence
5. **Real-time Updates** (Socket.IO) - Live notifications

## Tech Stack

- **Monitoring Agent**: Python 3.8+, cryptography (AES-256)
- **Backend API**: Node.js 18+, Express, Socket.IO, Prisma ORM
- **Database**: PostgreSQL 14+ (Neon Serverless PostgreSQL for production)
- **Dashboard UI**: React.js 18+, Tailwind CSS, Socket.IO Client
- **Integrations**: GitLab Webhook API, Slack Incoming Webhook
- **Deployment**: Netlify (Serverless Functions)

## 🌐 Netlify + Neon Database Setup

This application is configured to deploy on Netlify with Neon PostgreSQL database.

**Database Name**: `crimson-base-54008430`

### Quick Setup for Production:

1. **Get Neon Connection String** from [Neon Console](https://console.neon.tech)
2. **Configure Environment Variables** in Netlify Dashboard
3. **Run Database Migrations** using the provided script
4. **Deploy to Netlify**

> 📖 **Complete Setup Guides:**
> - [SETUP_NETLIFY_NEON.md](SETUP_NETLIFY_NEON.md) - Quick setup guide (Bilingual)
> - [NEON_DATABASE_SETUP.md](NEON_DATABASE_SETUP.md) - Complete guide (English)
> - [PANDUAN_NEON_DATABASE.md](PANDUAN_NEON_DATABASE.md) - Panduan lengkap (Bahasa Indonesia)
> - [NEON_CONNECTION_SUMMARY.md](NEON_CONNECTION_SUMMARY.md) - Implementation summary

### Test Endpoints (After Deployment):
- `/api/health` - Health check
- `/api/test-db` - Database connection test
- `/api/db-info` - Database information

## ⚠️ Device Verification Required

**IMPORTANT:** Every developer MUST register their device before accessing this repository.

When you clone this repository, you must:
1. Run the setup script: `./setup_repo_protection.sh`
2. Register your device with the system
3. Wait for administrator approval
4. Only then can you commit/push to the repository

> 📖 **Device Verification Documentation:**
> - [DEVICE_VERIFICATION_ON_CLONE.md](DEVICE_VERIFICATION_ON_CLONE.md) - Complete device verification guide (English)
> - [VALIDASI_DEVICE_DEVELOPER.md](VALIDASI_DEVICE_DEVELOPER.md) - Panduan validasi device (Bahasa Indonesia)

### Quick Setup After Clone

```bash
# 1. Clone repository
git clone <repository-url>
cd dashboard-monitoring-dev-activity

# 2. Run device protection setup
./setup_repo_protection.sh

# 3. Follow the prompts to register your device
# 4. Wait for administrator approval
# 5. Start working after approval
```

## Quick Start

> **🚀 Untuk langkah cepat dalam Bahasa Indonesia, lihat [QUICK_START.md](QUICK_START.md)**
> 
> **🔧 Jika login tidak berfungsi, lihat [PERBAIKAN_LOGIN.md](PERBAIKAN_LOGIN.md)**
>
> **💾 Setup Database Neon: [QUICK_START_NEON.md](QUICK_START_NEON.md)** - Panduan setup database dalam 5 menit

### Prerequisites

- Node.js 18+
- Python 3.8+
- PostgreSQL 14+ or Neon Database (Recommended for production)
- Docker & Docker Compose (optional)

### Fast Setup (Recommended)

#### Option 1: With Neon Database (Production-Ready)

```bash
# 1. Setup backend with Neon
cd backend
npm install
npm run db:setup

# 2. Start backend
npm start

# 3. In another terminal, start dashboard
cd dashboard
npm install
npm start

# Access dashboard at http://localhost:3000
```

#### Option 2: With Local PostgreSQL

```bash
# Run automated setup script
./setup_and_test.sh

# Start backend
cd backend && npm start

# In another terminal, start dashboard
cd dashboard && npm start

# Test login
./test_login_all.sh
```

### Installation

#### Using Neon Database (Recommended for Production)

```bash
# Clone repository
git clone <repository-url>
cd dashboard-monitoring-dev-activity

# Setup backend with Neon
cd backend
npm install
npm run db:setup

# Follow the interactive prompts to configure Neon connection
# The script will guide you through:
# 1. Getting Neon connection string
# 2. Configuring environment variables
# 3. Running database migrations
# 4. Testing the connection

# Start backend
npm start

# In another terminal, setup and start dashboard
cd ../dashboard
npm install
npm start

# Dashboard will be available at http://localhost:3000
# Backend API will be available at http://localhost:5000
```

> 📖 **See [QUICK_START_NEON.md](QUICK_START_NEON.md) for detailed Neon setup guide**

#### Using Docker (Alternative)

```bash
# Clone repository
git clone <repository-url>
cd dashboard-monitoring-dev-activity

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start all services
docker-compose up -d

# The dashboard will be available at http://localhost:3000
# The backend API will be available at http://localhost:5000
```

#### Manual Installation

##### Backend API

```bash
cd backend
npm install
npm run migrate
npm run dev
```

##### Dashboard

```bash
cd dashboard
npm install
npm run dev
```

##### Monitoring Agent

```bash
cd monitoring-agent
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Register device first
python agent.py register --api-url http://localhost:5000 --token YOUR_API_TOKEN

# Start monitoring
python agent.py monitor
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/devmonitor

# Backend
PORT=5000
JWT_SECRET=your-secret-key
NODE_ENV=development

# GitLab
GITLAB_WEBHOOK_SECRET=your-webhook-secret

# Slack
SLACK_WEBHOOK_URL=your-slack-webhook-url

# Encryption
ENCRYPTION_KEY=your-32-byte-encryption-key

# Dashboard
REACT_APP_API_URL=http://localhost:5000
```

### GitLab Webhook Setup

1. Go to your GitLab project
2. Navigate to Settings > Webhooks
3. Add webhook URL: `http://your-server:5000/api/webhooks/gitlab`
4. Select events: Push events, Merge Request events
5. Add secret token from your `.env` file

### Slack Integration Setup

1. Create a Slack app at https://api.slack.com/apps
2. Enable Incoming Webhooks
3. Add webhook URL to your `.env` file

### Telegram Bot Integration Setup

1. Open Telegram and search for @BotFather
2. Send `/newbot` command and follow instructions
3. Get your Bot Token
4. Get your Chat ID (use @userinfobot)
5. Add configuration to your `.env` file:
   ```env
   TELEGRAM_BOT_TOKEN=your-telegram-bot-token
   TELEGRAM_CHAT_ID=your-telegram-chat-id
   TELEGRAM_ENABLED=true
   ```

> 📖 **For detailed setup instructions, see [QUICK_SETUP_MONITORING.md](QUICK_SETUP_MONITORING.md)**

## Usage

### Demo Accounts

The system comes with pre-seeded demo accounts for testing:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@devmonitor.com | admin123456 | Main administrator |
| Admin | alex.johnson@example.com | alex123 | Secondary admin |
| Developer | developer@devmonitor.com | developer123 | Standard developer |
| Developer | john.doe@example.com | john123 | Has suspicious activity |
| Developer | jane.smith@example.com | jane123 | Attempted repo copy |
| Developer | mike.chen@example.com | mike123 | Access from unusual location |
| Developer | sarah.williams@example.com | sarah123 | Normal activities |
| Developer | david.martinez@example.com | david123 | Unusual location (resolved) |
| Developer | emily.taylor@example.com | emily123 | Normal activities |
| Viewer | viewer@devmonitor.com | viewer123 | Read-only access |

To seed the database with demo accounts and sample data:

```bash
cd backend
npm run db:seed
```

This will create:
- **10 users** (3 admins, 6 developers, 1 viewer)
- **9 devices** (7 authorized, 1 pending, 1 rejected)
- **8 repositories** (7 secure, 1 encrypted)
- **30+ normal activities** (clone, pull, push, commit, checkout)
- **4 suspicious activities** (unauthorized access, repo copy, unusual location)
- **4 security alerts** (2 critical, 1 warning resolved)
- **Audit logs** and **system logs**

### Registering a Device

```bash
cd monitoring-agent
python agent.py register --email developer@company.com
```

### Monitoring Activities

The monitoring agent automatically:
- Detects git operations (clone, pull, push)
- Verifies device authorization
- Sends activity logs to backend
- Encrypts repos on unauthorized devices

### Dashboard Features

- View all registered devices
- Monitor real-time developer activities
- Security status indicators
- Alert management
- Device approval/revocation

## API Documentation

### Endpoints

#### Devices
- `POST /api/devices/register` - Register new device
- `GET /api/devices` - List all devices
- `PUT /api/devices/:id/approve` - Approve device
- `DELETE /api/devices/:id` - Revoke device

#### Activities
- `GET /api/activities` - List all activities
- `POST /api/activities` - Log activity
- `GET /api/activities/suspicious` - Get suspicious activities

#### Webhooks
- `POST /api/webhooks/gitlab` - GitLab webhook endpoint

#### System Performance
- `GET /api/system-performance/current` - Get current system performance
- `GET /api/system-performance/history` - Get performance history
- `GET /api/system-performance/stats` - Get performance statistics
- `POST /api/system-performance/record` - Record performance snapshot (Admin)

#### Backups
- `POST /api/backups` - Create manual backup (Admin)
- `GET /api/backups` - List all backups (Admin)
- `GET /api/backups/stats` - Get backup statistics (Admin)
- `GET /api/backups/:id/download` - Download backup file (Admin)
- `DELETE /api/backups/:id` - Delete backup (Admin)

#### API Usage
- `GET /api/api-usage/stats` - Get API usage statistics (Admin)
- `GET /api/api-usage/history` - Get usage history (Admin)
- `GET /api/api-usage/violations` - Get rate limit violations (Admin)
- `GET /api/api-usage/endpoint/:endpoint` - Get endpoint-specific stats (Admin)

#### System Logs
- `GET /api/system-logs` - List system logs with filtering (Admin)
- `GET /api/system-logs/stats` - Get log statistics (Admin)
- `GET /api/system-logs/errors` - Get recent errors (Admin)
- `GET /api/system-logs/export` - Export logs as JSON (Admin)

#### System Configuration
- `GET /api/system-config` - List all configurations (Admin)
- `POST /api/system-config` - Create new configuration (Admin)
- `PUT /api/system-config/:key` - Update configuration (Admin)
- `DELETE /api/system-config/:key` - Delete configuration (Admin)
- `POST /api/system-config/bulk` - Bulk update configurations (Admin)

## Security Features

### Device Fingerprinting
Each device is identified by:
- MAC address
- Hostname
- CPU info
- Operating system

### Encryption
Unauthorized access triggers:
- Automatic AES-256 encryption of repository
- Immediate alert to administrators
- Activity logging

### Real-time Alerts
Suspicious activities trigger:
- Dashboard notifications
- Slack messages
- Email alerts (optional)

## Development

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Agent tests
cd monitoring-agent
python -m pytest
```

### Database Migrations

```bash
cd backend
npm run migrate
```

## Deployment

### Production Deployment

1. Set up production database
2. Configure environment variables
3. Build frontend: `cd dashboard && npm run build`
4. Deploy backend with PM2 or similar
5. Set up reverse proxy (nginx)
6. Configure SSL certificates

### Monitoring

The system includes built-in health checks:
- `GET /api/health` - Backend health check
- Real-time WebSocket connection status
- Database connection monitoring

## Troubleshooting

### Connection Refused Error (ERR_CONNECTION_REFUSED)
**Problem**: `Failed to load resource: net::ERR_CONNECTION_REFUSED` on localhost:5000

**Quick Fix**:
```bash
cd backend && npm start
```

**Automated Fix**:
```bash
./start_app.sh
```

**See**: [TROUBLESHOOTING_CONNECTION_REFUSED.md](TROUBLESHOOTING_CONNECTION_REFUSED.md) for complete troubleshooting guide.

### Login Issues
**Problem**: Cannot login to dashboard

**Solutions**:
1. Run the setup script: `./setup_and_test.sh`
2. Ensure database is seeded: `cd backend && npm run db:seed`
3. Check Prisma client is generated: `cd backend && npx prisma generate`
4. Verify backend is running: `curl http://localhost:5000/health`
5. See detailed guide: [PERBAIKAN_LOGIN.md](PERBAIKAN_LOGIN.md)

**Demo Account Bypass**: All demo accounts (admin@devmonitor.com, developer@devmonitor.com, etc.) bypass password verification for easy testing.

### Agent Connection Issues
- Verify API URL in agent configuration
- Check network connectivity
- Ensure backend is running

### Database Issues
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Run migrations: `cd backend && npx prisma migrate deploy`
- Seed database: `cd backend && npm run db:seed`

### Real-time Updates Not Working
- Check Socket.IO connection in browser console
- Verify CORS settings in backend
- Check firewall settings

## Support

For issues and questions, please open an issue in the repository.

## License

MIT License

## Warranty

- 1 month warranty included
- Free revisions until completion
- Daily progress reviews available
