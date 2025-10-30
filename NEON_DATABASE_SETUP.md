# Neon Database Setup for Netlify

This guide explains how to connect your application to the Neon database `crimson-base-54008430` on Netlify.

## Prerequisites

1. A Neon database account (https://neon.tech)
2. A Netlify account with this project deployed
3. Your Neon database connection string

## Database Information

- **Database Name**: `crimson-base-54008430`
- **Database Provider**: Neon (Serverless PostgreSQL)
- **Prisma Client**: Already configured in the project

## Step 1: Get Your Neon Connection String

1. Log in to your Neon dashboard at https://console.neon.tech
2. Select your project containing the database `crimson-base-54008430`
3. Navigate to the "Connection Details" section
4. Copy the connection string, which should look like:
   ```
   postgresql://[user]:[password]@[endpoint].neon.tech/crimson-base-54008430?sslmode=require
   ```

## Step 2: Configure Netlify Environment Variables

1. Go to your Netlify dashboard
2. Select your site/project
3. Navigate to **Site settings** > **Environment variables**
4. Add the following environment variables:

### Required Variables

```bash
# Database Connection
DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/crimson-base-54008430?sslmode=require

# Backend Configuration
PORT=5000
NODE_ENV=production
JWT_SECRET=your-secure-jwt-secret-here
API_SECRET=your-secure-api-secret-here

# CORS Configuration
ALLOWED_ORIGINS=https://your-netlify-app.netlify.app

# Encryption
ENCRYPTION_KEY=your-32-byte-encryption-key-here

# Session
SESSION_SECRET=your-session-secret-here

# Frontend URL
FRONTEND_URL=https://your-netlify-app.netlify.app
```

### Optional Variables (Notifications)

```bash
# Slack Integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_ENABLED=true

# Telegram Integration
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
TELEGRAM_ENABLED=true

# Email Configuration
EMAIL_ENABLED=false
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@devmonitor.com
```

## Step 3: Deploy Prisma Migrations

After setting up the environment variables, you need to run Prisma migrations to set up your database schema.

### Option A: Using Netlify Build Plugin

1. Install the Netlify Prisma plugin in your `netlify.toml`:

```toml
[[plugins]]
  package = "@netlify/plugin-prisma"
```

2. The migrations will run automatically on each deploy.

### Option B: Manual Migration

1. Clone your repository locally
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Set your DATABASE_URL in a local `.env` file:
   ```bash
   DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/crimson-base-54008430?sslmode=require
   ```

4. Run Prisma migrations:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

## Step 4: Test the Connection

After deployment, you can test the database connection by visiting:

```
https://your-netlify-app.netlify.app/api/health
https://your-netlify-app.netlify.app/api/test-db
```

The `/api/health` endpoint should return:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "crimson-base-54008430",
  "connection": "neon"
}
```

The `/api/test-db` endpoint should return:
```json
{
  "message": "Database connection successful",
  "database": "crimson-base-54008430",
  "userCount": 0
}
```

## Step 5: Configure Prisma for Netlify Functions

The Prisma client needs to be generated with the correct binary target for Netlify. Update your `backend/package.json` to include a postinstall script:

```json
"scripts": {
  "postinstall": "prisma generate"
}
```

Also ensure your `backend/prisma/schema.prisma` includes:

```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-1.0.x"]
}
```

## Troubleshooting

### Connection Issues

1. **SSL/TLS Errors**: Ensure your connection string includes `?sslmode=require`
2. **Timeout Errors**: Check that your Neon project is active and not suspended
3. **Authentication Errors**: Verify your username and password are correct

### Migration Issues

1. **Schema Drift**: Run `npx prisma migrate reset` locally, then `npx prisma migrate deploy`
2. **Permission Errors**: Ensure your Neon user has the necessary permissions

### Netlify Function Issues

1. **Module Not Found**: Ensure `@prisma/client` is installed in the functions directory
2. **Binary Target Issues**: Update the `binaryTargets` in your Prisma schema
3. **Cold Start Timeout**: Consider using Prisma Data Proxy for faster cold starts

## Best Practices

1. **Connection Pooling**: Neon handles connection pooling automatically
2. **Environment Variables**: Never commit sensitive credentials to git
3. **Monitoring**: Set up alerts in your Neon dashboard for connection limits
4. **Backups**: Enable automated backups in your Neon project settings

## Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Prisma with Neon](https://neon.tech/docs/guides/prisma)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)

## Support

For issues specific to:
- **Neon Database**: Contact Neon support or check their documentation
- **Netlify Deployment**: Refer to Netlify documentation or support
- **Application Issues**: Check application logs in Netlify dashboard

---

Last Updated: 2024
Database: crimson-base-54008430
