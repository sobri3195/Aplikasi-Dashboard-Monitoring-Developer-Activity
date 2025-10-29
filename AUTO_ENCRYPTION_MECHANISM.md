# Mekanisme Enkripsi Otomatis (Auto-Encryption Mechanism)

## Ringkasan

Sistem ini mengimplementasikan mekanisme enkripsi otomatis yang secara langsung melindungi repository saat mendeteksi aktivitas mencurigakan (alert). Repository yang terenkripsi akan dikunci hingga diverifikasi secara manual oleh admin keamanan, sambil tetap transparan terhadap aktivitas normal developer di device yang terotorisasi.

## Fitur Utama

### 1. Enkripsi Otomatis Saat Alert Terdeteksi

Sistem secara otomatis mengenkripsi repository ketika alert dengan kondisi berikut terdeteksi:

- **Severity**: `CRITICAL` atau `WARNING`
- **Alert Types** yang memicu auto-encryption:
  - `REPO_COPY_DETECTED` - Deteksi copy repository tidak sah
  - `UNAUTHORIZED_DEVICE` - Device tidak terotorisasi
  - `SUSPICIOUS_ACTIVITY` - Aktivitas mencurigakan

### 2. Proses Auto-Encryption

Ketika alert terdeteksi, sistem akan:

1. **Validasi Alert**
   - Memeriksa severity alert (CRITICAL/WARNING)
   - Memeriksa tipe alert
   - Memastikan alert belum di-resolve
   - Memverifikasi informasi repository tersedia

2. **Eksekusi Enkripsi**
   - Membuat lock file `.repo-encrypted.lock`
   - Membuat block file `.repo-access-blocked`
   - Mengupdate status repository di database
   - Mencatat timestamp enkripsi

3. **Notifikasi Real-time**
   - Mengirim alert ke dashboard admin via WebSocket
   - Mengirim notifikasi Slack
   - Membuat audit log lengkap

4. **Blokir Akses**
   - Memblokir semua akses ke repository
   - Mencegah operasi git (clone, pull, push)
   - Menampilkan pesan error untuk user tidak terotorisasi

### 3. Transparansi untuk Developer Terotorisasi

Developer dengan device terotorisasi tetap dapat bekerja normal karena sistem memeriksa:

- **Status Device**: Harus `APPROVED`
- **Status User**: Harus `ACTIVE`
- **Ownership**: Device harus milik user yang bersangkutan
- **Riwayat Aktivitas**: Tidak ada aktivitas mencurigakan dalam 24 jam terakhir
- **Trusted Paths**: Repository berada di lokasi yang dipercaya

### 4. Verifikasi Manual oleh Admin Keamanan

Admin keamanan dapat memverifikasi dan mengelola repository terenkripsi:

#### Melihat Daftar Repository Pending Verifikasi
```bash
GET /api/auto-encryption/pending
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "repo-uuid",
      "name": "sensitive-repo",
      "isEncrypted": true,
      "encryptedAt": "2024-01-15T10:30:00Z",
      "securityStatus": "ENCRYPTED",
      "pendingAlerts": [...]
    }
  ],
  "count": 5
}
```

#### Verifikasi Repository (Approve/Reject)
```bash
POST /api/auto-encryption/verify/:repositoryId
```

Request body:
```json
{
  "repositoryPath": "/path/to/repository",
  "status": "APPROVED",  // or "REJECTED"
  "notes": "Verified after investigation - false positive"
}
```

**Status APPROVED:**
- Repository didekripsi
- Access block dihapus
- Alert terkait di-resolve
- Status repository: `SECURE`
- Notifikasi dikirim ke tim

**Status REJECTED:**
- Repository tetap terenkripsi
- Status repository: `COMPROMISED`
- Alert tetap aktif
- Akses permanen diblokir

## API Endpoints

### 1. Get Pending Verifications (Admin Only)
```
GET /api/auto-encryption/pending
Authorization: Bearer <admin-token>
```

### 2. Manual Verification (Admin Only)
```
POST /api/auto-encryption/verify/:repositoryId
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "repositoryPath": "/path/to/repo",
  "status": "APPROVED" | "REJECTED",
  "notes": "Investigation notes"
}
```

### 3. Check Device Access
```
POST /api/auto-encryption/check-access
Authorization: Bearer <token>
Content-Type: application/json

{
  "repositoryId": "uuid",
  "deviceId": "device-uuid"
}
```

### 4. Get Encryption Statistics (Admin Only)
```
GET /api/auto-encryption/stats
Authorization: Bearer <admin-token>
```

Response:
```json
{
  "success": true,
  "data": {
    "totalRepositories": 150,
    "encryptedRepositories": 3,
    "pendingVerifications": 2,
    "compromisedRepositories": 1,
    "autoEncryptionEvents": 5
  }
}
```

### 5. Trigger Manual Encryption (Admin Only)
```
POST /api/auto-encryption/trigger
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "alertId": "alert-uuid"
}
```

### 6. Create Alert (Auto-triggers encryption)
```
POST /api/alerts
Authorization: Bearer <token>
Content-Type: application/json

{
  "activityId": "activity-uuid",
  "alertType": "REPO_COPY_DETECTED",
  "severity": "CRITICAL",
  "message": "Unauthorized repository copy detected",
  "details": {
    "repositoryId": "repo-uuid",
    "repositoryPath": "/path/to/repo",
    "reason": "UNAPPROVED_DEVICE"
  }
}
```

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   DETEKSI AKTIVITAS                          │
│                   MENCURIGAKAN (ALERT)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            VALIDASI KONDISI AUTO-ENCRYPTION                  │
│  • Severity: CRITICAL/WARNING?                               │
│  • Alert Type: REPO_COPY/UNAUTHORIZED/SUSPICIOUS?           │
│  • Alert belum resolved?                                     │
│  • Repository info available?                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
                 [Ya] / [Tidak]
                  │        │
                  │        └─► Skip Auto-Encryption
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                EKSEKUSI AUTO-ENCRYPTION                      │
│  1. Encrypt repository files                                │
│  2. Create .repo-encrypted.lock                             │
│  3. Create .repo-access-blocked                             │
│  4. Update database status                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  NOTIFIKASI REAL-TIME                        │
│  • Dashboard alert (WebSocket)                              │
│  • Slack notification                                       │
│  • Email ke security team                                   │
│  • Audit log creation                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              REPOSITORY DIKUNCI & MENUNGGU                   │
│              VERIFIKASI MANUAL ADMIN                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           ADMIN INVESTIGASI & VERIFIKASI                     │
│                                                              │
│         ┌───────────┐           ┌───────────┐              │
│         │ APPROVED  │           │ REJECTED  │              │
│         └─────┬─────┘           └─────┬─────┘              │
│               │                       │                     │
│               ▼                       ▼                     │
│    ┌──────────────────┐   ┌─────────────────────┐         │
│    │ Decrypt Repo     │   │ Keep Encrypted      │         │
│    │ Remove Block     │   │ Permanent Block     │         │
│    │ Resolve Alerts   │   │ Mark Compromised    │         │
│    │ Status: SECURE   │   │ Status: COMPROMISED │         │
│    └──────────────────┘   └─────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Device Authorization Check

Untuk memastikan transparansi bagi developer terotorisasi:

```javascript
// Check authorized device access
const result = await autoEncryptionService.checkAuthorizedDeviceAccess(
  repositoryId,
  deviceId,
  userId
);

if (result.authorized) {
  // Allow transparent access
  console.log("Device authorized for transparent access");
} else {
  // Block access and show reason
  console.log("Access denied:", result.reason);
}
```

## Keamanan & Best Practices

### Encryption Key Management
- Gunakan environment variable `ENCRYPTION_KEY` yang kuat
- Jangan commit encryption key ke repository
- Rotate key secara berkala
- Simpan backup key di secure vault

### Trusted Paths Configuration
Repository di lokasi trusted tidak akan dienkripsi otomatis:

```javascript
// Add trusted path
await repositoryProtectionService.addTrustedPath(
  repositoryId,
  '/home/developer/projects/trusted'
);

// Check if path is trusted
const isTrusted = await repositoryProtectionService.isTrustedPath(
  repositoryId,
  repositoryPath
);
```

### Alert Monitoring
Monitor alert yang memicu auto-encryption:

1. **Dashboard Real-time**: WebSocket updates
2. **Slack Integration**: Instant notifications
3. **Email Alerts**: Untuk security team
4. **Audit Logs**: Complete trail untuk compliance

## Testing

### Test Auto-Encryption Flow

```bash
# 1. Create suspicious alert
curl -X POST http://localhost:3000/api/alerts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "alertType": "REPO_COPY_DETECTED",
    "severity": "CRITICAL",
    "message": "Test unauthorized copy",
    "details": {
      "repositoryId": "test-repo-id",
      "repositoryPath": "/tmp/test-repo",
      "reason": "TEST"
    }
  }'

# 2. Check pending verifications
curl -X GET http://localhost:3000/api/auto-encryption/pending \
  -H "Authorization: Bearer <admin-token>"

# 3. Verify repository (approve)
curl -X POST http://localhost:3000/api/auto-encryption/verify/test-repo-id \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryPath": "/tmp/test-repo",
    "status": "APPROVED",
    "notes": "False positive - test alert"
  }'
```

## Monitoring & Metrics

### Key Metrics to Monitor

1. **Auto-Encryption Events**
   - Jumlah repository yang dienkripsi otomatis
   - Waktu rata-rata dari alert ke enkripsi
   - Success rate enkripsi

2. **Verification Metrics**
   - Pending verifications count
   - Average verification time
   - Approval vs rejection ratio

3. **False Positive Rate**
   - Alert yang di-approve setelah investigasi
   - Pattern false positive untuk tuning

4. **Response Time**
   - Alert creation to encryption time
   - Admin notification delivery time
   - Verification completion time

## Troubleshooting

### Repository Tidak Ter-encrypt Otomatis

1. Cek severity alert: Harus `CRITICAL` atau `WARNING`
2. Cek alert type: Harus salah satu dari auto-encrypt types
3. Cek repository info: `repositoryId` dan `repositoryPath` harus ada
4. Cek logs: `/var/log/auto-encryption.log`

### Device Terotorisasi Tidak Bisa Akses

1. Verify device status: Harus `APPROVED`
2. Verify user status: Harus `ACTIVE`
3. Check suspicious activities: Tidak boleh ada dalam 24 jam terakhir
4. Verify repository location: Harus di trusted path atau tidak terenkripsi

### Manual Verification Gagal

1. Verify admin role: User harus memiliki role `ADMIN`
2. Check repository path: Path harus valid dan exists
3. Check encryption status: Repository harus dalam status `ENCRYPTED`
4. Verify encryption key: Environment variable harus set

## Integration Examples

### Integrate with CI/CD

```javascript
// Pre-commit hook
const { checkAuthorizedDeviceAccess } = require('./services/autoEncryptionService');

async function preCommitCheck() {
  const result = await checkAuthorizedDeviceAccess(
    process.env.REPO_ID,
    process.env.DEVICE_ID,
    process.env.USER_ID
  );
  
  if (!result.authorized) {
    console.error('Commit blocked:', result.reason);
    process.exit(1);
  }
}
```

### Monitor with Prometheus

```javascript
// Export metrics
const { getEncryptionStats } = require('./services/autoEncryptionService');

async function exportMetrics() {
  const stats = await getEncryptionStats();
  
  // Export to Prometheus
  encryptedReposGauge.set(stats.data.encryptedRepositories);
  pendingVerificationsGauge.set(stats.data.pendingVerifications);
  autoEncryptionEventsCounter.inc(stats.data.autoEncryptionEvents);
}
```

## Kesimpulan

Mekanisme enkripsi otomatis ini memberikan:

✅ **Proteksi Real-time**: Repository langsung dienkripsi saat alert terdeteksi
✅ **Manual Verification**: Admin memiliki kontrol penuh untuk approve/reject
✅ **Transparansi**: Developer terotorisasi tidak terganggu workflow-nya
✅ **Audit Trail**: Semua aksi tercatat untuk compliance
✅ **Notifikasi Lengkap**: Real-time alerts via dashboard, Slack, dan email

Sistem ini memastikan keamanan repository sambil menjaga produktivitas developer.
