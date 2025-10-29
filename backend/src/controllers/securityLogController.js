const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

exports.getSecurityLogs = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 50, 
    logType, 
    severity, 
    userId,
    startDate,
    endDate 
  } = req.query;

  const skip = (page - 1) * limit;
  const whereClause = {};

  if (logType) whereClause.logType = logType;
  if (severity) whereClause.severity = severity;
  if (userId) whereClause.userId = userId;

  if (startDate || endDate) {
    whereClause.timestamp = {};
    if (startDate) whereClause.timestamp.gte = new Date(startDate);
    if (endDate) whereClause.timestamp.lte = new Date(endDate);
  }

  const [logs, total] = await Promise.all([
    prisma.securityLog.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      skip,
      take: parseInt(limit)
    }),
    prisma.securityLog.count({ where: whereClause })
  ]);

  res.json({
    success: true,
    data: {
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

exports.createSecurityLog = asyncHandler(async (req, res) => {
  const { logType, severity, userId, deviceId, ipAddress, message, details } = req.body;

  const log = await prisma.securityLog.create({
    data: {
      logType,
      severity,
      userId,
      deviceId,
      ipAddress,
      message,
      details
    }
  });

  res.status(201).json({
    success: true,
    data: log
  });
});

exports.getSecurityLogStats = asyncHandler(async (req, res) => {
  const { timeRange = '7d' } = req.query;
  const startDate = getStartDateByRange(timeRange);

  const [
    totalLogs,
    logsByType,
    logsBySeverity,
    recentCritical,
    timeline
  ] = await Promise.all([
    prisma.securityLog.count({
      where: { timestamp: { gte: startDate } }
    }),

    prisma.securityLog.groupBy({
      by: ['logType'],
      where: { timestamp: { gte: startDate } },
      _count: true
    }),

    prisma.securityLog.groupBy({
      by: ['severity'],
      where: { timestamp: { gte: startDate } },
      _count: true
    }),

    prisma.securityLog.findMany({
      where: {
        timestamp: { gte: startDate },
        severity: 'CRITICAL'
      },
      orderBy: { timestamp: 'desc' },
      take: 10
    }),

    getSecurityLogTimeline(startDate)
  ]);

  res.json({
    success: true,
    data: {
      summary: {
        total: totalLogs,
        byType: logsByType,
        bySeverity: logsBySeverity
      },
      recentCritical,
      timeline
    }
  });
});

exports.getDeviceSyncStatus = asyncHandler(async (req, res) => {
  const { deviceId } = req.params;

  const syncStatus = await prisma.deviceSyncStatus.findUnique({
    where: { deviceId }
  });

  if (!syncStatus) {
    return res.status(404).json({
      success: false,
      message: 'Sync status not found'
    });
  }

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

  res.json({
    success: true,
    data: {
      device,
      syncStatus
    }
  });
});

exports.getAllDeviceSyncStatus = asyncHandler(async (req, res) => {
  const { status, userId } = req.query;

  const devices = await prisma.device.findMany({
    where: userId ? { userId } : {},
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

  const deviceIds = devices.map(d => d.id);
  let syncStatuses = await prisma.deviceSyncStatus.findMany({
    where: {
      deviceId: { in: deviceIds }
    }
  });

  if (status) {
    syncStatuses = syncStatuses.filter(s => s.syncStatus === status);
  }

  const result = syncStatuses.map(sync => {
    const device = devices.find(d => d.id === sync.deviceId);
    return {
      device,
      syncStatus: sync
    };
  });

  res.json({
    success: true,
    data: result
  });
});

exports.updateDeviceSyncStatus = asyncHandler(async (req, res) => {
  const { deviceId } = req.params;
  const { syncStatus, syncErrors } = req.body;

  const updatedStatus = await prisma.deviceSyncStatus.upsert({
    where: { deviceId },
    update: {
      syncStatus,
      syncErrors,
      lastSyncAt: new Date(),
      updatedAt: new Date()
    },
    create: {
      deviceId,
      syncStatus,
      syncErrors,
      lastSyncAt: new Date()
    }
  });

  await prisma.securityLog.create({
    data: {
      logType: 'DEVICE_CHANGE',
      severity: syncStatus === 'ERROR' ? 'WARNING' : 'INFO',
      deviceId,
      message: `Device sync status updated to ${syncStatus}`,
      details: { syncErrors }
    }
  });

  res.json({
    success: true,
    data: updatedStatus
  });
});

exports.getSyncHealthReport = asyncHandler(async (req, res) => {
  const allSyncStatuses = await prisma.deviceSyncStatus.findMany({
    include: {
      device: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      }
    }
  });

  const report = {
    total: allSyncStatuses.length,
    synced: allSyncStatuses.filter(s => s.syncStatus === 'SYNCED').length,
    syncing: allSyncStatuses.filter(s => s.syncStatus === 'SYNCING').length,
    error: allSyncStatuses.filter(s => s.syncStatus === 'ERROR').length,
    outdated: allSyncStatuses.filter(s => s.syncStatus === 'OUTDATED').length,
    devicesWithErrors: allSyncStatuses.filter(s => s.syncStatus === 'ERROR'),
    lastSyncTimes: allSyncStatuses
      .sort((a, b) => b.lastSyncAt - a.lastSyncAt)
      .slice(0, 10)
  };

  res.json({
    success: true,
    data: report
  });
});

async function getSecurityLogTimeline(startDate) {
  const logs = await prisma.securityLog.findMany({
    where: { timestamp: { gte: startDate } },
    select: { timestamp: true, severity: true }
  });

  const timeline = {};
  logs.forEach(log => {
    const date = log.timestamp.toISOString().split('T')[0];
    if (!timeline[date]) {
      timeline[date] = { date, INFO: 0, WARNING: 0, CRITICAL: 0 };
    }
    timeline[date][log.severity]++;
  });

  return Object.values(timeline).sort((a, b) => a.date.localeCompare(b.date));
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
