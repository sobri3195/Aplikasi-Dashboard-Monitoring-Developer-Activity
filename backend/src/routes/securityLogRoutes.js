const express = require('express');
const router = express.Router();
const securityLogController = require('../controllers/securityLogController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('ADMIN'), securityLogController.getSecurityLogs);
router.post('/', protect, securityLogController.createSecurityLog);
router.get('/stats', protect, authorize('ADMIN'), securityLogController.getSecurityLogStats);
router.get('/sync-status', protect, securityLogController.getAllDeviceSyncStatus);
router.get('/sync-status/:deviceId', protect, securityLogController.getDeviceSyncStatus);
router.put('/sync-status/:deviceId', protect, securityLogController.updateDeviceSyncStatus);
router.get('/sync-health', protect, authorize('ADMIN'), securityLogController.getSyncHealthReport);

module.exports = router;
