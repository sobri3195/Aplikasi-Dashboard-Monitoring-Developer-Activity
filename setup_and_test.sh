#!/bin/bash

echo "================================================"
echo "DevMonitor - Login Fix Setup Script"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd /home/engine/project/backend

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Generate Prisma Client
echo ""
echo -e "${YELLOW}🔄 Generating Prisma Client...${NC}"
npx prisma generate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Prisma Client generated${NC}"
else
    echo -e "${RED}❌ Failed to generate Prisma Client${NC}"
    exit 1
fi

# Check if PostgreSQL is running
echo ""
echo -e "${YELLOW}🔍 Checking PostgreSQL connection...${NC}"
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL is not running on localhost:5432${NC}"
    echo -e "${YELLOW}   Attempting to start with Docker...${NC}"
    
    # Try to start PostgreSQL with docker
    docker run -d --name devmonitor-postgres \
        -e POSTGRES_USER=devmonitor \
        -e POSTGRES_PASSWORD=devmonitor123 \
        -e POSTGRES_DB=devmonitor \
        -p 5432:5432 \
        postgres:14-alpine
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PostgreSQL started via Docker${NC}"
        echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
        sleep 5
    else
        echo -e "${YELLOW}⚠️  Could not start PostgreSQL. You may need to start it manually.${NC}"
    fi
fi

# Apply migrations
echo ""
echo -e "${YELLOW}🔄 Applying database migrations...${NC}"
npx prisma migrate deploy
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migrations applied${NC}"
else
    echo -e "${YELLOW}⚠️  Migration failed. Trying db push...${NC}"
    npx prisma db push --accept-data-loss
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database schema updated${NC}"
    else
        echo -e "${RED}❌ Failed to update database schema${NC}"
    fi
fi

# Seed database
echo ""
echo -e "${YELLOW}🌱 Seeding database with demo accounts...${NC}"
npm run db:seed
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database seeded successfully${NC}"
else
    echo -e "${RED}❌ Failed to seed database${NC}"
fi

echo ""
echo "================================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "================================================"
echo ""
echo "Demo Accounts Available:"
echo "  • admin@devmonitor.com / admin123456"
echo "  • developer@devmonitor.com / developer123"
echo "  • viewer@devmonitor.com / viewer123"
echo "  • john.doe@example.com / john123"
echo "  • jane.smith@example.com / jane123"
echo "  • alex.johnson@example.com / alex123"
echo ""
echo "To start the backend:"
echo "  cd backend && npm start"
echo ""
echo "To test login:"
echo "  ./test_login.sh"
echo ""
