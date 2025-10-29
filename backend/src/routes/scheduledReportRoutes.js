const express = require('express');
const router = express.Router();
const scheduledReportController = require('../controllers/scheduledReportController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/', scheduledReportController.getAllReports);
router.post('/', scheduledReportController.createReport);
router.put('/:id', scheduledReportController.updateReport);
router.delete('/:id', scheduledReportController.deleteReport);
router.post('/:id/run', scheduledReportController.runReportNow);
router.get('/:id/history', scheduledReportController.getReportHistory);

module.exports = router;
