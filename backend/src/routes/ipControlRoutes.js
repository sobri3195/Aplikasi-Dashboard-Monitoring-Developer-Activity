const express = require('express');
const router = express.Router();
const ipControlController = require('../controllers/ipControlController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize(['ADMIN']));

// Whitelist routes
router.get('/whitelist', ipControlController.getWhitelist);
router.post('/whitelist', ipControlController.addToWhitelist);
router.delete('/whitelist/:id', ipControlController.removeFromWhitelist);
router.patch('/whitelist/:id/toggle', ipControlController.toggleWhitelistStatus);

// Blacklist routes
router.get('/blacklist', ipControlController.getBlacklist);
router.post('/blacklist', ipControlController.addToBlacklist);
router.delete('/blacklist/:id', ipControlController.removeFromBlacklist);
router.patch('/blacklist/:id/toggle', ipControlController.toggleBlacklistStatus);

// Check IP access
router.get('/check/:ipAddress', ipControlController.checkIpAccess);

module.exports = router;
