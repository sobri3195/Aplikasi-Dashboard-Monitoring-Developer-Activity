const { PrismaClient } = require('@prisma/client');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

/**
 * Export activities to CSV
 */
exports.exportActivitiesToCSV = async (req, res) => {
  try {
    const { startDate, endDate, userId, isSuspicious } = req.query;

    const where = {};
    if (startDate) where.timestamp = { gte: new Date(startDate) };
    if (endDate) where.timestamp = { ...where.timestamp, lte: new Date(endDate) };
    if (userId) where.userId = userId;
    if (isSuspicious !== undefined) where.isSuspicious = isSuspicious === 'true';

    const activities = await prisma.activity.findMany({
      where,
      include: {
        user: { select: { email: true, name: true } },
        device: { select: { deviceName: true } }
      },
      orderBy: { timestamp: 'desc' }
    });

    const data = activities.map(activity => ({
      id: activity.id,
      user: activity.user.email,
      userName: activity.user.name || 'N/A',
      device: activity.device?.deviceName || 'N/A',
      type: activity.activityType,
      repository: activity.repository || 'N/A',
      branch: activity.branch || 'N/A',
      isSuspicious: activity.isSuspicious,
      riskLevel: activity.riskLevel,
      ipAddress: activity.ipAddress || 'N/A',
      location: activity.location || 'N/A',
      timestamp: activity.timestamp
    }));

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=activities.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export activities to CSV error:', error);
    res.status(500).json({ error: 'Failed to export activities' });
  }
};

/**
 * Export alerts to CSV
 */
exports.exportAlertsToCSV = async (req, res) => {
  try {
    const { startDate, endDate, severity, isResolved } = req.query;

    const where = {};
    if (startDate) where.createdAt = { gte: new Date(startDate) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
    if (severity) where.severity = severity;
    if (isResolved !== undefined) where.isResolved = isResolved === 'true';

    const alerts = await prisma.alert.findMany({
      where,
      include: {
        activity: {
          include: {
            user: { select: { email: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const data = alerts.map(alert => ({
      id: alert.id,
      type: alert.alertType,
      severity: alert.severity,
      message: alert.message,
      user: alert.activity.user.email,
      isResolved: alert.isResolved,
      resolvedAt: alert.resolvedAt || 'N/A',
      createdAt: alert.createdAt
    }));

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=alerts.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export alerts to CSV error:', error);
    res.status(500).json({ error: 'Failed to export alerts' });
  }
};

/**
 * Export audit logs to CSV
 */
exports.exportAuditLogsToCSV = async (req, res) => {
  try {
    const { startDate, endDate, action } = req.query;

    const where = {};
    if (startDate) where.timestamp = { gte: new Date(startDate) };
    if (endDate) where.timestamp = { ...where.timestamp, lte: new Date(endDate) };
    if (action) where.action = action;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' }
    });

    const data = logs.map(log => ({
      id: log.id,
      userId: log.userId || 'N/A',
      action: log.action,
      entity: log.entity || 'N/A',
      entityId: log.entityId || 'N/A',
      ipAddress: log.ipAddress || 'N/A',
      timestamp: log.timestamp
    }));

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=audit-logs.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export audit logs to CSV error:', error);
    res.status(500).json({ error: 'Failed to export audit logs' });
  }
};

/**
 * Export report to PDF
 */
exports.exportReportToPDF = async (req, res) => {
  try {
    const { reportType } = req.body;

    // Create PDF document
    const doc = new PDFDocument();
    const fileName = `report-${reportType}-${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../../exports', fileName);

    // Ensure exports directory exists
    const exportsDir = path.join(__dirname, '../../exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // Pipe PDF to file
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Add content
    doc.fontSize(20).text('DevMonitor Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Report Type: ${reportType}`);
    doc.text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();

    if (reportType === 'security') {
      // Get security data
      const [totalAlerts, criticalAlerts, suspiciousActivities, devices] = await Promise.all([
        prisma.alert.count(),
        prisma.alert.count({ where: { severity: 'CRITICAL', isResolved: false } }),
        prisma.activity.count({ where: { isSuspicious: true } }),
        prisma.device.count({ where: { status: 'APPROVED' } })
      ]);

      doc.fontSize(16).text('Security Summary', { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Total Alerts: ${totalAlerts}`);
      doc.text(`Critical Alerts: ${criticalAlerts}`);
      doc.text(`Suspicious Activities: ${suspiciousActivities}`);
      doc.text(`Authorized Devices: ${devices}`);
    } else if (reportType === 'activity') {
      // Get activity data
      const activities = await prisma.activity.findMany({
        take: 50,
        orderBy: { timestamp: 'desc' },
        include: {
          user: { select: { email: true } }
        }
      });

      doc.fontSize(16).text('Recent Activities', { underline: true });
      doc.moveDown();
      
      activities.forEach((activity, index) => {
        if (index < 20) {
          doc.fontSize(10).text(
            `${activity.user.email} - ${activity.activityType} - ${activity.timestamp.toLocaleString()}`
          );
        }
      });
    }

    doc.end();

    // Wait for file to be written
    stream.on('finish', () => {
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('Error sending file:', err);
        }
        // Clean up file after download
        fs.unlinkSync(filePath);
      });
    });
  } catch (error) {
    console.error('Export to PDF error:', error);
    res.status(500).json({ error: 'Failed to export report to PDF' });
  }
};

/**
 * Create export job
 */
exports.createExportJob = async (req, res) => {
  try {
    const { exportType, format, filters } = req.body;
    const createdBy = req.user.id;

    if (!exportType || !format) {
      return res.status(400).json({ error: 'Export type and format are required' });
    }

    const job = await prisma.exportJob.create({
      data: {
        exportType,
        format,
        filters: filters || {},
        createdBy,
        status: 'PENDING'
      }
    });

    // TODO: Process job in background

    res.status(201).json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Create export job error:', error);
    res.status(500).json({ error: 'Failed to create export job' });
  }
};

/**
 * Get export jobs
 */
exports.getExportJobs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const where = isAdmin ? {} : { createdBy: userId };

    const [jobs, total] = await Promise.all([
      prisma.exportJob.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.exportJob.count({ where })
    ]);

    res.json({
      jobs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get export jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch export jobs' });
  }
};
