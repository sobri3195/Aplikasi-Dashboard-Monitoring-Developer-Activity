const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// CSV exports
router.get('/activities/csv', exportController.exportActivitiesToCSV);
router.get('/alerts/csv', exportController.exportAlertsToCSV);
router.get('/audit-logs/csv', authorize(['ADMIN']), exportController.exportAuditLogsToCSV);

// PDF export
router.post('/report/pdf', exportController.exportReportToPDF);

// Export jobs
router.post('/jobs', exportController.createExportJob);
router.get('/jobs', exportController.getExportJobs);

module.exports = router;
