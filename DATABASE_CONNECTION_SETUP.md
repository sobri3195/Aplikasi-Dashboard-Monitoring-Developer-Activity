# PostgreSQL Database Connection Setup

## ✅ Connection Status: SUCCESSFULLY CONNECTED

The application has been successfully connected to the Neon PostgreSQL database.

---

## 🔗 Database Connection Details

- **Provider**: Neon PostgreSQL (Cloud-hosted)
- **Database Name**: neondb
- **Host**: ep-noisy-lake-ae59gmr9-pooler.c-2.us-east-2.aws.neon.tech
- **SSL Mode**: Required with channel binding
- **PostgreSQL Version**: 17.5 on aarch64-unknown-linux-gnu

---

## 📁 Database Schema

### Total Tables: 34

The following tables have been created and are ready to use:

1. **access_tokens** - API access tokens for authentication
2. **activities** - User activity logs and monitoring
3. **activity_timeline** - Timeline of activities
4. **alerts** - Security alerts and notifications
5. **anomaly_baselines** - Baseline data for anomaly detection
6. **anomaly_detections** - Detected anomalies
7. **anomaly_responses** - Responses to anomalies
8. **api_usage_logs** - API usage tracking
9. **audit_logs** - Comprehensive audit logs
10. **backup_records** - Backup history
11. **behavioral_patterns** - User behavior patterns
12. **compliance_reports** - Compliance and reporting
13. **dashboard_widgets** - Dashboard configuration
14. **developer_risk_scores** - Developer risk assessment
15. **device_sync_status** - Device synchronization status
16. **device_verification_requests** - Device verification queue
17. **devices** - Registered devices
18. **email_templates** - Email notification templates
19. **export_jobs** - Data export jobs
20. **immutable_audit_logs** - Immutable audit trail
21. **ip_blacklist** - Blocked IP addresses
22. **ip_whitelist** - Allowed IP addresses
23. **notification_preferences** - User notification settings
24. **repositories** - Git repositories
25. **repository_hashes** - Repository integrity hashes
26. **scheduled_reports** - Scheduled report configurations
27. **security_logs** - Security event logs
28. **system_configs** - System configuration
29. **system_logs** - System operation logs
30. **system_performance** - Performance metrics
31. **token_access_logs** - Token usage logs
32. **token_rotation_history** - Token rotation history
33. **user_sessions** - Active user sessions
34. **users** - User accounts

---

## 📊 Current Database Status

### Record Counts:
- **Users**: 10
- **Devices**: 9
- **Activities**: 33
- **Alerts**: 4
- **Repositories**: 8

---

## 👥 Default User Accounts

The following test accounts have been created:

### Admin Accounts
| Email | Password | Role |
|-------|----------|------|
| admin@devmonitor.com | admin123456 | ADMIN |
| alex.johnson@example.com | alex123 | ADMIN |

### Developer Accounts
| Email | Password | Role |
|-------|----------|------|
| developer@devmonitor.com | developer123 | DEVELOPER |
| john.doe@example.com | john123 | DEVELOPER |
| jane.smith@example.com | jane123 | DEVELOPER |
| mike.chen@example.com | mike123 | DEVELOPER |
| sarah.williams@example.com | sarah123 | DEVELOPER |
| david.martinez@example.com | david123 | DEVELOPER |
| emily.taylor@example.com | emily123 | DEVELOPER |

### Viewer Account
| Email | Password | Role |
|-------|----------|------|
| viewer@devmonitor.com | viewer123 | VIEWER |

---

## 🔧 Configuration

### Environment Variables

The database connection is configured in `/backend/.env`:

```env
DATABASE_URL=postgresql://neondb_owner:npg_vOLcZhqtd0H6@ep-noisy-lake-ae59gmr9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Prisma Configuration

The Prisma schema is located at `/backend/prisma/schema.prisma` and includes:
- All database models
- Relationships and indexes
- Enum types for standardized values

---

## 🚀 Available Commands

### Database Management

```bash
# Navigate to backend directory
cd /home/engine/project/backend

# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Push schema to database (create/update tables)
npm run db:push

# Create a migration
npm run migrate

# Deploy migrations to production
npm run migrate:deploy

# Seed the database with sample data
npm run db:seed

# Test database connection
node test-db-connection.js
```

### Start the Backend Server

```bash
cd /home/engine/project/backend
npm start        # Production mode
npm run dev      # Development mode with hot reload
```

---

## 🎯 Features Enabled

### Security Features
- ✅ Device authorization system
- ✅ Real-time activity monitoring
- ✅ Suspicious activity detection
- ✅ Automatic encryption for unauthorized access
- ✅ Multi-factor authentication support
- ✅ IP whitelist/blacklist management
- ✅ Audit logging and compliance

### Monitoring Features
- ✅ Real-time activity tracking
- ✅ Behavioral pattern analysis
- ✅ Anomaly detection
- ✅ Risk scoring for developers
- ✅ System performance monitoring
- ✅ API usage analytics

### Alert & Notification Features
- ✅ Security alerts
- ✅ Slack integration (configurable)
- ✅ Telegram integration (configurable)
- ✅ Email notifications (configurable)
- ✅ WhatsApp integration (optional)
- ✅ Dashboard notifications

### Data Management
- ✅ Automated backups
- ✅ Data export (CSV, PDF)
- ✅ Scheduled reports
- ✅ Audit trail

---

## 📝 Sample Data Included

The database has been seeded with:
- **10 users** (2 admins, 7 developers, 1 viewer)
- **9 devices** (7 authorized, 2 suspicious)
- **8 repositories** (7 secure, 1 encrypted)
- **33 activities** (29 normal, 4 suspicious)
- **4 security alerts**
- System logs and performance metrics
- Audit logs

---

## 🔒 Security Recommendations

1. **Change Default Passwords**: Update all default user passwords before production use
2. **Configure Environment Variables**: Update JWT secrets, API keys, and encryption keys
3. **Enable Notifications**: Configure Slack, Telegram, or Email for real-time alerts
4. **Regular Backups**: Set up automated backup schedules
5. **Monitor Access**: Regularly review audit logs and security alerts
6. **Update IP Lists**: Configure IP whitelist/blacklist as needed

---

## 🧪 Testing the Connection

You can test the database connection at any time:

```bash
cd /home/engine/project/backend
node test-db-connection.js
```

This will display:
- Connection status
- Database version
- List of all tables
- Current record counts

---

## 📚 Additional Resources

- **Neon Documentation**: https://neon.tech/docs
- **Prisma Documentation**: https://www.prisma.io/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs

---

## 🆘 Troubleshooting

### Connection Issues

If you encounter connection issues:

1. Verify the DATABASE_URL in `.env` is correct
2. Check SSL requirements are met
3. Ensure network connectivity to Neon servers
4. Verify Prisma Client is generated: `npm run prisma:generate`

### Migration Issues

If migrations fail:

1. Use `npm run db:push` for development
2. Use `npm run migrate:deploy` for production
3. Check Prisma schema for syntax errors

### Performance Issues

If database is slow:

1. Review query indexes in schema
2. Check Neon dashboard for connection pooling settings
3. Monitor connection limits
4. Consider upgrading Neon plan if needed

---

## ✅ Setup Complete!

Your PostgreSQL database is now:
- ✅ Successfully connected
- ✅ Schema deployed (34 tables)
- ✅ Sample data loaded
- ✅ Ready for development and testing

You can now start the backend server and begin using the application!

```bash
cd /home/engine/project/backend
npm run dev
```

The API will be available at: `http://localhost:5000`

---

**Last Updated**: 2024
**Database Status**: ✅ OPERATIONAL
