# Panduan LocalStorage & Input Repository

## 🎯 Fitur Utama

Dashboard DevMonitor sekarang **100% aktif tanpa backend**! Semua data tersimpan di browser menggunakan LocalStorage.

## 📍 Lokasi Input Repository

### Cara Akses Halaman Repositories:

1. **Login ke Dashboard**
2. **Klik menu "Repositories"** di sidebar kiri
3. Anda akan melihat tombol **"Add Repository"** di kanan atas

## ➕ Menambah Repository Baru

### Langkah-langkah:

1. **Buka halaman Repositories** (`/repositories`)

2. **Klik tombol "Add Repository"** (biru, dengan icon plus)

3. **Isi Form** yang muncul:
   ```
   ┌─────────────────────────────────────┐
   │  Add New Repository           [X]   │
   ├─────────────────────────────────────┤
   │                                     │
   │  Repository Name *                  │
   │  [_________________________]       │
   │                                     │
   │  Repository Path                    │
   │  [_________________________]       │
   │                                     │
   │  GitLab URL                        │
   │  [_________________________]       │
   │                                     │
   │  Security Status                    │
   │  [▼ Secure ____________]           │
   │                                     │
   │  ☐ Enable Encryption               │
   │                                     │
   │     [Cancel]  [Add Repository]     │
   └─────────────────────────────────────┘
   ```

4. **Contoh Pengisian:**
   - **Repository Name**: `my-awesome-project` *(wajib diisi)*
   - **Repository Path**: `/home/user/projects/my-awesome-project`
   - **GitLab URL**: `https://gitlab.com/username/my-awesome-project`
   - **Security Status**: Pilih salah satu:
     - `Secure` - Repository aman
     - `Warning` - Ada peringatan keamanan
     - `Compromised` - Repository terkompromi
     - `Encrypted` - Repository terenkripsi
   - **Enable Encryption**: Centang jika ingin mengaktifkan enkripsi

5. **Klik "Add Repository"**

6. Repository baru akan muncul di daftar! ✅

## ✏️ Edit Repository

1. Di halaman Repositories, cari repository yang ingin diedit
2. Klik icon **pensil** (✏️) di kolom "Actions"
3. Form edit akan muncul dengan data yang sudah terisi
4. Ubah data yang diperlukan
5. Klik **"Update Repository"**

## 🗑️ Hapus Repository

1. Di halaman Repositories, cari repository yang ingin dihapus
2. Klik icon **trash** (🗑️) di kolom "Actions"
3. Konfirmasi penghapusan
4. Repository terhapus dari localStorage

## 🔓 Decrypt Repository

Untuk repository yang terenkripsi:
1. Klik tombol **"Decrypt"** pada repository
2. Konfirmasi aksi
3. Status enkripsi akan berubah

## 📊 Field Repository

| Field | Wajib | Deskripsi | Contoh |
|-------|-------|-----------|---------|
| **Repository Name** | Ya | Nama repository | `backend-api` |
| **Repository Path** | Tidak | Path lokal repository | `/repos/backend-api` |
| **GitLab URL** | Tidak | URL GitLab repository | `https://gitlab.com/user/repo` |
| **Security Status** | Ya | Status keamanan | `SECURE`, `WARNING`, `COMPROMISED` |
| **Enable Encryption** | Tidak | Aktifkan enkripsi | Checkbox |

## 🎨 Screenshot Lokasi

```
┌─────────────────────────────────────────────────────────┐
│  DevMonitor Dashboard                            [👤]   │
├─────┬───────────────────────────────────────────────────┤
│     │                                                   │
│  🏠 │  Repositories              [+ Add Repository]    │
│  👥 │  Monitor and manage repository security status  │
│  💻 │  ─────────────────────────────────────────────  │
│  📊 │                                                   │
│  🔔 │  📊 Statistics Cards                             │
│  🔐 │  [Total: 5] [Encrypted: 4] [Compromised: 1]    │
│     │                                                   │
│ >>> │  📋 Repository List                              │
│  🔄 │  ┌──────────────────────────────────────────┐   │
│     │  │ Name    │ Status  │ Encrypted │ Actions  │   │
│     │  ├──────────────────────────────────────────┤   │
│     │  │ proj-1  │ SECURE  │ Yes       │ ✏️ 🔓 🗑️ │   │
│     │  │ proj-2  │ WARNING │ Yes       │ ✏️ 🔓 🗑️ │   │
│     │  └──────────────────────────────────────────┘   │
└─────┴───────────────────────────────────────────────────┘
```

## 💡 Tips Penggunaan

### 1. Data Persisten
- Semua data tersimpan di browser Anda
- Tidak akan hilang saat refresh
- Tetap ada saat Anda buka lagi nanti

### 2. Tidak Perlu Backend
- Aplikasi langsung jalan
- Tidak perlu setup server
- Perfect untuk demo dan development

### 3. Quick Testing
- Tambah repository test dengan cepat
- Edit dan hapus sesuka hati
- Lihat langsung hasilnya

### 4. Bulk Operations
- Tambah banyak repository sekaligus
- Semua tersimpan otomatis
- Dashboard update real-time

## 🔄 Fitur Auto-Update

### Dashboard Statistics
Setiap kali Anda tambah/edit/hapus repository:
- ✅ Total repositories otomatis update
- ✅ Encrypted count otomatis update
- ✅ Compromised count otomatis update
- ✅ Security score recalculated
- ✅ Chart activity terupdate

### Real-time Updates
Tidak perlu refresh page:
- Tambah repository → langsung muncul di list
- Edit repository → data langsung berubah
- Hapus repository → langsung hilang dari list

## 🛠️ Advanced Features

### Export Data
Backup repository data Anda:
```javascript
// Buka Console (F12)
const data = localStorageService.exportData();
console.log(data.repositories);
// Copy dan save ke file
```

### Import Data
Restore dari backup:
```javascript
const backup = { /* data backup Anda */ };
localStorageService.importData(backup);
```

### Reset Data
Kembalikan ke data awal:
```javascript
localStorageService.resetData();
// Atau dari console:
localStorage.clear();
location.reload();
```

## 🔍 Monitoring & Debugging

### Lihat Data di Console
```javascript
// Lihat semua repositories
console.log(localStorage.getItem('devmonitor_repositories'));

// Lihat semua data
Object.keys(localStorage)
  .filter(k => k.startsWith('devmonitor_'))
  .forEach(k => console.log(k, localStorage.getItem(k)));
```

### Check Storage Usage
```javascript
// Cek berapa besar data yang tersimpan
let total = 0;
for(let key in localStorage) {
  if(localStorage.hasOwnProperty(key) && key.startsWith('devmonitor_')) {
    total += localStorage[key].length + key.length;
  }
}
console.log(`Total: ${(total / 1024).toFixed(2)} KB`);
```

## ❓ FAQ

### Q: Data hilang setelah restart browser?
**A:** Jangan gunakan mode Incognito/Private. Gunakan browser normal agar data persisten.

### Q: Bisa sync antar device?
**A:** Saat ini data tersimpan lokal per browser. Untuk sync, perlu backend.

### Q: Berapa limit repository yang bisa ditambah?
**A:** LocalStorage limit ~5-10MB. Bisa ribuan repositories.

### Q: Apakah data aman?
**A:** Data tersimpan lokal di browser Anda. Tidak dikirim kemana-mana. Tapi tidak terenkripsi, jadi jangan simpan data sensitif.

### Q: Bisa import dari GitLab?
**A:** Saat ini manual input. Future feature: auto-import dari GitLab API.

### Q: Kenapa nama harus diisi?
**A:** Nama adalah field wajib untuk identifikasi repository.

## 🎯 Use Cases

### 1. Demo & Presentasi
- Tambah sample repositories dengan cepat
- Tunjukkan fitur dashboard
- Tidak perlu setup backend

### 2. Development & Testing
- Test UI tanpa backend
- Rapid prototyping
- Local development

### 3. Offline Usage
- Bekerja tanpa internet
- Data tetap tersimpan
- Sync nanti saat online (future)

### 4. Learning & Training
- Pelajari cara kerja sistem
- Eksperimen dengan data
- Reset kapan saja

## 📞 Bantuan

Jika ada masalah:

1. **Check Console** - Lihat error di Developer Tools (F12)
2. **Check LocalStorage** - Pastikan data tersimpan
3. **Try Reset** - Gunakan `resetData()` untuk mulai fresh
4. **Clear Browser Cache** - Kadang perlu clear cache
5. **Contact Support** - Hubungi tim developer

## 🚀 Next Steps

Setelah familiar dengan input repository:

1. ✅ Explore halaman **Users** - Manage pengguna
2. ✅ Explore halaman **Devices** - Monitor devices
3. ✅ Explore halaman **Activities** - Lihat log aktivitas
4. ✅ Explore halaman **Alerts** - Manage security alerts
5. ✅ Explore halaman **Security** - Atur security settings

Semua halaman **sudah fully functional dengan localStorage**!

## 📚 Dokumentasi Lengkap

- [LOCALSTORAGE_OFFLINE_MODE.md](LOCALSTORAGE_OFFLINE_MODE.md) - Dokumentasi teknis lengkap
- [README.md](README.md) - Main documentation
- [FEATURES.md](FEATURES.md) - Complete features list

---

**Happy Coding! 🎉**

Sekarang Anda sudah tahu dimana dan bagaimana input repository! Silahkan explore dan coba semua fitur yang tersedia.
