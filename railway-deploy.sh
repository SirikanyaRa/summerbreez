#!/bin/bash

echo "🚀 Railway Deployment Script - Malaysian Postcode Scraper"
echo "========================================================"

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: Please run this from the project root directory"
    exit 1
fi

echo "📋 Railway pre-deployment checks..."

# Check Node.js version
NODE_VERSION=$(node --version)
echo "🔍 Node.js version: $NODE_VERSION"

# Install/update dependencies
echo "📦 Installing production dependencies..."
npm ci --production

# Run syntax check
echo "🔍 Running syntax check..."
if [ -f "syntax-check.js" ]; then
    node syntax-check.js
    if [ $? -ne 0 ]; then
        echo "❌ Syntax check failed"
        exit 1
    fi
else
    echo "⚠️ Syntax check not found, skipping..."
fi

# Run tests
echo "🧪 Running tests..."
if [ -f "test-app.js" ]; then
    node test-app.js
    if [ $? -ne 0 ]; then
        echo "❌ Tests failed"
        exit 1
    fi
else
    echo "⚠️ Tests not found, skipping..."
fi

# Create necessary directories
mkdir -p data logs temp

echo "✅ All pre-deployment checks passed!"

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes"
    echo "📝 Committing all changes for Railway deployment..."
    git add .
    git commit -m "Deploy to Railway: $(date)"
fi

echo "✅ Git status clean"

# Push to GitHub (Railway will auto-deploy)
echo "📤 Pushing to GitHub for Railway auto-deployment..."
git push

echo "✅ Changes pushed to GitHub"

echo ""
echo "🌟 Railway Deployment Instructions:"
echo "==================================="
echo ""
echo "🔗 Step 1: Connect your GitHub repository"
echo "   1. Visit: https://railway.app"
echo "   2. Sign in with GitHub"
echo "   3. Click 'New Project' → 'Deploy from GitHub'"
echo "   4. Select this repository"
echo ""
echo "⚙️  Step 2: Railway will automatically:"
echo "   • Detect Node.js project"
echo "   • Run: npm ci --production"
echo "   • Start: npm start"
echo "   • Assign a domain"
echo ""
echo "🔧 Step 3: Environment Variables (if needed):"
echo "   • NODE_ENV=production (auto-set)"
echo "   • PORT (auto-assigned by Railway)"
echo "   • CORS_ORIGIN=https://your-railway-domain.up.railway.app"
echo ""
echo "📊 Step 4: Monitor your deployment:"
echo "   • Railway dashboard shows build logs"
echo "   • Health check: https://your-domain/health"
echo "   • Application: https://your-domain/"
echo ""
echo "🎉 Your app will be live in 2-3 minutes!"
echo ""
echo "📱 Railway Features Available:"
echo "   • Auto-scaling based on traffic"
echo "   • Automatic HTTPS"
echo "   • Built-in monitoring"
echo "   • Easy rollbacks"
echo "   • Environment variable management"
echo ""
echo "✅ Deployment ready for Railway!"
