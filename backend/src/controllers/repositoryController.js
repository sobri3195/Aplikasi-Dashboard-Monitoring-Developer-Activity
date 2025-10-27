const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { emitToDashboard } = require('../services/socketService');

const prisma = new PrismaClient();

exports.getAllRepositories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, securityStatus, isEncrypted } = req.query;

  const where = {};
  if (securityStatus) where.securityStatus = securityStatus;
  if (isEncrypted !== undefined) where.isEncrypted = isEncrypted === 'true';

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [repositories, total] = await Promise.all([
    prisma.repository.findMany({
      where,
      orderBy: {
        lastActivity: 'desc'
      },
      skip,
      take: parseInt(limit)
    }),
    prisma.repository.count({ where })
  ]);

  res.json({
    success: true,
    data: repositories,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

exports.getRepositoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const repository = await prisma.repository.findUnique({
    where: { id }
  });

  if (!repository) {
    throw new AppError('Repository not found', 404);
  }

  res.json({
    success: true,
    data: repository
  });
});

exports.createRepository = asyncHandler(async (req, res) => {
  const { name, gitlabUrl, gitlabProjectId } = req.body;

  const existingRepo = await prisma.repository.findFirst({
    where: {
      OR: [
        { name },
        ...(gitlabProjectId ? [{ gitlabProjectId }] : [])
      ]
    }
  });

  if (existingRepo) {
    throw new AppError('Repository already exists', 400);
  }

  const repository = await prisma.repository.create({
    data: {
      name,
      gitlabUrl,
      gitlabProjectId
    }
  });

  emitToDashboard('repository-created', repository);

  logger.info(`Repository created: ${name}`);

  res.status(201).json({
    success: true,
    message: 'Repository created successfully',
    data: repository
  });
});

exports.updateRepository = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, gitlabUrl, gitlabProjectId, securityStatus } = req.body;

  const repository = await prisma.repository.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(gitlabUrl && { gitlabUrl }),
      ...(gitlabProjectId && { gitlabProjectId }),
      ...(securityStatus && { securityStatus })
    }
  });

  emitToDashboard('repository-updated', repository);

  logger.info(`Repository updated: ${id}`);

  res.json({
    success: true,
    message: 'Repository updated successfully',
    data: repository
  });
});

exports.deleteRepository = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.repository.delete({
    where: { id }
  });

  emitToDashboard('repository-deleted', { id });

  logger.info(`Repository deleted: ${id}`);

  res.json({
    success: true,
    message: 'Repository deleted successfully'
  });
});

exports.decryptRepository = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const repository = await prisma.repository.update({
    where: { id },
    data: {
      isEncrypted: false,
      securityStatus: 'SECURE'
    }
  });

  emitToDashboard('repository-decrypted', repository);

  logger.info(`Repository decrypted: ${repository.name}`);

  res.json({
    success: true,
    message: 'Repository decrypted successfully',
    data: repository
  });
});

exports.getRepositoryStats = asyncHandler(async (req, res) => {
  const [
    totalRepositories,
    encryptedRepositories,
    compromisedRepositories,
    repositoriesByStatus
  ] = await Promise.all([
    prisma.repository.count(),
    prisma.repository.count({ where: { isEncrypted: true } }),
    prisma.repository.count({ where: { securityStatus: 'COMPROMISED' } }),
    prisma.repository.groupBy({
      by: ['securityStatus'],
      _count: true
    })
  ]);

  res.json({
    success: true,
    data: {
      totalRepositories,
      encryptedRepositories,
      compromisedRepositories,
      repositoriesByStatus
    }
  });
});
