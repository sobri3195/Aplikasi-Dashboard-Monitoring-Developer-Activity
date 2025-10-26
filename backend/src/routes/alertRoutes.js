const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, alertController.getAllAlerts);
router.get('/stats', protect, alertController.getAlertStats);
router.get('/:id', protect, alertController.getAlertById);
router.put('/:id/resolve', protect, authorize('ADMIN'), alertController.resolveAlert);

module.exports = router;
