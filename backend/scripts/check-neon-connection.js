#!/usr/bin/env node

/**
 * Neon Database Connection Checker
 * 
 * This script verifies the database connection and provides detailed
 * diagnostic information for troubleshooting.
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.bright + colors.cyan);
  console.log('='.repeat(60) + '\n');
}

async function checkConnection() {
  logSection('🔍 Neon Database Connection Checker');

  // Check if DATABASE_URL is set
  log('1️⃣  Checking environment variables...', colors.blue);
  
  if (!process.env.DATABASE_URL) {
    log('❌ DATABASE_URL is not set!', colors.red);
    log('\n📝 Please set DATABASE_URL in your .env file', colors.yellow);
    log('Format: postgresql://[user]:[password]@[endpoint].neon.tech/crimson-base-54008430?sslmode=require', colors.yellow);
    process.exit(1);
  }

  // Parse DATABASE_URL (hide password)
  const dbUrl = process.env.DATABASE_URL;
  const urlPattern = /postgresql:\/\/([^:]+):([^@]+)@([^\/]+)\/([^?]+)(\?.*)?/;
  const match = dbUrl.match(urlPattern);

  if (match) {
    const [, username, , host, database, params] = match;
    log('✅ DATABASE_URL is configured', colors.green);
    log(`   Username: ${username}`, colors.cyan);
    log(`   Host: ${host}`, colors.cyan);
    log(`   Database: ${database}`, colors.cyan);
    log(`   SSL Mode: ${params?.includes('sslmode') ? 'Enabled ✓' : 'Disabled (Warning!)'}`, 
        params?.includes('sslmode') ? colors.green : colors.yellow);
  } else {
    log('⚠️  DATABASE_URL format may be incorrect', colors.yellow);
  }

  // Check other required environment variables
  log('\n2️⃣  Checking other environment variables...', colors.blue);
  const requiredVars = ['JWT_SECRET', 'API_SECRET', 'ENCRYPTION_KEY'];
  const missingVars = requiredVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    log(`⚠️  Missing: ${missingVars.join(', ')}`, colors.yellow);
    log('   Consider setting these for full functionality', colors.yellow);
  } else {
    log('✅ All required environment variables are set', colors.green);
  }

  // Test database connection
  log('\n3️⃣  Testing database connection...', colors.blue);
  
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    await prisma.$connect();
    log('✅ Successfully connected to database!', colors.green);

    // Test database operations
    log('\n4️⃣  Testing database operations...', colors.blue);
    
    const tableTests = [
      { name: 'users', model: prisma.user },
      { name: 'devices', model: prisma.device },
      { name: 'activities', model: prisma.activity },
      { name: 'alerts', model: prisma.alert },
      { name: 'repositories', model: prisma.repository },
    ];

    const stats = {};
    let allTestsPassed = true;

    for (const test of tableTests) {
      try {
        const count = await test.model.count();
        stats[test.name] = count;
        log(`   ✓ ${test.name}: ${count} records`, colors.green);
      } catch (error) {
        stats[test.name] = 'Error';
        allTestsPassed = false;
        log(`   ✗ ${test.name}: ${error.message}`, colors.red);
      }
    }

    if (allTestsPassed) {
      log('\n✅ All database tables are accessible!', colors.green);
    } else {
      log('\n⚠️  Some tables are not accessible', colors.yellow);
      log('   You may need to run migrations:', colors.yellow);
      log('   npx prisma migrate deploy', colors.cyan);
    }

    // Database info
    log('\n5️⃣  Database information...', colors.blue);
    try {
      const result = await prisma.$queryRaw`
        SELECT version() as version, 
               current_database() as database,
               current_user as user
      `;
      if (result && result[0]) {
        log(`   PostgreSQL Version: ${result[0].version?.split(' ')[0] || 'Unknown'}`, colors.cyan);
        log(`   Database: ${result[0].database}`, colors.cyan);
        log(`   User: ${result[0].user}`, colors.cyan);
      }
    } catch (error) {
      log(`   Could not fetch database info: ${error.message}`, colors.yellow);
    }

    // Migration status
    log('\n6️⃣  Checking migration status...', colors.blue);
    try {
      const migrations = await prisma.$queryRaw`
        SELECT migration_name, finished_at 
        FROM _prisma_migrations 
        ORDER BY finished_at DESC 
        LIMIT 5
      `;
      
      if (migrations && migrations.length > 0) {
        log(`   ✅ Found ${migrations.length} migrations`, colors.green);
        migrations.forEach(m => {
          log(`   - ${m.migration_name}`, colors.cyan);
        });
      } else {
        log('   ⚠️  No migrations found', colors.yellow);
        log('   Run: npx prisma migrate deploy', colors.cyan);
      }
    } catch (error) {
      log('   ⚠️  Could not check migrations', colors.yellow);
      log('   Run: npx prisma migrate deploy', colors.cyan);
    }

    // Summary
    logSection('📊 Connection Summary');
    log('Database: crimson-base-54008430', colors.bright);
    log('Provider: Neon PostgreSQL', colors.bright);
    log('Status: Connected ✓', colors.green);
    log(`\nTable Statistics:`, colors.bright);
    Object.entries(stats).forEach(([table, count]) => {
      log(`  ${table}: ${count}`, colors.cyan);
    });

    log('\n✨ Everything looks good!', colors.green + colors.bright);
    log('\n📝 Next steps:', colors.blue);
    log('   - Start the server: npm start', colors.cyan);
    log('   - Seed database: npm run db:seed', colors.cyan);
    log('   - Open Prisma Studio: npx prisma studio', colors.cyan);

  } catch (error) {
    log('❌ Database connection failed!', colors.red);
    log(`\nError: ${error.message}`, colors.red);
    
    log('\n🔧 Troubleshooting:', colors.yellow);
    
    if (error.message.includes('authentication failed')) {
      log('   - Check your username and password in DATABASE_URL', colors.yellow);
      log('   - Verify credentials in Neon Console', colors.yellow);
      log('   - Ensure special characters in password are URL-encoded', colors.yellow);
    } else if (error.message.includes('timeout')) {
      log('   - Check if your Neon project is active (not suspended)', colors.yellow);
      log('   - Verify your internet connection', colors.yellow);
      log('   - Check Neon status: https://neon.tech/status', colors.yellow);
    } else if (error.message.includes('SSL') || error.message.includes('ssl')) {
      log('   - Add ?sslmode=require to your DATABASE_URL', colors.yellow);
      log('   - Ensure SSL is enabled in Neon settings', colors.yellow);
    } else {
      log('   - Verify DATABASE_URL format is correct', colors.yellow);
      log('   - Check Neon Console for database status', colors.yellow);
      log('   - Review error message above for specific issue', colors.yellow);
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the checker
checkConnection().catch((error) => {
  log(`\n❌ Unexpected error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
