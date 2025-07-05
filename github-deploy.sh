#!/bin/bash

echo "🚀 GitHub Deployment Helper for Postcode Scraper"
echo "================================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    git branch -M main
fi

# Check if .gitignore exists
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << EOF
node_modules/
.env
.env.local
*.log
.DS_Store
EOF
fi

echo ""
echo "Choose your GitHub deployment option:"
echo "1. GitHub + Railway (Recommended - Fastest)"
echo "2. GitHub + Render (Free tier available)"
echo "3. GitHub + Heroku (Classic choice)"
echo "4. GitHub Actions (Automated CI/CD)"
echo "5. Just push to GitHub (manual deploy later)"
echo ""

read -p "Enter your choice (1-5): " choice

echo ""
read -p "Enter your GitHub username: " github_user
read -p "Enter your repository name (e.g., postcode-scraper): " repo_name

case $choice in
    1)
        echo "🟣 Setting up GitHub + Railway deployment..."
        echo ""
        echo "📋 Steps to complete:"
        echo "1. Create GitHub repository at: https://github.com/new"
        echo "   Repository name: $repo_name"
        echo ""
        echo "2. Run these commands:"
        echo "   git add ."
        echo "   git commit -m 'Initial commit'"
        echo "   git remote add origin https://github.com/$github_user/$repo_name.git"
        echo "   git push -u origin main"
        echo ""
        echo "3. Deploy with Railway:"
        echo "   - Visit: https://railway.app"
        echo "   - Sign in with GitHub"
        echo "   - Click 'New Project' → 'Deploy from GitHub'"
        echo "   - Select: $github_user/$repo_name"
        echo "   - ✅ Done! Railway will auto-deploy"
        ;;
    2)
        echo "🟦 Setting up GitHub + Render deployment..."
        echo ""
        echo "📋 Steps to complete:"
        echo "1. Create GitHub repository and push code (same as above)"
        echo ""
        echo "2. Deploy with Render:"
        echo "   - Visit: https://render.com"
        echo "   - Sign in with GitHub"
        echo "   - Click 'New Web Service'"
        echo "   - Connect: $github_user/$repo_name"
        echo "   - Build Command: npm install"
        echo "   - Start Command: npm start"
        echo "   - ✅ Free tier available!"
        ;;
    3)
        echo "🟠 Setting up GitHub + Heroku deployment..."
        echo ""
        echo "📋 Steps to complete:"
        echo "1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli"
        echo "2. Create GitHub repository and push code"
        echo "3. Run these commands:"
        echo "   heroku login"
        echo "   heroku create $repo_name"
        echo "   git push heroku main"
        ;;
    4)
        echo "🤖 Setting up GitHub Actions (Automated CI/CD)..."
        echo ""
        echo "📋 Steps to complete:"
        echo "1. Create GitHub repository and push code"
        echo "2. Add GitHub Secrets (Settings → Secrets and variables → Actions):"
        echo "   - HEROKU_API_KEY (if using Heroku)"
        echo "   - HEROKU_APP_NAME (if using Heroku)"
        echo "   - RAILWAY_TOKEN (if using Railway)"
        echo "   - RENDER_DEPLOY_HOOK_URL (if using Render)"
        echo "3. ✅ GitHub Actions will auto-deploy on every push!"
        ;;
    5)
        echo "📁 Setting up GitHub repository only..."
        echo ""
        echo "📋 Steps to complete:"
        echo "1. Create repository at: https://github.com/new"
        echo "2. Run these commands:"
        echo "   git add ."
        echo "   git commit -m 'Initial commit'"
        echo "   git remote add origin https://github.com/$github_user/$repo_name.git"
        echo "   git push -u origin main"
        echo "3. Choose deployment later from: Railway, Render, Heroku"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🔗 Useful Links:"
echo "Repository URL: https://github.com/$github_user/$repo_name"
echo "Railway: https://railway.app"
echo "Render: https://render.com" 
echo "Heroku: https://heroku.com"
echo ""
echo "📚 For detailed instructions, check GITHUB_DEPLOYMENT.md"
echo "🌐 Your app will be publicly accessible once deployed!"

# Prepare git commands
if [ "$choice" != "4" ]; then
    echo ""
    echo "🚀 Ready to push to GitHub? Run these commands:"
    echo "git add ."
    echo "git commit -m 'Deploy postcode scraper app'"
    echo "git remote add origin https://github.com/$github_user/$repo_name.git"
    echo "git push -u origin main"
fi
