#!/bin/bash

# Test script to verify the connection refused fix is working properly

echo "=========================================="
echo "  Connection Refused Fix - Test Suite"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to print test results
pass() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
    ((TESTS_PASSED++))
}

fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    ((TESTS_FAILED++))
}

info() {
    echo -e "${BLUE}ℹ INFO${NC}: $1"
}

# Test 1: Check if dashboard/.env exists
echo -e "\n${YELLOW}Test 1${NC}: Checking if dashboard/.env file exists..."
if [ -f "dashboard/.env" ]; then
    pass "dashboard/.env file exists"
    
    # Check if it contains the correct configuration
    if grep -q "REACT_APP_API_URL=http://localhost:5000" dashboard/.env; then
        pass "dashboard/.env contains correct API URL"
    else
        fail "dashboard/.env missing correct API URL"
    fi
else
    fail "dashboard/.env file does not exist"
    info "Run: cp dashboard/.env.example dashboard/.env"
fi

# Test 2: Check if Login.js has improved error handling
echo -e "\n${YELLOW}Test 2${NC}: Checking if Login.js has improved error handling..."
if grep -q "ERR_NETWORK" dashboard/src/pages/Login.js; then
    pass "Login.js contains ERR_NETWORK error handling"
else
    fail "Login.js missing ERR_NETWORK error handling"
fi

if grep -q "Cannot connect to backend" dashboard/src/pages/Login.js; then
    pass "Login.js contains helpful error message"
else
    fail "Login.js missing helpful error message"
fi

# Test 3: Check if Login.js has backend warning indicator
echo -e "\n${YELLOW}Test 3${NC}: Checking if Login.js has backend warning indicator..."
if grep -q "Backend Required" dashboard/src/pages/Login.js; then
    pass "Login.js contains backend requirement warning"
else
    fail "Login.js missing backend requirement warning"
fi

if grep -q "cd backend && npm start" dashboard/src/pages/Login.js; then
    pass "Login.js shows command to start backend"
else
    fail "Login.js missing backend start command"
fi

# Test 4: Check if api.js has improved error interceptor
echo -e "\n${YELLOW}Test 4${NC}: Checking if api.js has improved error interceptor..."
if grep -q "error.code = 'ERR_NETWORK'" dashboard/src/services/api.js; then
    pass "api.js sets ERR_NETWORK code for network errors"
else
    fail "api.js missing ERR_NETWORK code setting"
fi

# Test 5: Check if SocketContext.js has connect_error handler
echo -e "\n${YELLOW}Test 5${NC}: Checking if SocketContext.js has error handling..."
if grep -q "connect_error" dashboard/src/context/SocketContext.js; then
    pass "SocketContext.js handles connection errors"
else
    fail "SocketContext.js missing connect_error handler"
fi

# Test 6: Check if documentation files exist
echo -e "\n${YELLOW}Test 6${NC}: Checking if documentation files exist..."
docs=(
    "START_HERE.md"
    "TROUBLESHOOTING_CONNECTION_REFUSED.md"
    "FIX_SUMMARY_CONNECTION_REFUSED.md"
)

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        pass "$doc exists"
    else
        fail "$doc does not exist"
    fi
done

# Test 7: Check if startup script exists and is executable
echo -e "\n${YELLOW}Test 7${NC}: Checking if startup script exists..."
if [ -f "start_app.sh" ]; then
    pass "start_app.sh exists"
    
    if [ -x "start_app.sh" ]; then
        pass "start_app.sh is executable"
    else
        fail "start_app.sh is not executable"
        info "Run: chmod +x start_app.sh"
    fi
else
    fail "start_app.sh does not exist"
fi

# Test 8: Check if README.md mentions the fix
echo -e "\n${YELLOW}Test 8${NC}: Checking if README.md mentions connection refused fix..."
if grep -q "ERR_CONNECTION_REFUSED" README.md; then
    pass "README.md documents connection refused error"
else
    fail "README.md missing connection refused documentation"
fi

if grep -q "TROUBLESHOOTING_CONNECTION_REFUSED.md" README.md; then
    pass "README.md links to troubleshooting guide"
else
    fail "README.md missing link to troubleshooting guide"
fi

# Test 9: Verify Node.js dependencies
echo -e "\n${YELLOW}Test 9${NC}: Checking Node.js dependencies..."
if [ -d "backend/node_modules" ]; then
    pass "Backend dependencies installed"
else
    info "Backend dependencies not installed"
    info "Run: cd backend && npm install"
fi

if [ -d "dashboard/node_modules" ]; then
    pass "Dashboard dependencies installed"
else
    info "Dashboard dependencies not installed"
    info "Run: cd dashboard && npm install"
fi

# Test 10: Check if backend can be started (dry run)
echo -e "\n${YELLOW}Test 10${NC}: Checking backend configuration..."
if [ -f "backend/src/index.js" ]; then
    pass "Backend entry point exists"
else
    fail "Backend entry point missing"
fi

if [ -f "backend/package.json" ]; then
    if grep -q '"start"' backend/package.json; then
        pass "Backend has start script"
    else
        fail "Backend missing start script"
    fi
else
    fail "Backend package.json missing"
fi

# Summary
echo ""
echo "=========================================="
echo "  Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed${NC}: $TESTS_PASSED"
echo -e "${RED}Failed${NC}: $TESTS_FAILED"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "The connection refused fix is properly implemented."
    echo ""
    echo "Next steps:"
    echo "1. Start backend: ./start_app.sh"
    echo "2. Start frontend: cd dashboard && npm start"
    echo "3. Test login at: http://localhost:3000"
    exit 0
else
    echo -e "${RED}✗ Some tests failed!${NC}"
    echo ""
    echo "Please review the failed tests above and fix the issues."
    exit 1
fi
