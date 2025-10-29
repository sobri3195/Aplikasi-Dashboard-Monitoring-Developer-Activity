const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all active sessions for current user
 */
exports.getUserSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await prisma.userSession.findMany({
      where: { 
        userId: userId,
        isActive: true,
        expiresAt: { gt: new Date() }
      },
      orderBy: { lastActivity: 'desc' },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        isActive: true,
        lastActivity: true,
        expiresAt: true,
        createdAt: true
      }
    });

    res.json({ sessions });
  } catch (error) {
    console.error('Get user sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};

/**
 * Get all sessions (admin only)
 */
exports.getAllSessions = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      expiresAt: { gt: new Date() }
    };

    if (userId) {
      where.userId = userId;
    }

    const [sessions, total] = await Promise.all([
      prisma.userSession.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { lastActivity: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true
            }
          }
        }
      }),
      prisma.userSession.count({ where })
    ]);

    res.json({
      sessions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};

/**
 * Terminate a specific session
 */
exports.terminateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    // Check if session exists and belongs to user (or user is admin)
    const session = await prisma.userSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.userId !== userId && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized to terminate this session' });
    }

    // Terminate session
    await prisma.userSession.update({
      where: { id: sessionId },
      data: { isActive: false }
    });

    res.json({ 
      success: true, 
      message: 'Session terminated successfully' 
    });
  } catch (error) {
    console.error('Terminate session error:', error);
    res.status(500).json({ error: 'Failed to terminate session' });
  }
};

/**
 * Terminate all sessions except current
 */
exports.terminateOtherSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentToken = req.headers.authorization?.replace('Bearer ', '');

    await prisma.userSession.updateMany({
      where: {
        userId: userId,
        token: { not: currentToken },
        isActive: true
      },
      data: { isActive: false }
    });

    res.json({ 
      success: true, 
      message: 'All other sessions terminated successfully' 
    });
  } catch (error) {
    console.error('Terminate other sessions error:', error);
    res.status(500).json({ error: 'Failed to terminate sessions' });
  }
};

/**
 * Get session statistics
 */
exports.getSessionStats = async (req, res) => {
  try {
    const totalActive = await prisma.userSession.count({
      where: {
        isActive: true,
        expiresAt: { gt: new Date() }
      }
    });

    const totalExpired = await prisma.userSession.count({
      where: {
        expiresAt: { lte: new Date() }
      }
    });

    const totalInactive = await prisma.userSession.count({
      where: { isActive: false }
    });

    const activeUsers = await prisma.userSession.groupBy({
      by: ['userId'],
      where: {
        isActive: true,
        expiresAt: { gt: new Date() }
      }
    });

    res.json({
      totalActive,
      totalExpired,
      totalInactive,
      activeUsers: activeUsers.length
    });
  } catch (error) {
    console.error('Get session stats error:', error);
    res.status(500).json({ error: 'Failed to fetch session statistics' });
  }
};

/**
 * Clean up expired sessions
 */
exports.cleanupExpiredSessions = async (req, res) => {
  try {
    const result = await prisma.userSession.deleteMany({
      where: {
        OR: [
          { expiresAt: { lte: new Date() } },
          { isActive: false }
        ]
      }
    });

    res.json({ 
      success: true, 
      deleted: result.count,
      message: `Cleaned up ${result.count} expired sessions` 
    });
  } catch (error) {
    console.error('Cleanup sessions error:', error);
    res.status(500).json({ error: 'Failed to cleanup sessions' });
  }
};
