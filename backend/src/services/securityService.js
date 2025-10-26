const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');
const notificationService = require('./notificationService');

const prisma = new PrismaClient();

class SecurityService {
  async analyzeActivity(activity) {
    const risks = [];
    let riskLevel = 'LOW';
    let isSuspicious = false;

    if (!activity.device?.isAuthorized) {
      risks.push('Unauthorized device');
      riskLevel = 'CRITICAL';
      isSuspicious = true;
    }

    if (activity.activityType === 'REPO_COPY') {
      risks.push('Repository copy detected');
      riskLevel = this.escalateRiskLevel(riskLevel, 'HIGH');
      isSuspicious = true;
    }

    if (activity.activityType === 'UNAUTHORIZED_ACCESS') {
      risks.push('Unauthorized access attempt');
      riskLevel = 'CRITICAL';
      isSuspicious = true;
    }

    const recentActivities = await prisma.activity.count({
      where: {
        userId: activity.userId,
        timestamp: {
          gte: new Date(Date.now() - 3600000)
        }
      }
    });

    if (recentActivities > 50) {
      risks.push('Unusual activity frequency');
      riskLevel = this.escalateRiskLevel(riskLevel, 'MEDIUM');
      isSuspicious = true;
    }

    return {
      isSuspicious,
      riskLevel,
      risks
    };
  }

  async createAlert(activityId, alertType, severity, message) {
    try {
      const alert = await prisma.alert.create({
        data: {
          activityId,
          alertType,
          severity,
          message
        },
        include: {
          activity: {
            include: {
              user: true,
              device: true
            }
          }
        }
      });

      await notificationService.notifyAll(alert, alert.activity);

      return alert;
    } catch (error) {
      logger.error('Failed to create alert:', error.message);
      throw error;
    }
  }

  async checkDeviceAuthorization(deviceId) {
    const device = await prisma.device.findUnique({
      where: { id: deviceId }
    });

    return device && device.isAuthorized && device.status === 'APPROVED';
  }

  async triggerEncryption(repositoryName, reason) {
    try {
      logger.warn(`Triggering encryption for repository: ${repositoryName}`);
      logger.warn(`Reason: ${reason}`);

      await prisma.repository.upsert({
        where: { name: repositoryName },
        update: {
          isEncrypted: true,
          encryptedAt: new Date(),
          securityStatus: 'ENCRYPTED'
        },
        create: {
          name: repositoryName,
          isEncrypted: true,
          encryptedAt: new Date(),
          securityStatus: 'ENCRYPTED'
        }
      });

      await notificationService.sendSlackNotification(
        `⚠️ Repository "${repositoryName}" has been encrypted due to: ${reason}`,
        'CRITICAL'
      );

      return true;
    } catch (error) {
      logger.error('Failed to trigger encryption:', error.message);
      return false;
    }
  }

  escalateRiskLevel(currentLevel, newLevel) {
    const levels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const currentIndex = levels.indexOf(currentLevel);
    const newIndex = levels.indexOf(newLevel);
    return newIndex > currentIndex ? newLevel : currentLevel;
  }

  async getSecurityStats() {
    const [
      totalDevices,
      authorizedDevices,
      pendingDevices,
      suspiciousActivities,
      criticalAlerts,
      encryptedRepos
    ] = await Promise.all([
      prisma.device.count(),
      prisma.device.count({ where: { isAuthorized: true } }),
      prisma.device.count({ where: { status: 'PENDING' } }),
      prisma.activity.count({ where: { isSuspicious: true } }),
      prisma.alert.count({ where: { severity: 'CRITICAL', isResolved: false } }),
      prisma.repository.count({ where: { isEncrypted: true } })
    ]);

    return {
      totalDevices,
      authorizedDevices,
      pendingDevices,
      suspiciousActivities,
      criticalAlerts,
      encryptedRepos,
      securityScore: this.calculateSecurityScore({
        totalDevices,
        authorizedDevices,
        suspiciousActivities,
        criticalAlerts
      })
    };
  }

  calculateSecurityScore(stats) {
    let score = 100;

    if (stats.totalDevices > 0) {
      const unauthorizedRatio = 1 - (stats.authorizedDevices / stats.totalDevices);
      score -= unauthorizedRatio * 30;
    }

    score -= Math.min(stats.suspiciousActivities * 2, 30);
    score -= Math.min(stats.criticalAlerts * 5, 40);

    return Math.max(0, Math.round(score));
  }
}

module.exports = new SecurityService();
