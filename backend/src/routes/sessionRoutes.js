const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/my-sessions', sessionController.getUserSessions);
router.get('/all', authorize(['ADMIN']), sessionController.getAllSessions);
router.get('/stats', authorize(['ADMIN']), sessionController.getSessionStats);
router.delete('/:sessionId', sessionController.terminateSession);
router.delete('/terminate/others', sessionController.terminateOtherSessions);
router.delete('/cleanup/expired', authorize(['ADMIN']), sessionController.cleanupExpiredSessions);

module.exports = router;
