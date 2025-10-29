# New System Features Documentation

This document describes the 5 new system-related features added to the Dashboard Monitoring Developer Activity system.

## 🎯 Overview

Five comprehensive system management features have been added to enhance monitoring, maintenance, and configuration capabilities:

1. **System Performance Monitoring** - Track server resource usage
2. **Backup Management System** - Automated database backups
3. **API Usage Analytics** - Monitor API consumption patterns
4. **System Logs Viewer** - Centralized log management
5. **System Configuration Management** - Dynamic settings control

---

## 1. 📈 System Performance Monitoring

### Description
Real-time monitoring of system resources including CPU, memory, disk usage, and network metrics.

### Features
- Real-time CPU usage tracking
- Memory usage monitoring (total, free, used)
- Disk usage tracking
- Active connections count
- Requests per minute tracking
- Historical performance data
- Performance statistics and analytics
- Automated recording every 5 minutes
- Automatic cleanup of old records (7 days retention)

### API Endpoints

```
GET /api/system-performance/current
  - Get current system performance metrics
  - Response: CPU, memory, disk usage in real-time

GET /api/system-performance/history?hours=24
  - Get historical performance data
  - Query params: hours (default: 24)

GET /api/system-performance/stats?hours=24
  - Get performance statistics
  - Returns: avg/max CPU and memory usage

POST /api/system-performance/record (Admin only)
  - Manually record a performance snapshot

DELETE /api/system-performance/cleanup?days=7 (Admin only)
  - Clean up old performance records
```

### Database Model
```prisma
model SystemPerformance {
  id                String   @id @default(uuid())
  cpuUsage          Float
  memoryUsage       Float
  memoryTotal       Float
  memoryFree        Float
  diskUsage         Float
  diskTotal         Float
  diskFree          Float
  activeConnections Int      @default(0)
  requestsPerMinute Int      @default(0)
  timestamp         DateTime @default(now())
}
```

### Automated Tasks
- Performance recording: Every 5 minutes
- Cleanup old records: Daily at 4:00 AM (keeps 7 days)

---

## 2. 💾 Backup Management System

### Description
Comprehensive database backup solution with manual and automated backups, download capabilities, and status tracking.

### Features
- Manual backup creation
- Automated daily backups at midnight
- Full and incremental backup support
- Backup status tracking (IN_PROGRESS, COMPLETED, FAILED)
- File size tracking
- Download backup files
- Backup history and statistics
- PostgreSQL pg_dump integration

### API Endpoints

```
POST /api/backups (Admin only)
  - Create a manual backup
  - Body: { backupType: "MANUAL" | "FULL" | "INCREMENTAL" }

GET /api/backups?page=1&limit=20&status=COMPLETED (Admin only)
  - List all backups with pagination
  - Query params: page, limit, status

GET /api/backups/stats (Admin only)
  - Get backup statistics
  - Returns: total, completed, failed, totalSize

GET /api/backups/:id (Admin only)
  - Get backup details

GET /api/backups/:id/download (Admin only)
  - Download backup file

DELETE /api/backups/:id (Admin only)
  - Delete backup record and file
```

### Database Model
```prisma
model BackupRecord {
  id          String       @id @default(uuid())
  filename    String
  filePath    String
  fileSize    Float
  backupType  BackupType
  status      BackupStatus @default(IN_PROGRESS)
  startedAt   DateTime     @default(now())
  completedAt DateTime?
  error       String?
  createdBy   String?
}

enum BackupType {
  FULL
  INCREMENTAL
  MANUAL
  SCHEDULED
}

enum BackupStatus {
  IN_PROGRESS
  COMPLETED
  FAILED
  CANCELLED
}
```

### Automated Tasks
- Daily backup: Every day at midnight
- Backup files stored in: `./backups/` (configurable via BACKUP_DIR env var)

### Configuration
```env
BACKUP_DIR=./backups
```

---

## 3. 📊 API Usage Analytics

### Description
Comprehensive tracking and analysis of API usage patterns, performance metrics, and rate limit violations.

### Features
- Track all API requests automatically
- Response time monitoring
- Endpoint usage statistics
- Status code distribution
- Error rate calculation
- Rate limit violation tracking
- User-specific usage analytics
- Top endpoints by request count
- Automated cleanup (30 days retention)

### API Endpoints

```
GET /api/api-usage/stats?hours=24 (Admin only)
  - Get overall API usage statistics
  - Returns: totalRequests, avgResponseTime, errorRate, requestsByEndpoint

GET /api/api-usage/history?hours=24&endpoint=/api/devices (Admin only)
  - Get API usage history
  - Query params: hours, endpoint

GET /api/api-usage/violations?hours=24 (Admin only)
  - Get rate limit violations (HTTP 429)
  - Returns: totalViolations, topViolators

GET /api/api-usage/endpoint/:endpoint?hours=24 (Admin only)
  - Get statistics for specific endpoint
  - Returns: totalRequests, avgResponseTime, errorRate

GET /api/api-usage/user/:userId?hours=24 (Admin only)
  - Get API usage for specific user

DELETE /api/api-usage/cleanup?days=30 (Admin only)
  - Clean up old API usage logs
```

### Database Model
```prisma
model ApiUsageLog {
  id           String   @id @default(uuid())
  endpoint     String
  method       String
  statusCode   Int
  responseTime Float
  ipAddress    String?
  userId       String?
  userAgent    String?
  timestamp    DateTime @default(now())
}
```

### Middleware Integration
Automatically logs all API requests via middleware:
```javascript
const apiUsageLogger = require('./middleware/apiUsageLogger');
app.use('/api', apiUsageLogger);
```

### Automated Tasks
- Cleanup old logs: Daily at 5:00 AM (keeps 30 days)

---

## 4. 📝 System Logs Viewer

### Description
Centralized system log management with filtering, search, export capabilities, and multiple log levels.

### Features
- Multiple log levels (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- Filter by level, source, time range
- Full-text search in messages
- Log statistics and aggregation
- Recent errors tracking
- Export logs as JSON
- Source-based grouping
- Automated cleanup

### API Endpoints

```
POST /api/system-logs (Admin only)
  - Create a new log entry
  - Body: { level, message, source?, metadata? }

GET /api/system-logs?page=1&limit=50&level=ERROR&source=auth&search=failed&hours=24 (Admin only)
  - List logs with filtering
  - Query params: page, limit, level, source, search, hours

GET /api/system-logs/stats?hours=24 (Admin only)
  - Get log statistics
  - Returns: total, byLevel, topSources

GET /api/system-logs/errors?limit=20 (Admin only)
  - Get recent ERROR and CRITICAL logs

GET /api/system-logs/export?level=ERROR&hours=24 (Admin only)
  - Export logs as JSON file

GET /api/system-logs/:id (Admin only)
  - Get specific log entry

DELETE /api/system-logs?level=DEBUG&olderThanDays=7 (Admin only)
  - Delete logs matching criteria
```

### Database Model
```prisma
model SystemLog {
  id        String   @id @default(uuid())
  level     LogLevel
  message   String
  source    String?
  metadata  Json?
  timestamp DateTime @default(now())
}

enum LogLevel {
  DEBUG
  INFO
  WARNING
  ERROR
  CRITICAL
}
```

### Usage Example
```javascript
const prisma = require('./database/prisma');

// Log an error
await prisma.systemLog.create({
  data: {
    level: 'ERROR',
    message: 'Failed to process request',
    source: 'authController',
    metadata: { userId: '123', error: 'Invalid token' }
  }
});
```

---

## 5. ⚙️ System Configuration Management

### Description
Dynamic system configuration management with categories, secret masking, audit trail, and bulk operations.

### Features
- Key-value configuration store
- Configuration categories
- Secret configuration masking
- Configuration history with audit trail
- Bulk updates
- Category-based organization
- Admin-only access
- Version tracking via updatedBy field

### API Endpoints

```
GET /api/system-config?category=email&includeSecret=false (Admin only)
  - List all configurations
  - Query params: category, includeSecret
  - Secrets are masked by default

GET /api/system-config/categories (Admin only)
  - Get all configuration categories with counts

POST /api/system-config (Admin only)
  - Create new configuration
  - Body: { key, value, description?, category?, isSecret? }

GET /api/system-config/:key (Admin only)
  - Get specific configuration (secrets masked)

PUT /api/system-config/:key (Admin only)
  - Update configuration
  - Body: { value?, description?, category?, isSecret? }

DELETE /api/system-config/:key (Admin only)
  - Delete configuration

POST /api/system-config/bulk (Admin only)
  - Bulk update configurations
  - Body: { configs: [{ key, value, description?, category?, isSecret? }] }
```

### Database Model
```prisma
model SystemConfig {
  id          String   @id @default(uuid())
  key         String   @unique
  value       String
  description String?
  category    String?
  isSecret    Boolean  @default(false)
  updatedBy   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Usage Example
```javascript
// Create configuration
POST /api/system-config
{
  "key": "email.smtp.host",
  "value": "smtp.gmail.com",
  "description": "SMTP host for email sending",
  "category": "email",
  "isSecret": false
}

// Create secret configuration
POST /api/system-config
{
  "key": "email.smtp.password",
  "value": "secret-password-123",
  "description": "SMTP password",
  "category": "email",
  "isSecret": true
}
```

### Categories Examples
- `email` - Email configuration
- `notifications` - Notification settings
- `security` - Security settings
- `integrations` - Third-party integrations
- `backup` - Backup settings

---

## 🔐 Security & Permissions

All new features require authentication and most require **ADMIN** role:

- **System Performance**: Authenticated users can view, only admins can record/cleanup
- **Backups**: Admin only (sensitive operation)
- **API Usage**: Admin only (privacy concern)
- **System Logs**: Admin only (may contain sensitive data)
- **System Config**: Admin only (critical system settings)

## 🔄 Automated Tasks (Cron Jobs)

The following cron jobs have been added:

| Job | Schedule | Description |
|-----|----------|-------------|
| recordPerformance | Every 5 minutes | Record system performance metrics |
| cleanPerformance | Daily at 4:00 AM | Clean old performance records (7 days) |
| cleanApiUsage | Daily at 5:00 AM | Clean old API usage logs (30 days) |
| dailyBackup | Daily at midnight | Automated database backup |

## 📦 Installation & Migration

1. Update the database schema:
```bash
cd backend
npx prisma migrate deploy
```

2. Generate Prisma client:
```bash
npx prisma generate
```

3. Restart the backend server:
```bash
npm start
```

4. The cron jobs will start automatically (controlled by `ENABLE_CRON_JOBS` env var)

## 🧪 Testing

Test the new endpoints:

```bash
# System Performance
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/system-performance/current

# Create Backup
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"backupType":"MANUAL"}' \
  http://localhost:5000/api/backups

# API Usage Stats
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/api-usage/stats?hours=24

# System Logs
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/system-logs?level=ERROR

# System Config
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/system-config
```

## 📊 Monitoring Dashboard

All features can be integrated into the dashboard for visual monitoring:

- Performance charts (CPU, memory over time)
- Backup status and history
- API usage graphs and statistics
- Log viewer with filtering
- Configuration management interface

## 🎓 Best Practices

1. **Performance Monitoring**: Check regularly for resource bottlenecks
2. **Backups**: Verify backup completion daily, test restore periodically
3. **API Usage**: Monitor for unusual patterns or rate limit violations
4. **System Logs**: Review ERROR and CRITICAL logs daily
5. **Configuration**: Document all configuration changes, use categories

## 🔧 Troubleshooting

### Backups failing
- Ensure PostgreSQL client tools (pg_dump) are installed
- Check DATABASE_URL format in .env
- Verify BACKUP_DIR has write permissions

### Performance recording not working
- Check cron jobs are enabled: `ENABLE_CRON_JOBS=true`
- Verify system has `os` module access

### API usage not being logged
- Ensure apiUsageLogger middleware is properly registered
- Check database connection

---

## 📝 Summary

These 5 new system features provide comprehensive system management capabilities:

✅ **System Performance Monitoring** - Track resource usage trends
✅ **Backup Management** - Automated database protection
✅ **API Usage Analytics** - Understand API consumption patterns
✅ **System Logs Viewer** - Centralized log management
✅ **System Configuration** - Dynamic settings control

All features are production-ready, fully documented, and follow the existing codebase patterns and conventions.
