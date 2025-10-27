const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

exports.getAllAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, userId, action, entity, startDate, endDate } = req.query;

  const where = {};
  if (userId) where.userId = userId;
  if (action) where.action = action;
  if (entity) where.entity = entity;
  
  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = new Date(startDate);
    if (endDate) where.timestamp.lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      },
      skip,
      take: parseInt(limit)
    }),
    prisma.auditLog.count({ where })
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

exports.getAuditLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const log = await prisma.auditLog.findUnique({
    where: { id }
  });

  if (!log) {
    throw new AppError('Audit log not found', 404);
  }

  res.json({
    success: true,
    data: log
  });
});

exports.createAuditLog = async (userId, action, entity, entityId, changes, req) => {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        changes,
        ipAddress: req?.ip,
        userAgent: req?.headers?.['user-agent']
      }
    });
    return auditLog;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    return null;
  }
};

exports.getAuditLogStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const where = {};
  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = new Date(startDate);
    if (endDate) where.timestamp.lte = new Date(endDate);
  }

  const [
    totalLogs,
    logsByAction,
    logsByEntity,
    recentLogs
  ] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.groupBy({
      by: ['action'],
      where,
      _count: true,
      orderBy: {
        _count: {
          action: 'desc'
        }
      }
    }),
    prisma.auditLog.groupBy({
      by: ['entity'],
      where,
      _count: true,
      orderBy: {
        _count: {
          entity: 'desc'
        }
      }
    }),
    prisma.auditLog.findMany({
      where,
      take: 10,
      orderBy: {
        timestamp: 'desc'
      }
    })
  ]);

  res.json({
    success: true,
    data: {
      totalLogs,
      logsByAction,
      logsByEntity,
      recentLogs
    }
  });
});

module.exports.logAction = exports.createAuditLog;
