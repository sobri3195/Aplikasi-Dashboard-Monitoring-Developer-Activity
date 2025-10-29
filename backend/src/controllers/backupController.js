const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const prisma = require('../database/prisma');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '../../backups');

const ensureBackupDir = async () => {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  } catch (error) {
    logger.error('Error creating backup directory:', error);
  }
};

const executeBackup = async (backupType, createdBy) => {
  await ensureBackupDir();
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup-${backupType.toLowerCase()}-${timestamp}.sql`;
  const filePath = path.join(BACKUP_DIR, filename);
  
  const record = await prisma.backupRecord.create({
    data: {
      filename,
      filePath,
      fileSize: 0,
      backupType,
      status: 'IN_PROGRESS',
      createdBy
    }
  });

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL not configured');
  }

  const dbUrlMatch = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!dbUrlMatch) {
    throw new Error('Invalid DATABASE_URL format');
  }

  const [, user, password, host, port, database] = dbUrlMatch;
  
  return new Promise((resolve, reject) => {
    const command = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${user} -d ${database} -f ${filePath}`;
    
    exec(command, async (error, stdout, stderr) => {
      if (error) {
        await prisma.backupRecord.update({
          where: { id: record.id },
          data: {
            status: 'FAILED',
            error: error.message,
            completedAt: new Date()
          }
        });
        reject(error);
        return;
      }

      try {
        const stats = await fs.stat(filePath);
        await prisma.backupRecord.update({
          where: { id: record.id },
          data: {
            status: 'COMPLETED',
            fileSize: parseFloat((stats.size / (1024 ** 2)).toFixed(2)),
            completedAt: new Date()
          }
        });
        resolve(record.id);
      } catch (statError) {
        await prisma.backupRecord.update({
          where: { id: record.id },
          data: {
            status: 'FAILED',
            error: statError.message,
            completedAt: new Date()
          }
        });
        reject(statError);
      }
    });
  });
};

exports.createBackup = asyncHandler(async (req, res) => {
  const { backupType = 'MANUAL' } = req.body;
  const userId = req.user?.id;

  try {
    const backupId = await executeBackup(backupType, userId);
    const backup = await prisma.backupRecord.findUnique({
      where: { id: backupId }
    });

    res.json({
      success: true,
      message: 'Backup created successfully',
      data: backup
    });
  } catch (error) {
    logger.error('Backup failed:', error);
    res.status(500).json({
      success: false,
      message: 'Backup failed',
      error: error.message
    });
  }
});

exports.listBackups = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = status ? { status } : {};

  const [backups, total] = await Promise.all([
    prisma.backupRecord.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      skip,
      take: parseInt(limit)
    }),
    prisma.backupRecord.count({ where })
  ]);

  res.json({
    success: true,
    data: backups,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

exports.getBackup = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const backup = await prisma.backupRecord.findUnique({
    where: { id }
  });

  if (!backup) {
    return res.status(404).json({
      success: false,
      message: 'Backup not found'
    });
  }

  res.json({
    success: true,
    data: backup
  });
});

exports.downloadBackup = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const backup = await prisma.backupRecord.findUnique({
    where: { id }
  });

  if (!backup) {
    return res.status(404).json({
      success: false,
      message: 'Backup not found'
    });
  }

  if (backup.status !== 'COMPLETED') {
    return res.status(400).json({
      success: false,
      message: 'Backup is not completed'
    });
  }

  try {
    await fs.access(backup.filePath);
    res.download(backup.filePath, backup.filename);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'Backup file not found'
    });
  }
});

exports.deleteBackup = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const backup = await prisma.backupRecord.findUnique({
    where: { id }
  });

  if (!backup) {
    return res.status(404).json({
      success: false,
      message: 'Backup not found'
    });
  }

  try {
    await fs.unlink(backup.filePath);
  } catch (error) {
    logger.warn('Could not delete backup file:', error);
  }

  await prisma.backupRecord.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Backup deleted successfully'
  });
});

exports.getBackupStats = asyncHandler(async (req, res) => {
  const [total, completed, failed, inProgress, totalSize] = await Promise.all([
    prisma.backupRecord.count(),
    prisma.backupRecord.count({ where: { status: 'COMPLETED' } }),
    prisma.backupRecord.count({ where: { status: 'FAILED' } }),
    prisma.backupRecord.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.backupRecord.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { fileSize: true }
    })
  ]);

  const recentBackups = await prisma.backupRecord.findMany({
    orderBy: { startedAt: 'desc' },
    take: 5
  });

  res.json({
    success: true,
    data: {
      total,
      completed,
      failed,
      inProgress,
      totalSize: parseFloat((totalSize._sum.fileSize || 0).toFixed(2)),
      recentBackups
    }
  });
});
