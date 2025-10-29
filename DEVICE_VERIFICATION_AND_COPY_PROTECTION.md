# Device Verification and Copy Protection System

## Overview

Sistem keamanan repository yang mencegah unauthorized access dan copy detection dengan auto-encryption. Sistem ini memverifikasi device ID saat clone, mendeteksi copy attempts, dan otomatis mengenkripsi repository yang dicopy ke lokasi tidak diizinkan.

## 🔐 Fitur Utama

### 1. Device ID Verification on Clone
- Setiap kali repository di-clone, device ID diverifikasi
- Hanya device yang terdaftar di dashboard yang diizinkan
- Device yang tidak dikenal akan direject

### 2. Real-time Copy Detection
- Monitor repository location secara real-time
- Deteksi jika repository di-copy ke lokasi tidak authorized
- Alert muncul immediately saat copy terdeteksi

### 3. Automatic Encryption on Copy
- Repository otomatis ter-encrypt saat copy terdeteksi
- Access langsung di-block
- Alert dikirim ke dashboard

### 4. Trusted Paths (Jalur yang Diizinkan)
- Administrator bisa menambahkan trusted paths
- Repository di trusted paths tidak akan di-encrypt
- Flexible untuk development/deployment needs

## 🚀 Cara Kerja

### Alur 1: Clone Repository - Device Verification

```
Developer Clone Repository
          ↓
Git Hook Triggered (post-checkout)
          ↓
Device Fingerprint Generated
          ↓
Verify dengan Dashboard
          ↓
┌─────────────────────────┐
│ Device Registered?      │
└─────────────────────────┘
     ↓ NO          ↓ YES
     ↓             ↓
     ↓        Device Approved?
     ↓             ↓ NO         ↓ YES
     ↓             ↓            ↓
  REJECT      REJECT        ALLOW
  (Alert)     (Alert)       (Access Granted)
```

### Alur 2: Copy Detection dan Encryption

```
Repository Copied to USB/External Drive
          ↓
Copy Detection Monitor Active
          ↓
Check Current Location vs Original
          ↓
Location Match?
     ↓ NO              ↓ YES
     ↓                 ↓
Check Trusted Paths    Continue Normal
     ↓
In Trusted Path?
     ↓ NO              ↓ YES
     ↓                 ↓
COPY DETECTED!        Allow Access
     ↓
1. Show Alert (Console UI)
2. Send Alert to Dashboard
3. Encrypt Repository
4. Block All Access
```

## 📦 Instalasi

### 1. Install Monitoring Agent Dependencies

```bash
cd monitoring-agent
pip install -r requirements.txt
```

### 2. Install Git Hooks

```bash
# Install protection hooks
python3 monitoring-agent/install_git_hooks.py install

# This will install:
# - post-checkout: Verify device on clone/checkout
# - pre-commit: Verify before commit
# - pre-push: Verify before push
```

### 3. Configure Environment

Create `.env` file in repository root:

```env
API_URL=http://localhost:5000
API_TOKEN=your-jwt-token-here
REPO_ID=your-repository-id
```

### 4. Register Device

```bash
# First time setup - register your device
python3 monitoring-agent/repo_protection_agent.py register \
    --device-name "My Laptop" \
    --api-url "http://localhost:5000" \
    --token "your-jwt-token"

# Wait for admin approval in dashboard
```

## 🔧 Penggunaan

### Verify Repository Access

```bash
# One-time verification
python3 monitoring-agent/copy_detection_monitor.py \
    --api-url "http://localhost:5000" \
    --token "your-token" \
    --repo-id "repo-uuid" \
    --repo-path "."
```

### Continuous Monitoring

```bash
# Enable continuous copy detection monitoring
python3 monitoring-agent/copy_detection_monitor.py \
    --api-url "http://localhost:5000" \
    --token "your-token" \
    --repo-id "repo-uuid" \
    --repo-path "." \
    --watch
```

### Check Repository Status

```bash
# Check if repository is in trusted location
python3 monitoring-agent/repo_protection_agent.py status \
    --repo-path "."
```

## 🛡️ API Endpoints

### Device Verification

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
  "device": {
    "id": "device-uuid",
    "deviceName": "Developer Laptop",
    "status": "PENDING",
    "fingerprint": "abc123..."
  }
}
```

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
  "message": "Repository access authorized"
}

Response (Copy Detected):
{
  "allowed": false,
  "reason": "COPY_DETECTED",
  "message": "Repository copy detected. Access blocked and repository encrypted."
}
```

### Trusted Paths Management (Admin Only)

#### Add Trusted Path
```http
POST /api/repository-protection/trusted-paths/add
Authorization: Bearer {admin-token}

{
  "repositoryId": "repo-uuid",
  "trustedPath": "/home/user/development/projects"
}

Response:
{
  "success": true,
  "message": "Trusted path added",
  "trustedPaths": [
    "/home/user/development/projects"
  ]
}
```

#### Remove Trusted Path
```http
POST /api/repository-protection/trusted-paths/remove
Authorization: Bearer {admin-token}

{
  "repositoryId": "repo-uuid",
  "trustedPath": "/home/user/development/projects"
}
```

#### Get Trusted Paths
```http
GET /api/repository-protection/trusted-paths/{repositoryId}
Authorization: Bearer {token}

Response:
{
  "repositoryId": "repo-uuid",
  "repositoryName": "MyProject",
  "trustedPaths": [
    "/home/user/development/projects",
    "/var/www/production"
  ]
}
```

## 📱 Dashboard Integration

### View Alerts

Alerts ditampilkan di dashboard dengan informasi:
- Severity: CRITICAL
- Type: COPY_DETECTED
- Repository details
- Device information
- Timestamp
- Action taken (ENCRYPTED_AND_BLOCKED)

### Manage Trusted Paths

Administrator dapat:
1. View list of trusted paths per repository
2. Add new trusted path
3. Remove trusted path
4. View audit logs of path changes

## 🎯 Skenario Penggunaan

### Skenario 1: Developer Baru Clone Repository

**Langkah:**
1. Developer clone repository:
   ```bash
   git clone https://github.com/company/project.git
   cd project
   ```

2. Post-checkout hook triggered otomatis

3. Device verification diminta:
   ```
   🔍 Verifying device registration...
   ❌ Device not registered!
   
   Please register your device:
   python3 monitoring-agent/repo_protection_agent.py register
   ```

4. Developer register device:
   ```bash
   python3 monitoring-agent/repo_protection_agent.py register \
       --device-name "John's Laptop"
   ```

5. Status: PENDING - menunggu approval admin

6. Admin approve di dashboard

7. Developer bisa mulai bekerja

### Skenario 2: Unauthorized Copy (USB)

**Langkah:**
1. Developer A copy repository ke USB drive
2. Developer B paste ke laptop nya: `/media/usb/project`
3. Developer B coba access repository

**Yang Terjadi:**
```
🔍 Checking repository location...
   Repository: /media/usb/project
   Repository ID: project-123

⚠️  COPY DETECTED: UNAUTHORIZED_LOCATION

======================================================================
⚠️  SECURITY ALERT: UNAUTHORIZED REPOSITORY COPY DETECTED
======================================================================

📍 Original Location: /home/developer/projects/project
📍 Current Location:  /media/usb/project

🔒 Action Taken: Repository has been encrypted and access blocked

💬 Message: Contact your administrator to restore access.
   This repository can only be used from its original location
   or from explicitly trusted paths.
======================================================================

✓ Alert sent to dashboard
🔒 Repository encrypted and access blocked
   Reason: Unauthorized copy detected
   Original: /home/developer/projects/project
   Current: /media/usb/project
```

4. Dashboard menerima CRITICAL alert
5. Repository ter-encrypt dan access di-block
6. Developer tidak bisa commit/push

### Skenario 3: Trusted Path (Deployment Server)

**Setup:**
Admin menambahkan production server path sebagai trusted:

```bash
# Via API
curl -X POST http://localhost:5000/api/repository-protection/trusted-paths/add \
  -H "Authorization: Bearer admin-token" \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryId": "project-123",
    "trustedPath": "/var/www/production"
  }'
```

**Hasil:**
- Repository di `/var/www/production` tidak akan di-encrypt
- Deployment process berjalan normal
- Copy detection masih aktif untuk lokasi lain

### Skenario 4: Moving Repository Locally

**Langkah:**
1. Developer move repository dari `/home/user/dev/project` ke `/home/user/projects/project`

**Yang Terjadi:**
```
⚠️  COPY DETECTED: UNAUTHORIZED_LOCATION

🔒 Repository encrypted and access blocked
```

**Solusi:**
1. Admin bisa:
   - Decrypt repository
   - Add new location to trusted paths
   - Update repository metadata

2. Atau developer:
   - Clone fresh dari original location
   - Re-register if needed

## 🔒 Lock Files

### `.repo-encrypted.lock`

Created when repository is encrypted:

```json
{
  "encrypted": true,
  "timestamp": "2024-01-15T10:30:00Z",
  "reason": "UNAUTHORIZED_COPY_DETECTED",
  "message": "Repository has been encrypted due to unauthorized copy.",
  "original_location": "/home/user/projects/project",
  "detected_location": "/media/usb/project"
}
```

### `.repo-access-blocked`

Blocks all access to repository:

```json
{
  "blocked": true,
  "reason": "Unauthorized access detected",
  "timestamp": "2024-01-15T10:30:00Z",
  "message": "This repository has been blocked. Contact administrator."
}
```

### `.repo-metadata.json`

Stores repository metadata:

```json
{
  "repository_id": "project-123",
  "original_location": "/home/user/projects/project",
  "created_at": "2024-01-15T09:00:00Z",
  "device_fingerprint": "abc123...",
  "trusted_paths": [
    "/var/www/production",
    "/home/user/development"
  ]
}
```

## 🔧 Troubleshooting

### Device Not Registered

**Error:**
```
❌ Device not registered!
```

**Solution:**
```bash
python3 monitoring-agent/repo_protection_agent.py register \
    --device-name "My Device"
```

### Device Pending Approval

**Error:**
```
❌ Device status is PENDING. Approval required.
```

**Solution:**
Wait for admin to approve device in dashboard, or contact administrator.

### Repository Encrypted

**Error:**
```
✗ Repository is ENCRYPTED
  Message: Repository is encrypted. Contact administrator.
```

**Solution:**
1. Contact administrator
2. Admin decrypts via:
   ```bash
   curl -X POST http://localhost:5000/api/repository-protection/decrypt \
     -H "Authorization: Bearer admin-token" \
     -d '{"repositoryId": "...", "repositoryPath": "..."}'
   ```

### False Positive Copy Detection

If repository was legitimately moved:

1. Admin adds path to trusted paths
2. Admin decrypts repository
3. Developer can continue working

## 📊 Security Benefits

### ✅ Prevents

1. **Unauthorized Device Access**
   - Only registered devices can access
   - Admin approval required

2. **Repository Copying**
   - USB drives blocked
   - External devices blocked
   - Unauthorized locations blocked

3. **Data Theft**
   - Immediate encryption on copy
   - Access blocked instantly
   - Alerts sent to admin

4. **Insider Threats**
   - All activities logged
   - Device tracking
   - Location monitoring

### ✅ Allows

1. **Legitimate Development**
   - Trusted paths for servers
   - Multiple developer machines (with approval)
   - Normal git workflow

2. **Flexible Deployment**
   - Production servers in trusted paths
   - CI/CD pipelines supported
   - Staging environments

## 📝 Best Practices

1. **Always register devices first** before working
2. **Keep repository in original location** - don't move
3. **Don't copy to USB or external drives** - will trigger encryption
4. **Work from approved locations only**
5. **Contact admin** before moving repository
6. **Keep API token secure** - don't share
7. **Enable continuous monitoring** for critical projects
8. **Review alerts regularly** in dashboard

## 🔗 Related Documentation

- [REPOSITORY_PROTECTION_SYSTEM.md](REPOSITORY_PROTECTION_SYSTEM.md) - Complete protection system
- [SISTEM_PROTEKSI_REPOSITORY.md](SISTEM_PROTEKSI_REPOSITORY.md) - Indonesian version
- [README.md](README.md) - Main documentation

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review dashboard alerts
3. Contact your administrator
4. Check audit logs for details
