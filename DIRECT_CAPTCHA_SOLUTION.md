# Direct CAPTCHA Solving Solution

This solution provides a direct way for users to solve CAPTCHA challenges when accessing postcode.my websites.

## The Problem

The previous cookie-sharing approach was not working reliably because:

1. Cookies from user sessions weren't properly transferring to backend requests
2. The site uses advanced fingerprinting in addition to cookies
3. CAPTCHA tokens have short lifespans and are tied to browser fingerprints

## The New Solution

Instead of trying to share cookies between user browser and server, we now provide tools for users to directly solve CAPTCHAs and verify the solution worked:

### 1. Web-based CAPTCHA Helper

A user-friendly web interface that allows solving CAPTCHAs directly in the browser:

- Access at `/captcha-helper`
- Enter any problematic postcode.my URL
- Solve the CAPTCHA directly in the embedded frame or new tab
- Verify the solution worked with one click

### 2. Standalone CAPTCHA Solver

For advanced users or when the web interface isn't sufficient, we provide a command-line tool:

- Run `solve-captcha.bat` (Windows) or `node script/captcha-solver.js` (any OS)
- Opens a real browser window where you can solve the CAPTCHA
- Extracts cookies and verifies if the solution worked
- Saves debugging information (screenshots, HTML, cookies)

## How to Use

### Option 1: Web Interface

1. Start the server with `npm start`
2. Open your browser to `http://localhost:3000/captcha-helper`
3. Enter the problematic URL
4. Click "Load URL in Frame" or "Open in New Tab"
5. Solve the CAPTCHA
6. Click "Check URL Status" to verify it worked

### Option 2: Standalone Tool

1. Open Command Prompt/Terminal in the project folder
2. Run `solve-captcha.bat` (Windows) or `node script/captcha-solver.js --show` (any OS)
3. Enter the problematic URL when prompted
4. Solve the CAPTCHA in the browser window that opens
5. Once solved, the script will verify the solution and output cookies

## Implementation Details

### Components

1. `captcha-helper.html` - Web interface for solving CAPTCHAs
2. `captcha-verifier.js` - API for verifying URL accessibility
3. `captcha-solver.js` - Standalone tool using Puppeteer for CAPTCHA solving
4. `solve-captcha.bat` - Windows batch file for easy launching

### Technical Approach

- **Direct Browser Access**: Uses real browser sessions where CAPTCHAs can be solved properly
- **Verification System**: Checks if URLs are accessible after solving CAPTCHAs
- **Debug Tools**: Saves screenshots, HTML, and cookies for troubleshooting
- **API Endpoints**: Server routes for URL verification

## When to Use This Solution

Use this approach when:

1. Users report links not displaying or showing CAPTCHA challenges
2. The regular scraping process fails due to CAPTCHA detection
3. Testing new URLs that might be protected

This direct solving approach is more reliable than trying to share cookies between sessions, as it uses the actual browser environment where the CAPTCHA was solved.
