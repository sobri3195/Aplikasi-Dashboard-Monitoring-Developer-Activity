#!/bin/bash

# Test all demo accounts login
echo "================================================"
echo "Testing All Demo Account Logins"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if backend is running
if ! curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend is not running on port 5000${NC}"
    echo "Please start the backend first:"
    echo "  cd backend && npm start"
    exit 1
fi

echo -e "${GREEN}✅ Backend is running${NC}"
echo ""

# Demo accounts to test
declare -a accounts=(
    "admin@devmonitor.com:admin123456:Admin"
    "developer@devmonitor.com:developer123:Developer"
    "viewer@devmonitor.com:viewer123:Viewer"
    "john.doe@example.com:john123:Developer"
    "jane.smith@example.com:jane123:Developer"
    "alex.johnson@example.com:alex123:Admin"
)

success_count=0
fail_count=0

# Test each account
for account in "${accounts[@]}"; do
    IFS=':' read -r email password role <<< "$account"
    
    echo -e "${YELLOW}Testing: ${email} (${role})${NC}"
    
    response=$(curl -s -X POST http://localhost:5000/api/auth/login \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"${email}\",\"password\":\"${password}\"}")
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Login successful!${NC}"
        # Extract user info
        user_name=$(echo "$response" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
        user_role=$(echo "$response" | grep -o '"role":"[^"]*"' | cut -d'"' -f4)
        echo -e "   Name: ${user_name}, Role: ${user_role}"
        ((success_count++))
    else
        echo -e "${RED}❌ Login failed!${NC}"
        error=$(echo "$response" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
        if [ -n "$error" ]; then
            echo -e "   Error: ${error}"
        else
            echo -e "   Response: ${response}"
        fi
        ((fail_count++))
    fi
    echo ""
done

echo "================================================"
echo "Test Summary"
echo "================================================"
echo -e "Total accounts tested: ${#accounts[@]}"
echo -e "${GREEN}Successful logins: ${success_count}${NC}"
if [ $fail_count -gt 0 ]; then
    echo -e "${RED}Failed logins: ${fail_count}${NC}"
fi
echo ""

if [ $fail_count -eq 0 ]; then
    echo -e "${GREEN}🎉 All demo accounts working perfectly!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some accounts failed. Check the errors above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "  1. Make sure database is seeded: cd backend && npm run db:seed"
    echo "  2. Check backend logs for detailed errors"
    echo "  3. Verify .env configuration"
    exit 1
fi
