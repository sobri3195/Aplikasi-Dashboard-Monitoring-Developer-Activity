const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { AppError, asyncHandler } = require('./errorHandler');

const prisma = new PrismaClient();

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Not authorized to access this route', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    throw new AppError('Not authorized to access this route', 401);
  }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(`User role ${req.user.role} is not authorized to access this route`, 403);
    }
    next();
  };
};

const apiKeyAuth = asyncHandler(async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    throw new AppError('API key is required', 401);
  }

  if (apiKey !== process.env.API_SECRET) {
    throw new AppError('Invalid API key', 401);
  }

  next();
});

module.exports = {
  protect,
  authenticate: protect,  // alias for protect
  authenticateToken: protect,  // alias for protect
  authorize,
  restrictTo: authorize,  // alias for authorize
  apiKeyAuth
};
