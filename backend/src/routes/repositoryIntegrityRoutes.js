const express = require('express');
const router = express.Router();
const controller = require('../controllers/repositoryIntegrityController');

router.get('/stats', controller.getDashboardStats);
router.get('/all', controller.getAllRepositoriesStatus);
router.get('/timeline', controller.getHashTimeline);
router.get('/:repositoryId', controller.getIntegrityStatus);
router.get('/:repositoryId/report', controller.generateIntegrityReport);
router.post('/register', controller.registerCommitHash);
router.post('/verify', controller.verifyRepositoryIntegrity);

module.exports = router;
