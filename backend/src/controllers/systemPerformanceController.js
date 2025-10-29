const os = require('os');
const prisma = require('../database/prisma');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');

const captureSystemPerformance = async () => {
  const cpuUsage = os.loadavg()[0] / os.cpus().length * 100;
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;

  return {
    cpuUsage: parseFloat(cpuUsage.toFixed(2)),
    memoryUsage: parseFloat(memoryUsage.toFixed(2)),
    memoryTotal: parseFloat((totalMem / (1024 ** 3)).toFixed(2)),
    memoryFree: parseFloat((freeMem / (1024 ** 3)).toFixed(2)),
    diskUsage: 0,
    diskTotal: 0,
    diskFree: 0,
    activeConnections: 0,
    requestsPerMinute: 0
  };
};

exports.getCurrentPerformance = asyncHandler(async (req, res) => {
  const performance = await captureSystemPerformance();
  
  res.json({
    success: true,
    data: performance
  });
});

exports.getPerformanceHistory = asyncHandler(async (req, res) => {
  const { hours = 24 } = req.query;
  
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - parseInt(hours));

  const history = await prisma.systemPerformance.findMany({
    where: {
      timestamp: {
        gte: startDate
      }
    },
    orderBy: {
      timestamp: 'desc'
    },
    take: 1000
  });

  res.json({
    success: true,
    data: history
  });
});

exports.recordPerformance = asyncHandler(async (req, res) => {
  const performance = await captureSystemPerformance();
  
  const record = await prisma.systemPerformance.create({
    data: performance
  });

  res.json({
    success: true,
    data: record
  });
});

exports.getPerformanceStats = asyncHandler(async (req, res) => {
  const { hours = 24 } = req.query;
  
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - parseInt(hours));

  const records = await prisma.systemPerformance.findMany({
    where: {
      timestamp: {
        gte: startDate
      }
    }
  });

  if (records.length === 0) {
    return res.json({
      success: true,
      data: {
        avgCpuUsage: 0,
        avgMemoryUsage: 0,
        maxCpuUsage: 0,
        maxMemoryUsage: 0,
        recordCount: 0
      }
    });
  }

  const stats = {
    avgCpuUsage: parseFloat((records.reduce((sum, r) => sum + r.cpuUsage, 0) / records.length).toFixed(2)),
    avgMemoryUsage: parseFloat((records.reduce((sum, r) => sum + r.memoryUsage, 0) / records.length).toFixed(2)),
    maxCpuUsage: parseFloat(Math.max(...records.map(r => r.cpuUsage)).toFixed(2)),
    maxMemoryUsage: parseFloat(Math.max(...records.map(r => r.memoryUsage)).toFixed(2)),
    recordCount: records.length
  };

  res.json({
    success: true,
    data: stats
  });
});

exports.cleanupOldRecords = asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

  const result = await prisma.systemPerformance.deleteMany({
    where: {
      timestamp: {
        lt: cutoffDate
      }
    }
  });

  logger.info(`Cleaned up ${result.count} old performance records`);

  res.json({
    success: true,
    message: `Deleted ${result.count} old records`,
    data: { deletedCount: result.count }
  });
});
