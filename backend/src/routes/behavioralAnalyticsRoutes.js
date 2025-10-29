const express = require('express');
const router = express.Router();
const behavioralAnalyticsController = require('../controllers/behavioralAnalyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/anomalies', protect, behavioralAnalyticsController.getAnomalyDetections);
router.get('/anomalies/stats', protect, behavioralAnalyticsController.getAnomalyStats);
router.get('/anomalies/dashboard', protect, authorize('ADMIN'), behavioralAnalyticsController.getAnomalyDashboard);
router.put('/anomalies/:id/review', protect, authorize('ADMIN'), behavioralAnalyticsController.reviewAnomaly);
router.get('/profile/:userId', protect, behavioralAnalyticsController.getUserBehavioralProfile);
router.post('/profile/:userId/build', protect, authorize('ADMIN'), behavioralAnalyticsController.buildBehavioralProfile);
router.post('/analyze/:activityId', protect, behavioralAnalyticsController.analyzeActivity);

module.exports = router;
