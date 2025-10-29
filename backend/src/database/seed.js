require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@devmonitor.com' },
    update: {},
    create: {
      email: 'admin@devmonitor.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create developer user
  const devPassword = await bcrypt.hash('developer123', 12);
  const developer = await prisma.user.upsert({
    where: { email: 'developer@devmonitor.com' },
    update: {},
    create: {
      email: 'developer@devmonitor.com',
      name: 'Developer User',
      password: devPassword,
      role: 'DEVELOPER',
      isActive: true,
    },
  });
  console.log('✅ Developer user created:', developer.email);

  // Create viewer user
  const viewerPassword = await bcrypt.hash('viewer123', 12);
  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@devmonitor.com' },
    update: {},
    create: {
      email: 'viewer@devmonitor.com',
      name: 'Viewer User',
      password: viewerPassword,
      role: 'VIEWER',
      isActive: true,
    },
  });
  console.log('✅ Viewer user created:', viewer.email);

  // Create additional dummy users
  const johnPassword = await bcrypt.hash('john123', 12);
  const john = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      name: 'John Doe',
      password: johnPassword,
      role: 'DEVELOPER',
      isActive: true,
    },
  });
  console.log('✅ John Doe user created:', john.email);

  const janePassword = await bcrypt.hash('jane123', 12);
  const jane = await prisma.user.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      password: janePassword,
      role: 'DEVELOPER',
      isActive: true,
    },
  });
  console.log('✅ Jane Smith user created:', jane.email);

  const alexPassword = await bcrypt.hash('alex123', 12);
  const alex = await prisma.user.upsert({
    where: { email: 'alex.johnson@example.com' },
    update: {},
    create: {
      email: 'alex.johnson@example.com',
      name: 'Alex Johnson',
      password: alexPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Alex Johnson user created:', alex.email);

  // Create more developers
  const mikePassword = await bcrypt.hash('mike123', 12);
  const mike = await prisma.user.upsert({
    where: { email: 'mike.chen@example.com' },
    update: {},
    create: {
      email: 'mike.chen@example.com',
      name: 'Mike Chen',
      password: mikePassword,
      role: 'DEVELOPER',
      isActive: true,
    },
  });
  console.log('✅ Mike Chen user created:', mike.email);

  const sarahPassword = await bcrypt.hash('sarah123', 12);
  const sarah = await prisma.user.upsert({
    where: { email: 'sarah.williams@example.com' },
    update: {},
    create: {
      email: 'sarah.williams@example.com',
      name: 'Sarah Williams',
      password: sarahPassword,
      role: 'DEVELOPER',
      isActive: true,
    },
  });
  console.log('✅ Sarah Williams user created:', sarah.email);

  const davidPassword = await bcrypt.hash('david123', 12);
  const david = await prisma.user.upsert({
    where: { email: 'david.martinez@example.com' },
    update: {},
    create: {
      email: 'david.martinez@example.com',
      name: 'David Martinez',
      password: davidPassword,
      role: 'DEVELOPER',
      isActive: true,
    },
  });
  console.log('✅ David Martinez user created:', david.email);

  const emilyPassword = await bcrypt.hash('emily123', 12);
  const emily = await prisma.user.upsert({
    where: { email: 'emily.taylor@example.com' },
    update: {},
    create: {
      email: 'emily.taylor@example.com',
      name: 'Emily Taylor',
      password: emilyPassword,
      role: 'DEVELOPER',
      isActive: true,
    },
  });
  console.log('✅ Emily Taylor user created:', emily.email);

  // Create sample devices
  const device = await prisma.device.create({
    data: {
      userId: developer.id,
      deviceName: 'Developer Laptop',
      fingerprint: 'sample-fingerprint-123456',
      hostname: 'dev-laptop-001',
      macAddress: '00:1B:44:11:3A:B7',
      cpuInfo: 'Intel Core i7-9750H',
      osInfo: 'Ubuntu 22.04 LTS',
      ipAddress: '192.168.1.100',
      status: 'APPROVED',
      isAuthorized: true,
      lastSeen: new Date(),
    },
  });
  console.log('✅ Sample device created:', device.deviceName);

  const johnDevice = await prisma.device.create({
    data: {
      userId: john.id,
      deviceName: 'John MacBook Pro',
      fingerprint: 'john-fingerprint-789012',
      hostname: 'john-macbook',
      macAddress: '00:1B:44:11:3A:C8',
      cpuInfo: 'Apple M1 Pro',
      osInfo: 'macOS Ventura 13.0',
      ipAddress: '192.168.1.101',
      status: 'APPROVED',
      isAuthorized: true,
      lastSeen: new Date(),
    },
  });
  console.log('✅ John device created:', johnDevice.deviceName);

  const janeDevice = await prisma.device.create({
    data: {
      userId: jane.id,
      deviceName: 'Jane Dell XPS',
      fingerprint: 'jane-fingerprint-345678',
      hostname: 'jane-dell-xps',
      macAddress: '00:1B:44:11:3A:D9',
      cpuInfo: 'Intel Core i9-11900H',
      osInfo: 'Windows 11 Pro',
      ipAddress: '192.168.1.102',
      status: 'APPROVED',
      isAuthorized: true,
      lastSeen: new Date(),
    },
  });
  console.log('✅ Jane device created:', janeDevice.deviceName);

  const mikeDevice = await prisma.device.create({
    data: {
      userId: mike.id,
      deviceName: 'Mike ThinkPad X1',
      fingerprint: 'mike-fingerprint-456789',
      hostname: 'mike-thinkpad',
      macAddress: '00:1B:44:11:3A:E1',
      cpuInfo: 'Intel Core i7-1165G7',
      osInfo: 'Ubuntu 20.04 LTS',
      ipAddress: '192.168.1.103',
      status: 'APPROVED',
      isAuthorized: true,
      lastSeen: new Date(),
    },
  });
  console.log('✅ Mike device created:', mikeDevice.deviceName);

  const sarahDevice = await prisma.device.create({
    data: {
      userId: sarah.id,
      deviceName: 'Sarah MacBook Air',
      fingerprint: 'sarah-fingerprint-567890',
      hostname: 'sarah-macbook',
      macAddress: '00:1B:44:11:3A:F2',
      cpuInfo: 'Apple M2',
      osInfo: 'macOS Monterey 12.5',
      ipAddress: '192.168.1.104',
      status: 'APPROVED',
      isAuthorized: true,
      lastSeen: new Date(),
    },
  });
  console.log('✅ Sarah device created:', sarahDevice.deviceName);

  const davidDevice = await prisma.device.create({
    data: {
      userId: david.id,
      deviceName: 'David HP Spectre',
      fingerprint: 'david-fingerprint-678901',
      hostname: 'david-hp',
      macAddress: '00:1B:44:11:3A:G3',
      cpuInfo: 'Intel Core i5-1135G7',
      osInfo: 'Windows 10 Pro',
      ipAddress: '192.168.1.105',
      status: 'APPROVED',
      isAuthorized: true,
      lastSeen: new Date(),
    },
  });
  console.log('✅ David device created:', davidDevice.deviceName);

  const emilyDevice = await prisma.device.create({
    data: {
      userId: emily.id,
      deviceName: 'Emily Asus ROG',
      fingerprint: 'emily-fingerprint-789012',
      hostname: 'emily-asus',
      macAddress: '00:1B:44:11:3A:H4',
      cpuInfo: 'AMD Ryzen 7 5800H',
      osInfo: 'Windows 11 Pro',
      ipAddress: '192.168.1.106',
      status: 'APPROVED',
      isAuthorized: true,
      lastSeen: new Date(),
    },
  });
  console.log('✅ Emily device created:', emilyDevice.deviceName);

  // Create pending/suspicious devices
  const unknownDevice1 = await prisma.device.create({
    data: {
      userId: john.id,
      deviceName: 'Unknown Device',
      fingerprint: 'unknown-fingerprint-111111',
      hostname: 'unknown-laptop',
      macAddress: '00:1B:44:11:3A:Z9',
      cpuInfo: 'Intel Core i5',
      osInfo: 'Windows 10',
      ipAddress: '203.0.113.45',
      status: 'PENDING',
      isAuthorized: false,
      lastSeen: new Date(Date.now() - 3600000),
    },
  });
  console.log('✅ Unknown device 1 created:', unknownDevice1.deviceName);

  const suspiciousDevice = await prisma.device.create({
    data: {
      userId: jane.id,
      deviceName: 'Suspicious Device',
      fingerprint: 'suspicious-fingerprint-222222',
      hostname: 'suspicious-pc',
      macAddress: '00:1B:44:11:3A:Y8',
      cpuInfo: 'Intel Core i3',
      osInfo: 'Linux Mint',
      ipAddress: '198.51.100.67',
      status: 'REJECTED',
      isAuthorized: false,
      lastSeen: new Date(Date.now() - 7200000),
    },
  });
  console.log('✅ Suspicious device created:', suspiciousDevice.deviceName);

  // Create sample repositories
  const repositories = await prisma.repository.createMany({
    data: [
      {
        name: 'sample-project',
        gitlabUrl: 'https://gitlab.com/company/sample-project',
        gitlabProjectId: 12345,
        securityStatus: 'SECURE',
        lastActivity: new Date(),
        isEncrypted: false,
      },
      {
        name: 'backend-api',
        gitlabUrl: 'https://gitlab.com/company/backend-api',
        gitlabProjectId: 12346,
        securityStatus: 'SECURE',
        lastActivity: new Date(Date.now() - 3600000 * 2),
        isEncrypted: false,
      },
      {
        name: 'frontend-app',
        gitlabUrl: 'https://gitlab.com/company/frontend-app',
        gitlabProjectId: 12347,
        securityStatus: 'SECURE',
        lastActivity: new Date(Date.now() - 3600000 * 5),
        isEncrypted: false,
      },
      {
        name: 'mobile-app',
        gitlabUrl: 'https://gitlab.com/company/mobile-app',
        gitlabProjectId: 12348,
        securityStatus: 'WARNING',
        lastActivity: new Date(Date.now() - 3600000 * 12),
        isEncrypted: false,
      },
      {
        name: 'data-pipeline',
        gitlabUrl: 'https://gitlab.com/company/data-pipeline',
        gitlabProjectId: 12349,
        securityStatus: 'SECURE',
        lastActivity: new Date(Date.now() - 3600000 * 24),
        isEncrypted: false,
      },
      {
        name: 'ml-models',
        gitlabUrl: 'https://gitlab.com/company/ml-models',
        gitlabProjectId: 12350,
        securityStatus: 'SECURE',
        lastActivity: new Date(Date.now() - 3600000 * 48),
        isEncrypted: false,
      },
      {
        name: 'devops-scripts',
        gitlabUrl: 'https://gitlab.com/company/devops-scripts',
        gitlabProjectId: 12351,
        securityStatus: 'SECURE',
        lastActivity: new Date(Date.now() - 3600000 * 72),
        isEncrypted: false,
      },
      {
        name: 'confidential-project',
        gitlabUrl: 'https://gitlab.com/company/confidential-project',
        gitlabProjectId: 12352,
        securityStatus: 'ENCRYPTED',
        lastActivity: new Date(Date.now() - 3600000 * 1),
        isEncrypted: true,
        encryptedAt: new Date(Date.now() - 3600000 * 1),
      },
    ],
  });
  console.log(`✅ ${repositories.count} repositories created`);

  // Create sample activities - Normal activities
  const normalActivities = await prisma.activity.createMany({
    data: [
      // Developer activities
      {
        userId: developer.id,
        deviceId: device.id,
        activityType: 'LOGIN',
        ipAddress: '192.168.1.100',
        location: 'Jakarta, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 96),
      },
      {
        userId: developer.id,
        deviceId: device.id,
        activityType: 'GIT_CLONE',
        repository: 'sample-project',
        branch: 'main',
        ipAddress: '192.168.1.100',
        location: 'Jakarta, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 90),
      },
      {
        userId: developer.id,
        deviceId: device.id,
        activityType: 'GIT_PULL',
        repository: 'sample-project',
        branch: 'main',
        ipAddress: '192.168.1.100',
        location: 'Jakarta, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 72),
      },
      {
        userId: developer.id,
        deviceId: device.id,
        activityType: 'GIT_COMMIT',
        repository: 'sample-project',
        branch: 'feature/new-feature',
        commitHash: 'abc123def456',
        ipAddress: '192.168.1.100',
        location: 'Jakarta, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 48),
      },
      {
        userId: developer.id,
        deviceId: device.id,
        activityType: 'GIT_PUSH',
        repository: 'sample-project',
        branch: 'feature/new-feature',
        commitHash: 'abc123def456',
        ipAddress: '192.168.1.100',
        location: 'Jakarta, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 47),
      },
      
      // John activities
      {
        userId: john.id,
        deviceId: johnDevice.id,
        activityType: 'LOGIN',
        ipAddress: '192.168.1.101',
        location: 'Surabaya, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 84),
      },
      {
        userId: john.id,
        deviceId: johnDevice.id,
        activityType: 'GIT_CLONE',
        repository: 'backend-api',
        branch: 'main',
        ipAddress: '192.168.1.101',
        location: 'Surabaya, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 80),
      },
      {
        userId: john.id,
        deviceId: johnDevice.id,
        activityType: 'GIT_PULL',
        repository: 'backend-api',
        branch: 'main',
        ipAddress: '192.168.1.101',
        location: 'Surabaya, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 60),
      },
      {
        userId: john.id,
        deviceId: johnDevice.id,
        activityType: 'GIT_CHECKOUT',
        repository: 'backend-api',
        branch: 'feature/api-enhancement',
        ipAddress: '192.168.1.101',
        location: 'Surabaya, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 36),
      },
      {
        userId: john.id,
        deviceId: johnDevice.id,
        activityType: 'GIT_COMMIT',
        repository: 'backend-api',
        branch: 'feature/api-enhancement',
        commitHash: 'def789ghi012',
        ipAddress: '192.168.1.101',
        location: 'Surabaya, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 24),
      },
      {
        userId: john.id,
        deviceId: johnDevice.id,
        activityType: 'GIT_PUSH',
        repository: 'backend-api',
        branch: 'feature/api-enhancement',
        commitHash: 'def789ghi012',
        ipAddress: '192.168.1.101',
        location: 'Surabaya, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 23),
      },
      
      // Jane activities
      {
        userId: jane.id,
        deviceId: janeDevice.id,
        activityType: 'LOGIN',
        ipAddress: '192.168.1.102',
        location: 'Bandung, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 100),
      },
      {
        userId: jane.id,
        deviceId: janeDevice.id,
        activityType: 'GIT_CLONE',
        repository: 'frontend-app',
        branch: 'main',
        ipAddress: '192.168.1.102',
        location: 'Bandung, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 95),
      },
      {
        userId: jane.id,
        deviceId: janeDevice.id,
        activityType: 'GIT_PULL',
        repository: 'frontend-app',
        branch: 'develop',
        ipAddress: '192.168.1.102',
        location: 'Bandung, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 72),
      },
      {
        userId: jane.id,
        deviceId: janeDevice.id,
        activityType: 'GIT_CHECKOUT',
        repository: 'frontend-app',
        branch: 'feature/ui-redesign',
        ipAddress: '192.168.1.102',
        location: 'Bandung, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 48),
      },
      {
        userId: jane.id,
        deviceId: janeDevice.id,
        activityType: 'GIT_COMMIT',
        repository: 'frontend-app',
        branch: 'feature/ui-redesign',
        commitHash: 'ghi345jkl678',
        ipAddress: '192.168.1.102',
        location: 'Bandung, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 24),
      },
      {
        userId: jane.id,
        deviceId: janeDevice.id,
        activityType: 'GIT_PUSH',
        repository: 'frontend-app',
        branch: 'feature/ui-redesign',
        commitHash: 'ghi345jkl678',
        ipAddress: '192.168.1.102',
        location: 'Bandung, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 23),
      },

      // Mike activities
      {
        userId: mike.id,
        deviceId: mikeDevice.id,
        activityType: 'LOGIN',
        ipAddress: '192.168.1.103',
        location: 'Yogyakarta, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 75),
      },
      {
        userId: mike.id,
        deviceId: mikeDevice.id,
        activityType: 'GIT_CLONE',
        repository: 'mobile-app',
        branch: 'main',
        ipAddress: '192.168.1.103',
        location: 'Yogyakarta, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 70),
      },
      {
        userId: mike.id,
        deviceId: mikeDevice.id,
        activityType: 'GIT_PULL',
        repository: 'mobile-app',
        branch: 'main',
        ipAddress: '192.168.1.103',
        location: 'Yogyakarta, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 50),
      },
      {
        userId: mike.id,
        deviceId: mikeDevice.id,
        activityType: 'GIT_COMMIT',
        repository: 'mobile-app',
        branch: 'feature/push-notifications',
        commitHash: 'jkl901mno234',
        ipAddress: '192.168.1.103',
        location: 'Yogyakarta, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 12),
      },

      // Sarah activities
      {
        userId: sarah.id,
        deviceId: sarahDevice.id,
        activityType: 'LOGIN',
        ipAddress: '192.168.1.104',
        location: 'Bali, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 65),
      },
      {
        userId: sarah.id,
        deviceId: sarahDevice.id,
        activityType: 'GIT_CLONE',
        repository: 'data-pipeline',
        branch: 'main',
        ipAddress: '192.168.1.104',
        location: 'Bali, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 60),
      },
      {
        userId: sarah.id,
        deviceId: sarahDevice.id,
        activityType: 'GIT_PULL',
        repository: 'data-pipeline',
        branch: 'develop',
        ipAddress: '192.168.1.104',
        location: 'Bali, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 36),
      },

      // David activities
      {
        userId: david.id,
        deviceId: davidDevice.id,
        activityType: 'LOGIN',
        ipAddress: '192.168.1.105',
        location: 'Medan, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 55),
      },
      {
        userId: david.id,
        deviceId: davidDevice.id,
        activityType: 'GIT_CLONE',
        repository: 'ml-models',
        branch: 'main',
        ipAddress: '192.168.1.105',
        location: 'Medan, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 50),
      },

      // Emily activities
      {
        userId: emily.id,
        deviceId: emilyDevice.id,
        activityType: 'LOGIN',
        ipAddress: '192.168.1.106',
        location: 'Semarang, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 45),
      },
      {
        userId: emily.id,
        deviceId: emilyDevice.id,
        activityType: 'GIT_CLONE',
        repository: 'devops-scripts',
        branch: 'main',
        ipAddress: '192.168.1.106',
        location: 'Semarang, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 40),
      },
      {
        userId: emily.id,
        deviceId: emilyDevice.id,
        activityType: 'GIT_COMMIT',
        repository: 'devops-scripts',
        branch: 'feature/ci-improvements',
        commitHash: 'pqr567stu890',
        ipAddress: '192.168.1.106',
        location: 'Semarang, Indonesia',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 8),
      },
    ],
  });
  console.log(`✅ ${normalActivities.count} normal activities created`);

  // Create suspicious activities
  const suspiciousActivity1 = await prisma.activity.create({
    data: {
      userId: john.id,
      deviceId: unknownDevice1.id,
      activityType: 'UNAUTHORIZED_ACCESS',
      repository: 'backend-api',
      branch: 'main',
      ipAddress: '203.0.113.45',
      location: 'Singapore',
      riskLevel: 'HIGH',
      isSuspicious: true,
      details: {
        reason: 'Access from unauthorized device',
        deviceFingerprint: 'unknown-fingerprint-111111',
      },
      timestamp: new Date(Date.now() - 3600000 * 2),
    },
  });
  console.log('✅ Suspicious activity 1 created');

  const suspiciousActivity2 = await prisma.activity.create({
    data: {
      userId: jane.id,
      deviceId: suspiciousDevice.id,
      activityType: 'REPO_COPY',
      repository: 'confidential-project',
      branch: 'main',
      ipAddress: '198.51.100.67',
      location: 'United States',
      riskLevel: 'CRITICAL',
      isSuspicious: true,
      details: {
        reason: 'Attempt to copy repository to external device',
        action: 'Repository encrypted automatically',
      },
      timestamp: new Date(Date.now() - 3600000 * 1),
    },
  });
  console.log('✅ Suspicious activity 2 created');

  const suspiciousActivity3 = await prisma.activity.create({
    data: {
      userId: mike.id,
      deviceId: null,
      activityType: 'UNAUTHORIZED_ACCESS',
      repository: 'mobile-app',
      ipAddress: '185.220.100.240',
      location: 'Russia',
      riskLevel: 'CRITICAL',
      isSuspicious: true,
      details: {
        reason: 'Access from unknown location and unregistered device',
        action: 'Access blocked',
      },
      timestamp: new Date(Date.now() - 3600000 * 6),
    },
  });
  console.log('✅ Suspicious activity 3 created');

  const suspiciousActivity4 = await prisma.activity.create({
    data: {
      userId: david.id,
      deviceId: davidDevice.id,
      activityType: 'GIT_CLONE',
      repository: 'ml-models',
      branch: 'main',
      ipAddress: '192.51.100.15',
      location: 'Vietnam',
      riskLevel: 'MEDIUM',
      isSuspicious: true,
      details: {
        reason: 'Unusual location detected',
        note: 'User normally works from Medan, Indonesia',
      },
      timestamp: new Date(Date.now() - 3600000 * 18),
    },
  });
  console.log('✅ Suspicious activity 4 created');

  // Create alerts for suspicious activities
  const alert1 = await prisma.alert.create({
    data: {
      activityId: suspiciousActivity1.id,
      alertType: 'UNAUTHORIZED_DEVICE',
      severity: 'CRITICAL',
      message: 'Unauthorized device attempted to access backend-api repository',
      notified: true,
      notifiedAt: new Date(Date.now() - 3600000 * 2),
    },
  });
  console.log('✅ Alert 1 created');

  const alert2 = await prisma.alert.create({
    data: {
      activityId: suspiciousActivity2.id,
      alertType: 'REPO_COPY_DETECTED',
      severity: 'CRITICAL',
      message: 'Attempt to copy confidential-project repository detected. Repository has been encrypted.',
      notified: true,
      notifiedAt: new Date(Date.now() - 3600000 * 1),
    },
  });
  console.log('✅ Alert 2 created');

  const alert3 = await prisma.alert.create({
    data: {
      activityId: suspiciousActivity3.id,
      alertType: 'SUSPICIOUS_ACTIVITY',
      severity: 'CRITICAL',
      message: 'Access attempt from Russia blocked. Unregistered device detected.',
      notified: true,
      notifiedAt: new Date(Date.now() - 3600000 * 6),
    },
  });
  console.log('✅ Alert 3 created');

  const alert4 = await prisma.alert.create({
    data: {
      activityId: suspiciousActivity4.id,
      alertType: 'UNUSUAL_LOCATION',
      severity: 'WARNING',
      message: 'David Martinez accessed repository from unusual location (Vietnam)',
      notified: true,
      notifiedAt: new Date(Date.now() - 3600000 * 18),
      isResolved: true,
      resolvedAt: new Date(Date.now() - 3600000 * 10),
      resolvedBy: admin.id,
    },
  });
  console.log('✅ Alert 4 created');

  // Create audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'DEVICE_APPROVED',
        entity: 'Device',
        entityId: device.id,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        changes: { status: 'APPROVED', isAuthorized: true },
        timestamp: new Date(Date.now() - 3600000 * 100),
      },
      {
        userId: admin.id,
        action: 'DEVICE_APPROVED',
        entity: 'Device',
        entityId: johnDevice.id,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        changes: { status: 'APPROVED', isAuthorized: true },
        timestamp: new Date(Date.now() - 3600000 * 90),
      },
      {
        userId: admin.id,
        action: 'DEVICE_APPROVED',
        entity: 'Device',
        entityId: janeDevice.id,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        changes: { status: 'APPROVED', isAuthorized: true },
        timestamp: new Date(Date.now() - 3600000 * 85),
      },
      {
        userId: alex.id,
        action: 'DEVICE_REJECTED',
        entity: 'Device',
        entityId: suspiciousDevice.id,
        ipAddress: '192.168.1.50',
        userAgent: 'Mozilla/5.0',
        changes: { status: 'REJECTED', reason: 'Suspicious device fingerprint' },
        timestamp: new Date(Date.now() - 3600000 * 3),
      },
      {
        userId: admin.id,
        action: 'REPOSITORY_ENCRYPTED',
        entity: 'Repository',
        entityId: null,
        ipAddress: '192.168.1.1',
        userAgent: 'System',
        changes: {
          repository: 'confidential-project',
          reason: 'Unauthorized access attempt',
          encryptedAt: new Date(Date.now() - 3600000 * 1),
        },
        timestamp: new Date(Date.now() - 3600000 * 1),
      },
      {
        userId: admin.id,
        action: 'ALERT_RESOLVED',
        entity: 'Alert',
        entityId: alert4.id,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        changes: {
          isResolved: true,
          note: 'Verified with user - business trip to Vietnam',
        },
        timestamp: new Date(Date.now() - 3600000 * 10),
      },
      {
        userId: admin.id,
        action: 'USER_CREATED',
        entity: 'User',
        entityId: mike.id,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        changes: { email: 'mike.chen@example.com', role: 'DEVELOPER' },
        timestamp: new Date(Date.now() - 3600000 * 120),
      },
      {
        userId: alex.id,
        action: 'DEVICE_SUSPENDED',
        entity: 'Device',
        entityId: unknownDevice1.id,
        ipAddress: '192.168.1.50',
        userAgent: 'Mozilla/5.0',
        changes: {
          status: 'SUSPENDED',
          reason: 'Multiple unauthorized access attempts',
        },
        timestamp: new Date(Date.now() - 3600000 * 2),
      },
    ],
  });
  console.log('✅ Audit logs created');

  // Create system logs
  await prisma.systemLog.createMany({
    data: [
      {
        level: 'INFO',
        message: 'Application started successfully',
        source: 'system',
        metadata: { version: '1.0.0', port: 5000 },
        timestamp: new Date(Date.now() - 3600000 * 120),
      },
      {
        level: 'INFO',
        message: 'Database connection established',
        source: 'database',
        metadata: { host: 'localhost', database: 'devmonitor' },
        timestamp: new Date(Date.now() - 3600000 * 119),
      },
      {
        level: 'WARNING',
        message: 'Unauthorized access attempt detected',
        source: 'security',
        metadata: {
          userId: john.id,
          deviceId: unknownDevice1.id,
          ipAddress: '203.0.113.45',
        },
        timestamp: new Date(Date.now() - 3600000 * 2),
      },
      {
        level: 'CRITICAL',
        message: 'Repository copy attempt blocked and encrypted',
        source: 'security',
        metadata: {
          userId: jane.id,
          repository: 'confidential-project',
          action: 'encrypted',
        },
        timestamp: new Date(Date.now() - 3600000 * 1),
      },
      {
        level: 'ERROR',
        message: 'Failed to send Slack notification',
        source: 'notification',
        metadata: { error: 'Connection timeout', retry: true },
        timestamp: new Date(Date.now() - 3600000 * 5),
      },
      {
        level: 'WARNING',
        message: 'Unusual login location detected',
        source: 'security',
        metadata: {
          userId: david.id,
          location: 'Vietnam',
          expectedLocation: 'Medan, Indonesia',
        },
        timestamp: new Date(Date.now() - 3600000 * 18),
      },
      {
        level: 'INFO',
        message: 'Backup completed successfully',
        source: 'backup',
        metadata: { size: '250MB', duration: '45s' },
        timestamp: new Date(Date.now() - 3600000 * 24),
      },
    ],
  });
  console.log('✅ System logs created');

  // Create system performance records
  await prisma.systemPerformance.createMany({
    data: [
      {
        cpuUsage: 35.5,
        memoryUsage: 2048,
        memoryTotal: 8192,
        memoryFree: 6144,
        diskUsage: 50000,
        diskTotal: 250000,
        diskFree: 200000,
        activeConnections: 15,
        requestsPerMinute: 120,
        timestamp: new Date(Date.now() - 3600000 * 24),
      },
      {
        cpuUsage: 42.3,
        memoryUsage: 2560,
        memoryTotal: 8192,
        memoryFree: 5632,
        diskUsage: 50500,
        diskTotal: 250000,
        diskFree: 199500,
        activeConnections: 22,
        requestsPerMinute: 185,
        timestamp: new Date(Date.now() - 3600000 * 12),
      },
      {
        cpuUsage: 28.7,
        memoryUsage: 1920,
        memoryTotal: 8192,
        memoryFree: 6272,
        diskUsage: 51000,
        diskTotal: 250000,
        diskFree: 199000,
        activeConnections: 12,
        requestsPerMinute: 95,
        timestamp: new Date(Date.now() - 3600000 * 6),
      },
      {
        cpuUsage: 55.2,
        memoryUsage: 3200,
        memoryTotal: 8192,
        memoryFree: 4992,
        diskUsage: 51200,
        diskTotal: 250000,
        diskFree: 198800,
        activeConnections: 35,
        requestsPerMinute: 250,
        timestamp: new Date(Date.now() - 3600000 * 1),
      },
    ],
  });
  console.log('✅ System performance records created');

  // Create API usage logs
  await prisma.apiUsageLog.createMany({
    data: [
      {
        endpoint: '/api/activities',
        method: 'GET',
        statusCode: 200,
        responseTime: 45.5,
        ipAddress: '192.168.1.100',
        userId: developer.id,
        userAgent: 'Mozilla/5.0',
        timestamp: new Date(Date.now() - 3600000 * 2),
      },
      {
        endpoint: '/api/devices',
        method: 'GET',
        statusCode: 200,
        responseTime: 32.3,
        ipAddress: '192.168.1.1',
        userId: admin.id,
        userAgent: 'Mozilla/5.0',
        timestamp: new Date(Date.now() - 3600000 * 3),
      },
      {
        endpoint: '/api/devices/register',
        method: 'POST',
        statusCode: 201,
        responseTime: 156.7,
        ipAddress: '192.168.1.103',
        userId: mike.id,
        userAgent: 'Python/3.9',
        timestamp: new Date(Date.now() - 3600000 * 75),
      },
      {
        endpoint: '/api/activities',
        method: 'POST',
        statusCode: 201,
        responseTime: 89.2,
        ipAddress: '192.168.1.101',
        userId: john.id,
        userAgent: 'Python/3.9',
        timestamp: new Date(Date.now() - 3600000 * 24),
      },
      {
        endpoint: '/api/webhooks/gitlab',
        method: 'POST',
        statusCode: 200,
        responseTime: 234.8,
        ipAddress: '35.231.145.151',
        userAgent: 'GitLab-Webhook',
        timestamp: new Date(Date.now() - 3600000 * 12),
      },
    ],
  });
  console.log('✅ API usage logs created');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Default users created:');
  console.log('   Admin: admin@devmonitor.com / admin123456');
  console.log('   Developer: developer@devmonitor.com / developer123');
  console.log('   Viewer: viewer@devmonitor.com / viewer123');
  console.log('   John Doe: john.doe@example.com / john123');
  console.log('   Jane Smith: jane.smith@example.com / jane123');
  console.log('   Alex Johnson: alex.johnson@example.com / alex123');
  console.log('   Mike Chen: mike.chen@example.com / mike123');
  console.log('   Sarah Williams: sarah.williams@example.com / sarah123');
  console.log('   David Martinez: david.martinez@example.com / david123');
  console.log('   Emily Taylor: emily.taylor@example.com / emily123');
  console.log('\n🔒 Security Features:');
  console.log('   ✓ Device authorization system enabled');
  console.log('   ✓ Real-time activity monitoring active');
  console.log('   ✓ Suspicious activity detection running');
  console.log('   ✓ Automatic encryption for unauthorized access');
  console.log('   ✓ Slack & dashboard notifications enabled');
  console.log('\n📊 Sample Data:');
  console.log(`   • ${9} devices (7 authorized, 2 suspicious)`);
  console.log(`   • ${8} repositories (7 secure, 1 encrypted)`);
  console.log(`   • ${normalActivities.count} normal activities`);
  console.log('   • 4 suspicious activities detected');
  console.log('   • 4 security alerts generated');
  console.log('   • Audit logs and system logs created');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
