const express = require('express');
const router = express.Router();
const deviceVerificationController = require('../controllers/deviceVerificationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/request', protect, authorize('ADMIN'), deviceVerificationController.requestDeviceReverification);
router.get('/pending', protect, authorize('ADMIN'), deviceVerificationController.getPendingVerificationRequests);
router.put('/:id/approve', protect, authorize('ADMIN'), deviceVerificationController.approveVerificationRequest);
router.put('/:id/reject', protect, authorize('ADMIN'), deviceVerificationController.rejectVerificationRequest);
router.put('/force/:deviceId', protect, authorize('ADMIN'), deviceVerificationController.forceDeviceReverification);
router.get('/history/:deviceId', protect, deviceVerificationController.getDeviceVerificationHistory);
router.post('/bulk-reverify', protect, authorize('ADMIN'), deviceVerificationController.bulkReverifyDevices);

module.exports = router;
