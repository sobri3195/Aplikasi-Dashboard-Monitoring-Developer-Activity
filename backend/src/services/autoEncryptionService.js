const { PrismaClient } = require('@prisma/client');
const repositoryProtectionService = require('./repositoryProtectionService');
const notificationService = require('./notificationService');
const socketService = require('./socketService');

const prisma = new PrismaClient();

/**
 * Auto-Encryption Service
 * Automatically encrypts repositories when suspicious activities are detected
 */

/**
 * Trigger automatic encryption when alert is created
 * This is the main entry point for auto-encryption mechanism
 */
const triggerAutoEncryption = async (alert, activity = null) => {
  try {
    // Only trigger on critical and warning alerts that are not yet resolved
    if (alert.isResolved) {
      return {
        success: false,
        message: 'Alert is already resolved',
        encrypted: false
      };
    }

    // Only auto-encrypt for specific alert types
    const autoEncryptAlertTypes = [
      'REPO_COPY_DETECTED',
      'UNAUTHORIZED_DEVICE',
      'SUSPICIOUS_ACTIVITY'
    ];

    if (!autoEncryptAlertTypes.includes(alert.alertType)) {
      return {
        success: false,
        message: 'Alert type does not trigger auto-encryption',
        encrypted: false
      };
    }

    // Extract repository information from alert details
    const repositoryId = alert.details?.repositoryId;
    const repositoryPath = alert.details?.repositoryPath;

    if (!repositoryId || !repositoryPath) {
      console.error('Auto-encryption: Missing repository information in alert', alert.id);
      return {
        success: false,
        message: 'Missing repository information',
        encrypted: false
      };
    }

    // Check if repository is already encrypted
    const isEncrypted = repositoryProtectionService.isRepositoryEncrypted(repositoryPath);
    if (isEncrypted) {
      return {
        success: false,
        message: 'Repository is already encrypted',
        encrypted: true,
        alreadyEncrypted: true
      };
    }

    // Execute automatic encryption
    const encryptionResult = await repositoryProtectionService.encryptRepository(
      repositoryPath,
      process.env.ENCRYPTION_KEY || 'default-encryption-key'
    );

    if (!encryptionResult.success) {
      console.error('Auto-encryption failed:', encryptionResult.error);
      return {
        success: false,
        message: 'Auto-encryption failed',
        error: encryptionResult.error,
        encrypted: false
      };
    }

    // Block repository access
    await repositoryProtectionService.blockRepositoryAccess(repositoryPath);

    // Update repository status in database
    try {
      await prisma.repository.update({
        where: { id: repositoryId },
        data: {
          isEncrypted: true,
          encryptedAt: new Date(),
          securityStatus: 'ENCRYPTED'
        }
      });
    } catch (err) {
      console.log('Note: Repository record update failed, may not exist in database');
    }

    // Create audit log for auto-encryption
    await prisma.auditLog.create({
      data: {
        userId: alert.details?.userId,
        action: 'AUTO_ENCRYPTION_TRIGGERED',
        entity: 'Repository',
        entityId: repositoryId,
        changes: {
          alertId: alert.id,
          alertType: alert.alertType,
          severity: alert.severity,
          encrypted: true,
          blocked: true,
          repositoryPath,
          timestamp: new Date().toISOString()
        }
      }
    });

    // Send real-time notification to admins
    socketService.emitToAdmins('auto-encryption-triggered', {
      alert,
      repositoryId,
      repositoryPath,
      message: 'Repository automatically encrypted due to suspicious activity',
      timestamp: new Date().toISOString()
    });

    // Send Slack notification
    await notificationService.sendSlackNotification({
      severity: 'CRITICAL',
      message: `🔒 AUTO-ENCRYPTION ACTIVATED`,
      details: {
        repository: repositoryId,
        alertType: alert.alertType,
        severity: alert.severity,
        action: 'Repository encrypted and locked',
        path: repositoryPath,
        requiresAdminVerification: true
      }
    });

    // Update alert to mark as notified
    await prisma.alert.update({
      where: { id: alert.id },
      data: {
        notified: true,
        notifiedAt: new Date()
      }
    });

    return {
      success: true,
      message: 'Repository automatically encrypted',
      encrypted: true,
      repositoryId,
      repositoryPath,
      alertId: alert.id
    };
  } catch (error) {
    console.error('Trigger auto-encryption error:', error);
    return {
      success: false,
      message: 'Auto-encryption process failed',
      error: error.message,
      encrypted: false
    };
  }
};

/**
 * Check if device is authorized to access encrypted repository
 * This ensures transparency for authorized developers
 */
const checkAuthorizedDeviceAccess = async (repositoryId, deviceId, userId) => {
  try {
    // Get device information
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      include: {
        user: true
      }
    });

    if (!device) {
      return {
        authorized: false,
        reason: 'DEVICE_NOT_FOUND',
        message: 'Device not found in system'
      };
    }

    // Check if device is approved
    if (device.status !== 'APPROVED') {
      return {
        authorized: false,
        reason: 'DEVICE_NOT_APPROVED',
        message: `Device status is ${device.status}`
      };
    }

    // Check if device belongs to user
    if (device.userId !== userId) {
      return {
        authorized: false,
        reason: 'DEVICE_USER_MISMATCH',
        message: 'Device does not belong to user'
      };
    }

    // Check if user is active
    if (!device.user.isActive) {
      return {
        authorized: false,
        reason: 'USER_INACTIVE',
        message: 'User account is not active'
      };
    }

    // Check for recent suspicious activities from this device
    const recentSuspiciousActivities = await prisma.activity.count({
      where: {
        deviceId: deviceId,
        isSuspicious: true,
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    if (recentSuspiciousActivities > 0) {
      return {
        authorized: false,
        reason: 'RECENT_SUSPICIOUS_ACTIVITY',
        message: 'Device has recent suspicious activities',
        suspiciousCount: recentSuspiciousActivities
      };
    }

    return {
      authorized: true,
      device,
      message: 'Device authorized for transparent access'
    };
  } catch (error) {
    console.error('Check authorized device access error:', error);
    return {
      authorized: false,
      reason: 'CHECK_ERROR',
      message: 'Authorization check failed',
      error: error.message
    };
  }
};

/**
 * Manual verification by security admin
 * Allows admin to verify and decrypt repository after investigation
 */
const manualVerification = async (repositoryId, repositoryPath, adminUserId, verificationStatus, notes = '') => {
  try {
    // Verify admin role
    const admin = await prisma.user.findUnique({
      where: { id: adminUserId }
    });

    if (!admin || admin.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Only security admins can perform manual verification'
      };
    }

    // Check if repository is encrypted
    const isEncrypted = repositoryProtectionService.isRepositoryEncrypted(repositoryPath);
    
    if (!isEncrypted) {
      return {
        success: false,
        message: 'Repository is not encrypted'
      };
    }

    // Process verification based on status
    if (verificationStatus === 'APPROVED') {
      // Decrypt repository
      const decryptResult = await repositoryProtectionService.decryptRepository(
        repositoryPath,
        process.env.ENCRYPTION_KEY || 'default-encryption-key'
      );

      if (!decryptResult.success) {
        return {
          success: false,
          message: 'Failed to decrypt repository',
          error: decryptResult.error
        };
      }

      // Remove access block
      const fs = require('fs');
      const path = require('path');
      const blockFilePath = path.join(repositoryPath, '.repo-access-blocked');
      if (fs.existsSync(blockFilePath)) {
        fs.unlinkSync(blockFilePath);
      }

      // Update repository status
      try {
        await prisma.repository.update({
          where: { id: repositoryId },
          data: {
            isEncrypted: false,
            securityStatus: 'SECURE'
          }
        });
      } catch (err) {
        console.log('Note: Repository record update failed, may not exist in database');
      }

      // Resolve related alerts
      await prisma.alert.updateMany({
        where: {
          details: {
            path: ['repositoryId'],
            equals: repositoryId
          },
          isResolved: false
        },
        data: {
          isResolved: true,
          resolvedAt: new Date(),
          resolvedBy: adminUserId
        }
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'MANUAL_VERIFICATION_APPROVED',
          entity: 'Repository',
          entityId: repositoryId,
          changes: {
            status: 'APPROVED',
            decrypted: true,
            unblocked: true,
            notes,
            timestamp: new Date().toISOString()
          }
        }
      });

      // Notify via Socket.IO
      socketService.emitToAdmins('repository-verified', {
        repositoryId,
        repositoryPath,
        status: 'APPROVED',
        verifiedBy: admin.email,
        message: 'Repository verified and decrypted',
        timestamp: new Date().toISOString()
      });

      // Send Slack notification
      await notificationService.sendSlackNotification({
        severity: 'INFO',
        message: `✅ REPOSITORY VERIFIED AND RESTORED`,
        details: {
          repository: repositoryId,
          verifiedBy: admin.email,
          status: 'APPROVED',
          notes,
          action: 'Repository decrypted and access restored'
        }
      });

      return {
        success: true,
        message: 'Repository verified and decrypted successfully',
        decrypted: true,
        status: 'APPROVED'
      };

    } else if (verificationStatus === 'REJECTED') {
      // Keep repository encrypted and create permanent block
      
      // Update repository status
      try {
        await prisma.repository.update({
          where: { id: repositoryId },
          data: {
            securityStatus: 'COMPROMISED'
          }
        });
      } catch (err) {
        console.log('Note: Repository record update failed, may not exist in database');
      }

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'MANUAL_VERIFICATION_REJECTED',
          entity: 'Repository',
          entityId: repositoryId,
          changes: {
            status: 'REJECTED',
            remainsEncrypted: true,
            notes,
            timestamp: new Date().toISOString()
          }
        }
      });

      // Notify via Socket.IO
      socketService.emitToAdmins('repository-verification-rejected', {
        repositoryId,
        repositoryPath,
        status: 'REJECTED',
        verifiedBy: admin.email,
        message: 'Repository verification rejected - remains encrypted',
        timestamp: new Date().toISOString()
      });

      // Send Slack notification
      await notificationService.sendSlackNotification({
        severity: 'CRITICAL',
        message: `❌ REPOSITORY VERIFICATION REJECTED`,
        details: {
          repository: repositoryId,
          verifiedBy: admin.email,
          status: 'REJECTED',
          notes,
          action: 'Repository remains encrypted and blocked'
        }
      });

      return {
        success: true,
        message: 'Repository verification rejected - remains encrypted',
        decrypted: false,
        status: 'REJECTED'
      };
    }

    return {
      success: false,
      message: 'Invalid verification status'
    };
  } catch (error) {
    console.error('Manual verification error:', error);
    return {
      success: false,
      message: 'Manual verification failed',
      error: error.message
    };
  }
};

/**
 * Get list of repositories pending verification
 */
const getPendingVerifications = async () => {
  try {
    const encryptedRepositories = await prisma.repository.findMany({
      where: {
        isEncrypted: true,
        securityStatus: 'ENCRYPTED'
      },
      orderBy: {
        encryptedAt: 'desc'
      }
    });

    // Get related alerts for each repository
    const repositoriesWithAlerts = await Promise.all(
      encryptedRepositories.map(async (repo) => {
        const alerts = await prisma.alert.findMany({
          where: {
            details: {
              path: ['repositoryId'],
              equals: repo.id
            },
            isResolved: false
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        });

        return {
          ...repo,
          pendingAlerts: alerts
        };
      })
    );

    return {
      success: true,
      data: repositoriesWithAlerts,
      count: repositoriesWithAlerts.length
    };
  } catch (error) {
    console.error('Get pending verifications error:', error);
    return {
      success: false,
      message: 'Failed to get pending verifications',
      error: error.message
    };
  }
};

/**
 * Get encryption statistics
 */
const getEncryptionStats = async () => {
  try {
    const [
      totalRepositories,
      encryptedRepositories,
      pendingVerifications,
      compromisedRepositories,
      autoEncryptionEvents
    ] = await Promise.all([
      prisma.repository.count(),
      prisma.repository.count({ where: { isEncrypted: true } }),
      prisma.repository.count({ 
        where: { 
          isEncrypted: true,
          securityStatus: 'ENCRYPTED'
        } 
      }),
      prisma.repository.count({ where: { securityStatus: 'COMPROMISED' } }),
      prisma.auditLog.count({
        where: {
          action: 'AUTO_ENCRYPTION_TRIGGERED'
        }
      })
    ]);

    return {
      success: true,
      data: {
        totalRepositories,
        encryptedRepositories,
        pendingVerifications,
        compromisedRepositories,
        autoEncryptionEvents
      }
    };
  } catch (error) {
    console.error('Get encryption stats error:', error);
    return {
      success: false,
      message: 'Failed to get encryption statistics',
      error: error.message
    };
  }
};

module.exports = {
  triggerAutoEncryption,
  checkAuthorizedDeviceAccess,
  manualVerification,
  getPendingVerifications,
  getEncryptionStats
};
