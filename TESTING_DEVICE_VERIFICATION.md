# Testing Device ID Verification and Copy/Move Protection

## Test Scenarios

This document outlines test scenarios to validate the device verification and copy/move protection features.

## Prerequisites

1. Backend server running on `http://localhost:5000`
2. Database initialized with Prisma
3. At least one admin user created
4. JWT tokens available for testing
5. Python dependencies installed in monitoring-agent

## Test Suite 1: Device Registration and Verification

### Test 1.1: Register New Device

**Objective:** Verify that a new device can be registered

**Steps:**
1. Set environment variables:
   ```bash
   export API_URL="http://localhost:5000"
   export API_TOKEN="valid-jwt-token"
   export REPO_ID="test-repo-uuid"
   ```

2. Register device:
   ```bash
   cd /path/to/repo
   python3 monitoring-agent/repo_protection_agent.py register \
       --device-name "Test Laptop"
   ```

**Expected Result:**
```
✓ Device registered: Test Laptop
  Fingerprint: abc123...
  Status: PENDING
```

**Validation:**
- Device appears in dashboard with status PENDING
- Device fingerprint is unique
- Activity log created for registration

### Test 1.2: Clone with Unregistered Device

**Objective:** Verify that clone blocks access for unregistered device

**Steps:**
1. Use a different machine or clear device registration
2. Clone repository:
   ```bash
   git clone https://example.com/protected-repo.git
   cd protected-repo
   ```

**Expected Result:**
```
🔍 Verifying device and repository access...
🔍 New repository clone detected - verifying device registration...
❌ Device not registered or not approved!

   This repository requires device registration.
   Please register your device:

   python3 monitoring-agent/repo_protection_agent.py register --device-name "My Device"

   Then wait for administrator approval.
```

**Validation:**
- Git clone completes but post-checkout hook blocks
- Error message clearly explains registration requirement
- No access to repository operations

### Test 1.3: Clone with Pending Device

**Objective:** Verify that pending devices are blocked

**Steps:**
1. Register device (from Test 1.1)
2. Without admin approval, try to clone:
   ```bash
   git clone https://example.com/protected-repo.git
   cd protected-repo
   ```

**Expected Result:**
```
❌ Access denied: DEVICE_NOT_APPROVED
   Device status is PENDING. Administrator approval required.
```

**Validation:**
- Access blocked
- Clear message about pending approval
- Activity logged as unauthorized access attempt

### Test 1.4: Clone with Approved Device

**Objective:** Verify that approved devices can access

**Steps:**
1. Admin approves device in dashboard
2. Clone repository:
   ```bash
   git clone https://example.com/protected-repo.git
   cd protected-repo
   ```

**Expected Result:**
```
🔍 Verifying device and repository access...
🔍 New repository clone detected - verifying device registration...
✅ Device verified and access authorized
✅ Device verified successfully
Repository access authorized
```

**Validation:**
- Clone succeeds
- Post-checkout hook passes
- `.repo-metadata.json` created with original location
- Activity logged as authorized access

## Test Suite 2: Copy Detection

### Test 2.1: Copy Repository to USB Drive

**Objective:** Verify copy detection when repository copied to external drive

**Steps:**
1. Have an approved repository at `/home/user/projects/repo`
2. Copy entire repository to USB drive:
   ```bash
   cp -r /home/user/projects/repo /media/usb/repo
   cd /media/usb/repo
   ```
3. Try to run git command:
   ```bash
   git status
   ```

**Expected Result:**
```
🔍 Checking repository location...
   Repository: /media/usb/repo
   Repository ID: project-123

⚠️  COPY DETECTED: UNAUTHORIZED_LOCATION

======================================================================
⚠️  SECURITY ALERT: UNAUTHORIZED REPOSITORY COPY DETECTED
======================================================================

📍 Original Location: /home/user/projects/repo
📍 Current Location:  /media/usb/repo

🔒 Action Taken: Repository has been encrypted and access blocked

💬 Message: Contact your administrator to restore access.
   This repository can only be used from its original location
   or from explicitly trusted paths.
======================================================================

✓ Alert sent to dashboard
🔒 Repository encrypted and access blocked
```

**Validation:**
- Copy detected immediately
- `.repo-encrypted.lock` file created
- `.repo-access-blocked` file created
- Alert sent to dashboard with CRITICAL severity
- Activity logged with isSuspicious=true
- Repository marked as encrypted in database
- Git operations blocked

### Test 2.2: Move Repository to Different Folder

**Objective:** Verify detection when repository is moved

**Steps:**
1. Have approved repository at `/home/user/projects/repo`
2. Move to different location:
   ```bash
   mv /home/user/projects/repo /home/user/other-folder/repo
   cd /home/user/other-folder/repo
   ```
3. Try to commit:
   ```bash
   echo "test" > test.txt
   git add test.txt
   git commit -m "test"
   ```

**Expected Result:**
```
🔍 Verifying repository access...
❌ Repository location verification failed!
   This repository may have been copied to an unauthorized location.
```

**Validation:**
- Location change detected
- Commit blocked by pre-commit hook
- Alert generated
- Repository encrypted and blocked

### Test 2.3: Copy with Trusted Path

**Objective:** Verify that copies to trusted paths are allowed

**Steps:**
1. Admin adds trusted path:
   ```bash
   curl -X POST http://localhost:5000/api/repository-protection/trusted-paths/add \
     -H "Authorization: Bearer admin-token" \
     -H "Content-Type: application/json" \
     -d '{
       "repositoryId": "repo-uuid",
       "trustedPath": "/var/www/production"
     }'
   ```

2. Copy repository to trusted path:
   ```bash
   cp -r /home/user/projects/repo /var/www/production/repo
   cd /var/www/production/repo
   ```

3. Try to run git commands:
   ```bash
   git status
   git pull
   ```

**Expected Result:**
```
✓ Repository location verified
  Location: Authorized
```

**Validation:**
- No copy detection triggered
- All git operations work normally
- Activity logged as normal access
- No alerts generated

## Test Suite 3: Git Hook Validation

### Test 3.1: Pre-commit Hook Blocks Unauthorized

**Objective:** Verify pre-commit hook blocks when device unauthorized

**Steps:**
1. Admin revokes device approval
2. Try to commit:
   ```bash
   echo "test" > test.txt
   git add test.txt
   git commit -m "test commit"
   ```

**Expected Result:**
```
🔍 Verifying repository access...
❌ Access denied: DEVICE_NOT_APPROVED
   Device status is REJECTED. Administrator approval required.
❌ Repository access verification failed!
   Cannot commit to this repository.
```

**Validation:**
- Commit blocked
- Clear error message
- Device status checked on every commit

### Test 3.2: Pre-push Hook Validates Integrity

**Objective:** Verify pre-push hook checks repository integrity

**Steps:**
1. Move repository to unauthorized location
2. Try to push:
   ```bash
   git push origin main
   ```

**Expected Result:**
```
🔍 Verifying repository integrity...
❌ Repository location verification failed!
   This repository may have been copied to an unauthorized location.
❌ Repository integrity check failed!
   Cannot push from unauthorized location.
```

**Validation:**
- Push blocked
- Location verified before push
- Prevents pushing from copied repositories

### Test 3.3: Post-checkout Runs on Branch Switch

**Objective:** Verify hook runs on checkout

**Steps:**
1. Switch branches:
   ```bash
   git checkout -b new-feature
   ```

**Expected Result:**
```
🔍 Verifying device and repository access...
✓ Repository location verified
```

**Validation:**
- Hook runs on branch checkout
- Location still verified
- Normal operations continue if authorized

## Test Suite 4: Multi-Device Scenarios

### Test 4.1: Concurrent Access Detection

**Objective:** Verify detection of repository accessed from multiple devices simultaneously

**Steps:**
1. Device A accesses repository at 10:00:00
2. Device B accesses same repository at 10:00:30
3. Verify alert generated

**Expected Result:**
- Alert triggered for suspicious multi-device access
- Details show both devices and timing
- Marked as HIGH risk

**Validation:**
- Activity logs show both accesses
- Time difference calculated
- Alert generated if within threshold (1 hour)

### Test 4.2: Legitimate Multi-Device Setup

**Objective:** Verify legitimate multi-device usage allowed

**Steps:**
1. Register Device A and Device B
2. Admin approves both devices
3. Each device clones from official source
4. Each works independently

**Expected Result:**
- Both devices work normally
- No false positive alerts
- Each has own `.repo-metadata.json`

**Validation:**
- Each repository tracked independently
- Original locations different
- Both authorized

## Test Suite 5: Admin Functions

### Test 5.1: Admin Decrypts Repository

**Objective:** Verify admin can decrypt encrypted repository

**Steps:**
1. Repository encrypted due to copy detection
2. Admin calls decrypt API:
   ```bash
   curl -X POST http://localhost:5000/api/repository-protection/decrypt \
     -H "Authorization: Bearer admin-token" \
     -H "Content-Type: application/json" \
     -d '{
       "repositoryId": "repo-uuid",
       "repositoryPath": "/path/to/repo"
     }'
   ```

**Expected Result:**
```json
{
  "success": true,
  "message": "Repository decrypted successfully"
}
```

**Validation:**
- `.repo-encrypted.lock` removed
- `.repo-access-blocked` removed
- Database updated: isEncrypted=false
- Audit log created
- Repository accessible again

### Test 5.2: Admin Adds/Removes Trusted Path

**Objective:** Verify trusted path management

**Steps:**
1. Add trusted path:
   ```bash
   curl -X POST http://localhost:5000/api/repository-protection/trusted-paths/add \
     -H "Authorization: Bearer admin-token" \
     -d '{"repositoryId": "uuid", "trustedPath": "/test/path"}'
   ```

2. Verify path added:
   ```bash
   curl -X GET http://localhost:5000/api/repository-protection/trusted-paths/uuid \
     -H "Authorization: Bearer admin-token"
   ```

3. Remove path:
   ```bash
   curl -X POST http://localhost:5000/api/repository-protection/trusted-paths/remove \
     -H "Authorization: Bearer admin-token" \
     -d '{"repositoryId": "uuid", "trustedPath": "/test/path"}'
   ```

**Expected Result:**
- Path added successfully
- GET returns updated list
- Path removed successfully
- Audit logs created for both actions

**Validation:**
- Database updated correctly
- Absolute paths used
- Audit trail maintained

## Test Suite 6: Error Handling

### Test 6.1: Backend Unavailable

**Objective:** Verify graceful handling when backend is down

**Steps:**
1. Stop backend server
2. Try to clone repository:
   ```bash
   git clone https://example.com/protected-repo.git
   ```

**Expected Result:**
```
❌ Cannot connect to backend server
   Please ensure the backend is running and accessible
```

**Validation:**
- Clear error message
- No crash or hang
- User knows what to fix

### Test 6.2: Invalid Repository ID

**Objective:** Verify handling of invalid repo ID

**Steps:**
1. Set invalid REPO_ID in .env
2. Try to verify access:
   ```bash
   python3 monitoring-agent/repo_protection_agent.py verify \
       --repo-id "invalid-uuid"
   ```

**Expected Result:**
```
❌ Repository not found
```

**Validation:**
- Appropriate error returned
- No server error
- Clear message

### Test 6.3: Network Timeout

**Objective:** Verify timeout handling

**Steps:**
1. Simulate slow network
2. Try verification with timeout

**Expected Result:**
```
❌ Backend request timed out
```

**Validation:**
- Request times out gracefully
- User informed of timeout
- Can retry

## Test Suite 7: Dashboard Integration

### Test 7.1: View Device Registrations

**Objective:** Verify devices shown in dashboard

**Steps:**
1. Open dashboard as admin
2. Navigate to Device Management
3. View list of registered devices

**Expected Result:**
- All registered devices listed
- Shows device name, fingerprint, status
- Shows registration date
- Shows last access time

**Validation:**
- Correct data displayed
- Can filter by status
- Can search by name

### Test 7.2: Approve/Reject Device

**Objective:** Verify device approval workflow

**Steps:**
1. View pending devices
2. Click approve on device
3. Verify status changes

**Expected Result:**
- Status changes to APPROVED
- User notified (if notifications enabled)
- Activity logged

**Validation:**
- Database updated
- Real-time update in dashboard
- Audit log created

### Test 7.3: View Copy Detection Alerts

**Objective:** Verify alerts shown in dashboard

**Steps:**
1. Trigger copy detection (see Test 2.1)
2. Open dashboard
3. View alerts

**Expected Result:**
- Alert shown with CRITICAL severity
- Details include locations (original and current)
- Shows device information
- Shows timestamp
- Action taken noted (encrypted and blocked)

**Validation:**
- Alert data complete
- Can mark as resolved
- Links to repository details

## Test Suite 8: Performance and Load

### Test 8.1: Multiple Simultaneous Clones

**Objective:** Verify system handles multiple clones

**Steps:**
1. Multiple users clone simultaneously
2. Each gets verified independently

**Expected Result:**
- All clones process without conflict
- Each verification independent
- No race conditions

**Validation:**
- Database handles concurrent requests
- No deadlocks
- All verifications logged

### Test 8.2: Large Repository Protection

**Objective:** Verify protection works with large repos

**Steps:**
1. Test with repository > 1GB
2. Verify copy detection still works
3. Check performance

**Expected Result:**
- Copy detection works regardless of size
- Metadata operations fast
- No timeout issues

**Validation:**
- Only metadata files checked
- No full repository scanning needed
- Performance acceptable

## Success Criteria

All tests must:
- ✅ Produce expected results
- ✅ Log activities correctly
- ✅ Create appropriate alerts
- ✅ Update database accurately
- ✅ Provide clear user feedback
- ✅ Handle errors gracefully
- ✅ Maintain audit trail

## Test Environment Setup

```bash
# 1. Set up backend
cd backend
npm install
npx prisma migrate dev
npm start

# 2. Set up monitoring agent
cd monitoring-agent
pip install -r requirements.txt

# 3. Create test repository
mkdir test-repo
cd test-repo
git init
python3 ../monitoring-agent/install_git_hooks.py install

# 4. Set environment
cat > .env << EOF
API_URL=http://localhost:5000
API_TOKEN=test-jwt-token
REPO_ID=test-repo-uuid
EOF

# 5. Register test device
python3 ../monitoring-agent/repo_protection_agent.py register \
    --device-name "Test Device"
```

## Automated Testing Script

```bash
#!/bin/bash
# run_tests.sh

echo "Running Device Verification Tests..."

# Test 1: Registration
echo "Test 1: Device Registration"
python3 monitoring-agent/repo_protection_agent.py register \
    --device-name "Test Device" || exit 1

# Test 2: Verification without approval
echo "Test 2: Verify without approval (should fail)"
python3 monitoring-agent/repo_protection_agent.py verify \
    --repo-id "test-uuid" 2>&1 | grep -q "PENDING" || exit 1

# Test 3: Copy detection
echo "Test 3: Copy detection"
mkdir /tmp/test-copy
cp -r . /tmp/test-copy/
cd /tmp/test-copy
python3 monitoring-agent/copy_detection_monitor.py \
    --repo-id "test-uuid" 2>&1 | grep -q "COPY DETECTED" || exit 1

echo "All tests passed!"
```

## Reporting

After testing, report should include:
- Test cases passed/failed
- Any bugs found
- Performance observations
- User experience feedback
- Security considerations
- Recommendations for improvement

## Conclusion

This test suite provides comprehensive validation of:
- Device registration and approval workflow
- Copy/move detection mechanisms
- Git hooks functionality
- Trusted paths system
- Admin capabilities
- Error handling
- Dashboard integration

Run these tests after any changes to ensure system integrity.
