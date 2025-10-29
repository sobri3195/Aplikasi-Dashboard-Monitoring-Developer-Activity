# LocalStorage Offline Mode

## Overview
Aplikasi DevMonitor sekarang sudah sepenuhnya berfungsi secara **offline** dengan menggunakan **localStorage** untuk penyimpanan data. Semua fitur aktif tanpa memerlukan backend.

## Fitur Utama

### ✅ Mode Offline Penuh
- Semua fitur berfungsi tanpa koneksi backend
- Data tersimpan di browser menggunakan localStorage
- Perubahan data langsung tersimpan secara lokal

### 🗂️ Manajemen Data

#### 1. **Repositories (Input & Management)**
Lokasi: `/repositories`

**Fitur yang tersedia:**
- ➕ **Tambah Repository Baru** - Klik tombol "Add Repository"
- ✏️ **Edit Repository** - Klik icon pensil pada repository
- 🗑️ **Hapus Repository** - Klik icon trash pada repository
- 🔓 **Decrypt Repository** - Untuk repository yang terenkripsi

**Form Input Repository:**
- **Repository Name*** (required) - Nama repository
- **Repository Path** - Path lokasi repository
- **GitLab URL** - URL ke GitLab repository
- **Security Status** - Pilihan: Secure, Warning, Compromised, Encrypted
- **Enable Encryption** - Checkbox untuk mengaktifkan enkripsi

#### 2. **Users**
- Melihat daftar pengguna
- Menambah pengguna baru
- Mengedit data pengguna
- Menghapus pengguna

#### 3. **Devices**
- Monitor perangkat
- Update status perangkat
- Authorize/Block perangkat

#### 4. **Activities**
- Melihat log aktivitas
- Data activity terupdate otomatis

#### 5. **Alerts**
- Notifikasi keamanan
- Mark as read/unread
- Hapus alert

#### 6. **Security Settings**
- Update pengaturan keamanan
- Tersimpan langsung di localStorage

## Struktur LocalStorage

Data disimpan dengan key berikut:
```
devmonitor_users          - Data pengguna
devmonitor_devices        - Data perangkat
devmonitor_activities     - Log aktivitas
devmonitor_repositories   - Data repository
devmonitor_alerts         - Alert keamanan
devmonitor_security_settings - Pengaturan keamanan
devmonitor_dashboard      - Data dashboard
devmonitor_initialized    - Flag inisialisasi
```

## Cara Menggunakan

### Akses Aplikasi
1. Buka aplikasi di browser
2. Login dengan akun demo atau buat akun baru
3. Semua data akan tersimpan di localStorage browser Anda

### Menambah Repository Baru
1. Buka halaman **Repositories** dari menu navigasi
2. Klik tombol **"Add Repository"** di kanan atas
3. Isi form dengan data repository:
   - Masukkan nama repository (wajib)
   - Isi path repository (opsional)
   - Isi GitLab URL (opsional)
   - Pilih status keamanan
   - Centang "Enable Encryption" jika ingin mengaktifkan enkripsi
4. Klik **"Add Repository"**
5. Repository baru akan muncul di list

### Edit Repository
1. Di halaman Repositories, klik icon **pensil** (✏️) pada repository yang ingin diedit
2. Update data yang diperlukan
3. Klik **"Update Repository"**

### Hapus Repository
1. Di halaman Repositories, klik icon **trash** (🗑️) pada repository yang ingin dihapus
2. Konfirmasi penghapusan
3. Repository akan terhapus dari localStorage

## Fitur LocalStorage Service

### API Methods
```javascript
// Import service
import localStorageService from './services/localStorageService';

// Repositories
localStorageService.getRepositories()
localStorageService.addRepository(data)
localStorageService.updateRepository(id, updates)
localStorageService.deleteRepository(id)
localStorageService.getRepositoryStats()

// Users
localStorageService.getUsers()
localStorageService.addUser(data)
localStorageService.updateUser(id, updates)
localStorageService.deleteUser(id)

// Devices
localStorageService.getDevices()
localStorageService.addDevice(data)
localStorageService.updateDevice(id, updates)
localStorageService.deleteDevice(id)

// Activities
localStorageService.getActivities()
localStorageService.addActivity(data)

// Alerts
localStorageService.getAlerts()
localStorageService.addAlert(data)
localStorageService.updateAlert(id, updates)
localStorageService.deleteAlert(id)

// Dashboard
localStorageService.getDashboard()
localStorageService.updateDashboardStats()

// Security Settings
localStorageService.getSecuritySettings()
localStorageService.updateSecuritySettings(settings)

// Utility
localStorageService.resetData()          // Reset ke data awal
localStorageService.exportData()         // Export semua data
localStorageService.importData(data)     // Import data
```

## Data Persistence

### Automatic Save
- Semua perubahan langsung tersimpan ke localStorage
- Tidak perlu save manual
- Data tetap ada setelah refresh browser

### Dashboard Auto-Update
- Dashboard stats otomatis terupdate saat ada perubahan data
- Security score dihitung berdasarkan:
  - Jumlah repository yang compromised
  - Persentase enkripsi repository
  - Jumlah pending devices
  - Jumlah critical alerts

### Activity Trend
- Chart activity trend otomatis terhitung
- Berdasarkan data 7 hari terakhir
- Update setiap ada activity baru

## Reset Data

Untuk reset data ke kondisi awal:
```javascript
import localStorageService from './services/localStorageService';
localStorageService.resetData();
```

Atau hapus manual dari browser:
1. Buka Developer Tools (F12)
2. Pilih tab "Application" atau "Storage"
3. Pilih "Local Storage"
4. Hapus semua key yang dimulai dengan `devmonitor_`

## Export/Import Data

### Export Data
```javascript
const data = localStorageService.exportData();
console.log(data);
// Save to file or backup
```

### Import Data
```javascript
const backupData = { /* your data */ };
localStorageService.importData(backupData);
```

## Browser Compatibility

LocalStorage didukung oleh semua browser modern:
- ✅ Chrome/Edge (v4+)
- ✅ Firefox (v3.5+)
- ✅ Safari (v4+)
- ✅ Opera (v11.5+)
- ✅ iOS Safari (v3.2+)
- ✅ Android Browser (v2.1+)

## Storage Limits

- Limit localStorage: **5-10MB** per domain
- Data saat ini menggunakan: **~100KB**
- Masih banyak space tersedia untuk data tambahan

## Security Notes

⚠️ **Penting:**
- Data di localStorage **tidak terenkripsi** di browser
- Jangan simpan data sensitif seperti password atau token API
- Gunakan untuk development dan demo purposes
- Untuk production, gunakan backend dengan database yang aman

## Tips & Tricks

### Backup Regular
Lakukan backup data secara berkala:
```javascript
// Copy data ke clipboard
const data = localStorageService.exportData();
navigator.clipboard.writeText(JSON.stringify(data, null, 2));
```

### Clear Specific Data
Hapus hanya data tertentu:
```javascript
localStorage.removeItem('devmonitor_repositories');
// Lalu reload page untuk reinitialize
```

### Debug Mode
Lihat semua data localStorage:
```javascript
// Di browser console
Object.keys(localStorage)
  .filter(key => key.startsWith('devmonitor_'))
  .forEach(key => {
    console.log(key, JSON.parse(localStorage.getItem(key)));
  });
```

## Troubleshooting

### Data Tidak Muncul
1. Check apakah localStorage enabled di browser
2. Check quota localStorage belum penuh
3. Coba reset data: `localStorageService.resetData()`

### Data Hilang Setelah Refresh
- Pastikan tidak menggunakan Incognito/Private mode
- Check browser settings untuk localStorage

### Error "QuotaExceededError"
- Clear data lama yang tidak diperlukan
- Gunakan `resetData()` untuk clear semua
- Increase browser storage limit (jika memungkinkan)

## Development

File-file terkait:
- `dashboard/src/services/localStorageService.js` - Main localStorage service
- `dashboard/src/services/mockData.js` - Mock data dan response handler
- `dashboard/src/services/api.js` - API interceptor untuk offline mode
- `dashboard/src/pages/Repositories.js` - Repository management UI

## Future Enhancements

Rencana pengembangan:
- [ ] Sync dengan backend (optional)
- [ ] Compression untuk data besar
- [ ] IndexedDB sebagai alternatif
- [ ] Export/Import UI
- [ ] Data migration tools
- [ ] Batch operations
- [ ] Undo/Redo functionality

## Support

Jika ada masalah atau pertanyaan:
1. Check dokumentasi ini
2. Check browser console untuk error
3. Try reset data
4. Contact developer team
