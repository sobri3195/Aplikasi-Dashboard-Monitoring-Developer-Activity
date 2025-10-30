const riskScoringService = require('../services/developerRiskScoringService');

class DeveloperRiskScoringController {
  async calculateRiskScore(req, res) {
    try {
      const { userId } = req.params;
      const score = await riskScoringService.calculateRiskScore(userId);
      res.json({ success: true, data: score });
    } catch (error) {
      console.error('Error calculating risk score:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAllRiskScores(req, res) {
    try {
      const filters = req.query;
      const scores = await riskScoringService.getAllRiskScores(filters);
      res.json({ success: true, data: scores });
    } catch (error) {
      console.error('Error getting all risk scores:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getRiskScoreByUser(req, res) {
    try {
      const { userId } = req.params;
      const score = await riskScoringService.getRiskScoreByUser(userId);
      res.json({ success: true, data: score });
    } catch (error) {
      console.error('Error getting user risk score:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async recalculateAllRiskScores(req, res) {
    try {
      const results = await riskScoringService.recalculateAllRiskScores();
      res.json({ success: true, data: results, count: results.length });
    } catch (error) {
      console.error('Error recalculating all risk scores:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getDashboardStats(req, res) {
    try {
      const stats = await riskScoringService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new DeveloperRiskScoringController();
