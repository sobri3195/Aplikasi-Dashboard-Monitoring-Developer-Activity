const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/overview', protect, dashboardController.getDashboardOverview);
router.get('/security', protect, dashboardController.getSecurityDashboard);
router.get('/activity', protect, dashboardController.getActivityDashboard);

module.exports = router;
