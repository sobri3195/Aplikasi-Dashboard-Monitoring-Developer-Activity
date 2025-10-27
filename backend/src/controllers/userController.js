const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const crypto = require('crypto');
const notificationService = require('../services/notificationService');

const prisma = new PrismaClient();

exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, role, isActive } = req.query;

  const where = {};
  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            devices: true,
            activities: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: parseInt(limit)
    }),
    prisma.user.count({ where })
  ]);

  res.json({
    success: true,
    data: users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

exports.getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      devices: {
        select: {
          id: true,
          deviceName: true,
          status: true,
          isAuthorized: true,
          lastSeen: true
        }
      },
      _count: {
        select: {
          activities: true
        }
      }
    }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: user
  });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, role, isActive } = req.body;

  if (req.user.id === id && req.user.role === 'ADMIN' && role !== 'ADMIN') {
    throw new AppError('Cannot change your own admin role', 400);
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(role && { role }),
      ...(isActive !== undefined && { isActive })
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      updatedAt: true
    }
  });

  logger.info(`User updated: ${user.email} by ${req.user.email}`);

  res.json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user.id === id) {
    throw new AppError('Cannot delete your own account', 400);
  }

  await prisma.user.delete({
    where: { id }
  });

  logger.info(`User deleted: ${id} by ${req.user.email}`);

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400);
  }

  if (newPassword.length < 8) {
    throw new AppError('New password must be at least 8 characters', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  });

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashedPassword }
  });

  logger.info(`Password changed for user: ${user.email}`);

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

exports.requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: resetTokenHash
    }
  });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  if (process.env.EMAIL_ENABLED === 'true') {
    await notificationService.sendEmailNotification(
      user.email,
      'Password Reset Request',
      `You requested a password reset. Click here to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
      'INFO'
    );
  }

  logger.info(`Password reset requested for user: ${email}`);

  res.json({
    success: true,
    message: 'If the email exists, a password reset link has been sent'
  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new AppError('Token and new password are required', 400);
  }

  if (newPassword.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.updateMany({
    where: {
      password: crypto.createHash('sha256').update(token).digest('hex')
    },
    data: {
      password: hashedPassword
    }
  });

  logger.info('Password reset completed');

  res.json({
    success: true,
    message: 'Password reset successfully'
  });
});

exports.getUserStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    activeUsers,
    usersByRole,
    recentUsers
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.groupBy({
      by: ['role'],
      _count: true
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      usersByRole,
      recentUsers
    }
  });
});
