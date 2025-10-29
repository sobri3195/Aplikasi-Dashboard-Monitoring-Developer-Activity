#!/bin/bash
# Repository Protection Setup Script
# This script sets up device verification and repository protection

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Repository Protection & Device Verification Setup     ║"
echo "╔════════════════════════════════════════════════════════════╗"
echo -e "${NC}"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${RED}✗ Error: Not a git repository${NC}"
    echo "  Please run this script from the root of your repository."
    exit 1
fi

# Check if monitoring-agent exists
if [ ! -d "monitoring-agent" ]; then
    echo -e "${RED}✗ Error: monitoring-agent directory not found${NC}"
    echo "  This script requires the monitoring-agent to be present."
    exit 1
fi

echo -e "${YELLOW}Step 1/4: Checking prerequisites...${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python 3 is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python 3 found${NC}"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ No .env file found${NC}"
    if [ -f ".env.example" ]; then
        echo -e "${YELLOW}Creating .env from .env.example...${NC}"
        cp .env.example .env
        echo -e "${GREEN}✓ .env file created${NC}"
        echo -e "${YELLOW}⚠ Please edit .env file with your configuration before continuing${NC}"
        echo ""
        read -p "Press Enter after editing .env file..."
    else
        echo -e "${RED}✗ No .env.example file found${NC}"
        echo "Please create a .env file with required configuration."
        exit 1
    fi
fi

# Load environment variables
source .env

echo ""
echo -e "${YELLOW}Step 2/4: Installing Git Hooks...${NC}"

# Install git hooks using the Python script
if [ -f "monitoring-agent/install_git_hooks.py" ]; then
    python3 monitoring-agent/install_git_hooks.py install --repo-path .
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Git hooks installed successfully${NC}"
    else
        echo -e "${RED}✗ Failed to install git hooks${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ install_git_hooks.py not found${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 3/4: Device Registration${NC}"

# Check if device is already registered
echo "Checking current device fingerprint..."
DEVICE_INFO=$(python3 -c "
import os, sys
sys.path.append('monitoring-agent')
from device_fingerprint import generate_device_fingerprint
info = generate_device_fingerprint()
print(f\"Fingerprint: {info['fingerprint'][:16]}...\")
print(f\"Hostname: {info['hostname']}\")
print(f\"Platform: {info['platform']}\")
")

echo "$DEVICE_INFO"
echo ""

# Ask if user wants to register device
read -p "Do you need to register this device? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    read -p "Enter device name (e.g., 'My Laptop'): " DEVICE_NAME
    
    if [ -z "$DEVICE_NAME" ]; then
        echo -e "${RED}✗ Device name cannot be empty${NC}"
        exit 1
    fi
    
    echo ""
    echo "Registering device '$DEVICE_NAME'..."
    
    # Check if API_URL and API_TOKEN are set
    if [ -z "$API_URL" ] || [ -z "$API_TOKEN" ]; then
        echo -e "${RED}✗ API_URL or API_TOKEN not set in .env${NC}"
        echo "Please configure these variables in your .env file:"
        echo "  API_URL=http://localhost:5000"
        echo "  API_TOKEN=your-jwt-token"
        exit 1
    fi
    
    # Register device
    if [ -f "monitoring-agent/repo_protection_agent.py" ]; then
        python3 monitoring-agent/repo_protection_agent.py register \
            --device-name "$DEVICE_NAME" \
            --api-url "$API_URL" \
            --token "$API_TOKEN"
        
        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✓ Device registered successfully${NC}"
            echo -e "${YELLOW}⚠ Status: PENDING - Waiting for administrator approval${NC}"
        else
            echo ""
            echo -e "${RED}✗ Device registration failed${NC}"
            echo "Please check your API credentials and network connection."
            exit 1
        fi
    else
        echo -e "${RED}✗ repo_protection_agent.py not found${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ Skipping device registration${NC}"
    echo "  You can register later by running:"
    echo "  python3 monitoring-agent/repo_protection_agent.py register --device-name 'My Device'"
fi

echo ""
echo -e "${YELLOW}Step 4/4: Final Configuration${NC}"

# Create .repo-metadata.json if it doesn't exist
if [ ! -f ".repo-metadata.json" ]; then
    REPO_PATH=$(pwd)
    REPO_ID=${REPO_ID:-$(basename "$REPO_PATH")}
    
    cat > .repo-metadata.json <<EOF
{
  "repository_id": "$REPO_ID",
  "original_location": "$REPO_PATH",
  "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "protection_enabled": true,
  "trusted_paths": []
}
EOF
    echo -e "${GREEN}✓ Repository metadata created${NC}"
fi

# Add .repo-metadata.json to .gitignore if not already there
if [ -f ".gitignore" ]; then
    if ! grep -q ".repo-metadata.json" .gitignore; then
        echo ".repo-metadata.json" >> .gitignore
        echo -e "${GREEN}✓ Added .repo-metadata.json to .gitignore${NC}"
    fi
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Repository Protection Setup Complete!           ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo -e "  1. ${YELLOW}Wait for administrator approval${NC}"
echo "     Your device registration is pending approval."
echo "     You will not be able to commit or push until approved."
echo ""
echo -e "  2. ${YELLOW}Verify your device status${NC}"
echo "     Check with your administrator or view the dashboard"
echo ""
echo -e "  3. ${YELLOW}Start working${NC}"
echo "     Once approved, you can work normally with the repository"
echo ""
echo -e "${BLUE}Security Features Enabled:${NC}"
echo "  ✓ Device verification on clone"
echo "  ✓ Repository copy detection"
echo "  ✓ Location verification"
echo "  ✓ Access verification on commit/push"
echo "  ✓ Automatic encryption on unauthorized access"
echo ""
echo -e "${RED}⚠ Important Warnings:${NC}"
echo "  • Do NOT copy this repository to USB drives"
echo "  • Do NOT move the repository to a different location"
echo "  • Do NOT share your device credentials"
echo "  • Unauthorized copying will trigger automatic encryption"
echo ""
echo -e "${BLUE}Need Help?${NC}"
echo "  • Read: .repo-setup-instructions.md"
echo "  • Read: DEVICE_ID_VERIFICATION_GUIDE.md"
echo "  • Contact your administrator"
echo ""
