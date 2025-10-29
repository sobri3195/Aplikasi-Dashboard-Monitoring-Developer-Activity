# Validasi Device Developer

## Ringkasan

Setiap developer **WAJIB** melakukan registrasi device (laptop/PC) terlebih dahulu sebelum dapat mengakses repository.

## Alur Validasi Device pada Clone

### Proses Clone Repository

```
1. Developer clone repository
         ↓
2. Clone selesai → file repository ter-download
         ↓
3. Developer jalankan script setup
         ↓
4. Sistem baca kredensial dan generate Device ID
         ↓
5. Sistem cek apakah device terdaftar di dashboard
         ↓
6. Jika Device ID tidak dikenal → Proses clone DITOLAK
   Jika Device ID terdaftar tapi PENDING → Tunggu approval
   Jika Device ID terdaftar dan APPROVED → Akses DIBERIKAN
         ↓
7. Device yang sudah diverifikasi = Authorized Device
```

## Cara Kerja Sistem

### 1. Saat Developer Clone Repo

Ketika developer melakukan clone repository:

```bash
git clone <repository-url>
cd <repository-name>
```

**Yang terjadi:**
- Repository berhasil di-clone ke laptop developer
- File dan folder ter-download lengkap
- **Belum bisa langsung digunakan** - perlu setup device

### 2. Setup Device Protection

Developer harus menjalankan script setup:

```bash
./setup_repo_protection.sh
```

**Script ini akan:**
1. ✅ Install git hooks untuk monitoring
2. ✅ Generate Device ID unik
3. ✅ Membaca kredensial dari .env file
4. ✅ Mengirim request registrasi device ke dashboard
5. ✅ Mengecek status device di database

### 3. Sistem Membaca Kredensial dan ID Device

**Device ID dibuat dari:**
- MAC Address (di-hash untuk privasi)
- Hostname komputer
- Platform (Windows/Mac/Linux)
- Arsitektur CPU
- Username sistem

**Kredensial yang dibaca:**
- API_URL → Alamat backend API
- API_TOKEN → Token autentikasi user
- REPO_ID → ID repository

### 4. Mengecek Device di Dashboard

Sistem melakukan pengecekan:

```
┌──────────────────────────────────────┐
│  Cek Device di Database Dashboard   │
└──────────────────────────────────────┘
              ↓
    ┌─────────────────────┐
    │ Device terdaftar?   │
    └─────────────────────┘
         ↓           ↓
       TIDAK        YA
         ↓           ↓
    ┌─────────┐  ┌────────────────────┐
    │ DITOLAK │  │ Status APPROVED?   │
    └─────────┘  └────────────────────┘
                    ↓           ↓
                  TIDAK        YA
                    ↓           ↓
               ┌──────────┐  ┌──────────┐
               │ PENDING  │  │ DIIZINKAN│
               │ (Tunggu) │  │          │
               └──────────┘  └──────────┘
```

### 5. Jika Device ID Tidak Dikenal

**Pesan Error:**
```
❌ Device not registered or not approved!

   This repository requires device registration.
   Please register your device:

   python3 monitoring-agent/repo_protection_agent.py register --device-name "My Device"

   Then wait for administrator approval.
```

**Aksi Sistem:**
- ❌ Commit ditolak
- ❌ Push ditolak
- 📝 Activity log dicatat sebagai "UNAUTHORIZED_ACCESS"
- 🚨 Alert dikirim ke admin
- ⚠️ Risk level: HIGH

**Yang harus dilakukan developer:**
1. Register device dengan nama yang jelas
2. Tunggu approval dari admin
3. Baru bisa mulai bekerja

### 6. Device yang Sudah Diverifikasi (Authorized Device)

Setelah device di-approve admin:

**Status:** ✅ APPROVED

**Privileges:**
- ✅ Bisa commit ke repository
- ✅ Bisa push ke remote
- ✅ Bisa checkout branch
- ✅ Bisa pull update
- ✅ Semua operasi git diizinkan

**Monitoring:**
- Setiap aktivitas dicatat
- Device fingerprint diverifikasi setiap kali
- Lokasi repository dipantau
- Copy detection aktif

## Panduan Lengkap untuk Developer

### Langkah 1: Clone Repository

```bash
git clone <repository-url>
cd <repository-name>
```

### Langkah 2: Jalankan Setup

```bash
./setup_repo_protection.sh
```

Setup script akan menampilkan:
```
╔════════════════════════════════════════════════════════════╗
║     Repository Protection & Device Verification Setup     ║
╔════════════════════════════════════════════════════════════╗

Step 1/4: Checking prerequisites...
✓ Python 3 found

Step 2/4: Installing Git Hooks...
✓ Installed: post-checkout
✓ Installed: pre-commit
✓ Installed: pre-push
✓ Git hooks installed successfully

Step 3/4: Device Registration
Checking current device fingerprint...
Fingerprint: a1b2c3d4e5f6g7h8...
Hostname: developer-laptop
Platform: darwin

Do you need to register this device? (y/n):
```

### Langkah 3: Register Device

Ketika ditanya, jawab **y** dan masukkan nama device:

```
Do you need to register this device? (y/n): y
Enter device name (e.g., 'My Laptop'): Laptop John - MacBook Pro

Registering device 'Laptop John - MacBook Pro'...
✓ Device registered successfully
⚠ Status: PENDING - Waiting for administrator approval
```

### Langkah 4: Tunggu Approval Admin

**Status device: PENDING**

Sistem mengirim notifikasi ke admin:
- 📧 Email notification
- 🔔 Dashboard alert
- 💬 Slack message (jika dikonfigurasi)

**Yang terlihat admin di dashboard:**
```
New Device Registration Request
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User: john.doe@company.com
Device: Laptop John - MacBook Pro
Fingerprint: a1b2c3d4e5f6g7h8...
Hostname: developer-laptop
Platform: macOS (arm64)
Registered: 2024-01-15 10:30:00

[Approve] [Reject]
```

### Langkah 5: Mulai Bekerja

Setelah approved, developer bisa bekerja normal:

```bash
# Status device sekarang: APPROVED

# Bisa commit
git add .
git commit -m "feat: add new feature"
# ✓ Repository access verified

# Bisa push
git push origin main
# ✓ Device verification passed
# ✓ Repository verified
```

## Contoh Skenario

### ✅ Skenario 1: Developer Baru Join Tim

**Situasi:** Developer baru bernama Alice join tim

**Langkah:**
1. Alice clone repository
2. Jalankan `./setup_repo_protection.sh`
3. Register device dengan nama "Alice's Laptop"
4. Status: PENDING
5. Admin melihat request di dashboard
6. Admin approve device Alice
7. Status: APPROVED
8. Alice bisa mulai coding

**Timeline:**
- 10:00 - Clone repository
- 10:05 - Register device
- 10:10 - Admin approve
- 10:15 - Alice mulai commit pertama ✅

### ❌ Skenario 2: Unauthorized Device Access

**Situasi:** Bob copy repository ke USB, teman Bob paste di laptopnya

**Yang terjadi:**

**Di laptop teman Bob:**
```bash
# Coba commit
git commit -m "test"

🔍 Verifying repository access...
❌ Device not registered or not approved!

   This repository requires device registration.
```

**Sistem action:**
1. ❌ Commit ditolak
2. 📝 Log aktivitas: UNAUTHORIZED_ACCESS
3. 🚨 Alert ke admin: CRITICAL
4. 🔒 Repository di-encrypt (jika konfigurasi aktif)
5. 📧 Email ke admin dan Bob

**Log activity:**
```json
{
  "activityType": "UNAUTHORIZED_ACCESS",
  "timestamp": "2024-01-15T14:30:00Z",
  "user": "bob@company.com",
  "deviceFingerprint": "unknown-xyz789...",
  "repository": "project-repo",
  "riskLevel": "CRITICAL",
  "blocked": true
}
```

### ⚠️ Skenario 3: Device Status PENDING

**Situasi:** Carol register device tapi admin belum approve

**Yang terjadi:**

```bash
# Carol coba commit
git commit -m "fix: bug fix"

🔍 Verifying repository access...
❌ Device status is PENDING. Approval required.
```

**Pesan lengkap:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  DEVICE PENDING APPROVAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your device has been registered but is waiting
for administrator approval.

Device: Carol's MacBook
Status: PENDING
Registered: 2024-01-15 11:00:00

Please contact your administrator to expedite
the approval process.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Solusi:** Carol hubungi admin untuk proses approval

### 🔒 Skenario 4: Repository Copied ke USB

**Situasi:** David copy repository ke USB drive

**Deteksi sistem:**

```
┌────────────────────────────────────────┐
│     COPY DETECTION TRIGGERED           │
└────────────────────────────────────────┘

Original Location: /home/david/projects/repo
Detected Location: /media/usb-drive/repo

Device Last Access: 2024-01-15 10:00:00
Current Access:     2024-01-15 10:15:00
Time Difference:    15 minutes

⚠️ SUSPICIOUS: Same repository accessed from
   different locations in short time
```

**Sistem action:**
1. 🚨 Alert CRITICAL dibuat
2. 🔒 Repository di-encrypt otomatis
3. ❌ Access di-block
4. 📧 Notifikasi ke admin dan David
5. 📝 Activity log dicatat

**Di USB drive:**
```bash
# David coba buka repository di USB
cd /media/usb-drive/repo
git status

⚠️  SECURITY ALERT: UNAUTHORIZED REPOSITORY COPY DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Original Location: /home/david/projects/repo
📍 Current Location:  /media/usb-drive/repo

🔒 Action Taken: Repository has been encrypted and access blocked

💬 Message: Contact your administrator to restore access.
   This repository can only be used from its original location
   or from explicitly trusted paths.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**File yang tercipta:**
- `.repo-encrypted.lock` → Repository ter-encrypt
- `.repo-access-blocked` → Access di-block

## Monitoring dan Logging

### Activity Log

Setiap aktivitas dicatat:

**Authorized Access:**
```json
{
  "activityType": "REPO_ACCESS",
  "timestamp": "2024-01-15T10:00:00Z",
  "user": "developer@company.com",
  "device": {
    "id": "device-123",
    "name": "Developer Laptop",
    "fingerprint": "a1b2c3..."
  },
  "repository": "project-repo",
  "action": "COMMIT",
  "isSuspicious": false,
  "riskLevel": "LOW"
}
```

**Unauthorized Access:**
```json
{
  "activityType": "UNAUTHORIZED_ACCESS",
  "timestamp": "2024-01-15T10:30:00Z",
  "user": "developer@company.com",
  "deviceFingerprint": "unknown-xyz789...",
  "repository": "project-repo",
  "reason": "DEVICE_NOT_REGISTERED",
  "isSuspicious": true,
  "riskLevel": "CRITICAL",
  "blocked": true
}
```

### Alert System

**Alert dibuat otomatis untuk:**
- Device tidak terdaftar
- Device status bukan APPROVED
- Repository di-copy
- Repository di-move
- Access dari lokasi mencurigakan
- Multiple device access dalam waktu singkat

**Alert level:**
- 🔴 CRITICAL → Device tidak terdaftar, copy detected
- 🟡 WARNING → Device pending, unusual location
- 🔵 INFO → Device registered, normal activity

## Konfigurasi

### File .env

```env
# Backend API
API_URL=http://localhost:5000

# User Token (didapat dari login dashboard)
API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Repository ID
REPO_ID=project-repo-123

# Encryption Key (jangan dishare!)
ENCRYPTION_KEY=32-byte-random-encryption-key-here
```

### Trusted Paths (Admin)

Admin bisa set trusted paths untuk deployment:

```bash
# Tambah trusted path
curl -X POST http://localhost:5000/api/repository-protection/trusted-paths/add \
  -H "Authorization: Bearer admin-token" \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryId": "project-repo-123",
    "trustedPath": "/var/www/production"
  }'
```

**Use case:**
- Deployment server: `/var/www/production`
- Staging server: `/opt/staging`
- CI/CD pipeline: `/var/lib/jenkins/workspace`

## Command Reference

### Register Device

```bash
python3 monitoring-agent/repo_protection_agent.py register \
  --device-name "My Laptop" \
  --api-url "http://localhost:5000" \
  --token "your-jwt-token"
```

### Verify Device Access

```bash
python3 monitoring-agent/repo_protection_agent.py verify \
  --api-url "http://localhost:5000" \
  --token "your-jwt-token" \
  --repo-id "project-repo-123" \
  --repo-path "."
```

### Check Device Fingerprint

```bash
python3 -c "
import sys
sys.path.append('monitoring-agent')
from device_fingerprint import generate_device_fingerprint
info = generate_device_fingerprint()
print(f'Fingerprint: {info[\"fingerprint\"]}')
print(f'Hostname: {info[\"hostname\"]}')
print(f'Platform: {info[\"platform\"]}')
"
```

### Install Git Hooks

```bash
python3 monitoring-agent/install_git_hooks.py install --repo-path .
```

## Troubleshooting

### Problem: Git hooks tidak jalan

**Gejala:** Commit berhasil tanpa verifikasi

**Solusi:**
```bash
# Cek hooks terinstall
ls -la .git/hooks/

# Re-install hooks
python3 monitoring-agent/install_git_hooks.py install

# Atau jalankan setup ulang
./setup_repo_protection.sh
```

### Problem: Device registration gagal

**Gejala:** Error saat register device

**Solusi:**
1. Cek backend running: `curl http://localhost:5000/health`
2. Cek API_TOKEN valid di .env
3. Cek network connection
4. Cek backend logs untuk error

### Problem: Repository ter-encrypt

**Gejala:** File `.repo-encrypted.lock` ada

**Solusi:**
1. **JANGAN** delete file lock
2. Hubungi admin segera
3. Admin akan decrypt via dashboard
4. Kembalikan repo ke lokasi original jika di-move

### Problem: Clone success tapi tidak bisa commit

**Gejala:** Clone berhasil, tapi commit ditolak

**Solusi:**
1. Jalankan setup: `./setup_repo_protection.sh`
2. Register device
3. Tunggu approval admin
4. Baru bisa commit

## Best Practices

### ✅ Yang HARUS Dilakukan

1. **Register device sebelum mulai kerja**
   - Jangan skip langkah setup
   - Gunakan nama device yang jelas

2. **Tunggu approval dengan sabar**
   - Status PENDING itu normal
   - Hubungi admin jika lama

3. **Kerja dari lokasi original**
   - Jangan move repository
   - Jangan copy ke USB

4. **Jaga kredensial**
   - Jangan share API_TOKEN
   - Jangan commit .env file

### ❌ Yang TIDAK BOLEH Dilakukan

1. **Copy repository ke USB**
   - Akan trigger auto-encryption
   - Access akan di-block

2. **Share device credentials**
   - Setiap developer harus register sendiri
   - Fingerprint unik per device

3. **Bypass git hooks**
   - Jangan delete hooks
   - Jangan gunakan --no-verify

4. **Delete lock files**
   - .repo-encrypted.lock
   - .repo-access-blocked
   - Hubungi admin untuk handle

## Support

### Dokumentasi Terkait

- [DEVICE_VERIFICATION_ON_CLONE.md](DEVICE_VERIFICATION_ON_CLONE.md) - English guide
- [DEVICE_ID_VERIFICATION_GUIDE.md](DEVICE_ID_VERIFICATION_GUIDE.md) - Detailed guide
- [REPOSITORY_PROTECTION_SYSTEM.md](REPOSITORY_PROTECTION_SYSTEM.md) - System documentation
- [PANDUAN_VERIFIKASI_DEVICE_ID.md](PANDUAN_VERIFIKASI_DEVICE_ID.md) - Indonesian guide

### Kontak

- **Dashboard:** http://localhost:3000
- **API Health:** http://localhost:5000/health
- **Admin:** Contact your administrator
- **Issues:** Open ticket di repository

## Summary

**Validasi Device Developer** memastikan:

✅ Setiap developer WAJIB registrasi device sebelum akses repository
✅ Sistem membaca kredensial dan ID Device saat clone
✅ Sistem mengecek device terdaftar di dashboard
✅ Device ID tidak dikenal → Clone DITOLAK
✅ Device yang verified = Authorized Device (Trusted)

**Hasil:** Repository terlindungi dari unauthorized access
