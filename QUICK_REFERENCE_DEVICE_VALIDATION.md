# Quick Reference: Device Validation on Clone

## 🚀 Quick Start (For Developers)

### After Cloning Repository

```bash
# 1. Run setup script
./setup_repo_protection.sh

# 2. Follow prompts to register device
# Enter device name when prompted

# 3. Wait for approval (Status: PENDING)

# 4. Check status
python3 monitoring-agent/repo_protection_agent.py verify \
  --repo-id "$REPO_ID" --repo-path "."

# 5. After approval, start working
git add .
git commit -m "your message"
git push
```

## 📋 How It Works

```
Clone Repo → Run Setup → Register Device → Wait Approval → Start Working
   ✓            ✓             ✓               ⏳           (after ✓)
```

## 🔐 Device Verification Flow

| Step | Action | System Check | Result |
|------|--------|--------------|--------|
| 1 | Developer clones repo | - | ✅ Clone succeeds |
| 2 | Run `setup_repo_protection.sh` | Install hooks | ✅ Hooks installed |
| 3 | Device fingerprint generated | Create Device ID | ✅ ID created |
| 4 | Register device | Check credentials | ✅ Sent to dashboard |
| 5 | System checks dashboard | Device registered? | ⏳ Status: PENDING |
| 6 | Admin approves | Update status | ✅ Status: APPROVED |
| 7 | Developer commits | Verify device | ✅ Commit allowed |

## ⚠️ Access Scenarios

### ✅ Approved Device
```bash
$ git commit -m "feat: new feature"
🔍 Verifying repository access...
✅ Device verified successfully
[main abc1234] feat: new feature
```

### ⏳ Pending Device
```bash
$ git commit -m "feat: new feature"
🔍 Verifying repository access...
❌ Device status is PENDING. Approval required.
```

### ❌ Unregistered Device
```bash
$ git commit -m "feat: new feature"
🔍 Verifying repository access...
❌ Device not registered or not approved!

   This repository requires device registration.
   Please register your device:
   
   python3 monitoring-agent/repo_protection_agent.py register --device-name "My Device"
```

### 🚫 Copied Repository
```bash
$ git commit -m "feat: new feature"
🔍 Verifying repository access...
⚠️  SECURITY ALERT: UNAUTHORIZED REPOSITORY COPY DETECTED

🔒 Action Taken: Repository has been encrypted and access blocked
```

## 🛠️ Common Commands

### Setup & Registration
```bash
# Initial setup
./setup_repo_protection.sh

# Manual device registration
python3 monitoring-agent/repo_protection_agent.py register \
  --device-name "My Laptop" \
  --api-url "$API_URL" \
  --token "$API_TOKEN"

# Check device fingerprint
python3 monitoring-agent/repo_protection_agent.py fingerprint
```

### Verification
```bash
# Verify device access
python3 monitoring-agent/repo_protection_agent.py verify \
  --repo-id "$REPO_ID" \
  --repo-path "."

# Check repository status
python3 monitoring-agent/copy_detection_monitor.py \
  --repo-id "$REPO_ID" \
  --repo-path "."
```

### Git Hooks
```bash
# Install hooks
python3 monitoring-agent/install_git_hooks.py install

# Uninstall hooks
python3 monitoring-agent/install_git_hooks.py uninstall

# Check installed hooks
ls -la .git/hooks/
```

## 🔑 Configuration (.env)

```env
# Required variables
API_URL=http://localhost:5000
API_TOKEN=your-jwt-token-here
REPO_ID=your-repo-id
ENCRYPTION_KEY=your-32-byte-key
```

## 📊 Device Status

| Status | Description | Can Commit? | Action Required |
|--------|-------------|-------------|-----------------|
| `APPROVED` | Device is authorized | ✅ Yes | None - work normally |
| `PENDING` | Waiting for approval | ❌ No | Wait for admin |
| `REJECTED` | Device was rejected | ❌ No | Contact admin |
| `REVOKED` | Access was revoked | ❌ No | Re-register or contact admin |
| Not Registered | Device unknown | ❌ No | Run setup and register |

## 🚨 Troubleshooting

### Problem: "Device not registered"
**Solution:**
```bash
./setup_repo_protection.sh
# Follow prompts to register
```

### Problem: "Hooks not working"
**Solution:**
```bash
# Re-install hooks
python3 monitoring-agent/install_git_hooks.py install
# or
./setup_repo_protection.sh
```

### Problem: "Repository is encrypted"
**Solution:**
1. Do NOT delete lock files
2. Contact administrator immediately
3. Admin will decrypt via dashboard

### Problem: "API connection failed"
**Solution:**
```bash
# Check backend is running
curl http://localhost:5000/health

# Verify .env configuration
cat .env | grep API_URL
cat .env | grep API_TOKEN
```

## 👨‍💼 Admin Commands

### Approve Device (Dashboard)
```
1. Login to dashboard (http://localhost:3000)
2. Go to Devices section
3. Find pending device
4. Click "Approve"
```

### Approve Device (API)
```bash
curl -X PUT http://localhost:5000/api/devices/{device-id}/approve \
  -H "Authorization: Bearer {admin-token}" \
  -H "Content-Type: application/json" \
  -d '{"status": "APPROVED"}'
```

### Add Trusted Path
```bash
curl -X POST http://localhost:5000/api/repository-protection/trusted-paths/add \
  -H "Authorization: Bearer {admin-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryId": "repo-id",
    "trustedPath": "/var/www/production"
  }'
```

### Decrypt Repository
```bash
curl -X POST http://localhost:5000/api/repository-protection/decrypt \
  -H "Authorization: Bearer {admin-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryId": "repo-id",
    "repositoryPath": "/path/to/repo"
  }'
```

## ✅ Best Practices

### DO:
- ✅ Run setup script after cloning
- ✅ Wait for approval before working
- ✅ Keep repository in original location
- ✅ Report suspicious activities
- ✅ Contact admin for access issues

### DON'T:
- ❌ Copy repository to USB drives
- ❌ Move repository without approval
- ❌ Share device credentials
- ❌ Delete lock files
- ❌ Bypass git hooks (--no-verify)

## 📚 Documentation Links

- [DEVICE_VERIFICATION_ON_CLONE.md](DEVICE_VERIFICATION_ON_CLONE.md) - Full English guide
- [VALIDASI_DEVICE_DEVELOPER.md](VALIDASI_DEVICE_DEVELOPER.md) - Panduan Bahasa Indonesia
- [DEVICE_ID_VERIFICATION_GUIDE.md](DEVICE_ID_VERIFICATION_GUIDE.md) - Detailed verification guide
- [REPOSITORY_PROTECTION_SYSTEM.md](REPOSITORY_PROTECTION_SYSTEM.md) - Complete system documentation

## 🆘 Support

- **Dashboard:** http://localhost:3000
- **API Health:** http://localhost:5000/health
- **Contact:** Your administrator
- **Issues:** Open a ticket

## 📝 Summary

**Device validation ensures:**
1. ✅ Only registered devices can access repository
2. ✅ Device ID is checked on clone and every git operation
3. ✅ Unknown devices are rejected immediately
4. ✅ Approved devices are trusted and can work normally
5. ✅ Copy detection prevents unauthorized duplication

**Remember:** Run `./setup_repo_protection.sh` after cloning!
