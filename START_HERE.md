# Quick Start Guide - Fix Connection Refused Error

## The Problem

You're seeing this error:
```
ERR_CONNECTION_REFUSED
localhost:5000/api/auth/login
Failed to load resource: net::ERR_CONNECTION_REFUSED
```

This means the **backend server is not running**. The frontend React app is trying to connect to the backend API at `http://localhost:5000`, but nothing is listening on that port.

## The Solution

You need to start both the backend and frontend servers.

### Step 1: Start the Backend Server

Open a terminal and run:

```bash
cd backend
npm install
npm start
```

You should see output like:
```
🚀 Server running on port 5000
📊 Dashboard Monitoring Developer Activity API
🌍 Environment: development
```

**Keep this terminal window open!** The backend needs to keep running.

### Step 2: Start the Frontend Dashboard

Open a **NEW** terminal (keep the backend terminal running) and run:

```bash
cd dashboard
npm install
npm start
```

The dashboard will open automatically in your browser at `http://localhost:3000`

### Step 3: Login

Now you can login using any of the demo accounts:
- **Admin**: admin@devmonitor.com (password: admin123456)
- **Developer**: developer@devmonitor.com (password: developer123)
- **Viewer**: viewer@devmonitor.com (password: viewer123)

## What If Backend Still Won't Start?

If the backend fails to start, you may need to set up the database first:

### Option 1: Use Docker (Easiest)

```bash
# Start PostgreSQL in Docker
docker run -d --name devmonitor-postgres \
  -e POSTGRES_USER=devmonitor \
  -e POSTGRES_PASSWORD=devmonitor123 \
  -e POSTGRES_DB=devmonitor \
  -p 5432:5432 \
  postgres:14-alpine

# Create .env file
cp .env.example .env

# Run migrations
cd backend
npx prisma generate
npx prisma migrate deploy
npm run db:seed

# Start backend
npm start
```

### Option 2: Automated Setup Script

```bash
./setup_and_test.sh
```

This script will:
- Check if PostgreSQL is running
- Create .env files
- Run database migrations
- Seed demo accounts
- Start the backend

## Troubleshooting

### Error: Port 5000 already in use
```bash
# Find what's using port 5000
lsof -i :5000

# Kill the process (replace PID with actual process ID)
kill -9 PID
```

### Error: Database connection failed
Make sure PostgreSQL is running:
```bash
# Check if PostgreSQL container is running
docker ps | grep devmonitor-postgres

# If not running, start it
docker start devmonitor-postgres
```

### Error: Cannot find module
```bash
# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install
```

## Still Having Issues?

Check the documentation:
- [QUICK_START.md](QUICK_START.md) - Quick start guide in English
- [PERBAIKAN_LOGIN.md](PERBAIKAN_LOGIN.md) - Login fix guide in Indonesian
- [NETWORK_ERROR_FIX.md](NETWORK_ERROR_FIX.md) - Detailed network error troubleshooting
- [README.md](README.md) - Full documentation

## Summary

The "Connection Refused" error happens because:
1. ❌ Backend server is not running on port 5000
2. ✅ Frontend is trying to connect to backend
3. ✅ Solution: Start the backend server first!

**Always start backend before frontend!**
