const axios = require('axios');
const logger = require('../utils/logger');
const { emitToDashboard } = require('./socketService');
const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    this.emailTransporter = null;
    if (process.env.EMAIL_ENABLED === 'true') {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
  }

  async sendEmailNotification(to, subject, message, severity = 'info') {
    if (!this.emailTransporter) {
      logger.warn('Email notification skipped: not configured');
      return;
    }

    try {
      const htmlContent = this.formatEmailContent(subject, message, severity);
      
      await this.emailTransporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@devmonitor.com',
        to: to,
        subject: `[DevMonitor] ${subject}`,
        html: htmlContent,
      });

      logger.info(`Email notification sent to ${to}`);
    } catch (error) {
      logger.error('Failed to send email notification:', error.message);
    }
  }

  formatEmailContent(subject, message, severity) {
    const severityColors = {
      INFO: '#36a64f',
      WARNING: '#ff9800',
      CRITICAL: '#ff0000',
    };
    const color = severityColors[severity] || severityColors.INFO;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${color}; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f4f4f4; padding: 20px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔔 Developer Activity Alert</h2>
          </div>
          <div class="content">
            <h3>${subject}</h3>
            <p>${message}</p>
            <p><strong>Severity:</strong> ${severity}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <div class="footer">
            <p>This is an automated message from DevMonitor</p>
            <p>Please do not reply to this email</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

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
