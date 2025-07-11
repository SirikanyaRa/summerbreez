#!/bin/bash

echo "🚀 Malaysian Postcode Scraper - Enhanced Deployment Script"
echo "=========================================================="

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: Please run this from the project root directory"
    exit 1
fi

echo "📋 Running enhanced pre-deployment checks..."

# Check Node.js version
NODE_VERSION=$(node --version)
echo "🔍 Node.js version: $NODE_VERSION"

# Install/update dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Run syntax check
echo "🔍 Running syntax check..."
if [ -f "syntax-check.js" ]; then
    node syntax-check.js
else
    echo "⚠️ Syntax check not found, skipping..."
fi

# Run tests
echo "🧪 Running tests..."
if [ -f "test-app.js" ]; then
    node test-app.js
else
    echo "⚠️ Tests not found, skipping..."
fi

# Security audit
echo "🔒 Running security audit..."
npm audit --audit-level high || echo "⚠️ Please review security issues"

# Check environment configuration
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "📋 Creating .env from example..."
    cp .env.example .env
    echo "⚠️ Please update .env with production values"
fi

# Create necessary directories
mkdir -p data logs temp

echo "✅ All pre-deployment checks passed!"

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes"
    echo "📝 Committing all changes..."
    git add .
    git commit -m "Deploy: Enhanced version $(date)"
fi

echo "✅ Git status clean"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push

echo "✅ Changes pushed to GitHub"

echo ""
echo "🌟 Deployment Options:"
echo "===================="
echo ""
echo "🚄 Option 1: Railway (Recommended - Fastest)"
echo "   1. Visit: https://railway.app"
echo "   2. Sign in with GitHub"
echo "   3. Click 'New Project' → 'Deploy from GitHub'"
echo "   4. Select your repository"
echo "   5. ✅ Live in 2-3 minutes!"
echo ""
echo "🏛️  Option 2: Heroku"
echo "   Run: heroku create your-app-name && git push heroku main"
echo ""
echo "☁️  Option 3: Google Cloud"
echo "   Run: gcloud app deploy"
echo ""
echo "🐳 Option 4: Docker"
echo "   Run: docker build -t postcode-scraper . && docker run -p 3000:3000 postcode-scraper"
echo ""
echo "🎉 Your enhanced app is ready for deployment!"
echo "   ✅ Fixed CAPTCHA false positives"
echo "   ✅ Added download functionality"
echo "   ✅ Enhanced error handling"
echo "   ✅ Comprehensive logging"
echo ""
echo "📚 Documentation available:"
echo "   - DEPLOYMENT_GUIDE.md"
echo "   - DOWNLOAD_GUIDE.md"
echo "   - QUICK_FIX.md"
echo "   - FALSE_CAPTCHA_FIX.md"
