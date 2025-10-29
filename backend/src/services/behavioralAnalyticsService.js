const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class BehavioralAnalyticsService {
  async analyzeUserBehavior(userId, activityData) {
    const patterns = await this.getUserPatterns(userId);
    const anomalies = [];

    for (const pattern of patterns) {
      const anomaly = await this.detectAnomaly(userId, pattern, activityData);
      if (anomaly) {
        anomalies.push(anomaly);
      }
    }

    return anomalies;
  }

  async getUserPatterns(userId) {
    return await prisma.behavioralPattern.findMany({
      where: { userId }
    });
  }

  async updateBehavioralPattern(userId, deviceId, patternType, behaviorData) {
    const existingPattern = await prisma.behavioralPattern.findUnique({
      where: {
        userId_deviceId_patternType: {
          userId,
          deviceId: deviceId || null,
          patternType
        }
      }
    });

    const normalBehavior = existingPattern
      ? this.mergePatterns(existingPattern.normalBehavior, behaviorData)
      : behaviorData;

    return await prisma.behavioralPattern.upsert({
      where: {
        userId_deviceId_patternType: {
          userId,
          deviceId: deviceId || null,
          patternType
        }
      },
      update: {
        normalBehavior,
        lastUpdated: new Date()
      },
      create: {
        userId,
        deviceId,
        patternType,
        normalBehavior,
        threshold: 0.8
      }
    });
  }

  async detectAnomaly(userId, pattern, activityData) {
    const score = this.calculateAnomalyScore(pattern, activityData);
    
    if (score > pattern.threshold) {
      const anomalyType = this.determineAnomalyType(pattern.patternType, activityData);
      const description = this.generateAnomalyDescription(anomalyType, score, activityData);

      const anomaly = await prisma.anomalyDetection.create({
        data: {
          userId,
          deviceId: activityData.deviceId,
          activityId: activityData.activityId,
          anomalyType,
          anomalyScore: score,
          description,
          details: activityData
        }
      });

      return anomaly;
    }

    return null;
  }

  calculateAnomalyScore(pattern, activityData) {
    const normalBehavior = pattern.normalBehavior;
    let score = 0;

    switch (pattern.patternType) {
      case 'ACCESS_TIME':
        score = this.calculateTimeAnomaly(normalBehavior, activityData);
        break;
      case 'GIT_COMMAND_FREQUENCY':
        score = this.calculateFrequencyAnomaly(normalBehavior, activityData);
        break;
      case 'REPOSITORY_ACCESS':
        score = this.calculateRepositoryAnomaly(normalBehavior, activityData);
        break;
      case 'LOCATION_PATTERN':
        score = this.calculateLocationAnomaly(normalBehavior, activityData);
        break;
      case 'DEVICE_USAGE':
        score = this.calculateDeviceAnomaly(normalBehavior, activityData);
        break;
      default:
        score = 0;
    }

    return Math.min(score, 1.0);
  }

  calculateTimeAnomaly(normalBehavior, activityData) {
    const activityHour = new Date(activityData.timestamp).getHours();
    const normalHours = normalBehavior.commonHours || [];
    
    if (normalHours.length === 0) return 0;

    const hourDistances = normalHours.map(hour => 
      Math.min(Math.abs(hour - activityHour), 24 - Math.abs(hour - activityHour))
    );
    
    const minDistance = Math.min(...hourDistances);
    return minDistance > 4 ? minDistance / 12 : 0;
  }

  calculateFrequencyAnomaly(normalBehavior, activityData) {
    const averageFrequency = normalBehavior.averageFrequency || 10;
    const currentFrequency = activityData.recentActivityCount || 0;
    
    const deviation = Math.abs(currentFrequency - averageFrequency) / averageFrequency;
    return Math.min(deviation, 1.0);
  }

  calculateRepositoryAnomaly(normalBehavior, activityData) {
    const commonRepos = normalBehavior.commonRepositories || [];
    const currentRepo = activityData.repository;

    if (commonRepos.length === 0) return 0;

    return commonRepos.includes(currentRepo) ? 0 : 0.9;
  }

  calculateLocationAnomaly(normalBehavior, activityData) {
    const commonLocations = normalBehavior.commonLocations || [];
    const currentLocation = activityData.location;

    if (!currentLocation || commonLocations.length === 0) return 0;

    return commonLocations.includes(currentLocation) ? 0 : 0.85;
  }

  calculateDeviceAnomaly(normalBehavior, activityData) {
    const commonDevices = normalBehavior.commonDevices || [];
    const currentDevice = activityData.deviceId;

    if (commonDevices.length === 0) return 0;

    return commonDevices.includes(currentDevice) ? 0 : 0.95;
  }

  determineAnomalyType(patternType, activityData) {
    const mapping = {
      'ACCESS_TIME': 'UNUSUAL_TIME',
      'GIT_COMMAND_FREQUENCY': 'HIGH_FREQUENCY',
      'REPOSITORY_ACCESS': 'UNUSUAL_REPOSITORY',
      'LOCATION_PATTERN': 'UNUSUAL_LOCATION',
      'DEVICE_USAGE': 'UNUSUAL_DEVICE'
    };

    return mapping[patternType] || 'UNUSUAL_COMMAND_PATTERN';
  }

  generateAnomalyDescription(anomalyType, score, activityData) {
    const scorePercent = (score * 100).toFixed(0);
    const descriptions = {
      'UNUSUAL_TIME': `Access at unusual time (${scorePercent}% anomaly)`,
      'HIGH_FREQUENCY': `Unusually high activity frequency (${scorePercent}% anomaly)`,
      'UNUSUAL_REPOSITORY': `Access to unusual repository: ${activityData.repository}`,
      'UNUSUAL_LOCATION': `Access from unusual location: ${activityData.location}`,
      'UNUSUAL_DEVICE': `Activity from unusual device`,
      'DATA_EXFILTRATION': `Potential data exfiltration detected (${scorePercent}% confidence)`
    };

    return descriptions[anomalyType] || `Anomalous behavior detected (${scorePercent}%)`;
  }

  mergePatterns(existingPattern, newData) {
    return {
      ...existingPattern,
      ...newData,
      lastMerged: new Date().toISOString()
    };
  }

  async buildUserProfile(userId) {
    const activities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 1000
    });

    const profile = {
      commonHours: this.extractCommonHours(activities),
      averageFrequency: this.calculateAverageFrequency(activities),
      commonRepositories: this.extractCommonRepositories(activities),
      commonLocations: this.extractCommonLocations(activities),
      commonDevices: this.extractCommonDevices(activities)
    };

    await this.updateBehavioralPattern(userId, null, 'ACCESS_TIME', {
      commonHours: profile.commonHours
    });

    await this.updateBehavioralPattern(userId, null, 'GIT_COMMAND_FREQUENCY', {
      averageFrequency: profile.averageFrequency
    });

    await this.updateBehavioralPattern(userId, null, 'REPOSITORY_ACCESS', {
      commonRepositories: profile.commonRepositories
    });

    await this.updateBehavioralPattern(userId, null, 'LOCATION_PATTERN', {
      commonLocations: profile.commonLocations
    });

    await this.updateBehavioralPattern(userId, null, 'DEVICE_USAGE', {
      commonDevices: profile.commonDevices
    });

    return profile;
  }

  extractCommonHours(activities) {
    const hourCounts = {};
    activities.forEach(activity => {
      const hour = new Date(activity.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const sortedHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([hour]) => parseInt(hour));

    return sortedHours;
  }

  calculateAverageFrequency(activities) {
    if (activities.length === 0) return 0;

    const days = new Set(activities.map(a => 
      new Date(a.timestamp).toISOString().split('T')[0]
    )).size;

    return days > 0 ? activities.length / days : 0;
  }

  extractCommonRepositories(activities) {
    const repoCounts = {};
    activities.forEach(activity => {
      if (activity.repository) {
        repoCounts[activity.repository] = (repoCounts[activity.repository] || 0) + 1;
      }
    });

    return Object.entries(repoCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([repo]) => repo);
  }

  extractCommonLocations(activities) {
    const locationCounts = {};
    activities.forEach(activity => {
      if (activity.location) {
        locationCounts[activity.location] = (locationCounts[activity.location] || 0) + 1;
      }
    });

    return Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([location]) => location);
  }

  extractCommonDevices(activities) {
    const deviceCounts = {};
    activities.forEach(activity => {
      if (activity.deviceId) {
        deviceCounts[activity.deviceId] = (deviceCounts[activity.deviceId] || 0) + 1;
      }
    });

    return Object.entries(deviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([deviceId]) => deviceId);
  }

  async getAnomalySummary(userId, timeRange = '7d') {
    const startDate = this.getStartDate(timeRange);

    const anomalies = await prisma.anomalyDetection.findMany({
      where: {
        userId,
        timestamp: { gte: startDate }
      },
      orderBy: { timestamp: 'desc' }
    });

    const summary = {
      total: anomalies.length,
      byType: {},
      highRisk: anomalies.filter(a => a.anomalyScore > 0.9).length,
      unreviewed: anomalies.filter(a => !a.isReviewed).length
    };

    anomalies.forEach(anomaly => {
      summary.byType[anomaly.anomalyType] = (summary.byType[anomaly.anomalyType] || 0) + 1;
    });

    return summary;
  }

  getStartDate(timeRange) {
    const now = new Date();
    switch (timeRange) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }
}

module.exports = new BehavioralAnalyticsService();
