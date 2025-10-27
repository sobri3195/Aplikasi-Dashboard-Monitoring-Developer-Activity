const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');
const os = require('os');

const prisma = new PrismaClient();

class HealthService {
  async getDetailedHealth() {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {}
    };

    // Database check
    health.checks.database = await this.checkDatabase();

    // Memory check
    health.checks.memory = this.checkMemory();

    // CPU check
    health.checks.cpu = this.checkCPU();

    // Disk check
    health.checks.disk = this.checkDisk();

    // Overall status
    const allHealthy = Object.values(health.checks).every(check => check.status === 'healthy');
    health.status = allHealthy ? 'healthy' : 'degraded';

    return health;
  }

  async checkDatabase() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: 'healthy',
        message: 'Database connection successful'
      };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        message: 'Database connection failed',
        error: error.message
      };
    }
  }

  checkMemory() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = (usedMem / totalMem) * 100;

    return {
      status: memUsagePercent < 90 ? 'healthy' : 'warning',
      total: this.formatBytes(totalMem),
      free: this.formatBytes(freeMem),
      used: this.formatBytes(usedMem),
      usagePercent: memUsagePercent.toFixed(2)
    };
  }

  checkCPU() {
    const cpus = os.cpus();
    const loadAverage = os.loadavg();

    return {
      status: loadAverage[0] < cpus.length * 0.8 ? 'healthy' : 'warning',
      cores: cpus.length,
      model: cpus[0].model,
      loadAverage: {
        '1min': loadAverage[0].toFixed(2),
        '5min': loadAverage[1].toFixed(2),
        '15min': loadAverage[2].toFixed(2)
      }
    };
  }

  checkDisk() {
    // Note: This is a simplified check. For production, use a library like 'diskusage'
    return {
      status: 'healthy',
      message: 'Disk check not implemented'
    };
  }

  formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  }

  async getSystemStats() {
    try {
      const [
        totalUsers,
        totalDevices,
        totalActivities,
        totalAlerts,
        totalRepositories
      ] = await Promise.all([
        prisma.user.count(),
        prisma.device.count(),
        prisma.activity.count(),
        prisma.alert.count(),
        prisma.repository.count()
      ]);

      return {
        users: totalUsers,
        devices: totalDevices,
        activities: totalActivities,
        alerts: totalAlerts,
        repositories: totalRepositories
      };
    } catch (error) {
      logger.error('Failed to get system stats:', error);
      return null;
    }
  }

  getServerInfo() {
    return {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      pid: process.pid,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };
  }
}

module.exports = new HealthService();
