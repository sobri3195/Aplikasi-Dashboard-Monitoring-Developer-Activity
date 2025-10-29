#!/bin/bash

# Simple login test script
# Usage: ./test_login.sh

echo "Testing login functionality..."
echo ""

# Make sure backend is running
if ! curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "❌ Backend is not running. Please start it with:"
    echo "   cd backend && npm start"
    exit 1
fi

echo "✅ Backend is running"
echo ""

# Test login with admin account
echo "Testing login with admin account..."
response=$(curl -s -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@devmonitor.com","password":"admin123456"}')

if echo "$response" | grep -q '"success":true'; then
    echo "✅ Login successful!"
    echo ""
    echo "User details:"
    echo "$response" | jq '.data.user'
    exit 0
else
    echo "❌ Login failed!"
    echo "Response: $response"
    exit 1
fi
