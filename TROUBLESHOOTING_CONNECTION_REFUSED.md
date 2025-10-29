# Troubleshooting: Connection Refused Error

## Error Description

```
Login.js:59 Demo login error: 
localhost:5000/api/auth/login:1 
Failed to load resource: net::ERR_CONNECTION_REFUSED
```

## What This Means

The **ERR_CONNECTION_REFUSED** error occurs when the frontend React application tries to connect to the backend API server at `http://localhost:5000`, but nothing is listening on that port. This typically means the backend server is not running.

## Quick Fix

### Step 1: Start the Backend Server

Open a terminal and run:

```bash
cd backend
npm install
npm start
```

Expected output:
```
🚀 Server running on port 5000
📊 Dashboard Monitoring Developer Activity API
🌍 Environment: development
```

**Important**: Keep this terminal window open. The backend needs to keep running.

### Step 2: Verify Backend is Running

Open another terminal and test:

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-29T...",
  "uptime": 123.456
}
```

### Step 3: Start the Frontend

In a new terminal:

```bash
cd dashboard
npm install
npm start
```

The dashboard will open at `http://localhost:3000`

### Step 4: Login

Use any demo account:
- **Admin**: `admin@devmonitor.com` / `admin123456`
- **Developer**: `developer@devmonitor.com` / `developer123`
- **Viewer**: `viewer@devmonitor.com` / `viewer123`

## Automated Solutions

### Option 1: Use the Startup Script

```bash
./start_app.sh
```

This will:
- ✅ Check if backend is running
- ✅ Start backend if needed
- ✅ Create .env files if missing
- ✅ Install dependencies if needed

### Option 2: Use the Setup Script

```bash
./setup_and_test.sh
```

This comprehensive script will:
- ✅ Set up PostgreSQL database
- ✅ Create .env configuration
- ✅ Run database migrations
- ✅ Seed demo accounts
- ✅ Start the backend
- ✅ Test the login

## Common Issues and Solutions

### Issue 1: Backend Won't Start - Database Error

**Error**: `Database connection failed` or `PostgreSQL connection error`

**Solution**: Start PostgreSQL using Docker

```bash
docker run -d --name devmonitor-postgres \
  -e POSTGRES_USER=devmonitor \
  -e POSTGRES_PASSWORD=devmonitor123 \
  -e POSTGRES_DB=devmonitor \
  -p 5432:5432 \
  postgres:14-alpine
```

Then run migrations:
```bash
cd backend
npx prisma generate
npx prisma migrate deploy
npm run db:seed
```

### Issue 2: Port 5000 Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::5000`

**Solution**: Find and kill the process using port 5000

```bash
# Find the process
lsof -i :5000

# Kill it (replace PID with the actual process ID)
kill -9 PID

# Or kill all node processes
pkill -f node
```

### Issue 3: Missing Dependencies

**Error**: `Cannot find module '...'` or `Module not found`

**Solution**: Reinstall dependencies

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: Missing .env File

**Error**: Backend starts but crashes immediately

**Solution**: Create .env file

```bash
cp .env.example .env
```

Or create manually with these required variables:
```env
DATABASE_URL=postgresql://devmonitor:devmonitor123@localhost:5432/devmonitor
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Issue 5: Frontend Can't Find Backend

**Error**: Network error despite backend running

**Solution**: Check frontend .env file

```bash
cd dashboard
cat .env
```

Should contain:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

If file doesn't exist, create it:
```bash
echo "REACT_APP_API_URL=http://localhost:5000" > .env
echo "REACT_APP_SOCKET_URL=http://localhost:5000" >> .env
```

**Important**: After creating or modifying .env in dashboard, restart the frontend:
```bash
# Stop the frontend (Ctrl+C in the terminal running it)
# Then start again
npm start
```

## Verification Checklist

Use this checklist to verify everything is working:

- [ ] PostgreSQL is running: `docker ps | grep devmonitor-postgres`
- [ ] Backend is running: `curl http://localhost:5000/health`
- [ ] Backend port is open: `lsof -i :5000` (should show node process)
- [ ] Frontend .env exists: `ls dashboard/.env`
- [ ] Backend .env exists: `ls .env` or `ls backend/.env`
- [ ] Can login: `curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@devmonitor.com","password":"admin123456"}'`

## Understanding the Architecture

```
┌─────────────────┐         HTTP/WebSocket         ┌──────────────┐
│                 │  ←──────────────────────────→  │              │
│  Frontend       │    http://localhost:5000       │   Backend    │
│  (React)        │                                 │   (Node.js)  │
│  Port 3000      │                                 │   Port 5000  │
└─────────────────┘                                 └──────┬───────┘
                                                           │
                                                           │ SQL
                                                           ↓
                                                    ┌──────────────┐
                                                    │  PostgreSQL  │
                                                    │  Port 5432   │
                                                    └──────────────┘
```

**Connection Flow**:
1. User opens `http://localhost:3000` (Frontend)
2. User clicks login
3. Frontend sends request to `http://localhost:5000/api/auth/login` (Backend)
4. Backend validates credentials with PostgreSQL
5. Backend returns JWT token
6. Frontend stores token and redirects to dashboard

**When ERR_CONNECTION_REFUSED occurs**: Step 3 fails because nothing is listening on port 5000.

## Improvements Made

The following improvements were made to help prevent and diagnose this issue:

### 1. Better Error Messages
- Login now shows: "Cannot connect to backend server. Please ensure the backend is running on http://localhost:5000"
- Error messages display longer (6 seconds) for better visibility

### 2. Visual Indicator on Login Page
- Added warning box showing backend is required
- Displays command to start backend: `cd backend && npm start`

### 3. API Error Handling
- Network errors are now properly caught and labeled
- Error code `ERR_NETWORK` is set for connection failures

### 4. Environment Files
- Created `dashboard/.env` with proper API URL configuration
- Ensures frontend knows where to find backend

### 5. Documentation
- Created `START_HERE.md` - Quick start guide
- Created `start_app.sh` - Automated startup script
- This troubleshooting guide

## Still Having Issues?

### Check Logs

**Backend logs**:
```bash
# If running in foreground, check the terminal
# If running in background:
tail -f backend.log
```

**Frontend logs**:
Check browser console (F12 → Console tab)

### Get Help

Check these documentation files:
- `START_HERE.md` - Quick start instructions
- `QUICK_START.md` - Step-by-step setup guide
- `NETWORK_ERROR_FIX.md` - Detailed network error troubleshooting
- `README.md` - Full documentation

### Report Issue

If none of these solutions work, please provide:
1. Operating system (Linux/Mac/Windows)
2. Node.js version: `node --version`
3. Backend logs
4. Browser console errors (F12)
5. Output of: `curl http://localhost:5000/health`

## Prevention Tips

To avoid this error in the future:

1. **Always start backend first**, then frontend
2. Use the startup script: `./start_app.sh`
3. Keep backend terminal open while developing
4. Bookmark these URLs:
   - Backend health: http://localhost:5000/health
   - Frontend: http://localhost:3000
5. If you restart your computer, remember to:
   - Start PostgreSQL Docker container
   - Start backend server
   - Start frontend

## Summary

**Problem**: ERR_CONNECTION_REFUSED on localhost:5000
**Cause**: Backend server not running
**Solution**: Start backend server (`cd backend && npm start`)
**Prevention**: Use startup script and keep backend running

✅ Backend must run on port 5000
✅ Frontend expects backend at http://localhost:5000
✅ Start backend before frontend
✅ Keep both terminals open during development
