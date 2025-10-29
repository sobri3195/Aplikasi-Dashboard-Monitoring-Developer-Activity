const express = require('express');
const router = express.Router();
const twoFactorController = require('../controllers/twoFactorController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

router.get('/status', twoFactorController.get2FAStatus);
router.post('/generate', twoFactorController.generateSecret);
router.post('/enable', twoFactorController.enable2FA);
router.post('/disable', twoFactorController.disable2FA);
router.post('/verify', twoFactorController.verify2FA);

module.exports = router;
