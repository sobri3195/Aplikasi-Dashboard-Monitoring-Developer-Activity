const prisma = require('../database/prisma');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getAllConfigs = asyncHandler(async (req, res) => {
  const { category, includeSecret = false } = req.query;

  const where = {};

  if (category) {
    where.category = category;
  }

  if (includeSecret === 'false') {
    where.isSecret = false;
  }

  const configs = await prisma.systemConfig.findMany({
    where,
    orderBy: [
      { category: 'asc' },
      { key: 'asc' }
    ]
  });

  const configsResponse = configs.map(config => {
    if (config.isSecret && includeSecret !== 'true') {
      return {
        ...config,
        value: '***HIDDEN***'
      };
    }
    return config;
  });

  res.json({
    success: true,
    data: configsResponse
  });
});

exports.getConfig = asyncHandler(async (req, res) => {
  const { key } = req.params;

  const config = await prisma.systemConfig.findUnique({
    where: { key }
  });

  if (!config) {
    return res.status(404).json({
      success: false,
      message: 'Configuration not found'
    });
  }

  if (config.isSecret) {
    config.value = '***HIDDEN***';
  }

  res.json({
    success: true,
    data: config
  });
});

exports.createConfig = asyncHandler(async (req, res) => {
  const { key, value, description, category, isSecret = false } = req.body;
  const userId = req.user?.id;

  const existing = await prisma.systemConfig.findUnique({
    where: { key }
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'Configuration key already exists'
    });
  }

  const config = await prisma.systemConfig.create({
    data: {
      key,
      value,
      description,
      category,
      isSecret,
      updatedBy: userId
    }
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: 'CREATE_CONFIG',
      entity: 'SystemConfig',
      entityId: config.id,
      changes: {
        key,
        category
      }
    }
  });

  res.json({
    success: true,
    message: 'Configuration created successfully',
    data: config
  });
});

exports.updateConfig = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { value, description, category, isSecret } = req.body;
  const userId = req.user?.id;

  const existing = await prisma.systemConfig.findUnique({
    where: { key }
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      message: 'Configuration not found'
    });
  }

  const updateData = { updatedBy: userId };
  const changes = { key };

  if (value !== undefined) {
    updateData.value = value;
    changes.oldValue = existing.value;
    changes.newValue = value;
  }

  if (description !== undefined) {
    updateData.description = description;
  }

  if (category !== undefined) {
    updateData.category = category;
  }

  if (isSecret !== undefined) {
    updateData.isSecret = isSecret;
  }

  const config = await prisma.systemConfig.update({
    where: { key },
    data: updateData
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: 'UPDATE_CONFIG',
      entity: 'SystemConfig',
      entityId: config.id,
      changes
    }
  });

  logger.info(`Configuration updated: ${key} by user ${userId}`);

  res.json({
    success: true,
    message: 'Configuration updated successfully',
    data: config
  });
});

exports.deleteConfig = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const userId = req.user?.id;

  const existing = await prisma.systemConfig.findUnique({
    where: { key }
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      message: 'Configuration not found'
    });
  }

  await prisma.systemConfig.delete({
    where: { key }
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: 'DELETE_CONFIG',
      entity: 'SystemConfig',
      entityId: existing.id,
      changes: { key }
    }
  });

  logger.info(`Configuration deleted: ${key} by user ${userId}`);

  res.json({
    success: true,
    message: 'Configuration deleted successfully'
  });
});

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.systemConfig.groupBy({
    by: ['category'],
    _count: true
  });

  const result = categories
    .map(item => ({
      category: item.category || 'uncategorized',
      count: item._count
    }))
    .sort((a, b) => a.category.localeCompare(b.category));

  res.json({
    success: true,
    data: result
  });
});

exports.bulkUpdate = asyncHandler(async (req, res) => {
  const { configs } = req.body;
  const userId = req.user?.id;

  if (!Array.isArray(configs)) {
    return res.status(400).json({
      success: false,
      message: 'configs must be an array'
    });
  }

  const results = [];

  for (const config of configs) {
    try {
      const existing = await prisma.systemConfig.findUnique({
        where: { key: config.key }
      });

      if (existing) {
        const updated = await prisma.systemConfig.update({
          where: { key: config.key },
          data: {
            value: config.value,
            updatedBy: userId
          }
        });
        results.push({ key: config.key, status: 'updated', data: updated });
      } else {
        const created = await prisma.systemConfig.create({
          data: {
            key: config.key,
            value: config.value,
            description: config.description,
            category: config.category,
            isSecret: config.isSecret || false,
            updatedBy: userId
          }
        });
        results.push({ key: config.key, status: 'created', data: created });
      }
    } catch (error) {
      results.push({ key: config.key, status: 'failed', error: error.message });
    }
  }

  await prisma.auditLog.create({
    data: {
      userId,
      action: 'BULK_UPDATE_CONFIG',
      entity: 'SystemConfig',
      changes: { count: configs.length }
    }
  });

  res.json({
    success: true,
    message: `Processed ${results.length} configurations`,
    data: results
  });
});
