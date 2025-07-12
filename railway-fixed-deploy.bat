@echo off
echo ===============================
echo Railway Deployment Preparation
echo ===============================
echo.

echo 1. Preparing deployment files...
copy deploy-package.json package.json /Y
if %errorlevel% neq 0 (
    echo Error: Failed to copy deployment package.json
    exit /b 1
)

echo 2. Creating debug directory if needed...
mkdir debug 2>nul

echo 3. Creating data directory if needed...
mkdir data 2>nul

echo 4. Checking Railway CLI...
railway version 2>nul
if %errorlevel% neq 0 (
    echo Error: Railway CLI not found. Please install it using:
    echo npm i -g @railway/cli
    exit /b 1
)

echo 5. Running deployment...
railway up

echo 6. Restoring development package.json...
git checkout -- package.json
if %errorlevel% neq 0 (
    echo Warning: Could not restore package.json from git. 
    echo Please run 'git checkout -- package.json' manually.
)

echo.
echo ===============================
echo Deployment process complete!
echo ===============================
echo.
echo Check Railway dashboard for deployment status.
echo.
