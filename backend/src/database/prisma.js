const { PrismaClient } = require('@prisma/client');

let prisma;

function getPrismaClient() {
  if (!prisma) {
    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL is not configured!');
      console.error('📝 Please set DATABASE_URL in your .env file');
      console.error('📖 Format: postgresql://[user]:[password]@[endpoint].neon.tech/crimson-base-54008430?sslmode=require');
      throw new Error('DATABASE_URL environment variable is not configured');
    }

    try {
      prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });

      // Test the connection
      prisma.$connect()
        .then(() => {
          console.log('✅ Database connected successfully to Neon');
          console.log('📊 Database: crimson-base-54008430');
        })
        .catch((error) => {
          console.error('❌ Database connection failed:', error.message);
          console.error('📝 Please check your DATABASE_URL configuration');
        });
    } catch (error) {
      console.error('❌ Failed to initialize Prisma Client:', error.message);
      throw error;
    }
  }
  return prisma;
}

const prismaInstance = getPrismaClient();

// Graceful shutdown
process.on('beforeExit', async () => {
  await prismaInstance.$disconnect();
});

module.exports = prismaInstance;
