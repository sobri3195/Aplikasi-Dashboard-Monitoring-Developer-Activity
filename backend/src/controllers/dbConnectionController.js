const { asyncHandler } = require('../middleware/errorHandler');
const prisma = require('../database/prisma');

exports.getConnectionStatus = asyncHandler(async (req, res) => {
  const status = {
    connected: false,
    database: 'crimson-base-54008430',
    provider: 'Neon PostgreSQL',
    timestamp: new Date().toISOString(),
    configuration: {
      databaseUrlConfigured: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV || 'development',
    },
    message: '',
    instructions: []
  };

  // Check if DATABASE_URL is configured
  if (!process.env.DATABASE_URL) {
    status.message = 'Database URL not configured';
    status.instructions = [
      '1. Create a Neon database account at https://neon.tech',
      '2. Create or select your database: crimson-base-54008430',
      '3. Copy your connection string from Neon dashboard',
      '4. Add it to your .env file as DATABASE_URL',
      '5. Format: postgresql://[user]:[password]@[endpoint].neon.tech/crimson-base-54008430?sslmode=require',
      '6. Restart the application'
    ];
    return res.status(503).json(status);
  }

  // Try to connect to database
  try {
    await prisma.$connect();
    
    // Get database stats
    const [userCount, deviceCount, activityCount] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.device.count().catch(() => 0),
      prisma.activity.count().catch(() => 0),
    ]);

    status.connected = true;
    status.message = 'Successfully connected to Neon database';
    status.stats = {
      users: userCount,
      devices: deviceCount,
      activities: activityCount,
    };

    return res.json(status);
  } catch (error) {
    status.message = 'Failed to connect to database';
    status.error = error.message;
    
    if (error.message.includes('authentication failed')) {
      status.instructions = [
        '❌ Authentication failed - Invalid credentials',
        '1. Check your DATABASE_URL username and password',
        '2. Get correct credentials from Neon dashboard',
        '3. Update your .env file',
        '4. Restart the application'
      ];
    } else if (error.message.includes('timeout')) {
      status.instructions = [
        '❌ Connection timeout',
        '1. Check if your Neon project is active',
        '2. Verify your internet connection',
        '3. Check Neon service status at https://neon.tech/status',
        '4. Try again in a few moments'
      ];
    } else if (error.message.includes('SSL') || error.message.includes('ssl')) {
      status.instructions = [
        '❌ SSL/TLS connection error',
        '1. Ensure your DATABASE_URL includes: ?sslmode=require',
        '2. Example: postgresql://user:pass@host.neon.tech/db?sslmode=require',
        '3. Update your .env file',
        '4. Restart the application'
      ];
    } else {
      status.instructions = [
        '❌ Database connection error',
        '1. Verify your DATABASE_URL format is correct',
        '2. Check Neon dashboard for connection details',
        '3. Ensure your database exists and is accessible',
        '4. Check application logs for detailed error',
        '5. Format: postgresql://[user]:[password]@[endpoint].neon.tech/crimson-base-54008430?sslmode=require'
      ];
    }

    return res.status(503).json(status);
  }
});

exports.getConnectionGuide = asyncHandler(async (req, res) => {
  const guide = {
    database: 'crimson-base-54008430',
    provider: 'Neon PostgreSQL',
    steps: [
      {
        step: 1,
        title: 'Create Neon Account',
        description: 'Sign up at https://neon.tech if you don\'t have an account',
        link: 'https://neon.tech'
      },
      {
        step: 2,
        title: 'Create or Select Database',
        description: 'Create a new database named "crimson-base-54008430" or select existing one',
        notes: 'You can use any name, but update the connection string accordingly'
      },
      {
        step: 3,
        title: 'Get Connection String',
        description: 'Navigate to Connection Details in your Neon dashboard',
        notes: 'Copy the PostgreSQL connection string'
      },
      {
        step: 4,
        title: 'Configure Environment',
        description: 'Create a .env file in the backend directory',
        example: 'DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/crimson-base-54008430?sslmode=require'
      },
      {
        step: 5,
        title: 'Run Database Migration',
        description: 'Execute Prisma migrations to set up database schema',
        commands: [
          'cd backend',
          'npm install',
          'npx prisma migrate deploy',
          'npx prisma generate'
        ]
      },
      {
        step: 6,
        title: 'Start Application',
        description: 'Start your application and verify connection',
        commands: [
          'npm start'
        ]
      }
    ],
    environmentVariables: {
      required: {
        DATABASE_URL: {
          description: 'PostgreSQL connection string for Neon database',
          format: 'postgresql://[user]:[password]@[endpoint].neon.tech/crimson-base-54008430?sslmode=require',
          example: 'postgresql://myuser:mypass@ep-cool-name-123456.neon.tech/crimson-base-54008430?sslmode=require'
        },
        JWT_SECRET: {
          description: 'Secret key for JWT token generation',
          example: 'your-secure-jwt-secret-key-here'
        },
        API_SECRET: {
          description: 'Secret key for API authentication',
          example: 'your-secure-api-secret-key-here'
        }
      },
      optional: {
        NODE_ENV: 'production or development',
        PORT: 'Server port (default: 5000)',
        ALLOWED_ORIGINS: 'Comma-separated list of allowed CORS origins'
      }
    },
    troubleshooting: {
      'Authentication Failed': [
        'Verify username and password in DATABASE_URL',
        'Check Neon dashboard for correct credentials',
        'Ensure password special characters are URL-encoded'
      ],
      'Connection Timeout': [
        'Check if Neon project is active (not suspended)',
        'Verify internet connectivity',
        'Check Neon service status'
      ],
      'SSL/TLS Error': [
        'Add ?sslmode=require to the end of DATABASE_URL',
        'Ensure SSL is enabled in Neon project settings'
      ],
      'Database Not Found': [
        'Verify database name in connection string',
        'Check if database exists in Neon dashboard',
        'Create the database if it doesn\'t exist'
      ]
    },
    resources: [
      {
        title: 'Neon Documentation',
        url: 'https://neon.tech/docs'
      },
      {
        title: 'Prisma with Neon',
        url: 'https://neon.tech/docs/guides/prisma'
      },
      {
        title: 'Environment Variables Guide',
        url: 'https://nodejs.dev/learn/how-to-read-environment-variables-from-nodejs'
      }
    ]
  };

  res.json(guide);
});

exports.testConnection = asyncHandler(async (req, res) => {
  if (!process.env.DATABASE_URL) {
    return res.status(503).json({
      success: false,
      message: 'DATABASE_URL not configured',
      instructions: [
        'Please set DATABASE_URL in your .env file',
        'Format: postgresql://[user]:[password]@[endpoint].neon.tech/crimson-base-54008430?sslmode=require'
      ]
    });
  }

  try {
    // Test connection
    await prisma.$connect();
    
    // Test queries
    const results = await Promise.allSettled([
      prisma.user.count(),
      prisma.device.count(),
      prisma.activity.count(),
      prisma.alert.count(),
    ]);

    const stats = {
      users: results[0].status === 'fulfilled' ? results[0].value : 'Error',
      devices: results[1].status === 'fulfilled' ? results[1].value : 'Error',
      activities: results[2].status === 'fulfilled' ? results[2].value : 'Error',
      alerts: results[3].status === 'fulfilled' ? results[3].value : 'Error',
    };

    const tablesAccessible = results.every(r => r.status === 'fulfilled');

    res.json({
      success: true,
      message: tablesAccessible 
        ? 'Database connection successful - All tables accessible' 
        : 'Database connected but some tables may need migration',
      database: 'crimson-base-54008430',
      provider: 'Neon PostgreSQL',
      stats,
      recommendation: !tablesAccessible ? 'Run: npx prisma migrate deploy' : null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database connection test failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
