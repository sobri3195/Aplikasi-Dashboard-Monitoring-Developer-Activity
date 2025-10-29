const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');
const securityService = require('../services/securityService');

const prisma = new PrismaClient();

exports.getDashboardOverview = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalDevices,
    totalActivities,
    recentActivities,
    securityStats,
    recentAlerts
  ] = await Promise.all([
    prisma.user.count(),
    prisma.device.count(),
    prisma.activity.count(),
    prisma.activity.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        device: {
          select: {
            id: true,
            deviceName: true,
            isAuthorized: true
          }
        }
      }
    }),
    securityService.getSecurityStats(),
    prisma.alert.findMany({
      where: { isResolved: false },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        activity: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            },
            device: {
              select: {
                id: true,
                deviceName: true
              }
            }
          }
        }
      }
    })
  ]);

  const activityTrend = await getActivityTrend();

  res.json({
    success: true,
    data: {
      overview: {
        totalUsers,
        totalDevices,
        totalActivities,
        securityScore: securityStats.securityScore
      },
      securityStats,
      recentActivities,
      recentAlerts,
      activityTrend
    }
  });
});

exports.getSecurityDashboard = asyncHandler(async (req, res) => {
  const securityStats = await securityService.getSecurityStats();

  const [
    unauthorizedDevices,
    suspiciousActivities,
    criticalAlerts,
    encryptedRepositories
  ] = await Promise.all([
    prisma.device.findMany({
      where: { isAuthorized: false },
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
    prisma.activity.findMany({
      where: { isSuspicious: true },
      take: 20,
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        device: {
          select: {
            id: true,
            deviceName: true
          }
        }
      }
    }),
    prisma.alert.findMany({
      where: {
        severity: 'CRITICAL',
        isResolved: false
      },
      include: {
        activity: {
          include: {
            user: true,
            device: true
          }
        }
      }
    }),
    prisma.repository.findMany({
      where: { isEncrypted: true }
    })
  ]);

  res.json({
    success: true,
    data: {
      securityStats,
      unauthorizedDevices,
      suspiciousActivities,
      criticalAlerts,
      encryptedRepositories
    }
  });
});

exports.getActivityDashboard = asyncHandler(async (req, res) => {
  const { timeRange = '7d' } = req.query;

  const startDate = getStartDateByRange(timeRange);

  const [
    activities,
    activityByType,
    activityByUser,
    activityTimeline
  ] = await Promise.all([
    prisma.activity.count({
      where: {
        timestamp: {
          gte: startDate
        }
      }
    }),
    prisma.activity.groupBy({
      by: ['activityType'],
      where: {
        timestamp: {
          gte: startDate
        }
      },
      _count: true
    }),
    prisma.activity.groupBy({
      by: ['userId'],
      where: {
        timestamp: {
          gte: startDate
        }
      },
      _count: true,
      orderBy: {
        _count: {
          userId: 'desc'
        }
      },
      take: 10
    }),
    getActivityTimeline(startDate)
  ]);

  const topUsers = await enrichUserData(activityByUser);

  res.json({
    success: true,
    data: {
      totalActivities: activities,
      activityByType,
      topUsers,
      activityTimeline
    }
  });
});

async function getActivityTrend() {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    return date;
  }).reverse();

  const trend = await Promise.all(
    last7Days.map(async (date) => {
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await prisma.activity.count({
        where: {
          timestamp: {
            gte: date,
            lt: nextDate
          }
        }
      });

      return {
        date: date.toISOString().split('T')[0],
        count
      };
    })
  );

  return trend;
}

async function getActivityTimeline(startDate) {
  const activities = await prisma.activity.findMany({
    where: {
      timestamp: {
        gte: startDate
      }
    },
    select: {
      timestamp: true,
      activityType: true
    }
  });

  const timeline = {};
  activities.forEach(activity => {
    const date = activity.timestamp.toISOString().split('T')[0];
    if (!timeline[date]) {
      timeline[date] = 0;
    }
    timeline[date]++;
  });

  return Object.entries(timeline).map(([date, count]) => ({ date, count }));
}

async function enrichUserData(activityByUser) {
  const userIds = activityByUser.map(item => item.userId);
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIds
      }
    },
    select: {
      id: true,
      email: true,
      name: true
    }
  });

  return activityByUser.map(item => ({
    user: users.find(u => u.id === item.userId),
    count: item._count
  }));
}

exports.getMonitoringDashboard = asyncHandler(async (req, res) => {
  const [
    recentActivities,
    devices,
    repositories,
    activeAlerts,
    securityStats
  ] = await Promise.all([
    prisma.activity.findMany({
      take: 20,
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        device: {
          select: {
            id: true,
            deviceName: true,
            isAuthorized: true,
            fingerprint: true
          }
        }
      }
    }),
    prisma.device.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: { lastSeen: 'desc' }
    }),
    prisma.repository.findMany({
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.alert.findMany({
      where: { isResolved: false },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        activity: {
          include: {
            user: true,
            device: true
          }
        }
      }
    }),
    securityService.getSecurityStats()
  ]);

  res.json({
    success: true,
    data: {
      activities: recentActivities,
      devices,
      repositories,
      alerts: activeAlerts,
      stats: securityStats
    }
  });
});

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
