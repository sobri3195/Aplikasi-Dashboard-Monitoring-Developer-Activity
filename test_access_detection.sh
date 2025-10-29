#!/bin/bash

# Test Access Detection & Protection System
# Tests the new access detection features

set -e

echo "======================================================================="
echo "Access Detection & Protection - Test Suite"
echo "======================================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
API_URL="${API_URL:-http://localhost:5000}"
TEST_RESULTS=()

# Helper function to test endpoint
test_endpoint() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    
    echo -n "Testing: $test_name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL$endpoint" \
            -H "Content-Type: application/json" 2>/dev/null || echo "000")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null || echo "000")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    
    if [ "$status_code" = "$expected_status" ] || [ "$status_code" = "200" ] || [ "$status_code" = "201" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $status_code)"
        TEST_RESULTS+=("PASS: $test_name")
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Status: $status_code, Expected: $expected_status)"
        TEST_RESULTS+=("FAIL: $test_name")
        return 1
    fi
}

echo -e "${BLUE}Step 1: Checking backend server...${NC}"
if curl -s "$API_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend server is running${NC}"
else
    echo -e "${RED}✗ Backend server is not running${NC}"
    echo "Please start the backend server first:"
    echo "  cd backend && npm start"
    exit 1
fi
echo ""

echo -e "${BLUE}Step 2: Testing Access Detection Routes${NC}"
echo ""

# Test 1: Health check
test_endpoint "Health Check" "GET" "/health" "" "200"

# Test 2: Check if access detection routes exist
echo ""
echo -e "${YELLOW}Note: Following tests require authentication.${NC}"
echo -e "${YELLOW}These are structure tests to verify routes are registered.${NC}"
echo ""

# Test 3: Monitor operation endpoint structure (will fail auth but route should exist)
echo -n "Testing: Monitor Operation Endpoint Registration... "
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/access-detection/monitor-operation" \
    -H "Content-Type: application/json" \
    -d '{}' 2>/dev/null)
status_code=$(echo "$response" | tail -n1)
# 401 = Unauthorized (route exists, just not authenticated)
# 403 = Forbidden (route exists)
# 404 = Not Found (route doesn't exist)
if [ "$status_code" = "401" ] || [ "$status_code" = "403" ] || [ "$status_code" = "400" ]; then
    echo -e "${GREEN}✓ PASS${NC} (Route registered, Status: $status_code)"
    TEST_RESULTS+=("PASS: Monitor Operation Endpoint")
elif [ "$status_code" = "404" ]; then
    echo -e "${RED}✗ FAIL${NC} (Route not found)"
    TEST_RESULTS+=("FAIL: Monitor Operation Endpoint")
else
    echo -e "${YELLOW}⚠ UNKNOWN${NC} (Status: $status_code)"
    TEST_RESULTS+=("UNKNOWN: Monitor Operation Endpoint")
fi

echo -n "Testing: Check Movement Endpoint Registration... "
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/access-detection/check-movement" \
    -H "Content-Type: application/json" \
    -d '{}' 2>/dev/null)
status_code=$(echo "$response" | tail -n1)
if [ "$status_code" = "401" ] || [ "$status_code" = "403" ] || [ "$status_code" = "400" ]; then
    echo -e "${GREEN}✓ PASS${NC} (Route registered, Status: $status_code)"
    TEST_RESULTS+=("PASS: Check Movement Endpoint")
elif [ "$status_code" = "404" ]; then
    echo -e "${RED}✗ FAIL${NC} (Route not found)"
    TEST_RESULTS+=("FAIL: Check Movement Endpoint")
else
    echo -e "${YELLOW}⚠ UNKNOWN${NC} (Status: $status_code)"
    TEST_RESULTS+=("UNKNOWN: Check Movement Endpoint")
fi

echo -n "Testing: Verify Transfer Endpoint Registration... "
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/access-detection/verify-transfer" \
    -H "Content-Type: application/json" \
    -d '{}' 2>/dev/null)
status_code=$(echo "$response" | tail -n1)
if [ "$status_code" = "401" ] || [ "$status_code" = "403" ] || [ "$status_code" = "400" ]; then
    echo -e "${GREEN}✓ PASS${NC} (Route registered, Status: $status_code)"
    TEST_RESULTS+=("PASS: Verify Transfer Endpoint")
elif [ "$status_code" = "404" ]; then
    echo -e "${RED}✗ FAIL${NC} (Route not found)"
    TEST_RESULTS+=("FAIL: Verify Transfer Endpoint")
else
    echo -e "${YELLOW}⚠ UNKNOWN${NC} (Status: $status_code)"
    TEST_RESULTS+=("UNKNOWN: Verify Transfer Endpoint")
fi

echo -n "Testing: Stats Endpoint Registration... "
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/access-detection/stats" 2>/dev/null)
status_code=$(echo "$response" | tail -n1)
if [ "$status_code" = "401" ] || [ "$status_code" = "403" ] || [ "$status_code" = "400" ]; then
    echo -e "${GREEN}✓ PASS${NC} (Route registered, Status: $status_code)"
    TEST_RESULTS+=("PASS: Stats Endpoint")
elif [ "$status_code" = "404" ]; then
    echo -e "${RED}✗ FAIL${NC} (Route not found)"
    TEST_RESULTS+=("FAIL: Stats Endpoint")
else
    echo -e "${YELLOW}⚠ UNKNOWN${NC} (Status: $status_code)"
    TEST_RESULTS+=("UNKNOWN: Stats Endpoint")
fi

echo -n "Testing: Dashboard Endpoint Registration... "
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/access-detection/dashboard" 2>/dev/null)
status_code=$(echo "$response" | tail -n1)
if [ "$status_code" = "401" ] || [ "$status_code" = "403" ] || [ "$status_code" = "400" ]; then
    echo -e "${GREEN}✓ PASS${NC} (Route registered, Status: $status_code)"
    TEST_RESULTS+=("PASS: Dashboard Endpoint")
elif [ "$status_code" = "404" ]; then
    echo -e "${RED}✗ FAIL${NC} (Route not found)"
    TEST_RESULTS+=("FAIL: Dashboard Endpoint")
else
    echo -e "${YELLOW}⚠ UNKNOWN${NC} (Status: $status_code)"
    TEST_RESULTS+=("UNKNOWN: Dashboard Endpoint")
fi

echo ""
echo -e "${BLUE}Step 3: Testing Python Agent${NC}"
echo ""

if [ -f "monitoring-agent/access_detection_agent.py" ]; then
    echo -e "${GREEN}✓ Access detection agent found${NC}"
    TEST_RESULTS+=("PASS: Agent file exists")
    
    # Check if agent is executable
    if [ -x "monitoring-agent/access_detection_agent.py" ]; then
        echo -e "${GREEN}✓ Agent is executable${NC}"
        TEST_RESULTS+=("PASS: Agent is executable")
    else
        echo -e "${YELLOW}⚠ Agent is not executable (fixing...)${NC}"
        chmod +x monitoring-agent/access_detection_agent.py
        TEST_RESULTS+=("FIXED: Agent executable permission")
    fi
    
    # Test agent help
    echo -n "Testing: Agent CLI... "
    if python3 monitoring-agent/access_detection_agent.py --help > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        TEST_RESULTS+=("PASS: Agent CLI works")
    else
        echo -e "${RED}✗ FAIL${NC}"
        TEST_RESULTS+=("FAIL: Agent CLI")
    fi
else
    echo -e "${RED}✗ Access detection agent not found${NC}"
    TEST_RESULTS+=("FAIL: Agent file not found")
fi

echo ""
echo -e "${BLUE}Step 4: Checking Dependencies${NC}"
echo ""

# Check Python
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}✓ Python 3 installed${NC}"
    TEST_RESULTS+=("PASS: Python 3")
else
    echo -e "${RED}✗ Python 3 not found${NC}"
    TEST_RESULTS+=("FAIL: Python 3")
fi

# Check Node.js
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓ Node.js installed${NC}"
    TEST_RESULTS+=("PASS: Node.js")
else
    echo -e "${RED}✗ Node.js not found${NC}"
    TEST_RESULTS+=("FAIL: Node.js")
fi

# Check Git
if command -v git &> /dev/null; then
    echo -e "${GREEN}✓ Git installed${NC}"
    TEST_RESULTS+=("PASS: Git")
else
    echo -e "${RED}✗ Git not found${NC}"
    TEST_RESULTS+=("FAIL: Git")
fi

echo ""
echo "======================================================================="
echo "Test Results Summary"
echo "======================================================================="
echo ""

PASS_COUNT=0
FAIL_COUNT=0
UNKNOWN_COUNT=0

for result in "${TEST_RESULTS[@]}"; do
    if [[ $result == PASS:* ]]; then
        ((PASS_COUNT++))
        echo -e "${GREEN}✓${NC} ${result#PASS: }"
    elif [[ $result == FAIL:* ]]; then
        ((FAIL_COUNT++))
        echo -e "${RED}✗${NC} ${result#FAIL: }"
    elif [[ $result == FIXED:* ]]; then
        ((PASS_COUNT++))
        echo -e "${YELLOW}⚙${NC} ${result#FIXED: }"
    else
        ((UNKNOWN_COUNT++))
        echo -e "${YELLOW}⚠${NC} ${result#UNKNOWN: }"
    fi
done

echo ""
echo "======================================================================="
echo -e "Total Tests: $((PASS_COUNT + FAIL_COUNT + UNKNOWN_COUNT))"
echo -e "${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "${RED}Failed: $FAIL_COUNT${NC}"
if [ $UNKNOWN_COUNT -gt 0 ]; then
    echo -e "${YELLOW}Unknown: $UNKNOWN_COUNT${NC}"
fi
echo "======================================================================="
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ All critical tests passed!${NC}"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Run setup script: ./setup_access_detection.sh"
    echo "2. Register your device"
    echo "3. Start monitoring with: cd monitoring-agent && python3 access_detection_agent.py --watch"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please fix the issues above.${NC}"
    echo ""
    exit 1
fi
