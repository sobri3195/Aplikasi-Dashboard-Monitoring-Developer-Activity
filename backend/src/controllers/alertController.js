const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { emitToDashboard } = require('../services/socketService');
const autoEncryptionService = require('../services/autoEncryptionService');

const prisma = new PrismaClient();

exports.getAllAlerts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, severity, isResolved } = req.query;

  const where = {};
  if (severity) where.severity = severity;
  if (isResolved !== undefined) where.isResolved = isResolved === 'true';

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [alerts, total] = await Promise.all([
    prisma.alert.findMany({
      where,
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
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: parseInt(limit)
    }),
    prisma.alert.count({ where })
  ]);

  res.json({
    success: true,
    data: alerts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

exports.getAlertById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const alert = await prisma.alert.findUnique({
    where: { id },
    include: {
      activity: {
        include: {
          user: true,
          device: true
        }
      }
    }
  });

  if (!alert) {
    throw new AppError('Alert not found', 404);
  }

  res.json({
    success: true,
    data: alert
  });
});

exports.resolveAlert = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const alert = await prisma.alert.update({
    where: { id },
    data: {
      isResolved: true,
      resolvedAt: new Date(),
      resolvedBy: req.user.id
    },
    include: {
      activity: {
        include: {
          user: true,
          device: true
        }
      }
    }
  });

  emitToDashboard('alert-resolved', alert);

  res.json({
    success: true,
    message: 'Alert resolved successfully',
    data: alert
  });
});

exports.getAlertStats = asyncHandler(async (req, res) => {
  const [
    totalAlerts,
    unresolvedAlerts,
    criticalAlerts,
    alertsBySeverity,
    alertsByType
  ] = await Promise.all([
    prisma.alert.count(),
    prisma.alert.count({ where: { isResolved: false } }),
    prisma.alert.count({ where: { severity: 'CRITICAL', isResolved: false } }),
    prisma.alert.groupBy({
      by: ['severity'],
      _count: true
    }),
    prisma.alert.groupBy({
      by: ['alertType'],
      _count: true
    })
  ]);

  res.json({
    success: true,
    data: {
      totalAlerts,
      unresolvedAlerts,
      criticalAlerts,
      alertsBySeverity,
      alertsByType
    }
  });
});

exports.createAlert = asyncHandler(async (req, res) => {
  const { activityId, alertType, severity, message, details } = req.body;

  if (!severity || !message) {
    throw new AppError('Severity and message are required', 400);
  }

  const alert = await prisma.alert.create({
    data: {
      activityId,
      alertType,
      severity,
      message,
      details,
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
  });

  emitToDashboard('alert-created', alert);

  // Trigger auto-encryption if conditions are met
  if (severity === 'CRITICAL' || severity === 'WARNING') {
    const encryptionResult = await autoEncryptionService.triggerAutoEncryption(alert, alert.activity);
    
    if (encryptionResult.success && encryptionResult.encrypted) {
      alert.autoEncrypted = true;
      alert.encryptionDetails = {
        repositoryId: encryptionResult.repositoryId,
        repositoryPath: encryptionResult.repositoryPath
      };
    }
  }

  res.status(201).json({
    success: true,
    message: 'Alert created successfully',
    data: alert
  });
});
