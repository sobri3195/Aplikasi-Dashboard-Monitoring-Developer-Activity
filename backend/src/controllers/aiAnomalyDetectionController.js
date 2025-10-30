const anomalyService = require('../services/aiAnomalyDetectionService');

class AIAnomalyDetectionController {
  async learnBaseline(req, res) {
    try {
      const { userId, deviceId } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId is required'
        });
      }

      const result = await anomalyService.learnBaseline(userId, deviceId);
      res.json({ success: result.success, data: result });
    } catch (error) {
      console.error('Error learning baseline:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async detectAnomaly(req, res) {
    try {
      const { activity } = req.body;
      
      if (!activity) {
        return res.status(400).json({
          success: false,
          message: 'activity is required'
        });
      }

      const result = await anomalyService.detectAnomaly(activity);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error detecting anomaly:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getHeatmapData(req, res) {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate and endDate are required'
        });
      }

      const heatmap = await anomalyService.getHeatmapData(
        userId,
        new Date(startDate),
        new Date(endDate)
      );
      
      res.json({ success: true, data: heatmap });
    } catch (error) {
      console.error('Error getting heatmap data:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAnomalyHistory(req, res) {
    try {
      const { userId } = req.params;
      const filters = req.query;
      
      const history = await anomalyService.getAnomalyHistory(userId, filters);
      res.json({ success: true, data: history });
    } catch (error) {
      console.error('Error getting anomaly history:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AIAnomalyDetectionController();
