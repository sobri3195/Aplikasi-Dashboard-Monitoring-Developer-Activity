const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all scheduled reports
 */
exports.getAllReports = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      prisma.scheduledReport.findMany({
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.scheduledReport.count()
    ]);

    res.json({
      reports,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get scheduled reports error:', error);
    res.status(500).json({ error: 'Failed to fetch scheduled reports' });
  }
};

/**
 * Create scheduled report
 */
exports.createReport = async (req, res) => {
  try {
    const { reportName, reportType, schedule, recipients, filters } = req.body;
    const createdBy = req.user.id;

    if (!reportName || !reportType || !schedule || !recipients) {
      return res.status(400).json({ 
        error: 'Report name, type, schedule, and recipients are required' 
      });
    }

    const report = await prisma.scheduledReport.create({
      data: {
        reportName,
        reportType,
        schedule,
        recipients,
        filters: filters || {},
        createdBy
      }
    });

    res.status(201).json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Create scheduled report error:', error);
    res.status(500).json({ error: 'Failed to create scheduled report' });
  }
};

/**
 * Update scheduled report
 */
exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { reportName, schedule, recipients, filters, isActive } = req.body;

    const report = await prisma.scheduledReport.update({
      where: { id },
      data: {
        ...(reportName && { reportName }),
        ...(schedule && { schedule }),
        ...(recipients && { recipients }),
        ...(filters && { filters }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Update scheduled report error:', error);
    res.status(500).json({ error: 'Failed to update scheduled report' });
  }
};

/**
 * Delete scheduled report
 */
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.scheduledReport.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Scheduled report deleted successfully'
    });
  } catch (error) {
    console.error('Delete scheduled report error:', error);
    res.status(500).json({ error: 'Failed to delete scheduled report' });
  }
};

/**
 * Run report now
 */
exports.runReportNow = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await prisma.scheduledReport.findUnique({
      where: { id }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // TODO: Execute report generation
    // await generateReport(report);

    await prisma.scheduledReport.update({
      where: { id },
      data: { lastRun: new Date() }
    });

    res.json({
      success: true,
      message: 'Report execution started'
    });
  } catch (error) {
    console.error('Run report error:', error);
    res.status(500).json({ error: 'Failed to run report' });
  }
};

/**
 * Get report execution history
 */
exports.getReportHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await prisma.scheduledReport.findUnique({
      where: { id }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({
      report,
      history: {
        lastRun: report.lastRun,
        nextRun: report.nextRun
      }
    });
  } catch (error) {
    console.error('Get report history error:', error);
    res.status(500).json({ error: 'Failed to fetch report history' });
  }
};
