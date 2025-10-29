# Device Verification on Repository Clone

## Overview

This repository implements a strict device verification system that ensures only authorized devices can access the codebase. **Every developer must register their device BEFORE they can work with the repository.**

## How It Works

### 1. Clone Process Flow

```
Developer clones repository
         ↓
Clone completes successfully
         ↓
Developer runs setup script
         ↓
Git hooks are installed
         ↓
Device ID is generated
         ↓
Device registration request sent
         ↓
Status: PENDING (waiting for admin approval)
         ↓
Admin reviews and approves device
         ↓
Status: APPROVED
         ↓
Developer can now commit/push
```

### 2. What Happens on Clone

When a developer clones this repository, the following occurs:

1. **Git clone completes** - Repository files are downloaded
2. **Setup required** - Developer must run `./setup_repo_protection.sh`
3. **Hooks installed** - Git hooks are configured automatically
4. **Device fingerprint created** - Unique device ID generated
5. **Registration request** - Device info sent to dashboard
6. **Approval needed** - Admin must approve the device

### 3. Device Verification on Every Git Operation

Once set up, the following operations trigger device verification:

- **git checkout** - Verifies device and checks for repository copy/move
- **git commit** - Verifies device is still approved
- **git push** - Verifies device and repository integrity

If verification fails, the operation is **blocked**.

## Setup Instructions

### For Developers (First Time)

#### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd <repository-name>
```

#### Step 2: Run Setup Script

```bash
./setup_repo_protection.sh
```

This script will:
- Install git hooks
- Generate your device fingerprint
- Prompt you to register your device
- Configure repository protection

#### Step 3: Register Your Device

When prompted by the setup script, provide:
- **Device name**: A friendly name for your device (e.g., "John's MacBook Pro")
- **API credentials**: Already configured in `.env` file

Example:
```bash
Do you need to register this device? (y/n): y
Enter device name (e.g., 'My Laptop'): John's MacBook Pro
```

#### Step 4: Wait for Approval

After registration:
1. Your device status will be **PENDING**
2. An administrator will review your request
3. You will be notified when approved
4. Only then can you commit/push to the repository

### For Administrators

#### Approving Devices

1. Log in to the dashboard
2. Navigate to **Devices** section
3. Find the pending device registration
4. Review device information:
   - User name and email
   - Device name
   - Device fingerprint
   - Registration timestamp
5. Click **Approve** or **Reject**

#### Device Management API

Approve a device via API:
```bash
curl -X PUT http://localhost:5000/api/devices/{device-id}/approve \
  -H "Authorization: Bearer {admin-token}" \
  -H "Content-Type: application/json" \
  -d '{"status": "APPROVED"}'
```

## Device Fingerprinting

### How Device ID is Generated

Each device is uniquely identified by:

```
Device Fingerprint = Hash(
  - MAC Address
  - Hostname
  - Platform (OS)
  - CPU Architecture
  - System Username
)
```

This creates a unique identifier that:
- Cannot be easily spoofed
- Changes if hardware changes
- Remains stable for same device

### What Data is Collected

The system collects:
- **Hostname**: Computer name
- **Platform**: Operating system (Linux, macOS, Windows)
- **Architecture**: CPU architecture (x64, arm64, etc.)
- **MAC Address** (hashed): Network interface identifier
- **Username**: System user

### Privacy

- MAC addresses are hashed before storage
- No personal data is collected beyond system info
- Data is only used for device verification

## Verification on Clone

### Post-Checkout Hook

After every `git checkout` (including after clone), the system:

1. **Detects new clone** by checking if previous HEAD was null
2. **Reads device credentials** from environment variables
3. **Generates device fingerprint**
4. **Checks device registration** against dashboard API
5. **Verifies device status** (must be APPROVED)
6. **Validates repository location** (copy detection)
7. **Blocks access** if any check fails

### Pre-Commit Hook

Before every commit:

1. **Verifies device is registered**
2. **Checks device status is APPROVED**
3. **Validates repository hasn't been moved**
4. **Blocks commit** if verification fails

### Pre-Push Hook

Before every push:

1. **Verifies repository integrity**
2. **Confirms device authorization**
3. **Checks for copy/move attempts**
4. **Blocks push** if unauthorized

## Access Denied Scenarios

### Scenario 1: Device Not Registered

**Error Message:**
```
❌ Device not registered or not approved!

   This repository requires device registration.
   Please register your device:

   python3 monitoring-agent/repo_protection_agent.py register --device-name "My Device"

   Then wait for administrator approval.
```

**Solution:**
1. Run the setup script: `./setup_repo_protection.sh`
2. Register your device when prompted
3. Wait for admin approval

### Scenario 2: Device Status PENDING

**Error Message:**
```
❌ Device status is PENDING. Approval required.
```

**Solution:**
- Wait for administrator to approve your device
- Contact your administrator to expedite approval
- Check dashboard for device status

### Scenario 3: Device Status REJECTED

**Error Message:**
```
❌ Device status is REJECTED. Access denied.
```

**Solution:**
- Contact your administrator
- Provide justification for access
- Register a different device if needed

### Scenario 4: Repository Copied or Moved

**Error Message:**
```
⚠️  SECURITY ALERT: UNAUTHORIZED REPOSITORY COPY DETECTED

📍 Original Location: /home/user/projects/project
📍 Current Location:  /media/usb/project

🔒 Action Taken: Repository has been encrypted and access blocked
```

**Solution:**
1. **Do not** use copied repositories
2. Clone fresh from original source
3. Work from original location only
4. Contact admin if you need to work from different location

## Configuration

### Environment Variables

Create or edit `.env` file in repository root:

```env
# Backend API URL
API_URL=http://localhost:5000

# Authentication Token (get from dashboard)
API_TOKEN=your-jwt-token-here

# Repository ID
REPO_ID=your-repo-id

# Encryption Key (do not share)
ENCRYPTION_KEY=your-32-byte-encryption-key
```

### Trusted Paths

Administrators can configure trusted paths where repositories can be moved without triggering protection:

```bash
# Add trusted path
curl -X POST http://localhost:5000/api/repository-protection/trusted-paths/add \
  -H "Authorization: Bearer admin-token" \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryId": "repo-id",
    "trustedPath": "/var/www/production"
  }'
```

## Manual Device Registration

If you prefer to register manually (outside the setup script):

```bash
# Navigate to monitoring agent directory
cd monitoring-agent

# Register device
python3 repo_protection_agent.py register \
  --device-name "My Device Name" \
  --api-url "http://localhost:5000" \
  --token "your-jwt-token"

# Check device fingerprint
python3 repo_protection_agent.py fingerprint
```

## Verification Commands

### Check Device Status

```bash
python3 monitoring-agent/repo_protection_agent.py verify \
  --api-url "$API_URL" \
  --token "$API_TOKEN" \
  --repo-id "$REPO_ID" \
  --repo-path "."
```

### Check Repository Status

```bash
python3 monitoring-agent/copy_detection_monitor.py \
  --api-url "$API_URL" \
  --token "$API_TOKEN" \
  --repo-id "$REPO_ID" \
  --repo-path "."
```

### Get Device Fingerprint

```bash
python3 -c "
import sys
sys.path.append('monitoring-agent')
from device_fingerprint import generate_device_fingerprint
info = generate_device_fingerprint()
for key, value in info.items():
    print(f'{key}: {value}')
"
```

## Security Features

### ✅ What is Protected

1. **Unauthorized Device Access**
   - Only registered devices can access
   - Admin approval required
   - Device fingerprinting prevents spoofing

2. **Repository Copying**
   - USB drives automatically detected and blocked
   - External locations flagged
   - Immediate encryption on unauthorized copy

3. **Repository Moving**
   - Location changes detected
   - Must be in trusted path
   - Unauthorized moves blocked

4. **Credential Sharing**
   - Each device has unique fingerprint
   - Cannot use another person's credentials
   - Multi-device abuse detected

### ❌ What is Blocked

- Cloning on unregistered devices
- Committing from unapproved devices
- Pushing from unauthorized locations
- Accessing copied repositories
- Using revoked devices

## Troubleshooting

### Setup Script Fails

**Problem:** `./setup_repo_protection.sh` fails

**Solutions:**
1. Ensure script is executable: `chmod +x setup_repo_protection.sh`
2. Check Python 3 is installed: `python3 --version`
3. Verify .env file exists and is configured
4. Check monitoring-agent directory exists

### Git Hooks Not Working

**Problem:** Commits succeed without verification

**Solutions:**
1. Re-run setup script: `./setup_repo_protection.sh`
2. Manually install hooks: `python3 monitoring-agent/install_git_hooks.py install`
3. Check hooks directory: `ls -la .git/hooks/`
4. Verify hooks are executable

### API Connection Failed

**Problem:** Cannot connect to backend API

**Solutions:**
1. Check backend is running: `curl http://localhost:5000/health`
2. Verify API_URL in .env is correct
3. Check network connectivity
4. Verify API_TOKEN is valid

### Device Registration Failed

**Problem:** Device registration returns error

**Solutions:**
1. Check API credentials in .env
2. Verify backend API is accessible
3. Check user token is valid (not expired)
4. Review backend logs for errors

### Repository is Encrypted

**Problem:** `.repo-encrypted.lock` file exists

**Solutions:**
1. Contact administrator immediately
2. Do NOT delete the lock file
3. Administrator will decrypt via dashboard
4. Return repository to original location if moved

## Best Practices

### For Developers

✅ **DO:**
- Register your device before working
- Wait for approval before committing
- Keep repository in original location
- Contact admin for location changes
- Report suspicious activities

❌ **DON'T:**
- Copy repository to USB drives
- Move repository without approval
- Share device credentials
- Delete protection lock files
- Bypass git hooks

### For Administrators

✅ **DO:**
- Review device registrations promptly
- Verify device owners before approval
- Set up trusted paths for deployments
- Monitor alerts regularly
- Maintain audit logs

❌ **DON'T:**
- Auto-approve all devices
- Ignore copy detection alerts
- Remove device without investigation
- Share admin credentials

## Support

### Getting Help

1. **Read Documentation**
   - DEVICE_ID_VERIFICATION_GUIDE.md
   - REPOSITORY_PROTECTION_SYSTEM.md
   - PANDUAN_VERIFIKASI_DEVICE_ID.md

2. **Check Status**
   - Dashboard: http://localhost:3000
   - API Health: http://localhost:5000/health

3. **Contact Admin**
   - For device approval issues
   - For access problems
   - For repository encryption issues

4. **Open Issue**
   - Report bugs
   - Request features
   - Get technical support

## Related Documentation

- [DEVICE_ID_VERIFICATION_GUIDE.md](DEVICE_ID_VERIFICATION_GUIDE.md) - Detailed verification guide
- [REPOSITORY_PROTECTION_SYSTEM.md](REPOSITORY_PROTECTION_SYSTEM.md) - Complete protection system
- [PANDUAN_VERIFIKASI_DEVICE_ID.md](PANDUAN_VERIFIKASI_DEVICE_ID.md) - Indonesian guide
- [TESTING_DEVICE_VERIFICATION.md](TESTING_DEVICE_VERIFICATION.md) - Testing procedures

## API Reference

### Device Registration

```http
POST /api/repository-protection/register-device
Authorization: Bearer {token}

{
  "deviceName": "My Laptop"
}
```

### Verify Access

```http
POST /api/repository-protection/verify-access
Authorization: Bearer {token}

{
  "repositoryId": "repo-id",
  "repositoryPath": "/path/to/repo"
}
```

### Get Device Fingerprint

```http
GET /api/repository-protection/device-fingerprint
Authorization: Bearer {token}
```

### Check Protection Status

```http
GET /api/repository-protection/status/{repositoryId}
Authorization: Bearer {token}
```

## Summary

This device verification system ensures:

1. ✅ **Only authorized devices** can clone and access repositories
2. ✅ **Every developer must register** their device before working
3. ✅ **Administrator approval** is required for all devices
4. ✅ **Device verification occurs** on clone, checkout, commit, and push
5. ✅ **Unauthorized access is blocked** and logged
6. ✅ **Copy detection** prevents unauthorized repository duplication
7. ✅ **Automatic encryption** protects against unauthorized access

**Result:** Complete repository security with device-level access control.
