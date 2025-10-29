#!/bin/bash

# DevMonitor Application Startup Script
# This script starts both the backend and frontend servers

set -e

echo "=========================================="
echo "  DevMonitor Application Startup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# Check if backend is already running
if check_port 5000; then
    echo -e "${GREEN}✓${NC} Backend is already running on port 5000"
else
    echo -e "${YELLOW}⚠${NC} Backend is not running. Starting backend..."
    
    # Check if backend directory exists
    if [ ! -d "backend" ]; then
        echo -e "${RED}✗${NC} Backend directory not found!"
        exit 1
    fi
    
    # Check if node_modules exists
    if [ ! -d "backend/node_modules" ]; then
        echo "Installing backend dependencies..."
        cd backend
        npm install
        cd ..
    fi
    
    # Check if .env exists
    if [ ! -f "backend/.env" ] && [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠${NC} .env file not found. Creating from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            echo -e "${GREEN}✓${NC} Created .env file"
        fi
    fi
    
    # Check if dashboard .env exists
    if [ ! -f "dashboard/.env" ]; then
        echo -e "${YELLOW}⚠${NC} dashboard/.env file not found. Creating from .env.example..."
        if [ -f "dashboard/.env.example" ]; then
            cp dashboard/.env.example dashboard/.env
            echo -e "${GREEN}✓${NC} Created dashboard/.env file"
        fi
    fi
    
    # Start backend in background
    echo "Starting backend server..."
    cd backend
    npm start > ../backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    echo -e "${GREEN}✓${NC} Backend started (PID: $BACKEND_PID)"
    echo "  Logs: tail -f backend.log"
    
    # Wait for backend to be ready
    echo "Waiting for backend to start..."
    for i in {1..30}; do
        if check_port 5000; then
            echo -e "${GREEN}✓${NC} Backend is ready on http://localhost:5000"
            break
        fi
        sleep 1
        echo -n "."
    done
    echo ""
fi

# Check if frontend is already running
if check_port 3000; then
    echo -e "${GREEN}✓${NC} Frontend is already running on port 3000"
    echo ""
    echo "=========================================="
    echo "  Application is ready!"
    echo "=========================================="
    echo ""
    echo "Backend:  http://localhost:5000"
    echo "Frontend: http://localhost:3000"
    echo ""
    echo "Demo Accounts:"
    echo "  Admin:     admin@devmonitor.com (password: admin123456)"
    echo "  Developer: developer@devmonitor.com (password: developer123)"
    echo "  Viewer:    viewer@devmonitor.com (password: viewer123)"
    echo ""
else
    echo -e "${YELLOW}⚠${NC} Frontend is not running."
    echo ""
    echo "To start the frontend, open a new terminal and run:"
    echo ""
    echo -e "  ${GREEN}cd dashboard && npm install && npm start${NC}"
    echo ""
    echo "Or run this in the background:"
    echo ""
    echo -e "  ${GREEN}cd dashboard && npm start > frontend.log 2>&1 &${NC}"
    echo ""
fi

echo "=========================================="
echo ""
echo "To stop the backend:"
echo "  kill $BACKEND_PID"
echo ""
echo "Or find and kill all node processes:"
echo "  pkill -f 'node'"
echo ""
