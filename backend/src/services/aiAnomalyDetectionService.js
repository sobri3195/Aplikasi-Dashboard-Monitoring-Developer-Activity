const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AIAnomalyDetectionService {
  async learnBaseline(userId, deviceId = null) {
    try {
      const last60Days = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

      const activities = await prisma.activity.findMany({
        where: {
          userId,
          deviceId,
          timestamp: { gte: last60Days },
          isSuspicious: false
        },
        orderBy: { timestamp: 'asc' }
      });

      if (activities.length < 10) {
        return { success: false, message: 'Insufficient data to build baseline' };
      }

      const workingHoursPattern = this.extractWorkingHoursPattern(activities);
      const commitVolumePattern = this.extractCommitVolumePattern(activities);
      const fileTypesPattern = this.extractFileTypesPattern(activities);
      const repositoryPattern = this.extractRepositoryPattern(activities);
      const commandSequencePattern = this.extractCommandSequencePattern(activities);

      const baselines = [
        {
          userId,
          deviceId: deviceId || '',
          baselineType: 'WORKING_HOURS',
          normalPattern: workingHoursPattern,
          threshold: 0.75,
          sampleSize: activities.length,
          modelVersion: '1.0'
        },
        {
          userId,
          deviceId: deviceId || '',
          baselineType: 'COMMIT_VOLUME',
          normalPattern: commitVolumePattern,
          threshold: 0.75,
          sampleSize: activities.length,
          modelVersion: '1.0'
        },
        {
          userId,
          deviceId: deviceId || '',
          baselineType: 'FILE_TYPES',
          normalPattern: fileTypesPattern,
          threshold: 0.8,
          sampleSize: activities.length,
          modelVersion: '1.0'
        },
        {
          userId,
          deviceId: deviceId || '',
          baselineType: 'REPOSITORY_PATTERN',
          normalPattern: repositoryPattern,
          threshold: 0.7,
          sampleSize: activities.length,
          modelVersion: '1.0'
        },
        {
          userId,
          deviceId: deviceId || '',
          baselineType: 'COMMAND_SEQUENCE',
          normalPattern: commandSequencePattern,
          threshold: 0.75,
          sampleSize: activities.length,
          modelVersion: '1.0'
        }
      ];

      for (const baseline of baselines) {
        await prisma.anomalyBaseline.upsert({
          where: {
            userId_deviceId_baselineType: {
              userId,
              deviceId: deviceId || '',
              baselineType: baseline.baselineType
            }
          },
          update: {
            normalPattern: baseline.normalPattern,
            sampleSize: baseline.sampleSize,
            lastTrainingDate: new Date()
          },
          create: baseline
        });
      }

      return { success: true, baselines: baselines.length, sampleSize: activities.length };
    } catch (error) {
      console.error('Error learning baseline:', error);
      throw error;
    }
  }

  extractWorkingHoursPattern(activities) {
    const hourCounts = {};
    for (let i = 0; i < 24; i++) hourCounts[i] = 0;

    activities.forEach(activity => {
      const hour = activity.timestamp.getHours();
      hourCounts[hour]++;
    });

    const total = activities.length;
    const distribution = {};
    for (const [hour, count] of Object.entries(hourCounts)) {
      distribution[hour] = (count / total).toFixed(4);
    }

    const peakHours = Object.entries(distribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([hour]) => parseInt(hour));

    return {
      distribution,
      peakHours,
      averageActivitiesPerHour: (total / 24).toFixed(2)
    };
  }

  extractCommitVolumePattern(activities) {
    const dailyVolume = {};
    
    activities.forEach(activity => {
      const date = activity.timestamp.toISOString().split('T')[0];
      dailyVolume[date] = (dailyVolume[date] || 0) + 1;
    });

    const volumes = Object.values(dailyVolume);
    const avg = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const max = Math.max(...volumes);
    const min = Math.min(...volumes);

    return {
      averageDailyVolume: avg.toFixed(2),
      maxDailyVolume: max,
      minDailyVolume: min,
      standardDeviation: this.calculateStdDev(volumes).toFixed(2)
    };
  }

  extractFileTypesPattern(activities) {
    const fileTypes = {};
    
    activities.forEach(activity => {
      if (activity.details?.files) {
        activity.details.files.forEach(file => {
          const ext = file.split('.').pop() || 'no-ext';
          fileTypes[ext] = (fileTypes[ext] || 0) + 1;
        });
      }
    });

    const total = Object.values(fileTypes).reduce((a, b) => a + b, 0);
    const distribution = {};
    
    for (const [type, count] of Object.entries(fileTypes)) {
      distribution[type] = (count / total).toFixed(4);
    }

    return {
      distribution,
      commonTypes: Object.keys(fileTypes).slice(0, 10)
    };
  }

  extractRepositoryPattern(activities) {
    const repos = {};
    
    activities.forEach(activity => {
      if (activity.repository) {
        repos[activity.repository] = (repos[activity.repository] || 0) + 1;
      }
    });

    const total = activities.length;
    const distribution = {};
    
    for (const [repo, count] of Object.entries(repos)) {
      distribution[repo] = (count / total).toFixed(4);
    }

    return {
      distribution,
      frequentRepos: Object.keys(repos).slice(0, 10),
      uniqueRepos: Object.keys(repos).length
    };
  }

  extractCommandSequencePattern(activities) {
    const sequences = {};
    const types = {};

    activities.forEach(activity => {
      types[activity.activityType] = (types[activity.activityType] || 0) + 1;
    });

    for (let i = 0; i < activities.length - 1; i++) {
      const seq = `${activities[i].activityType}->${activities[i + 1].activityType}`;
      sequences[seq] = (sequences[seq] || 0) + 1;
    }

    return {
      typeDistribution: types,
      commonSequences: Object.entries(sequences)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([seq]) => seq)
    };
  }

  calculateStdDev(values) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  }

  async detectAnomaly(activity) {
    try {
      const baselines = await prisma.anomalyBaseline.findMany({
        where: {
          userId: activity.userId,
          OR: [
            { deviceId: activity.deviceId },
            { deviceId: null }
          ]
        }
      });

      if (baselines.length === 0) {
        await this.learnBaseline(activity.userId, activity.deviceId);
        return { isAnomaly: false, message: 'Baseline created, activity accepted' };
      }

      const anomalies = [];
      let totalAnomalyScore = 0;

      for (const baseline of baselines) {
        const score = this.calculateAnomalyScore(activity, baseline);
        
        if (score > baseline.threshold) {
          anomalies.push({
            baselineType: baseline.baselineType,
            score,
            threshold: baseline.threshold
          });
          totalAnomalyScore += score;
        }
      }

      const avgAnomalyScore = anomalies.length > 0 
        ? totalAnomalyScore / anomalies.length 
        : 0;

      if (anomalies.length >= 2 && avgAnomalyScore > 0.75) {
        await this.recordAnomaly(activity, avgAnomalyScore, anomalies);
        await this.triggerAutoResponse(activity, avgAnomalyScore);
        
        return {
          isAnomaly: true,
          score: avgAnomalyScore,
          anomalies,
          severity: this.getSeverity(avgAnomalyScore)
        };
      }

      return { isAnomaly: false, score: avgAnomalyScore };
    } catch (error) {
      console.error('Error detecting anomaly:', error);
      throw error;
    }
  }

  calculateAnomalyScore(activity, baseline) {
    const pattern = baseline.normalPattern;
    
    switch (baseline.baselineType) {
      case 'WORKING_HOURS':
        return this.scoreWorkingHours(activity, pattern);
      case 'COMMIT_VOLUME':
        return this.scoreCommitVolume(activity, pattern);
      case 'FILE_TYPES':
        return this.scoreFileTypes(activity, pattern);
      case 'REPOSITORY_PATTERN':
        return this.scoreRepository(activity, pattern);
      case 'COMMAND_SEQUENCE':
        return this.scoreCommandSequence(activity, pattern);
      default:
        return 0;
    }
  }

  scoreWorkingHours(activity, pattern) {
    const hour = activity.timestamp.getHours();
    const probability = parseFloat(pattern.distribution[hour] || 0);
    
    if (pattern.peakHours.includes(hour)) {
      return 0;
    }
    
    return probability < 0.01 ? 0.9 : 1 - probability * 10;
  }

  scoreCommitVolume(activity, pattern) {
    return 0.1;
  }

  scoreFileTypes(activity, pattern) {
    if (!activity.details?.files) return 0;
    
    const files = activity.details.files;
    let unknownCount = 0;
    
    files.forEach(file => {
      const ext = file.split('.').pop();
      if (!pattern.commonTypes.includes(ext)) {
        unknownCount++;
      }
    });
    
    return Math.min(unknownCount / files.length, 1);
  }

  scoreRepository(activity, pattern) {
    if (!activity.repository) return 0;
    
    const repoProb = parseFloat(pattern.distribution[activity.repository] || 0);
    return repoProb < 0.01 ? 0.8 : 0;
  }

  scoreCommandSequence(activity, pattern) {
    const typeProb = pattern.typeDistribution[activity.activityType] || 0;
    const total = Object.values(pattern.typeDistribution).reduce((a, b) => a + b, 0);
    const probability = typeProb / total;
    
    return probability < 0.01 ? 0.7 : 0;
  }

  getSeverity(score) {
    if (score >= 0.9) return 'CRITICAL';
    if (score >= 0.8) return 'HIGH';
    if (score >= 0.6) return 'MEDIUM';
    return 'LOW';
  }

  async recordAnomaly(activity, score, anomalies) {
    try {
      const anomalyType = this.determineAnomalyType(anomalies);
      
      await prisma.anomalyDetection.create({
        data: {
          userId: activity.userId,
          deviceId: activity.deviceId,
          activityId: activity.id,
          anomalyType,
          anomalyScore: score,
          description: `Unusual ${anomalyType} detected with score ${score.toFixed(2)}`,
          details: {
            anomalies,
            activity: {
              type: activity.activityType,
              repository: activity.repository,
              timestamp: activity.timestamp
            }
          }
        }
      });

      await prisma.activity.update({
        where: { id: activity.id },
        data: {
          isSuspicious: true,
          riskLevel: this.getSeverity(score) === 'CRITICAL' ? 'CRITICAL' : 'HIGH'
        }
      });
    } catch (error) {
      console.error('Error recording anomaly:', error);
    }
  }

  determineAnomalyType(anomalies) {
    const types = anomalies.map(a => a.baselineType);
    
    if (types.includes('WORKING_HOURS')) return 'UNUSUAL_TIME';
    if (types.includes('COMMIT_VOLUME')) return 'HIGH_FREQUENCY';
    if (types.includes('REPOSITORY_PATTERN')) return 'UNUSUAL_REPOSITORY';
    if (types.includes('COMMAND_SEQUENCE')) return 'UNUSUAL_COMMAND_PATTERN';
    
    return 'DATA_EXFILTRATION';
  }

  async triggerAutoResponse(activity, score) {
    try {
      const severity = this.getSeverity(score);
      
      if (severity === 'CRITICAL' && score >= 0.9) {
        await this.executeAutoResponse(activity, 'SUSPEND_REPO', severity);
        await this.executeAutoResponse(activity, 'ENCRYPT_REPO', severity);
        await this.executeAutoResponse(activity, 'NOTIFY_ADMIN', severity);
      } else if (severity === 'HIGH') {
        await this.executeAutoResponse(activity, 'ALERT_ONLY', severity);
        await this.executeAutoResponse(activity, 'NOTIFY_ADMIN', severity);
      } else {
        await this.executeAutoResponse(activity, 'ALERT_ONLY', severity);
      }
    } catch (error) {
      console.error('Error triggering auto response:', error);
    }
  }

  async executeAutoResponse(activity, responseType, severity) {
    try {
      const anomaly = await prisma.anomalyDetection.findFirst({
        where: { activityId: activity.id },
        orderBy: { timestamp: 'desc' }
      });

      if (!anomaly) return;

      const response = await prisma.anomalyResponse.create({
        data: {
          anomalyId: anomaly.id,
          responseType,
          action: this.getActionDescription(responseType),
          executedBy: 'SYSTEM',
          status: 'PENDING',
          details: {
            activityId: activity.id,
            severity,
            timestamp: new Date()
          }
        }
      });

      switch (responseType) {
        case 'SUSPEND_REPO':
          await this.suspendRepository(activity.repository);
          break;
        case 'ENCRYPT_REPO':
          await this.encryptRepository(activity.repository);
          break;
        case 'NOTIFY_ADMIN':
          await this.notifyAdmins(activity, severity);
          break;
        case 'REVOKE_ACCESS':
          await this.revokeUserAccess(activity.userId);
          break;
      }

      await prisma.anomalyResponse.update({
        where: { id: response.id },
        data: { status: 'EXECUTED' }
      });

      await prisma.alert.create({
        data: {
          activityId: activity.id,
          alertType: 'SUSPICIOUS_ACTIVITY',
          severity: severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
          message: `Auto-response triggered: ${this.getActionDescription(responseType)}`,
          details: {
            responseType,
            action: this.getActionDescription(responseType),
            timestamp: new Date()
          }
        }
      });
    } catch (error) {
      console.error('Error executing auto response:', error);
    }
  }

  getActionDescription(responseType) {
    const descriptions = {
      ALERT_ONLY: 'Alert generated - monitoring continued',
      SUSPEND_REPO: 'Repository access suspended temporarily',
      ENCRYPT_REPO: 'Repository encrypted automatically',
      REVOKE_ACCESS: 'User access revoked',
      NOTIFY_ADMIN: 'Administrator notified'
    };
    return descriptions[responseType] || 'Unknown action';
  }

  async suspendRepository(repository) {
    if (!repository) return;
    
    const repo = await prisma.repository.findFirst({
      where: { name: repository }
    });

    if (repo) {
      await prisma.repository.update({
        where: { id: repo.id },
        data: { securityStatus: 'WARNING' }
      });
    }
  }

  async encryptRepository(repository) {
    if (!repository) return;
    
    const repo = await prisma.repository.findFirst({
      where: { name: repository }
    });

    if (repo) {
      await prisma.repository.update({
        where: { id: repo.id },
        data: {
          isEncrypted: true,
          encryptedAt: new Date(),
          securityStatus: 'ENCRYPTED'
        }
      });
    }
  }

  async revokeUserAccess(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });
  }

  async notifyAdmins(activity, severity) {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });

    for (const admin of admins) {
      console.log(`Notifying admin ${admin.email} about ${severity} anomaly`);
    }
  }

  async getHeatmapData(userId, startDate, endDate) {
    try {
      const activities = await prisma.activity.findMany({
        where: {
          userId,
          timestamp: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      const heatmap = {};
      
      activities.forEach(activity => {
        const date = activity.timestamp.toISOString().split('T')[0];
        const hour = activity.timestamp.getHours();
        const key = `${date}_${hour}`;
        
        heatmap[key] = (heatmap[key] || 0) + 1;
      });

      return heatmap;
    } catch (error) {
      console.error('Error generating heatmap data:', error);
      throw error;
    }
  }

  async getAnomalyHistory(userId, filters = {}) {
    try {
      const where = { userId };
      
      if (filters.startDate && filters.endDate) {
        where.timestamp = {
          gte: new Date(filters.startDate),
          lte: new Date(filters.endDate)
        };
      }
      
      if (filters.severity) {
        where.anomalyScore = this.getSeverityRange(filters.severity);
      }

      const anomalies = await prisma.anomalyDetection.findMany({
        where,
        include: {
          anomalyResponses: true
        },
        orderBy: { timestamp: 'desc' }
      });

      return anomalies.map(a => ({
        ...a,
        severity: this.getSeverity(a.anomalyScore)
      }));
    } catch (error) {
      console.error('Error getting anomaly history:', error);
      throw error;
    }
  }

  getSeverityRange(severity) {
    switch (severity) {
      case 'LOW': return { gte: 0, lt: 0.6 };
      case 'MEDIUM': return { gte: 0.6, lt: 0.8 };
      case 'HIGH': return { gte: 0.8, lt: 0.9 };
      case 'CRITICAL': return { gte: 0.9, lte: 1 };
      default: return {};
    }
  }
}

module.exports = new AIAnomalyDetectionService();
