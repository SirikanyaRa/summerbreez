#!/bin/bash

echo "🚀 Malaysian Postcode Scraper - Deployment Script"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: Please run this from the project root directory"
    exit 1
fi

echo "📋 Pre-deployment checks..."

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes"
    echo "📝 Committing all changes..."
    git add .
    git commit -m "Deploy: $(date)"
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
