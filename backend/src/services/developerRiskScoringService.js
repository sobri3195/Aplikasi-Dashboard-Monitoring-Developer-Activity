const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DeveloperRiskScoringService {
  async calculateRiskScore(userId) {
    try {
      const now = new Date();
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const activities = await prisma.activity.findMany({
        where: {
          userId,
          timestamp: { gte: last30Days }
        },
        orderBy: { timestamp: 'desc' }
      });

      const anomalies = await prisma.anomalyDetection.findMany({
        where: {
          userId,
          timestamp: { gte: last30Days }
        }
      });

      const recentActivities = activities.filter(a => a.timestamp >= last7Days);

      const cloneFrequency = activities.filter(a => a.activityType === 'GIT_CLONE').length;
      const pushFrequency = activities.filter(a => a.activityType === 'GIT_PUSH').length;
      const suspiciousCount = activities.filter(a => a.isSuspicious).length;
      const anomalyCount = anomalies.length;

      const offHoursActivities = activities.filter(a => {
        const hour = a.timestamp.getHours();
        return hour < 6 || hour > 22;
      }).length;

      const uniqueRepos = new Set(activities.map(a => a.repository).filter(Boolean)).size;
      const uniqueIPs = new Set(activities.map(a => a.ipAddress).filter(Boolean)).size;

      let riskScore = 0;

      if (cloneFrequency > 20) riskScore += 15;
      else if (cloneFrequency > 10) riskScore += 10;
      else if (cloneFrequency > 5) riskScore += 5;

      if (pushFrequency > 50) riskScore += 10;
      else if (pushFrequency > 30) riskScore += 5;

      riskScore += Math.min(suspiciousCount * 8, 30);
      riskScore += Math.min(anomalyCount * 5, 20);

      if (offHoursActivities > 10) riskScore += 15;
      else if (offHoursActivities > 5) riskScore += 8;

      if (uniqueIPs > 5) riskScore += 12;
      else if (uniqueIPs > 3) riskScore += 6;

      if (uniqueRepos > 15) riskScore += 8;
      
      const activitySpikes = this.detectActivitySpikes(activities);
      riskScore += Math.min(activitySpikes * 5, 15);

      riskScore = Math.min(Math.round(riskScore), 100);

      const status = this.determineRiskStatus(riskScore);
      const watchStatus = riskScore >= 70;

      const accessPatterns = this.analyzeAccessPatterns(activities);
      const recommendations = this.generateRecommendations(riskScore, activities, anomalies);

      const existingScore = await prisma.developerRiskScore.findUnique({
        where: { userId }
      });

      const alertHistory = existingScore?.alertHistory || [];
      if (riskScore >= 70) {
        alertHistory.push({
          timestamp: now,
          score: riskScore,
          reason: `High risk score detected: ${riskScore}`,
          triggered: true
        });
      }

      const riskData = {
        userId,
        riskScore,
        status,
        cloneFrequency,
        pushFrequency,
        accessPatterns,
        anomalyCount,
        lastEvaluated: now,
        watchStatus,
        alertHistory: JSON.parse(JSON.stringify(alertHistory)),
        recommendations: JSON.parse(JSON.stringify(recommendations))
      };

      const updatedScore = await prisma.developerRiskScore.upsert({
        where: { userId },
        update: riskData,
        create: riskData
      });

      if (watchStatus) {
        await this.createRiskAlert(userId, riskScore);
      }

      return updatedScore;
    } catch (error) {
      console.error('Error calculating risk score:', error);
      throw error;
    }
  }

  determineRiskStatus(score) {
    if (score >= 85) return 'CRITICAL';
    if (score >= 70) return 'UNDER_WATCH';
    if (score >= 50) return 'HIGH';
    if (score >= 30) return 'ELEVATED';
    return 'NORMAL';
  }

  detectActivitySpikes(activities) {
    if (activities.length < 7) return 0;

    const dailyActivity = {};
    activities.forEach(activity => {
      const date = activity.timestamp.toISOString().split('T')[0];
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });

    const counts = Object.values(dailyActivity);
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
    const spikes = counts.filter(count => count > avg * 2.5).length;

    return spikes;
  }

  analyzeAccessPatterns(activities) {
    const patterns = {
      mostActiveHours: {},
      mostActiveRepos: {},
      mostCommonTypes: {},
      locationChanges: 0
    };

    activities.forEach(activity => {
      const hour = activity.timestamp.getHours();
      patterns.mostActiveHours[hour] = (patterns.mostActiveHours[hour] || 0) + 1;

      if (activity.repository) {
        patterns.mostCommonTypes[activity.activityType] = 
          (patterns.mostCommonTypes[activity.activityType] || 0) + 1;
      }
    });

    const locations = new Set(activities.map(a => a.location).filter(Boolean));
    patterns.locationChanges = locations.size;

    return patterns;
  }

  generateRecommendations(score, activities, anomalies) {
    const recommendations = [];

    if (score >= 70) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Enable enhanced monitoring for this developer',
        reason: 'Risk score exceeds threshold'
      });
      recommendations.push({
        priority: 'HIGH',
        action: 'Review recent activity logs',
        reason: 'Potential security risk detected'
      });
    }

    if (anomalies.length > 5) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Investigate anomalous behavior patterns',
        reason: `${anomalies.length} anomalies detected in last 30 days`
      });
    }

    const offHoursCount = activities.filter(a => {
      const hour = a.timestamp.getHours();
      return hour < 6 || hour > 22;
    }).length;

    if (offHoursCount > 10) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Review off-hours access patterns',
        reason: `${offHoursCount} activities outside normal hours`
      });
    }

    const suspiciousCount = activities.filter(a => a.isSuspicious).length;
    if (suspiciousCount > 5) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Restrict access temporarily',
        reason: `${suspiciousCount} suspicious activities detected`
      });
    }

    if (score < 30) {
      recommendations.push({
        priority: 'LOW',
        action: 'No immediate action required',
        reason: 'Developer behavior within normal parameters'
      });
    }

    return recommendations;
  }

  async createRiskAlert(userId, score) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      
      await prisma.alert.create({
        data: {
          alertType: 'SUSPICIOUS_ACTIVITY',
          severity: score >= 85 ? 'CRITICAL' : 'WARNING',
          message: `⚠️ Developer [ID: ${user?.email || userId}] shows unusual activity pattern — risk score: ${score}`,
          details: {
            userId,
            riskScore: score,
            timestamp: new Date(),
            action: 'Risk score elevated - under watch status enabled'
          }
        }
      });

      await prisma.securityLog.create({
        data: {
          logType: 'SUSPICIOUS_ACTIVITY',
          severity: score >= 85 ? 'CRITICAL' : 'WARNING',
          userId,
          message: `High risk score detected: ${score}`,
          details: {
            riskScore: score,
            action: 'Alert created'
          }
        }
      });
    } catch (error) {
      console.error('Error creating risk alert:', error);
    }
  }

  async getAllRiskScores(filters = {}) {
    try {
      const where = {};
      
      if (filters.minScore) {
        where.riskScore = { gte: parseFloat(filters.minScore) };
      }
      
      if (filters.status) {
        where.status = filters.status;
      }
      
      if (filters.watchStatus !== undefined) {
        where.watchStatus = filters.watchStatus === 'true';
      }

      const scores = await prisma.developerRiskScore.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true
            }
          }
        },
        orderBy: { riskScore: 'desc' }
      });

      return scores;
    } catch (error) {
      console.error('Error getting risk scores:', error);
      throw error;
    }
  }

  async getRiskScoreByUser(userId) {
    try {
      const score = await prisma.developerRiskScore.findUnique({
        where: { userId }
      });

      if (!score) {
        return await this.calculateRiskScore(userId);
      }

      return score;
    } catch (error) {
      console.error('Error getting user risk score:', error);
      throw error;
    }
  }

  async recalculateAllRiskScores() {
    try {
      const users = await prisma.user.findMany({
        where: { role: 'DEVELOPER' }
      });

      const results = [];
      for (const user of users) {
        const score = await this.calculateRiskScore(user.id);
        results.push(score);
      }

      return results;
    } catch (error) {
      console.error('Error recalculating all risk scores:', error);
      throw error;
    }
  }

  async getDashboardStats() {
    try {
      const total = await prisma.developerRiskScore.count();
      const critical = await prisma.developerRiskScore.count({
        where: { status: 'CRITICAL' }
      });
      const underWatch = await prisma.developerRiskScore.count({
        where: { watchStatus: true }
      });
      const high = await prisma.developerRiskScore.count({
        where: { status: 'HIGH' }
      });
      const normal = await prisma.developerRiskScore.count({
        where: { status: 'NORMAL' }
      });

      const avgScore = await prisma.developerRiskScore.aggregate({
        _avg: { riskScore: true }
      });

      return {
        total,
        critical,
        underWatch,
        high,
        normal,
        averageScore: avgScore._avg.riskScore || 0
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }
}

module.exports = new DeveloperRiskScoringService();
