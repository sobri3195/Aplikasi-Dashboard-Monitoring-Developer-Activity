const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all whitelisted IPs
 */
exports.getWhitelist = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [ips, total] = await Promise.all([
      prisma.ipWhitelist.findMany({
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.ipWhitelist.count()
    ]);

    res.json({
      whitelist: ips,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get whitelist error:', error);
    res.status(500).json({ error: 'Failed to fetch whitelist' });
  }
};

/**
 * Add IP to whitelist
 */
exports.addToWhitelist = async (req, res) => {
  try {
    const { ipAddress, description } = req.body;
    const createdBy = req.user.id;

    if (!ipAddress) {
      return res.status(400).json({ error: 'IP address is required' });
    }

    // Check if IP already exists
    const existing = await prisma.ipWhitelist.findUnique({
      where: { ipAddress }
    });

    if (existing) {
      return res.status(400).json({ error: 'IP address already in whitelist' });
    }

    const whitelistEntry = await prisma.ipWhitelist.create({
      data: {
        ipAddress,
        description,
        createdBy
      }
    });

    res.status(201).json({
      success: true,
      whitelist: whitelistEntry
    });
  } catch (error) {
    console.error('Add to whitelist error:', error);
    res.status(500).json({ error: 'Failed to add IP to whitelist' });
  }
};

/**
 * Remove IP from whitelist
 */
exports.removeFromWhitelist = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.ipWhitelist.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'IP removed from whitelist'
    });
  } catch (error) {
    console.error('Remove from whitelist error:', error);
    res.status(500).json({ error: 'Failed to remove IP from whitelist' });
  }
};

/**
 * Get all blacklisted IPs
 */
exports.getBlacklist = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [ips, total] = await Promise.all([
      prisma.ipBlacklist.findMany({
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.ipBlacklist.count()
    ]);

    res.json({
      blacklist: ips,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get blacklist error:', error);
    res.status(500).json({ error: 'Failed to fetch blacklist' });
  }
};

/**
 * Add IP to blacklist
 */
exports.addToBlacklist = async (req, res) => {
  try {
    const { ipAddress, reason } = req.body;
    const createdBy = req.user.id;

    if (!ipAddress) {
      return res.status(400).json({ error: 'IP address is required' });
    }

    // Check if IP already exists
    const existing = await prisma.ipBlacklist.findUnique({
      where: { ipAddress }
    });

    if (existing) {
      return res.status(400).json({ error: 'IP address already in blacklist' });
    }

    const blacklistEntry = await prisma.ipBlacklist.create({
      data: {
        ipAddress,
        reason,
        createdBy
      }
    });

    res.status(201).json({
      success: true,
      blacklist: blacklistEntry
    });
  } catch (error) {
    console.error('Add to blacklist error:', error);
    res.status(500).json({ error: 'Failed to add IP to blacklist' });
  }
};

/**
 * Remove IP from blacklist
 */
exports.removeFromBlacklist = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.ipBlacklist.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'IP removed from blacklist'
    });
  } catch (error) {
    console.error('Remove from blacklist error:', error);
    res.status(500).json({ error: 'Failed to remove IP from blacklist' });
  }
};

/**
 * Check if IP is allowed
 */
exports.checkIpAccess = async (req, res) => {
  try {
    const { ipAddress } = req.params;

    // Check blacklist first
    const blacklisted = await prisma.ipBlacklist.findUnique({
      where: { ipAddress, isActive: true }
    });

    if (blacklisted) {
      return res.json({
        allowed: false,
        reason: 'IP is blacklisted',
        details: blacklisted
      });
    }

    // Check whitelist
    const whitelisted = await prisma.ipWhitelist.findUnique({
      where: { ipAddress, isActive: true }
    });

    res.json({
      allowed: !!whitelisted,
      whitelisted: !!whitelisted,
      blacklisted: false
    });
  } catch (error) {
    console.error('Check IP access error:', error);
    res.status(500).json({ error: 'Failed to check IP access' });
  }
};

/**
 * Toggle IP whitelist/blacklist status
 */
exports.toggleWhitelistStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await prisma.ipWhitelist.findUnique({
      where: { id }
    });

    if (!entry) {
      return res.status(404).json({ error: 'Whitelist entry not found' });
    }

    const updated = await prisma.ipWhitelist.update({
      where: { id },
      data: { isActive: !entry.isActive }
    });

    res.json({
      success: true,
      whitelist: updated
    });
  } catch (error) {
    console.error('Toggle whitelist status error:', error);
    res.status(500).json({ error: 'Failed to toggle whitelist status' });
  }
};

exports.toggleBlacklistStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await prisma.ipBlacklist.findUnique({
      where: { id }
    });

    if (!entry) {
      return res.status(404).json({ error: 'Blacklist entry not found' });
    }

    const updated = await prisma.ipBlacklist.update({
      where: { id },
      data: { isActive: !entry.isActive }
    });

    res.json({
      success: true,
      blacklist: updated
    });
  } catch (error) {
    console.error('Toggle blacklist status error:', error);
    res.status(500).json({ error: 'Failed to toggle blacklist status' });
  }
};
