# Repository Protection System

## Overview

Sistem keamanan repository yang mencegah unauthorized access dan copy detection dengan auto-encryption.

## Fitur Utama

### 1. 🔐 Device Fingerprinting
- Generate unique fingerprint untuk setiap device
- Validasi device sebelum akses repository
- Track MAC address, hostname, CPU, OS info

### 2. 🛡️ Repository Integrity Check
- Monitor repository integrity
- Detect copy/clone attempts
- Package integrity validation

### 3. 🚨 Auto Encryption
- Encrypt repository saat unauthorized access
- Block access dengan lock file
- Alert system integration

### 4. 📦 Package Integrity
- Validate package.json (Node.js)
- Validate requirements.txt (Python)
- Prevent modified packages

---

## Alur Kerja

### 1. Clone Repository (Device Baru)
```
Developer Clone Repo
      ↓
Device ID Generated
      ↓
Credential Input (Login)
      ↓
Device Registered → Status: PENDING
      ↓
Admin Approve Device → Status: APPROVED
      ↓
Access Granted ✓
```

### 2. Access Repository (Device Terdaftar)
```
Developer Access Repo
      ↓
Check Device Fingerprint
      ↓
Validate Against Database
      ↓
Check Package Integrity
      ↓
Access Granted ✓
```

### 3. Unauthorized Access Detection
```
Access from Unknown Device
      ↓
Device Not Found/Not Approved
      ↓
Alert Created (CRITICAL)
      ↓
Auto Encrypt Repository
      ↓
Block Access
      ↓
Notify Admin
```

### 4. Copy Detection
```
Repository Accessed from Multiple Devices
      ↓
Check Time Difference
      ↓
If < 1 Hour → Suspicious
      ↓
Create Alert
      ↓
Encrypt Repository
      ↓
Block All Access
```

---

## API Endpoints

### Device Registration

#### Register Device
```http
POST /api/repository-protection/register-device
Authorization: Bearer {token}

{
  "deviceName": "Developer Laptop"
}

Response:
{
  "success": true,
  "message": "Device registered successfully",
  "device": {
    "id": "device-uuid",
    "deviceName": "Developer Laptop",
    "status": "PENDING",
    "fingerprint": "abc123..."
  }
}
```

#### Get Device Fingerprint
```http
GET /api/repository-protection/device-fingerprint
Authorization: Bearer {token}

Response:
{
  "fingerprint": "abc123...",
  "deviceInfo": {
    "hostname": "laptop-01",
    "platform": "darwin",
    "arch": "x64",
    "cpus": 8
  }
}
```

### Repository Access Verification

#### Verify Access
```http
POST /api/repository-protection/verify-access
Authorization: Bearer {token}

{
  "repositoryId": "repo-uuid",
  "repositoryPath": "/path/to/repo"
}

Response (Authorized):
{
  "allowed": true,
  "message": "Repository access authorized",
  "device": {
    "id": "device-uuid",
    "name": "Developer Laptop",
    "status": "APPROVED"
  }
}

Response (Unauthorized):
{
  "allowed": false,
  "reason": "DEVICE_NOT_APPROVED",
  "message": "Device status is PENDING. Approval required.",
  "action": "ENCRYPT_AND_BLOCK"
}
```

#### Check Integrity
```http
POST /api/repository-protection/check-integrity
Authorization: Bearer {token}

{
  "repositoryId": "repo-uuid",
  "repositoryPath": "/path/to/repo"
}

Response:
{
  "valid": true,
  "message": "Repository integrity verified",
  "currentHash": "def456...",
  "lastHash": "def456..."
}
```

#### Validate Device and Package
```http
POST /api/repository-protection/validate
Authorization: Bearer {token}

{
  "repositoryId": "repo-uuid",
  "repositoryPath": "/path/to/repo"
}

Response:
{
  "valid": true,
  "message": "Device and package integrity validated",
  "device": {
    "id": "device-uuid",
    "name": "Developer Laptop",
    "status": "APPROVED"
  },
  "package": {
    "valid": true,
    "type": "Node.js",
    "package": "my-app",
    "version": "1.0.0",
    "hash": "ghi789..."
  }
}
```

### Repository Protection Status

#### Get Protection Status
```http
GET /api/repository-protection/status/{repositoryId}
Authorization: Bearer {token}

Response:
{
  "repository": {
    "id": "repo-uuid",
    "name": "MyProject",
    "isEncrypted": false,
    "securityStatus": "SECURE",
    "encryptedAt": null
  },
  "suspiciousActivities": [
    {
      "id": "activity-uuid",
      "activityType": "UNAUTHORIZED_ACCESS",
      "timestamp": "2024-01-15T10:30:00Z",
      "user": {
        "email": "user@example.com"
      },
      "device": {
        "deviceName": "Unknown Device"
      }
    }
  ],
  "activeAlerts": [],
  "stats": {
    "totalSuspiciousActivities": 1,
    "totalActiveAlerts": 0
  }
}
```

### Admin Operations

#### Decrypt Repository
```http
POST /api/repository-protection/decrypt
Authorization: Bearer {admin-token}

{
  "repositoryId": "repo-uuid",
  "repositoryPath": "/path/to/repo"
}

Response:
{
  "success": true,
  "message": "Repository decrypted successfully"
}
```

#### Force Encrypt
```http
POST /api/repository-protection/force-encrypt
Authorization: Bearer {admin-token}

{
  "repositoryId": "repo-uuid",
  "repositoryPath": "/path/to/repo",
  "reason": "Security audit"
}

Response:
{
  "success": true,
  "message": "Repository encrypted and blocked successfully"
}
```

---

## Python Agent Usage

### Installation

```bash
cd monitoring-agent
chmod +x repo_protection_agent.py
```

### Register Device

```bash
# Set API credentials
export API_URL="http://localhost:5000"
export API_TOKEN="your-jwt-token"

# Register device
./repo_protection_agent.py register --device-name "My Laptop"
```

Output:
```
Registering device...
✓ Device registered: My Laptop
  Fingerprint: abc123def456...
  Status: PENDING

✓ Device registered successfully!
  Wait for admin approval before accessing repositories.
```

### Verify Repository Access

```bash
./repo_protection_agent.py verify \
  --repo-id "repo-uuid" \
  --repo-path "/path/to/repo"
```

Output (Success):
```
✓ Access authorized
```

Output (Denied):
```
✗ Access denied: Device status is PENDING
```

### Monitor Repository

```bash
./repo_protection_agent.py monitor \
  --repo-id "repo-uuid" \
  --repo-path "/path/to/repo"
```

Output:
```
Monitoring repository: /path/to/repo
Repository ID: repo-uuid
Verifying access...
✓ Access granted
Validating package integrity...
✓ Package type: Node.js
  Package: my-app v1.0.0
```

### Check Status

```bash
./repo_protection_agent.py status --repo-path "/path/to/repo"
```

Output:
```
Repository: /path/to/repo
Protected: False

Package Type: Node.js
Package: my-app v1.0.0
```

---

## Integration dengan Git Hooks

### Pre-commit Hook

Tambahkan validasi sebelum commit:

```bash
# .git/hooks/pre-commit
#!/bin/bash

echo "Checking repository protection..."

python3 monitoring-agent/repo_protection_agent.py verify \
  --repo-id "YOUR_REPO_ID" \
  --repo-path "."

if [ $? -ne 0 ]; then
  echo "✗ Repository access check failed!"
  echo "Contact administrator for assistance."
  exit 1
fi

echo "✓ Repository access verified"
exit 0
```

### Post-merge Hook

Validasi setelah merge:

```bash
# .git/hooks/post-merge
#!/bin/bash

python3 monitoring-agent/repo_protection_agent.py monitor \
  --repo-id "YOUR_REPO_ID" \
  --repo-path "."
```

---

## Skenario Penggunaan

### Skenario 1: Developer Baru

1. Developer clone repository
2. System detect device baru (fingerprint tidak terdaftar)
3. Developer register device:
   ```bash
   python3 repo_protection_agent.py register --device-name "Laptop John"
   ```
4. Device status: PENDING
5. Admin approve di dashboard
6. Device status: APPROVED
7. Developer bisa akses repository

### Skenario 2: Unauthorized Copy

1. Developer A copy repository ke USB
2. Developer B paste repository di laptop nya
3. Developer B coba akses repository
4. System detect:
   - Device fingerprint tidak match
   - Repository accessed from different device dalam waktu singkat
5. System action:
   - Create CRITICAL alert
   - Encrypt repository
   - Block access
   - Notify admin
6. Di laptop Developer B muncul:
   ```
   ✗ Repository is ENCRYPTED
     Message: Repository is encrypted. Contact administrator.
   ```

### Skenario 3: Package Modified

1. Developer modify package.json
2. Git hooks trigger pre-commit check
3. System validate package integrity:
   ```bash
   ./repo_protection_agent.py verify --repo-id "repo-123"
   ```
4. Package hash tidak match
5. System create alert (severity: WARNING)
6. Admin notified untuk review changes

### Skenario 4: Device Fingerprint Changed

1. Developer upgrade hardware (new MAC address)
2. Access repository
3. System detect fingerprint mismatch
4. Access denied dengan message:
   ```
   Device fingerprint changed. Please re-register your device.
   ```
5. Developer register ulang device
6. Wait for admin approval

---

## Lock Files

### Encryption Lock

File: `.repo-encrypted.lock`

```json
{
  "encrypted": true,
  "timestamp": "2024-01-15T10:30:00Z",
  "algorithm": "aes-256-gcm",
  "files": []
}
```

Ketika file ini ada, repository tidak bisa diakses.

### Access Block

File: `.repo-access-blocked`

```json
{
  "blocked": true,
  "reason": "Unauthorized access detected",
  "timestamp": "2024-01-15T10:30:00Z",
  "message": "This repository has been blocked due to security violation. Contact administrator."
}
```

---

## Admin Dashboard

### Approve Device

1. Login sebagai Admin
2. Buka "Devices" page
3. Lihat devices dengan status PENDING
4. Click "Approve" button
5. Device status berubah jadi APPROVED

### Decrypt Repository

1. Login sebagai Admin
2. Buka "Repositories" page
3. Lihat repository dengan status ENCRYPTED
4. Click "Decrypt" button
5. Confirm action
6. Repository status berubah jadi SECURE

### View Protection Logs

```bash
curl -X GET "http://localhost:5000/api/repository-protection/status/repo-123" \
  -H "Authorization: Bearer {admin-token}"
```

---

## Environment Variables

```env
# Encryption key (32 characters minimum)
ENCRYPTION_KEY=your-32-byte-encryption-key-here

# For Python agent
API_URL=http://localhost:5000
API_TOKEN=your-jwt-token
```

---

## Security Best Practices

1. **Device Registration**
   - Always register devices sebelum clone repository
   - Use descriptive device names
   - Regular device audit

2. **Package Integrity**
   - Don't modify package files without approval
   - Use git hooks untuk validasi
   - Review package changes carefully

3. **Access Monitoring**
   - Monitor suspicious activities
   - Quick response to alerts
   - Regular security audits

4. **Encryption Keys**
   - Use strong encryption keys (32+ chars)
   - Store keys securely
   - Rotate keys periodically
   - Never commit keys to repository

5. **Admin Actions**
   - Document all decrypt operations
   - Verify reason before approving devices
   - Regular review of access logs

---

## Troubleshooting

### Device Not Approved

**Problem**: Access denied, device status PENDING

**Solution**:
1. Wait for admin approval
2. Contact admin if urgent
3. Check device registration email

### Repository Encrypted

**Problem**: Repository access blocked, encrypted lock file exists

**Solution**:
1. Contact administrator
2. Provide repository ID and reason
3. Admin will decrypt after verification
4. Never try to remove lock file manually

### Package Integrity Failed

**Problem**: Package validation failed

**Solution**:
1. Check if package.json was modified
2. Restore from git if unauthorized change
3. Get approval for legitimate changes
4. Re-run validation after fix

### Fingerprint Mismatch

**Problem**: Device fingerprint changed

**Solution**:
1. Hardware change detected
2. Re-register device with new fingerprint
3. Wait for admin approval
4. Old device will be marked as inactive

---

## Testing

### Test Device Registration

```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Register device
cd monitoring-agent
python3 repo_protection_agent.py register --device-name "Test Device"
```

### Test Access Verification

```bash
# Create test repository
mkdir test-repo
cd test-repo
git init

# Verify access
python3 ../monitoring-agent/repo_protection_agent.py verify \
  --repo-id "test-repo-123" \
  --repo-path "."
```

### Test Encryption

```bash
# Force encrypt repository (as admin)
curl -X POST http://localhost:5000/api/repository-protection/force-encrypt \
  -H "Authorization: Bearer {admin-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryId": "test-repo-123",
    "repositoryPath": "/path/to/test-repo",
    "reason": "Test encryption"
  }'

# Check if lock file created
ls -la test-repo/.repo-encrypted.lock
```

---

## Conclusion

Sistem Repository Protection menyediakan:

✅ Device-based access control
✅ Automatic copy detection
✅ Auto-encryption on unauthorized access
✅ Package integrity validation
✅ Comprehensive audit trail
✅ Admin controls for decryption
✅ Real-time alerts

**Security Status: PRODUCTION READY** 🛡️
