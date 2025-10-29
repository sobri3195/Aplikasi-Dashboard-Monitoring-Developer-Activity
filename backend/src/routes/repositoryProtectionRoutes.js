const express = require('express');
const router = express.Router();
const repositoryProtectionController = require('../controllers/repositoryProtectionController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Device registration and fingerprinting
router.post('/register-device', repositoryProtectionController.registerDeviceForAccess);
router.get('/device-fingerprint', repositoryProtectionController.getCurrentDeviceFingerprint);

// Repository access verification
router.post('/verify-access', repositoryProtectionController.verifyRepositoryAccess);
router.post('/check-integrity', repositoryProtectionController.checkRepositoryIntegrity);
router.post('/validate', repositoryProtectionController.validateDeviceAndPackage);

// Repository protection status
router.get('/status/:repositoryId', repositoryProtectionController.getProtectionStatus);

// Admin-only routes
router.post('/decrypt', authorize(['ADMIN']), repositoryProtectionController.decryptRepository);
router.post('/force-encrypt', authorize(['ADMIN']), repositoryProtectionController.forceEncryptRepository);

// Trusted paths management (Admin only)
router.post('/trusted-paths/add', authorize(['ADMIN']), repositoryProtectionController.addTrustedPath);
router.post('/trusted-paths/remove', authorize(['ADMIN']), repositoryProtectionController.removeTrustedPath);
router.get('/trusted-paths/:repositoryId', repositoryProtectionController.getTrustedPaths);

module.exports = router;
