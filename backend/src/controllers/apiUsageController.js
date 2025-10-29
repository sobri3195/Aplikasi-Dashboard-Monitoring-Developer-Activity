const prisma = require('../database/prisma');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getUsageStats = asyncHandler(async (req, res) => {
  const { hours = 24 } = req.query;
  
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - parseInt(hours));

  const logs = await prisma.apiUsageLog.findMany({
    where: {
      timestamp: {
        gte: startDate
      }
    }
  });

  if (logs.length === 0) {
    return res.json({
      success: true,
      data: {
        totalRequests: 0,
        avgResponseTime: 0,
        errorRate: 0,
        requestsByEndpoint: [],
        requestsByStatus: []
      }
    });
  }

  const totalRequests = logs.length;
  const avgResponseTime = parseFloat((logs.reduce((sum, log) => sum + log.responseTime, 0) / totalRequests).toFixed(2));
  const errorCount = logs.filter(log => log.statusCode >= 400).length;
  const errorRate = parseFloat((errorCount / totalRequests * 100).toFixed(2));

  const endpointCounts = {};
  logs.forEach(log => {
    const key = `${log.method} ${log.endpoint}`;
    endpointCounts[key] = (endpointCounts[key] || 0) + 1;
  });

  const requestsByEndpoint = Object.entries(endpointCounts)
    .map(([endpoint, count]) => ({ endpoint, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const statusCounts = {};
  logs.forEach(log => {
    const statusGroup = Math.floor(log.statusCode / 100) * 100;
    statusCounts[statusGroup] = (statusCounts[statusGroup] || 0) + 1;
  });

  const requestsByStatus = Object.entries(statusCounts)
    .map(([status, count]) => ({ status: `${status}xx`, count }))
    .sort((a, b) => parseInt(a.status) - parseInt(b.status));

  res.json({
    success: true,
    data: {
      totalRequests,
      avgResponseTime,
      errorRate,
      errorCount,
      requestsByEndpoint,
      requestsByStatus
    }
  });
});

exports.getUsageHistory = asyncHandler(async (req, res) => {
  const { hours = 24, endpoint } = req.query;
  
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - parseInt(hours));

  const where = {
    timestamp: {
      gte: startDate
    }
  };

  if (endpoint) {
    where.endpoint = endpoint;
  }

  const logs = await prisma.apiUsageLog.findMany({
    where,
    orderBy: {
      timestamp: 'desc'
    },
    take: 1000
  });

  res.json({
    success: true,
    data: logs
  });
});

exports.getEndpointStats = asyncHandler(async (req, res) => {
  const { endpoint } = req.params;
  const { hours = 24 } = req.query;
  
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - parseInt(hours));

  const logs = await prisma.apiUsageLog.findMany({
    where: {
      endpoint,
      timestamp: {
        gte: startDate
      }
    }
  });

  if (logs.length === 0) {
    return res.json({
      success: true,
      data: {
        endpoint,
        totalRequests: 0,
        avgResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0,
        errorRate: 0
      }
    });
  }

  const totalRequests = logs.length;
  const avgResponseTime = parseFloat((logs.reduce((sum, log) => sum + log.responseTime, 0) / totalRequests).toFixed(2));
  const minResponseTime = parseFloat(Math.min(...logs.map(log => log.responseTime)).toFixed(2));
  const maxResponseTime = parseFloat(Math.max(...logs.map(log => log.responseTime)).toFixed(2));
  const errorCount = logs.filter(log => log.statusCode >= 400).length;
  const errorRate = parseFloat((errorCount / totalRequests * 100).toFixed(2));

  res.json({
    success: true,
    data: {
      endpoint,
      totalRequests,
      avgResponseTime,
      minResponseTime,
      maxResponseTime,
      errorRate,
      errorCount
    }
  });
});

exports.getUserApiUsage = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { hours = 24 } = req.query;
  
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - parseInt(hours));

  const logs = await prisma.apiUsageLog.findMany({
    where: {
      userId,
      timestamp: {
        gte: startDate
      }
    }
  });

  const totalRequests = logs.length;
  const endpointCounts = {};
  
  logs.forEach(log => {
    endpointCounts[log.endpoint] = (endpointCounts[log.endpoint] || 0) + 1;
  });

  const topEndpoints = Object.entries(endpointCounts)
    .map(([endpoint, count]) => ({ endpoint, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  res.json({
    success: true,
    data: {
      userId,
      totalRequests,
      topEndpoints,
      recentActivity: logs.slice(0, 20)
    }
  });
});

exports.cleanupOldLogs = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

  const result = await prisma.apiUsageLog.deleteMany({
    where: {
      timestamp: {
        lt: cutoffDate
      }
    }
  });

  logger.info(`Cleaned up ${result.count} old API usage logs`);

  res.json({
    success: true,
    message: `Deleted ${result.count} old logs`,
    data: { deletedCount: result.count }
  });
});

exports.getRateLimitViolations = asyncHandler(async (req, res) => {
  const { hours = 24 } = req.query;
  
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - parseInt(hours));

  const logs = await prisma.apiUsageLog.findMany({
    where: {
      statusCode: 429,
      timestamp: {
        gte: startDate
      }
    },
    orderBy: {
      timestamp: 'desc'
    }
  });

  const ipCounts = {};
  logs.forEach(log => {
    if (log.ipAddress) {
      ipCounts[log.ipAddress] = (ipCounts[log.ipAddress] || 0) + 1;
    }
  });

  const topViolators = Object.entries(ipCounts)
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  res.json({
    success: true,
    data: {
      totalViolations: logs.length,
      topViolators,
      recentViolations: logs.slice(0, 20)
    }
  });
});
