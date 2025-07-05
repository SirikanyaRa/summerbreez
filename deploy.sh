#!/bin/bash

echo "🚀 Malaysian Postcode Scraper - Deployment Helper"
echo "=================================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    echo "node_modules/" > .gitignore
    echo ".env" >> .gitignore
fi

echo ""
echo "Choose your deployment platform:"
echo "1. Heroku (Free tier available)"
echo "2. Railway (Modern & Fast)"
echo "3. Render (Free tier available)" 
echo "4. DigitalOcean App Platform"
echo "5. Docker (Self-hosted)"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🟣 Deploying to Heroku..."
        echo "1. Make sure you have Heroku CLI installed"
        echo "2. Run: heroku login"
        echo "3. Run: heroku create your-app-name"
        echo "4. Run: git add . && git commit -m 'Deploy to Heroku'"
        echo "5. Run: git push heroku main"
        ;;
    2)
        echo "🟪 Deploying to Railway..."
        echo "1. Push your code to GitHub"
        echo "2. Visit railway.app and connect GitHub"
        echo "3. Select your repository"
        echo "4. Railway will auto-deploy!"
        ;;
    3)
        echo "🟦 Deploying to Render..."
        echo "1. Push your code to GitHub"
        echo "2. Visit render.com and connect GitHub"
        echo "3. Create new Web Service"
        echo "4. Select your repository"
        echo "5. Build: npm install"
        echo "6. Start: npm start"
        ;;
    4)
        echo "🟨 Deploying to DigitalOcean..."
        echo "1. Push your code to GitHub"
        echo "2. Visit cloud.digitalocean.com/apps"
        echo "3. Connect GitHub repository"
        echo "4. Configure build settings"
        ;;
    5)
        echo "🐳 Docker Deployment..."
        if command -v docker &> /dev/null; then
            echo "Building Docker image..."
            docker build -t postcode-scraper .
            echo "✅ Docker image built successfully!"
            echo "Run with: docker run -p 3000:3000 postcode-scraper"
        else
            echo "❌ Docker not found. Please install Docker first."
        fi
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        ;;
esac

echo ""
echo "📚 For detailed instructions, check README.md"
echo "🌐 Your app will be available on the platform's provided URL"
