const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');
const prisma = new PrismaClient();

class ComplianceAuditService {
  async createImmutableLog(userId, action, entity, entityId, changes, ipAddress, userAgent) {
    try {
      const lastLog = await prisma.immutableAuditLog.findFirst({
        orderBy: { blockNumber: 'desc' }
      });

      const blockNumber = lastLog ? lastLog.blockNumber + 1 : 1;
      const previousHash = lastLog?.logHash || '0';

      const logData = {
        userId,
        action,
        entity,
        entityId,
        changes,
        ipAddress,
        userAgent,
        timestamp: new Date(),
        blockNumber,
        previousHash
      };

      const logHash = this.generateLogHash(logData);

      const immutableLog = await prisma.immutableAuditLog.create({
        data: {
          ...logData,
          logHash,
          isVerified: true
        }
      });

      return immutableLog;
    } catch (error) {
      console.error('Error creating immutable log:', error);
      throw error;
    }
  }

  generateLogHash(logData) {
    const content = JSON.stringify({
      userId: logData.userId,
      action: logData.action,
      entity: logData.entity,
      entityId: logData.entityId,
      changes: logData.changes,
      timestamp: logData.timestamp,
      blockNumber: logData.blockNumber,
      previousHash: logData.previousHash
    });

    return crypto.createHash('sha256').update(content).digest('hex');
  }

  async verifyAuditChain() {
    try {
      const logs = await prisma.immutableAuditLog.findMany({
        orderBy: { blockNumber: 'asc' }
      });

      let isValid = true;
      const issues = [];

      for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        const expectedHash = this.generateLogHash(log);

        if (log.logHash !== expectedHash) {
          isValid = false;
          issues.push({
            blockNumber: log.blockNumber,
            issue: 'Hash mismatch',
            expected: expectedHash,
            actual: log.logHash
          });
        }

        if (i > 0) {
          const prevLog = logs[i - 1];
          if (log.previousHash !== prevLog.logHash) {
            isValid = false;
            issues.push({
              blockNumber: log.blockNumber,
              issue: 'Chain broken',
              expected: prevLog.logHash,
              actual: log.previousHash
            });
          }
        }
      }

      return {
        isValid,
        totalLogs: logs.length,
        issues
      };
    } catch (error) {
      console.error('Error verifying audit chain:', error);
      throw error;
    }
  }

  async generateComplianceReport(reportType, startDate, endDate, format = 'PDF') {
    try {
      const report = await prisma.complianceReport.create({
        data: {
          reportType,
          period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
          startDate,
          endDate,
          format,
          status: 'GENERATING'
        }
      });

      const data = await this.collectComplianceData(reportType, startDate, endDate);
      
      let filePath;
      switch (format) {
        case 'PDF':
          filePath = await this.generatePDFReport(report.id, reportType, data);
          break;
        case 'CSV':
          filePath = await this.generateCSVReport(report.id, reportType, data);
          break;
        case 'JSON':
          filePath = await this.generateJSONReport(report.id, reportType, data);
          break;
        default:
          filePath = await this.generatePDFReport(report.id, reportType, data);
      }

      const stats = fs.statSync(filePath);

      await prisma.complianceReport.update({
        where: { id: report.id },
        data: {
          status: 'COMPLETED',
          filePath,
          summary: data.summary,
          violations: data.violations,
          recommendations: data.recommendations,
          generatedAt: new Date(),
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        }
      });

      return await prisma.complianceReport.findUnique({
        where: { id: report.id }
      });
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }

  async collectComplianceData(reportType, startDate, endDate) {
    const data = {
      reportType,
      period: { start: startDate, end: endDate },
      summary: {},
      violations: [],
      recommendations: [],
      auditLogs: [],
      securityEvents: [],
      accessControls: {},
      dataProtection: {}
    };

    const auditLogs = await prisma.immutableAuditLog.findMany({
      where: {
        timestamp: { gte: startDate, lte: endDate }
      },
      orderBy: { timestamp: 'desc' }
    });

    const alerts = await prisma.alert.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    const activities = await prisma.activity.findMany({
      where: {
        timestamp: { gte: startDate, lte: endDate }
      }
    });

    const securityLogs = await prisma.securityLog.findMany({
      where: {
        timestamp: { gte: startDate, lte: endDate }
      }
    });

    data.auditLogs = auditLogs;
    data.securityEvents = securityLogs;

    data.summary = {
      totalAuditLogs: auditLogs.length,
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.severity === 'CRITICAL').length,
      totalActivities: activities.length,
      suspiciousActivities: activities.filter(a => a.isSuspicious).length,
      securityIncidents: securityLogs.filter(s => s.severity === 'CRITICAL').length
    };

    switch (reportType) {
      case 'ISO27001':
        data.violations = this.checkISO27001Compliance(auditLogs, alerts, activities);
        data.recommendations = this.generateISO27001Recommendations(data.violations);
        break;
      case 'SOC2':
        data.violations = this.checkSOC2Compliance(auditLogs, alerts, activities);
        data.recommendations = this.generateSOC2Recommendations(data.violations);
        break;
      case 'GDPR':
        data.violations = this.checkGDPRCompliance(auditLogs, alerts, activities);
        data.recommendations = this.generateGDPRRecommendations(data.violations);
        break;
      case 'PDPA':
        data.violations = this.checkPDPACompliance(auditLogs, alerts, activities);
        data.recommendations = this.generatePDPARecommendations(data.violations);
        break;
      default:
        data.violations = this.checkGeneralCompliance(auditLogs, alerts, activities);
        data.recommendations = this.generateGeneralRecommendations(data.violations);
    }

    const devices = await prisma.device.findMany();
    const users = await prisma.user.findMany();
    const repositories = await prisma.repository.findMany();

    data.accessControls = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      totalDevices: devices.length,
      authorizedDevices: devices.filter(d => d.isAuthorized).length,
      twoFactorEnabled: users.filter(u => u.twoFactorEnabled).length
    };

    data.dataProtection = {
      totalRepositories: repositories.length,
      encryptedRepositories: repositories.filter(r => r.isEncrypted).length,
      secureRepositories: repositories.filter(r => r.securityStatus === 'SECURE').length,
      compromisedRepositories: repositories.filter(r => r.securityStatus === 'COMPROMISED').length
    };

    return data;
  }

  checkISO27001Compliance(auditLogs, alerts, activities) {
    const violations = [];

    const criticalAlertsUnresolved = alerts.filter(
      a => a.severity === 'CRITICAL' && !a.isResolved
    );
    if (criticalAlertsUnresolved.length > 0) {
      violations.push({
        standard: 'ISO 27001',
        control: 'A.16.1.4 - Assessment of information security events',
        severity: 'HIGH',
        description: `${criticalAlertsUnresolved.length} unresolved critical alerts`,
        remediation: 'Review and resolve all critical security alerts'
      });
    }

    const suspiciousActivities = activities.filter(a => a.isSuspicious);
    if (suspiciousActivities.length > 10) {
      violations.push({
        standard: 'ISO 27001',
        control: 'A.12.4.1 - Event logging',
        severity: 'MEDIUM',
        description: `${suspiciousActivities.length} suspicious activities detected`,
        remediation: 'Investigate and document suspicious activities'
      });
    }

    return violations;
  }

  checkSOC2Compliance(auditLogs, alerts, activities) {
    const violations = [];

    if (auditLogs.length === 0) {
      violations.push({
        standard: 'SOC 2',
        control: 'CC7.2 - Monitoring of controls',
        severity: 'HIGH',
        description: 'No audit logs found for the period',
        remediation: 'Ensure continuous audit logging'
      });
    }

    const failedAuthAttempts = activities.filter(
      a => a.activityType === 'LOGIN' && a.isSuspicious
    );
    if (failedAuthAttempts.length > 20) {
      violations.push({
        standard: 'SOC 2',
        control: 'CC6.1 - Logical access controls',
        severity: 'MEDIUM',
        description: `${failedAuthAttempts.length} failed authentication attempts`,
        remediation: 'Review and strengthen authentication controls'
      });
    }

    return violations;
  }

  checkGDPRCompliance(auditLogs, alerts, activities) {
    const violations = [];

    const dataAccessLogs = auditLogs.filter(
      log => log.action.includes('ACCESS') || log.action.includes('EXPORT')
    );

    if (dataAccessLogs.length === 0) {
      violations.push({
        standard: 'GDPR',
        control: 'Article 32 - Security of processing',
        severity: 'MEDIUM',
        description: 'Insufficient data access logging',
        remediation: 'Implement comprehensive data access logging'
      });
    }

    return violations;
  }

  checkPDPACompliance(auditLogs, alerts, activities) {
    const violations = [];

    const unauthorizedAccess = activities.filter(
      a => a.activityType === 'UNAUTHORIZED_ACCESS'
    );

    if (unauthorizedAccess.length > 0) {
      violations.push({
        standard: 'PDPA',
        control: 'Protection Obligation',
        severity: 'HIGH',
        description: `${unauthorizedAccess.length} unauthorized access attempts`,
        remediation: 'Review and strengthen access controls'
      });
    }

    return violations;
  }

  checkGeneralCompliance(auditLogs, alerts, activities) {
    return [
      ...this.checkISO27001Compliance(auditLogs, alerts, activities),
      ...this.checkSOC2Compliance(auditLogs, alerts, activities),
      ...this.checkGDPRCompliance(auditLogs, alerts, activities),
      ...this.checkPDPACompliance(auditLogs, alerts, activities)
    ];
  }

  generateISO27001Recommendations(violations) {
    return this.generateRecommendations(violations);
  }

  generateSOC2Recommendations(violations) {
    return this.generateRecommendations(violations);
  }

  generateGDPRRecommendations(violations) {
    return this.generateRecommendations(violations);
  }

  generatePDPARecommendations(violations) {
    return this.generateRecommendations(violations);
  }

  generateGeneralRecommendations(violations) {
    return this.generateRecommendations(violations);
  }

  generateRecommendations(violations) {
    const recommendations = violations.map(v => ({
      priority: v.severity,
      control: v.control,
      action: v.remediation,
      standard: v.standard
    }));

    if (violations.length === 0) {
      recommendations.push({
        priority: 'INFO',
        control: 'General',
        action: 'Continue monitoring - no violations detected',
        standard: 'All'
      });
    }

    return recommendations;
  }

  async generatePDFReport(reportId, reportType, data) {
    const exportDir = path.join(__dirname, '../../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const filename = `compliance_${reportType}_${reportId}_${Date.now()}.pdf`;
    const filePath = path.join(exportDir, filename);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      doc.fontSize(20).text(`${reportType} Compliance Report`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Generated: ${new Date().toISOString()}`);
      doc.text(`Period: ${data.period.start.toISOString().split('T')[0]} to ${data.period.end.toISOString().split('T')[0]}`);
      doc.moveDown();

      doc.fontSize(16).text('Summary');
      doc.fontSize(10);
      doc.text(`Total Audit Logs: ${data.summary.totalAuditLogs}`);
      doc.text(`Total Alerts: ${data.summary.totalAlerts}`);
      doc.text(`Critical Alerts: ${data.summary.criticalAlerts}`);
      doc.text(`Suspicious Activities: ${data.summary.suspiciousActivities}`);
      doc.text(`Security Incidents: ${data.summary.securityIncidents}`);
      doc.moveDown();

      doc.fontSize(16).text('Violations');
      doc.fontSize(10);
      if (data.violations.length === 0) {
        doc.text('No violations detected.');
      } else {
        data.violations.forEach((v, i) => {
          doc.text(`${i + 1}. ${v.control} (${v.severity})`);
          doc.text(`   ${v.description}`);
          doc.moveDown(0.5);
        });
      }
      doc.moveDown();

      doc.fontSize(16).text('Recommendations');
      doc.fontSize(10);
      data.recommendations.forEach((r, i) => {
        doc.text(`${i + 1}. [${r.priority}] ${r.action}`);
        doc.moveDown(0.5);
      });

      doc.end();

      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }

  async generateCSVReport(reportId, reportType, data) {
    const exportDir = path.join(__dirname, '../../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const filename = `compliance_${reportType}_${reportId}_${Date.now()}.csv`;
    const filePath = path.join(exportDir, filename);

    const fields = ['timestamp', 'action', 'entity', 'userId', 'ipAddress'];
    const parser = new Parser({ fields });
    const csv = parser.parse(data.auditLogs);

    fs.writeFileSync(filePath, csv);

    return filePath;
  }

  async generateJSONReport(reportId, reportType, data) {
    const exportDir = path.join(__dirname, '../../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const filename = `compliance_${reportType}_${reportId}_${Date.now()}.json`;
    const filePath = path.join(exportDir, filename);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    return filePath;
  }

  async scheduleMonthlyReports() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const reportTypes = ['ISO27001', 'SOC2', 'GDPR', 'PDPA'];

    for (const reportType of reportTypes) {
      await this.generateComplianceReport(
        reportType,
        firstDayOfMonth,
        lastDayOfMonth,
        'PDF'
      );
    }
  }

  async getComplianceDashboard() {
    try {
      const reports = await prisma.complianceReport.findMany({
        orderBy: { generatedAt: 'desc' },
        take: 10
      });

      const recentViolations = reports
        .flatMap(r => r.violations || [])
        .slice(0, 20);

      const stats = {
        totalReports: await prisma.complianceReport.count(),
        reportsThisMonth: await prisma.complianceReport.count({
          where: {
            generatedAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }),
        pendingReports: await prisma.complianceReport.count({
          where: { status: 'GENERATING' }
        })
      };

      return {
        stats,
        recentReports: reports,
        recentViolations
      };
    } catch (error) {
      console.error('Error getting compliance dashboard:', error);
      throw error;
    }
  }
}

module.exports = new ComplianceAuditService();
