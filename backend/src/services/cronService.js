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

    // Record system performance every 5 minutes
    const recordPerformanceJob = cron.schedule('*/5 * * * *', async () => {
      try {
        const os = require('os');
        const cpuUsage = os.loadavg()[0] / os.cpus().length * 100;
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;

        await prisma.systemPerformance.create({
          data: {
            cpuUsage: parseFloat(cpuUsage.toFixed(2)),
            memoryUsage: parseFloat(memoryUsage.toFixed(2)),
            memoryTotal: parseFloat((totalMem / (1024 ** 3)).toFixed(2)),
            memoryFree: parseFloat((freeMem / (1024 ** 3)).toFixed(2)),
            diskUsage: 0,
            diskTotal: 0,
            diskFree: 0,
            activeConnections: 0,
            requestsPerMinute: 0
          }
        });
      } catch (error) {
        logger.error('Error recording system performance:', error.message);
      }
    });

    this.jobs.push({ name: 'recordPerformance', job: recordPerformanceJob });

    // Clean old performance records (keep last 7 days)
    const cleanPerformanceJob = cron.schedule('0 4 * * *', async () => {
      try {
        logger.info('Running performance records cleanup job...');
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        const result = await prisma.systemPerformance.deleteMany({
          where: {
            timestamp: {
              lt: sevenDaysAgo
            }
          }
        });

        logger.info(`Cleaned up ${result.count} old performance records`);
      } catch (error) {
        logger.error('Error cleaning performance records:', error.message);
      }
    });

    this.jobs.push({ name: 'cleanPerformance', job: cleanPerformanceJob });

    // Clean old API usage logs (keep last 30 days)
    const cleanApiUsageJob = cron.schedule('0 5 * * *', async () => {
      try {
        logger.info('Running API usage logs cleanup job...');
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        const result = await prisma.apiUsageLog.deleteMany({
          where: {
            timestamp: {
              lt: thirtyDaysAgo
            }
          }
        });

        logger.info(`Cleaned up ${result.count} old API usage logs`);
      } catch (error) {
        logger.error('Error cleaning API usage logs:', error.message);
      }
    });

    this.jobs.push({ name: 'cleanApiUsage', job: cleanApiUsageJob });

    // Automated daily backup
    const dailyBackupJob = cron.schedule('0 0 * * *', async () => {
      try {
        logger.info('Running automated daily backup...');
        
        const { exec } = require('child_process');
        const fs = require('fs').promises;
        const path = require('path');
        
        const BACKUP_DIR = process.env.BACKUP_DIR || path.join(__dirname, '../../backups');
        await fs.mkdir(BACKUP_DIR, { recursive: true });
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-scheduled-${timestamp}.sql`;
        const filePath = path.join(BACKUP_DIR, filename);
        
        const record = await prisma.backupRecord.create({
          data: {
            filename,
            filePath,
            fileSize: 0,
            backupType: 'SCHEDULED',
            status: 'IN_PROGRESS'
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
            logger.error('Daily backup failed:', error.message);
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
            logger.info(`Daily backup completed: ${filename}`);
          } catch (statError) {
            await prisma.backupRecord.update({
              where: { id: record.id },
              data: {
                status: 'FAILED',
                error: statError.message,
                completedAt: new Date()
              }
            });
            logger.error('Daily backup failed:', statError.message);
          }
        });
      } catch (error) {
        logger.error('Error running daily backup:', error.message);
      }
    });

    this.jobs.push({ name: 'dailyBackup', job: dailyBackupJob });

    // Auto-rotate expired tokens (every hour)
    const tokenRotationJob = cron.schedule('0 * * * *', async () => {
      try {
        logger.info('Running token rotation job...');
        const tokenVaultService = require('./tokenVaultService');
        const result = await tokenVaultService.checkAndRotateExpiredTokens();
        logger.info(`Token rotation completed: ${result.total} tokens checked`);
      } catch (error) {
        logger.error('Error rotating tokens:', error.message);
      }
    });

    this.jobs.push({ name: 'tokenRotation', job: tokenRotationJob });

    // Recalculate developer risk scores (daily at 6 AM)
    const riskScoreJob = cron.schedule('0 6 * * *', async () => {
      try {
        logger.info('Running risk score recalculation job...');
        const riskScoringService = require('./developerRiskScoringService');
        const results = await riskScoringService.recalculateAllRiskScores();
        logger.info(`Risk scores recalculated for ${results.length} developers`);
      } catch (error) {
        logger.error('Error recalculating risk scores:', error.message);
      }
    });

    this.jobs.push({ name: 'riskScoreRecalculation', job: riskScoreJob });

    // Generate monthly compliance reports (first day of month at 1 AM)
    const monthlyReportJob = cron.schedule('0 1 1 * *', async () => {
      try {
        logger.info('Running monthly compliance report generation...');
        const complianceService = require('./complianceAuditService');
        await complianceService.scheduleMonthlyReports();
        logger.info('Monthly compliance reports generated');
      } catch (error) {
        logger.error('Error generating monthly reports:', error.message);
      }
    });

    this.jobs.push({ name: 'monthlyComplianceReport', job: monthlyReportJob });

    // Verify audit chain integrity (daily at 4 AM)
    const auditChainVerificationJob = cron.schedule('0 4 * * *', async () => {
      try {
        logger.info('Running audit chain verification...');
        const complianceService = require('./complianceAuditService');
        const result = await complianceService.verifyAuditChain();
        logger.info(`Audit chain verification: ${result.isValid ? 'VALID' : 'INVALID'} - ${result.totalLogs} logs`);
        
        if (!result.isValid) {
          logger.error('Audit chain integrity compromised!', result.issues);
        }
      } catch (error) {
        logger.error('Error verifying audit chain:', error.message);
      }
    });

    this.jobs.push({ name: 'auditChainVerification', job: auditChainVerificationJob });

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
