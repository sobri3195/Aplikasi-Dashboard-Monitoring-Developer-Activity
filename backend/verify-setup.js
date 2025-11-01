#!/usr/bin/env node

/**
 * Complete Database Setup Verification Script
 * This script verifies that the entire database setup is working correctly
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function error(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function info(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function section(title) {
  console.log(`\n${colors.cyan}${colors.bold}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}${title}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}${'='.repeat(60)}${colors.reset}\n`);
}

async function verifySetup() {
  let allTestsPassed = true;

  try {
    section('🔍 DATABASE SETUP VERIFICATION');

    // Test 1: Database Connection
    section('1️⃣  Testing Database Connection');
    try {
      await prisma.$connect();
      success('Database connection successful');
      
      const dbVersion = await prisma.$queryRaw`SELECT version()`;
      info(`PostgreSQL Version: ${dbVersion[0].version.split(',')[0]}`);
    } catch (err) {
      error(`Database connection failed: ${err.message}`);
      allTestsPassed = false;
    }

    // Test 2: Environment Variables
    section('2️⃣  Checking Environment Variables');
    const requiredEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'API_SECRET',
      'PORT',
      'NODE_ENV'
    ];

    let missingVars = [];
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        success(`${envVar} is set`);
      } else {
        error(`${envVar} is missing`);
        missingVars.push(envVar);
        allTestsPassed = false;
      }
    }

    if (missingVars.length === 0) {
      success('All required environment variables are set');
    } else {
      error(`Missing environment variables: ${missingVars.join(', ')}`);
    }

    // Test 3: Database Tables
    section('3️⃣  Verifying Database Tables');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    const expectedTables = [
      'users', 'devices', 'activities', 'alerts', 'repositories',
      'audit_logs', 'security_logs', 'system_logs', 'user_sessions',
      'access_tokens', 'device_sync_status', 'anomaly_detections'
    ];

    const tableNames = tables.map(t => t.table_name);
    
    for (const expectedTable of expectedTables) {
      if (tableNames.includes(expectedTable)) {
        success(`Table '${expectedTable}' exists`);
      } else {
        error(`Table '${expectedTable}' is missing`);
        allTestsPassed = false;
      }
    }

    info(`Total tables in database: ${tables.length}`);

    // Test 4: Data Verification
    section('4️⃣  Verifying Data');
    
    const userCount = await prisma.user.count();
    const deviceCount = await prisma.device.count();
    const activityCount = await prisma.activity.count();
    const alertCount = await prisma.alert.count();
    const repoCount = await prisma.repository.count();

    if (userCount > 0) {
      success(`Found ${userCount} users in database`);
    } else {
      error('No users found - database may need seeding');
      allTestsPassed = false;
    }

    if (deviceCount > 0) {
      success(`Found ${deviceCount} devices in database`);
    } else {
      error('No devices found - database may need seeding');
      allTestsPassed = false;
    }

    info(`Activities: ${activityCount}`);
    info(`Alerts: ${alertCount}`);
    info(`Repositories: ${repoCount}`);

    // Test 5: User Authentication Check
    section('5️⃣  Checking Default Users');
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@devmonitor.com' }
    });

    if (adminUser) {
      success('Admin user exists');
      info(`Admin name: ${adminUser.name}`);
      info(`Admin role: ${adminUser.role}`);
      info(`Admin status: ${adminUser.isActive ? 'Active' : 'Inactive'}`);
    } else {
      error('Admin user not found - database needs seeding');
      allTestsPassed = false;
    }

    // Test 6: Database Indexes
    section('6️⃣  Verifying Database Indexes');
    const indexes = await prisma.$queryRaw`
      SELECT 
        tablename, 
        indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname NOT LIKE '%_pkey'
      ORDER BY tablename;
    `;

    if (indexes.length > 0) {
      success(`Found ${indexes.length} indexes for performance optimization`);
    } else {
      error('No indexes found - may impact performance');
    }

    // Test 7: Prisma Client Generation
    section('7️⃣  Verifying Prisma Client');
    try {
      // Test if Prisma Client is properly generated
      const modelNames = Object.keys(prisma).filter(key => 
        typeof prisma[key] === 'object' && 
        prisma[key] !== null &&
        !key.startsWith('$') &&
        !key.startsWith('_')
      );
      
      success(`Prisma Client generated with ${modelNames.length} models`);
      info(`Models: ${modelNames.slice(0, 10).join(', ')}...`);
    } catch (err) {
      error(`Prisma Client issue: ${err.message}`);
      allTestsPassed = false;
    }

    // Test 8: Database Write Test
    section('8️⃣  Testing Database Write Operations');
    try {
      const testLog = await prisma.systemLog.create({
        data: {
          level: 'INFO',
          message: 'Database setup verification test',
          source: 'verify-setup.js',
          metadata: {
            test: true,
            timestamp: new Date().toISOString()
          }
        }
      });

      success('Successfully wrote test data to database');
      
      // Clean up test data
      await prisma.systemLog.delete({
        where: { id: testLog.id }
      });
      success('Successfully deleted test data from database');
    } catch (err) {
      error(`Database write test failed: ${err.message}`);
      allTestsPassed = false;
    }

    // Test 9: Database Query Performance
    section('9️⃣  Testing Query Performance');
    try {
      const startTime = Date.now();
      await prisma.user.findMany({
        include: {
          devices: true,
          activities: {
            take: 10
          }
        },
        take: 5
      });
      const queryTime = Date.now() - startTime;
      
      if (queryTime < 1000) {
        success(`Query performance is good (${queryTime}ms)`);
      } else if (queryTime < 3000) {
        log(`⚠️  Query performance is acceptable (${queryTime}ms)`, 'yellow');
      } else {
        error(`Query performance is slow (${queryTime}ms)`);
      }
    } catch (err) {
      error(`Query performance test failed: ${err.message}`);
      allTestsPassed = false;
    }

    // Final Summary
    section('📊 VERIFICATION SUMMARY');
    
    if (allTestsPassed) {
      console.log(`\n${colors.green}${colors.bold}🎉 ALL TESTS PASSED!${colors.reset}\n`);
      success('Database setup is complete and working correctly');
      success('System is ready for development and testing');
      
      console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
      console.log(`  1. Start the backend server: ${colors.yellow}npm run dev${colors.reset}`);
      console.log(`  2. Access the API at: ${colors.yellow}http://localhost:5000${colors.reset}`);
      console.log(`  3. Login with admin credentials:`);
      console.log(`     Email: ${colors.yellow}admin@devmonitor.com${colors.reset}`);
      console.log(`     Password: ${colors.yellow}admin123456${colors.reset}`);
      console.log(`\n${colors.red}⚠️  Remember to change default passwords before production!${colors.reset}\n`);
    } else {
      console.log(`\n${colors.red}${colors.bold}❌ SOME TESTS FAILED${colors.reset}\n`);
      error('Please review the errors above and fix any issues');
      
      console.log(`\n${colors.cyan}Troubleshooting:${colors.reset}`);
      console.log(`  1. Check .env file exists: ${colors.yellow}cat .env${colors.reset}`);
      console.log(`  2. Regenerate Prisma Client: ${colors.yellow}npm run prisma:generate${colors.reset}`);
      console.log(`  3. Push schema to database: ${colors.yellow}npm run db:push${colors.reset}`);
      console.log(`  4. Seed the database: ${colors.yellow}npm run db:seed${colors.reset}\n`);
      
      process.exit(1);
    }

  } catch (err) {
    console.error(`\n${colors.red}${colors.bold}FATAL ERROR:${colors.reset}`, err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifySetup();
