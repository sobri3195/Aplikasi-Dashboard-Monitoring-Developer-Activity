# 🚀 Quick Setup: Monitoring dan Notifikasi

Panduan cepat untuk setup monitoring dashboard dan notifikasi Slack/Telegram dalam 5 menit.

## ✅ Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Backend dan Dashboard sudah terinstall

## 📝 Step-by-Step Setup

### 1. Setup Backend (2 menit)

#### A. Configure Environment Variables

Edit `backend/.env`:

```env
# Slack Integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_ENABLED=true

# Telegram Integration  
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
TELEGRAM_ENABLED=true
```

#### B. Start Backend

```bash
cd backend
npm install
npm start
```

Backend akan berjalan di `http://localhost:5000`

### 2. Setup Slack (1 menit)

#### Option 1: Quick Setup
1. Buka https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Nama: "DevMonitor"
4. Pilih workspace
5. Sidebar: "Incoming Webhooks" → Toggle ON
6. "Add New Webhook to Workspace"
7. Pilih channel (misal: #security-alerts)
8. Copy Webhook URL
9. Paste ke `.env` → `SLACK_WEBHOOK_URL`

#### Option 2: Test Without Setup
Skip Slack untuk sementara:
```env
SLACK_ENABLED=false
```

### 3. Setup Telegram (1 menit)

#### Option 1: Quick Setup
1. Buka Telegram, cari `@BotFather`
2. Kirim `/newbot`
3. Follow instructions
4. Copy Bot Token
5. Kirim pesan ke bot: `/start`
6. Dapatkan Chat ID:
   - Add bot `@userinfobot`
   - Kirim `/start`
   - Copy Chat ID
7. Paste ke `.env`:
   ```env
   TELEGRAM_BOT_TOKEN=<your-bot-token>
   TELEGRAM_CHAT_ID=<your-chat-id>
   ```

#### Option 2: Test Without Setup
Skip Telegram untuk sementara:
```env
TELEGRAM_ENABLED=false
```

### 4. Access Monitoring Dashboard (1 menit)

#### A. Start Dashboard
```bash
cd dashboard
npm install
npm start
```

Dashboard akan buka di `http://localhost:3000`

#### B. Login
```
Email: admin@devmonitor.com
Password: admin123456
```

#### C. Open Monitoring Page
Click menu **"Monitoring"** di sidebar atau buka:
```
http://localhost:3000/monitoring
```

## 🧪 Test Your Setup

### Test 1: Dashboard Access
- ✅ Dashboard terbuka
- ✅ Menu Monitoring muncul
- ✅ Data tampil (bisa kosong jika database baru)
- ✅ Status "Connected" di sidebar (hijau)

### Test 2: Test Slack (jika sudah setup)
```bash
curl -X POST http://localhost:5000/api/notifications/test/slack \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

Cek Slack channel untuk test message.

### Test 3: Test Telegram (jika sudah setup)
```bash
curl -X POST http://localhost:5000/api/notifications/test/telegram \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

Cek Telegram bot untuk test message.

### Test 4: Real-time Updates
1. Buka Monitoring page
2. Di tab lain, trigger activity (via agent atau manual)
3. Dashboard harus update otomatis (tanpa refresh)

## 📊 What You Should See

### Monitoring Dashboard
```
┌─────────────────────────────────────┐
│  MONITORING REAL-TIME               │
├─────────────────────────────────────┤
│                                     │
│  [Device Authorized]  [Repo Aman]  │
│        7                  8         │
│                                     │
│  ┌─ Aktivitas Developer (Live) ─┐  │
│  │  🟢 Clone backend-api         │  │
│  │  🟢 Pull frontend-app         │  │
│  │  🟢 Push ml-models            │  │
│  └─────────────────────────────┘  │
│                                     │
│  ┌─ Status Device ───────────┐    │
│  │  🟢 John's Laptop          │    │
│  │  🟢 Jane's MacBook         │    │
│  │  🔴 Unknown Device         │    │
│  └────────────────────────────┘    │
│                                     │
│  ┌─ Security Alerts ──────────┐    │
│  │  ⚠️ Unauthorized access     │    │
│  │  🚨 Repo copy detected      │    │
│  └────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Notification Example (Slack/Telegram)

When unauthorized access detected:
```
⚠️ UNAUTHORIZED DEVICE

User: unknown@example.com
Device: xyz789ab
Repository: confidential-project
Severity: CRITICAL

⚠️ Unauthorized clone detected from 
unregistered device [Device ID: xyz789ab]. 
Repo auto-encrypted.

Time: 15 Jan 2024, 14:30
```

## 🎯 Quick Features Overview

### Real-time Monitoring
- ✅ Live activity feed (auto-update)
- ✅ Device status tracking
- ✅ Repository security indicators
- ✅ Alert history with system responses

### Notifications
- ✅ Slack integration (team notifications)
- ✅ Telegram bot (personal alerts)
- ✅ Dashboard notifications (real-time)

### Security Indicators
- 🟢 **Aman (SECURE)**: Repository aman
- 🟡 **Terduga (WARNING)**: Ada aktivitas mencurigakan
- 🔴 **Terkompromi (COMPROMISED)**: Mungkin terkompromi
- 🔒 **Terenkripsi (ENCRYPTED)**: Auto-encrypted

## 🔧 Common Issues

### Issue 1: "Connection Refused"
**Problem:** Dashboard can't connect to backend

**Fix:**
```bash
cd backend && npm start
```

### Issue 2: "No data showing"
**Problem:** Database empty

**Fix:**
```bash
cd backend
npm run db:seed
```

### Issue 3: "WebSocket not connected"
**Problem:** Real-time updates not working

**Fix:**
1. Check backend running
2. Check CORS settings
3. Refresh dashboard page

### Issue 4: "Slack notifications not received"
**Problem:** Notifications not coming through

**Fix:**
1. Verify `SLACK_WEBHOOK_URL` correct
2. Check `SLACK_ENABLED=true`
3. Test manually: `POST /api/notifications/test/slack`
4. Check backend logs

### Issue 5: "Telegram notifications not received"
**Problem:** Bot not sending messages

**Fix:**
1. Verify `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`
2. Send `/start` to bot di Telegram
3. Check `TELEGRAM_ENABLED=true`
4. Test manually: `POST /api/notifications/test/telegram`

## 📚 Next Steps

### Explore More Features
1. **Device Management**: `/devices` - Manage authorized devices
2. **Activities**: `/activities` - Full activity logs
3. **Security**: `/security` - Security dashboard
4. **Alerts**: `/alerts` - Alert management
5. **Repositories**: `/repositories` - Repository security status

### Configure Monitoring Agent
Setup monitoring agent di developer machines:
```bash
cd monitoring-agent
pip install -r requirements.txt
python agent.py register --email your@email.com
python agent.py monitor
```

### Read Full Documentation
- [MONITORING_NOTIFICATIONS_GUIDE.md](MONITORING_NOTIFICATIONS_GUIDE.md) - Complete guide
- [MONITORING_FEATURES.md](MONITORING_FEATURES.md) - Feature details
- [PANDUAN_MONITORING.md](PANDUAN_MONITORING.md) - Panduan lengkap

## 💡 Tips

1. **Start Simple**: Test dashboard first, add notifications later
2. **Use Demo Accounts**: Pre-seeded accounts untuk testing
3. **Check Logs**: Backend logs sangat helpful untuk debugging
4. **Test Incrementally**: Test satu fitur at a time
5. **Use Browser Console**: Check untuk errors

## 🎉 Success Checklist

- [ ] Backend running di port 5000
- [ ] Dashboard running di port 3000
- [ ] Can login dengan demo account
- [ ] Monitoring page accessible
- [ ] See "Connected" status (green dot)
- [ ] (Optional) Slack notifications working
- [ ] (Optional) Telegram notifications working
- [ ] Real-time updates working

## 📞 Need Help?

- **Documentation**: Check README.md and guide files
- **Logs**: `backend/logs/` untuk error logs
- **Demo**: Use pre-seeded data untuk testing
- **Support**: Open GitHub issue

---

🎯 **Estimated Setup Time: 5 minutes**

✅ **Difficulty Level: Easy**

🚀 **Ready to monitor? Let's go!**
