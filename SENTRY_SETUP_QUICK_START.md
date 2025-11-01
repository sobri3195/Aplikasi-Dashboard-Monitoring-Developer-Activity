# Sentry Setup - Quick Start Guide

## 🎯 Quick Setup (5 minutes)

### 1. Create Sentry Account

1. Go to [sentry.io](https://sentry.io) and sign up for free
2. Create a new project for **Node.js** (Backend)
3. Create another project for **React** (Frontend)
4. Copy both DSN URLs

### 2. Configure Environment Variables

Create or edit `.env` file:

```env
# Backend Sentry
SENTRY_DSN=https://your-backend-dsn@o0.ingest.sentry.io/0000000
SENTRY_ENABLED=true

# Frontend Sentry
REACT_APP_SENTRY_DSN=https://your-frontend-dsn@o0.ingest.sentry.io/0000000
REACT_APP_SENTRY_ENABLED=true
```

### 3. Restart Application

```bash
# Restart backend
cd backend && npm start

# Restart frontend
cd dashboard && npm start
```

### 4. Test Integration

**Test Backend:**
```bash
curl http://localhost:5000/api/non-existent-endpoint
```

**Test Frontend:**
Add this component anywhere:
```javascript
function TestSentry() {
  return (
    <button onClick={() => { throw new Error('Test error!'); }}>
      Test Sentry
    </button>
  );
}
```

### 5. Verify in Sentry

1. Open your Sentry dashboard at [sentry.io/issues](https://sentry.io/issues)
2. You should see the test errors appear
3. Click on an error to see full details

## ✅ What's Already Configured

✅ Backend error tracking  
✅ Frontend error tracking  
✅ Performance monitoring  
✅ Session replay (frontend)  
✅ CPU profiling (backend)  
✅ React Router integration  
✅ Custom error boundary  
✅ Privacy filters (removes passwords, tokens, cookies)  

## 📚 Next Steps

- Read [SENTRY_INTEGRATION.md](SENTRY_INTEGRATION.md) for detailed guide
- Configure alert rules in Sentry dashboard
- Set up team notifications
- Customize error boundary UI
- Configure release tracking

## 🔒 Privacy

Sensitive data is automatically filtered:
- Passwords
- Authorization tokens
- Cookies
- Credit card numbers

## 💰 Pricing

Sentry offers a generous free tier:
- 5,000 errors/month
- 10,000 transactions/month
- 50 replays/month

Perfect for small to medium projects!

---

For detailed documentation, see [SENTRY_INTEGRATION.md](SENTRY_INTEGRATION.md)
