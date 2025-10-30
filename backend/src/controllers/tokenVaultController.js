const tokenVaultService = require('../services/tokenVaultService');

class TokenVaultController {
  async createAccessToken(req, res) {
    try {
      const { userId, tokenName, tokenValue, tokenType, deviceId, rotationDays } = req.body;
      
      if (!userId || !tokenName || !tokenValue) {
        return res.status(400).json({
          success: false,
          message: 'userId, tokenName, and tokenValue are required'
        });
      }

      const result = await tokenVaultService.createAccessToken(
        userId,
        tokenName,
        tokenValue,
        tokenType || 'GIT_ACCESS',
        deviceId,
        rotationDays || 30
      );
      
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error creating access token:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getToken(req, res) {
    try {
      const { tokenId } = req.params;
      const userId = req.user?.id || req.query.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
      }

      const result = await tokenVaultService.getToken(tokenId, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error getting token:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async rotateToken(req, res) {
    try {
      const { tokenId } = req.params;
      const { reason } = req.body;
      
      const result = await tokenVaultService.rotateToken(tokenId, reason || 'MANUAL');
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error rotating token:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async revokeToken(req, res) {
    try {
      const { tokenId } = req.params;
      const { reason } = req.body;
      
      const result = await tokenVaultService.revokeToken(tokenId, reason || 'MANUAL');
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error revoking token:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async detectSuspiciousUsage(req, res) {
    try {
      const { tokenId } = req.params;
      const result = await tokenVaultService.detectSuspiciousTokenUsage(tokenId);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error detecting suspicious usage:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getTokensByUser(req, res) {
    try {
      const { userId } = req.params;
      const tokens = await tokenVaultService.getTokensByUser(userId);
      res.json({ success: true, data: tokens });
    } catch (error) {
      console.error('Error getting tokens by user:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getRotationHistory(req, res) {
    try {
      const { tokenId } = req.params;
      const history = await tokenVaultService.getTokenRotationHistory(tokenId);
      res.json({ success: true, data: history });
    } catch (error) {
      console.error('Error getting rotation history:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getDashboardStats(req, res) {
    try {
      const stats = await tokenVaultService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAccessActivity(req, res) {
    try {
      const { tokenId } = req.params;
      const { days } = req.query;
      
      const activity = await tokenVaultService.getTokenAccessActivity(
        tokenId,
        days ? parseInt(days) : 7
      );
      
      res.json({ success: true, data: activity });
    } catch (error) {
      console.error('Error getting access activity:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async checkExpiredTokens(req, res) {
    try {
      const result = await tokenVaultService.checkAndRotateExpiredTokens();
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error checking expired tokens:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new TokenVaultController();
