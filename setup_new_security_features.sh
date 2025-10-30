#!/bin/bash

echo "🔐 Setting up New Security Features for DevMonitor"
echo "=================================================="
echo ""

# Change to backend directory
cd backend

echo "📦 Step 1: Generating Prisma Client..."
npm run prisma:generate

echo ""
echo "🗄️  Step 2: Running Database Migrations..."
npm run migrate:deploy

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📋 New Features Available:"
echo "  1. Developer Behavior Risk Scoring"
echo "  2. Repository Integrity Verification (Hash Lock)"
echo "  3. AI-powered Activity Anomaly Detection"
echo "  4. Compliance & Audit Trail Module"
echo "  5. Developer Access Token Vault & Rotation System"
echo ""
echo "📖 See NEW_SECURITY_FEATURES.md for detailed documentation"
echo ""
echo "🚀 To start the backend server:"
echo "   cd backend && npm run dev"
echo ""
echo "🌐 API Endpoints:"
echo "   - /api/developer-risk-scoring"
echo "   - /api/repository-integrity"
echo "   - /api/ai-anomaly-detection"
echo "   - /api/compliance-audit"
echo "   - /api/token-vault"
echo ""
