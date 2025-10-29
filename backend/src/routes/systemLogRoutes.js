const express = require('express');
const router = express.Router();
const systemLogController = require('../controllers/systemLogController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize(['ADMIN']));

router.post('/', systemLogController.createLog);
router.get('/', systemLogController.getLogs);
router.get('/stats', systemLogController.getLogStats);
router.get('/errors', systemLogController.getRecentErrors);
router.get('/export', systemLogController.exportLogs);
router.get('/:id', systemLogController.getLog);
router.delete('/', systemLogController.deleteLogs);

module.exports = router;
