# Sentry Integration Guide

Aplikasi ini telah terintegrasi dengan Sentry untuk error tracking dan monitoring performa.

## 📋 Daftar Isi

- [Fitur Sentry](#fitur-sentry)
- [Setup Sentry](#setup-sentry)
- [Konfigurasi Backend](#konfigurasi-backend)
- [Konfigurasi Frontend](#konfigurasi-frontend)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## 🎯 Fitur Sentry

### Backend (Node.js)
- ✅ **Error Tracking**: Otomatis menangkap semua error yang terjadi di backend
- ✅ **Performance Monitoring**: Tracking performa API endpoints
- ✅ **Request/Response Tracking**: Monitor semua HTTP requests
- ✅ **Profiling**: CPU profiling untuk optimasi performa
- ✅ **Custom Context**: Informasi tambahan seperti user, IP, dan URL

### Frontend (React)
- ✅ **Error Boundary**: Menangkap React component errors
- ✅ **Browser Tracking**: Monitor performa aplikasi di browser
- ✅ **Session Replay**: Merekam ulang session saat terjadi error
- ✅ **User Feedback**: Dialog untuk user report error
- ✅ **React Router Integration**: Tracking page navigations

## 🚀 Setup Sentry

### 1. Buat Akun Sentry

1. Kunjungi [sentry.io](https://sentry.io) dan daftar akun gratis
2. Buat project baru untuk backend (Node.js)
3. Buat project baru untuk frontend (React)
4. Copy DSN dari masing-masing project

### 2. Konfigurasi Environment Variables

Edit file `.env` dan tambahkan:

```env
# Backend Sentry Configuration
SENTRY_DSN=https://your-backend-dsn@o0.ingest.sentry.io/0000000
SENTRY_ENABLED=true
SENTRY_TRACES_SAMPLE_RATE=1.0
SENTRY_PROFILES_SAMPLE_RATE=1.0

# Frontend Sentry Configuration
REACT_APP_SENTRY_DSN=https://your-frontend-dsn@o0.ingest.sentry.io/0000000
REACT_APP_SENTRY_ENABLED=true
REACT_APP_SENTRY_TRACES_SAMPLE_RATE=1.0
REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1
REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=1.0
```

### 3. Install Dependencies

Dependencies sudah terinstall otomatis:

**Backend:**
```json
{
  "@sentry/node": "^latest",
  "@sentry/profiling-node": "^latest"
}
```

**Frontend:**
```json
{
  "@sentry/react": "^latest"
}
```

## 🔧 Konfigurasi Backend

### Automatic Error Capture

Semua error otomatis dicapture oleh Sentry melalui middleware yang sudah terpasang di `backend/src/index.js`:

```javascript
const { 
  initSentry, 
  getSentryRequestHandler, 
  getSentryTracingHandler, 
  getSentryErrorHandler 
} = require('./config/sentry');

initSentry(app);

app.use(getSentryRequestHandler());
app.use(getSentryTracingHandler());
// ... routes ...
app.use(getSentryErrorHandler());
```

### Manual Error Capture

Untuk mengirim error secara manual:

```javascript
const { captureException, captureMessage } = require('./config/sentry');

// Capture exception
try {
  // your code
} catch (error) {
  captureException(error, {
    user: req.user?.email,
    context: 'additional context'
  });
}

// Capture message
captureMessage('Something important happened', 'info', {
  userId: user.id
});
```

### Security Features

Sentry configuration otomatis menghapus data sensitif:
- Cookie headers
- Authorization headers
- Password fields

## 🎨 Konfigurasi Frontend

### Automatic Error Capture

React Error Boundary sudah terpasang di `dashboard/src/App.js`:

```javascript
import * as Sentry from '@sentry/react';
import ErrorFallback from './components/ErrorFallback';

function App() {
  return (
    <Sentry.ErrorBoundary fallback={ErrorFallback} showDialog>
      {/* Your app */}
    </Sentry.ErrorBoundary>
  );
}
```

### Manual Error Capture

```javascript
import * as Sentry from '@sentry/react';

// Capture exception
try {
  // your code
} catch (error) {
  Sentry.captureException(error);
}

// Capture message
Sentry.captureMessage('User action completed', 'info');

// Set user context
Sentry.setUser({
  email: user.email,
  id: user.id
});

// Add breadcrumbs
Sentry.addBreadcrumb({
  category: 'auth',
  message: 'User logged in',
  level: 'info'
});
```

### Error Fallback UI

Custom error page tersedia di `dashboard/src/components/ErrorFallback.js` dengan fitur:
- Friendly error message
- Try again button
- Go home button
- Report feedback dialog
- Development error details

## 🧪 Testing

### Test Backend Error Capture

```bash
# Test endpoint yang menghasilkan error
curl -X POST http://localhost:5000/api/test-error

# Atau tambahkan endpoint test di backend:
# app.get('/test-sentry', (req, res) => {
#   throw new Error('Test Sentry error!');
# });
```

### Test Frontend Error Capture

Tambahkan test button di dashboard:

```javascript
function TestErrorButton() {
  const handleError = () => {
    throw new Error('Test Sentry error from React!');
  };

  return (
    <button onClick={handleError}>
      Test Error
    </button>
  );
}
```

### Verify in Sentry Dashboard

1. Buka [sentry.io](https://sentry.io/issues)
2. Pilih project yang sesuai
3. Lihat error yang masuk
4. Check performance monitoring
5. Review session replays (untuk frontend)

## 📊 Sample Rates Configuration

### Traces Sample Rate
- **1.0**: Capture 100% transaksi (development)
- **0.5**: Capture 50% transaksi
- **0.1**: Capture 10% transaksi (production recommended)

### Replays Sample Rate
- **Session**: 0.1 (10% of normal sessions)
- **On Error**: 1.0 (100% of sessions with errors)

### Profiles Sample Rate
- **1.0**: Profile 100% transactions (development)
- **0.1**: Profile 10% transactions (production)

## 🔐 Privacy & Security

### Data yang TIDAK dikirim ke Sentry:
- ❌ Passwords
- ❌ Authorization tokens
- ❌ Cookie values
- ❌ Credit card numbers
- ❌ Personal identification data

### Data yang dikirim:
- ✅ Error messages & stack traces
- ✅ Request URLs (without sensitive params)
- ✅ User email (untuk tracking, bisa dinonaktifkan)
- ✅ Performance metrics
- ✅ Browser/OS information

## 🌍 Environment Configuration

### Development
```env
NODE_ENV=development
SENTRY_ENABLED=false
```
- Sentry disabled by default
- Bisa diaktifkan dengan `SENTRY_ENABLED=true`
- Full error details di console

### Production
```env
NODE_ENV=production
SENTRY_ENABLED=true
SENTRY_TRACES_SAMPLE_RATE=0.1
```
- Sentry enabled otomatis
- Reduced sample rate untuk menghemat quota
- Error tracking aktif

## 🔄 Deployment

### Netlify

Tambahkan environment variables di Netlify Dashboard:
1. Go to Site Settings > Environment Variables
2. Tambahkan semua variable Sentry
3. Redeploy aplikasi

### Docker

Environment variables otomatis diload dari `.env`:
```bash
docker-compose up -d
```

## 🐛 Troubleshooting

### Sentry tidak mengirim errors

**Cek:**
1. Environment variables sudah benar
2. `SENTRY_ENABLED=true` di production
3. DSN valid dan tidak expired
4. Network tidak memblokir sentry.io
5. Check console untuk pesan error dari Sentry SDK

```javascript
// Add debug mode untuk testing
Sentry.init({
  dsn: '...',
  debug: true, // Enable debug mode
});
```

### Too many events

Kurangi sample rate:
```env
SENTRY_TRACES_SAMPLE_RATE=0.1
REACT_APP_SENTRY_TRACES_SAMPLE_RATE=0.1
```

### Sensitive data terkirim

Update `beforeSend` hook di config:
```javascript
beforeSend(event, hint) {
  // Remove sensitive data
  if (event.request?.data) {
    delete event.request.data.password;
  }
  return event;
}
```

## 📚 Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Sentry Node.js Guide](https://docs.sentry.io/platforms/node/)
- [Sentry React Guide](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)

## 📞 Support

Untuk bantuan lebih lanjut:
- Sentry Support: https://sentry.io/support/
- Community Forum: https://forum.sentry.io/

## ✅ Checklist Implementasi

- [x] Install Sentry packages (backend & frontend)
- [x] Configure backend integration
- [x] Configure frontend integration
- [x] Add error boundary with custom UI
- [x] Configure environment variables
- [x] Add privacy filters for sensitive data
- [x] Enable performance monitoring
- [x] Enable session replay (frontend)
- [x] Enable profiling (backend)
- [x] Test error capture
- [x] Document configuration
- [ ] Get Sentry DSN from sentry.io
- [ ] Update .env with real DSN
- [ ] Test in production
- [ ] Configure alert rules in Sentry dashboard
- [ ] Set up team notifications

---

**Catatan:** Sentry memiliki free tier yang generous untuk project kecil. Untuk production dengan traffic tinggi, pertimbangkan untuk upgrade ke paid plan.
