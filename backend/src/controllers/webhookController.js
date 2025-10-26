const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const crypto = require('crypto');

const prisma = new PrismaClient();

const verifyGitLabSignature = (req) => {
  const token = req.headers['x-gitlab-token'];
  const expectedToken = process.env.GITLAB_WEBHOOK_SECRET;

  if (!token || token !== expectedToken) {
    throw new AppError('Invalid webhook signature', 401);
  }
};

exports.handleGitLabWebhook = asyncHandler(async (req, res) => {
  verifyGitLabSignature(req);

  const eventType = req.headers['x-gitlab-event'];
  const payload = req.body;

  logger.info(`Received GitLab webhook: ${eventType}`);

  switch (eventType) {
    case 'Push Hook':
      await handlePushEvent(payload);
      break;
    case 'Merge Request Hook':
      await handleMergeRequestEvent(payload);
      break;
    default:
      logger.info(`Unhandled GitLab event: ${eventType}`);
  }

  res.json({
    success: true,
    message: 'Webhook processed successfully'
  });
});

async function handlePushEvent(payload) {
  const { user_email, user_name, project, commits, ref } = payload;

  try {
    const user = await prisma.user.findUnique({
      where: { email: user_email }
    });

    if (!user) {
      logger.warn(`GitLab push event from unknown user: ${user_email}`);
      return;
    }

    const devices = await prisma.device.findMany({
      where: { userId: user.id, isAuthorized: true },
      orderBy: { lastSeen: 'desc' },
      take: 1
    });

    const device = devices[0];

    if (!device) {
      logger.warn(`No authorized device found for user: ${user_email}`);
      return;
    }

    for (const commit of commits) {
      await prisma.activity.create({
        data: {
          userId: user.id,
          deviceId: device.id,
          activityType: 'GIT_PUSH',
          repository: project.name,
          branch: ref.replace('refs/heads/', ''),
          commitHash: commit.id,
          details: {
            message: commit.message,
            author: commit.author.name,
            timestamp: commit.timestamp,
            url: commit.url
          }
        }
      });
    }

    await prisma.repository.upsert({
      where: { gitlabProjectId: project.id },
      update: {
        lastActivity: new Date()
      },
      create: {
        name: project.name,
        gitlabUrl: project.web_url,
        gitlabProjectId: project.id,
        lastActivity: new Date()
      }
    });

    logger.info(`Processed push event: ${commits.length} commits to ${project.name}`);
  } catch (error) {
    logger.error('Error handling push event:', error.message);
  }
}

async function handleMergeRequestEvent(payload) {
  const { user, project, object_attributes } = payload;

  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    });

    if (!dbUser) {
      logger.warn(`GitLab MR event from unknown user: ${user.email}`);
      return;
    }

    logger.info(`Merge request ${object_attributes.action}: ${object_attributes.title}`);
  } catch (error) {
    logger.error('Error handling merge request event:', error.message);
  }
}

exports.testWebhook = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Webhook endpoint is working',
    timestamp: new Date().toISOString()
  });
});
