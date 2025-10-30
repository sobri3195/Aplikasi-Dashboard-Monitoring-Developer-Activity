const express = require('express');
const router = express.Router();
const controller = require('../controllers/aiAnomalyDetectionController');

router.post('/learn-baseline', controller.learnBaseline);
router.post('/detect', controller.detectAnomaly);
router.get('/:userId/heatmap', controller.getHeatmapData);
router.get('/:userId/history', controller.getAnomalyHistory);

module.exports = router;
