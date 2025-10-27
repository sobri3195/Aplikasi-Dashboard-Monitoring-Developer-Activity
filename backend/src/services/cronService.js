const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

class CronService {
  constructor() {
    this.jobs = [];
  }

  init() {
    logger.info('Initializing cron jobs...');

    // Clean old audit logs (keep last 90 days)
    const cleanAuditLogsJob = cron.schedule('0 2 * * *', async () => {
      try {
        logger.info('Running audit logs cleanup job...');
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        
        const result = await prisma.auditLog.deleteMany({
          where: {
            timestamp: {
              lt: ninetyDaysAgo
            }
          }
        });

        logger.info(`Cleaned up ${result.count} old audit logs`);
      } catch (error) {
        logger.error('Error cleaning audit logs:', error.message);
      }
    });

    this.jobs.push({ name: 'cleanAuditLogs', job: cleanAuditLogsJob });

    // Update device last seen status (mark devices as inactive if not seen in 30 days)
    const updateDeviceStatusJob = cron.schedule('0 */6 * * *', async () => {
      try {
        logger.info('Running device status update job...');
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        const result = await prisma.device.updateMany({
          where: {
            lastSeen: {
              lt: thirtyDaysAgo
            },
            status: {
              not: 'SUSPENDED'
            }
          },
          data: {
            status: 'SUSPENDED',
            isAuthorized: false
          }
        });

        logger.info(`Updated ${result.count} inactive devices`);
      } catch (error) {
        logger.error('Error updating device status:', error.message);
      }
    });

    this.jobs.push({ name: 'updateDeviceStatus', job: updateDeviceStatusJob });

    // Auto-resolve old alerts (after 30 days)
    const autoResolveAlertsJob = cron.schedule('0 3 * * *', async () => {
      try {
        logger.info('Running auto-resolve alerts job...');
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        const result = await prisma.alert.updateMany({
          where: {
            createdAt: {
              lt: thirtyDaysAgo
            },
            isResolved: false,
            severity: {
              not: 'CRITICAL'
            }
          },
          data: {
            isResolved: true,
            resolvedAt: new Date()
          }
        });

        logger.info(`Auto-resolved ${result.count} old alerts`);
      } catch (error) {
        logger.error('Error auto-resolving alerts:', error.message);
      }
    });

    this.jobs.push({ name: 'autoResolveAlerts', job: autoResolveAlertsJob });

    // Clean old activities (keep last 180 days)
    const cleanOldActivitiesJob = cron.schedule('0 1 * * 0', async () => {
      try {
        logger.info('Running old activities cleanup job...');
        const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
        
        const result = await prisma.activity.deleteMany({
          where: {
            timestamp: {
              lt: sixMonthsAgo
            },
            isSuspicious: false
          }
        });

        logger.info(`Cleaned up ${result.count} old activities`);
      } catch (error) {
        logger.error('Error cleaning old activities:', error.message);
      }
    });

    this.jobs.push({ name: 'cleanOldActivities', job: cleanOldActivitiesJob });

    // Generate daily security report
    const dailySecurityReportJob = cron.schedule('0 9 * * *', async () => {
      try {
        logger.info('Generating daily security report...');
        
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const [
          activitiesCount,
          suspiciousActivities,
          newAlerts,
          newDevices
        ] = await Promise.all([
          prisma.activity.count({
            where: {
              timestamp: {
                gte: yesterday
              }
            }
          }),
          prisma.activity.count({
            where: {
              timestamp: {
                gte: yesterday
              },
              isSuspicious: true
            }
          }),
          prisma.alert.count({
            where: {
              createdAt: {
                gte: yesterday
              }
            }
          }),
          prisma.device.count({
            where: {
              createdAt: {
                gte: yesterday
              }
            }
          })
        ]);

        logger.info('Daily Security Report:', {
          date: new Date().toISOString().split('T')[0],
          totalActivities: activitiesCount,
          suspiciousActivities,
          newAlerts,
          newDevices
        });
      } catch (error) {
        logger.error('Error generating daily security report:', error.message);
      }
    });

    this.jobs.push({ name: 'dailySecurityReport', job: dailySecurityReportJob });

    logger.info(`✅ ${this.jobs.length} cron jobs initialized`);
  }

  stopAll() {
    logger.info('Stopping all cron jobs...');
    this.jobs.forEach(({ name, job }) => {
      job.stop();
      logger.info(`Stopped cron job: ${name}`);
    });
  }

  getStatus() {
    return this.jobs.map(({ name, job }) => ({
      name,
      running: job.running || false
    }));
  }
}

module.exports = new CronService();
