const axios = require('axios');
const logger = require('../utils/logger');
const { emitToDashboard } = require('./socketService');

class NotificationService {
  async sendSlackNotification(message, severity = 'info') {
    if (!process.env.SLACK_WEBHOOK_URL || process.env.SLACK_ENABLED !== 'true') {
      logger.warn('Slack notification skipped: not configured');
      return;
    }

    try {
      const color = this.getSeverityColor(severity);
      const payload = {
        attachments: [
          {
            color: color,
            title: '🔔 Developer Activity Alert',
            text: message,
            footer: 'DevMonitor',
            ts: Math.floor(Date.now() / 1000)
          }
        ]
      };

      await axios.post(process.env.SLACK_WEBHOOK_URL, payload);
      logger.info('Slack notification sent successfully');
    } catch (error) {
      logger.error('Failed to send Slack notification:', error.message);
    }
  }

  async sendWhatsAppNotification(message, phone) {
    if (!process.env.WHATSAPP_ENABLED || process.env.WHATSAPP_ENABLED !== 'true') {
      logger.warn('WhatsApp notification skipped: not configured');
      return;
    }

    try {
      await axios.post(
        process.env.WHATSAPP_API_URL,
        {
          phone: phone,
          message: message
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`
          }
        }
      );
      logger.info('WhatsApp notification sent successfully');
    } catch (error) {
      logger.error('Failed to send WhatsApp notification:', error.message);
    }
  }

  async sendDashboardNotification(data) {
    try {
      emitToDashboard('new-alert', data);
      logger.info('Dashboard notification sent successfully');
    } catch (error) {
      logger.error('Failed to send dashboard notification:', error.message);
    }
  }

  async notifyAll(alert, activity) {
    const message = this.formatAlertMessage(alert, activity);

    await Promise.all([
      this.sendSlackNotification(message, alert.severity),
      this.sendDashboardNotification({
        alert,
        activity,
        timestamp: new Date().toISOString()
      })
    ]);
  }

  formatAlertMessage(alert, activity) {
    const { alertType, severity, message } = alert;
    const { user, device, repository } = activity;

    return `
*Severity:* ${severity}
*Alert Type:* ${alertType}
*User:* ${user?.email || 'Unknown'}
*Device:* ${device?.deviceName || 'Unknown'}
*Repository:* ${repository || 'N/A'}
*Message:* ${message}
*Time:* ${new Date().toLocaleString()}
    `.trim();
  }

  getSeverityColor(severity) {
    const colors = {
      INFO: '#36a64f',
      WARNING: '#ff9800',
      CRITICAL: '#ff0000'
    };
    return colors[severity] || colors.INFO;
  }
}

module.exports = new NotificationService();
