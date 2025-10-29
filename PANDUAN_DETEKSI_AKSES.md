# Panduan Deteksi & Proteksi Akses

Sistem monitoring dan proteksi otomatis untuk mendeteksi dan mencegah akses tidak sah ke repository.

## 📖 Daftar Isi

- [Pengenalan](#pengenalan)
- [Instalasi Cepat](#instalasi-cepat)
- [Cara Kerja](#cara-kerja)
- [Fitur Utama](#fitur-utama)
- [Penggunaan](#penggunaan)
- [Konfigurasi](#konfigurasi)
- [FAQ](#faq)

## Pengenalan

Sistem **Deteksi & Proteksi Akses** adalah fitur keamanan yang memantau setiap aktivitas pada repository Anda dan secara otomatis melindungi dari akses tidak sah.

### Apa yang Dipantau?

- ✅ **Git Clone** - Ketika repository di-clone
- ✅ **Git Pull** - Ketika melakukan pull/update
- ✅ **Git Push** - Ketika melakukan push ke remote
- ✅ **Repository Copy** - Ketika repository disalin ke lokasi lain
- ✅ **Device Access** - Device mana yang mengakses repository

### Apa yang Terjadi Saat Akses Tidak Sah Terdeteksi?

1. 🚨 **Alert Real-time** dikirim ke:
   - Dashboard administrator
   - Channel Slack security team
   - Email administrator

2. 🔒 **Enkripsi Otomatis**:
   - Repository langsung dienkripsi dengan AES-256
   - Akses diblokir
   - File lock dibuat

3. 📝 **Pencatatan**:
   - Activity log disimpan
   - Audit trail dibuat
   - Detail pelanggaran dicatat

## Instalasi Cepat

### Prasyarat

- Python 3.8 atau lebih baru
- Git terinstal
- Akses ke backend server
- Device sudah terdaftar dan disetujui

### Langkah Instalasi

```bash
# 1. Clone repository
git clone <repository-url>
cd <repository-name>

# 2. Jalankan script setup
./setup_access_detection.sh
```

Script akan meminta informasi:

```
Enter API URL (default: http://localhost:5000): 
Enter your API token: **********************
Enter repository ID: repo-abc123
```

### Verifikasi Instalasi

```bash
# Check status instalasi
cd monitoring-agent
source venv/bin/activate
python3 access_detection_agent.py \
    --repo-id "your-repo-id" \
    --check-access
```

Output yang diharapkan:
```
======================================================================
🛡️  Access Detection & Protection Agent
======================================================================

🔍 Checking for unauthorized movement...
✅ Location authorized

✅ Repository access authorized
```

## Cara Kerja

### 1. Git Hooks Otomatis

Setelah instalasi, git hooks akan otomatis terinstall:

- **Pre-push Hook**: Memeriksa authorization sebelum push
- **Post-merge Hook**: Mencatat setiap pull operation
- **Post-checkout Hook**: Monitor perpindahan branch

### 2. Real-time Monitoring

Ketika Anda menjalankan git operation:

```bash
git push origin main
```

Yang terjadi di background:
```
1. Pre-push hook aktif
2. Verifikasi device fingerprint
3. Check lokasi repository
4. Kirim data ke backend
5. Backend validate access
6. Jika OK: push dilanjutkan
7. Jika NOT OK: push diblokir + enkripsi
```

### 3. Continuous Watching

Untuk monitoring kontinyu:

```bash
cd monitoring-agent
source venv/bin/activate
python3 access_detection_agent.py \
    --repo-id "your-repo-id" \
    --watch
```

Ini akan:
- Monitor perubahan file repository
- Deteksi jika repository dipindah/dicopy
- Alert jika ada aktivitas mencurigakan

## Fitur Utama

### 🔍 Monitoring Real-time

**Apa yang dipantau:**

| Aktivitas | Keterangan | Action |
|-----------|------------|--------|
| Git Clone | Repository di-clone | Log + Verify device |
| Git Pull | Update dari remote | Log + Check location |
| Git Push | Push ke remote | Verify + Log |
| Copy Detection | Repository disalin | Alert + Encrypt |
| Location Change | Lokasi berubah | Verify + Alert |

### 🚨 Deteksi Akses Tidak Sah

**Indikator Akses Tidak Sah:**

1. **Device tidak terdaftar**
   - Device fingerprint tidak ada di database
   - Action: Block + Encrypt

2. **Device belum disetujui**
   - Status device masih PENDING atau REJECTED
   - Action: Block + Alert

3. **Lokasi tidak sah**
   - Repository di external drive (USB, external HDD)
   - Repository di folder temp atau downloads
   - Lokasi tidak dalam daftar trusted paths
   - Action: Alert + Encrypt

4. **Multiple instances**
   - Repository ada di banyak lokasi berbeda
   - Action: Alert (warning level)

5. **Copy terdeteksi**
   - Repository asli masih ada + ada copy baru
   - Action: Encrypt copy + Critical alert

### 🔐 Enkripsi Otomatis

**Kapan terjadi:**
- Device tidak authorized
- Lokasi mencurigakan
- Copy tidak sah terdeteksi

**Apa yang terjadi:**

```
Repository Structure (Normal):
project/
├── .git/
├── src/
├── README.md
└── package.json

Repository Structure (After Encryption):
project/
├── .git/
├── src/
├── README.md
├── package.json
├── .repo-encrypted.lock  ← Lock file
└── .repo-access-blocked  ← Block file
```

**Isi Lock File:**
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

### 📢 Alert System

**Channel Alert:**

1. **Dashboard**
   ```
   🚨 UNAUTHORIZED ACCESS DETECTED
   Repository: dashboard-monitoring
   User: developer@company.com
   Device: LAPTOP-DEV-002
   Action: Encrypted
   Time: 5 minutes ago
   ```

2. **Slack**
   ```
   🚨 SECURITY ALERT
   
   Unauthorized repository copy detected!
   
   Repository: dashboard-monitoring
   User: developer@company.com
   Device: LAPTOP-DEV-002
   Path: /media/external-drive/project
   
   Action taken: Repository automatically encrypted
   
   Click here to view details: [Dashboard Link]
   ```

3. **Email** (opsional)
   - Summary harian
   - Critical alerts immediate

### ✅ Jalur Resmi/Terotorisasi

**Trusted Paths** adalah lokasi yang diizinkan untuk repository.

**Menambah Trusted Path:**

Melalui Dashboard:
1. Buka Dashboard → Repositories
2. Pilih repository
3. Klik "Manage Trusted Paths"
4. Tambah path baru
5. Save

Melalui API:
```bash
curl -X POST http://localhost:5000/api/repository-protection/trusted-paths \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryId": "repo-id",
    "trustedPath": "/home/user/workspace/projects"
  }'
```

**Contoh Trusted Paths:**

```json
{
  "trusted_paths": [
    "/home/user/workspace",
    "/opt/projects",
    "/var/www/repos",
    "C:\\Users\\Developer\\Projects"
  ]
}
```

**Transfer antar Trusted Paths:**

```bash
# Pindah dari trusted path A ke trusted path B
# NO encryption, NO alert
mv /home/user/workspace/project /opt/projects/project

# Sistem akan detect transfer authorized
# Log: "AUTHORIZED_TRANSFER"
```

## Penggunaan

### Skenario 1: Developer Normal

Developer bekerja normal di device yang approved:

```bash
# 1. Clone repository (sudah ada git hooks)
git clone https://github.com/company/project.git
cd project

# 2. Bekerja seperti biasa
git pull origin main
# ... edit files ...
git add .
git commit -m "Update feature"
git push origin main

# Semua berjalan normal, tidak ada alert
```

### Skenario 2: Copy ke USB (Tidak Sah)

Developer mencoba copy ke USB drive:

```bash
# Copy repository ke USB
cp -r /home/user/project /media/usb/project

# Sistem langsung detect:
# 1. Original location masih ada
# 2. New location di external drive
# 3. Location tidak dalam trusted paths

# Action:
# - Alert dikirim ke admin
# - Repository di USB di-encrypt
# - Access blocked
# - Slack notification sent
```

Output di terminal:
```
======================================================================
🚨 SECURITY ALERT: REPOSITORY ENCRYPTED
======================================================================

⚠️  This repository has been encrypted due to unauthorized access.

📋 Possible reasons:
   • Repository copied to unauthorized device
   • Repository moved to untrusted location
   • Device not approved by administrator

💬 Action required:
   • Contact your administrator to restore access
   • Use repository only from approved devices and locations

======================================================================
```

### Skenario 3: Transfer Resmi

Admin memindahkan repository antar trusted locations:

```bash
# Verify transfer via API dulu
curl -X POST http://localhost:5000/api/access-detection/verify-transfer \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "repositoryId": "repo-id",
    "sourceLocation": "/home/user/project",
    "targetLocation": "/opt/projects/project"
  }'

# Response:
{
  "authorized": true,
  "skipEncryption": true,
  "message": "Transfer authorized through official channels"
}

# Lakukan transfer
mv /home/user/project /opt/projects/project

# NO encryption, just logged as authorized transfer
```

### Skenario 4: Continuous Monitoring

Setup monitoring untuk repository:

```bash
# Start monitoring
cd monitoring-agent
source venv/bin/activate
python3 access_detection_agent.py \
    --repo-id "repo-abc123" \
    --watch

# Output:
======================================================================
🛡️  Access Detection & Protection Agent
======================================================================

🔍 Checking for unauthorized movement...
✅ Location authorized

✅ Repository access authorized

👀 Starting continuous monitoring...
   Press Ctrl+C to stop

# Agent akan terus berjalan, monitoring repository
```

## Konfigurasi

### File Konfigurasi

**Backend (.env):**
```env
# Encryption key (32 bytes)
ENCRYPTION_KEY=your-32-byte-encryption-key-here

# Slack webhook untuk notifikasi
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# JWT secret
JWT_SECRET=your-jwt-secret-key
```

**Monitoring Agent (.env):**
```env
# API server URL
API_URL=http://localhost:5000

# Your authentication token
API_TOKEN=your-api-token-from-login

# Repository ID to monitor
REPO_ID=repo-abc123

# Repository path
REPO_PATH=/home/user/project
```

### Repository Metadata

File `.repo-metadata.json` (auto-generated):

```json
{
  "repository_id": "repo-abc123",
  "original_location": "/home/user/workspace/project",
  "created_at": "2024-01-15T09:00:00Z",
  "device_fingerprint": "abc123def456...",
  "trusted_paths": [
    "/home/user/workspace",
    "/opt/projects"
  ]
}
```

**PENTING**: Jangan commit file ini ke git! Sudah otomatis ditambahkan ke `.gitignore`.

### Trusted Paths Management

**List Trusted Paths:**
```bash
curl -X GET http://localhost:5000/api/repositories/repo-abc123 \
  -H "Authorization: Bearer TOKEN"
```

**Add Trusted Path:**
```bash
curl -X POST http://localhost:5000/api/repository-protection/trusted-paths \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryId": "repo-abc123",
    "trustedPath": "/new/trusted/path"
  }'
```

**Remove Trusted Path:**
```bash
curl -X DELETE http://localhost:5000/api/repository-protection/trusted-paths \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryId": "repo-abc123",
    "trustedPath": "/path/to/remove"
  }'
```

## FAQ

### Q: Apakah sistem ini memperlambat git operations?

**A**: Minimal impact. Pre-hook hanya menambah ~100-200ms untuk verifikasi. Untuk operasi normal tidak terasa perbedaannya.

### Q: Bagaimana jika saya perlu bekerja offline?

**A**: Agent tetap bekerja offline. Data akan disimpan local dan di-sync ketika online kembali. Verifikasi device menggunakan cache local.

### Q: Bisakah saya disable monitoring sementara?

**A**: Tidak direkomendasikan. Tapi jika diperlukan:

```bash
# Backup git hooks
cd .git/hooks
mv pre-push pre-push.backup
mv post-merge post-merge.backup

# Restore nanti:
mv pre-push.backup pre-push
mv post-merge.backup post-merge
```

**WARNING**: Selama disabled, repository tidak protected!

### Q: Repository saya ter-encrypt by mistake, bagaimana restore?

**A**: Hubungi administrator. Admin bisa decrypt melalui dashboard atau API:

```bash
# Admin only
curl -X POST http://localhost:5000/api/repository-protection/decrypt \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "repositoryId": "repo-abc123",
    "repositoryPath": "/path/to/repo"
  }'
```

### Q: Bagaimana jika device fingerprint berubah?

**A**: Bisa terjadi jika:
- Ganti network card
- Update sistem operasi
- Virtual machine di-reset

**Solution**: Re-register device baru dan tunggu approval admin.

### Q: Apakah bisa monitoring multiple repositories?

**A**: Ya! Install agent untuk setiap repository:

```bash
# Repository 1
cd /path/to/repo1
./setup_access_detection.sh

# Repository 2
cd /path/to/repo2
./setup_access_detection.sh

# dst...
```

### Q: Berapa lama history log disimpan?

**A**: Default 90 hari. Bisa dikonfigurasi di system settings:

```bash
# Via API
curl -X PUT http://localhost:5000/api/system-config/log_retention_days \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"value": "180"}'
```

### Q: Bisakah saya dapat notification ke email juga?

**A**: Ya, configure di Notification Preferences:

Dashboard → Settings → Notifications → Email Alerts

Atau via API:
```bash
curl -X POST http://localhost:5000/api/notification-preferences \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "userId": "your-user-id",
    "channel": "email",
    "alertTypes": ["CRITICAL", "WARNING"],
    "isEnabled": true
  }'
```

## Tips & Best Practices

### Untuk Developer

✅ **DO:**
- Selalu bekerja dari device yang approved
- Keep repository di trusted paths
- Report suspicious activities
- Update monitoring agent regularly

❌ **DON'T:**
- Jangan copy repository ke USB/external drives
- Jangan share repository copy dengan device lain
- Jangan disable git hooks tanpa approval
- Jangan commit sensitive data

### Untuk Administrator

✅ **DO:**
- Review dan approve device requests promptly
- Configure trusted paths dengan bijak
- Monitor dashboard secara regular
- Respond to critical alerts immediately
- Keep audit logs

❌ **DON'T:**
- Jangan approve device tanpa verifikasi
- Jangan add trusted paths di external drives
- Jangan ignore warning alerts
- Jangan share admin credentials

## Troubleshooting

Lihat [ACCESS_DETECTION_PROTECTION.md](ACCESS_DETECTION_PROTECTION.md#-troubleshooting) untuk troubleshooting lengkap.

### Quick Fixes

**Git push blocked:**
```bash
# Check device status
curl http://localhost:5000/api/devices/me -H "Authorization: Bearer TOKEN"

# Re-verify access
cd monitoring-agent
python3 access_detection_agent.py --check-access
```

**Hooks not working:**
```bash
cd monitoring-agent
python3 access_detection_agent.py --install-hooks
```

**Agent crashes:**
```bash
cd monitoring-agent
source venv/bin/activate
pip install -r requirements.txt --upgrade
```

## Resources

- 📖 [Complete Documentation](ACCESS_DETECTION_PROTECTION.md)
- 🔧 [API Reference](ACCESS_DETECTION_PROTECTION.md#-api-reference)
- 🛠️ [Troubleshooting Guide](ACCESS_DETECTION_PROTECTION.md#-troubleshooting)
- 📊 [Dashboard Guide](README.md#dashboard-features)

## Support

Butuh bantuan? Hubungi:
- 📧 Email: support@your-company.com
- 💬 Slack: #devops-support
- 📱 Phone: +62-xxx-xxxx-xxxx

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-15  
**Language**: Bahasa Indonesia
