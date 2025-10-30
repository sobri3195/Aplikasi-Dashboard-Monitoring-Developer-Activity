#!/bin/bash

echo "🧪 Testing New Security Features"
echo "================================"
echo ""

BASE_URL="${API_BASE_URL:-http://localhost:5000/api}"

echo "Testing Feature 1: Developer Risk Scoring"
echo "----------------------------------------"
echo "GET $BASE_URL/developer-risk-scoring/stats"
curl -s "$BASE_URL/developer-risk-scoring/stats" | jq . || echo "Note: Backend must be running"
echo ""

echo "Testing Feature 2: Repository Integrity"
echo "---------------------------------------"
echo "GET $BASE_URL/repository-integrity/stats"
curl -s "$BASE_URL/repository-integrity/stats" | jq . || echo "Note: Backend must be running"
echo ""

echo "Testing Feature 3: AI Anomaly Detection"
echo "---------------------------------------"
echo "Note: Requires user ID for testing"
echo ""

echo "Testing Feature 4: Compliance & Audit"
echo "-------------------------------------"
echo "GET $BASE_URL/compliance-audit/dashboard"
curl -s "$BASE_URL/compliance-audit/dashboard" | jq . || echo "Note: Backend must be running"
echo ""

echo "Testing Feature 5: Token Vault"
echo "------------------------------"
echo "GET $BASE_URL/token-vault/stats"
curl -s "$BASE_URL/token-vault/stats" | jq . || echo "Note: Backend must be running"
echo ""

echo "✅ Testing Complete!"
echo ""
echo "💡 For detailed testing, see NEW_SECURITY_FEATURES.md"
