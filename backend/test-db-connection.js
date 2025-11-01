const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    console.log('📍 Database URL:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
    
    // Test connection by querying database
    await prisma.$connect();
    console.log('✅ Successfully connected to PostgreSQL database!');
    
    // Get database version
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('\n📊 Database Info:');
    console.log(result[0].version);
    
    // List all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    console.log('\n📋 Database Tables Created:');
    console.log('─'.repeat(50));
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name}`);
    });
    console.log('─'.repeat(50));
    console.log(`Total tables: ${tables.length}`);
    
    // Count records in each table
    console.log('\n📈 Record Counts:');
    console.log('─'.repeat(50));
    
    const userCount = await prisma.user.count();
    const deviceCount = await prisma.device.count();
    const activityCount = await prisma.activity.count();
    const alertCount = await prisma.alert.count();
    
    console.log(`Users: ${userCount}`);
    console.log(`Devices: ${deviceCount}`);
    console.log(`Activities: ${activityCount}`);
    console.log(`Alerts: ${alertCount}`);
    console.log('─'.repeat(50));
    
    console.log('\n✨ Database is ready to use!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
