const prisma = require('../database/prisma');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');

exports.createLog = asyncHandler(async (req, res) => {
  const { level, message, source, metadata } = req.body;

  const log = await prisma.systemLog.create({
    data: {
      level,
      message,
      source,
      metadata
    }
  });

  res.json({
    success: true,
    data: log
  });
});

exports.getLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, level, source, search, hours = 24 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};

  if (level) {
    where.level = level;
  }

  if (source) {
    where.source = source;
  }

  if (search) {
    where.message = {
      contains: search,
      mode: 'insensitive'
    };
  }

  if (hours) {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - parseInt(hours));
    where.timestamp = {
      gte: startDate
    };
  }

  const [logs, total] = await Promise.all([
    prisma.systemLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip,
      take: parseInt(limit)
    }),
    prisma.systemLog.count({ where })
  ]);

  res.json({
    success: true,
    data: logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

exports.getLog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const log = await prisma.systemLog.findUnique({
    where: { id }
  });

  if (!log) {
    return res.status(404).json({
      success: false,
      message: 'Log not found'
    });
  }

  res.json({
    success: true,
    data: log
  });
});

exports.getLogStats = asyncHandler(async (req, res) => {
  const { hours = 24 } = req.query;
  
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - parseInt(hours));

  const [total, byLevel, bySources] = await Promise.all([
    prisma.systemLog.count({
      where: {
        timestamp: {
          gte: startDate
        }
      }
    }),
    prisma.systemLog.groupBy({
      by: ['level'],
      where: {
        timestamp: {
          gte: startDate
        }
      },
      _count: true
    }),
    prisma.systemLog.groupBy({
      by: ['source'],
      where: {
        timestamp: {
          gte: startDate
        }
      },
      _count: true,
      orderBy: {
        _count: {
          source: 'desc'
        }
      },
      take: 10
    })
  ]);

  const levelCounts = {};
  byLevel.forEach(item => {
    levelCounts[item.level] = item._count;
  });

  const sourceCounts = bySources.map(item => ({
    source: item.source || 'unknown',
    count: item._count
  }));

  res.json({
    success: true,
    data: {
      total,
      byLevel: levelCounts,
      topSources: sourceCounts
    }
  });
});

exports.deleteLogs = asyncHandler(async (req, res) => {
  const { level, source, olderThanDays } = req.query;

  const where = {};

  if (level) {
    where.level = level;
  }

  if (source) {
    where.source = source;
  }

  if (olderThanDays) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThanDays));
    where.timestamp = {
      lt: cutoffDate
    };
  }

  const result = await prisma.systemLog.deleteMany({
    where
  });

  logger.info(`Deleted ${result.count} system logs`);

  res.json({
    success: true,
    message: `Deleted ${result.count} logs`,
    data: { deletedCount: result.count }
  });
});

exports.exportLogs = asyncHandler(async (req, res) => {
  const { level, source, hours = 24 } = req.query;

  const where = {};

  if (level) {
    where.level = level;
  }

  if (source) {
    where.source = source;
  }

  if (hours) {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - parseInt(hours));
    where.timestamp = {
      gte: startDate
    };
  }

  const logs = await prisma.systemLog.findMany({
    where,
    orderBy: { timestamp: 'desc' }
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `system-logs-${timestamp}.json`;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.json(logs);
});

exports.getRecentErrors = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;

  const errors = await prisma.systemLog.findMany({
    where: {
      level: {
        in: ['ERROR', 'CRITICAL']
      }
    },
    orderBy: { timestamp: 'desc' },
    take: parseInt(limit)
  });

  res.json({
    success: true,
    data: errors
  });
});
