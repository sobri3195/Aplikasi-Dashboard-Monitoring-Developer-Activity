const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get user's notification preferences
 */
exports.getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const preferences = await prisma.notificationPreference.findMany({
      where: { userId }
    });

    res.json({ preferences });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
};

/**
 * Update notification preference
 */
exports.updatePreference = async (req, res) => {
  try {
    const { channel, alertTypes, isEnabled } = req.body;
    const userId = req.user.id;

    if (!channel) {
      return res.status(400).json({ error: 'Channel is required' });
    }

    // Check if preference exists
    const existing = await prisma.notificationPreference.findUnique({
      where: {
        userId_channel: {
          userId,
          channel
        }
      }
    });

    let preference;
    if (existing) {
      // Update existing
      preference = await prisma.notificationPreference.update({
        where: { id: existing.id },
        data: {
          ...(alertTypes && { alertTypes }),
          ...(isEnabled !== undefined && { isEnabled })
        }
      });
    } else {
      // Create new
      preference = await prisma.notificationPreference.create({
        data: {
          userId,
          channel,
          alertTypes: alertTypes || [],
          isEnabled: isEnabled !== undefined ? isEnabled : true
        }
      });
    }

    res.json({
      success: true,
      preference
    });
  } catch (error) {
    console.error('Update notification preference error:', error);
    res.status(500).json({ error: 'Failed to update notification preference' });
  }
};

/**
 * Delete notification preference
 */
exports.deletePreference = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if preference belongs to user
    const preference = await prisma.notificationPreference.findUnique({
      where: { id }
    });

    if (!preference || preference.userId !== userId) {
      return res.status(404).json({ error: 'Preference not found' });
    }

    await prisma.notificationPreference.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Notification preference deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification preference error:', error);
    res.status(500).json({ error: 'Failed to delete notification preference' });
  }
};

/**
 * Get available channels
 */
exports.getAvailableChannels = async (req, res) => {
  try {
    const channels = [
      {
        key: 'email',
        name: 'Email',
        description: 'Receive notifications via email',
        icon: 'mail'
      },
      {
        key: 'slack',
        name: 'Slack',
        description: 'Receive notifications in Slack',
        icon: 'slack'
      },
      {
        key: 'dashboard',
        name: 'Dashboard',
        description: 'Show notifications in dashboard',
        icon: 'bell'
      },
      {
        key: 'webhook',
        name: 'Webhook',
        description: 'Send notifications to custom webhook',
        icon: 'link'
      }
    ];

    res.json({ channels });
  } catch (error) {
    console.error('Get available channels error:', error);
    res.status(500).json({ error: 'Failed to fetch available channels' });
  }
};

/**
 * Get available alert types
 */
exports.getAvailableAlertTypes = async (req, res) => {
  try {
    const alertTypes = [
      {
        key: 'UNAUTHORIZED_DEVICE',
        name: 'Unauthorized Device',
        description: 'Alert when unauthorized device is detected'
      },
      {
        key: 'SUSPICIOUS_ACTIVITY',
        name: 'Suspicious Activity',
        description: 'Alert for suspicious activities'
      },
      {
        key: 'REPO_COPY_DETECTED',
        name: 'Repository Copy',
        description: 'Alert when repository copy is detected'
      },
      {
        key: 'UNUSUAL_LOCATION',
        name: 'Unusual Location',
        description: 'Alert for access from unusual locations'
      },
      {
        key: 'MULTIPLE_FAILED_AUTH',
        name: 'Failed Authentication',
        description: 'Alert for multiple failed login attempts'
      },
      {
        key: 'REPO_ENCRYPTED',
        name: 'Repository Encrypted',
        description: 'Alert when repository is encrypted'
      },
      {
        key: 'DEVICE_CHANGE',
        name: 'Device Change',
        description: 'Alert for device configuration changes'
      }
    ];

    res.json({ alertTypes });
  } catch (error) {
    console.error('Get available alert types error:', error);
    res.status(500).json({ error: 'Failed to fetch available alert types' });
  }
};

/**
 * Bulk update preferences
 */
exports.bulkUpdatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(preferences)) {
      return res.status(400).json({ error: 'Preferences must be an array' });
    }

    const results = await Promise.all(
      preferences.map(async ({ channel, alertTypes, isEnabled }) => {
        const existing = await prisma.notificationPreference.findUnique({
          where: {
            userId_channel: {
              userId,
              channel
            }
          }
        });

        if (existing) {
          return prisma.notificationPreference.update({
            where: { id: existing.id },
            data: { alertTypes, isEnabled }
          });
        } else {
          return prisma.notificationPreference.create({
            data: {
              userId,
              channel,
              alertTypes,
              isEnabled
            }
          });
        }
      })
    );

    res.json({
      success: true,
      preferences: results
    });
  } catch (error) {
    console.error('Bulk update preferences error:', error);
    res.status(500).json({ error: 'Failed to bulk update preferences' });
  }
};
