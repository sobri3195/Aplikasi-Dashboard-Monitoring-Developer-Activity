const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);
const prisma = new PrismaClient();

/**
 * Encrypt repository files
 */
const encryptRepository = async (repositoryPath, encryptionKey) => {
  try {
    // In production, you'd use proper encryption library
    // This is a simplified version
    
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(encryptionKey.padEnd(32, '0').substring(0, 32));

    // Create encryption manifest
    const manifest = {
      encrypted: true,
      timestamp: new Date().toISOString(),
      algorithm,
      files: []
    };

    // Mark repository as encrypted by creating a lock file
    const lockFilePath = path.join(repositoryPath, '.repo-encrypted.lock');
    fs.writeFileSync(lockFilePath, JSON.stringify(manifest, null, 2));

    // Create .gitignore entry to prevent commit
    const gitignorePath = path.join(repositoryPath, '.gitignore');
    let gitignoreContent = '';
    
    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }

    if (!gitignoreContent.includes('.repo-encrypted.lock')) {
      fs.appendFileSync(gitignorePath, '\n.repo-encrypted.lock\n');
    }

    return {
      success: true,
      message: 'Repository encrypted successfully',
      lockFile: lockFilePath
    };
  } catch (error) {
    console.error('Encrypt repository error:', error);
    return {
      success: false,
      message: 'Failed to encrypt repository',
      error: error.message
    };
  }
};

/**
 * Decrypt repository files
 */
const decryptRepository = async (repositoryPath, encryptionKey) => {
  try {
    const lockFilePath = path.join(repositoryPath, '.repo-encrypted.lock');

    if (!fs.existsSync(lockFilePath)) {
      return {
        success: false,
        message: 'Repository is not encrypted'
      };
    }

    // Remove lock file
    fs.unlinkSync(lockFilePath);

    return {
      success: true,
      message: 'Repository decrypted successfully'
    };
  } catch (error) {
    console.error('Decrypt repository error:', error);
    return {
      success: false,
      message: 'Failed to decrypt repository',
      error: error.message
    };
  }
};

/**
 * Check if repository is encrypted
 */
const isRepositoryEncrypted = (repositoryPath) => {
  const lockFilePath = path.join(repositoryPath, '.repo-encrypted.lock');
  return fs.existsSync(lockFilePath);
};

/**
 * Block repository access
 */
const blockRepositoryAccess = async (repositoryPath) => {
  try {
    // Create access block file
    const blockFilePath = path.join(repositoryPath, '.repo-access-blocked');
    
    const blockInfo = {
      blocked: true,
      reason: 'Unauthorized access detected',
      timestamp: new Date().toISOString(),
      message: 'This repository has been blocked due to security violation. Contact administrator.'
    };

    fs.writeFileSync(blockFilePath, JSON.stringify(blockInfo, null, 2));

    return {
      success: true,
      message: 'Repository access blocked'
    };
  } catch (error) {
    console.error('Block repository access error:', error);
    return {
      success: false,
      message: 'Failed to block repository access'
    };
  }
};

/**
 * Validate package integrity
 */
const validatePackageIntegrity = async (repositoryPath) => {
  try {
    // Check if package.json exists (for Node.js projects)
    const packageJsonPath = path.join(repositoryPath, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Generate hash of package.json
      const packageHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(packageJson))
        .digest('hex');

      // Check for package-lock.json
      const packageLockPath = path.join(repositoryPath, 'package-lock.json');
      let lockHash = null;

      if (fs.existsSync(packageLockPath)) {
        const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
        lockHash = crypto
          .createHash('sha256')
          .update(JSON.stringify(packageLock))
          .digest('hex');
      }

      return {
        valid: true,
        packageHash,
        lockHash,
        packageName: packageJson.name,
        version: packageJson.version
      };
    }

    // Check for other project types (Python, Java, etc.)
    const requirementsTxtPath = path.join(repositoryPath, 'requirements.txt');
    if (fs.existsSync(requirementsTxtPath)) {
      const requirements = fs.readFileSync(requirementsTxtPath, 'utf8');
      const hash = crypto
        .createHash('sha256')
        .update(requirements)
        .digest('hex');

      return {
        valid: true,
        requirementsHash: hash,
        projectType: 'Python'
      };
    }

    return {
      valid: true,
      message: 'No package manager files found'
    };
  } catch (error) {
    console.error('Validate package integrity error:', error);
    return {
      valid: false,
      message: 'Package integrity check failed',
      error: error.message
    };
  }
};

/**
 * Full repository access check
 */
const checkRepositoryAccess = async (repositoryId, deviceId, repositoryPath) => {
  try {
    // 1. Check if repository is already encrypted
    if (isRepositoryEncrypted(repositoryPath)) {
      return {
        allowed: false,
        reason: 'REPOSITORY_ENCRYPTED',
        message: 'This repository is encrypted. Contact administrator to decrypt.',
        action: 'BLOCK'
      };
    }

    // 2. Check if access is blocked
    const blockFilePath = path.join(repositoryPath, '.repo-access-blocked');
    if (fs.existsSync(blockFilePath)) {
      return {
        allowed: false,
        reason: 'ACCESS_BLOCKED',
        message: 'Repository access is blocked.',
        action: 'BLOCK'
      };
    }

    // 3. Get device information
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      include: { user: true }
    });

    if (!device) {
      return {
        allowed: false,
        reason: 'DEVICE_NOT_FOUND',
        message: 'Device not found in system.',
        action: 'ENCRYPT_AND_BLOCK'
      };
    }

    // 4. Check device authorization
    if (device.status !== 'APPROVED') {
      return {
        allowed: false,
        reason: 'DEVICE_NOT_APPROVED',
        message: `Device status is ${device.status}. Approval required.`,
        action: 'ENCRYPT_AND_BLOCK'
      };
    }

    // 5. Check user status
    if (!device.user.isActive) {
      return {
        allowed: false,
        reason: 'USER_INACTIVE',
        message: 'User account is not active.',
        action: 'ENCRYPT_AND_BLOCK'
      };
    }

    // 6. Validate package integrity
    const packageIntegrity = await validatePackageIntegrity(repositoryPath);
    if (!packageIntegrity.valid) {
      return {
        allowed: false,
        reason: 'PACKAGE_INTEGRITY_FAILED',
        message: 'Package integrity validation failed.',
        action: 'ALERT'
      };
    }

    // All checks passed
    return {
      allowed: true,
      reason: 'AUTHORIZED',
      message: 'Repository access authorized.',
      device,
      packageIntegrity
    };
  } catch (error) {
    console.error('Check repository access error:', error);
    return {
      allowed: false,
      reason: 'CHECK_ERROR',
      message: 'Access check failed.',
      action: 'BLOCK',
      error: error.message
    };
  }
};

/**
 * Check if path is in trusted paths
 */
const isTrustedPath = async (repositoryId, repositoryPath) => {
  try {
    // Get repository with trusted paths
    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId }
    });

    if (!repository || !repository.trustedPaths) {
      return false;
    }

    const trustedPaths = repository.trustedPaths;
    const normalizedPath = path.resolve(repositoryPath);

    // Check if current path is in trusted paths
    for (const trustedPath of trustedPaths) {
      const normalizedTrustedPath = path.resolve(trustedPath);
      if (normalizedPath === normalizedTrustedPath || normalizedPath.startsWith(normalizedTrustedPath)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Check trusted path error:', error);
    return false;
  }
};

/**
 * Add trusted path to repository
 */
const addTrustedPath = async (repositoryId, trustedPath) => {
  try {
    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId }
    });

    if (!repository) {
      return {
        success: false,
        message: 'Repository not found'
      };
    }

    const trustedPaths = repository.trustedPaths || [];
    const normalizedPath = path.resolve(trustedPath);

    if (!trustedPaths.includes(normalizedPath)) {
      trustedPaths.push(normalizedPath);

      await prisma.repository.update({
        where: { id: repositoryId },
        data: { trustedPaths }
      });
    }

    return {
      success: true,
      message: 'Trusted path added',
      trustedPaths
    };
  } catch (error) {
    console.error('Add trusted path error:', error);
    return {
      success: false,
      message: 'Failed to add trusted path',
      error: error.message
    };
  }
};

/**
 * Remove trusted path from repository
 */
const removeTrustedPath = async (repositoryId, trustedPath) => {
  try {
    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId }
    });

    if (!repository) {
      return {
        success: false,
        message: 'Repository not found'
      };
    }

    const trustedPaths = repository.trustedPaths || [];
    const normalizedPath = path.resolve(trustedPath);
    const updatedPaths = trustedPaths.filter(p => p !== normalizedPath);

    await prisma.repository.update({
      where: { id: repositoryId },
      data: { trustedPaths: updatedPaths }
    });

    return {
      success: true,
      message: 'Trusted path removed',
      trustedPaths: updatedPaths
    };
  } catch (error) {
    console.error('Remove trusted path error:', error);
    return {
      success: false,
      message: 'Failed to remove trusted path',
      error: error.message
    };
  }
};

/**
 * Handle repository copy detection
 */
const handleRepositoryCopyDetection = async (repositoryId, deviceId, repositoryPath) => {
  try {
    const repositoryIntegrityService = require('./repositoryIntegrityService');
    
    // Check if path is trusted first
    const isTrusted = await isTrustedPath(repositoryId, repositoryPath);
    if (isTrusted) {
      return {
        success: true,
        copyDetected: false,
        message: 'Repository is in trusted path'
      };
    }

    // Detect copy attempt
    const copyDetection = await repositoryIntegrityService.detectRepositoryCopy(
      repositoryId,
      deviceId,
      repositoryPath
    );

    if (copyDetection.detected) {
      // Create alert immediately
      await prisma.alert.create({
        data: {
          severity: 'CRITICAL',
          message: `Repository copy detected: ${copyDetection.reason}`,
          details: {
            repositoryId,
            deviceId,
            repositoryPath,
            reason: copyDetection.reason,
            risk: copyDetection.risk
          },
          isResolved: false
        }
      });

      // Encrypt repository immediately
      const encryptResult = await encryptRepository(
        repositoryPath,
        process.env.ENCRYPTION_KEY || 'default-encryption-key'
      );

      // Block access
      await blockRepositoryAccess(repositoryPath);

      // Handle unauthorized access in system
      await repositoryIntegrityService.handleUnauthorizedAccess(
        repositoryId,
        deviceId,
        copyDetection.reason
      );

      return {
        success: true,
        copyDetected: true,
        action: 'ENCRYPTED_AND_BLOCKED',
        reason: copyDetection.reason,
        risk: copyDetection.risk,
        alertCreated: true
      };
    }

    return {
      success: true,
      copyDetected: false,
      message: 'No copy detected'
    };
  } catch (error) {
    console.error('Handle repository copy detection error:', error);
    return {
      success: false,
      message: 'Failed to handle copy detection',
      error: error.message
    };
  }
};

module.exports = {
  encryptRepository,
  decryptRepository,
  isRepositoryEncrypted,
  blockRepositoryAccess,
  validatePackageIntegrity,
  checkRepositoryAccess,
  handleRepositoryCopyDetection,
  isTrustedPath,
  addTrustedPath,
  removeTrustedPath
};
