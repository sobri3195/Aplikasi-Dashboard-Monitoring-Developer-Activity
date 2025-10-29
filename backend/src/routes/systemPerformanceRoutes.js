const express = require('express');
const router = express.Router();
const systemPerformanceController = require('../controllers/systemPerformanceController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/current', systemPerformanceController.getCurrentPerformance);
router.get('/history', systemPerformanceController.getPerformanceHistory);
router.get('/stats', systemPerformanceController.getPerformanceStats);
router.post('/record', authorize(['ADMIN']), systemPerformanceController.recordPerformance);
router.delete('/cleanup', authorize(['ADMIN']), systemPerformanceController.cleanupOldRecords);

module.exports = router;
