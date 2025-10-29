const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/test/slack', protect, restrictTo('ADMIN'), notificationController.testSlackNotification);
router.post('/test/telegram', protect, restrictTo('ADMIN'), notificationController.testTelegramNotification);
router.post('/send', protect, restrictTo('ADMIN'), notificationController.sendCustomNotification);
router.get('/status', protect, notificationController.getNotificationStatus);

module.exports = router;
