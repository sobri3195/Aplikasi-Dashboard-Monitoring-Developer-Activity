const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all email templates
 */
exports.getAllTemplates = async (req, res) => {
  try {
    const { isActive } = req.query;

    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: { updatedAt: 'desc' }
    });

    res.json({ templates });
  } catch (error) {
    console.error('Get email templates error:', error);
    res.status(500).json({ error: 'Failed to fetch email templates' });
  }
};

/**
 * Get template by key
 */
exports.getTemplateByKey = async (req, res) => {
  try {
    const { templateKey } = req.params;

    const template = await prisma.emailTemplate.findUnique({
      where: { templateKey }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ template });
  } catch (error) {
    console.error('Get email template error:', error);
    res.status(500).json({ error: 'Failed to fetch email template' });
  }
};

/**
 * Create email template
 */
exports.createTemplate = async (req, res) => {
  try {
    const { templateKey, subject, htmlContent, textContent, variables } = req.body;

    if (!templateKey || !subject || !htmlContent) {
      return res.status(400).json({ 
        error: 'Template key, subject, and HTML content are required' 
      });
    }

    // Check if template key already exists
    const existing = await prisma.emailTemplate.findUnique({
      where: { templateKey }
    });

    if (existing) {
      return res.status(400).json({ error: 'Template key already exists' });
    }

    const template = await prisma.emailTemplate.create({
      data: {
        templateKey,
        subject,
        htmlContent,
        textContent,
        variables: variables || {}
      }
    });

    res.status(201).json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Create email template error:', error);
    res.status(500).json({ error: 'Failed to create email template' });
  }
};

/**
 * Update email template
 */
exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, htmlContent, textContent, variables, isActive } = req.body;

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: {
        ...(subject && { subject }),
        ...(htmlContent && { htmlContent }),
        ...(textContent !== undefined && { textContent }),
        ...(variables && { variables }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Update email template error:', error);
    res.status(500).json({ error: 'Failed to update email template' });
  }
};

/**
 * Delete email template
 */
exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.emailTemplate.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Email template deleted successfully'
    });
  } catch (error) {
    console.error('Delete email template error:', error);
    res.status(500).json({ error: 'Failed to delete email template' });
  }
};

/**
 * Preview email template
 */
exports.previewTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { variables } = req.body;

    const template = await prisma.emailTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Replace variables in template
    let htmlContent = template.htmlContent;
    let subject = template.subject;

    if (variables) {
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        htmlContent = htmlContent.replace(regex, variables[key]);
        subject = subject.replace(regex, variables[key]);
      });
    }

    res.json({
      subject,
      htmlContent,
      textContent: template.textContent
    });
  } catch (error) {
    console.error('Preview email template error:', error);
    res.status(500).json({ error: 'Failed to preview email template' });
  }
};

/**
 * Send test email
 */
exports.sendTestEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, variables } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const template = await prisma.emailTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Replace variables in template
    let htmlContent = template.htmlContent;
    let subject = template.subject;

    if (variables) {
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        htmlContent = htmlContent.replace(regex, variables[key]);
        subject = subject.replace(regex, variables[key]);
      });
    }

    // TODO: Send email using notification service
    // await notificationService.sendEmail(email, subject, htmlContent);

    res.json({
      success: true,
      message: 'Test email sent successfully'
    });
  } catch (error) {
    console.error('Send test email error:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
};
