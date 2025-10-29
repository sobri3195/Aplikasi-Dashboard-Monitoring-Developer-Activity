const { PrismaClient } = require('@prisma/client');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const prisma = new PrismaClient();

/**
 * Generate 2FA secret for user
 */
exports.generateSecret = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `DevMonitor (${user.email})`,
      issuer: 'DevMonitor'
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      otpauthUrl: secret.otpauth_url
    });
  } catch (error) {
    console.error('Generate 2FA secret error:', error);
    res.status(500).json({ error: 'Failed to generate 2FA secret' });
  }
};

/**
 * Enable 2FA for user
 */
exports.enable2FA = async (req, res) => {
  try {
    const { secret, token } = req.body;
    const userId = req.user.id;

    if (!secret || !token) {
      return res.status(400).json({ error: 'Secret and token are required' });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    // Enable 2FA for user
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret
      }
    });

    res.json({ 
      success: true, 
      message: 'Two-factor authentication enabled successfully' 
    });
  } catch (error) {
    console.error('Enable 2FA error:', error);
    res.status(500).json({ error: 'Failed to enable 2FA' });
  }
};

/**
 * Disable 2FA for user
 */
exports.disable2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true }
    });

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA is not enabled' });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null
      }
    });

    res.json({ 
      success: true, 
      message: 'Two-factor authentication disabled successfully' 
    });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
};

/**
 * Verify 2FA token
 */
exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true }
    });

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA is not enabled' });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    res.json({ 
      success: true, 
      verified: true 
    });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({ error: 'Failed to verify 2FA token' });
  }
};

/**
 * Get 2FA status
 */
exports.get2FAStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true }
    });

    res.json({ 
      enabled: user?.twoFactorEnabled || false 
    });
  } catch (error) {
    console.error('Get 2FA status error:', error);
    res.status(500).json({ error: 'Failed to get 2FA status' });
  }
};
