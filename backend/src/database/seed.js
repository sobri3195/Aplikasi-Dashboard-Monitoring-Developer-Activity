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

  // Create sample device
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
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
