@echo off
echo ===============================
echo Railway Docker Deployment Preparation
echo ===============================
echo.

echo 1. Preparing Railway Dockerfile...
copy Dockerfile.railway Dockerfile.deploy /Y
if %errorlevel% neq 0 (
    echo Error: Failed to copy Railway Dockerfile
    exit /b 1
)

echo 2. Creating temp deployment directory...
mkdir railway-deploy 2>nul
xcopy /E /Y . railway-deploy\ > nul
if %errorlevel% neq 0 (
    echo Error: Failed to create deployment directory
    exit /b 1
)

echo 3. Setting up deployment files...
cd railway-deploy
copy ..\Dockerfile.deploy Dockerfile /Y
echo NODE_ENV=production > .env

echo 4. Checking Railway CLI...
where railway >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Railway CLI not found. Please install it with 'npm install -g @railway/cli'
    echo You can also install it from https://docs.railway.app/guides/cli
    cd ..
    exit /b 1
)

echo 5. Logging in to Railway (if needed)...
railway whoami >nul 2>nul
if %errorlevel% neq 0 (
    echo You need to log in to Railway first.
    railway login
    if %errorlevel% neq 0 (
        echo Failed to log in to Railway.
        cd ..
        exit /b 1
    )
)

echo 6. Deploying to Railway...
railway up
if %errorlevel% neq 0 (
    echo Deployment failed. See error messages above.
    cd ..
    exit /b 1
)

echo 7. Cleaning up...
cd ..
rmdir /S /Q railway-deploy

echo ===============================
echo Railway Deployment completed successfully!
echo ===============================
echo.
echo Visit your application on Railway dashboard: https://railway.app/dashboard
echo.

exit /b 0
