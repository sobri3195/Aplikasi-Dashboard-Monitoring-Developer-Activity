const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const securityService = require('../services/securityService');
const { emitToDashboard } = require('../services/socketService');

const prisma = new PrismaClient();

exports.logActivity = asyncHandler(async (req, res) => {
  const { deviceId, activityType, repository, branch, commitHash, details, ipAddress } = req.validatedData;

  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    include: { user: true }
  });

  if (!device) {
    throw new AppError('Device not found', 404);
  }

  const activityData = {
    userId: device.userId,
    deviceId,
    activityType,
    repository,
    branch,
    commitHash,
    details,
    ipAddress: ipAddress || req.ip
  };

  const securityAnalysis = await securityService.analyzeActivity({
    ...activityData,
    device
  });

  const activity = await prisma.activity.create({
    data: {
      ...activityData,
      isSuspicious: securityAnalysis.isSuspicious,
      riskLevel: securityAnalysis.riskLevel
    },
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
  });

  if (securityAnalysis.isSuspicious) {
    await securityService.createAlert(
      activity.id,
      'SUSPICIOUS_ACTIVITY',
      securityAnalysis.riskLevel === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
      `Suspicious activity detected: ${securityAnalysis.risks.join(', ')}`
    );

    if (!device.isAuthorized && repository) {
      await securityService.triggerEncryption(repository, 'Unauthorized device access');
    }
  }

  emitToDashboard('new-activity', activity);

  logger.info(`Activity logged: ${activityType} by ${device.user.email}`);

  res.status(201).json({
    success: true,
    data: activity,
    security: securityAnalysis
  });
});

exports.getAllActivities = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, userId, deviceId, activityType, isSuspicious } = req.query;

  const where = {};
  if (userId) where.userId = userId;
  if (deviceId) where.deviceId = deviceId;
  if (activityType) where.activityType = activityType;
  if (isSuspicious !== undefined) where.isSuspicious = isSuspicious === 'true';

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
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
      },
      orderBy: {
        timestamp: 'desc'
      },
      skip,
      take: parseInt(limit)
    }),
    prisma.activity.count({ where })
  ]);

  res.json({
    success: true,
    data: activities,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

exports.getActivityById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const activity = await prisma.activity.findUnique({
    where: { id },
    include: {
      user: true,
      device: true,
      alerts: true
    }
  });

  if (!activity) {
    throw new AppError('Activity not found', 404);
  }

  res.json({
    success: true,
    data: activity
  });
});

exports.getSuspiciousActivities = asyncHandler(async (req, res) => {
  const activities = await prisma.activity.findMany({
    where: {
      isSuspicious: true
    },
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
      },
      alerts: true
    },
    orderBy: {
      timestamp: 'desc'
    },
    take: 100
  });

  res.json({
    success: true,
    count: activities.length,
    data: activities
  });
});

exports.getActivityStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const where = {};
  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = new Date(startDate);
    if (endDate) where.timestamp.lte = new Date(endDate);
  }

  const [
    totalActivities,
    suspiciousActivities,
    activityByType,
    activityByRiskLevel
  ] = await Promise.all([
    prisma.activity.count({ where }),
    prisma.activity.count({ where: { ...where, isSuspicious: true } }),
    prisma.activity.groupBy({
      by: ['activityType'],
      where,
      _count: true
    }),
    prisma.activity.groupBy({
      by: ['riskLevel'],
      where,
      _count: true
    })
  ]);

  res.json({
    success: true,
    data: {
      totalActivities,
      suspiciousActivities,
      activityByType,
      activityByRiskLevel
    }
  });
});
