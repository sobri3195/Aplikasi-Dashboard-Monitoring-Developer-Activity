# 🌱 Database Seed Data Information

Dokumentasi lengkap tentang dummy data yang akan di-generate saat menjalankan database seeding.

## 📊 Overview

Seed file akan mengisi database dengan data dummy yang realistis untuk testing dan demonstrasi fitur monitoring aktivitas developer.

## 🚀 Cara Menjalankan Seed

### Prerequisites

1. PostgreSQL harus running
2. Database sudah dibuat
3. Environment variables sudah di-setup

### Steps

```bash
# 1. Copy environment file
cd backend
cp .env.example .env

# 2. Edit .env dan sesuaikan DATABASE_URL
# DATABASE_URL=postgresql://user:password@localhost:5432/devmonitor

# 3. Run migrations
npm run migrate

# 4. Run seed
npm run db:seed
```

## 📋 Data yang Di-generate

### 1. Users (10 total)

#### Administrators (3)
| Name | Email | Password | Notes |
|------|-------|----------|-------|
| Admin User | admin@devmonitor.com | admin123456 | Main system admin |
| Alex Johnson | alex.johnson@example.com | alex123 | Secondary admin |

#### Developers (6)
| Name | Email | Password | Location | Status |
|------|-------|----------|----------|--------|
| Developer User | developer@devmonitor.com | developer123 | Jakarta | Normal |
| John Doe | john.doe@example.com | john123 | Surabaya | Has suspicious activity |
| Jane Smith | jane.smith@example.com | jane123 | Bandung | Repo copy attempt |
| Mike Chen | mike.chen@example.com | mike123 | Yogyakarta | Access from unusual location |
| Sarah Williams | sarah.williams@example.com | sarah123 | Bali | Normal |
| David Martinez | david.martinez@example.com | david123 | Medan | Unusual location (resolved) |
| Emily Taylor | emily.taylor@example.com | emily123 | Semarang | Normal |

#### Viewers (1)
| Name | Email | Password | Access |
|------|-------|----------|--------|
| Viewer User | viewer@devmonitor.com | viewer123 | Read-only |

### 2. Devices (9 total)

#### Authorized Devices (7)
1. **Developer Laptop** (developer@devmonitor.com)
   - OS: Ubuntu 22.04 LTS
   - CPU: Intel Core i7-9750H
   - MAC: 00:1B:44:11:3A:B7
   - IP: 192.168.1.100
   - Status: APPROVED ✅

2. **John MacBook Pro** (john.doe@example.com)
   - OS: macOS Ventura 13.0
   - CPU: Apple M1 Pro
   - MAC: 00:1B:44:11:3A:C8
   - IP: 192.168.1.101
   - Status: APPROVED ✅

3. **Jane Dell XPS** (jane.smith@example.com)
   - OS: Windows 11 Pro
   - CPU: Intel Core i9-11900H
   - MAC: 00:1B:44:11:3A:D9
   - IP: 192.168.1.102
   - Status: APPROVED ✅

4. **Mike ThinkPad X1** (mike.chen@example.com)
   - OS: Ubuntu 20.04 LTS
   - CPU: Intel Core i7-1165G7
   - MAC: 00:1B:44:11:3A:E1
   - IP: 192.168.1.103
   - Status: APPROVED ✅

5. **Sarah MacBook Air** (sarah.williams@example.com)
   - OS: macOS Monterey 12.5
   - CPU: Apple M2
   - MAC: 00:1B:44:11:3A:F2
   - IP: 192.168.1.104
   - Status: APPROVED ✅

6. **David HP Spectre** (david.martinez@example.com)
   - OS: Windows 10 Pro
   - CPU: Intel Core i5-1135G7
   - MAC: 00:1B:44:11:3A:G3
   - IP: 192.168.1.105
   - Status: APPROVED ✅

7. **Emily Asus ROG** (emily.taylor@example.com)
   - OS: Windows 11 Pro
   - CPU: AMD Ryzen 7 5800H
   - MAC: 00:1B:44:11:3A:H4
   - IP: 192.168.1.106
   - Status: APPROVED ✅

#### Pending Device (1)
8. **Unknown Device** (john.doe@example.com)
   - OS: Windows 10
   - CPU: Intel Core i5
   - MAC: 00:1B:44:11:3A:Z9
   - IP: 203.0.113.45 (Singapore)
   - Status: PENDING ⏳
   - Notes: Unauthorized access attempt

#### Rejected Device (1)
9. **Suspicious Device** (jane.smith@example.com)
   - OS: Linux Mint
   - CPU: Intel Core i3
   - MAC: 00:1B:44:11:3A:Y8
   - IP: 198.51.100.67 (United States)
   - Status: REJECTED ❌
   - Notes: Suspicious device fingerprint

### 3. Repositories (8 total)

| Repository | GitLab ID | Security Status | Last Activity | Encrypted |
|------------|-----------|-----------------|---------------|-----------|
| sample-project | 12345 | SECURE 🟢 | Now | No |
| backend-api | 12346 | SECURE 🟢 | 2h ago | No |
| frontend-app | 12347 | SECURE 🟢 | 5h ago | No |
| mobile-app | 12348 | WARNING 🟡 | 12h ago | No |
| data-pipeline | 12349 | SECURE 🟢 | 24h ago | No |
| ml-models | 12350 | SECURE 🟢 | 48h ago | No |
| devops-scripts | 12351 | SECURE 🟢 | 72h ago | No |
| confidential-project | 12352 | ENCRYPTED 🔒 | 1h ago | Yes ✅ |

### 4. Activities (30+ total)

#### Normal Activities (~30)

**Developer** (developer@devmonitor.com):
- 4 days ago: LOGIN from Jakarta
- 3.75 days ago: GIT_CLONE sample-project
- 3 days ago: GIT_PULL sample-project/main
- 2 days ago: GIT_COMMIT sample-project/feature/new-feature
- 1.95 days ago: GIT_PUSH sample-project/feature/new-feature

**John Doe** (john.doe@example.com):
- 3.5 days ago: LOGIN from Surabaya
- 3.33 days ago: GIT_CLONE backend-api
- 2.5 days ago: GIT_PULL backend-api/main
- 1.5 days ago: GIT_CHECKOUT backend-api/feature/api-enhancement
- 1 day ago: GIT_COMMIT backend-api/feature/api-enhancement
- 0.95 days ago: GIT_PUSH backend-api/feature/api-enhancement

**Jane Smith** (jane.smith@example.com):
- 4.16 days ago: LOGIN from Bandung
- 3.95 days ago: GIT_CLONE frontend-app
- 3 days ago: GIT_PULL frontend-app/develop
- 2 days ago: GIT_CHECKOUT frontend-app/feature/ui-redesign
- 1 day ago: GIT_COMMIT frontend-app/feature/ui-redesign
- 0.95 days ago: GIT_PUSH frontend-app/feature/ui-redesign

**Mike Chen** (mike.chen@example.com):
- 3.125 days ago: LOGIN from Yogyakarta
- 2.91 days ago: GIT_CLONE mobile-app
- 2.08 days ago: GIT_PULL mobile-app/main
- 0.5 days ago: GIT_COMMIT mobile-app/feature/push-notifications

**Sarah Williams** (sarah.williams@example.com):
- 2.7 days ago: LOGIN from Bali
- 2.5 days ago: GIT_CLONE data-pipeline
- 1.5 days ago: GIT_PULL data-pipeline/develop

**David Martinez** (david.martinez@example.com):
- 2.29 days ago: LOGIN from Medan
- 2.08 days ago: GIT_CLONE ml-models

**Emily Taylor** (emily.taylor@example.com):
- 1.875 days ago: LOGIN from Semarang
- 1.66 days ago: GIT_CLONE devops-scripts
- 0.33 days ago: GIT_COMMIT devops-scripts/feature/ci-improvements

#### Suspicious Activities (4)

1. **John's Unauthorized Access** 🔴
   - **Time**: 2 hours ago
   - **User**: John Doe
   - **Device**: Unknown Device (PENDING)
   - **Activity**: UNAUTHORIZED_ACCESS
   - **Repository**: backend-api/main
   - **Location**: Singapore (IP: 203.0.113.45)
   - **Risk Level**: HIGH
   - **Details**: Access from unauthorized device
   - **Status**: Access blocked

2. **Jane's Repository Copy Attempt** 🔴
   - **Time**: 1 hour ago
   - **User**: Jane Smith
   - **Device**: Suspicious Device (REJECTED)
   - **Activity**: REPO_COPY
   - **Repository**: confidential-project/main
   - **Location**: United States (IP: 198.51.100.67)
   - **Risk Level**: CRITICAL
   - **Details**: Attempt to copy repository to external device
   - **Action**: Repository encrypted automatically
   - **Status**: Blocked & Encrypted

3. **Mike's Access from Russia** 🔴
   - **Time**: 6 hours ago
   - **User**: Mike Chen
   - **Device**: Unregistered (null)
   - **Activity**: UNAUTHORIZED_ACCESS
   - **Repository**: mobile-app
   - **Location**: Russia (IP: 185.220.100.240)
   - **Risk Level**: CRITICAL
   - **Details**: Access from unknown location and unregistered device
   - **Action**: Access blocked
   - **Status**: Blocked completely

4. **David's Unusual Location** 🟡
   - **Time**: 18 hours ago
   - **User**: David Martinez
   - **Device**: David HP Spectre (APPROVED)
   - **Activity**: GIT_CLONE
   - **Repository**: ml-models/main
   - **Location**: Vietnam (IP: 192.51.100.15)
   - **Risk Level**: MEDIUM
   - **Details**: Unusual location detected
   - **Note**: User normally works from Medan, Indonesia
   - **Status**: ✅ Resolved (business trip verified)

### 5. Alerts (4 total)

1. **Unauthorized Device Alert** 🔴
   - **Type**: UNAUTHORIZED_DEVICE
   - **Severity**: CRITICAL
   - **Message**: "Unauthorized device attempted to access backend-api repository"
   - **Time**: 2 hours ago
   - **Notified**: Yes (Slack sent)
   - **Status**: Unresolved

2. **Repository Copy Alert** 🔴
   - **Type**: REPO_COPY_DETECTED
   - **Severity**: CRITICAL
   - **Message**: "Attempt to copy confidential-project repository detected. Repository has been encrypted."
   - **Time**: 1 hour ago
   - **Notified**: Yes (Slack sent)
   - **Status**: Unresolved

3. **Suspicious Activity Alert** 🔴
   - **Type**: SUSPICIOUS_ACTIVITY
   - **Severity**: CRITICAL
   - **Message**: "Access attempt from Russia blocked. Unregistered device detected."
   - **Time**: 6 hours ago
   - **Notified**: Yes (Slack sent)
   - **Status**: Unresolved

4. **Unusual Location Alert** 🟡
   - **Type**: UNUSUAL_LOCATION
   - **Severity**: WARNING
   - **Message**: "David Martinez accessed repository from unusual location (Vietnam)"
   - **Time**: 18 hours ago
   - **Notified**: Yes (Slack sent)
   - **Status**: ✅ Resolved by Admin
   - **Resolved At**: 10 hours ago
   - **Resolution Note**: "Verified with user - business trip to Vietnam"

### 6. Audit Logs (8+ entries)

1. **Device Approvals** (100h ago)
   - Admin approved Developer Laptop
   - Admin approved John MacBook Pro
   - Admin approved Jane Dell XPS

2. **Device Rejection** (3h ago)
   - Alex Johnson rejected Suspicious Device
   - Reason: "Suspicious device fingerprint"

3. **Repository Encryption** (1h ago)
   - System encrypted confidential-project
   - Reason: "Unauthorized access attempt"
   - Triggered by: Jane's repo copy attempt

4. **Alert Resolution** (10h ago)
   - Admin resolved Unusual Location alert
   - Notes: "Verified with user - business trip to Vietnam"

5. **User Creation** (120h ago)
   - Admin created Mike Chen account
   - Role: DEVELOPER

6. **Device Suspension** (2h ago)
   - Alex Johnson suspended Unknown Device
   - Reason: "Multiple unauthorized access attempts"

### 7. System Logs (7+ entries)

- **INFO**: Application started successfully (120h ago)
- **INFO**: Database connection established (119h ago)
- **WARNING**: Unauthorized access attempt detected (2h ago)
- **CRITICAL**: Repository copy attempt blocked and encrypted (1h ago)
- **ERROR**: Failed to send Slack notification (5h ago)
- **WARNING**: Unusual login location detected (18h ago)
- **INFO**: Backup completed successfully (24h ago)

### 8. System Performance Records (4 entries)

| Time | CPU | Memory | Disk | Connections | Requests/min |
|------|-----|--------|------|-------------|--------------|
| 24h ago | 35.5% | 2048MB / 8192MB | 50GB / 250GB | 15 | 120 |
| 12h ago | 42.3% | 2560MB / 8192MB | 50.5GB / 250GB | 22 | 185 |
| 6h ago | 28.7% | 1920MB / 8192MB | 51GB / 250GB | 12 | 95 |
| 1h ago | 55.2% | 3200MB / 8192MB | 51.2GB / 250GB | 35 | 250 |

### 9. API Usage Logs (5+ entries)

| Endpoint | Method | Status | Response Time | User | Time |
|----------|--------|--------|---------------|------|------|
| /api/activities | GET | 200 | 45.5ms | developer | 2h ago |
| /api/devices | GET | 200 | 32.3ms | admin | 3h ago |
| /api/devices/register | POST | 201 | 156.7ms | mike | 75h ago |
| /api/activities | POST | 201 | 89.2ms | john | 24h ago |
| /api/webhooks/gitlab | POST | 200 | 234.8ms | GitLab | 12h ago |

## 🎯 Testing Scenarios

Dengan data yang di-seed, Anda bisa test berbagai scenario:

### Scenario 1: View Normal Activities
1. Login sebagai Developer
2. Browse activities
3. See normal git workflow

### Scenario 2: Check Suspicious Activities
1. Login sebagai Admin
2. Filter activities by risk level HIGH/CRITICAL
3. View 4 suspicious activities

### Scenario 3: Manage Alerts
1. Login sebagai Admin
2. View 3 unresolved alerts
3. View 1 resolved alert
4. Try resolving unresolved alerts

### Scenario 4: Device Management
1. Login sebagai Admin
2. View pending device (Unknown Device)
3. Approve or reject
4. View rejected device (Suspicious Device)

### Scenario 5: Repository Security
1. Login sebagai Admin
2. View encrypted repository (confidential-project)
3. Check encryption details
4. View security timeline

### Scenario 6: Audit Trail
1. Login as Admin
2. View audit logs
3. Filter by action type
4. Export logs

## 🔄 Re-seeding

Untuk reset dan re-seed database:

```bash
cd backend

# Reset database (hati-hati, akan hapus semua data!)
npm run db:reset

# Run migrations
npm run migrate

# Seed lagi
npm run db:seed
```

## 📝 Notes

- Semua password menggunakan bcrypt dengan salt rounds 12
- Timestamps relatif terhadap waktu seed dijalankan
- IP addresses menggunakan dummy IPs untuk testing
- Locations adalah sample locations
- Demo accounts bypass password verification untuk kemudahan testing
- Suspicious activities designed untuk test alert system

## 🔐 Security Notes

**PENTING untuk Production:**

1. **Hapus atau disable demo accounts**
2. **Gunakan strong passwords**
3. **Update JWT secrets**
4. **Configure proper Slack webhooks**
5. **Setup proper encryption keys**
6. **Remove password bypass untuk demo accounts**

## 📞 Support

Jika ada masalah saat seeding:

1. Check DATABASE_URL di .env
2. Pastikan PostgreSQL running
3. Check migrations sudah run
4. Check logs: `npm run db:seed 2>&1 | tee seed.log`

---

**Created**: 2024
**Version**: 1.0.0
**Status**: ✅ Ready to Use
