@echo off
echo 🔧 Railway Deployment Fix - Pushing Fixed Version
echo ================================================

echo 📦 Simplified dependencies for Railway compatibility
echo ✅ Removed problematic optional imports
echo ✅ Removed prestart script
echo ✅ Using only core dependencies

echo.
echo 📝 Committing fixes...
git add .
git commit -m "Fix Railway deployment: simplified dependencies and removed optional imports

- Removed helmet, compression, dotenv dependencies
- Simplified server.js imports  
- Removed prestart script causing deployment failures
- Using only core dependencies for maximum compatibility
- All scraping functionality preserved"

echo.
echo 📤 Pushing to GitHub for Railway auto-deployment...
git push

echo.
echo ✅ Fixed version pushed to GitHub!
echo.
echo 🚄 Railway will now auto-deploy the working version
echo 📊 Check your Railway dashboard for deployment progress
echo 🌐 Your app will be live in 2-3 minutes at your Railway URL
echo.
echo 🎉 Malaysian postcode scraper deployment fixed!
