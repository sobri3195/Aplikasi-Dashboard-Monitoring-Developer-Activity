const { PrismaClient } = require('@prisma/client');
const notificationService = require('./notificationService');
const repositoryProtectionService = require('./repositoryProtectionService');
const socketService = require('./socketService');

const prisma = new PrismaClient();

// Import auto-encryption service (lazy load to avoid circular dependency)
let autoEncryptionService = null;
const getAutoEncryptionService = () => {
  if (!autoEncryptionService) {
    autoEncryptionService = require('./autoEncryptionService');
  }
  return autoEncryptionService;
};

/**
 * Monitor git operation activities
 * Monitors clone, pull, and push operations in real-time
 */
const monitorGitOperation = async (userId, deviceId, operationType, repositoryId, repositoryPath, details = {}) => {
  try {
    // Record the activity
    const activity = await prisma.activity.create({
      data: {
        userId,
        deviceId,
        activityType: `GIT_${operationType.toUpperCase()}`,
        repository: repositoryId,
        details: {
          ...details,
          repositoryPath,
          operationType,
          timestamp: new Date().toISOString()
        },
        isSuspicious: false,
        riskLevel: 'LOW'
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
            hostname: true
          }
        }
      }
    });

    // Send real-time notification via Socket.IO
    socketService.emitToAdmins('git-operation', {
      activity,
      message: `${operationType.toUpperCase()} operation detected`,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      activity,
      message: `${operationType} operation recorded`
    };
  } catch (error) {
    console.error('Monitor git operation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Detect unauthorized repository movement/copy
 * Checks if repository is being moved or copied to unauthorized location
 */
const detectUnauthorizedMovement = async (userId, deviceId, repositoryId, repositoryPath, metadata = {}) => {
  try {
    // Check if repository path is trusted
    const isTrusted = await repositoryProtectionService.isTrustedPath(repositoryId, repositoryPath);

    if (isTrusted) {
      return {
        detected: false,
        authorized: true,
        message: 'Repository is in authorized location'
      };
    }

    // Get device information
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      include: {
        user: true
      }
    });

    // Check if device is approved
    if (!device || device.status !== 'APPROVED') {
      await handleUnauthorizedAccess(userId, deviceId, repositoryId, repositoryPath, {
        reason: 'UNAPPROVED_DEVICE',
        deviceStatus: device?.status || 'NOT_FOUND'
      });

      return {
        detected: true,
        authorized: false,
        reason: 'UNAPPROVED_DEVICE',
        action: 'ENCRYPT_AND_ALERT'
      };
    }

    // Check for copy indicators
    const copyDetection = await detectRepositoryCopyIndicators(repositoryId, repositoryPath, metadata);

    if (copyDetection.detected) {
      await handleUnauthorizedAccess(userId, deviceId, repositoryId, repositoryPath, {
        reason: 'UNAUTHORIZED_COPY',
        indicators: copyDetection.indicators
      });

      return {
        detected: true,
        authorized: false,
        reason: 'UNAUTHORIZED_COPY',
        action: 'ENCRYPT_AND_ALERT',
        details: copyDetection
      };
    }

    return {
      detected: false,
      authorized: true,
      message: 'No unauthorized movement detected'
    };
  } catch (error) {
    console.error('Detect unauthorized movement error:', error);
    return {
      detected: false,
      error: error.message
    };
  }
};

/**
 * Detect repository copy indicators
 */
const detectRepositoryCopyIndicators = async (repositoryId, repositoryPath, metadata) => {
  const indicators = [];
  
  // Check if original location exists (indicates copy, not move)
  if (metadata.originalLocation && metadata.originalLocation !== repositoryPath) {
    const fs = require('fs');
    const path = require('path');
    
    if (fs.existsSync(metadata.originalLocation)) {
      indicators.push({
        type: 'ORIGINAL_EXISTS',
        message: 'Original repository location still exists',
        originalLocation: metadata.originalLocation,
        currentLocation: repositoryPath
      });
    }
  }

  // Check for suspicious directory patterns (external drives, temp directories, etc.)
  const suspiciousPatterns = [
    /\/mnt\/[a-z]/i,           // External drives on Linux
    /^[D-Z]:\\/i,              // External drives on Windows (D:, E:, etc.)
    /\/tmp\//i,                // Temporary directories
    /\/temp\//i,
    /\/Downloads\//i,          // Downloads folder
    /\/Desktop\//i,            // Desktop folder
    /removable/i,              // Removable media
    /usb/i                     // USB drives
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(repositoryPath)) {
      indicators.push({
        type: 'SUSPICIOUS_PATH',
        message: 'Repository path matches suspicious pattern',
        pattern: pattern.toString(),
        path: repositoryPath
      });
      break;
    }
  }

  // Check for multiple instances of same repository
  const activities = await prisma.activity.findMany({
    where: {
      repository: repositoryId,
      activityType: {
        in: ['GIT_CLONE', 'REPO_ACCESS']
      },
      timestamp: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      }
    },
    select: {
      details: true,
      deviceId: true
    }
  });

  const uniquePaths = new Set();
  activities.forEach(activity => {
    if (activity.details && activity.details.repositoryPath) {
      uniquePaths.add(activity.details.repositoryPath);
    }
  });

  if (uniquePaths.size > 1) {
    indicators.push({
      type: 'MULTIPLE_LOCATIONS',
      message: 'Repository accessed from multiple locations',
      locations: Array.from(uniquePaths),
      count: uniquePaths.size
    });
  }

  return {
    detected: indicators.length > 0,
    indicators,
    riskLevel: indicators.length >= 2 ? 'CRITICAL' : indicators.length === 1 ? 'HIGH' : 'LOW'
  };
};

/**
 * Handle unauthorized access detection
 * Triggers alerts and encryption
 */
const handleUnauthorizedAccess = async (userId, deviceId, repositoryId, repositoryPath, details) => {
  try {
    // 1. Create suspicious activity record
    const activity = await prisma.activity.create({
      data: {
        userId,
        deviceId,
        activityType: 'UNAUTHORIZED_ACCESS',
        repository: repositoryId,
        details: {
          ...details,
          repositoryPath,
          timestamp: new Date().toISOString()
        },
        isSuspicious: true,
        riskLevel: 'CRITICAL'
      },
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
    });

    // 2. Create critical alert
    const alert = await prisma.alert.create({
      data: {
        activityId: activity.id,
        alertType: 'REPO_COPY_DETECTED',
        severity: 'CRITICAL',
        message: `Unauthorized repository access detected: ${details.reason}`,
        details: {
          userId,
          deviceId,
          repositoryId,
          repositoryPath,
          reason: details.reason,
          ...details
        },
        isResolved: false
      }
    });

    // 3. Auto-encrypt repository
    const encryptionResult = await repositoryProtectionService.encryptRepository(
      repositoryPath,
      process.env.ENCRYPTION_KEY || 'default-encryption-key'
    );

    // 4. Block repository access
    await repositoryProtectionService.blockRepositoryAccess(repositoryPath);

    // 5. Update repository status in database
    try {
      await prisma.repository.update({
        where: { id: repositoryId },
        data: {
          isEncrypted: true,
          securityStatus: 'ENCRYPTED',
          encryptedAt: new Date()
        }
      });
    } catch (err) {
      console.log('Note: Repository record may not exist in database');
    }

    // 6. Send real-time alerts to dashboard
    socketService.emitToAdmins('unauthorized-access', {
      alert,
      activity,
      action: 'ENCRYPTED',
      message: `Repository automatically encrypted due to unauthorized access`,
      timestamp: new Date().toISOString()
    });

    // 7. Send Slack notification
    await notificationService.sendSlackNotification({
      severity: 'CRITICAL',
      message: `🚨 UNAUTHORIZED ACCESS DETECTED`,
      details: {
        user: activity.user?.email || 'Unknown',
        device: activity.device?.deviceName || 'Unknown',
        repository: repositoryId,
        reason: details.reason,
        action: 'Repository automatically encrypted',
        path: repositoryPath
      }
    });

    // 8. Log audit trail
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UNAUTHORIZED_ACCESS_DETECTED',
        entity: 'Repository',
        entityId: repositoryId,
        changes: {
          detected: true,
          encrypted: encryptionResult.success,
          blocked: true,
          alertId: alert.id,
          activityId: activity.id,
          details
        }
      }
    });

    return {
      success: true,
      activity,
      alert,
      encrypted: encryptionResult.success,
      blocked: true,
      message: 'Unauthorized access handled: repository encrypted and access blocked'
    };
  } catch (error) {
    console.error('Handle unauthorized access error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify authorized transfer
 * Check if repository transfer is through official channels
 */
const verifyAuthorizedTransfer = async (userId, deviceId, repositoryId, sourceLocation, targetLocation) => {
  try {
    // Check if both source and target are in trusted paths
    const sourceTrusted = await repositoryProtectionService.isTrustedPath(repositoryId, sourceLocation);
    const targetTrusted = await repositoryProtectionService.isTrustedPath(repositoryId, targetLocation);

    if (sourceTrusted && targetTrusted) {
      // Log authorized transfer
      await prisma.activity.create({
        data: {
          userId,
          deviceId,
          activityType: 'REPO_ACCESS',
          repository: repositoryId,
          details: {
            action: 'AUTHORIZED_TRANSFER',
            sourceLocation,
            targetLocation,
            timestamp: new Date().toISOString()
          },
          isSuspicious: false,
          riskLevel: 'LOW'
        }
      });

      return {
        authorized: true,
        skipEncryption: true,
        message: 'Transfer authorized through official channels'
      };
    }

    return {
      authorized: false,
      skipEncryption: false,
      message: 'Transfer not through authorized channels'
    };
  } catch (error) {
    console.error('Verify authorized transfer error:', error);
    return {
      authorized: false,
      error: error.message
    };
  }
};

/**
 * Comprehensive access detection check
 * Main entry point for access detection
 */
const performAccessDetectionCheck = async (userId, deviceId, repositoryId, repositoryPath, operationType, metadata = {}) => {
  try {
    // 1. Monitor the git operation
    const monitorResult = await monitorGitOperation(
      userId,
      deviceId,
      operationType,
      repositoryId,
      repositoryPath,
      metadata
    );

    // 2. Check for unauthorized movement
    const movementCheck = await detectUnauthorizedMovement(
      userId,
      deviceId,
      repositoryId,
      repositoryPath,
      metadata
    );

    // 3. If unauthorized access detected, handle it
    if (movementCheck.detected && !movementCheck.authorized) {
      const handleResult = await handleUnauthorizedAccess(
        userId,
        deviceId,
        repositoryId,
        repositoryPath,
        {
          reason: movementCheck.reason,
          operationType,
          ...movementCheck.details
        }
      );

      return {
        success: true,
        authorized: false,
        detected: true,
        encrypted: handleResult.encrypted,
        blocked: handleResult.blocked,
        alert: handleResult.alert,
        message: 'Unauthorized access detected and handled'
      };
    }

    // 4. Access is authorized
    return {
      success: true,
      authorized: true,
      detected: false,
      message: 'Access authorized',
      activity: monitorResult.activity
    };
  } catch (error) {
    console.error('Perform access detection check error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get real-time access monitoring statistics
 */
const getAccessMonitoringStats = async (repositoryId = null) => {
  try {
    const where = repositoryId ? { repository: repositoryId } : {};

    const [
      totalActivities,
      suspiciousActivities,
      activeAlerts,
      encryptedRepos,
      recentActivities
    ] = await Promise.all([
      prisma.activity.count({ where }),
      prisma.activity.count({
        where: {
          ...where,
          isSuspicious: true
        }
      }),
      prisma.alert.count({
        where: {
          isResolved: false,
          severity: 'CRITICAL'
        }
      }),
      prisma.repository.count({
        where: {
          isEncrypted: true
        }
      }),
      prisma.activity.findMany({
        where: {
          ...where,
          activityType: {
            in: ['GIT_CLONE', 'GIT_PULL', 'GIT_PUSH']
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 10,
        include: {
          user: {
            select: {
              email: true,
              name: true
            }
          },
          device: {
            select: {
              deviceName: true
            }
          }
        }
      })
    ]);

    return {
      success: true,
      stats: {
        totalActivities,
        suspiciousActivities,
        activeAlerts,
        encryptedRepos,
        recentActivities
      }
    };
  } catch (error) {
    console.error('Get access monitoring stats error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  monitorGitOperation,
  detectUnauthorizedMovement,
  handleUnauthorizedAccess,
  verifyAuthorizedTransfer,
  performAccessDetectionCheck,
  getAccessMonitoringStats,
  detectRepositoryCopyIndicators
};
