const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('ADMIN'), auditLogController.getAllAuditLogs);
router.get('/stats', protect, authorize('ADMIN'), auditLogController.getAuditLogStats);
router.get('/:id', protect, authorize('ADMIN'), auditLogController.getAuditLogById);

module.exports = router;
