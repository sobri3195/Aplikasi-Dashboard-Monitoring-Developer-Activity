const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

exports.register = asyncHandler(async (req, res) => {
  const { email, name, password, role } = req.validatedData;

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new AppError('User already exists', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: role || 'DEVELOPER'
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true
    }
  });

  const token = generateToken(user.id);

  logger.info(`New user registered: ${email}`);

  res.status(201).json({
    success: true,
    data: {
      user,
      token
    }
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.validatedData;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user || !user.isActive) {
    throw new AppError('Invalid credentials', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = generateToken(user.id);

  await prisma.activity.create({
    data: {
      userId: user.id,
      deviceId: req.body.deviceId || null,
      activityType: 'LOGIN',
      ipAddress: req.ip
    }
  }).catch(err => logger.error('Failed to log login activity:', err));

  logger.info(`User logged in: ${email}`);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    }
  });
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });

  res.json({
    success: true,
    data: user
  });
});

exports.logout = asyncHandler(async (req, res) => {
  await prisma.activity.create({
    data: {
      userId: req.user.id,
      deviceId: req.body.deviceId || null,
      activityType: 'LOGOUT',
      ipAddress: req.ip
    }
  }).catch(err => logger.error('Failed to log logout activity:', err));

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});
