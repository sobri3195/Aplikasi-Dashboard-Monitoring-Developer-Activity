# 🛡️ SISTEM PROTEKSI REPOSITORY

## Status: ✅ SELESAI & SIAP DIGUNAKAN

---

## 📋 Ringkasan

Sistem keamanan repository yang mencegah clone/copy tidak sah dengan auto-encryption dan device fingerprinting.

---

## 🎯 Fitur Utama

### 1. Device Fingerprinting
- **Fungsi**: Generate ID unik untuk setiap laptop/PC
- **Data**: MAC address, hostname, CPU info, OS
- **Validasi**: Check apakah device terdaftar sebelum akses

### 2. Device Registration & Approval
- **Register**: Developer register device baru
- **Pending**: Device menunggu approval admin
- **Approved**: Device boleh akses repository
- **Rejected**: Device ditolak, tidak bisa akses

### 3. Copy Detection
- **Monitor**: Track repository di-akses dari device mana
- **Alert**: Jika akses dari multiple devices dalam waktu singkat
- **Action**: Automatic encryption + block access

### 4. Auto Encryption
- **Trigger**: Unauthorized access terdeteksi
- **Action**: Repository langsung di-encrypt
- **Lock**: Create lock file, block semua akses
- **Decrypt**: Hanya admin yang bisa decrypt

### 5. Package Integrity Check
- **Validate**: Check package.json, requirements.txt, dll
- **Hash**: Compare hash untuk detect perubahan
- **Alert**: Warning jika package dimodifikasi

---

## 🔄 Alur Kerja Lengkap

### Scenario A: Developer Baru (First Time)

```
STEP 1: Clone Repository
└─> Git clone <repo-url>
    └─> Repository downloaded

STEP 2: Access Repository
└─> System check device fingerprint
    └─> Fingerprint: TIDAK DITEMUKAN
        └─> Access: DITOLAK ❌

STEP 3: Register Device
└─> python3 repo_protection_agent.py register
    └─> Input: Device Name
    └─> Generate fingerprint
    └─> Send to backend
    └─> Status: PENDING ⏳
    └─> Message: "Wait for admin approval"

STEP 4: Admin Approval
└─> Admin login dashboard
    └─> Menu "Devices" → "Pending Devices"
    └─> Review device info:
        - Device name
        - Hostname
        - User email
        - Fingerprint
    └─> Click "Approve" ✓
    └─> Status: APPROVED ✅

STEP 5: Access Repository (After Approval)
└─> python3 repo_protection_agent.py verify
    └─> Check fingerprint
    └─> Fingerprint: DITEMUKAN
    └─> Status: APPROVED
    └─> Package integrity: OK
    └─> Access: GRANTED ✅
```

---

### Scenario B: Clone ke Device Lain (Unauthorized)

```
STEP 1: Developer A Copy Repository
└─> Copy folder repository ke USB
    └─> Files copied ✓

STEP 2: Developer B Paste & Access
└─> Paste dari USB ke laptop
    └─> Try to access repository
    └─> System check fingerprint
    └─> Fingerprint: TIDAK COCOK ❌

STEP 3: System Detection
└─> Compare fingerprints:
    - Expected: abc123... (Device A)
    - Actual: def456... (Device B)
    └─> Mismatch detected!

STEP 4: Check Repository Access History
└─> Query database:
    - Last access: Device A, 5 minutes ago
    - Current access: Device B, now
    └─> Time difference: < 1 hour
    └─> COPY DETECTION! 🚨

STEP 5: Automatic Protection
└─> Create alert:
    - Type: REPO_COPY_DETECTED
    - Severity: CRITICAL
    - Message: "Repository copied to unauthorized device"
    
└─> Encrypt repository:
    - Create .repo-encrypted.lock
    - Algorithm: AES-256
    - Status: ENCRYPTED
    
└─> Block access:
    - Create .repo-access-blocked
    - Message: "Contact administrator"
    
└─> Notify:
    - Send email to admin
    - Dashboard notification
    - Slack alert (if enabled)

STEP 6: User Experience
└─> Developer B sees:
    ✗ Repository is ENCRYPTED
    Message: This repository is encrypted due to security violation.
    Contact administrator to decrypt.
```

---

### Scenario C: Package Modified

```
STEP 1: Developer Edit package.json
└─> Change dependency version
└─> Git add package.json

STEP 2: Git Pre-commit Hook
└─> Trigger: repo_protection_agent.py verify
    └─> Check device: OK ✓
    └─> Check package integrity:
        - Calculate new hash
        - Compare with stored hash
        - Hashes: TIDAK MATCH ❌

STEP 3: System Response
└─> Create alert:
    - Type: PACKAGE_MODIFIED
    - Severity: WARNING
    - Details: package.json changed
    
└─> Options:
    A. Abort commit → Fix changes
    B. Continue with warning → Admin review
    
└─> Notify admin for review

STEP 4: Admin Review
└─> Admin checks:
    - What changed?
    - Who changed it?
    - Is it legitimate?
    
└─> Action:
    - Approve: Update hash, allow
    - Reject: Revert changes
```

---

## 🔧 Implementasi

### Backend Services (3 files)

1. **deviceFingerprintService.js**
   - Generate device fingerprint
   - Validate fingerprint
   - Detect fingerprint changes
   - Register new devices

2. **repositoryIntegrityService.js**
   - Generate repository hash
   - Verify repository integrity
   - Detect copy attempts
   - Handle unauthorized access

3. **repositoryProtectionService.js**
   - Encrypt/decrypt repositories
   - Block/unblock access
   - Validate package integrity
   - Check repository access

### Controller & Routes

1. **repositoryProtectionController.js**
   - 8 API endpoints
   - Device registration
   - Access verification
   - Integrity checking
   - Admin operations

2. **repositoryProtectionRoutes.js**
   - Route definitions
   - Authentication
   - Authorization (Admin routes)

### Python Agent

**repo_protection_agent.py**
- Command-line tool
- Commands:
  - `register` - Register device
  - `verify` - Verify access
  - `monitor` - Monitor repository
  - `status` - Check status

---

## 📡 API Endpoints

### Public Endpoints (Require Auth)

```
POST /api/repository-protection/register-device
GET  /api/repository-protection/device-fingerprint
POST /api/repository-protection/verify-access
POST /api/repository-protection/check-integrity
POST /api/repository-protection/validate
GET  /api/repository-protection/status/:repositoryId
```

### Admin Endpoints (Require Admin Role)

```
POST /api/repository-protection/decrypt
POST /api/repository-protection/force-encrypt
```

---

## 💻 Cara Penggunaan

### Setup Awal

```bash
# 1. Backend sudah running
cd backend
npm start

# 2. Set API credentials
export API_URL="http://localhost:5000"
export API_TOKEN="your-jwt-token"

# 3. Register device
cd monitoring-agent
python3 repo_protection_agent.py register --device-name "Laptop Saya"
```

### Setiap Kali Akses Repository

```bash
# Option 1: Manual check
python3 repo_protection_agent.py verify \
  --repo-id "repo-123" \
  --repo-path "."

# Option 2: Auto check via Git hooks
# (Setup once, runs automatically)
```

### Admin Operations

```bash
# Approve device (via dashboard)
# 1. Login as admin
# 2. Go to Devices page
# 3. Click Approve on pending device

# Decrypt repository (via API)
curl -X POST http://localhost:5000/api/repository-protection/decrypt \
  -H "Authorization: Bearer {admin-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryId": "repo-123",
    "repositoryPath": "/path/to/repo"
  }'
```

---

## 🔒 Lock Files

### 1. Encryption Lock
**File**: `.repo-encrypted.lock`

```json
{
  "encrypted": true,
  "timestamp": "2024-01-15T10:30:00Z",
  "algorithm": "aes-256-gcm",
  "reason": "UNAUTHORIZED_ACCESS"
}
```

**Effect**: Repository tidak bisa diakses sama sekali

### 2. Access Block
**File**: `.repo-access-blocked`

```json
{
  "blocked": true,
  "reason": "Copy detected",
  "timestamp": "2024-01-15T10:30:00Z",
  "message": "Contact administrator"
}
```

**Effect**: Block semua git operations

---

## ⚙️ Git Hooks Integration

### Pre-commit Hook

```bash
# File: .git/hooks/pre-commit
#!/bin/bash

python3 monitoring-agent/repo_protection_agent.py verify \
  --repo-id "YOUR_REPO_ID" \
  --repo-path "." \
  --token "$API_TOKEN"

if [ $? -ne 0 ]; then
  echo "❌ Access verification failed!"
  exit 1
fi

echo "✅ Access verified"
exit 0
```

### Pre-push Hook

```bash
# File: .git/hooks/pre-push
#!/bin/bash

python3 monitoring-agent/repo_protection_agent.py monitor \
  --repo-id "YOUR_REPO_ID" \
  --repo-path "." \
  --token "$API_TOKEN"
```

---

## 📊 Database Schema

Tidak ada perubahan schema database yang diperlukan. Menggunakan model yang sudah ada:

- **Device**: Track registered devices
- **Activity**: Log access attempts
- **Alert**: Security alerts
- **Repository**: Repository status
- **AuditLog**: Admin actions

---

## 🎯 Testing

### Test 1: Register Device

```bash
cd monitoring-agent

# Test registration
python3 repo_protection_agent.py register \
  --api-url http://localhost:5000 \
  --token "your-token" \
  --device-name "Test Device"

# Expected output:
# ✓ Device registered: Test Device
#   Fingerprint: abc123...
#   Status: PENDING
```

### Test 2: Verify Access (Before Approval)

```bash
# Try to verify access
python3 repo_protection_agent.py verify \
  --repo-id "test-123" \
  --repo-path "."

# Expected output:
# ✗ Access denied: Device status is PENDING
```

### Test 3: Admin Approve (via API)

```bash
# Get device ID from registration response
DEVICE_ID="device-uuid"

# Approve device
curl -X PUT http://localhost:5000/api/devices/${DEVICE_ID}/approve \
  -H "Authorization: Bearer {admin-token}"

# Expected response:
# { "success": true, "status": "APPROVED" }
```

### Test 4: Verify Access (After Approval)

```bash
# Try again
python3 repo_protection_agent.py verify \
  --repo-id "test-123" \
  --repo-path "."

# Expected output:
# ✓ Access authorized
```

### Test 5: Copy Detection

```bash
# Simulate copy to another device
# (Run on different machine with different fingerprint)

python3 repo_protection_agent.py verify \
  --repo-id "test-123" \
  --repo-path "."

# Expected output:
# ✗ Access denied: Device not registered
# (Repository will be encrypted automatically)
```

---

## 📁 File Structure

```
backend/
├── src/
│   ├── services/
│   │   ├── deviceFingerprintService.js       ← NEW
│   │   ├── repositoryIntegrityService.js     ← NEW
│   │   └── repositoryProtectionService.js    ← NEW
│   ├── controllers/
│   │   └── repositoryProtectionController.js ← NEW
│   └── routes/
│       └── repositoryProtectionRoutes.js     ← NEW

monitoring-agent/
└── repo_protection_agent.py                  ← NEW

Documentation/
├── REPOSITORY_PROTECTION_SYSTEM.md           ← NEW (English)
└── SISTEM_PROTEKSI_REPOSITORY.md            ← NEW (Bahasa Indonesia)
```

---

## ✅ Checklist Implementasi

### Backend
- [x] Device fingerprinting service
- [x] Repository integrity service
- [x] Repository protection service
- [x] Controller dengan 8 endpoints
- [x] Routes dengan auth/authorization
- [x] Register routes di main router

### Python Agent
- [x] Command-line interface
- [x] Device registration
- [x] Access verification
- [x] Repository monitoring
- [x] Lock file detection

### Documentation
- [x] English documentation
- [x] Indonesian documentation
- [x] API reference
- [x] Usage examples
- [x] Testing guide

---

## 🚀 Status

**✅ SEMUA FITUR PROTEKSI SUDAH SELESAI**

Total penambahan:
- 3 Backend services
- 1 Controller (8 endpoints)
- 1 Routes file
- 1 Python agent
- 2 Documentation files

**Sistem SIAP DIGUNAKAN untuk production!** 🎉

---

## 📞 Support

Jika ada masalah:

1. Check device registration status
2. Verify API token valid
3. Check backend logs
4. Contact administrator

---

## 🎊 Kesimpulan

Sistem Repository Protection menyediakan:

✅ **Device-based access control**
✅ **Automatic copy detection**
✅ **Auto-encryption pada unauthorized access**
✅ **Package integrity validation**
✅ **Real-time alerts**
✅ **Admin controls**
✅ **Python CLI agent**
✅ **Git hooks integration**

**KEAMANAN REPOSITORY TERJAMIN!** 🛡️🔒
