const express = require('express');
const router = express.Router();
const autoEncryptionController = require('../controllers/autoEncryptionController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get pending verifications (admin only)
router.get('/pending', authorize(['ADMIN']), autoEncryptionController.getPendingVerifications);

// Manual verification by security admin (admin only)
router.post('/verify/:repositoryId', authorize(['ADMIN']), autoEncryptionController.manualVerification);

// Check device access (all authenticated users)
router.post('/check-access', autoEncryptionController.checkDeviceAccess);

// Get encryption statistics (admin only)
router.get('/stats', authorize(['ADMIN']), autoEncryptionController.getEncryptionStats);

// Trigger manual encryption (admin only)
router.post('/trigger', authorize(['ADMIN']), autoEncryptionController.triggerManualEncryption);

module.exports = router;
