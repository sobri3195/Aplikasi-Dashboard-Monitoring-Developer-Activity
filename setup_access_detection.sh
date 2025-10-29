#!/bin/bash

# Setup Access Detection & Protection System
# Installs and configures the access monitoring system

set -e

echo "=========================================="
echo "Access Detection & Protection Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}Error: Not a git repository${NC}"
    echo "Please run this script from the root of your git repository"
    exit 1
fi

echo -e "${BLUE}Step 1: Checking Python installation...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 is required but not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python 3 found${NC}"
echo ""

echo -e "${BLUE}Step 2: Installing Python dependencies...${NC}"
cd monitoring-agent

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null

# Install requirements
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt -q
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ requirements.txt not found, installing basic dependencies${NC}"
    pip install requests watchdog -q
fi

cd ..
echo ""

echo -e "${BLUE}Step 3: Configuring access detection...${NC}"

# Prompt for configuration
read -p "Enter API URL (default: http://localhost:5000): " API_URL
API_URL=${API_URL:-http://localhost:5000}

read -p "Enter your API token: " API_TOKEN
if [ -z "$API_TOKEN" ]; then
    echo -e "${RED}Error: API token is required${NC}"
    exit 1
fi

read -p "Enter repository ID: " REPO_ID
if [ -z "$REPO_ID" ]; then
    echo -e "${RED}Error: Repository ID is required${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 4: Creating configuration file...${NC}"

# Create .env file for monitoring agent
cat > monitoring-agent/.env << EOF
API_URL=$API_URL
API_TOKEN=$API_TOKEN
REPO_ID=$REPO_ID
REPO_PATH=$(pwd)
EOF

echo -e "${GREEN}✓ Configuration saved to monitoring-agent/.env${NC}"
echo ""

echo -e "${BLUE}Step 5: Installing git hooks...${NC}"

# Install git hooks using the new access detection agent
cd monitoring-agent
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null

python3 access_detection_agent.py \
    --api-url "$API_URL" \
    --token "$API_TOKEN" \
    --repo-id "$REPO_ID" \
    --repo-path "$(dirname $(pwd))" \
    --install-hooks

cd ..
echo ""

echo -e "${BLUE}Step 6: Testing access detection...${NC}"

cd monitoring-agent
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null

python3 access_detection_agent.py \
    --api-url "$API_URL" \
    --token "$API_TOKEN" \
    --repo-id "$REPO_ID" \
    --repo-path "$(dirname $(pwd))" \
    --check-access

RESULT=$?
cd ..

if [ $RESULT -eq 0 ]; then
    echo -e "${GREEN}✓ Access check passed${NC}"
else
    echo -e "${RED}✗ Access check failed${NC}"
    echo "Please verify:"
    echo "  1. Your device is registered and approved"
    echo "  2. The API token is valid"
    echo "  3. The repository ID is correct"
    exit 1
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}Access Detection Features Enabled:${NC}"
echo "  • Real-time git operation monitoring (clone, pull, push)"
echo "  • Unauthorized access detection"
echo "  • Automatic repository encryption on violation"
echo "  • Real-time alerts to Slack and dashboard"
echo ""
echo -e "${BLUE}How it works:${NC}"
echo "  • Every git push is automatically checked for authorization"
echo "  • Every git pull is automatically monitored"
echo "  • Unauthorized copies are detected and encrypted"
echo "  • Administrators receive instant alerts"
echo ""
echo -e "${BLUE}To start continuous monitoring:${NC}"
echo "  cd monitoring-agent"
echo "  source venv/bin/activate"
echo "  python3 access_detection_agent.py \\"
echo "    --repo-id \"$REPO_ID\" \\"
echo "    --watch"
echo ""
echo -e "${YELLOW}Note: Git hooks are now active. All push operations will be verified.${NC}"
echo ""
