const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');
const behavioralAnalyticsService = require('../services/behavioralAnalyticsService');

const prisma = new PrismaClient();

exports.getAnomalyDetections = asyncHandler(async (req, res) => {
  const { 
    userId, 
    anomalyType, 
    isReviewed, 
    timeRange = '7d',
    page = 1,
    limit = 50
  } = req.query;

  const startDate = getStartDateByRange(timeRange);
  const skip = (page - 1) * limit;

  const whereClause = {
    timestamp: { gte: startDate }
  };

  if (userId) whereClause.userId = userId;
  if (anomalyType) whereClause.anomalyType = anomalyType;
  if (isReviewed !== undefined) whereClause.isReviewed = isReviewed === 'true';

  const [anomalies, total] = await Promise.all([
    prisma.anomalyDetection.findMany({
      where: whereClause,
      orderBy: [
        { anomalyScore: 'desc' },
        { timestamp: 'desc' }
      ],
      skip,
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    }),
    prisma.anomalyDetection.count({ where: whereClause })
  ]);

  res.json({
    success: true,
    data: {
      anomalies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

exports.getAnomalyStats = asyncHandler(async (req, res) => {
  const { userId, timeRange = '7d' } = req.query;

  const startDate = getStartDateByRange(timeRange);
  const whereClause = {
    timestamp: { gte: startDate }
  };

  if (userId) whereClause.userId = userId;

  const [
    totalAnomalies,
    highRiskAnomalies,
    unreviewedAnomalies,
    anomaliesByType,
    anomaliesByUser,
    timeline
  ] = await Promise.all([
    prisma.anomalyDetection.count({ where: whereClause }),

    prisma.anomalyDetection.count({
      where: { ...whereClause, anomalyScore: { gte: 0.9 } }
    }),

    prisma.anomalyDetection.count({
      where: { ...whereClause, isReviewed: false }
    }),

    prisma.anomalyDetection.groupBy({
      by: ['anomalyType'],
      where: whereClause,
      _count: true,
      _avg: { anomalyScore: true }
    }),

    prisma.anomalyDetection.groupBy({
      by: ['userId'],
      where: whereClause,
      _count: true,
      orderBy: { _count: { userId: 'desc' } },
      take: 10
    }),

    getAnomalyTimeline(whereClause)
  ]);

  const topUsers = await enrichUserData(anomaliesByUser);

  res.json({
    success: true,
    data: {
      summary: {
        total: totalAnomalies,
        highRisk: highRiskAnomalies,
        unreviewed: unreviewedAnomalies
      },
      byType: anomaliesByType,
      topUsers,
      timeline
    }
  });
});

exports.reviewAnomaly = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isFalsePositive, notes } = req.body;
  const reviewerId = req.user.id;

  const existingAnomaly = await prisma.anomalyDetection.findUnique({
    where: { id }
  });

  if (!existingAnomaly) {
    return res.status(404).json({
      success: false,
      message: 'Anomaly not found'
    });
  }

  const anomaly = await prisma.anomalyDetection.update({
    where: { id },
    data: {
      isReviewed: true,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      isFalsePositive: isFalsePositive || false,
      details: {
        ...(existingAnomaly.details || {}),
        reviewNotes: notes
      }
    }
  });

  res.json({
    success: true,
    data: anomaly
  });
});

exports.getUserBehavioralProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const patterns = await prisma.behavioralPattern.findMany({
    where: { userId }
  });

  if (patterns.length === 0) {
    const profile = await behavioralAnalyticsService.buildUserProfile(userId);
    return res.json({
      success: true,
      data: {
        userId,
        profile,
        isNew: true
      }
    });
  }

  const anomalySummary = await behavioralAnalyticsService.getAnomalySummary(userId, '30d');

  res.json({
    success: true,
    data: {
      userId,
      patterns,
      anomalySummary,
      isNew: false
    }
  });
});

exports.buildBehavioralProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const profile = await behavioralAnalyticsService.buildUserProfile(userId);

  res.json({
    success: true,
    data: {
      userId,
      profile,
      message: 'Behavioral profile built successfully'
    }
  });
});

exports.analyzeActivity = asyncHandler(async (req, res) => {
  const { activityId } = req.params;

  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      user: true,
      device: true
    }
  });

  if (!activity) {
    return res.status(404).json({
      success: false,
      message: 'Activity not found'
    });
  }

  const recentActivityCount = await prisma.activity.count({
    where: {
      userId: activity.userId,
      timestamp: {
        gte: new Date(Date.now() - 60 * 60 * 1000)
      }
    }
  });

  const activityData = {
    activityId: activity.id,
    userId: activity.userId,
    deviceId: activity.deviceId,
    timestamp: activity.timestamp,
    repository: activity.repository,
    location: activity.location,
    recentActivityCount
  };

  const anomalies = await behavioralAnalyticsService.analyzeUserBehavior(
    activity.userId,
    activityData
  );

  res.json({
    success: true,
    data: {
      activity,
      anomalies,
      isAnomalous: anomalies.length > 0
    }
  });
});

exports.getAnomalyDashboard = asyncHandler(async (req, res) => {
  const { timeRange = '7d' } = req.query;
  const startDate = getStartDateByRange(timeRange);

  const [
    recentAnomalies,
    stats,
    highRiskUsers,
    criticalAnomalies
  ] = await Promise.all([
    prisma.anomalyDetection.findMany({
      where: {
        timestamp: { gte: startDate },
        isReviewed: false
      },
      orderBy: [
        { anomalyScore: 'desc' },
        { timestamp: 'desc' }
      ],
      take: 20,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    }),

    getAnomalyStatsSummary(startDate),

    getHighRiskUsers(startDate),

    prisma.anomalyDetection.findMany({
      where: {
        timestamp: { gte: startDate },
        anomalyScore: { gte: 0.9 },
        isReviewed: false
      },
      orderBy: { timestamp: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })
  ]);

  res.json({
    success: true,
    data: {
      recentAnomalies,
      stats,
      highRiskUsers,
      criticalAnomalies
    }
  });
});

async function getAnomalyTimeline(whereClause) {
  const anomalies = await prisma.anomalyDetection.findMany({
    where: whereClause,
    select: {
      timestamp: true,
      anomalyScore: true
    }
  });

  const timeline = {};
  anomalies.forEach(anomaly => {
    const date = anomaly.timestamp.toISOString().split('T')[0];
    if (!timeline[date]) {
      timeline[date] = { date, count: 0, avgScore: 0, totalScore: 0 };
    }
    timeline[date].count++;
    timeline[date].totalScore += anomaly.anomalyScore;
  });

  Object.values(timeline).forEach(day => {
    day.avgScore = day.totalScore / day.count;
    delete day.totalScore;
  });

  return Object.values(timeline).sort((a, b) => a.date.localeCompare(b.date));
}

async function getAnomalyStatsSummary(startDate) {
  const [total, byType, avgScore] = await Promise.all([
    prisma.anomalyDetection.count({
      where: { timestamp: { gte: startDate } }
    }),

    prisma.anomalyDetection.groupBy({
      by: ['anomalyType'],
      where: { timestamp: { gte: startDate } },
      _count: true
    }),

    prisma.anomalyDetection.aggregate({
      where: { timestamp: { gte: startDate } },
      _avg: { anomalyScore: true }
    })
  ]);

  return {
    total,
    byType,
    averageScore: avgScore._avg.anomalyScore || 0
  };
}

async function getHighRiskUsers(startDate) {
  const anomalies = await prisma.anomalyDetection.groupBy({
    by: ['userId'],
    where: {
      timestamp: { gte: startDate },
      anomalyScore: { gte: 0.8 }
    },
    _count: true,
    _avg: { anomalyScore: true },
    orderBy: { _count: { userId: 'desc' } },
    take: 10
  });

  const userIds = anomalies.map(a => a.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      email: true,
      name: true
    }
  });

  return anomalies.map(anomaly => ({
    user: users.find(u => u.id === anomaly.userId),
    anomalyCount: anomaly._count,
    avgScore: anomaly._avg.anomalyScore
  }));
}

async function enrichUserData(groupedData) {
  const userIds = groupedData.map(item => item.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      email: true,
      name: true
    }
  });

  return groupedData.map(item => ({
    user: users.find(u => u.id === item.userId),
    count: item._count
  }));
}

function getStartDateByRange(range) {
  const now = new Date();
  switch (range) {
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

module.exports = exports;
