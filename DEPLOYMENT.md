# Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start with Docker](#quick-start-with-docker)
3. [Manual Deployment](#manual-deployment)
4. [Production Deployment](#production-deployment)
5. [Configuration](#configuration)
6. [Monitoring Agent Setup](#monitoring-agent-setup)
7. [GitLab Integration](#gitlab-integration)
8. [Slack Integration](#slack-integration)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Server**: Linux (Ubuntu 20.04+ recommended) or Windows Server
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 20GB+ free space

### Software Requirements

- Docker & Docker Compose (for Docker deployment)
- Node.js 18+ (for manual deployment)
- Python 3.8+ (for monitoring agent)
- PostgreSQL 14+ (if not using Docker)
- Git

## Quick Start with Docker

This is the easiest and recommended method for deployment.

### 1. Clone Repository

```bash
git clone <repository-url>
cd dashboard-monitoring-dev-activity
```

### 2. Configure Environment

```bash
cp .env.example .env
nano .env
```

Update the following critical variables:

```env
# Security - CHANGE THESE!
JWT_SECRET=your-secure-random-string-here
API_SECRET=your-api-secret-key-here
ENCRYPTION_KEY=your-32-byte-encryption-key-here

# Database
DATABASE_URL=postgresql://devmonitor:devmonitor123@postgres:5432/devmonitor

# GitLab
GITLAB_WEBHOOK_SECRET=your-webhook-secret
GITLAB_TOKEN=your-gitlab-personal-access-token

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### 3. Generate Secure Keys

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate API secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate encryption key (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Start Services

```bash
docker-compose up -d
```

### 5. Initialize Database

```bash
# Run database migrations
docker-compose exec backend npm run migrate

# (Optional) Seed database with sample data
docker-compose exec backend npm run db:seed
```

### 6. Access Dashboard

- Dashboard: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

### 7. Create Admin Account

Visit http://localhost:3000/register and create your admin account.

## Manual Deployment

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run migrate

# Start server
npm run dev  # Development
npm start    # Production
```

### Dashboard Setup

```bash
cd dashboard

# Install dependencies
npm install

# Build for production
npm run build

# Serve (use a web server like nginx or serve)
npx serve -s build -p 3000
```

### Database Setup

```bash
# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE devmonitor;
CREATE USER devmonitor WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE devmonitor TO devmonitor;
\q

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://devmonitor:your-password@localhost:5432/devmonitor
```

## Production Deployment

### Using PM2 for Backend

```bash
# Install PM2 globally
npm install -g pm2

# Start backend with PM2
cd backend
pm2 start src/index.js --name devmonitor-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/devmonitor

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket support for Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# Dashboard
server {
    listen 80;
    server_name devmonitor.yourdomain.com;

    root /path/to/dashboard/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable sites and restart nginx:

```bash
sudo ln -s /etc/nginx/sites-available/devmonitor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL Certificate (Let's Encrypt)

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificates
sudo certbot --nginx -d devmonitor.yourdomain.com -d api.yourdomain.com

# Auto-renewal is set up automatically
```

## Configuration

### Environment Variables

#### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/devmonitor

# Server
PORT=5000
NODE_ENV=production

# Security
JWT_SECRET=your-jwt-secret
API_SECRET=your-api-secret
ENCRYPTION_KEY=your-encryption-key
SESSION_SECRET=your-session-secret

# CORS
ALLOWED_ORIGINS=https://devmonitor.yourdomain.com

# Integrations
GITLAB_WEBHOOK_SECRET=your-gitlab-secret
GITLAB_URL=https://gitlab.com
GITLAB_TOKEN=your-gitlab-token
SLACK_WEBHOOK_URL=your-slack-webhook
SLACK_ENABLED=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Alerts
ALERT_SUSPICIOUS_THRESHOLD=3
ALERT_COOLDOWN_MINUTES=15
```

#### Dashboard (.env)

```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_SOCKET_URL=https://api.yourdomain.com
```

## Monitoring Agent Setup

### On Developer Machines

```bash
# Clone or download monitoring agent
git clone <repository-url>
cd monitoring-agent

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Configure
cp .env.example .env
nano .env
```

Edit `.env`:

```env
API_URL=https://api.yourdomain.com
API_KEY=your-api-secret-key-from-backend
HEARTBEAT_INTERVAL=60
LOG_LEVEL=INFO
MONITORED_PATHS=/home/user/projects,/home/user/workspace
```

### Register Device

```bash
python agent.py register --email developer@company.com --device-name "Developer Laptop"
```

### Start Monitoring

```bash
python agent.py monitor
```

### Run as Service

See monitoring-agent/README.md for OS-specific service setup instructions.

## GitLab Integration

### 1. Create Webhook Secret

Generate a secure webhook secret:

```bash
openssl rand -hex 32
```

Add to backend `.env`:

```env
GITLAB_WEBHOOK_SECRET=your-generated-secret
```

### 2. Create GitLab Personal Access Token

1. Go to GitLab → Settings → Access Tokens
2. Create token with `api` scope
3. Add to backend `.env`:

```env
GITLAB_TOKEN=your-gitlab-token
```

### 3. Configure GitLab Webhook

For each repository you want to monitor:

1. Go to Repository → Settings → Webhooks
2. URL: `https://api.yourdomain.com/api/webhooks/gitlab`
3. Secret Token: (use the GITLAB_WEBHOOK_SECRET value)
4. Trigger: Check "Push events" and "Merge request events"
5. SSL verification: Enable (if using HTTPS)
6. Click "Add webhook"

### 4. Test Webhook

Click "Test" → "Push events" to verify the webhook is working.

## Slack Integration

### 1. Create Slack App

1. Go to https://api.slack.com/apps
2. Click "Create New App"
3. Choose "From scratch"
4. Name: "DevMonitor"
5. Select your workspace

### 2. Enable Incoming Webhooks

1. In your app settings, go to "Incoming Webhooks"
2. Activate Incoming Webhooks
3. Click "Add New Webhook to Workspace"
4. Select a channel (e.g., #security-alerts)
5. Copy the Webhook URL

### 3. Configure Backend

Add to backend `.env`:

```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_ENABLED=true
```

### 4. Test Integration

Restart backend and trigger a test alert to verify Slack notifications.

## Troubleshooting

### Backend won't start

```bash
# Check logs
docker-compose logs backend
# or
pm2 logs devmonitor-api

# Common issues:
# - Database connection failed: Check DATABASE_URL
# - Port already in use: Change PORT in .env
# - Missing environment variables: Check .env file
```

### Database connection errors

```bash
# Test database connection
psql $DATABASE_URL

# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection from Docker
docker-compose exec backend npx prisma db push
```

### Dashboard can't connect to API

- Check REACT_APP_API_URL in dashboard/.env
- Verify backend is running and accessible
- Check CORS settings in backend (ALLOWED_ORIGINS)
- Check browser console for errors

### Monitoring agent can't connect

- Verify API_URL and API_KEY in agent .env
- Check network connectivity
- Ensure backend is accessible from agent machine
- Check agent logs: `tail -f agent.log`

### Socket.IO not working

- Check WebSocket support in nginx configuration
- Verify firewall allows WebSocket connections
- Check browser console for Socket.IO errors
- Ensure REACT_APP_SOCKET_URL is correct

### GitLab webhook not triggering

- Verify webhook URL is correct and accessible from GitLab
- Check webhook secret matches GITLAB_WEBHOOK_SECRET
- Check backend logs for webhook errors
- Test webhook from GitLab settings

### Slack notifications not sending

- Verify SLACK_WEBHOOK_URL is correct
- Check SLACK_ENABLED=true in .env
- Test webhook URL with curl:

```bash
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test message"}' \
  YOUR_SLACK_WEBHOOK_URL
```

## Backup and Recovery

### Database Backup

```bash
# Create backup
pg_dump $DATABASE_URL > backup.sql

# Restore backup
psql $DATABASE_URL < backup.sql

# Automated daily backups
crontab -e
# Add: 0 2 * * * pg_dump $DATABASE_URL > /backups/devmonitor-$(date +\%Y\%m\%d).sql
```

### Configuration Backup

```bash
# Backup all .env files
tar -czf config-backup.tar.gz backend/.env dashboard/.env monitoring-agent/.env
```

## Monitoring and Maintenance

### Health Checks

```bash
# API health
curl http://localhost:5000/health

# Database health
docker-compose exec postgres pg_isready
```

### Log Monitoring

```bash
# Backend logs
pm2 logs devmonitor-api
# or
docker-compose logs -f backend

# System logs
sudo journalctl -u devmonitor-api -f
```

### Updates

```bash
# Pull latest changes
git pull

# Update dependencies
cd backend && npm install
cd ../dashboard && npm install

# Run migrations
cd backend && npm run migrate

# Rebuild and restart
docker-compose build
docker-compose up -d
```

## Security Best Practices

1. **Change all default passwords and secrets**
2. **Use HTTPS in production** (Let's Encrypt)
3. **Keep software updated** (Node.js, PostgreSQL, OS)
4. **Regular backups** (daily recommended)
5. **Monitor logs** for suspicious activity
6. **Restrict database access** (firewall rules)
7. **Use strong JWT secrets** (64+ characters)
8. **Enable rate limiting** (configured by default)
9. **Regular security audits**
10. **Keep API keys secure** (never commit to git)

## Support

For issues and questions:
- Check logs first
- Review this documentation
- Check GitHub issues
- Contact support team

## License

MIT License
