const { PrismaClient } = require('@prisma/client');
const deviceFingerprintService = require('../services/deviceFingerprintService');
const repositoryIntegrityService = require('../services/repositoryIntegrityService');
const repositoryProtectionService = require('../services/repositoryProtectionService');

const prisma = new PrismaClient();

/**
 * Verify device access to repository
 */
exports.verifyRepositoryAccess = async (req, res) => {
  try {
    const { repositoryId, repositoryPath } = req.body;
    const userId = req.user.id;

    if (!repositoryId || !repositoryPath) {
      return res.status(400).json({ 
        error: 'Repository ID and path are required' 
      });
    }

    // Generate device fingerprint
    const { fingerprint } = deviceFingerprintService.generateDeviceFingerprint();

    // Find device by fingerprint
    const device = await prisma.device.findFirst({
      where: {
        fingerprint,
        userId
      }
    });

    if (!device) {
      return res.status(403).json({
        allowed: false,
        reason: 'DEVICE_NOT_REGISTERED',
        message: 'This device is not registered. Please register your device first.',
        fingerprint
      });
    }

    // Check repository access
    const accessCheck = await repositoryProtectionService.checkRepositoryAccess(
      repositoryId,
      device.id,
      repositoryPath
    );

    if (!accessCheck.allowed) {
      // Handle unauthorized access
      if (accessCheck.action === 'ENCRYPT_AND_BLOCK') {
        await repositoryProtectionService.encryptRepository(
          repositoryPath,
          process.env.ENCRYPTION_KEY || 'default-key'
        );
        await repositoryProtectionService.blockRepositoryAccess(repositoryPath);
        
        // Log the event
        await prisma.activity.create({
          data: {
            userId,
            deviceId: device.id,
            activityType: 'UNAUTHORIZED_ACCESS',
            repository: repositoryId,
            details: {
              reason: accessCheck.reason,
              action: 'ENCRYPTED_AND_BLOCKED'
            },
            isSuspicious: true,
            riskLevel: 'CRITICAL'
          }
        });
      }

      return res.status(403).json(accessCheck);
    }

    // Check for copy detection
    const copyCheck = await repositoryProtectionService.handleRepositoryCopyDetection(
      repositoryId,
      device.id,
      repositoryPath
    );

    if (copyCheck.copyDetected) {
      return res.status(403).json({
        allowed: false,
        reason: 'COPY_DETECTED',
        message: 'Repository copy detected. Access blocked and repository encrypted.',
        details: copyCheck
      });
    }

    // Log authorized access
    await prisma.activity.create({
      data: {
        userId,
        deviceId: device.id,
        activityType: 'REPO_ACCESS',
        repository: repositoryId,
        details: {
          action: 'AUTHORIZED_ACCESS',
          packageIntegrity: accessCheck.packageIntegrity
        },
        isSuspicious: false,
        riskLevel: 'LOW'
      }
    });

    res.json({
      allowed: true,
      message: 'Repository access authorized',
      device: {
        id: device.id,
        name: device.deviceName,
        status: device.status
      }
    });
  } catch (error) {
    console.error('Verify repository access error:', error);
    res.status(500).json({ error: 'Failed to verify repository access' });
  }
};

/**
 * Register device for repository access
 */
exports.registerDeviceForAccess = async (req, res) => {
  try {
    const { deviceName } = req.body;
    const userId = req.user.id;

    if (!deviceName) {
      return res.status(400).json({ error: 'Device name is required' });
    }

    const result = await deviceFingerprintService.registerDevice(userId, deviceName);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json({
      success: true,
      message: result.message,
      device: result.device,
      fingerprint: result.fingerprint
    });
  } catch (error) {
    console.error('Register device error:', error);
    res.status(500).json({ error: 'Failed to register device' });
  }
};

/**
 * Get current device fingerprint
 */
exports.getCurrentDeviceFingerprint = async (req, res) => {
  try {
    const deviceInfo = deviceFingerprintService.getCurrentDeviceInfo();

    res.json({
      fingerprint: deviceInfo.fingerprint,
      deviceInfo: {
        hostname: deviceInfo.hostname,
        platform: deviceInfo.platform,
        arch: deviceInfo.arch,
        cpus: deviceInfo.cpus,
        username: deviceInfo.username
      }
    });
  } catch (error) {
    console.error('Get device fingerprint error:', error);
    res.status(500).json({ error: 'Failed to get device fingerprint' });
  }
};

/**
 * Check repository integrity
 */
exports.checkRepositoryIntegrity = async (req, res) => {
  try {
    const { repositoryId, repositoryPath } = req.body;
    const userId = req.user.id;

    if (!repositoryId || !repositoryPath) {
      return res.status(400).json({ 
        error: 'Repository ID and path are required' 
      });
    }

    // Get device
    const { fingerprint } = deviceFingerprintService.generateDeviceFingerprint();
    const device = await prisma.device.findFirst({
      where: { fingerprint, userId }
    });

    if (!device) {
      return res.status(403).json({ 
        error: 'Device not registered' 
      });
    }

    // Check integrity
    const integrityCheck = await repositoryIntegrityService.verifyRepositoryIntegrity(
      repositoryId,
      device.id,
      repositoryPath
    );

    res.json(integrityCheck);
  } catch (error) {
    console.error('Check repository integrity error:', error);
    res.status(500).json({ error: 'Failed to check repository integrity' });
  }
};

/**
 * Decrypt repository (Admin only)
 */
exports.decryptRepository = async (req, res) => {
  try {
    const { repositoryId, repositoryPath } = req.body;

    if (!repositoryId || !repositoryPath) {
      return res.status(400).json({ 
        error: 'Repository ID and path are required' 
      });
    }

    // Decrypt repository
    const result = await repositoryProtectionService.decryptRepository(
      repositoryPath,
      process.env.ENCRYPTION_KEY || 'default-key'
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Update repository status
    await prisma.repository.update({
      where: { id: repositoryId },
      data: {
        isEncrypted: false,
        securityStatus: 'SECURE',
        encryptedAt: null
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'REPOSITORY_DECRYPTED',
        entity: 'Repository',
        entityId: repositoryId,
        changes: {
          decrypted: true,
          timestamp: new Date().toISOString()
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'Repository decrypted successfully'
    });
  } catch (error) {
    console.error('Decrypt repository error:', error);
    res.status(500).json({ error: 'Failed to decrypt repository' });
  }
};

/**
 * Get repository protection status
 */
exports.getProtectionStatus = async (req, res) => {
  try {
    const { repositoryId } = req.params;

    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId }
    });

    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    // Get recent suspicious activities
    const suspiciousActivities = await prisma.activity.findMany({
      where: {
        repository: repositoryId,
        isSuspicious: true
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
            deviceName: true,
            hostname: true
          }
        }
      }
    });

    // Get active alerts
    const activeAlerts = await prisma.alert.findMany({
      where: {
        activity: {
          repository: repositoryId
        },
        isResolved: false
      },
      include: {
        activity: true
      }
    });

    res.json({
      repository: {
        id: repository.id,
        name: repository.name,
        isEncrypted: repository.isEncrypted,
        securityStatus: repository.securityStatus,
        encryptedAt: repository.encryptedAt
      },
      suspiciousActivities,
      activeAlerts,
      stats: {
        totalSuspiciousActivities: suspiciousActivities.length,
        totalActiveAlerts: activeAlerts.length
      }
    });
  } catch (error) {
    console.error('Get protection status error:', error);
    res.status(500).json({ error: 'Failed to get protection status' });
  }
};

/**
 * Validate device and package integrity
 */
exports.validateDeviceAndPackage = async (req, res) => {
  try {
    const { repositoryId, repositoryPath } = req.body;
    const userId = req.user.id;

    if (!repositoryId || !repositoryPath) {
      return res.status(400).json({ 
        error: 'Repository ID and path are required' 
      });
    }

    // 1. Validate device
    const { fingerprint } = deviceFingerprintService.generateDeviceFingerprint();
    const deviceValidation = await deviceFingerprintService.validateDeviceFingerprint(fingerprint);

    if (!deviceValidation.valid) {
      return res.status(403).json({
        valid: false,
        reason: 'DEVICE_INVALID',
        message: deviceValidation.message
      });
    }

    // 2. Validate package integrity
    const packageValidation = await repositoryProtectionService.validatePackageIntegrity(repositoryPath);

    if (!packageValidation.valid) {
      return res.status(403).json({
        valid: false,
        reason: 'PACKAGE_INTEGRITY_FAILED',
        message: packageValidation.message
      });
    }

    // 3. Check if device belongs to user
    if (deviceValidation.device.userId !== userId) {
      return res.status(403).json({
        valid: false,
        reason: 'DEVICE_USER_MISMATCH',
        message: 'Device does not belong to this user'
      });
    }

    // All validations passed
    res.json({
      valid: true,
      message: 'Device and package integrity validated',
      device: {
        id: deviceValidation.device.id,
        name: deviceValidation.device.deviceName,
        status: deviceValidation.device.status
      },
      package: packageValidation
    });
  } catch (error) {
    console.error('Validate device and package error:', error);
    res.status(500).json({ error: 'Failed to validate device and package' });
  }
};

/**
 * Force encrypt repository (Admin only)
 */
exports.forceEncryptRepository = async (req, res) => {
  try {
    const { repositoryId, repositoryPath, reason } = req.body;

    if (!repositoryId || !repositoryPath) {
      return res.status(400).json({ 
        error: 'Repository ID and path are required' 
      });
    }

    // Encrypt repository
    const result = await repositoryProtectionService.encryptRepository(
      repositoryPath,
      process.env.ENCRYPTION_KEY || 'default-key'
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Block access
    await repositoryProtectionService.blockRepositoryAccess(repositoryPath);

    // Update repository status
    await prisma.repository.update({
      where: { id: repositoryId },
      data: {
        isEncrypted: true,
        securityStatus: 'ENCRYPTED',
        encryptedAt: new Date()
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'REPOSITORY_FORCE_ENCRYPTED',
        entity: 'Repository',
        entityId: repositoryId,
        changes: {
          encrypted: true,
          reason: reason || 'Manual encryption by admin',
          timestamp: new Date().toISOString()
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'Repository encrypted and blocked successfully'
    });
  } catch (error) {
    console.error('Force encrypt repository error:', error);
    res.status(500).json({ error: 'Failed to encrypt repository' });
  }
};

/**
 * Add trusted path to repository (Admin only)
 */
exports.addTrustedPath = async (req, res) => {
  try {
    const { repositoryId, trustedPath } = req.body;

    if (!repositoryId || !trustedPath) {
      return res.status(400).json({ 
        error: 'Repository ID and trusted path are required' 
      });
    }

    const result = await repositoryProtectionService.addTrustedPath(
      repositoryId,
      trustedPath
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'TRUSTED_PATH_ADDED',
        entity: 'Repository',
        entityId: repositoryId,
        changes: {
          trustedPath,
          timestamp: new Date().toISOString()
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: result.message,
      trustedPaths: result.trustedPaths
    });
  } catch (error) {
    console.error('Add trusted path error:', error);
    res.status(500).json({ error: 'Failed to add trusted path' });
  }
};

/**
 * Remove trusted path from repository (Admin only)
 */
exports.removeTrustedPath = async (req, res) => {
  try {
    const { repositoryId, trustedPath } = req.body;

    if (!repositoryId || !trustedPath) {
      return res.status(400).json({ 
        error: 'Repository ID and trusted path are required' 
      });
    }

    const result = await repositoryProtectionService.removeTrustedPath(
      repositoryId,
      trustedPath
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'TRUSTED_PATH_REMOVED',
        entity: 'Repository',
        entityId: repositoryId,
        changes: {
          trustedPath,
          timestamp: new Date().toISOString()
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: result.message,
      trustedPaths: result.trustedPaths
    });
  } catch (error) {
    console.error('Remove trusted path error:', error);
    res.status(500).json({ error: 'Failed to remove trusted path' });
  }
};

/**
 * Get trusted paths for repository
 */
exports.getTrustedPaths = async (req, res) => {
  try {
    const { repositoryId } = req.params;

    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId },
      select: {
        id: true,
        name: true,
        trustedPaths: true
      }
    });

    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    res.json({
      repositoryId: repository.id,
      repositoryName: repository.name,
      trustedPaths: repository.trustedPaths || []
    });
  } catch (error) {
    console.error('Get trusted paths error:', error);
    res.status(500).json({ error: 'Failed to get trusted paths' });
  }
};
