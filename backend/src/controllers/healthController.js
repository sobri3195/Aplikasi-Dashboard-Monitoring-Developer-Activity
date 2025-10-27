const { asyncHandler } = require('../middleware/errorHandler');
const healthService = require('../services/healthService');
const cronService = require('../services/cronService');

exports.getBasicHealth = asyncHandler(async (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

exports.getDetailedHealth = asyncHandler(async (req, res) => {
  const health = await healthService.getDetailedHealth();
  const statusCode = health.status === 'healthy' ? 200 : 503;
  
  res.status(statusCode).json(health);
});

exports.getSystemInfo = asyncHandler(async (req, res) => {
  const [serverInfo, systemStats, cronStatus] = await Promise.all([
    healthService.getServerInfo(),
    healthService.getSystemStats(),
    Promise.resolve(cronService.getStatus())
  ]);

  res.json({
    success: true,
    data: {
      server: serverInfo,
      database: systemStats,
      cronJobs: cronStatus
    }
  });
});

exports.getReadiness = asyncHandler(async (req, res) => {
  const health = await healthService.getDetailedHealth();
  const isReady = health.checks.database.status === 'healthy';
  
  if (isReady) {
    res.json({ status: 'ready' });
  } else {
    res.status(503).json({ status: 'not ready' });
  }
});

exports.getLiveness = asyncHandler(async (req, res) => {
  res.json({ status: 'alive' });
});
