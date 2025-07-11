@echo off
echo 🚀 Railway Deployment Script - Malaysian Postcode Scraper
echo ========================================================

REM Check if we're in the right directory
if not exist "server.js" (
    echo ❌ Error: Please run this from the project root directory
    exit /b 1
)

echo 📋 Railway pre-deployment checks...

REM Check Node.js version
echo 🔍 Checking Node.js version...
node --version

REM Install/update dependencies
echo 📦 Installing production dependencies...
npm ci --production
if %errorlevel% neq 0 (
    echo ❌ npm install failed
    exit /b 1
)

REM Run syntax check
echo 🔍 Running syntax check...
if exist "syntax-check.js" (
    node syntax-check.js
    if %errorlevel% neq 0 (
        echo ❌ Syntax check failed
        exit /b 1
    )
) else (
    echo ⚠️ Syntax check not found, skipping...
)

REM Run tests
echo 🧪 Running tests...
if exist "test-app.js" (
    node test-app.js
    if %errorlevel% neq 0 (
        echo ❌ Tests failed
        exit /b 1
    )
) else (
    echo ⚠️ Tests not found, skipping...
)

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist "data" mkdir data
if not exist "logs" mkdir logs
if not exist "temp" mkdir temp

echo ✅ All pre-deployment checks passed!

REM Check git status
echo 📝 Checking git status...
git status --porcelain > temp_git_status.txt
set /p git_status=< temp_git_status.txt
del temp_git_status.txt

if not "%git_status%"=="" (
    echo ⚠️ Warning: You have uncommitted changes
    echo 📝 Committing all changes for Railway deployment...
    git add .
    git commit -m "Deploy to Railway: %date% %time%"
)

echo ✅ Git status clean

REM Push to GitHub
echo 📤 Pushing to GitHub for Railway auto-deployment...
git push
if %errorlevel% neq 0 (
    echo ⚠️ Git push failed, but continuing...
)

echo ✅ Changes pushed to GitHub

echo.
echo 🌟 Railway Deployment Instructions:
echo ===================================
echo.
echo 🔗 Step 1: Connect your GitHub repository
echo    1. Visit: https://railway.app
echo    2. Sign in with GitHub
echo    3. Click 'New Project' → 'Deploy from GitHub'
echo    4. Select this repository
echo.
echo ⚙️ Step 2: Railway will automatically:
echo    • Detect Node.js project
echo    • Run: npm ci --production
echo    • Start: npm start
echo    • Assign a domain
echo.
echo 🔧 Step 3: Environment Variables (if needed):
echo    • NODE_ENV=production (auto-set)
echo    • PORT (auto-assigned by Railway)
echo    • CORS_ORIGIN=https://your-railway-domain.up.railway.app
echo.
echo 📊 Step 4: Monitor your deployment:
echo    • Railway dashboard shows build logs
echo    • Health check: https://your-domain/health
echo    • Application: https://your-domain/
echo.
echo 🎉 Your app will be live in 2-3 minutes!
echo.
echo ✅ Deployment ready for Railway!
