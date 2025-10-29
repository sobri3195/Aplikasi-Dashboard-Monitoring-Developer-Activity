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

module.exports = router;
