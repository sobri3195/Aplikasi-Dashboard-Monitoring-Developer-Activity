const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const deviceRoutes = require('./deviceRoutes');
const activityRoutes = require('./activityRoutes');
const alertRoutes = require('./alertRoutes');
const webhookRoutes = require('./webhookRoutes');
const dashboardRoutes = require('./dashboardRoutes');

router.use('/auth', authRoutes);
router.use('/devices', deviceRoutes);
router.use('/activities', activityRoutes);
router.use('/alerts', alertRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
