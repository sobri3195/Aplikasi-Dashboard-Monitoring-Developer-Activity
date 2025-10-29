const express = require('express');
const router = express.Router();
const developerStatsController = require('../controllers/developerStatsController');
const { protect } = require('../middleware/auth');

router.get('/activity-stats', protect, developerStatsController.getDeveloperActivityStats);
router.get('/performance-metrics', protect, developerStatsController.getDeveloperPerformanceMetrics);
router.get('/repository-stats', protect, developerStatsController.getRepositoryActivityStats);
router.get('/device-stats', protect, developerStatsController.getDeviceActivityStats);
router.get('/heatmap', protect, developerStatsController.getActivityHeatmap);

module.exports = router;
