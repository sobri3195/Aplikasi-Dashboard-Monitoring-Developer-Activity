# Access Detection & Protection System

Sistem pemantauan dan proteksi otomatis untuk mendeteksi dan mencegah akses tidak sah ke repository.

## 🎯 Fitur Utama

### 1. **Pemantauan Real-time Git Operations**
   - Monitor setiap aktivitas `clone`, `pull`, dan `push`
   - Pencatatan otomatis semua operasi git
   - Notifikasi real-time ke dashboard dan Slack

### 2. **Deteksi Akses Tidak Sah**
   - Deteksi pemindahan repository ke device lain
   - Deteksi copy repository ke direktori tidak sah
   - Identifikasi lokasi mencurigakan (external drives, USB, temp folders)
   - Deteksi multiple instances dari repository yang sama

### 3. **Proteksi Otomatis**
   - **Auto-encryption** repository saat terdeteksi pelanggaran
   - Pemblokiran akses langsung
   - Alert real-time ke administrator
   - Logging lengkap untuk audit trail

### 4. **Jalur Resmi/Terotorisasi**
   - Konfigurasi trusted paths untuk lokasi yang diizinkan
   - Bypass encryption untuk transfer resmi
   - Whitelist untuk device yang approved

## 🚀 Quick Start

### Instalasi

```bash
# Clone repository
git clone <repository-url>
cd <repository-name>

# Run setup script
./setup_access_detection.sh
```

Script akan meminta:
- **API URL**: URL backend server (default: http://localhost:5000)
- **API Token**: Token autentikasi Anda
- **Repository ID**: ID repository yang akan dimonitor

### Verifikasi Device

Sebelum menggunakan sistem, pastikan device Anda sudah:

1. **Terdaftar** di sistem
2. **Disetujui** oleh administrator
3. **Aktif** dan terverifikasi

```bash
# Check device status
cd monitoring-agent
source venv/bin/activate
python3 agent.py status
```

## 📋 Cara Kerja

### Workflow Access Detection

```
┌─────────────────┐
│ Git Operation   │ (clone/pull/push)
│ Detected        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Device Check    │
│ - Registered?   │
│ - Approved?     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
   YES       NO
    │         │
    ▼         ▼
┌────────┐  ┌──────────────┐
│Location│  │ BLOCK ACCESS │
│Check   │  │ + ENCRYPT    │
└───┬────┘  └──────────────┘
    │
┌───┴────┐
│        │
│Trusted │Untrusted
│        │
▼        ▼
┌────┐  ┌──────────────┐
│ALLOW│ │ ALERT +      │
└────┘  │ ENCRYPT      │
        └──────────────┘
```

### Monitoring Components

#### 1. Git Hooks
Otomatis diinstall di `.git/hooks/`:

- **pre-push**: Verifikasi device sebelum push
- **post-merge**: Monitor operasi pull
- **post-checkout**: Track branch changes

#### 2. Real-time Watcher
Monitor perubahan repository secara kontinyu:

```bash
cd monitoring-agent
source venv/bin/activate
python3 access_detection_agent.py \
    --repo-id "your-repo-id" \
    --watch
```

#### 3. API Integration
Backend endpoints untuk access detection:

- `POST /api/access-detection/monitor-operation` - Monitor git operation
- `POST /api/access-detection/check-movement` - Check unauthorized movement
- `POST /api/access-detection/verify-transfer` - Verify authorized transfer
- `GET /api/access-detection/stats` - Get monitoring statistics
- `GET /api/access-detection/dashboard` - Get dashboard data

## 🔐 Security Features

### Auto-Encryption

Ketika akses tidak sah terdeteksi, sistem akan:

1. **Encrypt repository** dengan AES-256
2. Buat file `.repo-encrypted.lock`
3. Buat file `.repo-access-blocked`
4. Update status di database
5. Kirim alert ke admin

#### Indikator Encryption

```json
{
  "encrypted": true,
  "timestamp": "2024-01-15T10:30:00Z",
  "reason": "UNAUTHORIZED_COPY_DETECTED",
  "message": "Repository encrypted. Contact administrator.",
  "original_location": "/home/user/project",
  "detected_location": "/media/usb/project"
}
```

### Alert System

#### Alert Levels

- **INFO**: Normal activities
- **WARNING**: Suspicious but not critical
- **CRITICAL**: Immediate threat, auto-encrypted

#### Alert Channels

1. **Dashboard** - Real-time notifications via WebSocket
2. **Slack** - Instant messages to security channel
3. **Email** - Summary untuk administrator

#### Alert Example (Slack)

```
🚨 UNAUTHORIZED ACCESS DETECTED

User: developer@company.com
Device: LAPTOP-DEV-002
Repository: dashboard-monitoring
Reason: UNAUTHORIZED_COPY
Action: Repository automatically encrypted
Path: /media/external-drive/project

Time: 2024-01-15 10:30:00
```

### Trusted Paths Configuration

#### Add Trusted Path

```bash
# Via API
curl -X POST http://localhost:5000/api/repository-protection/trusted-paths \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryId": "repo-id",
    "trustedPath": "/home/user/workspace/projects"
  }'
```

#### Remove Trusted Path

```bash
curl -X DELETE http://localhost:5000/api/repository-protection/trusted-paths \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryId": "repo-id",
    "trustedPath": "/home/user/workspace/projects"
  }'
```

## 📊 Monitoring Dashboard

Dashboard menyediakan:

### Real-time Statistics

- Total git operations (clone/pull/push)
- Suspicious activities count
- Active critical alerts
- Encrypted repositories count
- Recent activities timeline

### Activity Monitoring

View semua git operations dengan detail:

```json
{
  "id": "activity-id",
  "userId": "user-id",
  "deviceId": "device-id",
  "activityType": "GIT_PUSH",
  "repository": "repo-id",
  "timestamp": "2024-01-15T10:30:00Z",
  "isSuspicious": false,
  "riskLevel": "LOW",
  "details": {
    "repositoryPath": "/home/user/project",
    "branch": "main",
    "commitHash": "abc123"
  }
}
```

### Alert Management

Administrator dapat:
- View active alerts
- Resolve alerts
- Add resolution notes
- Track alert history

## 🔧 Configuration

### Environment Variables

```env
# Backend (.env)
ENCRYPTION_KEY=your-32-byte-encryption-key
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
JWT_SECRET=your-jwt-secret

# Monitoring Agent (monitoring-agent/.env)
API_URL=http://localhost:5000
API_TOKEN=your-api-token
REPO_ID=your-repository-id
REPO_PATH=/path/to/repository
```

### Repository Configuration

```json
{
  "repository_id": "repo-id",
  "original_location": "/home/user/project",
  "trusted_paths": [
    "/home/user/workspace",
    "/opt/projects"
  ],
  "created_at": "2024-01-15T10:00:00Z",
  "device_fingerprint": "abc123..."
}
```

## 📱 API Reference

### Monitor Git Operation

```http
POST /api/access-detection/monitor-operation
Authorization: Bearer {token}
Content-Type: application/json

{
  "repositoryId": "repo-id",
  "repositoryPath": "/home/user/project",
  "operationType": "push",
  "metadata": {
    "branch": "main",
    "commitHash": "abc123"
  }
}
```

**Response (Authorized):**
```json
{
  "success": true,
  "authorized": true,
  "message": "Access authorized",
  "activity": {
    "id": "activity-id",
    "activityType": "GIT_PUSH",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Response (Unauthorized):**
```json
{
  "authorized": false,
  "detected": true,
  "encrypted": true,
  "blocked": true,
  "message": "Unauthorized access detected and handled",
  "alert": {
    "id": "alert-id",
    "severity": "CRITICAL",
    "message": "Repository automatically encrypted"
  }
}
```

### Check Unauthorized Movement

```http
POST /api/access-detection/check-movement
Authorization: Bearer {token}
Content-Type: application/json

{
  "repositoryId": "repo-id",
  "repositoryPath": "/media/usb/project",
  "metadata": {
    "originalLocation": "/home/user/project"
  }
}
```

### Verify Authorized Transfer

```http
POST /api/access-detection/verify-transfer
Authorization: Bearer {token}
Content-Type: application/json

{
  "repositoryId": "repo-id",
  "sourceLocation": "/home/user/project",
  "targetLocation": "/home/user/workspace/project"
}
```

### Get Monitoring Statistics

```http
GET /api/access-detection/stats?repositoryId=repo-id
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalActivities": 150,
    "suspiciousActivities": 3,
    "activeAlerts": 1,
    "encryptedRepos": 2,
    "recentActivities": [...]
  }
}
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Access Denied After Setup

**Problem**: Git operations blocked even after setup

**Solutions**:
- Verify device is approved: Check dashboard → Devices
- Ensure API token is valid
- Check repository is in trusted path
- Verify device fingerprint matches

#### 2. Git Hooks Not Working

**Problem**: Operations not being monitored

**Solutions**:
```bash
# Reinstall hooks
cd monitoring-agent
python3 access_detection_agent.py \
  --repo-id "your-repo-id" \
  --install-hooks

# Check hooks are executable
ls -la ../.git/hooks/
chmod +x ../.git/hooks/pre-push
chmod +x ../.git/hooks/post-merge
```

#### 3. Repository Encrypted By Mistake

**Problem**: Repository encrypted when it shouldn't be

**Solutions**:
```bash
# Contact administrator to decrypt
# Or use API (Admin only)
curl -X POST http://localhost:5000/api/repository-protection/decrypt \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryId": "repo-id",
    "repositoryPath": "/home/user/project"
  }'
```

#### 4. Monitoring Agent Crashes

**Problem**: Agent stops unexpectedly

**Solutions**:
```bash
# Check logs
cd monitoring-agent
tail -f monitor.log

# Restart with verbose logging
python3 access_detection_agent.py \
  --repo-id "your-repo-id" \
  --watch \
  --verbose
```

## 🔄 Upgrade from Previous Version

If you're upgrading from an older version:

```bash
# 1. Pull latest changes
git pull origin main

# 2. Update backend dependencies
cd backend
npm install

# 3. Run database migration (if needed)
npx prisma migrate deploy

# 4. Update monitoring agent
cd ../monitoring-agent
source venv/bin/activate
pip install -r requirements.txt --upgrade

# 5. Reinstall git hooks
python3 access_detection_agent.py \
  --repo-id "your-repo-id" \
  --install-hooks

# 6. Restart backend server
cd ../backend
npm start
```

## 📈 Best Practices

### For Developers

1. **Always work from approved devices**
2. **Keep repository in trusted paths**
3. **Don't copy repository to external drives**
4. **Report suspicious activities immediately**
5. **Update monitoring agent regularly**

### For Administrators

1. **Review and approve devices promptly**
2. **Configure trusted paths appropriately**
3. **Monitor dashboard regularly**
4. **Respond to critical alerts immediately**
5. **Maintain audit logs**
6. **Regular security reviews**

### For DevOps

1. **Keep encryption keys secure**
2. **Backup encryption keys safely**
3. **Monitor system performance**
4. **Test disaster recovery procedures**
5. **Update security configurations regularly**

## 📚 Additional Resources

- [Main README](README.md) - Complete system documentation
- [MONITORING_FEATURES.md](MONITORING_FEATURES.md) - All monitoring features
- [DEVICE_VERIFICATION_AND_COPY_PROTECTION.md](DEVICE_VERIFICATION_AND_COPY_PROTECTION.md) - Device verification guide
- [PANDUAN_PROTEKSI_COPY.md](PANDUAN_PROTEKSI_COPY.md) - Copy protection guide (Bahasa)

## 🆘 Support

Jika mengalami masalah:

1. Check dokumentasi troubleshooting di atas
2. Review system logs: `backend/logs/`
3. Check monitoring agent logs: `monitoring-agent/monitor.log`
4. Contact system administrator
5. Open issue di repository

## 📝 License

MIT License - See LICENSE file for details

## 🔒 Security

For security issues, please contact: security@your-company.com

**Important**: Do not share:
- API tokens
- Encryption keys
- Device fingerprints
- Repository IDs

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-15  
**Maintained by**: DevOps Team
