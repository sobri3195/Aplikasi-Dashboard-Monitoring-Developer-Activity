# 🔍 Fitur Monitoring Aktivitas Developer

Dokumen ini menjelaskan fitur-fitur monitoring aktivitas developer yang telah diimplementasikan dalam sistem.

## 📋 Daftar Fitur

### 1. 🔄 Monitoring Aktivitas Git

Sistem memantau semua aktivitas Git developer secara real-time:

- **Git Clone** - Saat developer meng-clone repository
- **Git Pull** - Saat developer melakukan pull dari remote
- **Git Push** - Saat developer push ke remote repository
- **Git Commit** - Saat developer membuat commit baru
- **Git Checkout** - Saat developer berpindah branch

Setiap aktivitas mencatat:
- Repository yang diakses
- Branch yang digunakan
- Commit hash (untuk push/commit)
- Device yang digunakan
- IP address dan lokasi
- Timestamp aktivitas

### 2. 🚨 Deteksi Aktivitas Mencurigakan

Sistem secara otomatis mendeteksi dan memberi alert untuk:

#### Akses Tidak Terotorisasi (UNAUTHORIZED_ACCESS)
- Developer mengakses repo dari device yang tidak terdaftar
- Risk Level: **HIGH** atau **CRITICAL**
- Tindakan: Alert segera + notifikasi Slack

#### Copy/Duplikasi Repository (REPO_COPY)
- Developer mencoba copy repository ke device eksternal
- Device yang tidak diizinkan
- Risk Level: **CRITICAL**
- Tindakan: **Enkripsi otomatis repository** + alert

#### Lokasi Tidak Biasa (UNUSUAL_LOCATION)
- Developer login dari lokasi yang tidak biasa
- Contoh: Biasanya di Jakarta, tiba-tiba dari luar negeri
- Risk Level: **MEDIUM**
- Tindakan: Warning + verifikasi manual

#### Multiple Failed Authentication
- Beberapa kali percobaan login gagal
- Risk Level: **HIGH**
- Tindakan: Blokir sementara + alert admin

### 3. 🔐 Device Registration & Authorization

#### Device Terdaftar (Authorized Devices)
- Setiap developer harus register device mereka
- Device diidentifikasi dengan fingerprint unik:
  - MAC Address
  - Hostname
  - CPU Info
  - OS Info
  - IP Address

#### Status Device
- **PENDING** - Device baru, menunggu approval
- **APPROVED** - Device disetujui, bisa akses repo
- **REJECTED** - Device ditolak, tidak bisa akses
- **SUSPENDED** - Device di-suspend sementara

#### Pembatasan Akses
- Developer hanya bisa bekerja dari device yang APPROVED
- Akses dari device tidak terdaftar akan:
  - Diblokir otomatis
  - Trigger alert CRITICAL
  - Dicatat sebagai suspicious activity

### 4. 🔔 Notifikasi Real-time

#### Slack Integration
Notifikasi otomatis ke Slack untuk:
- Aktivitas mencurigakan
- Device baru yang perlu approval
- Repository yang di-encrypt
- Alert keamanan CRITICAL

#### Dashboard Notifications
- Real-time updates via WebSocket
- Alert popup untuk aktivitas mencurigakan
- Badge counter untuk unread alerts

### 5. 🔐 Enkripsi Otomatis

Sistem melakukan enkripsi otomatis repository jika:

#### Trigger Enkripsi
1. Akses dari device tidak dikenal
2. Attempt copy repository ke external device
3. Multiple unauthorized access attempts
4. Akses dari lokasi high-risk

#### Mekanisme Enkripsi
- Algorithm: **AES-256 encryption**
- Automatic encryption process
- Repository status: **ENCRYPTED**
- Notification sent immediately
- Audit log created

#### Dekripsi
- Hanya admin yang bisa dekripsi
- Memerlukan verifikasi
- Dicatat di audit log

### 6. 📊 Indikator Status Keamanan

#### Repository Security Status
- **SECURE** 🟢 - Repository aman, tidak ada masalah
- **WARNING** 🟡 - Ada aktivitas mencurigakan, perlu perhatian
- **COMPROMISED** 🔴 - Repository mungkin di-compromise
- **ENCRYPTED** 🔒 - Repository di-encrypt karena security threat

#### Device Status Indicators
- **Active** 🟢 - Device aktif, online
- **Offline** ⚫ - Device tidak terlihat > 24 jam
- **Suspicious** 🔴 - Device dengan aktivitas mencurigakan
- **Pending** 🟡 - Menunggu approval

#### Activity Risk Levels
- **LOW** 🟢 - Normal activity
- **MEDIUM** 🟡 - Perlu perhatian
- **HIGH** 🟠 - Butuh action segera
- **CRITICAL** 🔴 - Emergency, immediate action required

### 7. 📈 Dashboard Features

#### Overview Dashboard
- Total devices (authorized vs pending)
- Recent activities (last 24 hours)
- Active alerts count
- Repository security status
- System health indicators

#### Activities Feed
- Real-time activity stream
- Filter by:
  - User
  - Repository
  - Activity type
  - Risk level
  - Date range
- Color-coded by risk level

#### Alerts Management
- List of all alerts
- Filter: Resolved vs Unresolved
- Sort by severity
- Quick actions:
  - Mark as resolved
  - Assign to team member
  - Add notes
  - Send notification

#### Devices Management
- List all registered devices
- Approve/Reject pending devices
- Suspend/Unsuspend devices
- View device details
- Last seen timestamp
- Activity history per device

#### Security Dashboard
- Repository security status overview
- Suspicious activities chart
- Geographic activity map
- Device authorization statistics
- Encryption status

## 🎯 Demo Data

Sistem telah di-seed dengan dummy data yang mencakup:

### Users (10 total)
- **3 Admins**: Bisa approve devices, resolve alerts, manage all
- **6 Developers**: Melakukan aktivitas Git normal
- **1 Viewer**: Read-only access

### Devices (9 total)
- **7 Authorized devices**: Device yang sudah approved
- **1 Pending device**: Unknown device, waiting approval
- **1 Rejected device**: Suspicious device, ditolak

### Repositories (8 total)
- **7 Secure repositories**: Normal, tidak ada masalah
- **1 Encrypted repository**: Di-encrypt karena unauthorized access

### Activities (30+ total)
#### Normal Activities:
- Git clone operations
- Git pull from various branches
- Git push with commits
- Git checkout to feature branches
- Login activities

#### Suspicious Activities (4):
1. **Unauthorized Access** (HIGH)
   - John Doe mencoba akses dari device tidak terdaftar
   - Location: Singapore
   - Action: Access blocked

2. **Repository Copy Detected** (CRITICAL)
   - Jane Smith mencoba copy confidential-project
   - Location: United States
   - Action: Repository encrypted automatically

3. **Unauthorized Access** (CRITICAL)
   - Mike Chen access attempt dari unregistered device
   - Location: Russia
   - Action: Access blocked completely

4. **Unusual Location** (MEDIUM)
   - David Martinez login dari Vietnam
   - Normally works from: Medan, Indonesia
   - Status: Resolved (Business trip verified)

### Alerts (4 total)
- **2 Critical alerts**: Unauthorized access + repo copy
- **1 Critical alert**: Access from high-risk location
- **1 Warning**: Unusual location (resolved)

### Audit Logs
- Device approvals
- Device rejections
- Repository encryption events
- Alert resolutions
- User creation events

## 🚀 Cara Menggunakan

### 1. Jalankan Database Seeding

```bash
cd backend
npm run db:seed
```

### 2. Login ke Dashboard

Gunakan salah satu akun:
- Admin: `admin@devmonitor.com` / `admin123456`
- Developer: `developer@devmonitor.com` / `developer123`
- John Doe: `john.doe@example.com` / `john123`

### 3. Explore Features

#### Lihat Activities
1. Buka menu "Activities"
2. Lihat real-time activity feed
3. Filter berdasarkan risk level atau user
4. Perhatikan color coding:
   - Hijau = Normal
   - Kuning = Perhatian
   - Merah = Critical

#### Manage Devices
1. Buka menu "Devices"
2. Lihat pending devices (Unknown Device)
3. Approve atau reject device
4. Monitor last seen timestamp

#### Check Alerts
1. Buka menu "Alerts"
2. Lihat active alerts
3. Click untuk detail
4. Mark as resolved jika sudah ditangani

#### Monitor Security
1. Buka "Security Dashboard"
2. Lihat repository status
3. Check encrypted repository
4. Monitor suspicious activities

## 🔧 Testing Scenarios

### Scenario 1: Unauthorized Device Access
```bash
# Simulate access from unregistered device
cd monitoring-agent
python agent.py monitor --device-id unknown-device-12345
```
Expected:
- Access blocked
- Alert created (CRITICAL)
- Notification sent to Slack
- Logged in audit log

### Scenario 2: Repository Copy Attempt
```bash
# Simulate repo copy to external device
python agent.py clone --repo confidential-project --device external-hdd
```
Expected:
- Copy blocked
- Repository encrypted automatically
- Alert created (CRITICAL)
- Admin notified immediately

### Scenario 3: Unusual Location Login
```bash
# Login from different location
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@example.com","password":"john123"}' \
  --interface vpn0
```
Expected:
- Login allowed
- Alert created (WARNING)
- Notification sent
- Requires admin verification

## 📊 Metrics & Analytics

Dashboard menyediakan metrics:

- **Device Statistics**
  - Total registered devices
  - Authorized vs unauthorized
  - Active vs inactive devices
  - Pending approvals count

- **Activity Metrics**
  - Activities per day/week/month
  - Most active developers
  - Most accessed repositories
  - Peak activity hours

- **Security Metrics**
  - Total suspicious activities
  - Critical alerts count
  - Encrypted repositories
  - Resolved vs unresolved alerts
  - Response time to alerts

- **System Health**
  - API response times
  - Database performance
  - Real-time connection status
  - Notification delivery rate

## 🔐 Security Best Practices

1. **Device Management**
   - Review pending devices daily
   - Remove inactive devices monthly
   - Monitor last seen timestamps

2. **Alert Response**
   - Respond to CRITICAL alerts immediately
   - Investigate WARNING alerts within 24h
   - Document all resolutions

3. **Repository Security**
   - Regular security audits
   - Monitor encryption events
   - Review access patterns

4. **Audit Logs**
   - Review audit logs weekly
   - Export logs monthly for compliance
   - Investigate anomalies promptly

## 🆘 Troubleshooting

### Alert tidak muncul
- Check Slack webhook configuration
- Verify WebSocket connection
- Check system logs

### Device tidak bisa akses
- Verify device status (harus APPROVED)
- Check device fingerprint
- Ensure proper authentication

### Enkripsi gagal
- Check encryption key configuration
- Verify disk space
- Check system logs for errors

## 📝 Changelog

### Version 1.0.0
- ✅ Git activity monitoring (clone, pull, push, commit, checkout)
- ✅ Device registration & authorization system
- ✅ Suspicious activity detection
- ✅ Real-time notifications (Slack + Dashboard)
- ✅ Automatic encryption for unauthorized access
- ✅ Security status indicators
- ✅ Comprehensive audit logging
- ✅ Dashboard with real-time updates
- ✅ Extensive dummy data for testing

## 📞 Support

Untuk pertanyaan atau issues:
- Check documentation
- Review system logs
- Contact admin team
- Create issue in repository

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: ✅ Production Ready
