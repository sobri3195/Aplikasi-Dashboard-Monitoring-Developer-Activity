# 📊 Monitoring dan Notifikasi - Panduan Lengkap

Panduan lengkap sistem monitoring dan notifikasi untuk Developer Activity Dashboard.

## 🎯 Fitur Utama

### 1. Dashboard Monitoring Real-Time

Dashboard monitoring menampilkan dan memantau secara real-time:

#### Aktivitas Developer
- **Clone**: Deteksi saat repository di-clone
- **Pull**: Monitor operasi git pull
- **Push**: Pantau git push ke remote
- **Commit**: Track commit yang dilakukan
- **Checkout**: Monitor perpindahan branch

#### Status Device
- **Authorized**: Device yang sudah disetujui admin
- **Unauthorized**: Device yang belum disetujui atau ditolak
- **Pending**: Device menunggu approval
- **Suspended**: Device yang disuspend sementara

#### Indikator Keamanan Repository
- **🟢 Aman (SECURE)**: Repository dalam kondisi aman
- **🟡 Terduga (WARNING)**: Ada aktivitas mencurigakan
- **🔴 Terkompromi (COMPROMISED)**: Repository mungkin terkompromi
- **🔒 Terenkripsi (ENCRYPTED)**: Repository di-encrypt untuk keamanan

#### Riwayat Alert Keamanan
- Daftar lengkap semua alert yang terjadi
- Status resolusi alert
- Respons sistem otomatis yang diambil
- Timeline aktivitas mencurigakan

### 2. Integrasi Notifikasi

Sistem mendukung 3 channel notifikasi:

#### A. Slack Integration
Kirim notifikasi ke Slack workspace dengan format terstruktur.

**Contoh pesan:**
```
🔔 Developer Activity Alert

Severity: CRITICAL
Alert Type: UNAUTHORIZED_DEVICE
User: john.doe@example.com
Device: Unknown Device
Repository: backend-api
Message: Unauthorized clone detected from unregistered device

Time: 2024-01-15 14:30:00
```

#### B. Telegram Bot Integration
Kirim notifikasi langsung via Telegram bot dengan format Markdown.

**Contoh pesan:**
```
⚠️ UNAUTHORIZED DEVICE

*User:* john.doe@example.com
*Device:* abc123de
*Repository:* backend-api
*Severity:* CRITICAL

⚠️ Unauthorized clone detected from unregistered device [Device ID: abc123de]. Repo auto-encrypted.

_Time: 15 Jan 2024, 14:30_
```

#### C. Dashboard Real-Time
Notifikasi langsung di dashboard melalui WebSocket (Socket.IO).

## 🚀 Setup dan Konfigurasi

### 1. Setup Slack Integration

#### Step 1: Buat Slack App
1. Buka https://api.slack.com/apps
2. Click "Create New App"
3. Pilih "From scratch"
4. Beri nama app (contoh: "DevMonitor Alerts")
5. Pilih workspace

#### Step 2: Enable Incoming Webhooks
1. Di sidebar, pilih "Incoming Webhooks"
2. Toggle "Activate Incoming Webhooks" ke ON
3. Click "Add New Webhook to Workspace"
4. Pilih channel untuk notifikasi
5. Copy Webhook URL

#### Step 3: Konfigurasi di Backend
Edit file `.env`:
```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_ENABLED=true
```

#### Test Slack Integration
```bash
curl -X POST http://localhost:5000/api/test/slack \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Setup Telegram Bot Integration

#### Step 1: Buat Telegram Bot
1. Buka Telegram dan cari @BotFather
2. Kirim command `/newbot`
3. Ikuti instruksi untuk memberi nama bot
4. Save Bot Token yang diberikan

#### Step 2: Dapatkan Chat ID
1. Kirim pesan ke bot Anda
2. Buka URL: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Cari field `"chat":{"id":XXXXXXX}` untuk mendapatkan Chat ID

Atau gunakan cara mudah:
1. Add bot @userinfobot ke Telegram
2. Kirim pesan `/start`
3. Bot akan memberikan Chat ID Anda

#### Step 3: Konfigurasi di Backend
Edit file `.env`:
```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
TELEGRAM_ENABLED=true
```

#### Test Telegram Integration
```bash
curl -X POST http://localhost:5000/api/test/telegram \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Konfigurasi Dashboard

Dashboard sudah terintegrasi secara otomatis. Pastikan:

1. Backend berjalan di port yang benar
2. WebSocket connection aktif (cek status di sidebar)
3. User sudah login

## 📱 Menggunakan Dashboard Monitoring

### Akses Dashboard
```
http://localhost:3000/monitoring
```

### Fitur-fitur Dashboard:

#### 1. Live Activity Feed
- Menampilkan 20 aktivitas terakhir secara real-time
- Update otomatis saat ada aktivitas baru
- Color-coded berdasarkan tipe aktivitas:
  - 🟦 Clone (Biru)
  - 🟩 Pull (Hijau)
  - 🟪 Push (Ungu)
  - 🟦 Commit (Indigo)
  - 🟦 Checkout (Cyan)
  - 🟥 Unauthorized/Copy (Merah)

#### 2. Device Status Panel
- List 5 device terbaru
- Status indicator (🟢 authorized / 🔴 unauthorized)
- Owner information
- Last seen timestamp

#### 3. Security Alerts Panel
- Alert aktif (belum di-resolve)
- Severity level indicator
- Quick access ke detail alert
- Timestamp

#### 4. Repository Security Grid
- Grid view semua repository
- Security status dengan icon visual
- Encryption status
- Last activity timestamp

#### 5. Alert History Table
- Complete alert history
- Resolusi status
- System response yang diambil
- Filtering dan sorting

## 🔔 Tipe-tipe Notifikasi

### 1. Unauthorized Device
**Trigger:** Device tidak terdaftar mencoba akses

**Notifikasi:**
```
⚠️ Unauthorized clone detected from unregistered device [Device ID: xyz789]. Access blocked.
```

**Respons Sistem:**
- Block akses
- Generate alert
- Notify admin

### 2. Repository Copy Detected
**Trigger:** Deteksi copy repository ke external device

**Notifikasi:**
```
🚨 Unauthorized repository copy detected [Repo: confidential-project]. Repo auto-encrypted.
```

**Respons Sistem:**
- Encrypt repository otomatis
- Block further access
- Notify admin dan security team

### 3. Suspicious Activity
**Trigger:** Pola aktivitas mencurigakan

**Notifikasi:**
```
⚠️ Suspicious activity detected [User: john.doe@example.com] [Multiple failed auth attempts]
```

**Respons Sistem:**
- Flag activity
- Monitor closely
- Notify admin

### 4. Unusual Location
**Trigger:** Access dari lokasi tidak biasa

**Notifikasi:**
```
ℹ️ Access from unusual location [User: mike@example.com] [Location: Russia]
```

**Respons Sistem:**
- Verify with user
- Log activity
- Notify for review

## 🛠️ API Endpoints

### Get Monitoring Dashboard Data
```bash
GET /api/dashboard/monitoring
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [...],
    "devices": [...],
    "repositories": [...],
    "alerts": [...],
    "stats": {
      "authorizedDevices": 7,
      "unauthorizedDevices": 2,
      "suspiciousActivities": 4,
      "criticalAlerts": 2,
      "encryptedRepos": 1
    }
  }
}
```

### Send Test Notification
```bash
# Test Slack
POST /api/notifications/test/slack

# Test Telegram
POST /api/notifications/test/telegram
```

## 🔄 Real-time Updates via WebSocket

Dashboard menggunakan Socket.IO untuk real-time updates:

### Events yang di-listen:
- `new-activity`: Activity baru ditambahkan
- `new-alert`: Alert baru dibuat
- `device-status-changed`: Status device berubah
- `repository-status-changed`: Status repository berubah

### Auto-refresh:
Dashboard akan otomatis update tanpa perlu refresh halaman saat:
- Ada aktivitas developer baru
- Alert keamanan baru
- Perubahan status device
- Perubahan status repository

## 📊 Monitoring Best Practices

### Untuk Admin:

1. **Check Dashboard Regularly**
   - Review unresolved alerts minimal 2x sehari
   - Monitor suspicious activities
   - Verify pending devices

2. **Configure Notifications**
   - Setup Slack untuk team notifications
   - Setup Telegram untuk personal alerts
   - Configure email untuk critical alerts

3. **Response Time**
   - Critical alerts: Respond dalam 15 menit
   - Warning alerts: Review dalam 1 jam
   - Info alerts: Review dalam 24 jam

4. **Regular Review**
   - Weekly review of all activities
   - Monthly security audit
   - Quarterly device cleanup

### Untuk Developer:

1. **Device Registration**
   - Register semua device yang digunakan
   - Update device info saat ada perubahan
   - Remove device yang tidak digunakan

2. **Activity Awareness**
   - Aware dengan monitoring system
   - Report false positives
   - Communicate unusual activities

## 🐛 Troubleshooting

### Notifikasi Tidak Dikirim

**Slack:**
- Verify Webhook URL benar
- Check `SLACK_ENABLED=true`
- Test dengan curl command
- Check backend logs

**Telegram:**
- Verify Bot Token benar
- Verify Chat ID benar
- Check bot sudah di-start di Telegram
- Test dengan curl command
- Check backend logs

### Dashboard Tidak Update Real-time

**Check:**
- WebSocket connection status (di sidebar)
- Backend server running
- No CORS issues
- Browser console untuk errors

**Fix:**
1. Refresh halaman
2. Check backend logs
3. Verify Socket.IO server running
4. Check firewall/proxy settings

### Alert Tidak Muncul

**Check:**
- Alert memang ter-trigger
- Check database untuk alert record
- Verify notification service berjalan
- Check alert thresholds

## 📈 Statistik dan Metrics

Dashboard tracking metrics berikut:

### Activity Metrics:
- Total activities per day/week/month
- Activities by type (clone, pull, push, etc)
- Activities by user
- Suspicious activity rate

### Security Metrics:
- Number of authorized devices
- Number of unauthorized attempts
- Critical alerts count
- Repository security status distribution
- Encryption rate

### Performance Metrics:
- Alert response time
- Notification delivery time
- Dashboard load time
- API response time

## 🔐 Security Considerations

### Data Privacy:
- Alert messages tidak include sensitive data
- Device fingerprint di-hash
- IP addresses di-log tapi tidak di-share

### Access Control:
- Only admin dapat access full monitoring dashboard
- Developer hanya bisa lihat own activities
- Viewer role read-only access

### Audit Trail:
- Semua alerts di-log
- Notification delivery tracked
- System responses documented

## 📚 Additional Resources

### Documentation:
- [MONITORING_FEATURES.md](MONITORING_FEATURES.md) - Complete feature list
- [PANDUAN_MONITORING.md](PANDUAN_MONITORING.md) - Panduan dalam Bahasa Indonesia
- [ACCESS_DETECTION_PROTECTION.md](ACCESS_DETECTION_PROTECTION.md) - Detection mechanisms
- [AUTO_ENCRYPTION_MECHANISM.md](AUTO_ENCRYPTION_MECHANISM.md) - Auto-encryption details

### API Documentation:
- Full API docs available at `/api/docs`
- Postman collection available in `/docs/postman`

### Support:
- Email: support@devmonitor.com
- Slack: #devmonitor-support
- GitHub Issues: Repository issues page

## 🎉 Demo Scenarios

### Scenario 1: Normal Workflow
1. Developer clone repository → ✅ Authorized
2. Dashboard shows activity in real-time
3. No alerts generated
4. Repository status: SECURE

### Scenario 2: Unauthorized Access
1. Unknown device tries to clone → 🚨 Blocked
2. Alert generated: UNAUTHORIZED_DEVICE
3. Notifications sent to Slack & Telegram:
   ```
   ⚠️ Unauthorized clone detected from unregistered device [Device ID: xyz789]
   ```
4. Admin notified immediately
5. Access blocked automatically

### Scenario 3: Repository Copy Detected
1. Developer copies repo to external drive → 🚨 Detected
2. Alert generated: REPO_COPY_DETECTED
3. Repository auto-encrypted
4. Notifications sent:
   ```
   🚨 Unauthorized repository copy detected [Repo: confidential-project]. 
   Repo auto-encrypted.
   ```
5. Repository status changed to: ENCRYPTED
6. Access blocked until admin review

## 📝 Notes

- Sistem ini dirancang untuk monitoring proactive
- False positives bisa terjadi, review secara berkala
- Konfigurasi notification channels sesuai kebutuhan team
- Regular update dan maintenance diperlukan
- Backup alert history secara regular

## 🔄 Version History

- v1.0.0: Initial release with Slack integration
- v1.1.0: Added Telegram bot integration
- v1.2.0: Enhanced monitoring dashboard with real-time updates
- v1.3.0: Added repository security indicators
- v1.4.0: Improved alert history and system responses

## 📞 Contact & Support

Untuk pertanyaan atau support:
- Documentation: Check README.md dan guide files
- Issues: Open GitHub issue
- Email: support@devmonitor.com
- Telegram: @devmonitor_support
