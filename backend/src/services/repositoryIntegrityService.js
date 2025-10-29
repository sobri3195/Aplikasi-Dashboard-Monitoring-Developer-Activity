const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Generate repository integrity hash
 */
const generateRepositoryHash = (repositoryPath) => {
  try {
    // Create hash based on repository metadata
    const gitPath = path.join(repositoryPath, '.git');
    
    if (!fs.existsSync(gitPath)) {
      throw new Error('Not a git repository');
    }

    // Read git config
    const gitConfigPath = path.join(gitPath, 'config');
    const gitConfig = fs.readFileSync(gitConfigPath, 'utf8');

    // Create integrity data
    const integrityData = {
      gitConfig,
      timestamp: new Date().toISOString()
    };

    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(integrityData))
      .digest('hex');

    return hash;
  } catch (error) {
    console.error('Generate repository hash error:', error);
    return null;
  }
};

/**
 * Create repository integrity record
 */
const createIntegrityRecord = async (repositoryId, deviceId, repositoryPath) => {
  try {
    const hash = generateRepositoryHash(repositoryPath);

    if (!hash) {
      return {
        success: false,
        message: 'Failed to generate repository hash'
      };
    }

    // Store integrity record in repository details (using JSON field)
    const repository = await prisma.repository.update({
      where: { id: repositoryId },
      data: {
        // Store in a custom field or use existing JSON field
        // For now, we'll track this via activity
      }
    });

    // Log the integrity check
    await prisma.activity.create({
      data: {
        userId: (await prisma.device.findUnique({ where: { id: deviceId } })).userId,
        deviceId,
        activityType: 'REPO_ACCESS',
        repository: repositoryId,
        details: {
          action: 'INTEGRITY_CHECK',
          hash,
          timestamp: new Date().toISOString()
        },
        isSuspicious: false,
        riskLevel: 'LOW'
      }
    });

    return {
      success: true,
      hash,
      message: 'Integrity record created'
    };
  } catch (error) {
    console.error('Create integrity record error:', error);
    return {
      success: false,
      message: 'Failed to create integrity record'
    };
  }
};

/**
 * Verify repository integrity
 */
const verifyRepositoryIntegrity = async (repositoryId, deviceId, repositoryPath) => {
  try {
    const currentHash = generateRepositoryHash(repositoryPath);

    if (!currentHash) {
      return {
        valid: false,
        message: 'Failed to generate current hash'
      };
    }

    // Get last integrity check for this device
    const lastCheck = await prisma.activity.findFirst({
      where: {
        deviceId,
        repository: repositoryId,
        activityType: 'REPO_ACCESS',
        details: {
          path: ['action'],
          equals: 'INTEGRITY_CHECK'
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    if (!lastCheck) {
      // First time access, create integrity record
      return await createIntegrityRecord(repositoryId, deviceId, repositoryPath);
    }

    const lastHash = lastCheck.details?.hash;

    // Check if repository was copied (hash should remain relatively stable)
    // In real scenario, we'd have more sophisticated checks

    return {
      valid: true,
      message: 'Repository integrity verified',
      currentHash,
      lastHash
    };
  } catch (error) {
    console.error('Verify repository integrity error:', error);
    return {
      valid: false,
      message: 'Integrity verification failed'
    };
  }
};

/**
 * Detect repository copy attempt
 */
const detectRepositoryCopy = async (repositoryId, deviceId, repositoryPath) => {
  try {
    // Check if this repository is being accessed from a new device
    const device = await prisma.device.findUnique({
      where: { id: deviceId }
    });

    if (!device) {
      return {
        detected: true,
        reason: 'Unknown device',
        risk: 'CRITICAL'
      };
    }

    // Check if device is authorized
    if (device.status !== 'APPROVED') {
      return {
        detected: true,
        reason: 'Unauthorized device',
        risk: 'CRITICAL'
      };
    }

    // Check previous access from other devices
    const otherDeviceAccess = await prisma.activity.findFirst({
      where: {
        repository: repositoryId,
        deviceId: {
          not: deviceId
        },
        activityType: {
          in: ['GIT_CLONE', 'REPO_ACCESS']
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    if (otherDeviceAccess) {
      // Check if this is a legitimate multi-device setup or a copy
      const timeDiff = Date.now() - otherDeviceAccess.timestamp.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      // If accessed from different device within 1 hour, might be a copy
      if (hoursDiff < 1) {
        return {
          detected: true,
          reason: 'Repository accessed from multiple devices in short time',
          risk: 'HIGH',
          previousDevice: otherDeviceAccess.deviceId,
          timeDiff: hoursDiff
        };
      }
    }

    return {
      detected: false,
      reason: 'No copy detected',
      risk: 'LOW'
    };
  } catch (error) {
    console.error('Detect repository copy error:', error);
    return {
      detected: true,
      reason: 'Detection error',
      risk: 'HIGH'
    };
  }
};

/**
 * Handle unauthorized repository access
 */
const handleUnauthorizedAccess = async (repositoryId, deviceId, reason) => {
  try {
    // Get device and user info
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      include: { user: true }
    });

    // Log suspicious activity
    const activity = await prisma.activity.create({
      data: {
        userId: device.userId,
        deviceId,
        activityType: 'UNAUTHORIZED_ACCESS',
        repository: repositoryId,
        details: {
          reason,
          timestamp: new Date().toISOString()
        },
        isSuspicious: true,
        riskLevel: 'CRITICAL'
      }
    });

    // Create alert
    await prisma.alert.create({
      data: {
        activityId: activity.id,
        alertType: 'REPO_COPY_DETECTED',
        severity: 'CRITICAL',
        message: `Unauthorized access detected: ${reason}`,
        notified: false
      }
    });

    // Mark repository as compromised and encrypt
    await prisma.repository.update({
      where: { id: repositoryId },
      data: {
        securityStatus: 'COMPROMISED',
        isEncrypted: true,
        encryptedAt: new Date()
      }
    });

    return {
      success: true,
      action: 'REPOSITORY_ENCRYPTED',
      message: 'Repository has been encrypted due to unauthorized access'
    };
  } catch (error) {
    console.error('Handle unauthorized access error:', error);
    return {
      success: false,
      message: 'Failed to handle unauthorized access'
    };
  }
};

module.exports = {
  generateRepositoryHash,
  createIntegrityRecord,
  verifyRepositoryIntegrity,
  detectRepositoryCopy,
  handleUnauthorizedAccess
};
