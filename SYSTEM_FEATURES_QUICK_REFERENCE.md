# System Features - Quick Reference Guide

Quick reference for the 5 new system management features.

## 🚀 Quick Start

```bash
# 1. Apply database migration
cd backend
npx prisma migrate deploy
npx prisma generate

# 2. Start the server
npm start

# 3. Features are now available!
```

---

## 📈 1. System Performance Monitoring

### Check Current Performance
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/system-performance/current
```

### Get Performance History (last 24 hours)
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/system-performance/history?hours=24
```

### Get Performance Statistics
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/system-performance/stats?hours=24
```

**Auto-Recording**: Every 5 minutes  
**Retention**: 7 days  
**Access**: All authenticated users

---

## 💾 2. Backup Management

### Create Manual Backup (Admin)
```bash
curl -X POST \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"backupType":"MANUAL"}' \
  http://localhost:5000/api/backups
```

### List All Backups (Admin)
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:5000/api/backups?page=1&limit=20
```

### Download Backup (Admin)
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:5000/api/backups/:id/download \
  -o backup.sql
```

### Get Backup Statistics (Admin)
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:5000/api/backups/stats
```

**Auto-Backup**: Daily at midnight  
**Storage**: `./backups/` (or BACKUP_DIR)  
**Access**: Admin only

---

## 📊 3. API Usage Analytics

### Get Usage Statistics (Admin)
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:5000/api/api-usage/stats?hours=24
```

### Get Usage History (Admin)
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:5000/api/api-usage/history?hours=24
```

### Check Rate Limit Violations (Admin)
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:5000/api/api-usage/violations?hours=24
```

### Get Endpoint Stats (Admin)
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  "http://localhost:5000/api/api-usage/endpoint//api/devices?hours=24"
```

**Auto-Logging**: Every API request  
**Retention**: 30 days  
**Access**: Admin only

---

## 📝 4. System Logs Viewer

### View Recent Logs (Admin)
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  "http://localhost:5000/api/system-logs?page=1&limit=50&level=ERROR&hours=24"
```

### Get Log Statistics (Admin)
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:5000/api/system-logs/stats?hours=24
```

### Get Recent Errors (Admin)
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:5000/api/system-logs/errors?limit=20
```

### Export Logs (Admin)
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  "http://localhost:5000/api/system-logs/export?level=ERROR&hours=24" \
  -o logs.json
```

### Create Log Entry (Admin)
```bash
curl -X POST \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "ERROR",
    "message": "Test error message",
    "source": "testController",
    "metadata": {"key": "value"}
  }' \
  http://localhost:5000/api/system-logs
```

**Log Levels**: DEBUG, INFO, WARNING, ERROR, CRITICAL  
**Access**: Admin only

---

## ⚙️ 5. System Configuration Management

### List All Configurations (Admin)
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  "http://localhost:5000/api/system-config?category=email&includeSecret=false"
```

### Get Configuration Categories (Admin)
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:5000/api/system-config/categories
```

### Create Configuration (Admin)
```bash
curl -X POST \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "email.smtp.host",
    "value": "smtp.gmail.com",
    "description": "SMTP host for email sending",
    "category": "email",
    "isSecret": false
  }' \
  http://localhost:5000/api/system-config
```

### Update Configuration (Admin)
```bash
curl -X PUT \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "smtp.sendgrid.com",
    "description": "Updated SMTP host"
  }' \
  http://localhost:5000/api/system-config/email.smtp.host
```

### Delete Configuration (Admin)
```bash
curl -X DELETE \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:5000/api/system-config/email.smtp.host
```

### Bulk Update (Admin)
```bash
curl -X POST \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "configs": [
      {"key": "email.smtp.host", "value": "smtp.gmail.com", "category": "email"},
      {"key": "email.smtp.port", "value": "587", "category": "email"}
    ]
  }' \
  http://localhost:5000/api/system-config/bulk
```

**Access**: Admin only  
**Secrets**: Masked by default (use `includeSecret=true` to view)

---

## 🔐 Authentication

All endpoints require authentication. Get your token:

```bash
# Login
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@devmonitor.com",
    "password": "admin123456"
  }' \
  http://localhost:5000/api/auth/login

# Use the returned token in subsequent requests
TOKEN="eyJhbGc..."
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/system-performance/current
```

---

## 🔄 Cron Jobs Status

All cron jobs run automatically when `ENABLE_CRON_JOBS=true`:

| Job | Schedule | Description |
|-----|----------|-------------|
| recordPerformance | Every 5 min | Record system metrics |
| cleanPerformance | Daily 4 AM | Clean old performance data |
| cleanApiUsage | Daily 5 AM | Clean old API logs |
| dailyBackup | Daily 12 AM | Automated backup |

Check logs for: `✅ 9 cron jobs initialized`

---

## 📊 Response Formats

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### List Response with Pagination
```json
{
  "success": true,
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error"
}
```

---

## 🛠️ Environment Variables

Add to `backend/.env`:

```env
# Backup directory
BACKUP_DIR=./backups

# Enable/disable cron jobs
ENABLE_CRON_JOBS=true
```

---

## 📱 Integration with Dashboard

These features can be integrated into the React dashboard:

### System Performance Chart
```javascript
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis } from 'recharts';

function PerformanceChart() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetch('/api/system-performance/history?hours=24', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(res => setData(res.data));
  }, []);
  
  return (
    <LineChart data={data}>
      <Line dataKey="cpuUsage" stroke="#8884d8" />
      <Line dataKey="memoryUsage" stroke="#82ca9d" />
      <XAxis dataKey="timestamp" />
      <YAxis />
    </LineChart>
  );
}
```

### Backup List
```javascript
function BackupList() {
  const [backups, setBackups] = useState([]);
  
  const createBackup = async () => {
    await fetch('/api/backups', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ backupType: 'MANUAL' })
    });
    // Refresh list
  };
  
  return (
    <div>
      <button onClick={createBackup}>Create Backup</button>
      <ul>
        {backups.map(backup => (
          <li key={backup.id}>
            {backup.filename} - {backup.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 🔍 Common Use Cases

### Monitor System Health
```bash
# Check if system is healthy
curl http://localhost:5000/api/system-performance/current | jq '.data | {cpu: .cpuUsage, memory: .memoryUsage}'
```

### Backup Before Deployment
```bash
# Create backup before deploying
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"backupType":"MANUAL"}' \
  http://localhost:5000/api/backups
```

### Check for Errors
```bash
# Get recent errors
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/system-logs/errors?limit=10 | jq '.data[] | {message: .message, timestamp: .timestamp}'
```

### Monitor API Abuse
```bash
# Check rate limit violations
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/api-usage/violations | jq '.data.topViolators'
```

### Update Configuration
```bash
# Update email settings without redeploying
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":"new-smtp-host.com"}' \
  http://localhost:5000/api/system-config/email.smtp.host
```

---

## 📚 Additional Resources

- **Full Documentation**: `NEW_SYSTEM_FEATURES.md`
- **Changelog**: `CHANGELOG_SYSTEM_FEATURES.md`
- **API Docs**: See README.md "API Documentation" section

---

## 🆘 Troubleshooting

### Issue: Cannot access endpoints
**Solution**: Ensure you have a valid JWT token and proper role (ADMIN for most features)

### Issue: Backups failing
**Solution**: 
1. Install pg_dump: `apt-get install postgresql-client`
2. Check DATABASE_URL is correct
3. Verify BACKUP_DIR permissions

### Issue: Performance data not recording
**Solution**: Check `ENABLE_CRON_JOBS=true` in .env

### Issue: 404 on new endpoints
**Solution**: 
1. Restart backend server
2. Check routes are properly registered in `routes/index.js`
3. Verify migration was applied: `npx prisma migrate deploy`

---

## ✅ Health Check

Verify all features are working:

```bash
# 1. System Performance
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/system-performance/current

# 2. Backup Stats
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:5000/api/backups/stats

# 3. API Usage Stats
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:5000/api/api-usage/stats

# 4. System Logs
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:5000/api/system-logs?limit=5

# 5. System Config
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:5000/api/system-config

# All should return 200 OK with success: true
```

---

**Version**: 1.0  
**Last Updated**: October 29, 2024  
**Status**: Production Ready ✅
