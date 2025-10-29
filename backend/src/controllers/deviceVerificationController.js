const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

exports.requestDeviceReverification = asyncHandler(async (req, res) => {
  const { deviceId, reason } = req.body;
  const requestedBy = req.user.id;

  const device = await prisma.device.findUnique({
    where: { id: deviceId }
  });

  if (!device) {
    return res.status(404).json({
      success: false,
      message: 'Device not found'
    });
  }

  const existingRequest = await prisma.deviceVerificationRequest.findFirst({
    where: {
      deviceId,
      status: 'PENDING'
    }
  });

  if (existingRequest) {
    return res.status(400).json({
      success: false,
      message: 'A pending verification request already exists for this device'
    });
  }

  const verificationRequest = await prisma.deviceVerificationRequest.create({
    data: {
      deviceId,
      requestedBy,
      reason,
      status: 'PENDING'
    }
  });

  await prisma.securityLog.create({
    data: {
      logType: 'DEVICE_CHANGE',
      severity: 'INFO',
      userId: device.userId,
      deviceId,
      message: 'Device reverification requested',
      details: {
        requestId: verificationRequest.id,
        reason
      }
    }
  });

  res.status(201).json({
    success: true,
    data: verificationRequest
  });
});

exports.getPendingVerificationRequests = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const skip = (page - 1) * limit;

  const [requests, total] = await Promise.all([
    prisma.deviceVerificationRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
      include: {
        device: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        }
      }
    }),
    prisma.deviceVerificationRequest.count({
      where: { status: 'PENDING' }
    })
  ]);

  res.json({
    success: true,
    data: {
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

exports.approveVerificationRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const reviewedBy = req.user.id;

  const request = await prisma.deviceVerificationRequest.findUnique({
    where: { id },
    include: { device: true }
  });

  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Verification request not found'
    });
  }

  if (request.status !== 'PENDING') {
    return res.status(400).json({
      success: false,
      message: 'Request has already been processed'
    });
  }

  await prisma.$transaction([
    prisma.deviceVerificationRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedBy,
        reviewedAt: new Date()
      }
    }),

    prisma.device.update({
      where: { id: request.deviceId },
      data: {
        status: 'PENDING',
        isAuthorized: false
      }
    }),

    prisma.securityLog.create({
      data: {
        logType: 'DEVICE_CHANGE',
        severity: 'INFO',
        userId: request.device.userId,
        deviceId: request.deviceId,
        message: 'Device verification request approved - device requires re-verification',
        details: {
          requestId: id,
          reviewedBy
        }
      }
    })
  ]);

  res.json({
    success: true,
    message: 'Verification request approved. Device requires re-verification.'
  });
});

exports.rejectVerificationRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const reviewedBy = req.user.id;

  const request = await prisma.deviceVerificationRequest.findUnique({
    where: { id },
    include: { device: true }
  });

  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Verification request not found'
    });
  }

  if (request.status !== 'PENDING') {
    return res.status(400).json({
      success: false,
      message: 'Request has already been processed'
    });
  }

  await prisma.$transaction([
    prisma.deviceVerificationRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedBy,
        reviewedAt: new Date(),
        reason: reason || request.reason
      }
    }),

    prisma.securityLog.create({
      data: {
        logType: 'DEVICE_CHANGE',
        severity: 'INFO',
        userId: request.device.userId,
        deviceId: request.deviceId,
        message: 'Device verification request rejected',
        details: {
          requestId: id,
          reviewedBy,
          reason
        }
      }
    })
  ]);

  res.json({
    success: true,
    message: 'Verification request rejected'
  });
});

exports.forceDeviceReverification = asyncHandler(async (req, res) => {
  const { deviceId } = req.params;
  const adminId = req.user.id;

  const device = await prisma.device.findUnique({
    where: { id: deviceId }
  });

  if (!device) {
    return res.status(404).json({
      success: false,
      message: 'Device not found'
    });
  }

  await prisma.$transaction([
    prisma.device.update({
      where: { id: deviceId },
      data: {
        status: 'PENDING',
        isAuthorized: false
      }
    }),

    prisma.securityLog.create({
      data: {
        logType: 'DEVICE_CHANGE',
        severity: 'WARNING',
        userId: device.userId,
        deviceId,
        message: 'Device forced to re-verify by admin',
        details: {
          adminId,
          previousStatus: device.status
        }
      }
    })
  ]);

  res.json({
    success: true,
    message: 'Device forced to re-verify successfully'
  });
});

exports.getDeviceVerificationHistory = asyncHandler(async (req, res) => {
  const { deviceId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const [history, total] = await Promise.all([
    prisma.deviceVerificationRequest.findMany({
      where: { deviceId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    }),
    prisma.deviceVerificationRequest.count({
      where: { deviceId }
    })
  ]);

  res.json({
    success: true,
    data: {
      history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

exports.bulkReverifyDevices = asyncHandler(async (req, res) => {
  const { deviceIds, reason } = req.body;
  const adminId = req.user.id;

  if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Device IDs array is required'
    });
  }

  const devices = await prisma.device.findMany({
    where: {
      id: { in: deviceIds }
    }
  });

  if (devices.length !== deviceIds.length) {
    return res.status(404).json({
      success: false,
      message: 'Some devices not found'
    });
  }

  const operations = [];

  for (const device of devices) {
    operations.push(
      prisma.device.update({
        where: { id: device.id },
        data: {
          status: 'PENDING',
          isAuthorized: false
        }
      }),

      prisma.securityLog.create({
        data: {
          logType: 'DEVICE_CHANGE',
          severity: 'WARNING',
          userId: device.userId,
          deviceId: device.id,
          message: 'Device forced to re-verify (bulk operation)',
          details: {
            adminId,
            reason,
            previousStatus: device.status
          }
        }
      })
    );
  }

  await prisma.$transaction(operations);

  res.json({
    success: true,
    message: `${devices.length} devices forced to re-verify successfully`
  });
});

module.exports = exports;
