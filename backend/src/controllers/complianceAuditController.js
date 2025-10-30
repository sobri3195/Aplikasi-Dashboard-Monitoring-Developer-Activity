const complianceService = require('../services/complianceAuditService');

class ComplianceAuditController {
  async createImmutableLog(req, res) {
    try {
      const { userId, action, entity, entityId, changes } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');
      
      const log = await complianceService.createImmutableLog(
        userId, action, entity, entityId, changes, ipAddress, userAgent
      );
      
      res.json({ success: true, data: log });
    } catch (error) {
      console.error('Error creating immutable log:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async verifyAuditChain(req, res) {
    try {
      const result = await complianceService.verifyAuditChain();
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error verifying audit chain:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async generateComplianceReport(req, res) {
    try {
      const { reportType, format } = req.body;
      const { startDate, endDate } = req.query;
      
      if (!reportType || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'reportType, startDate, and endDate are required'
        });
      }

      const report = await complianceService.generateComplianceReport(
        reportType,
        new Date(startDate),
        new Date(endDate),
        format || 'PDF'
      );
      
      res.json({ success: true, data: report });
    } catch (error) {
      console.error('Error generating compliance report:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getComplianceDashboard(req, res) {
    try {
      const dashboard = await complianceService.getComplianceDashboard();
      res.json({ success: true, data: dashboard });
    } catch (error) {
      console.error('Error getting compliance dashboard:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async scheduleMonthlyReports(req, res) {
    try {
      await complianceService.scheduleMonthlyReports();
      res.json({ success: true, message: 'Monthly reports scheduled' });
    } catch (error) {
      console.error('Error scheduling monthly reports:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ComplianceAuditController();
