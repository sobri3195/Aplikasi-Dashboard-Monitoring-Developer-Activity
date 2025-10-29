const { asyncHandler, AppError } = require('../middleware/errorHandler');
const autoEncryptionService = require('../services/autoEncryptionService');

/**
 * Get pending verifications
 * GET /api/auto-encryption/pending
 */
exports.getPendingVerifications = asyncHandler(async (req, res) => {
  const result = await autoEncryptionService.getPendingVerifications();

  if (!result.success) {
    throw new AppError(result.message, 500);
  }

  res.json({
    success: true,
    data: result.data,
    count: result.count
  });
});

/**
 * Manual verification by security admin
 * POST /api/auto-encryption/verify/:repositoryId
 */
exports.manualVerification = asyncHandler(async (req, res) => {
  const { repositoryId } = req.params;
  const { repositoryPath, status, notes } = req.body;

  if (!repositoryPath) {
    throw new AppError('Repository path is required', 400);
  }

  if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
    throw new AppError('Valid status (APPROVED or REJECTED) is required', 400);
  }

  const result = await autoEncryptionService.manualVerification(
    repositoryId,
    repositoryPath,
    req.user.id,
    status,
    notes || ''
  );

  if (!result.success) {
    throw new AppError(result.message, 400);
  }

  res.json({
    success: true,
    message: result.message,
    data: {
      repositoryId,
      status,
      decrypted: result.decrypted
    }
  });
});

/**
 * Check device authorization for repository access
 * POST /api/auto-encryption/check-access
 */
exports.checkDeviceAccess = asyncHandler(async (req, res) => {
  const { repositoryId, deviceId } = req.body;

  if (!repositoryId || !deviceId) {
    throw new AppError('Repository ID and Device ID are required', 400);
  }

  const result = await autoEncryptionService.checkAuthorizedDeviceAccess(
    repositoryId,
    deviceId,
    req.user.id
  );

  res.json({
    success: true,
    authorized: result.authorized,
    reason: result.reason,
    message: result.message
  });
});

/**
 * Get encryption statistics
 * GET /api/auto-encryption/stats
 */
exports.getEncryptionStats = asyncHandler(async (req, res) => {
  const result = await autoEncryptionService.getEncryptionStats();

  if (!result.success) {
    throw new AppError(result.message, 500);
  }

  res.json({
    success: true,
    data: result.data
  });
});

/**
 * Trigger manual auto-encryption (admin only)
 * POST /api/auto-encryption/trigger
 */
exports.triggerManualEncryption = asyncHandler(async (req, res) => {
  const { alertId } = req.body;

  if (!alertId) {
    throw new AppError('Alert ID is required', 400);
  }

  // Get alert details
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  const alert = await prisma.alert.findUnique({
    where: { id: alertId },
    include: {
      activity: true
    }
  });

  if (!alert) {
    throw new AppError('Alert not found', 404);
  }

  const result = await autoEncryptionService.triggerAutoEncryption(alert, alert.activity);

  if (!result.success) {
    throw new AppError(result.message, 400);
  }

  res.json({
    success: true,
    message: result.message,
    data: {
      encrypted: result.encrypted,
      repositoryId: result.repositoryId,
      repositoryPath: result.repositoryPath
    }
  });
});
