@echo off
echo ===============================
echo Docker Deployment Preparation
echo ===============================
echo.

echo 1. Building Docker image...
docker build -t postcode-scraper .
if %errorlevel% neq 0 (
    echo Error: Failed to build Docker image
    exit /b 1
)

echo 2. Running Docker container...
docker run -d -p 3000:3000 --name postcode-scraper-app postcode-scraper
if %errorlevel% neq 0 (
    echo Error: Failed to start Docker container
    exit /b 1
)

echo ===============================
echo Deployment completed successfully!
echo ===============================
echo.
echo Application is running at: http://localhost:3000
echo.

exit /b 0
