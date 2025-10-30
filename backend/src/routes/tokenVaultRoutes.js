const express = require('express');
const router = express.Router();
const controller = require('../controllers/tokenVaultController');

router.get('/stats', controller.getDashboardStats);
router.get('/check-expired', controller.checkExpiredTokens);
router.get('/user/:userId', controller.getTokensByUser);
router.get('/:tokenId', controller.getToken);
router.get('/:tokenId/history', controller.getRotationHistory);
router.get('/:tokenId/activity', controller.getAccessActivity);
router.get('/:tokenId/suspicious', controller.detectSuspiciousUsage);
router.post('/', controller.createAccessToken);
router.post('/:tokenId/rotate', controller.rotateToken);
router.post('/:tokenId/revoke', controller.revokeToken);

module.exports = router;
