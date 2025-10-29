const prisma = require('../database/prisma');

const apiUsageLogger = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', async () => {
    try {
      const responseTime = Date.now() - startTime;
      
      await prisma.apiUsageLog.create({
        data: {
          endpoint: req.path,
          method: req.method,
          statusCode: res.statusCode,
          responseTime,
          ipAddress: req.ip || req.connection.remoteAddress,
          userId: req.user?.id,
          userAgent: req.get('user-agent')
        }
      });
    } catch (error) {
      console.error('Failed to log API usage:', error);
    }
  });
  
  next();
};

module.exports = apiUsageLogger;
