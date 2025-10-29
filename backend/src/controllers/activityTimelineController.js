const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get timeline for an activity
 */
exports.getActivityTimeline = async (req, res) => {
  try {
    const { activityId } = req.params;

    // Check if activity exists
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        user: {
          select: { email: true, name: true }
        },
        device: {
          select: { deviceName: true }
        }
      }
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    const timeline = await prisma.activityTimeline.findMany({
      where: { activityId },
      orderBy: { step: 'asc' }
    });

    res.json({
      activity,
      timeline
    });
  } catch (error) {
    console.error('Get activity timeline error:', error);
    res.status(500).json({ error: 'Failed to fetch activity timeline' });
  }
};

/**
 * Add step to activity timeline
 */
exports.addTimelineStep = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { action, details } = req.body;

    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    // Get current max step
    const maxStep = await prisma.activityTimeline.findFirst({
      where: { activityId },
      orderBy: { step: 'desc' },
      select: { step: true }
    });

    const nextStep = maxStep ? maxStep.step + 1 : 1;

    const timelineStep = await prisma.activityTimeline.create({
      data: {
        activityId,
        step: nextStep,
        action,
        details: details || {}
      }
    });

    res.status(201).json({
      success: true,
      step: timelineStep
    });
  } catch (error) {
    console.error('Add timeline step error:', error);
    res.status(500).json({ error: 'Failed to add timeline step' });
  }
};

/**
 * Get activities with full timeline
 */
exports.getActivitiesWithTimeline = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (userId) where.userId = userId;

    const activities = await prisma.activity.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: { email: true, name: true }
        },
        device: {
          select: { deviceName: true }
        }
      }
    });

    // Get timeline for each activity
    const activitiesWithTimeline = await Promise.all(
      activities.map(async (activity) => {
        const timeline = await prisma.activityTimeline.findMany({
          where: { activityId: activity.id },
          orderBy: { step: 'asc' }
        });

        return {
          ...activity,
          timeline
        };
      })
    );

    const total = await prisma.activity.count({ where });

    res.json({
      activities: activitiesWithTimeline,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get activities with timeline error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

/**
 * Replay activity timeline
 */
exports.replayTimeline = async (req, res) => {
  try {
    const { activityId } = req.params;

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        user: {
          select: { email: true, name: true, role: true }
        },
        device: {
          select: { deviceName: true, hostname: true, ipAddress: true }
        }
      }
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    const timeline = await prisma.activityTimeline.findMany({
      where: { activityId },
      orderBy: { step: 'asc' }
    });

    // Build replay data
    const replay = {
      activity: {
        id: activity.id,
        type: activity.activityType,
        user: activity.user.email,
        device: activity.device?.deviceName,
        timestamp: activity.timestamp,
        isSuspicious: activity.isSuspicious,
        riskLevel: activity.riskLevel
      },
      timeline: timeline.map(step => ({
        step: step.step,
        action: step.action,
        details: step.details,
        timestamp: step.timestamp,
        duration: step.step > 1 ? 
          (new Date(step.timestamp) - new Date(timeline[step.step - 2].timestamp)) : 
          0
      })),
      summary: {
        totalSteps: timeline.length,
        duration: timeline.length > 0 ? 
          (new Date(timeline[timeline.length - 1].timestamp) - new Date(timeline[0].timestamp)) : 
          0,
        startTime: timeline[0]?.timestamp,
        endTime: timeline[timeline.length - 1]?.timestamp
      }
    };

    res.json({ replay });
  } catch (error) {
    console.error('Replay timeline error:', error);
    res.status(500).json({ error: 'Failed to replay timeline' });
  }
};

/**
 * Delete timeline step
 */
exports.deleteTimelineStep = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.activityTimeline.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Timeline step deleted successfully'
    });
  } catch (error) {
    console.error('Delete timeline step error:', error);
    res.status(500).json({ error: 'Failed to delete timeline step' });
  }
};

/**
 * Get timeline statistics
 */
exports.getTimelineStats = async (req, res) => {
  try {
    const totalTimelines = await prisma.activityTimeline.count();

    const activitiesWithTimeline = await prisma.activityTimeline.groupBy({
      by: ['activityId']
    });

    const avgStepsPerActivity = totalTimelines / (activitiesWithTimeline.length || 1);

    res.json({
      totalSteps: totalTimelines,
      activitiesWithTimeline: activitiesWithTimeline.length,
      avgStepsPerActivity: Math.round(avgStepsPerActivity * 100) / 100
    });
  } catch (error) {
    console.error('Get timeline stats error:', error);
    res.status(500).json({ error: 'Failed to fetch timeline statistics' });
  }
};
