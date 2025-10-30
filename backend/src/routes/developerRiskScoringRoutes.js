const express = require('express');
const router = express.Router();
const controller = require('../controllers/developerRiskScoringController');

router.get('/stats', controller.getDashboardStats);
router.get('/', controller.getAllRiskScores);
router.get('/:userId', controller.getRiskScoreByUser);
router.post('/:userId/calculate', controller.calculateRiskScore);
router.post('/recalculate-all', controller.recalculateAllRiskScores);

module.exports = router;
