# Quick Fix: "Failed to fetch" Error

## Problem
Getting "Error loading data files: Failed to fetch" when opening the application.

## Root Cause
The server is not running, so the frontend cannot connect to fetch the data files.

## Solution

### Step 1: Check Prerequisites
```bash
# Check if Node.js is installed
node --version

# If not installed, download from: https://nodejs.org/
```

### Step 2: Install Dependencies
```bash
# Navigate to the project directory
cd "c:\Users\srattana\Documents\alltime\webScrapAgent\jira_request\postcode_mys\forDeploying"

# Install required packages
npm install
```

### Step 3: Run Diagnostics (Optional)
```bash
# Check if everything is set up correctly
node diagnose.js
```

### Step 4: Start the Server
**Option A: Use the startup script**
```bash
# Double-click start.bat
# OR from command line:
start.bat
```

**Option B: Manual start**
```bash
node server.js
```

### Step 5: Open the Application
1. Wait for the message: "🚀 Postcode Scraper App running on http://localhost:3000"
2. Open your browser to: http://localhost:3000
3. You should now see the data files loaded

## Expected Output When Working

**Server Console:**
```
🚀 Postcode Scraper App running on http://localhost:3000
📁 Data files available in: C:\Users\...\data
🔧 Scraper script location: C:\Users\...\script
```

**Browser:**
- Should show available data files (perlis_1.json, pahang_15.json, etc.)
- No "Failed to fetch" error

## Troubleshooting

### If you still get "Failed to fetch":
1. **Check if server is running**: Look for the server startup message
2. **Check port conflicts**: Make sure nothing else is using port 3000
3. **Firewall issues**: Temporarily disable firewall to test
4. **Browser cache**: Try Ctrl+F5 to refresh or use incognito mode

### If server won't start:
1. **Dependencies**: Run `npm install` again
2. **Node version**: Ensure Node.js version 18+ is installed
3. **File permissions**: Run as administrator if needed
4. **Port conflicts**: Change PORT in server.js if needed

### If data files don't appear:
1. **Check data folder**: Ensure `data/` directory exists with .json files
2. **File permissions**: Ensure files are readable
3. **JSON format**: Ensure files are valid JSON

## Files Created to Help
- `start.bat` - Easy server startup script
- `diagnose.js` - System diagnostics tool
- Enhanced error messages in the frontend

## Quick Test Commands
```bash
# Test server responsiveness
curl http://localhost:3000/api/data-files

# Or in browser, visit:
http://localhost:3000/api/data-files
```

Should return JSON with file information if working correctly.
