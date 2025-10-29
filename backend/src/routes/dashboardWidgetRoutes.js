const express = require('express');
const router = express.Router();
const dashboardWidgetController = require('../controllers/dashboardWidgetController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/my-widgets', dashboardWidgetController.getUserWidgets);
router.get('/available', dashboardWidgetController.getAvailableWidgets);
router.post('/', dashboardWidgetController.createWidget);
router.put('/:id', dashboardWidgetController.updateWidget);
router.delete('/:id', dashboardWidgetController.deleteWidget);
router.post('/reorder', dashboardWidgetController.reorderWidgets);
router.post('/reset', dashboardWidgetController.resetToDefault);

module.exports = router;
