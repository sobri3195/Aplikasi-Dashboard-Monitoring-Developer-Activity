# 📖 Panduan Monitoring Aktivitas Developer

Panduan lengkap penggunaan sistem monitoring aktivitas developer dalam Bahasa Indonesia.

## 🎯 Ringkasan Fitur

Sistem ini memantau aktivitas developer dengan fitur:

### ✅ Yang Dipantau
1. **Aktivitas Git**
   - Clone repository
   - Pull dari remote
   - Push ke remote
   - Commit perubahan
   - Checkout branch

2. **Keamanan Device**
   - Registrasi device
   - Otorisasi device
   - Monitoring lokasi akses
   - Deteksi device mencurigakan

3. **Keamanan Repository**
   - Status keamanan real-time
   - Deteksi copy/duplikasi
   - Enkripsi otomatis
   - Access control

4. **Notifikasi**
   - Alert real-time di dashboard
   - Notifikasi Slack
   - Email alerts (opsional)

## 🚀 Quick Start

### 1. Setup Database

```bash
# Install dependencies
cd backend
npm install

# Jalankan migrasi database
npm run migrate

# Seed database dengan dummy data
npm run db:seed
```

Output yang diharapkan:
```
🌱 Starting database seeding...
✅ Admin user created: admin@devmonitor.com
✅ Developer user created: developer@devmonitor.com
✅ Viewer user created: viewer@devmonitor.com
...
✅ 30 normal activities created
✅ 4 suspicious activities detected
✅ 4 security alerts generated
🎉 Database seeding completed successfully!

📊 Sample Data:
   • 9 devices (7 authorized, 2 suspicious)
   • 8 repositories (7 secure, 1 encrypted)
   • 30 normal activities
   • 4 suspicious activities detected
   • 4 security alerts generated
```

### 2. Start Backend

```bash
cd backend
npm start
```

Server akan berjalan di `http://localhost:5000`

### 3. Start Dashboard

```bash
cd dashboard
npm start
```

Dashboard akan buka di `http://localhost:3000`

### 4. Login ke Dashboard

Gunakan salah satu akun demo:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@devmonitor.com | admin123456 |
| Admin | alex.johnson@example.com | alex123 |
| Developer | developer@devmonitor.com | developer123 |
| Developer | john.doe@example.com | john123 |
| Developer | jane.smith@example.com | jane123 |
| Developer | mike.chen@example.com | mike123 |
| Developer | sarah.williams@example.com | sarah123 |
| Developer | david.martinez@example.com | david123 |
| Developer | emily.taylor@example.com | emily123 |
| Viewer | viewer@devmonitor.com | viewer123 |

## 📱 Menggunakan Dashboard

### Dashboard Utama

Setelah login, Anda akan melihat:

1. **Overview Cards**
   - Total Devices
   - Recent Activities (24h)
   - Active Alerts
   - Repository Status

2. **Recent Activities Feed**
   - 10 aktivitas terakhir
   - Color-coded by risk level:
     - 🟢 Hijau = Normal (LOW)
     - 🟡 Kuning = Perhatian (MEDIUM)
     - 🟠 Orange = Urgent (HIGH)
     - 🔴 Merah = Critical (CRITICAL)

3. **Security Alerts**
   - Unresolved alerts
   - Click untuk detail

### Menu Activities

Melihat semua aktivitas developer:

1. **Filter Options**
   - By User: Pilih developer
   - By Repository: Pilih repo
   - By Activity Type: Clone, Pull, Push, dll
   - By Risk Level: LOW, MEDIUM, HIGH, CRITICAL
   - By Date Range: Custom date

2. **Activity Details**
   - Click pada activity untuk detail lengkap
   - Info yang ditampilkan:
     - Developer name
     - Device used
     - Repository & branch
     - IP Address & Location
     - Timestamp
     - Risk level
     - Commit hash (jika ada)

3. **Export**
   - Export ke CSV
   - Export ke JSON
   - Print report

### Menu Devices

Manage semua device developer:

1. **Device List**
   - Authorized devices (hijau)
   - Pending devices (kuning)
   - Rejected devices (merah)

2. **Device Actions** (Admin only)
   - **Approve**: Setujui device pending
   - **Reject**: Tolak device
   - **Suspend**: Suspend device sementara
   - **Delete**: Hapus device

3. **Device Details**
   - Click device untuk info lengkap:
     - Device name
     - Fingerprint
     - Hardware info (CPU, OS)
     - Network info (MAC, IP)
     - Last seen
     - Activity history

### Menu Alerts

Monitor dan resolve security alerts:

1. **Alert Types**
   - 🔴 **UNAUTHORIZED_DEVICE**: Device tidak terdaftar
   - 🔴 **REPO_COPY_DETECTED**: Copy repository terdeteksi
   - 🟠 **SUSPICIOUS_ACTIVITY**: Aktivitas mencurigakan
   - 🟡 **UNUSUAL_LOCATION**: Lokasi tidak biasa
   - 🟠 **MULTIPLE_FAILED_AUTH**: Banyak login gagal
   - 🔐 **REPO_ENCRYPTED**: Repository di-encrypt

2. **Alert Management** (Admin only)
   - **View Details**: Lihat detail lengkap
   - **Mark as Resolved**: Tandai sudah selesai
   - **Add Notes**: Tambah catatan
   - **Assign**: Assign ke team member
   - **Notify**: Kirim notifikasi ulang

3. **Filters**
   - All alerts
   - Unresolved only
   - Critical only
   - By severity
   - By date

### Menu Repositories

Monitor status keamanan repositories:

1. **Repository Status**
   - 🟢 **SECURE**: Aman, tidak ada masalah
   - 🟡 **WARNING**: Ada yang perlu diperhatikan
   - 🔴 **COMPROMISED**: Kemungkinan di-compromise
   - 🔒 **ENCRYPTED**: Di-encrypt untuk keamanan

2. **Repository Details**
   - Recent activities
   - Access history
   - Security events
   - Encrypted files (jika ada)

3. **Actions** (Admin only)
   - **Decrypt**: Decrypt repository
   - **Change Status**: Update security status
   - **View Logs**: Lihat audit logs

### Menu Security

Dashboard keamanan lengkap:

1. **Security Overview**
   - Total suspicious activities
   - Blocked access attempts
   - Encrypted repositories
   - Device authorization stats

2. **Charts & Graphs**
   - Activities timeline
   - Risk level distribution
   - Geographic activity map
   - Device usage statistics

3. **Threats**
   - Active threats
   - Threat history
   - Mitigation actions

## 🔐 Registrasi Device

### Untuk Developer

Setiap developer harus register device mereka:

```bash
cd monitoring-agent

# Install dependencies
pip install -r requirements.txt

# Register device
python agent.py register --email your.email@example.com

# Masukkan informasi saat diminta:
# - Email
# - Password
# - Device name (opsional, auto-detect)
```

Output:
```
🔐 Registering device...
✓ Device registered successfully!
📝 Device ID: abc123def456
⏳ Status: PENDING (waiting for admin approval)
```

### Untuk Admin

Approve device dari dashboard:

1. Buka menu **Devices**
2. Lihat device dengan status **PENDING**
3. Click **View Details**
4. Verifikasi informasi device:
   - Device name
   - Owner (email)
   - Hardware info
   - Location
5. Click **Approve** atau **Reject**

### Monitoring dari Device

Setelah device di-approve:

```bash
cd monitoring-agent

# Start monitoring
python agent.py monitor

# Agent akan otomatis detect git operations:
# - Git clone
# - Git pull
# - Git push
# - Git commit
# - Git checkout
```

## 🚨 Handling Alerts

### Scenario 1: Unauthorized Device

**Alert**: "Unauthorized device attempted to access backend-api"

**Tindakan**:
1. Buka alert di dashboard
2. Cek device details
3. Verifikasi dengan developer:
   - Apakah ini device mereka?
   - Lokasi sesuai?
4. **Jika valid**: Approve device
5. **Jika tidak valid**: Reject & investigate

### Scenario 2: Repository Copy Detected

**Alert**: "Attempt to copy confidential-project detected"

**Tindakan**:
1. Repository otomatis di-encrypt ✅
2. Hubungi developer segera
3. Investigasi alasan copy:
   - Backup?
   - Perpindahan device?
   - Suspicious?
4. **Jika valid**: Decrypt & allow
5. **Jika suspicious**: Keep encrypted & escalate

### Scenario 3: Unusual Location

**Alert**: "Developer accessed from unusual location"

**Tindakan**:
1. Verifikasi dengan developer
2. Cek apakah:
   - Business trip?
   - WFH dari lokasi lain?
   - VPN?
3. **Jika valid**: Mark as resolved
4. **Jika suspicious**: Block device

## 📊 Dummy Data yang Tersedia

Sistem sudah terisi dengan data untuk testing:

### Normal Activities (30+)
- **Developer** (developer@devmonitor.com):
  - Clone sample-project
  - Multiple pulls & pushes
  - Commits di feature branch

- **John Doe** (john.doe@example.com):
  - Clone backend-api
  - Work di feature/api-enhancement
  - Regular commits & pushes

- **Jane Smith** (jane.smith@example.com):
  - Clone frontend-app
  - Work di feature/ui-redesign
  - Multiple pulls dari develop

- **Mike, Sarah, David, Emily**:
  - Masing-masing bekerja di repo berbeda
  - Normal git workflow
  - Regular activities

### Suspicious Activities (4)

1. **John's Unauthorized Access** (HIGH)
   - Repository: backend-api
   - Device: Unknown Device (not registered)
   - Location: Singapore (unusual)
   - Status: Access blocked

2. **Jane's Repo Copy Attempt** (CRITICAL)
   - Repository: confidential-project
   - Device: Suspicious Device
   - Location: United States
   - Action: **Repository encrypted automatically**

3. **Mike's Access Attempt** (CRITICAL)
   - Repository: mobile-app
   - Device: Unregistered
   - Location: Russia (high-risk)
   - Action: Access blocked completely

4. **David's Unusual Location** (MEDIUM)
   - Repository: ml-models
   - Device: Authorized (David HP Spectre)
   - Location: Vietnam (unusual, biasanya Medan)
   - Status: ✅ Resolved (business trip verified)

### Alerts Generated (4)

Semua alert sudah ada di dashboard:
- 2 Critical alerts (unresolved)
- 1 Critical alert (unresolved)
- 1 Warning (resolved oleh admin)

## 🧪 Testing Features

### Test 1: Lihat Normal Activities

1. Login sebagai Developer
2. Buka menu Activities
3. Filter: Risk Level = LOW
4. Lihat 30+ normal activities
5. Perhatikan detail setiap activity

### Test 2: Check Suspicious Activities

1. Login sebagai Admin
2. Buka menu Activities
3. Filter: Risk Level = HIGH atau CRITICAL
4. Lihat 4 suspicious activities
5. Perhatikan details & actions taken

### Test 3: Manage Alerts

1. Login sebagai Admin
2. Buka menu Alerts
3. Lihat 4 alerts
4. Click alert "Unusual Location"
5. Sudah resolved, lihat notes
6. Try resolve yang lain

### Test 4: Device Management

1. Login sebagai Admin
2. Buka menu Devices
3. Lihat:
   - 7 approved devices (hijau)
   - 1 pending device (kuning) - "Unknown Device"
   - 1 rejected device (merah) - "Suspicious Device"
4. Try approve/reject pending device

### Test 5: Repository Security

1. Login sebagai Admin
2. Buka menu Repositories
3. Lihat 8 repositories
4. Check "confidential-project" (status: ENCRYPTED 🔒)
5. View encryption details

### Test 6: Real-time Updates

1. Buka dashboard di 2 browser/tab
2. Login sebagai Admin di tab 1
3. Login sebagai Developer di tab 2
4. Di tab 2, trigger activity (via API atau agent)
5. Lihat real-time update di tab 1

## 🔧 Configuration

### Slack Notifications

Edit `.env`:
```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

Test Slack:
```bash
curl -X POST http://localhost:5000/api/test/slack
```

### Email Notifications (Optional)

Edit `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Encryption Settings

Edit `.env`:
```env
ENCRYPTION_KEY=your-32-byte-encryption-key-here-1234
ENCRYPTION_ALGORITHM=aes-256-cbc
```

## 📈 Monitoring Best Practices

### Daily Tasks

1. **Check Dashboard** (5 menit)
   - Review unresolved alerts
   - Check recent activities
   - Monitor device status

2. **Review Pending Devices** (2 menit)
   - Approve legitimate devices
   - Reject suspicious ones

3. **Check System Health** (2 menit)
   - API status
   - Database connection
   - Real-time connection

### Weekly Tasks

1. **Security Review** (15 menit)
   - Review all alerts (resolved & unresolved)
   - Analyze suspicious activity patterns
   - Check encrypted repositories

2. **Device Audit** (10 menit)
   - Remove inactive devices (>30 days)
   - Review rejected devices
   - Update device policies

3. **Reports** (10 menit)
   - Generate activity report
   - Export audit logs
   - Share with team

### Monthly Tasks

1. **Compliance Audit** (30 menit)
   - Export all audit logs
   - Review access patterns
   - Document incidents

2. **Policy Review** (20 menit)
   - Review device policies
   - Update security rules
   - Train team on new policies

## 🆘 Troubleshooting

### Problem: Alert tidak muncul

**Solusi**:
1. Check Slack webhook:
   ```bash
   curl -X POST $SLACK_WEBHOOK_URL \
     -H "Content-Type: application/json" \
     -d '{"text":"Test message"}'
   ```
2. Check WebSocket connection di browser console
3. Restart backend server

### Problem: Device tidak bisa akses

**Solusi**:
1. Cek status device (harus APPROVED)
2. Verify API token
3. Check agent configuration:
   ```bash
   cat monitoring-agent/.env
   ```

### Problem: Dashboard tidak update

**Solusi**:
1. Reload page (Ctrl+F5)
2. Check WebSocket connection
3. Check backend logs:
   ```bash
   cd backend && npm run logs
   ```

### Problem: Enkripsi gagal

**Solusi**:
1. Check encryption key di `.env`
2. Verify disk space
3. Check system logs:
   ```bash
   curl http://localhost:5000/api/system-logs?level=ERROR
   ```

## 💡 Tips & Tricks

1. **Keyboard Shortcuts**
   - `Ctrl+K`: Quick search
   - `Ctrl+F`: Filter activities
   - `Esc`: Close modals

2. **Bulk Actions**
   - Select multiple alerts
   - Resolve semua sekaligus
   - Export selected items

3. **Custom Filters**
   - Save favorite filters
   - Quick access from sidebar

4. **Notifications**
   - Customize notification settings
   - Choose which alerts to receive
   - Set quiet hours

## 📞 Support

Jika ada masalah:

1. **Check Documentation**
   - README.md
   - MONITORING_FEATURES.md
   - TROUBLESHOOTING.md

2. **Check Logs**
   ```bash
   # Backend logs
   cd backend && tail -f logs/app.log
   
   # System logs
   curl http://localhost:5000/api/system-logs?level=ERROR
   ```

3. **Create Issue**
   - Buka GitHub Issues
   - Sertakan:
     - Error message
     - Steps to reproduce
     - Screenshots (jika ada)

## 📝 Changelog

### v1.0.0 - Initial Release
- ✅ Complete monitoring system
- ✅ Device authorization
- ✅ Suspicious activity detection
- ✅ Automatic encryption
- ✅ Real-time notifications
- ✅ Comprehensive dashboard
- ✅ Extensive dummy data

---

**Dibuat**: 2024
**Versi**: 1.0.0
**Status**: ✅ Ready for Production
