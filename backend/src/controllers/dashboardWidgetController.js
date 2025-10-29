const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get user's dashboard widgets
 */
exports.getUserWidgets = async (req, res) => {
  try {
    const userId = req.user.id;

    const widgets = await prisma.dashboardWidget.findMany({
      where: { userId },
      orderBy: { position: 'asc' }
    });

    res.json({ widgets });
  } catch (error) {
    console.error('Get user widgets error:', error);
    res.status(500).json({ error: 'Failed to fetch widgets' });
  }
};

/**
 * Create dashboard widget
 */
exports.createWidget = async (req, res) => {
  try {
    const { widgetType, position, size, settings } = req.body;
    const userId = req.user.id;

    if (!widgetType) {
      return res.status(400).json({ error: 'Widget type is required' });
    }

    const widget = await prisma.dashboardWidget.create({
      data: {
        userId,
        widgetType,
        position: position || 0,
        size: size || 'medium',
        settings: settings || {}
      }
    });

    res.status(201).json({
      success: true,
      widget
    });
  } catch (error) {
    console.error('Create widget error:', error);
    res.status(500).json({ error: 'Failed to create widget' });
  }
};

/**
 * Update dashboard widget
 */
exports.updateWidget = async (req, res) => {
  try {
    const { id } = req.params;
    const { position, size, settings, isVisible } = req.body;
    const userId = req.user.id;

    // Check if widget belongs to user
    const widget = await prisma.dashboardWidget.findUnique({
      where: { id }
    });

    if (!widget || widget.userId !== userId) {
      return res.status(404).json({ error: 'Widget not found' });
    }

    const updated = await prisma.dashboardWidget.update({
      where: { id },
      data: {
        ...(position !== undefined && { position }),
        ...(size && { size }),
        ...(settings && { settings }),
        ...(isVisible !== undefined && { isVisible })
      }
    });

    res.json({
      success: true,
      widget: updated
    });
  } catch (error) {
    console.error('Update widget error:', error);
    res.status(500).json({ error: 'Failed to update widget' });
  }
};

/**
 * Delete dashboard widget
 */
exports.deleteWidget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if widget belongs to user
    const widget = await prisma.dashboardWidget.findUnique({
      where: { id }
    });

    if (!widget || widget.userId !== userId) {
      return res.status(404).json({ error: 'Widget not found' });
    }

    await prisma.dashboardWidget.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Widget deleted successfully'
    });
  } catch (error) {
    console.error('Delete widget error:', error);
    res.status(500).json({ error: 'Failed to delete widget' });
  }
};

/**
 * Reorder widgets
 */
exports.reorderWidgets = async (req, res) => {
  try {
    const { widgets } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(widgets)) {
      return res.status(400).json({ error: 'Widgets must be an array' });
    }

    // Update positions in transaction
    await prisma.$transaction(
      widgets.map(({ id, position }) =>
        prisma.dashboardWidget.updateMany({
          where: { id, userId },
          data: { position }
        })
      )
    );

    res.json({
      success: true,
      message: 'Widgets reordered successfully'
    });
  } catch (error) {
    console.error('Reorder widgets error:', error);
    res.status(500).json({ error: 'Failed to reorder widgets' });
  }
};

/**
 * Reset to default widgets
 */
exports.resetToDefault = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all existing widgets
    await prisma.dashboardWidget.deleteMany({
      where: { userId }
    });

    // Create default widgets
    const defaultWidgets = [
      { widgetType: 'overview', position: 0, size: 'large' },
      { widgetType: 'recentActivities', position: 1, size: 'medium' },
      { widgetType: 'alerts', position: 2, size: 'medium' },
      { widgetType: 'devices', position: 3, size: 'small' }
    ];

    const widgets = await Promise.all(
      defaultWidgets.map(widget =>
        prisma.dashboardWidget.create({
          data: {
            userId,
            ...widget
          }
        })
      )
    );

    res.json({
      success: true,
      widgets
    });
  } catch (error) {
    console.error('Reset widgets error:', error);
    res.status(500).json({ error: 'Failed to reset widgets' });
  }
};

/**
 * Get available widget types
 */
exports.getAvailableWidgets = async (req, res) => {
  try {
    const widgetTypes = [
      {
        type: 'overview',
        name: 'System Overview',
        description: 'Overall system statistics and metrics',
        sizes: ['large', 'medium']
      },
      {
        type: 'recentActivities',
        name: 'Recent Activities',
        description: 'Latest user activities',
        sizes: ['large', 'medium', 'small']
      },
      {
        type: 'alerts',
        name: 'Active Alerts',
        description: 'Current security alerts',
        sizes: ['medium', 'small']
      },
      {
        type: 'devices',
        name: 'Device Status',
        description: 'Authorized and pending devices',
        sizes: ['medium', 'small']
      },
      {
        type: 'activityChart',
        name: 'Activity Chart',
        description: 'Visual activity trends',
        sizes: ['large', 'medium']
      },
      {
        type: 'securityScore',
        name: 'Security Score',
        description: 'Current security rating',
        sizes: ['small']
      },
      {
        type: 'repositories',
        name: 'Repositories',
        description: 'Repository security status',
        sizes: ['medium', 'small']
      },
      {
        type: 'systemPerformance',
        name: 'System Performance',
        description: 'CPU, memory, and disk usage',
        sizes: ['medium', 'small']
      }
    ];

    res.json({ widgetTypes });
  } catch (error) {
    console.error('Get available widgets error:', error);
    res.status(500).json({ error: 'Failed to fetch available widgets' });
  }
};
