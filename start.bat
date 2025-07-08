@echo off
echo ===========================================
echo   Malaysian Postcode Scraper - Startup
echo ===========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

:: Check if npm dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

:: Check data directory
if not exist "data" (
    echo ERROR: Data directory not found
    echo Please ensure the data folder exists with JSON files
    pause
    exit /b 1
)

echo Data files found:
dir /b data\*.json
echo.

:: Start the server
echo Starting server on http://localhost:3000...
echo.
echo ===========================================
echo  OPEN YOUR BROWSER TO: http://localhost:3000
echo ===========================================
echo.
echo Press Ctrl+C to stop the server
echo.

node server.js

echo.
echo Server stopped.
pause
