const os = require('os');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Generate unique device fingerprint
 */
const generateDeviceFingerprint = () => {
  const networkInterfaces = os.networkInterfaces();
  const macAddresses = [];
  
  // Get all MAC addresses
  for (const name of Object.keys(networkInterfaces)) {
    for (const net of networkInterfaces[name]) {
      if (net.mac && net.mac !== '00:00:00:00:00:00') {
        macAddresses.push(net.mac);
      }
    }
  }

  const deviceInfo = {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemory: os.totalmem(),
    macAddresses: macAddresses.sort(),
    userInfo: os.userInfo().username
  };

  // Create hash from device info
  const fingerprintString = JSON.stringify(deviceInfo);
  const fingerprint = crypto
    .createHash('sha256')
    .update(fingerprintString)
    .digest('hex');

  return {
    fingerprint,
    deviceInfo
  };
};

/**
 * Validate device fingerprint
 */
const validateDeviceFingerprint = async (fingerprint) => {
  try {
    const device = await prisma.device.findUnique({
      where: { fingerprint },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true
          }
        }
      }
    });

    if (!device) {
      return {
        valid: false,
        message: 'Device not registered',
        device: null
      };
    }

    if (device.status !== 'APPROVED') {
      return {
        valid: false,
        message: `Device status is ${device.status}`,
        device
      };
    }

    if (!device.user.isActive) {
      return {
        valid: false,
        message: 'User account is not active',
        device
      };
    }

    // Update last seen
    await prisma.device.update({
      where: { id: device.id },
      data: { lastSeen: new Date() }
    });

    return {
      valid: true,
      message: 'Device authorized',
      device
    };
  } catch (error) {
    console.error('Validate device fingerprint error:', error);
    return {
      valid: false,
      message: 'Validation error',
      device: null
    };
  }
};

/**
 * Check if device fingerprint changed (possible copy/clone)
 */
const detectDeviceChange = async (expectedFingerprint, currentFingerprint) => {
  if (expectedFingerprint !== currentFingerprint) {
    return {
      changed: true,
      reason: 'Device fingerprint mismatch',
      expectedFingerprint,
      currentFingerprint
    };
  }

  return {
    changed: false
  };
};

/**
 * Register new device
 */
const registerDevice = async (userId, deviceName) => {
  const { fingerprint, deviceInfo } = generateDeviceFingerprint();

  // Check if device already exists
  const existingDevice = await prisma.device.findUnique({
    where: { fingerprint }
  });

  if (existingDevice) {
    return {
      success: false,
      message: 'Device already registered',
      device: existingDevice
    };
  }

  // Create new device
  const device = await prisma.device.create({
    data: {
      userId,
      deviceName,
      fingerprint,
      hostname: deviceInfo.hostname,
      macAddress: deviceInfo.macAddresses.join(','),
      cpuInfo: `${deviceInfo.cpus} cores`,
      osInfo: `${deviceInfo.platform} ${deviceInfo.arch}`,
      status: 'PENDING',
      isAuthorized: false
    }
  });

  return {
    success: true,
    message: 'Device registered successfully. Waiting for admin approval.',
    device,
    fingerprint
  };
};

/**
 * Get device info for current machine
 */
const getCurrentDeviceInfo = () => {
  const { fingerprint, deviceInfo } = generateDeviceFingerprint();
  
  return {
    fingerprint,
    hostname: deviceInfo.hostname,
    platform: deviceInfo.platform,
    arch: deviceInfo.arch,
    cpus: deviceInfo.cpus,
    macAddresses: deviceInfo.macAddresses,
    username: deviceInfo.userInfo
  };
};

module.exports = {
  generateDeviceFingerprint,
  validateDeviceFingerprint,
  detectDeviceChange,
  registerDevice,
  getCurrentDeviceInfo
};
