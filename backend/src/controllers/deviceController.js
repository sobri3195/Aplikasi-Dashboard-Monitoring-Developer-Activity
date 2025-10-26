const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { emitToDashboard } = require('../services/socketService');

const prisma = new PrismaClient();

exports.registerDevice = asyncHandler(async (req, res) => {
  const { email, deviceName, fingerprint, hostname, macAddress, cpuInfo, osInfo, ipAddress } = req.validatedData;

  let user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new AppError('User not found. Please register first.', 404);
  }

  const existingDevice = await prisma.device.findUnique({
    where: { fingerprint }
  });

  if (existingDevice) {
    throw new AppError('Device already registered', 400);
  }

  const device = await prisma.device.create({
    data: {
      userId: user.id,
      deviceName,
      fingerprint,
      hostname,
      macAddress,
      cpuInfo,
      osInfo,
      ipAddress,
      lastSeen: new Date()
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    }
  });

  emitToDashboard('device-registered', device);

  logger.info(`New device registered: ${deviceName} for user ${email}`);

  res.status(201).json({
    success: true,
    message: 'Device registered successfully. Waiting for approval.',
    data: device
  });
});

exports.getAllDevices = asyncHandler(async (req, res) => {
  const { status, userId } = req.query;

  const where = {};
  if (status) where.status = status;
  if (userId) where.userId = userId;

  const devices = await prisma.device.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      },
      _count: {
        select: {
          activities: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json({
    success: true,
    count: devices.length,
    data: devices
  });
});

exports.getDeviceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const device = await prisma.device.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      },
      activities: {
        take: 50,
        orderBy: {
          timestamp: 'desc'
        }
      }
    }
  });

  if (!device) {
    throw new AppError('Device not found', 404);
  }

  res.json({
    success: true,
    data: device
  });
});

exports.approveDevice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const device = await prisma.device.update({
    where: { id },
    data: {
      status: 'APPROVED',
      isAuthorized: true
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    }
  });

  emitToDashboard('device-approved', device);

  logger.info(`Device approved: ${device.deviceName}`);

  res.json({
    success: true,
    message: 'Device approved successfully',
    data: device
  });
});

exports.rejectDevice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const device = await prisma.device.update({
    where: { id },
    data: {
      status: 'REJECTED',
      isAuthorized: false
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    }
  });

  emitToDashboard('device-rejected', device);

  logger.info(`Device rejected: ${device.deviceName}`);

  res.json({
    success: true,
    message: 'Device rejected',
    data: device
  });
});

exports.revokeDevice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const device = await prisma.device.update({
    where: { id },
    data: {
      status: 'SUSPENDED',
      isAuthorized: false
    }
  });

  emitToDashboard('device-revoked', device);

  logger.info(`Device access revoked: ${device.deviceName}`);

  res.json({
    success: true,
    message: 'Device access revoked',
    data: device
  });
});

exports.deleteDevice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.device.delete({
    where: { id }
  });

  emitToDashboard('device-deleted', { id });

  logger.info(`Device deleted: ${id}`);

  res.json({
    success: true,
    message: 'Device deleted successfully'
  });
});

exports.updateDeviceHeartbeat = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const device = await prisma.device.update({
    where: { id },
    data: {
      lastSeen: new Date()
    }
  });

  res.json({
    success: true,
    data: device
  });
});
