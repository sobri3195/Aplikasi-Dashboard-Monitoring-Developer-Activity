# Dashboard Monitoring Developer Activity

A comprehensive system for monitoring developer activities, managing authorized devices, and ensuring repository security.

## Features

- 🔍 Real-time monitoring of git activities (clone, pull, push)
- 🔒 Device registration and authorization
- 🚨 Automated alerts for suspicious activities
- 🔐 Automatic encryption for unauthorized access
- 📊 Interactive dashboard with security indicators
- 🔔 Slack notifications
- 🌐 GitLab webhook integration

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
- **Database**: PostgreSQL 14+
- **Dashboard UI**: React.js 18+, Tailwind CSS, Socket.IO Client
- **Integrations**: GitLab Webhook API, Slack Incoming Webhook

## Quick Start

> **🚀 Untuk langkah cepat dalam Bahasa Indonesia, lihat [QUICK_START.md](QUICK_START.md)**
> 
> **🔧 Jika login tidak berfungsi, lihat [PERBAIKAN_LOGIN.md](PERBAIKAN_LOGIN.md)**

### Prerequisites

- Node.js 18+
- Python 3.8+
- PostgreSQL 14+
- Docker & Docker Compose (optional)

### Fast Setup (Recommended)

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

#### Using Docker (Recommended)

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

## Usage

### Demo Accounts

The system comes with pre-seeded demo accounts for testing:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@devmonitor.com | admin123456 |
| Developer | developer@devmonitor.com | developer123 |
| Viewer | viewer@devmonitor.com | viewer123 |
| Developer | john.doe@example.com | john123 |
| Developer | jane.smith@example.com | jane123 |
| Admin | alex.johnson@example.com | alex123 |

To seed the database with demo accounts:

```bash
cd backend
npm run db:seed
```

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
