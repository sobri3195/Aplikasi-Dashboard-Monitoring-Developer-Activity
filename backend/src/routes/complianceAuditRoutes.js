const express = require('express');
const router = express.Router();
const controller = require('../controllers/complianceAuditController');

router.get('/dashboard', controller.getComplianceDashboard);
router.get('/verify-chain', controller.verifyAuditChain);
router.post('/log', controller.createImmutableLog);
router.post('/report', controller.generateComplianceReport);
router.post('/schedule-monthly', controller.scheduleMonthlyReports);

module.exports = router;
