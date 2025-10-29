const { asyncHandler } = require('../middleware/errorHandler');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

exports.testSlackNotification = asyncHandler(async (req, res) => {
  const testMessage = `
*Test Notification from DevMonitor*

This is a test message to verify Slack integration is working correctly.

*Timestamp:* ${new Date().toLocaleString()}
*Status:* ✅ Slack integration active
  `.trim();

  await notificationService.sendSlackNotification(testMessage, 'INFO');

  res.json({
    success: true,
    message: 'Test Slack notification sent successfully',
    timestamp: new Date().toISOString()
  });
});

exports.testTelegramNotification = asyncHandler(async (req, res) => {
  const testMessage = `
*Test Notification from DevMonitor*

This is a test message to verify Telegram integration is working correctly.

*Timestamp:* ${new Date().toLocaleString()}
*Status:* ✅ Telegram integration active
  `.trim();

  await notificationService.sendTelegramNotification(testMessage, 'INFO');

  res.json({
    success: true,
    message: 'Test Telegram notification sent successfully',
    timestamp: new Date().toISOString()
  });
});

exports.sendCustomNotification = asyncHandler(async (req, res) => {
  const { message, severity, channels } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Message is required'
    });
  }

  const validSeverity = ['INFO', 'WARNING', 'CRITICAL'].includes(severity) ? severity : 'INFO';
  const notificationChannels = channels || ['slack', 'telegram', 'dashboard'];

  const results = {};

  for (const channel of notificationChannels) {
    try {
      switch (channel) {
        case 'slack':
          await notificationService.sendSlackNotification(message, validSeverity);
          results.slack = { success: true, message: 'Sent successfully' };
          break;
        case 'telegram':
          await notificationService.sendTelegramNotification(message, validSeverity);
          results.telegram = { success: true, message: 'Sent successfully' };
          break;
        case 'dashboard':
          await notificationService.sendDashboardNotification({
            message,
            severity: validSeverity,
            timestamp: new Date().toISOString()
          });
          results.dashboard = { success: true, message: 'Sent successfully' };
          break;
        default:
          results[channel] = { success: false, message: 'Unknown channel' };
      }
    } catch (error) {
      logger.error(`Failed to send notification to ${channel}:`, error);
      results[channel] = { success: false, message: error.message };
    }
  }

  res.json({
    success: true,
    message: 'Notifications processed',
    results,
    timestamp: new Date().toISOString()
  });
});

exports.getNotificationStatus = asyncHandler(async (req, res) => {
  const status = {
    slack: {
      enabled: process.env.SLACK_ENABLED === 'true',
      configured: !!process.env.SLACK_WEBHOOK_URL
    },
    telegram: {
      enabled: process.env.TELEGRAM_ENABLED === 'true',
      configured: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)
    },
    email: {
      enabled: process.env.EMAIL_ENABLED === 'true',
      configured: !!(process.env.EMAIL_HOST && process.env.EMAIL_USER)
    }
  };

  res.json({
    success: true,
    data: status,
    timestamp: new Date().toISOString()
  });
});

module.exports = exports;
