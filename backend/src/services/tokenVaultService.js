const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

class TokenVaultService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
  }

  generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  encryptToken(token, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(key, 'hex'), iv);
    
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  decryptToken(encryptedData, key) {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(key, 'hex'),
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async createAccessToken(userId, tokenName, tokenValue, tokenType, deviceId, rotationDays = 30) {
    try {
      const encryptionKey = this.generateEncryptionKey();
      const encrypted = this.encryptToken(tokenValue, encryptionKey);
      
      const encryptedToken = JSON.stringify(encrypted);
      const nextRotation = new Date(Date.now() + rotationDays * 24 * 60 * 60 * 1000);

      const accessToken = await prisma.accessToken.create({
        data: {
          userId,
          tokenName,
          encryptedToken,
          encryptionKey,
          tokenType,
          deviceId,
          rotationPolicy: rotationDays,
          nextRotation,
          scope: {
            repositories: 'all',
            permissions: ['read', 'write']
          }
        }
      });

      await this.logTokenAccess(accessToken.id, deviceId, 'TOKEN_CREATED', true);

      await prisma.securityLog.create({
        data: {
          logType: 'CONFIG_CHANGE',
          severity: 'INFO',
          userId,
          deviceId,
          message: `Access token created: ${tokenName}`,
          details: {
            tokenId: accessToken.id,
            tokenType,
            rotationPolicy: rotationDays
          }
        }
      });

      return {
        id: accessToken.id,
        tokenName,
        tokenType,
        nextRotation,
        created: true
      };
    } catch (error) {
      console.error('Error creating access token:', error);
      throw error;
    }
  }

  async getToken(tokenId, userId) {
    try {
      const token = await prisma.accessToken.findFirst({
        where: {
          id: tokenId,
          userId,
          isActive: true
        }
      });

      if (!token) {
        throw new Error('Token not found or inactive');
      }

      const encrypted = JSON.parse(token.encryptedToken);
      const decryptedToken = this.decryptToken(encrypted, token.encryptionKey);

      await prisma.accessToken.update({
        where: { id: tokenId },
        data: {
          accessCount: { increment: 1 },
          lastUsed: new Date()
        }
      });

      await this.logTokenAccess(tokenId, token.deviceId, 'TOKEN_ACCESSED', true);

      return {
        token: decryptedToken,
        metadata: {
          tokenName: token.tokenName,
          tokenType: token.tokenType,
          scope: token.scope
        }
      };
    } catch (error) {
      console.error('Error retrieving token:', error);
      throw error;
    }
  }

  async rotateToken(tokenId, reason = 'SCHEDULED') {
    try {
      const existingToken = await prisma.accessToken.findUnique({
        where: { id: tokenId }
      });

      if (!existingToken) {
        throw new Error('Token not found');
      }

      const encrypted = JSON.parse(existingToken.encryptedToken);
      const oldToken = this.decryptToken(encrypted, existingToken.encryptionKey);
      const oldTokenHash = this.hashToken(oldToken);

      const newTokenValue = this.generateToken();
      const newEncryptionKey = this.generateEncryptionKey();
      const newEncrypted = this.encryptToken(newTokenValue, newEncryptionKey);
      const newTokenHash = this.hashToken(newTokenValue);

      const nextRotation = new Date(
        Date.now() + existingToken.rotationPolicy * 24 * 60 * 60 * 1000
      );

      await prisma.accessToken.update({
        where: { id: tokenId },
        data: {
          encryptedToken: JSON.stringify(newEncrypted),
          encryptionKey: newEncryptionKey,
          lastRotated: new Date(),
          nextRotation,
          rotationCount: { increment: 1 }
        }
      });

      await prisma.tokenRotationHistory.create({
        data: {
          tokenId,
          oldTokenHash,
          newTokenHash,
          reason,
          rotatedBy: 'SYSTEM',
          deviceId: existingToken.deviceId
        }
      });

      await prisma.alert.create({
        data: {
          alertType: 'DEVICE_CHANGE',
          severity: 'INFO',
          message: `🔒 Token Access [${existingToken.tokenName}] rotated automatically`,
          details: {
            tokenId,
            reason,
            previousRotation: existingToken.lastRotated,
            nextRotation
          }
        }
      });

      await prisma.securityLog.create({
        data: {
          logType: 'CONFIG_CHANGE',
          severity: 'INFO',
          userId: existingToken.userId,
          message: `Token rotated: ${existingToken.tokenName}`,
          details: {
            tokenId,
            reason,
            rotationCount: existingToken.rotationCount + 1
          }
        }
      });

      return {
        success: true,
        newToken: newTokenValue,
        tokenName: existingToken.tokenName,
        nextRotation
      };
    } catch (error) {
      console.error('Error rotating token:', error);
      throw error;
    }
  }

  async checkAndRotateExpiredTokens() {
    try {
      const expiredTokens = await prisma.accessToken.findMany({
        where: {
          isActive: true,
          nextRotation: {
            lte: new Date()
          }
        }
      });

      const results = [];

      for (const token of expiredTokens) {
        try {
          const result = await this.rotateToken(token.id, 'SCHEDULED');
          results.push({
            tokenId: token.id,
            tokenName: token.tokenName,
            success: true
          });
        } catch (error) {
          results.push({
            tokenId: token.id,
            tokenName: token.tokenName,
            success: false,
            error: error.message
          });
        }
      }

      return {
        total: expiredTokens.length,
        results
      };
    } catch (error) {
      console.error('Error checking expired tokens:', error);
      throw error;
    }
  }

  async revokeToken(tokenId, reason = 'MANUAL') {
    try {
      const token = await prisma.accessToken.update({
        where: { id: tokenId },
        data: {
          isActive: false,
          revokedAt: new Date()
        }
      });

      await prisma.securityLog.create({
        data: {
          logType: 'CONFIG_CHANGE',
          severity: 'WARNING',
          userId: token.userId,
          message: `Token revoked: ${token.tokenName}`,
          details: {
            tokenId,
            reason,
            revokedAt: new Date()
          }
        }
      });

      return { success: true, message: 'Token revoked successfully' };
    } catch (error) {
      console.error('Error revoking token:', error);
      throw error;
    }
  }

  async detectSuspiciousTokenUsage(tokenId) {
    try {
      const logs = await prisma.tokenAccessLog.findMany({
        where: {
          tokenId,
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { timestamp: 'desc' }
      });

      const uniqueIPs = new Set(logs.map(l => l.ipAddress).filter(Boolean));
      const uniqueDevices = new Set(logs.map(l => l.deviceId).filter(Boolean));
      const unauthorizedAttempts = logs.filter(l => !l.isAuthorized).length;

      const isSuspicious = 
        uniqueIPs.size > 5 || 
        uniqueDevices.size > 3 || 
        unauthorizedAttempts > 5;

      if (isSuspicious) {
        const token = await prisma.accessToken.findUnique({
          where: { id: tokenId }
        });

        await prisma.accessToken.update({
          where: { id: tokenId },
          data: {
            isCompromised: true,
            compromisedAt: new Date()
          }
        });

        await this.rotateToken(tokenId, 'SUSPICIOUS_ACTIVITY');

        await prisma.alert.create({
          data: {
            alertType: 'SUSPICIOUS_ACTIVITY',
            severity: 'CRITICAL',
            message: `🚨 Suspicious token usage detected - Token [${token.tokenName}] rotated`,
            details: {
              tokenId,
              uniqueIPs: uniqueIPs.size,
              uniqueDevices: uniqueDevices.size,
              unauthorizedAttempts
            }
          }
        });

        return {
          suspicious: true,
          reason: 'Multiple IPs/devices or unauthorized attempts',
          action: 'Token rotated automatically',
          details: {
            uniqueIPs: uniqueIPs.size,
            uniqueDevices: uniqueDevices.size,
            unauthorizedAttempts
          }
        };
      }

      return { suspicious: false };
    } catch (error) {
      console.error('Error detecting suspicious token usage:', error);
      throw error;
    }
  }

  async logTokenAccess(tokenId, deviceId, action, isAuthorized, ipAddress = null, location = null) {
    try {
      await prisma.tokenAccessLog.create({
        data: {
          tokenId,
          deviceId,
          ipAddress,
          location,
          action,
          isAuthorized
        }
      });
    } catch (error) {
      console.error('Error logging token access:', error);
    }
  }

  async getTokensByUser(userId) {
    try {
      const tokens = await prisma.accessToken.findMany({
        where: { userId },
        include: {
          _count: {
            select: {
              tokenAccessLogs: true,
              tokenRotationHistory: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return tokens.map(token => ({
        id: token.id,
        tokenName: token.tokenName,
        tokenType: token.tokenType,
        isActive: token.isActive,
        deviceId: token.deviceId,
        lastRotated: token.lastRotated,
        nextRotation: token.nextRotation,
        rotationCount: token.rotationCount,
        accessCount: token.accessCount,
        lastUsed: token.lastUsed,
        isCompromised: token.isCompromised,
        accessLogCount: token._count.tokenAccessLogs,
        rotationHistoryCount: token._count.tokenRotationHistory
      }));
    } catch (error) {
      console.error('Error getting tokens by user:', error);
      throw error;
    }
  }

  async getTokenRotationHistory(tokenId) {
    try {
      const history = await prisma.tokenRotationHistory.findMany({
        where: { tokenId },
        orderBy: { rotatedAt: 'desc' }
      });

      return history;
    } catch (error) {
      console.error('Error getting token rotation history:', error);
      throw error;
    }
  }

  async getDashboardStats() {
    try {
      const total = await prisma.accessToken.count();
      const active = await prisma.accessToken.count({
        where: { isActive: true }
      });
      const compromised = await prisma.accessToken.count({
        where: { isCompromised: true }
      });
      const pendingRotation = await prisma.accessToken.count({
        where: {
          isActive: true,
          nextRotation: {
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        }
      });

      const recentRotations = await prisma.tokenRotationHistory.findMany({
        take: 10,
        orderBy: { rotatedAt: 'desc' },
        include: {
          token: {
            select: {
              tokenName: true,
              userId: true
            }
          }
        }
      });

      return {
        total,
        active,
        compromised,
        pendingRotation,
        recentRotations
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  async getTokenAccessActivity(tokenId, days = 7) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const logs = await prisma.tokenAccessLog.findMany({
        where: {
          tokenId,
          timestamp: { gte: startDate }
        },
        orderBy: { timestamp: 'desc' }
      });

      const dailyActivity = {};
      logs.forEach(log => {
        const date = log.timestamp.toISOString().split('T')[0];
        dailyActivity[date] = (dailyActivity[date] || 0) + 1;
      });

      return {
        totalAccess: logs.length,
        uniqueIPs: new Set(logs.map(l => l.ipAddress).filter(Boolean)).size,
        uniqueDevices: new Set(logs.map(l => l.deviceId).filter(Boolean)).size,
        unauthorizedAttempts: logs.filter(l => !l.isAuthorized).length,
        dailyActivity,
        recentLogs: logs.slice(0, 20)
      };
    } catch (error) {
      console.error('Error getting token access activity:', error);
      throw error;
    }
  }
}

module.exports = new TokenVaultService();
