# Panduan Verifikasi Device ID dan Proteksi Copy/Move

## Ringkasan Sistem

Sistem ini melindungi repository dengan:
1. **Verifikasi Device ID** - Hanya device yang terdaftar yang bisa akses
2. **Deteksi Copy/Move** - Otomatis mendeteksi jika repository di-copy atau dipindahkan
3. **Auto-Encryption** - Langsung encrypt repository yang di-copy ke lokasi tidak diizinkan

## Alur 1: Verifikasi Device Saat Clone

### Langkah-langkah:

1. **Developer clone repository**
   ```bash
   git clone https://github.com/company/project.git
   cd project
   ```

2. **Sistem otomatis cek Device ID**
   - Generate device fingerprint
   - Cek ke dashboard apakah device terdaftar
   - Cek status approval

3. **Hasil Pengecekan:**

   ❌ **Device TIDAK terdaftar:**
   ```
   ❌ Device not registered!
   
   Silakan daftarkan device Anda:
   python3 monitoring-agent/repo_protection_agent.py register --device-name "Laptop Saya"
   ```

   ⏳ **Device terdaftar tapi BELUM diapprove:**
   ```
   ❌ Device status is PENDING. Approval required.
   
   Tunggu admin menyetujui device Anda di dashboard.
   ```

   ✅ **Device terdaftar dan APPROVED:**
   ```
   ✅ Device verified successfully
   Repository access authorized
   ```

## Alur 2: Proteksi Copy/Move

### Kapan Proteksi Aktif:

Sistem mendeteksi dan melindungi saat:

1. **Repository di-copy ke USB**
   ```
   Original: /home/user/projects/repo
   USB Copy: /media/usb/repo  ← TERDETEKSI & DIBLOKIR!
   ```

2. **Repository dipindahkan ke folder lain**
   ```
   Original: /home/user/projects/repo
   Moved:    /home/user/other/repo  ← TERDETEKSI & DIBLOKIR!
   ```

3. **Repository di-copy lalu diakses device lain**
   ```
   Device A di laptop → copy ke USB → paste di Device B
   Saat Device B akses → TERDETEKSI & DIBLOKIR!
   ```

### Apa yang Terjadi Saat Terdeteksi:

```
⚠️  SECURITY ALERT: UNAUTHORIZED REPOSITORY COPY DETECTED
======================================================================

📍 Lokasi Original: /home/user/projects/project
📍 Lokasi Sekarang: /media/usb/project

🔒 Tindakan: Repository di-encrypt dan akses diblokir

💬 Pesan: Hubungi administrator untuk restore akses.
======================================================================

1. ✅ Alert dikirim ke dashboard
2. 🔒 Repository di-encrypt otomatis
3. 🚫 Akses di-block total
4. 📝 Activity di-log
```

## Cara Daftar Device

### 1. Daftarkan Device Baru

```bash
# Set environment variables
export API_URL="http://localhost:5000"
export API_TOKEN="your-jwt-token-here"
export REPO_ID="repository-id"

# Daftarkan device
python3 monitoring-agent/repo_protection_agent.py register \
    --device-name "Laptop Saya" \
    --api-url "$API_URL" \
    --token "$API_TOKEN"
```

### 2. Device Fingerprint

Sistem otomatis generate fingerprint dari:
- Hostname computer
- Platform (Windows/Linux/Mac)
- Architecture (x64, ARM, dll)
- MAC address (di-hash untuk keamanan)

### 3. Tunggu Approval

- Status awal: **PENDING**
- Admin review di dashboard
- Admin approve/reject device
- Status jadi: **APPROVED** atau **REJECTED**

### 4. Mulai Bekerja

Setelah approved:
```bash
git pull   # ✅ Works
git commit # ✅ Works
git push   # ✅ Works
```

## Trusted Paths (Jalur yang Dipercaya)

Admin bisa menambahkan trusted paths untuk lokasi yang diizinkan.

### Contoh Use Case:

**Deployment Server:**
```
Admin add: /var/www/production
→ Repository di /var/www/production boleh dan tidak akan di-block
```

**Development Multiple Locations:**
```
Admin add: /home/user/dev
Admin add: /home/user/projects
→ Boleh pindah antara kedua folder ini
```

### Command untuk Admin:

**Tambah trusted path:**
```bash
curl -X POST http://localhost:5000/api/repository-protection/trusted-paths/add \
  -H "Authorization: Bearer admin-token" \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryId": "repo-uuid",
    "trustedPath": "/var/www/production"
  }'
```

## Git Hooks yang Aktif

### post-checkout
- Jalan setelah `git clone`
- Jalan setelah `git checkout`
- Cek device ID
- Cek lokasi repository
- Block jika tidak authorized

### pre-commit
- Jalan sebelum `git commit`
- Verify device masih approved
- Cek repository belum dipindah
- Block commit jika ada masalah

### pre-push
- Jalan sebelum `git push`
- Verify repository integrity
- Cek device authorization
- Block push jika tidak aman

## File Metadata

### .repo-metadata.json
Menyimpan informasi original:
```json
{
  "repository_id": "project-123",
  "original_location": "/home/user/projects/project",
  "created_at": "2024-01-15T09:00:00Z",
  "device_fingerprint": "abc123...",
  "trusted_paths": ["/var/www/production"]
}
```

### .repo-encrypted.lock
Dibuat saat repository di-encrypt:
```json
{
  "encrypted": true,
  "reason": "UNAUTHORIZED_COPY_DETECTED",
  "original_location": "/home/user/projects/project",
  "detected_location": "/media/usb/project"
}
```

## Troubleshooting

### 🔴 Error: "Device not registered"

**Solusi:**
```bash
python3 monitoring-agent/repo_protection_agent.py register \
    --device-name "Laptop Saya"
```

### 🔴 Error: "Device status is PENDING"

**Solusi:**
- Tunggu admin approve
- Hubungi administrator
- Cek status di dashboard

### 🔴 Error: "Repository is encrypted"

**Penyebab:**
- Repository di-copy ke lokasi unauthorized
- Copy detection menemukan pelanggaran

**Solusi:**
1. Hubungi administrator
2. Admin decrypt via dashboard
3. Kembali ke lokasi original atau
4. Admin tambahkan lokasi ke trusted paths

### 🔴 Error: "Repository location verification failed"

**Penyebab:**
- Repository dipindah dari lokasi original
- Lokasi sekarang bukan trusted path

**Solusi:**
1. Pindah kembali ke lokasi original, ATAU
2. Minta admin tambahkan lokasi ke trusted paths, ATAU
3. Clone ulang dari source

## Skenario Penggunaan

### Skenario 1: Developer Baru Join Tim

```
1. Developer clone repository ✅
2. Post-checkout hook jalan
3. Device tidak terdaftar ❌
4. Developer register device ✅
5. Status: PENDING ⏳
6. Admin approve di dashboard ✅
7. Developer bisa mulai coding ✅
```

### Skenario 2: Developer Copy ke USB (TIDAK DIIZINKAN)

```
1. Developer copy repo ke USB
2. Teman ambil copy dari USB
3. Teman paste di laptop nya
4. Teman coba akses/commit
5. Copy detection trigger 🚨
6. Repository langsung di-encrypt 🔒
7. Alert ke dashboard 📢
8. Akses di-block total 🚫
```

### Skenario 3: Deployment ke Production (DIIZINKAN)

```
1. Admin tambah /var/www/production ke trusted paths ✅
2. Repository di-deploy ke /var/www/production
3. Copy detection cek lokasi
4. Lokasi ada di trusted paths ✅
5. Deployment jalan normal ✅
```

## Keuntungan Keamanan

### ✅ Mencegah:

1. **Akses Device Tidak Authorized**
   - Hanya device terdaftar bisa akses
   - Perlu approval admin
   - Device fingerprint unik

2. **Copy Repository ke USB**
   - Otomatis terdeteksi
   - Langsung di-encrypt
   - Tidak bisa dipakai

3. **Move Repository Unauthorized**
   - Location tracking aktif
   - Harus di trusted path
   - Di-block jika tidak

4. **Pencurian Data**
   - Copy tidak bisa dipakai
   - Ter-encrypt otomatis
   - Semua tercatat di log

## Instalasi

### 1. Install Dependencies

```bash
cd monitoring-agent
pip install -r requirements.txt
```

### 2. Install Git Hooks

```bash
python3 monitoring-agent/install_git_hooks.py install
```

### 3. Setup Environment

```bash
cp .env.example .env
# Edit .env dengan setting Anda
```

File `.env`:
```env
API_URL=http://localhost:5000
API_TOKEN=your-jwt-token-here
REPO_ID=your-repository-id
ENCRYPTION_KEY=your-encryption-key
```

## Command Reference

### Daftar Device
```bash
python3 monitoring-agent/repo_protection_agent.py register \
    --device-name "Nama Device"
```

### Cek Status Device
```bash
python3 monitoring-agent/repo_protection_agent.py status \
    --repo-path "."
```

### Verify Access
```bash
python3 monitoring-agent/repo_protection_agent.py verify \
    --repo-id "repo-uuid" \
    --repo-path "."
```

### Monitor Copy Detection
```bash
python3 monitoring-agent/copy_detection_monitor.py \
    --repo-id "repo-uuid" \
    --repo-path "." \
    --watch
```

## Dashboard

### Untuk Admin:

1. **Device Management**
   - Lihat semua device yang terdaftar
   - Approve/Reject device baru
   - Lihat device fingerprint
   - Monitor device activity

2. **Trusted Paths**
   - Tambah trusted path baru
   - Hapus trusted path
   - Lihat list trusted paths per repo

3. **Alerts**
   - Monitor copy detection alerts
   - Lihat unauthorized access attempts
   - Review suspicious activities

4. **Actions**
   - Decrypt repository (jika perlu)
   - Force encrypt repository
   - Block/Unblock access

## Best Practices

### Untuk Developer:

✅ **DO:**
- Daftarkan device sebelum clone
- Tunggu approval dari admin
- Kerja di lokasi original repository
- Contact admin jika perlu pindah lokasi

❌ **DON'T:**
- Jangan copy ke USB
- Jangan pindah repository tanpa izin
- Jangan share repository copy
- Jangan bypass security

### Untuk Admin:

✅ **DO:**
- Review device registration cepat
- Setup trusted paths untuk deployment
- Monitor alerts secara regular
- Maintain audit logs

## Dukungan

Jika ada masalah:

1. Cek bagian Troubleshooting di atas
2. Lihat logs di dashboard
3. Hubungi system administrator
4. Baca dokumentasi lengkap: `DEVICE_ID_VERIFICATION_GUIDE.md`

## Kesimpulan

Sistem ini memberikan proteksi komprehensif dengan:

- 🔒 Verifikasi device ID otomatis
- 📍 Tracking lokasi repository
- 🚨 Deteksi copy/move real-time
- 🔐 Auto-encryption jika unauthorized
- 📊 Logging lengkap untuk audit
- ⚡ Blocking access instant
- 👮 Approval workflow untuk device

Sambil tetap fleksibel dengan trusted paths untuk use case legitimate seperti deployment dan development multi-lokasi.
