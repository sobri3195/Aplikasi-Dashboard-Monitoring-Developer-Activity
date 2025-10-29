# Device ID Verification and Copy/Move Protection Guide

## Overview

This guide explains how the Device ID Verification and Copy/Move Protection system works to secure your repositories.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Git Clone/Checkout                       │
│                            ↓                                  │
│              ┌──────────────────────┐                        │
│              │  post-checkout hook  │                        │
│              └──────────────────────┘                        │
│                            ↓                                  │
│              ┌──────────────────────┐                        │
│              │ Device Verification  │                        │
│              └──────────────────────┘                        │
│                            ↓                                  │
│         ┌──────────────────────────────────┐                │
│         │  Check Device in Dashboard       │                │
│         │  - Registered?                    │                │
│         │  - Approved?                      │                │
│         └──────────────────────────────────┘                │
│                    ↓ NO           ↓ YES                      │
│                    ↓               ↓                          │
│              ┌─────────┐    ┌──────────┐                    │
│              │ REJECT  │    │  ALLOW   │                    │
│              │ Access  │    │  Access  │                    │
│              └─────────┘    └──────────┘                    │
│                                    ↓                          │
│                    ┌───────────────────────────┐            │
│                    │  Copy/Move Detection      │            │
│                    │  Monitor location changes │            │
│                    └───────────────────────────┘            │
│                                    ↓                          │
│                ┌────────────────────────────┐               │
│                │  Location Changed?         │               │
│                │  Not in trusted path?      │               │
│                └────────────────────────────┘               │
│                    ↓ YES            ↓ NO                     │
│                    ↓                ↓                         │
│            ┌──────────────┐   ┌─────────┐                  │
│            │ PROTECT:      │   │ Allow   │                  │
│            │ - Alert       │   │ Continue│                  │
│            │ - Encrypt     │   └─────────┘                  │
│            │ - Block       │                                 │
│            └──────────────┘                                 │
└─────────────────────────────────────────────────────────────┘
```

## Flow 1: Device Verification on Clone

### What Happens When You Clone

1. **User clones repository**
   ```bash
   git clone https://github.com/company/project.git
   cd project
   ```

2. **Post-checkout hook automatically triggers**
   - Detects new clone (previous HEAD is all zeros)
   - Generates device fingerprint
   - Checks device registration with backend

3. **Device Check**
   ```
   IF device is NOT registered:
      → Show error message
      → Provide registration instructions
      → BLOCK access
   
   IF device is registered but NOT approved:
      → Show "waiting for approval" message
      → BLOCK access
   
   IF device is registered AND approved:
      → Allow access
      → Save repository metadata
      → Continue normally
   ```

### Device Registration Process

1. **Register your device**
   ```bash
   python3 monitoring-agent/repo_protection_agent.py register \
       --device-name "My Laptop" \
       --api-url "http://localhost:5000" \
       --token "your-jwt-token"
   ```

2. **Device fingerprint generated**
   - Hostname
   - Platform (OS)
   - Architecture
   - MAC address hash
   - Creates unique device ID

3. **Status: PENDING**
   - Device registered but needs approval
   - Cannot access repository yet

4. **Admin approves in dashboard**
   - Reviews device details
   - Approves or rejects

5. **Status: APPROVED**
   - Can now access repository
   - All git operations allowed

## Flow 2: Copy/Move Detection

### What Triggers Detection

The system detects when:

1. **Repository copied to different location**
   ```
   Original: /home/user/projects/repo
   Copied:   /media/usb/repo  ← DETECTED!
   ```

2. **Repository moved to different location**
   ```
   Original: /home/user/projects/repo
   Moved:    /home/user/other-folder/repo  ← DETECTED!
   ```

3. **Repository accessed from multiple devices in short time**
   ```
   Device A accesses at 10:00 AM
   Device B accesses at 10:15 AM  ← SUSPICIOUS!
   ```

### Protection Actions

When copy/move is detected:

```
1. IMMEDIATE ALERT
   → Console warning shown
   → Alert sent to dashboard
   → Email notification to admin

2. AUTOMATIC ENCRYPTION
   → Creates .repo-encrypted.lock file
   → Marks repository as encrypted
   → Prevents access to files

3. ACCESS BLOCK
   → Creates .repo-access-blocked file
   → Blocks all git operations
   → Prevents commits/pushes

4. LOGGING
   → Creates activity log
   → Records device details
   → Stores location information
```

### What User Sees

```
⚠️  SECURITY ALERT: UNAUTHORIZED REPOSITORY COPY DETECTED
======================================================================

📍 Original Location: /home/user/projects/project
📍 Current Location:  /media/usb/project

🔒 Action Taken: Repository has been encrypted and access blocked

💬 Message: Contact your administrator to restore access.
   This repository can only be used from its original location
   or from explicitly trusted paths.
======================================================================

✗ Repository is ENCRYPTED
  Message: Repository is encrypted. Contact administrator.
```

## Trusted Paths

Administrators can configure trusted paths where repositories can be moved without triggering protection.

### Use Cases for Trusted Paths

1. **Deployment servers**
   ```
   /var/www/production
   /opt/deployments
   ```

2. **Development environments**
   ```
   /home/user/development
   /projects/staging
   ```

3. **CI/CD pipelines**
   ```
   /var/lib/jenkins/workspace
   /github-runners/work
   ```

### Managing Trusted Paths

**Add trusted path (Admin only):**
```bash
curl -X POST http://localhost:5000/api/repository-protection/trusted-paths/add \
  -H "Authorization: Bearer admin-token" \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryId": "repo-uuid",
    "trustedPath": "/var/www/production"
  }'
```

**Remove trusted path (Admin only):**
```bash
curl -X POST http://localhost:5000/api/repository-protection/trusted-paths/remove \
  -H "Authorization: Bearer admin-token" \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryId": "repo-uuid",
    "trustedPath": "/var/www/production"
  }'
```

**Get trusted paths:**
```bash
curl -X GET http://localhost:5000/api/repository-protection/trusted-paths/{repo-uuid} \
  -H "Authorization: Bearer token"
```

## Git Hooks Implementation

### post-checkout Hook

Triggers on:
- `git clone` (after clone completes)
- `git checkout` (when switching branches)

Does:
1. Detects if this is a new clone
2. Verifies device registration
3. Checks repository location
4. Validates against trusted paths
5. Blocks access if unauthorized

### pre-commit Hook

Triggers on:
- `git commit` (before commit is created)

Does:
1. Verifies device is still approved
2. Checks repository hasn't been moved
3. Validates access is still authorized
4. Blocks commit if any check fails

### pre-push Hook

Triggers on:
- `git push` (before pushing to remote)

Does:
1. Verifies repository integrity
2. Confirms device authorization
3. Checks for copy/move attempts
4. Blocks push if unauthorized

## Repository Metadata

The system maintains metadata about each repository:

**`.repo-metadata.json`** (Created on first access)
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

**`.repo-encrypted.lock`** (Created when encrypted)
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

**`.repo-access-blocked`** (Created when blocked)
```json
{
  "blocked": true,
  "reason": "Unauthorized access detected",
  "timestamp": "2024-01-15T10:30:00Z",
  "message": "This repository has been blocked. Contact administrator."
}
```

## Scenarios

### Scenario 1: New Developer Clones Repository

**Steps:**
1. Developer clones repository
2. Post-checkout hook runs
3. Device not registered → Access denied
4. Developer registers device
5. Status: PENDING → Waits for approval
6. Admin approves device
7. Developer can now work

### Scenario 2: Developer Copies to USB

**Steps:**
1. Developer copies repo to USB drive
2. Another person pastes on their laptop
3. They try to access/commit
4. Copy detection triggers
5. Repository encrypted immediately
6. Access blocked
7. Alert sent to dashboard
8. Cannot proceed without admin intervention

### Scenario 3: Legitimate Move to Deployment Server

**Steps:**
1. Admin adds deployment path to trusted paths
2. Repository deployed to `/var/www/production`
3. Copy detection checks location
4. Location is in trusted paths → Allowed
5. Deployment continues normally

### Scenario 4: Device Approval Revoked

**Steps:**
1. Admin revokes device approval
2. Developer tries to commit
3. Pre-commit hook checks device status
4. Status is not APPROVED → Blocked
5. Commit fails
6. Developer must contact admin

## Security Benefits

### ✅ Prevents

1. **Unauthorized Device Access**
   - Only registered devices can access
   - Admin approval required
   - Device fingerprinting ensures identity

2. **Repository Copying**
   - USB drives automatically blocked
   - External locations detected
   - Immediate encryption on copy

3. **Repository Moving**
   - Location changes detected
   - Must be in trusted path
   - Unauthorized moves blocked

4. **Data Theft**
   - Copies cannot be used
   - Encrypted if unauthorized
   - Access trails logged

5. **Multi-Device Abuse**
   - Concurrent access from multiple devices flagged
   - Suspicious timing patterns detected
   - Alerts generated for review

## Troubleshooting

### "Device not registered"

**Fix:**
```bash
python3 monitoring-agent/repo_protection_agent.py register \
    --device-name "My Device"
```

### "Device status is PENDING"

**Fix:**
- Wait for admin approval
- Contact administrator
- Check dashboard for device status

### "Repository is encrypted"

**Fix:**
1. Contact administrator
2. Admin decrypts via dashboard or API
3. Return to original location if needed

### "Repository location verification failed"

**Reasons:**
- Repository was moved
- Repository was copied
- Not in original location or trusted path

**Fix:**
1. Move back to original location, OR
2. Have admin add current path to trusted paths, OR
3. Clone fresh from original source

## API Endpoints

### Device Registration
```
POST /api/repository-protection/register-device
Authorization: Bearer {token}
Body: { "deviceName": "My Laptop" }
```

### Verify Access
```
POST /api/repository-protection/verify-access
Authorization: Bearer {token}
Body: {
  "repositoryId": "uuid",
  "repositoryPath": "/path/to/repo"
}
```

### Add Trusted Path (Admin)
```
POST /api/repository-protection/trusted-paths/add
Authorization: Bearer {admin-token}
Body: {
  "repositoryId": "uuid",
  "trustedPath": "/path/to/trust"
}
```

### Decrypt Repository (Admin)
```
POST /api/repository-protection/decrypt
Authorization: Bearer {admin-token}
Body: {
  "repositoryId": "uuid",
  "repositoryPath": "/path/to/repo"
}
```

## Best Practices

### For Developers

1. ✅ Register your device before cloning
2. ✅ Wait for approval before working
3. ✅ Keep repository in original location
4. ✅ Don't copy to USB or external drives
5. ✅ Contact admin if you need to move repository

### For Administrators

1. ✅ Review device registrations promptly
2. ✅ Set up trusted paths for deployments
3. ✅ Monitor alerts for suspicious activity
4. ✅ Investigate copy detection alerts
5. ✅ Maintain audit logs

### For DevOps

1. ✅ Add deployment paths to trusted paths
2. ✅ Use service accounts for CI/CD
3. ✅ Register CI/CD runners as devices
4. ✅ Monitor automated processes
5. ✅ Keep trusted paths list updated

## Configuration

### Environment Variables

```env
# Backend API
API_URL=http://localhost:5000

# Authentication
API_TOKEN=your-jwt-token-here

# Repository
REPO_ID=your-repository-id

# Encryption
ENCRYPTION_KEY=your-encryption-key
```

### Installation

```bash
# Install dependencies
cd monitoring-agent
pip install -r requirements.txt

# Install git hooks
python3 install_git_hooks.py install

# Configure environment
cp .env.example .env
# Edit .env with your settings
```

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review logs in dashboard
3. Contact your system administrator
4. Refer to detailed documentation in `/monitoring-agent/README.md`

## Summary

This system provides comprehensive protection against unauthorized access and repository copying/moving by:

- 🔒 Verifying device identity on every clone
- 📍 Tracking repository locations
- 🚨 Detecting unauthorized copies/moves
- 🔐 Automatically encrypting compromised repositories
- 📊 Logging all activities for audit
- ⚡ Blocking access in real-time
- 👮 Requiring admin approval for devices

All while maintaining flexibility through trusted paths for legitimate use cases like deployments and multi-location development.
