# 🚀 Quick Start: New Security Features

## Installation

### 1. Run Setup Script
```bash
./setup_new_security_features.sh
```

Or manually:
```bash
cd backend
npm run prisma:generate
npm run migrate:deploy
```

### 2. Start Backend Server
```bash
cd backend
npm run dev
```

The server should start on `http://localhost:5000`

## Testing the Features

### Quick Test
```bash
./test_new_features.sh
```

### Manual API Testing

#### 1. Developer Risk Scoring

**Get Dashboard Stats:**
```bash
curl http://localhost:5000/api/developer-risk-scoring/stats
```

**Calculate Risk Score for User:**
```bash
curl -X POST http://localhost:5000/api/developer-risk-scoring/{userId}/calculate
```

**Get All Risk Scores:**
```bash
curl http://localhost:5000/api/developer-risk-scoring
```

#### 2. Repository Integrity

**Get Integrity Stats:**
```bash
curl http://localhost:5000/api/repository-integrity/stats
```

**Register Commit Hash:**
```bash
curl -X POST http://localhost:5000/api/repository-integrity/register \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryId": "repo-id",
    "commitHash": "abc123",
    "files": [
      {"path": "file.js", "content": "console.log(\"hello\");"}
    ]
  }'
```

**Verify Repository Integrity:**
```bash
curl -X POST http://localhost:5000/api/repository-integrity/verify \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryId": "repo-id",
    "commitHash": "abc123",
    "files": [
      {"path": "file.js", "content": "console.log(\"hello\");"}
    ]
  }'
```

#### 3. AI Anomaly Detection

**Learn Baseline for User:**
```bash
curl -X POST http://localhost:5000/api/ai-anomaly-detection/learn-baseline \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "deviceId": "device-id"
  }'
```

**Get Activity Heatmap:**
```bash
curl "http://localhost:5000/api/ai-anomaly-detection/{userId}/heatmap?startDate=2024-01-01&endDate=2024-12-31"
```

**Get Anomaly History:**
```bash
curl "http://localhost:5000/api/ai-anomaly-detection/{userId}/history"
```

#### 4. Compliance & Audit

**Get Compliance Dashboard:**
```bash
curl http://localhost:5000/api/compliance-audit/dashboard
```

**Generate Compliance Report:**
```bash
curl -X POST "http://localhost:5000/api/compliance-audit/report?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "ISO27001",
    "format": "PDF"
  }'
```

**Verify Audit Chain:**
```bash
curl http://localhost:5000/api/compliance-audit/verify-chain
```

#### 5. Token Vault

**Get Token Stats:**
```bash
curl http://localhost:5000/api/token-vault/stats
```

**Create Access Token:**
```bash
curl -X POST http://localhost:5000/api/token-vault \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "tokenName": "My Git Token",
    "tokenValue": "ghp_xxxxxxxxxxxxx",
    "tokenType": "GIT_ACCESS",
    "deviceId": "device-id",
    "rotationDays": 30
  }'
```

**Get Token (Decrypted):**
```bash
curl "http://localhost:5000/api/token-vault/{tokenId}?userId=user-id"
```

**Rotate Token:**
```bash
curl -X POST http://localhost:5000/api/token-vault/{tokenId}/rotate \
  -H "Content-Type: application/json" \
  -d '{"reason": "MANUAL"}'
```

**Get User's Tokens:**
```bash
curl http://localhost:5000/api/token-vault/user/{userId}
```

## Automated Tasks

The following tasks run automatically via cron jobs:

- **Every Hour**: Token rotation check
- **Daily 6:00 AM**: Recalculate risk scores
- **Daily 4:00 AM**: Verify audit chain
- **Monthly 1st, 1:00 AM**: Generate compliance reports

## Dashboard Integration

These features are accessible via API endpoints. To integrate with the dashboard:

1. Add new components in `/dashboard/src/components/`
2. Create views for each feature
3. Use Socket.io for real-time updates
4. Fetch data from the API endpoints above

## Environment Variables

Add these to your `.env` file (optional):

```env
# Risk Scoring
RISK_SCORE_THRESHOLD=70
AUTO_WATCH_ENABLED=true

# Token Rotation  
DEFAULT_ROTATION_DAYS=30
AUTO_ROTATION_ENABLED=true

# Compliance
COMPLIANCE_EXPORT_DIR=./exports
MONTHLY_REPORT_ENABLED=true

# Anomaly Detection
ANOMALY_LEARNING_PERIOD_DAYS=60
AUTO_RESPONSE_ENABLED=true
```

## Troubleshooting

### Migration Issues
```bash
cd backend
npx prisma migrate reset
npx prisma migrate deploy
```

### Prisma Client Issues
```bash
cd backend
npx prisma generate
```

### Check Logs
```bash
# System logs
curl http://localhost:5000/api/system-logs

# Security logs
curl http://localhost:5000/api/security-logs
```

## Feature Highlights

### 🎯 Risk Scoring
- Automatic calculation every 24 hours
- Real-time alerts for high-risk developers
- "Under Watch" status auto-applied at score ≥70

### 🔒 Integrity Verification
- SHA-256 hash verification
- Auto-reject tampered commits
- Timeline tracking per file

### 🤖 Anomaly Detection
- AI learns from 60 days of history
- Auto-response on critical anomalies
- Activity heatmap visualization

### 📋 Compliance
- Support for ISO 27001, SOC 2, GDPR, PDPA
- Blockchain-like immutable audit logs
- Automated monthly reports

### 🔑 Token Vault
- AES-256-GCM encryption
- Auto-rotation every 30 days
- Suspicious usage detection

## Next Steps

1. ✅ Review [NEW_SECURITY_FEATURES.md](./NEW_SECURITY_FEATURES.md) for detailed documentation
2. ✅ Test each feature using the API endpoints
3. ✅ Integrate with your dashboard
4. ✅ Configure environment variables as needed
5. ✅ Set up monitoring and alerts

## Support

For issues or questions:
- Check API documentation: http://localhost:5000/api-docs (if enabled)
- Review system logs
- Check security logs for detailed events

---

**Version:** 1.0.0  
**Last Updated:** 2024
