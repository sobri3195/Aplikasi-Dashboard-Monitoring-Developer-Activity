const path = require('path');

const prismaPath = path.join(__dirname, '../../backend/node_modules/.prisma/client');
const PrismaClient = require(prismaPath).PrismaClient;

let prisma;

function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
  return prisma;
}

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const prismaClient = getPrismaClient();
  const requestPath = event.path.replace('/.netlify/functions/api', '');
  const method = event.httpMethod;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  try {
    if (requestPath === '/health' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          database: 'crimson-base-54008430',
          connection: 'neon',
          environment: process.env.NODE_ENV || 'production',
        }),
      };
    }

    if (requestPath === '/test-db' && method === 'GET') {
      try {
        const userCount = await prismaClient.user.count();
        const deviceCount = await prismaClient.device.count();
        const activityCount = await prismaClient.activity.count();

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            message: 'Database connection successful',
            database: 'crimson-base-54008430',
            provider: 'Neon PostgreSQL',
            stats: {
              users: userCount,
              devices: deviceCount,
              activities: activityCount,
            },
            timestamp: new Date().toISOString(),
          }),
        };
      } catch (dbError) {
        console.error('Database error:', dbError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: 'Database connection failed',
            message: dbError.message,
            database: 'crimson-base-54008430',
          }),
        };
      }
    }

    if (requestPath === '/db-info' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          database: 'crimson-base-54008430',
          provider: 'Neon PostgreSQL',
          connected: true,
          timestamp: new Date().toISOString(),
        }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: 'Not found',
        path: requestPath,
        method: method,
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }),
    };
  }
};
