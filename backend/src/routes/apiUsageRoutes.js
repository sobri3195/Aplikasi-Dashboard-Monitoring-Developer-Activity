const express = require('express');
const router = express.Router();
const apiUsageController = require('../controllers/apiUsageController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/stats', apiUsageController.getUsageStats);
router.get('/history', apiUsageController.getUsageHistory);
router.get('/violations', apiUsageController.getRateLimitViolations);
router.get('/endpoint/:endpoint', apiUsageController.getEndpointStats);
router.get('/user/:userId', apiUsageController.getUserApiUsage);
router.delete('/cleanup', apiUsageController.cleanupOldLogs);

module.exports = router;
