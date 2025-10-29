const express = require('express');
const router = express.Router();
const activityTimelineController = require('../controllers/activityTimelineController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/stats', activityTimelineController.getTimelineStats);
router.get('/activities', activityTimelineController.getActivitiesWithTimeline);
router.get('/:activityId', activityTimelineController.getActivityTimeline);
router.get('/:activityId/replay', activityTimelineController.replayTimeline);
router.post('/:activityId/step', activityTimelineController.addTimelineStep);
router.delete('/step/:id', activityTimelineController.deleteTimelineStep);

module.exports = router;
