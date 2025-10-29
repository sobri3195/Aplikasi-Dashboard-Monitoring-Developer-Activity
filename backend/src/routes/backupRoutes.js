const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize(['ADMIN']));

router.post('/', backupController.createBackup);
router.get('/', backupController.listBackups);
router.get('/stats', backupController.getBackupStats);
router.get('/:id', backupController.getBackup);
router.get('/:id/download', backupController.downloadBackup);
router.delete('/:id', backupController.deleteBackup);

module.exports = router;
