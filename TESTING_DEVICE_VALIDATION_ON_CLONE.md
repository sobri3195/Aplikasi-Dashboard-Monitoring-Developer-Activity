# Testing Device Validation on Clone

## Overview

This guide provides step-by-step instructions for testing the Device Validation feature that enforces device registration before repository access.

## Test Environment Setup

### Prerequisites

1. Backend API running on http://localhost:5000
2. Dashboard running on http://localhost:3000
3. PostgreSQL database configured
4. Python 3.8+ installed
5. Admin and developer accounts

### Test Accounts

```
Admin:
  Email: admin@devmonitor.com
  Password: admin123456

Developer:
  Email: developer@devmonitor.com
  Password: developer123
```

## Test Cases

### Test Case 1: New Device Clone (Unregistered)

**Objective:** Verify that clone succeeds but device verification is required.

**Steps:**

1. Clone the repository:
```bash
git clone <repository-url> test-clone-1
cd test-clone-1
```

2. Try to commit without setup:
```bash
echo "test" > test.txt
git add test.txt
git commit -m "test commit"
```

**Expected Result:**
```
🔍 Verifying repository access...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ REPOSITORY ACCESS VERIFICATION FAILED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Your device is not authorized to commit to this repository.
```

**Result:** ✅ PASS if commit is blocked

---

### Test Case 2: Device Registration

**Objective:** Test device registration process.

**Steps:**

1. Run setup script:
```bash
./setup_repo_protection.sh
```

2. When prompted, register device:
```
Do you need to register this device? (y/n): y
Enter device name (e.g., 'My Laptop'): Test Device 1
```

3. Verify registration:
```bash
python3 monitoring-agent/repo_protection_agent.py verify \
  --repo-id "$REPO_ID" --repo-path "."
```

**Expected Result:**
```
✓ Device registered successfully
⚠ Status: PENDING - Waiting for administrator approval
```

**Verification:**
- Check dashboard: Device should appear in Devices list with status PENDING
- Check database: New device record created

**Result:** ✅ PASS if device registered with PENDING status

---

### Test Case 3: Pending Device Access

**Objective:** Verify that pending devices cannot commit.

**Steps:**

1. After registering (status PENDING), try to commit:
```bash
echo "test" > test.txt
git add test.txt
git commit -m "test commit"
```

**Expected Result:**
```
🔍 Verifying repository access...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ REPOSITORY ACCESS VERIFICATION FAILED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Your device is not authorized to commit to this repository.

Possible reasons:
  • Device status is PENDING (waiting for approval)
```

**Result:** ✅ PASS if commit is blocked

---

### Test Case 4: Admin Device Approval

**Objective:** Test admin approval workflow.

**Steps:**

1. Login to dashboard as admin (http://localhost:3000)
   ```
   Email: admin@devmonitor.com
   Password: admin123456
   ```

2. Navigate to Devices section

3. Find the pending device "Test Device 1"

4. Click "Approve" button

5. Verify status changes to "APPROVED"

**Alternative via API:**
```bash
# Get device ID from dashboard or database
DEVICE_ID="device-id-here"
ADMIN_TOKEN="admin-jwt-token"

curl -X PUT http://localhost:5000/api/devices/$DEVICE_ID/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "APPROVED"}'
```

**Expected Result:**
- Device status changes to APPROVED
- Developer receives notification (if configured)

**Result:** ✅ PASS if device approved successfully

---

### Test Case 5: Approved Device Access

**Objective:** Verify that approved devices can commit.

**Steps:**

1. After device is approved, try to commit:
```bash
echo "test content" > test.txt
git add test.txt
git commit -m "test: approved device commit"
```

**Expected Result:**
```
🔍 Verifying repository access...
✅ Device verified - commit allowed
[main abc1234] test: approved device commit
 1 file changed, 1 insertion(+)
 create mode 100644 test.txt
```

**Result:** ✅ PASS if commit succeeds

---

### Test Case 6: Approved Device Push

**Objective:** Verify that approved devices can push.

**Steps:**

1. Try to push:
```bash
git push origin main
```

**Expected Result:**
```
🔍 Verifying repository integrity before push...
   → Checking repository location...
   → Verifying device authorization...
✅ All checks passed - push allowed
```

**Result:** ✅ PASS if push succeeds

---

### Test Case 7: Repository Copy Detection

**Objective:** Test copy detection when repository is copied to USB or another location.

**Steps:**

1. Copy repository to different location:
```bash
cd ..
cp -r test-clone-1 /tmp/copied-repo
cd /tmp/copied-repo
```

2. Try to commit from copied location:
```bash
echo "test" > test2.txt
git add test2.txt
git commit -m "test from copied repo"
```

**Expected Result:**
```
🔍 Verifying repository access...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  REPOSITORY LOCATION VERIFICATION FAILED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This repository may have been copied to an unauthorized location.
```

**Verification:**
- Alert created in dashboard with type "COPY_DETECTED"
- Repository may be encrypted (if configured)
- Activity logged as suspicious

**Result:** ✅ PASS if commit is blocked and alert created

---

### Test Case 8: Post-Checkout Hook on Clone

**Objective:** Verify that post-checkout hook runs after clone.

**Steps:**

1. Delete previous test directory and clone fresh:
```bash
cd ~
rm -rf test-clone-1
git clone <repository-url> test-clone-1
cd test-clone-1
```

2. If hooks are installed, checkout should trigger verification:
```bash
git checkout -b test-branch
```

**Expected Result:**
```
🔍 Verifying device and repository access...
```

If device not registered:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 DEVICE VERIFICATION REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Result:** ✅ PASS if verification runs

---

### Test Case 9: Multiple Device Registration (Same User)

**Objective:** Test registering multiple devices for same user.

**Steps:**

1. On a different machine or VM, clone repository

2. Run setup and register with different device name:
```bash
./setup_repo_protection.sh
# Register as "Test Device 2"
```

3. Check dashboard - both devices should be visible

4. Admin approves Device 2

5. Both devices should work independently

**Expected Result:**
- Both devices can be registered
- Each has unique fingerprint
- Both can be approved separately
- Both can access repository when approved

**Result:** ✅ PASS if both devices work independently

---

### Test Case 10: Device Rejection

**Objective:** Test device rejection workflow.

**Steps:**

1. Register a device (Device 3)

2. Admin rejects the device:
```bash
curl -X PUT http://localhost:5000/api/devices/$DEVICE_ID/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "REJECTED"}'
```

3. Try to commit:
```bash
git commit -m "test"
```

**Expected Result:**
```
❌ Device status is REJECTED
Access denied.
```

**Result:** ✅ PASS if commit is blocked

---

### Test Case 11: Device Revocation

**Objective:** Test revoking a previously approved device.

**Steps:**

1. Use an approved device

2. Admin revokes device:
```bash
curl -X PUT http://localhost:5000/api/devices/$DEVICE_ID/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "REVOKED"}'
```

3. Try to commit:
```bash
git commit -m "test"
```

**Expected Result:**
```
❌ Device verification failed!
Device has been revoked.
```

**Result:** ✅ PASS if commit is blocked

---

### Test Case 12: API Connection Failure

**Objective:** Test behavior when backend API is unreachable.

**Steps:**

1. Stop backend server:
```bash
# Stop the backend
```

2. Try to commit:
```bash
git commit -m "test"
```

**Expected Result:**
- Hook attempts connection
- Timeout or connection error
- Graceful error message

**Result:** ✅ PASS if error handled gracefully

---

## Integration Tests

### Test Case 13: Complete Workflow

**Objective:** Test entire flow from clone to push.

**Steps:**

1. **Clone:**
```bash
git clone <repository-url> test-complete
cd test-complete
```

2. **Setup:**
```bash
./setup_repo_protection.sh
# Register device
```

3. **Verify PENDING blocks commit:**
```bash
echo "test" > test.txt
git add test.txt
git commit -m "test"  # Should fail
```

4. **Admin approves**

5. **Commit succeeds:**
```bash
git commit -m "test"  # Should succeed
```

6. **Push succeeds:**
```bash
git push origin main  # Should succeed
```

**Result:** ✅ PASS if entire flow works

---

## Automated Testing Script

Save as `test_device_validation.sh`:

```bash
#!/bin/bash

echo "Testing Device Validation on Clone"
echo "===================================="

# Test 1: Clone
echo "Test 1: Cloning repository..."
git clone <repository-url> test-device-validation
cd test-device-validation

# Test 2: Commit without setup (should fail)
echo "Test 2: Attempting commit without device registration..."
echo "test" > test.txt
git add test.txt
git commit -m "test" 2>&1 | grep -q "VERIFICATION FAILED"
if [ $? -eq 0 ]; then
    echo "✅ Test 2 PASSED: Commit blocked for unregistered device"
else
    echo "❌ Test 2 FAILED: Commit should have been blocked"
fi

# Test 3: Run setup
echo "Test 3: Running setup script..."
# Note: This requires manual input for device name
# ./setup_repo_protection.sh

# Test 4: Check hooks installed
echo "Test 4: Verifying hooks installed..."
if [ -f ".git/hooks/post-checkout" ] && [ -f ".git/hooks/pre-commit" ] && [ -f ".git/hooks/pre-push" ]; then
    echo "✅ Test 4 PASSED: All hooks installed"
else
    echo "❌ Test 4 FAILED: Hooks not installed"
fi

# Cleanup
cd ..
rm -rf test-device-validation

echo ""
echo "===================================="
echo "Testing Complete"
```

---

## Verification Checklist

After running all tests, verify:

### Database Checks
- [ ] Device records created in `Device` table
- [ ] Activity logs created in `Activity` table
- [ ] Alerts created for unauthorized access in `Alert` table
- [ ] Audit logs created for device approval/rejection

### Dashboard Checks
- [ ] Pending devices visible in Devices section
- [ ] Device approval updates status in real-time
- [ ] Alerts appear for copy detection
- [ ] Activity timeline shows all events

### API Checks
- [ ] `/api/repository-protection/register-device` works
- [ ] `/api/repository-protection/verify-access` validates correctly
- [ ] `/api/devices/:id/approve` updates status
- [ ] `/api/repository-protection/status/:id` returns correct data

### Git Hooks Checks
- [ ] `post-checkout` runs after clone
- [ ] `pre-commit` runs before commit
- [ ] `pre-push` runs before push
- [ ] Hooks block unauthorized access
- [ ] Hooks allow authorized access

---

## Common Issues and Solutions

### Issue: Hooks not executing

**Solution:**
```bash
# Check hooks are executable
ls -la .git/hooks/
chmod +x .git/hooks/*
```

### Issue: Python module not found

**Solution:**
```bash
# Install requirements
cd monitoring-agent
pip install -r requirements.txt
```

### Issue: API token expired

**Solution:**
```bash
# Login again to get new token
# Update .env file with new token
```

### Issue: Device already registered

**Solution:**
```bash
# Check existing device in dashboard
# Or re-register with different device name
```

---

## Performance Testing

### Load Test: Multiple Devices

Test with 10+ devices registering simultaneously:

```bash
for i in {1..10}; do
  python3 monitoring-agent/repo_protection_agent.py register \
    --device-name "Load Test Device $i" &
done
wait
```

**Expected:** All registrations succeed, no database locks

---

## Security Testing

### Test Case: Fingerprint Spoofing Attempt

**Objective:** Verify that spoofed fingerprints are detected.

**Steps:**
1. Capture legitimate device fingerprint
2. Attempt to use same fingerprint from different machine
3. Verify system detects anomaly

**Expected Result:** Access denied, alert created

---

## Test Report Template

```
Device Validation Testing Report
================================

Date: [Date]
Tester: [Name]
Environment: [Dev/Staging/Production]

Test Results:
-------------
Test Case 1: [ ] PASS [ ] FAIL
Test Case 2: [ ] PASS [ ] FAIL
Test Case 3: [ ] PASS [ ] FAIL
...

Issues Found:
-------------
1. [Issue description]
2. [Issue description]

Recommendations:
---------------
1. [Recommendation]
2. [Recommendation]

Overall Assessment: [ ] PASS [ ] FAIL
```

---

## Summary

This testing guide covers:
- ✅ Device registration flow
- ✅ Admin approval process
- ✅ Access control enforcement
- ✅ Copy detection
- ✅ Git hooks verification
- ✅ Error handling
- ✅ Integration testing

**All tests should PASS before considering the feature complete.**
