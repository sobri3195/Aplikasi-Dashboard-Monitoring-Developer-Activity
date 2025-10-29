# Quick Reference: Device Verification & Copy Protection

## 🚀 Quick Start (5 minutes)

### 1. Install Hooks
```bash
python3 monitoring-agent/install_git_hooks.py install
```

### 2. Setup Environment
```bash
cat > .env << EOF
API_URL=http://localhost:5000
API_TOKEN=your-jwt-token
REPO_ID=your-repo-id
EOF
```

### 3. Register Device
```bash
python3 monitoring-agent/repo_protection_agent.py register \
    --device-name "My Laptop"
```

### 4. Wait for Admin Approval
Check dashboard or contact admin.

### 5. Start Working
```bash
git add .
git commit -m "Your changes"
git push
```

Done! ✅

---

## 📋 Common Commands

### Device Registration
```bash
# Register device
python3 monitoring-agent/repo_protection_agent.py register \
    --device-name "Laptop Name"

# Check device status
python3 monitoring-agent/repo_protection_agent.py status
```

### Repository Verification
```bash
# One-time check
python3 monitoring-agent/copy_detection_monitor.py \
    --repo-id "repo-id" \
    --token "token"

# Continuous monitoring
python3 monitoring-agent/copy_detection_monitor.py \
    --repo-id "repo-id" \
    --token "token" \
    --watch
```

### Git Hooks Management
```bash
# Install hooks
python3 monitoring-agent/install_git_hooks.py install

# Uninstall hooks
python3 monitoring-agent/install_git_hooks.py uninstall
```

---

## 🔧 For Administrators

### Add Trusted Path
```bash
curl -X POST http://localhost:5000/api/repository-protection/trusted-paths/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"repositoryId": "id", "trustedPath": "/path"}'
```

### Remove Trusted Path
```bash
curl -X POST http://localhost:5000/api/repository-protection/trusted-paths/remove \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"repositoryId": "id", "trustedPath": "/path"}'
```

### Get Trusted Paths
```bash
curl http://localhost:5000/api/repository-protection/trusted-paths/{repo-id} \
  -H "Authorization: Bearer $TOKEN"
```

### Decrypt Repository
```bash
curl -X POST http://localhost:5000/api/repository-protection/decrypt \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"repositoryId": "id", "repositoryPath": "/path"}'
```

---

## ❌ Don't Do

- ❌ Copy repository to USB
- ❌ Copy to external drive
- ❌ Move to different location
- ❌ Share repository folder
- ❌ Disable git hooks
- ❌ Delete lock files
- ❌ Share API token

---

## ✅ Do

- ✅ Register device first
- ✅ Work from original location
- ✅ Use git normally
- ✅ Contact admin if issues
- ✅ Keep environment variables secure
- ✅ Review alerts regularly

---

## 🚨 Troubleshooting

### Device Not Registered
```bash
python3 monitoring-agent/repo_protection_agent.py register
```

### Device Pending Approval
Contact administrator to approve your device.

### Repository Encrypted
Contact administrator. Do NOT try to decrypt yourself.

### False Positive
Contact administrator to add path to trusted paths.

---

## 📞 Need Help?

1. Check documentation:
   - [DEVICE_VERIFICATION_AND_COPY_PROTECTION.md](DEVICE_VERIFICATION_AND_COPY_PROTECTION.md) (English)
   - [PANDUAN_PROTEKSI_COPY.md](PANDUAN_PROTEKSI_COPY.md) (Indonesian)

2. Check dashboard alerts

3. Contact administrator

---

## 🔐 Security Reminders

This system protects:
- Source code
- Intellectual property  
- Credentials
- Business logic
- Company assets

By preventing:
- Unauthorized copying
- USB drive theft
- External device access
- Data exfiltration

Stay secure! 🛡️
