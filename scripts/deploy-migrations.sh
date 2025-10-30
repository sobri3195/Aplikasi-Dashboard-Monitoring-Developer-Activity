#!/bin/bash

# Script untuk deploy migrasi Prisma ke Neon database
# Usage: ./scripts/deploy-migrations.sh

set -e

echo "🚀 Starting Prisma migration deployment..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  echo ""
  echo "Please set your DATABASE_URL first:"
  echo "export DATABASE_URL='postgresql://[user]:[password]@[endpoint].neon.tech/crimson-base-54008430?sslmode=require'"
  echo ""
  exit 1
fi

# Verify database connection
echo "🔍 Verifying database connection..."
cd backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Generate Prisma Client
echo "⚙️  Generating Prisma Client..."
npx prisma generate

# Deploy migrations
echo "🗄️  Deploying migrations to Neon database..."
npx prisma migrate deploy

# Check migration status
echo "✅ Checking migration status..."
npx prisma migrate status

echo ""
echo "✨ Migration deployment completed successfully!"
echo ""
echo "Database: crimson-base-54008430"
echo "Provider: Neon PostgreSQL"
echo ""
echo "Next steps:"
echo "1. Test your database connection at: /api/test-db"
echo "2. Deploy your application to Netlify"
echo "3. Configure environment variables in Netlify dashboard"
echo ""
