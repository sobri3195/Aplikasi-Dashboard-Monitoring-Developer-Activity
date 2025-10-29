# Panduan Auto-Enkripsi - Referensi Cepat

## 🔒 Apa itu Auto-Enkripsi?

Sistem keamanan yang secara **otomatis mengenkripsi repository** ketika mendeteksi aktivitas mencurigakan (alert). Repository yang terenkripsi akan **dikunci hingga diverifikasi manual oleh admin keamanan**.

## 🚀 Cara Kerja

### 1. Alert Terdeteksi
Sistem mendeteksi aktivitas mencurigakan dan membuat alert dengan severity `CRITICAL` atau `WARNING`.

### 2. Auto-Enkripsi Triggered
Jika alert memenuhi kriteria, repository **langsung dienkripsi secara otomatis**.

### 3. Notifikasi Dikirim
Admin menerima notifikasi melalui:
- Dashboard (real-time)
- Slack
- Email

### 4. Admin Verifikasi
Admin investigasi dan memutuskan:
- **APPROVED** → Repository didekripsi, akses dipulihkan
- **REJECTED** → Repository tetap terenkripsi, akses permanen diblokir

## 📋 Kondisi Auto-Enkripsi

Repository akan dienkripsi otomatis jika:

✅ Alert severity: `CRITICAL` atau `WARNING`
✅ Alert type: `REPO_COPY_DETECTED`, `UNAUTHORIZED_DEVICE`, atau `SUSPICIOUS_ACTIVITY`
✅ Alert belum di-resolve
✅ Informasi repository tersedia

## 🛡️ Transparansi untuk Developer

Developer dengan **device terotorisasi** tetap bisa bekerja normal jika:

✅ Device status: `APPROVED`
✅ User status: `ACTIVE`
✅ Tidak ada aktivitas mencurigakan dalam 24 jam terakhir
✅ Repository di lokasi trusted path

## 🔧 API Endpoints untuk Admin

### Lihat Repository Pending Verifikasi
```bash
GET /api/auto-encryption/pending
```

### Verifikasi Repository (Approve)
```bash
POST /api/auto-encryption/verify/:repositoryId
{
  "repositoryPath": "/path/to/repo",
  "status": "APPROVED",
  "notes": "Verified - false positive"
}
```

### Verifikasi Repository (Reject)
```bash
POST /api/auto-encryption/verify/:repositoryId
{
  "repositoryPath": "/path/to/repo",
  "status": "REJECTED",
  "notes": "Confirmed security threat"
}
```

### Lihat Statistik Enkripsi
```bash
GET /api/auto-encryption/stats
```

### Trigger Manual Enkripsi
```bash
POST /api/auto-encryption/trigger
{
  "alertId": "uuid-alert"
}
```

## 🔍 Cek Akses Device

Developer bisa cek apakah device mereka terotorisasi:

```bash
POST /api/auto-encryption/check-access
{
  "repositoryId": "repo-uuid",
  "deviceId": "device-uuid"
}
```

Response jika terotorisasi:
```json
{
  "success": true,
  "authorized": true,
  "message": "Device authorized for transparent access"
}
```

Response jika tidak terotorisasi:
```json
{
  "success": true,
  "authorized": false,
  "reason": "DEVICE_NOT_APPROVED",
  "message": "Device status is PENDING"
}
```

## 📊 Monitoring

### Statistik yang Bisa Dimonitor

```javascript
{
  "totalRepositories": 150,
  "encryptedRepositories": 3,      // Repository yang sedang terenkripsi
  "pendingVerifications": 2,       // Menunggu verifikasi admin
  "compromisedRepositories": 1,    // Dikonfirmasi compromised
  "autoEncryptionEvents": 5        // Total event auto-enkripsi
}
```

## ⚠️ Troubleshooting

### Repository Tidak Ter-encrypt Otomatis

1. **Cek severity alert**: Harus `CRITICAL` atau `WARNING`
2. **Cek alert type**: Harus dari tipe yang memicu auto-encrypt
3. **Cek repository info**: `repositoryId` dan `repositoryPath` harus tersedia
4. **Cek logs**: Lihat error di system logs

### Device Tidak Bisa Akses Repository

1. **Verify device status**: Cek di `/api/devices` - harus `APPROVED`
2. **Verify user status**: User harus `ACTIVE`
3. **Check aktivitas mencurigakan**: Lihat di dashboard
4. **Check repository location**: Pastikan di trusted path

### Manual Verification Gagal

1. **Verify role**: User harus `ADMIN`
2. **Check repository path**: Path harus valid
3. **Check encryption status**: Repository harus dalam status `ENCRYPTED`
4. **Verify encryption key**: Environment variable `ENCRYPTION_KEY` harus set

## 🎯 Best Practices

### Untuk Admin Keamanan

1. **Investigasi Cepat**: Respond ke alert dalam 1-2 jam
2. **Dokumentasi**: Selalu isi notes saat verifikasi
3. **Review Pattern**: Monitor false positive untuk tuning
4. **Regular Audit**: Review audit logs mingguan

### Untuk Developer

1. **Gunakan Device Terotorisasi**: Pastikan device approved
2. **Trusted Paths**: Work di lokasi yang sudah trusted
3. **Jangan Copy Repository**: Gunakan git clone official
4. **Report Issue**: Laporan jika false positive terjadi

### Untuk DevOps

1. **Monitor Metrics**: Setup Prometheus/Grafana
2. **Alert Configuration**: Setup Slack/Email integration
3. **Backup Encryption Key**: Simpan di secure vault
4. **Rotate Keys**: Regular key rotation (quarterly)

## 🔐 Keamanan

### Encryption Key

```bash
# Set di environment variable
export ENCRYPTION_KEY="your-secure-key-here-min-32-chars"

# JANGAN commit ke repository!
# JANGAN share via chat/email!
# GUNAKAN secret management (Vault, AWS Secrets Manager, etc)
```

### Trusted Paths

Repository di trusted paths tidak akan auto-encrypt:

```bash
# Add trusted path via API
POST /api/repository-protection/trusted-paths
{
  "repositoryId": "repo-uuid",
  "path": "/home/developer/projects/official"
}
```

## 📞 Support

Jika ada masalah:

1. **Check Dashboard**: Lihat alert dan activity logs
2. **Check System Logs**: `/var/log/app.log`
3. **Contact Security Team**: Untuk verifikasi manual
4. **Report Bug**: Via issue tracker

## 📝 Changelog

### v1.0.0 (Current)
- ✅ Auto-encryption on critical alerts
- ✅ Manual verification by admin
- ✅ Device authorization check
- ✅ Real-time notifications
- ✅ Complete audit trail
- ✅ Transparent access for authorized devices

## 🔗 Related Documentation

- [AUTO_ENCRYPTION_MECHANISM.md](./AUTO_ENCRYPTION_MECHANISM.md) - Technical details
- [REPOSITORY_PROTECTION_SYSTEM.md](./REPOSITORY_PROTECTION_SYSTEM.md) - Protection system
- [PANDUAN_MONITORING.md](./PANDUAN_MONITORING.md) - Monitoring guide
- [ACCESS_DETECTION_PROTECTION.md](./ACCESS_DETECTION_PROTECTION.md) - Access detection

---

**⚡ Quick Summary:**

Alert → Auto-Encrypt → Notify Admin → Manual Verify → Approve/Reject → Done

**🎯 Key Points:**

- Repository otomatis dienkripsi saat alert terdeteksi
- Admin harus verifikasi manual untuk decrypt
- Developer terotorisasi tidak terganggu
- Semua aksi tercatat di audit log
