const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { protect, apiKeyAuth } = require('../middleware/auth');
const { validateRequest, activityLogSchema } = require('../utils/validators');

router.post('/', apiKeyAuth, validateRequest(activityLogSchema), activityController.logActivity);
router.get('/', protect, activityController.getAllActivities);
router.get('/suspicious', protect, activityController.getSuspiciousActivities);
router.get('/stats', protect, activityController.getActivityStats);
router.get('/:id', protect, activityController.getActivityById);

module.exports = router;
