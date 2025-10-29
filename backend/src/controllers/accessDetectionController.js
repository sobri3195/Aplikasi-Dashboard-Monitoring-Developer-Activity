const accessDetectionService = require('../services/accessDetectionService');
const deviceFingerprintService = require('../services/deviceFingerprintService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Monitor git operation (clone, pull, push)
 */
exports.monitorGitOperation = async (req, res) => {
  try {
    const { repositoryId, repositoryPath, operationType, metadata } = req.body;
    const userId = req.user.id;

    if (!repositoryId || !repositoryPath || !operationType) {
      return res.status(400).json({
        error: 'Repository ID, path, and operation type are required'
      });
    }

    // Validate operation type
    const validOperations = ['clone', 'pull', 'push', 'commit', 'checkout'];
    if (!validOperations.includes(operationType.toLowerCase())) {
      return res.status(400).json({
        error: `Invalid operation type. Must be one of: ${validOperations.join(', ')}`
      });
    }

    // Get device ID from fingerprint
    const { fingerprint } = deviceFingerprintService.generateDeviceFingerprint();
    const device = await prisma.device.findFirst({
      where: { fingerprint, userId }
    });

    if (!device) {
      return res.status(403).json({
        error: 'Device not registered',
        action: 'REGISTER_DEVICE'
      });
    }

    // Perform comprehensive access detection check
    const result = await accessDetectionService.performAccessDetectionCheck(
      userId,
      device.id,
      repositoryId,
      repositoryPath,
      operationType,
      metadata || {}
    );

    if (!result.authorized) {
      return res.status(403).json({
        authorized: false,
        detected: result.detected,
        encrypted: result.encrypted,
        blocked: result.blocked,
        message: result.message,
        alert: result.alert
      });
    }

    res.json({
      success: true,
      authorized: true,
      message: result.message,
      activity: result.activity
    });
  } catch (error) {
    console.error('Monitor git operation error:', error);
    res.status(500).json({ error: 'Failed to monitor git operation' });
  }
};

/**
 * Check for unauthorized repository movement
 */
exports.checkUnauthorizedMovement = async (req, res) => {
  try {
    const { repositoryId, repositoryPath, metadata } = req.body;
    const userId = req.user.id;

    if (!repositoryId || !repositoryPath) {
      return res.status(400).json({
        error: 'Repository ID and path are required'
      });
    }

    // Get device ID
    const { fingerprint } = deviceFingerprintService.generateDeviceFingerprint();
    const device = await prisma.device.findFirst({
      where: { fingerprint, userId }
    });

    if (!device) {
      return res.status(403).json({
        error: 'Device not registered'
      });
    }

    // Detect unauthorized movement
    const result = await accessDetectionService.detectUnauthorizedMovement(
      userId,
      device.id,
      repositoryId,
      repositoryPath,
      metadata || {}
    );

    res.json(result);
  } catch (error) {
    console.error('Check unauthorized movement error:', error);
    res.status(500).json({ error: 'Failed to check unauthorized movement' });
  }
};

/**
 * Verify authorized transfer between locations
 */
exports.verifyAuthorizedTransfer = async (req, res) => {
  try {
    const { repositoryId, sourceLocation, targetLocation } = req.body;
    const userId = req.user.id;

    if (!repositoryId || !sourceLocation || !targetLocation) {
      return res.status(400).json({
        error: 'Repository ID, source location, and target location are required'
      });
    }

    // Get device ID
    const { fingerprint } = deviceFingerprintService.generateDeviceFingerprint();
    const device = await prisma.device.findFirst({
      where: { fingerprint, userId }
    });

    if (!device) {
      return res.status(403).json({
        error: 'Device not registered'
      });
    }

    // Verify authorized transfer
    const result = await accessDetectionService.verifyAuthorizedTransfer(
      userId,
      device.id,
      repositoryId,
      sourceLocation,
      targetLocation
    );

    res.json(result);
  } catch (error) {
    console.error('Verify authorized transfer error:', error);
    res.status(500).json({ error: 'Failed to verify authorized transfer' });
  }
};

/**
 * Get access monitoring statistics
 */
exports.getAccessMonitoringStats = async (req, res) => {
  try {
    const { repositoryId } = req.query;

    const result = await accessDetectionService.getAccessMonitoringStats(repositoryId);

    res.json(result);
  } catch (error) {
    console.error('Get access monitoring stats error:', error);
    res.status(500).json({ error: 'Failed to get access monitoring statistics' });
  }
};

/**
 * Get real-time monitoring dashboard data
 */
exports.getMonitoringDashboard = async (req, res) => {
  try {
    const { repositoryId } = req.query;

    // Get comprehensive monitoring data
    const [stats, recentAlerts, gitActivities] = await Promise.all([
      accessDetectionService.getAccessMonitoringStats(repositoryId),
      prisma.alert.findMany({
        where: {
          isResolved: false,
          severity: {
            in: ['WARNING', 'CRITICAL']
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10,
        include: {
          activity: {
            include: {
              user: {
                select: {
                  email: true,
                  name: true
                }
              },
              device: {
                select: {
                  deviceName: true,
                  hostname: true
                }
              }
            }
          }
        }
      }),
      prisma.activity.findMany({
        where: {
          activityType: {
            in: ['GIT_CLONE', 'GIT_PULL', 'GIT_PUSH']
          },
          ...(repositoryId && { repository: repositoryId })
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 20,
        include: {
          user: {
            select: {
              email: true,
              name: true
            }
          },
          device: {
            select: {
              deviceName: true,
              hostname: true
            }
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        stats: stats.stats,
        recentAlerts,
        gitActivities
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get monitoring dashboard error:', error);
    res.status(500).json({ error: 'Failed to get monitoring dashboard data' });
  }
};

/**
 * Handle manual alert resolution
 */
exports.resolveAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { resolution, notes } = req.body;
    const userId = req.user.id;

    if (!alertId) {
      return res.status(400).json({
        error: 'Alert ID is required'
      });
    }

    const alert = await prisma.alert.update({
      where: { id: alertId },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy: userId,
        details: {
          resolution,
          notes,
          resolvedBy: userId,
          resolvedAt: new Date().toISOString()
        }
      }
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'ALERT_RESOLVED',
        entity: 'Alert',
        entityId: alertId,
        changes: {
          resolution,
          notes
        }
      }
    });

    res.json({
      success: true,
      message: 'Alert resolved successfully',
      alert
    });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
};

module.exports = exports;
