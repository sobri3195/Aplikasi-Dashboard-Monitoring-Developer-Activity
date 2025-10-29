const express = require('express');
const router = express.Router();
const accessDetectionController = require('../controllers/accessDetectionController');
const { authenticateToken } = require('../middleware/auth');

// Monitor git operations (clone, pull, push)
router.post('/monitor-operation', authenticateToken, accessDetectionController.monitorGitOperation);

// Check for unauthorized movement
router.post('/check-movement', authenticateToken, accessDetectionController.checkUnauthorizedMovement);

// Verify authorized transfer
router.post('/verify-transfer', authenticateToken, accessDetectionController.verifyAuthorizedTransfer);

// Get access monitoring statistics
router.get('/stats', authenticateToken, accessDetectionController.getAccessMonitoringStats);

// Get monitoring dashboard data
router.get('/dashboard', authenticateToken, accessDetectionController.getMonitoringDashboard);

// Resolve alert
router.put('/alerts/:alertId/resolve', authenticateToken, accessDetectionController.resolveAlert);

module.exports = router;
