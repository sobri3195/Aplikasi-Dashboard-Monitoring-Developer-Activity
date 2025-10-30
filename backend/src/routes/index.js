const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const deviceRoutes = require('./deviceRoutes');
const activityRoutes = require('./activityRoutes');
const alertRoutes = require('./alertRoutes');
const webhookRoutes = require('./webhookRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const repositoryRoutes = require('./repositoryRoutes');
const userRoutes = require('./userRoutes');
const auditLogRoutes = require('./auditLogRoutes');
const healthRoutes = require('./healthRoutes');
const systemPerformanceRoutes = require('./systemPerformanceRoutes');
const backupRoutes = require('./backupRoutes');
const apiUsageRoutes = require('./apiUsageRoutes');
const systemLogRoutes = require('./systemLogRoutes');
const systemConfigRoutes = require('./systemConfigRoutes');

// New features routes
const twoFactorRoutes = require('./twoFactorRoutes');
const sessionRoutes = require('./sessionRoutes');
const ipControlRoutes = require('./ipControlRoutes');
const exportRoutes = require('./exportRoutes');
const dashboardWidgetRoutes = require('./dashboardWidgetRoutes');
const emailTemplateRoutes = require('./emailTemplateRoutes');
const scheduledReportRoutes = require('./scheduledReportRoutes');
const notificationPreferenceRoutes = require('./notificationPreferenceRoutes');
const notificationRoutes = require('./notificationRoutes');
const activityTimelineRoutes = require('./activityTimelineRoutes');
const repositoryProtectionRoutes = require('./repositoryProtectionRoutes');
const accessDetectionRoutes = require('./accessDetectionRoutes');
const autoEncryptionRoutes = require('./autoEncryptionRoutes');

// Dashboard enhancement routes
const developerStatsRoutes = require('./developerStatsRoutes');
const securityLogRoutes = require('./securityLogRoutes');
const behavioralAnalyticsRoutes = require('./behavioralAnalyticsRoutes');
const deviceVerificationRoutes = require('./deviceVerificationRoutes');

// New security features routes
const developerRiskScoringRoutes = require('./developerRiskScoringRoutes');
const repositoryIntegrityRoutes = require('./repositoryIntegrityRoutes');
const aiAnomalyDetectionRoutes = require('./aiAnomalyDetectionRoutes');
const complianceAuditRoutes = require('./complianceAuditRoutes');
const tokenVaultRoutes = require('./tokenVaultRoutes');

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/devices', deviceRoutes);
router.use('/activities', activityRoutes);
router.use('/alerts', alertRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/repositories', repositoryRoutes);
router.use('/users', userRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/system-performance', systemPerformanceRoutes);
router.use('/backups', backupRoutes);
router.use('/api-usage', apiUsageRoutes);
router.use('/system-logs', systemLogRoutes);
router.use('/system-config', systemConfigRoutes);

// New features routes
router.use('/2fa', twoFactorRoutes);
router.use('/sessions', sessionRoutes);
router.use('/ip-control', ipControlRoutes);
router.use('/export', exportRoutes);
router.use('/dashboard-widgets', dashboardWidgetRoutes);
router.use('/email-templates', emailTemplateRoutes);
router.use('/scheduled-reports', scheduledReportRoutes);
router.use('/notification-preferences', notificationPreferenceRoutes);
router.use('/notifications', notificationRoutes);
router.use('/activity-timeline', activityTimelineRoutes);

// Repository protection routes
router.use('/repository-protection', repositoryProtectionRoutes);

// Access detection and protection routes
router.use('/access-detection', accessDetectionRoutes);

// Auto-encryption routes
router.use('/auto-encryption', autoEncryptionRoutes);

// Dashboard enhancement routes
router.use('/developer-stats', developerStatsRoutes);
router.use('/security-logs', securityLogRoutes);
router.use('/behavioral-analytics', behavioralAnalyticsRoutes);
router.use('/device-verification', deviceVerificationRoutes);

// New security features routes
router.use('/developer-risk-scoring', developerRiskScoringRoutes);
router.use('/repository-integrity', repositoryIntegrityRoutes);
router.use('/ai-anomaly-detection', aiAnomalyDetectionRoutes);
router.use('/compliance-audit', complianceAuditRoutes);
router.use('/token-vault', tokenVaultRoutes);

module.exports = router;
