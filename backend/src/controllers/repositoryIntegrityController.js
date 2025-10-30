const integrityService = require('../services/repositoryIntegrityService');

class RepositoryIntegrityController {
  async registerCommitHash(req, res) {
    try {
      const { repositoryId, commitHash, files } = req.body;
      
      if (!repositoryId || !commitHash || !files) {
        return res.status(400).json({
          success: false,
          message: 'repositoryId, commitHash, and files are required'
        });
      }

      const hashes = await integrityService.registerCommitHash(repositoryId, commitHash, files);
      res.json({ success: true, data: hashes });
    } catch (error) {
      console.error('Error registering commit hash:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async verifyRepositoryIntegrity(req, res) {
    try {
      const { repositoryId, commitHash, files } = req.body;
      
      if (!repositoryId || !commitHash || !files) {
        return res.status(400).json({
          success: false,
          message: 'repositoryId, commitHash, and files are required'
        });
      }

      const result = await integrityService.verifyRepositoryIntegrity(repositoryId, commitHash, files);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error verifying repository integrity:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getIntegrityStatus(req, res) {
    try {
      const { repositoryId } = req.params;
      const status = await integrityService.getIntegrityStatus(repositoryId);
      res.json({ success: true, data: status });
    } catch (error) {
      console.error('Error getting integrity status:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getHashTimeline(req, res) {
    try {
      const { repositoryId, filePath } = req.query;
      
      if (!repositoryId || !filePath) {
        return res.status(400).json({
          success: false,
          message: 'repositoryId and filePath are required'
        });
      }

      const timeline = await integrityService.getHashTimeline(repositoryId, filePath);
      res.json({ success: true, data: timeline });
    } catch (error) {
      console.error('Error getting hash timeline:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAllRepositoriesStatus(req, res) {
    try {
      const results = await integrityService.getAllRepositoriesIntegrityStatus();
      res.json({ success: true, data: results });
    } catch (error) {
      console.error('Error getting all repositories status:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async generateIntegrityReport(req, res) {
    try {
      const { repositoryId } = req.params;
      const { startDate, endDate } = req.query;
      
      const report = await integrityService.generateIntegrityReport(
        repositoryId,
        new Date(startDate),
        new Date(endDate)
      );
      
      res.json({ success: true, data: report });
    } catch (error) {
      console.error('Error generating integrity report:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getDashboardStats(req, res) {
    try {
      const stats = await integrityService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new RepositoryIntegrityController();
