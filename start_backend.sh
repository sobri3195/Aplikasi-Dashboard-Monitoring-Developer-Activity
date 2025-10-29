#!/bin/bash

# Start Backend Server Script for DevMonitor
# This script ensures PostgreSQL is running and starts the backend server

echo "🚀 Starting DevMonitor Backend..."

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
fi

# Check if PostgreSQL is running
if ! docker ps | grep -q devmonitor-postgres; then
    echo "⚠️  PostgreSQL not running. Starting..."
    
    # Check if container exists but is stopped
    if docker ps -a | grep -q devmonitor-postgres; then
        docker start devmonitor-postgres
        echo "✅ PostgreSQL container started"
    else
        # Create new container
        docker run -d --name devmonitor-postgres \
            -e POSTGRES_USER=devmonitor \
            -e POSTGRES_PASSWORD=devmonitor123 \
            -e POSTGRES_DB=devmonitor \
            -p 5432:5432 \
            postgres:14-alpine
        echo "✅ PostgreSQL container created and started"
    fi
    
    echo "⏳ Waiting for PostgreSQL to be ready..."
    sleep 5
else
    echo "✅ PostgreSQL is already running"
fi

# Navigate to backend directory
cd backend

# Check if .env symlink exists
if [ ! -f ".env" ]; then
    echo "⚠️  Creating .env symlink in backend directory..."
    ln -sf ../.env .env
    echo "✅ .env symlink created"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# Check if database has data
echo "🌱 Checking database..."
DB_CHECK=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM users;" 2>&1)
if [[ $DB_CHECK == *"error"* ]] || [[ $DB_CHECK == *"0"* ]]; then
    echo "🌱 Seeding database..."
    npm run db:seed
fi

# Start the server
echo ""
echo "✅ All checks passed! Starting backend server..."
echo "📊 Backend will be available at: http://localhost:5000"
echo "🔍 Health check: http://localhost:5000/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
