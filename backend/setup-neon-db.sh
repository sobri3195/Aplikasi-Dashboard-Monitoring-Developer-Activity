#!/bin/bash

# Neon Database Setup Script for crimson-base-54008430
# This script helps you set up and connect your backend to Neon PostgreSQL

set -e

echo "================================================"
echo "🚀 Neon Database Setup Script"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo -e "${YELLOW}📝 Creating .env from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
fi

# Check if DATABASE_URL is configured
if grep -q "\[user\]" .env; then
    echo -e "${YELLOW}⚠️  DATABASE_URL not configured yet${NC}"
    echo ""
    echo -e "${BLUE}📋 Please follow these steps:${NC}"
    echo ""
    echo "1️⃣  Go to https://console.neon.tech and sign in"
    echo "2️⃣  Create a new project or select existing one"
    echo "3️⃣  Create/select database: ${GREEN}crimson-base-54008430${NC}"
    echo "4️⃣  Navigate to 'Connection Details' in your project"
    echo "5️⃣  Copy the PostgreSQL connection string"
    echo "6️⃣  Update DATABASE_URL in .env file"
    echo ""
    echo -e "${YELLOW}Example connection string:${NC}"
    echo "postgresql://myuser:mypass@ep-cool-name-123456.us-east-2.aws.neon.tech/crimson-base-54008430?sslmode=require"
    echo ""
    read -p "Press Enter after you've updated the DATABASE_URL in .env..."
fi

echo ""
echo -e "${BLUE}🔍 Checking dependencies...${NC}"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

echo ""
echo -e "${BLUE}🔧 Generating Prisma Client...${NC}"
npx prisma generate
echo -e "${GREEN}✅ Prisma Client generated${NC}"

echo ""
echo -e "${BLUE}🗄️  Testing database connection...${NC}"

# Test database connection
if npx prisma db execute --stdin <<< "SELECT 1;" 2>/dev/null; then
    echo -e "${GREEN}✅ Database connection successful!${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting tips:${NC}"
    echo "1. Verify your DATABASE_URL is correct"
    echo "2. Check that your Neon project is active"
    echo "3. Ensure ?sslmode=require is at the end of the URL"
    echo "4. Verify your username and password are correct"
    echo ""
    echo "Run this script again after fixing the connection string."
    exit 1
fi

echo ""
echo -e "${BLUE}🚀 Deploying database migrations...${NC}"
npx prisma migrate deploy
echo -e "${GREEN}✅ Migrations deployed successfully${NC}"

echo ""
echo -e "${BLUE}📊 Database statistics:${NC}"
npx prisma db execute --stdin <<< "
SELECT 
    schemaname,
    COUNT(*) as table_count
FROM pg_tables 
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
GROUP BY schemaname;
" 2>/dev/null || echo "Could not fetch statistics"

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✅ Database setup completed successfully!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "1. Start the backend server: ${GREEN}npm start${NC}"
echo "2. Test the connection: ${GREEN}curl http://localhost:5000/health${NC}"
echo "3. Check database status: ${GREEN}curl http://localhost:5000/api/db/status${NC}"
echo ""
echo -e "${YELLOW}Optional: Seed the database with demo data${NC}"
echo "Run: ${GREEN}npm run db:seed${NC}"
echo ""
