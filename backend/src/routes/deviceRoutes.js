const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const { protect, authorize, apiKeyAuth } = require('../middleware/auth');
const { validateRequest, deviceRegistrationSchema } = require('../utils/validators');

router.post('/register', apiKeyAuth, validateRequest(deviceRegistrationSchema), deviceController.registerDevice);
router.get('/', protect, deviceController.getAllDevices);
router.get('/:id', protect, deviceController.getDeviceById);
router.put('/:id/approve', protect, authorize('ADMIN'), deviceController.approveDevice);
router.put('/:id/reject', protect, authorize('ADMIN'), deviceController.rejectDevice);
router.put('/:id/revoke', protect, authorize('ADMIN'), deviceController.revokeDevice);
router.delete('/:id', protect, authorize('ADMIN'), deviceController.deleteDevice);
router.post('/:id/heartbeat', apiKeyAuth, deviceController.updateDeviceHeartbeat);

module.exports = router;
