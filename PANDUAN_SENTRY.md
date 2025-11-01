# Panduan Sentry - DevMonitor

Panduan lengkap integrasi Sentry untuk error tracking dan performance monitoring.

## 🚀 Quick Start

### 1. Buat Akun Sentry (Gratis)

1. Kunjungi [sentry.io](https://sentry.io)
2. Daftar dengan email atau GitHub
3. Buat 2 project baru:
   - **Backend** (Platform: Node.js)
   - **Frontend** (Platform: React)

### 2. Dapatkan DSN

Setelah membuat project:
1. Copy **DSN** dari Settings > Client Keys (DSN)
2. DSN berbentuk: `https://xxxxx@o0.ingest.sentry.io/0000000`

### 3. Konfigurasi Environment

Edit file `.env` di root project:

```env
# Backend Sentry
SENTRY_DSN=https://your-backend-dsn@o0.ingest.sentry.io/0000000
SENTRY_ENABLED=true

# Frontend Sentry  
REACT_APP_SENTRY_DSN=https://your-frontend-dsn@o0.ingest.sentry.io/0000000
REACT_APP_SENTRY_ENABLED=true
```

### 4. Restart Aplikasi

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd dashboard
npm start
```

### 5. Test Integrasi

**Test Backend:**
```bash
curl http://localhost:5000/api/test-sentry
```

**Test Frontend:**
- Buka browser: http://localhost:3000
- Buka Console Developer (F12)
- Jalankan: `throw new Error('Test Sentry!')`

### 6. Cek Sentry Dashboard

1. Buka [sentry.io/issues](https://sentry.io/issues)
2. Pilih project yang sesuai
3. Lihat error yang masuk!

## 📊 Fitur yang Tersedia

### ✅ Backend (Node.js)
- **Automatic Error Capture**: Semua error otomatis terdeteksi
- **Performance Tracking**: Monitor kecepatan API
- **Request Details**: Lihat detail setiap request yang error
- **CPU Profiling**: Analisa performa CPU
- **Stack Traces**: Error lengkap dengan stack trace

### ✅ Frontend (React)
- **React Error Boundary**: Tangkap error di component
- **Performance Monitoring**: Monitor kecepatan load page
- **Session Replay**: Tonton ulang sesi user saat error
- **User Feedback**: User bisa kirim feedback saat error
- **Route Tracking**: Track navigasi antar halaman

## 🔧 Cara Menggunakan

### Manual Error Capture di Backend

```javascript
const { captureException, captureMessage } = require('./config/sentry');

// Kirim error
try {
  // kode yang mungkin error
} catch (error) {
  captureException(error, {
    user: req.user?.email,
    action: 'checkout_repository'
  });
}

// Kirim message
captureMessage('User melakukan aksi penting', 'info', {
  userId: user.id
});
```

### Manual Error Capture di Frontend

```javascript
import { captureError, captureMessage, setUserContext } from './utils/sentry';

// Kirim error
try {
  // kode yang mungkin error
} catch (error) {
  captureError(error, {
    component: 'LoginForm',
    action: 'submit'
  });
}

// Set user info
setUserContext({
  id: user.id,
  email: user.email,
  name: user.name
});

// Kirim message
captureMessage('User berhasil login', 'info');
```

## 🎨 Error Page Custom

Error page otomatis muncul saat terjadi error di React:
- Tampilan user-friendly
- Tombol "Try Again" untuk retry
- Tombol "Go Home" untuk kembali ke home
- Tombol "Report Feedback" untuk kirim feedback ke Sentry
- Detail error (hanya di development mode)

## 🔐 Privasi & Keamanan

### Data yang TIDAK dikirim:
❌ Password  
❌ Token authorization  
❌ Cookie values  
❌ Data kartu kredit  

### Data yang dikirim:
✅ Error message & stack trace  
✅ URL request (tanpa parameter sensitif)  
✅ Email user (untuk tracking)  
✅ Metric performa  
✅ Info browser/OS  

## 💡 Tips & Trik

### Development Mode
```env
SENTRY_ENABLED=false
```
Sentry dinonaktifkan untuk development, aktifkan jika ingin test.

### Production Mode
```env
NODE_ENV=production
SENTRY_ENABLED=true
```
Sentry otomatis aktif di production.

### Kurangi Quota Usage
```env
# Capture 10% dari transaksi aja
SENTRY_TRACES_SAMPLE_RATE=0.1
REACT_APP_SENTRY_TRACES_SAMPLE_RATE=0.1
```

### Debug Mode
Tambahkan di config untuk troubleshooting:
```javascript
Sentry.init({
  dsn: '...',
  debug: true,  // Enable debug logging
});
```

## 📈 Monitoring di Sentry Dashboard

### Issues
- Lihat semua error yang terjadi
- Group error yang sama
- Track frekuensi error
- Set priority dan assign ke team

### Performance
- Monitor kecepatan API endpoints
- Lihat transaksi yang lambat
- Analisa bottleneck performa
- Track user timing

### Replays
- Tonton ulang session user
- Lihat apa yang user lakukan sebelum error
- Debug visual tanpa repro manual

### Releases
- Track error per deployment
- Compare error rate antar release
- Auto-assign error ke commit

## 🎯 Best Practices

### 1. Tag Error dengan Context
```javascript
captureException(error, {
  tags: {
    feature: 'repository_monitoring',
    severity: 'critical'
  },
  extra: {
    repositoryId: repo.id,
    userId: user.id
  }
});
```

### 2. Set User Context
```javascript
setUserContext({
  id: user.id,
  email: user.email,
  role: user.role
});
```

### 3. Add Breadcrumbs
```javascript
import { addBreadcrumb } from './utils/sentry';

addBreadcrumb({
  category: 'auth',
  message: 'User attempting login',
  level: 'info'
});
```

### 4. Filter Sensitive Data
Config Sentry sudah include filter untuk:
- Authorization headers
- Cookie values
- Password fields

## 🆓 Free Tier Limits

Sentry free tier sangat generous:
- **5,000 errors/month**
- **10,000 performance transactions/month**  
- **50 session replays/month**
- **1 user**
- **Unlimited projects**
- **90 days data retention**

Cukup untuk project kecil-menengah!

## 🔗 Resources

- [Dokumentasi Lengkap](SENTRY_INTEGRATION.md) - Panduan teknis detail
- [Quick Start English](SENTRY_SETUP_QUICK_START.md) - Quick guide in English
- [Sentry Docs](https://docs.sentry.io/) - Official documentation
- [Sentry Node.js](https://docs.sentry.io/platforms/node/) - Node.js guide
- [Sentry React](https://docs.sentry.io/platforms/javascript/guides/react/) - React guide

## ❓ Troubleshooting

### Error tidak terkirim ke Sentry?

**Cek:**
1. ✅ DSN sudah benar di `.env`
2. ✅ `SENTRY_ENABLED=true`
3. ✅ Restart aplikasi setelah ubah `.env`
4. ✅ Internet connection aktif
5. ✅ Firewall tidak block sentry.io

**Debug:**
```bash
# Cek environment variables
cd backend && node -e "console.log(process.env.SENTRY_DSN)"
cd dashboard && npm start
# Cek console untuk Sentry initialization message
```

### Terlalu banyak error masuk?

Filter error yang tidak penting:
```javascript
Sentry.init({
  dsn: '...',
  ignoreErrors: [
    'Network Error',
    'timeout of 0ms exceeded',
  ],
  denyUrls: [
    /extensions\//i,
    /^chrome:\/\//i,
  ],
});
```

### Data sensitif terkirim?

Tambahkan custom filter di `beforeSend`:
```javascript
beforeSend(event, hint) {
  // Remove sensitive fields
  if (event.request?.data?.password) {
    delete event.request.data.password;
  }
  return event;
}
```

## 🎓 Learning Path

1. ✅ Setup basic integration (5 menit)
2. ✅ Test error capture (5 menit)
3. 📖 Pelajari dashboard Sentry (15 menit)
4. 🔧 Configure alerts & notifications (10 menit)
5. 📊 Setup releases tracking (20 menit)
6. 🎯 Optimize sample rates (5 menit)

Total: ~1 jam untuk full setup!

## ✨ Kesimpulan

Sentry integration sudah lengkap di project ini:
- ✅ Backend error tracking
- ✅ Frontend error tracking
- ✅ Performance monitoring
- ✅ Session replay
- ✅ Privacy filters
- ✅ Custom error page

**Tinggal tambahkan DSN di `.env` dan restart!**

---

**Butuh bantuan?** Lihat [SENTRY_INTEGRATION.md](SENTRY_INTEGRATION.md) untuk panduan lengkap.
