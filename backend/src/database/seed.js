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

  // Create sample repository
  const repository = await prisma.repository.create({
    data: {
      name: 'sample-project',
      gitlabUrl: 'https://gitlab.com/company/sample-project',
      gitlabProjectId: 12345,
      securityStatus: 'SECURE',
      lastActivity: new Date(),
    },
  });
  console.log('✅ Sample repository created:', repository.name);

  // Create sample activities
  const activities = await prisma.activity.createMany({
    data: [
      {
        userId: developer.id,
        deviceId: device.id,
        activityType: 'GIT_CLONE',
        repository: 'sample-project',
        branch: 'main',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 24), // 1 day ago
      },
      {
        userId: developer.id,
        deviceId: device.id,
        activityType: 'GIT_PULL',
        repository: 'sample-project',
        branch: 'main',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 12), // 12 hours ago
      },
      {
        userId: developer.id,
        deviceId: device.id,
        activityType: 'GIT_PUSH',
        repository: 'sample-project',
        branch: 'feature/new-feature',
        commitHash: 'abc123def456',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 2), // 2 hours ago
      },
      {
        userId: john.id,
        deviceId: johnDevice.id,
        activityType: 'LOGIN',
        repository: null,
        branch: null,
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 48), // 2 days ago
      },
      {
        userId: john.id,
        deviceId: johnDevice.id,
        activityType: 'GIT_CLONE',
        repository: 'backend-api',
        branch: 'main',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 36), // 1.5 days ago
      },
      {
        userId: john.id,
        deviceId: johnDevice.id,
        activityType: 'GIT_COMMIT',
        repository: 'backend-api',
        branch: 'feature/api-enhancement',
        commitHash: 'def789ghi012',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 6), // 6 hours ago
      },
      {
        userId: jane.id,
        deviceId: janeDevice.id,
        activityType: 'LOGIN',
        repository: null,
        branch: null,
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 72), // 3 days ago
      },
      {
        userId: jane.id,
        deviceId: janeDevice.id,
        activityType: 'GIT_PULL',
        repository: 'frontend-app',
        branch: 'develop',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 24), // 1 day ago
      },
      {
        userId: jane.id,
        deviceId: janeDevice.id,
        activityType: 'GIT_PUSH',
        repository: 'frontend-app',
        branch: 'feature/ui-redesign',
        commitHash: 'ghi345jkl678',
        riskLevel: 'LOW',
        isSuspicious: false,
        timestamp: new Date(Date.now() - 3600000 * 3), // 3 hours ago
      },
    ],
  });
  console.log(`✅ ${activities.count} sample activities created`);

  // Create sample audit log
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'DEVICE_APPROVED',
      entity: 'Device',
      entityId: device.id,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      changes: {
        status: 'APPROVED',
        isAuthorized: true,
      },
    },
  });
  console.log('✅ Sample audit log created');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Default users created:');
  console.log('   Admin: admin@devmonitor.com / admin123456');
  console.log('   Developer: developer@devmonitor.com / developer123');
  console.log('   Viewer: viewer@devmonitor.com / viewer123');
  console.log('   John Doe: john.doe@example.com / john123');
  console.log('   Jane Smith: jane.smith@example.com / jane123');
  console.log('   Alex Johnson: alex.johnson@example.com / alex123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
