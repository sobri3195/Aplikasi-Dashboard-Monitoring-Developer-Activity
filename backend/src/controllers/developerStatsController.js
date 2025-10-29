const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

exports.getDeveloperActivityStats = asyncHandler(async (req, res) => {
  const { userId, timeRange = '7d', groupBy = 'time' } = req.query;

  const startDate = getStartDateByRange(timeRange);
  const whereClause = {
    timestamp: { gte: startDate }
  };

  if (userId) {
    whereClause.userId = userId;
  }

  let stats;

  switch (groupBy) {
    case 'time':
      stats = await getActivityByTime(whereClause, timeRange);
      break;
    case 'repo':
      stats = await getActivityByRepository(whereClause);
      break;
    case 'device':
      stats = await getActivityByDevice(whereClause);
      break;
    case 'type':
      stats = await getActivityByType(whereClause);
      break;
    default:
      stats = await getActivityByTime(whereClause, timeRange);
  }

  res.json({
    success: true,
    data: stats
  });
});

exports.getDeveloperPerformanceMetrics = asyncHandler(async (req, res) => {
  const { userId, timeRange = '30d' } = req.query;

  const startDate = getStartDateByRange(timeRange);
  const whereClause = {
    timestamp: { gte: startDate }
  };

  if (userId) {
    whereClause.userId = userId;
  }

  const [
    totalActivities,
    activityByType,
    repositoryStats,
    deviceStats,
    hourlyDistribution,
    commitStats
  ] = await Promise.all([
    prisma.activity.count({ where: whereClause }),
    
    prisma.activity.groupBy({
      by: ['activityType'],
      where: whereClause,
      _count: true
    }),
    
    prisma.activity.groupBy({
      by: ['repository'],
      where: { ...whereClause, repository: { not: null } },
      _count: true,
      orderBy: { _count: { repository: 'desc' } },
      take: 10
    }),
    
    prisma.activity.groupBy({
      by: ['deviceId'],
      where: { ...whereClause, deviceId: { not: null } },
      _count: true
    }),
    
    getHourlyDistribution(whereClause),
    
    getCommitStatistics(whereClause)
  ]);

  const devices = await enrichDeviceData(deviceStats);

  res.json({
    success: true,
    data: {
      summary: {
        totalActivities,
        activityByType,
        commitStats
      },
      repositories: repositoryStats,
      devices,
      hourlyDistribution
    }
  });
});

exports.getRepositoryActivityStats = asyncHandler(async (req, res) => {
  const { repository, timeRange = '30d' } = req.query;

  const startDate = getStartDateByRange(timeRange);
  const whereClause = {
    timestamp: { gte: startDate },
    repository
  };

  const [
    activities,
    contributors,
    activityTimeline,
    activityByType
  ] = await Promise.all([
    prisma.activity.count({ where: whereClause }),
    
    prisma.activity.groupBy({
      by: ['userId'],
      where: whereClause,
      _count: true,
      orderBy: { _count: { userId: 'desc' } }
    }),
    
    getActivityTimelineForRepo(whereClause),
    
    prisma.activity.groupBy({
      by: ['activityType'],
      where: whereClause,
      _count: true
    })
  ]);

  const enrichedContributors = await enrichUserData(contributors);

  res.json({
    success: true,
    data: {
      repository,
      totalActivities: activities,
      contributors: enrichedContributors,
      timeline: activityTimeline,
      activityByType
    }
  });
});

exports.getDeviceActivityStats = asyncHandler(async (req, res) => {
  const { deviceId, timeRange = '30d' } = req.query;

  const startDate = getStartDateByRange(timeRange);

  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    }
  });

  if (!device) {
    return res.status(404).json({
      success: false,
      message: 'Device not found'
    });
  }

  const whereClause = {
    deviceId,
    timestamp: { gte: startDate }
  };

  const [
    totalActivities,
    activityByType,
    repositoryAccess,
    activityTimeline,
    suspiciousActivities
  ] = await Promise.all([
    prisma.activity.count({ where: whereClause }),
    
    prisma.activity.groupBy({
      by: ['activityType'],
      where: whereClause,
      _count: true
    }),
    
    prisma.activity.groupBy({
      by: ['repository'],
      where: { ...whereClause, repository: { not: null } },
      _count: true,
      orderBy: { _count: { repository: 'desc' } },
      take: 10
    }),
    
    getActivityTimelineForDevice(whereClause),
    
    prisma.activity.count({
      where: { ...whereClause, isSuspicious: true }
    })
  ]);

  res.json({
    success: true,
    data: {
      device,
      totalActivities,
      activityByType,
      repositoryAccess,
      timeline: activityTimeline,
      suspiciousActivities
    }
  });
});

exports.getActivityHeatmap = asyncHandler(async (req, res) => {
  const { userId, timeRange = '30d' } = req.query;

  const startDate = getStartDateByRange(timeRange);
  const whereClause = {
    timestamp: { gte: startDate }
  };

  if (userId) {
    whereClause.userId = userId;
  }

  const activities = await prisma.activity.findMany({
    where: whereClause,
    select: {
      timestamp: true,
      activityType: true
    }
  });

  const heatmap = generateHeatmapData(activities);

  res.json({
    success: true,
    data: heatmap
  });
});

async function getActivityByTime(whereClause, timeRange) {
  const activities = await prisma.activity.findMany({
    where: whereClause,
    select: {
      timestamp: true,
      activityType: true
    }
  });

  const grouping = timeRange === '24h' ? 'hour' : 'day';
  const timeline = {};

  activities.forEach(activity => {
    let key;
    const date = new Date(activity.timestamp);
    
    if (grouping === 'hour') {
      key = `${date.toISOString().split('T')[0]} ${String(date.getHours()).padStart(2, '0')}:00`;
    } else {
      key = date.toISOString().split('T')[0];
    }

    if (!timeline[key]) {
      timeline[key] = { date: key, count: 0 };
    }
    timeline[key].count++;
  });

  return Object.values(timeline).sort((a, b) => a.date.localeCompare(b.date));
}

async function getActivityByRepository(whereClause) {
  const stats = await prisma.activity.groupBy({
    by: ['repository'],
    where: { ...whereClause, repository: { not: null } },
    _count: true,
    orderBy: { _count: { repository: 'desc' } },
    take: 20
  });

  return stats.map(stat => ({
    repository: stat.repository,
    count: stat._count
  }));
}

async function getActivityByDevice(whereClause) {
  const stats = await prisma.activity.groupBy({
    by: ['deviceId'],
    where: { ...whereClause, deviceId: { not: null } },
    _count: true,
    orderBy: { _count: { deviceId: 'desc' } }
  });

  const deviceIds = stats.map(s => s.deviceId);
  const devices = await prisma.device.findMany({
    where: { id: { in: deviceIds } },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    }
  });

  return stats.map(stat => {
    const device = devices.find(d => d.id === stat.deviceId);
    return {
      device,
      count: stat._count
    };
  });
}

async function getActivityByType(whereClause) {
  const stats = await prisma.activity.groupBy({
    by: ['activityType'],
    where: whereClause,
    _count: true,
    orderBy: { _count: { activityType: 'desc' } }
  });

  return stats.map(stat => ({
    type: stat.activityType,
    count: stat._count
  }));
}

async function getHourlyDistribution(whereClause) {
  const activities = await prisma.activity.findMany({
    where: whereClause,
    select: { timestamp: true }
  });

  const distribution = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: 0
  }));

  activities.forEach(activity => {
    const hour = new Date(activity.timestamp).getHours();
    distribution[hour].count++;
  });

  return distribution;
}

async function getCommitStatistics(whereClause) {
  const commits = await prisma.activity.findMany({
    where: {
      ...whereClause,
      activityType: 'GIT_COMMIT'
    },
    select: {
      commitHash: true,
      timestamp: true
    }
  });

  return {
    totalCommits: commits.length,
    uniqueCommits: new Set(commits.map(c => c.commitHash)).size,
    averagePerDay: calculateAveragePerDay(commits)
  };
}

async function getActivityTimelineForRepo(whereClause) {
  const activities = await prisma.activity.findMany({
    where: whereClause,
    select: { timestamp: true }
  });

  const timeline = {};
  activities.forEach(activity => {
    const date = activity.timestamp.toISOString().split('T')[0];
    timeline[date] = (timeline[date] || 0) + 1;
  });

  return Object.entries(timeline).map(([date, count]) => ({ date, count }));
}

async function getActivityTimelineForDevice(whereClause) {
  return getActivityTimelineForRepo(whereClause);
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

async function enrichDeviceData(groupedData) {
  const deviceIds = groupedData.map(item => item.deviceId).filter(Boolean);
  const devices = await prisma.device.findMany({
    where: { id: { in: deviceIds } },
    select: {
      id: true,
      deviceName: true,
      hostname: true,
      status: true
    }
  });

  return groupedData.map(item => ({
    device: devices.find(d => d.id === item.deviceId),
    count: item._count
  }));
}

function generateHeatmapData(activities) {
  const heatmap = {};

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${day}-${hour}`;
      heatmap[key] = { day, hour, count: 0 };
    }
  }

  activities.forEach(activity => {
    const date = new Date(activity.timestamp);
    const day = date.getDay();
    const hour = date.getHours();
    const key = `${day}-${hour}`;
    
    if (heatmap[key]) {
      heatmap[key].count++;
    }
  });

  return Object.values(heatmap);
}

function calculateAveragePerDay(commits) {
  if (commits.length === 0) return 0;

  const dates = new Set(commits.map(c => 
    new Date(c.timestamp).toISOString().split('T')[0]
  ));

  return commits.length / dates.size;
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
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
}

module.exports = exports;
