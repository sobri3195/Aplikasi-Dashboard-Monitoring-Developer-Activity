const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', healthController.getBasicHealth);
router.get('/detailed', protect, authorize('ADMIN'), healthController.getDetailedHealth);
router.get('/system', protect, authorize('ADMIN'), healthController.getSystemInfo);
router.get('/ready', healthController.getReadiness);
router.get('/live', healthController.getLiveness);

module.exports = router;
