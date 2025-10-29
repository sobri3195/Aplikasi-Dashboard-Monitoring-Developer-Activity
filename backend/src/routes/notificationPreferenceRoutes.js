const express = require('express');
const router = express.Router();
const notificationPreferenceController = require('../controllers/notificationPreferenceController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/my-preferences', notificationPreferenceController.getUserPreferences);
router.get('/channels', notificationPreferenceController.getAvailableChannels);
router.get('/alert-types', notificationPreferenceController.getAvailableAlertTypes);
router.post('/', notificationPreferenceController.updatePreference);
router.post('/bulk', notificationPreferenceController.bulkUpdatePreferences);
router.delete('/:id', notificationPreferenceController.deletePreference);

module.exports = router;
