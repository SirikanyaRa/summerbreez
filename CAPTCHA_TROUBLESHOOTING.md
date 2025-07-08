# CAPTCHA Troubleshooting Guide

## How the CAPTCHA System Works

1. **Detection**: The scraper detects CAPTCHA challenges based on various patterns in the response
2. **Notification**: The frontend receives a status update with `captchaRequired: true`
3. **User Action**: A prominent alert appears asking you to solve the CAPTCHA manually
4. **Resolution**: You click "Continue Scraping" to resume the process

## If CAPTCHA Alert Doesn't Appear

### Quick Diagnosis
1. Open browser console (F12) and check for JavaScript errors
2. Visit `/api/debug/sessions` to see current session status
3. Click the "🧪 Test CAPTCHA Alert" button to verify UI functionality

### Common Issues & Solutions

**Issue 1: JavaScript Errors**
- Check browser console for errors
- Ensure all DOM elements are present
- Try refreshing the page

**Issue 2: Session Not Found**
- Restart the scraping process
- Check that you selected a file before starting

**Issue 3: UI Not Updating**
- The progress polling runs every 2 seconds
- Check network tab in browser dev tools for failed requests
- Verify server is running on http://localhost:3000

**Issue 4: CAPTCHA Not Detected**
- The detection logic looks for specific patterns
- Some pages might not trigger detection
- Check server logs for detection details

## Manual Testing Steps

1. **Start the Application**
   ```bash
   npm start
   # or run start-test.bat on Windows
   ```

2. **Test CAPTCHA UI**
   - Click "🧪 Test CAPTCHA Alert" button
   - Verify alert appears with animation
   - Click "Continue Scraping" to test resolution

3. **Test Real Scraping**
   - Select a data file
   - Start scraping
   - Wait for CAPTCHA detection
   - Follow the resolution steps

## Debug Endpoints

- `/api/debug/sessions` - View all active sessions
- `/api/progress/:sessionId` - Check specific session progress

## Server Logs

The server provides detailed logging including:
- CAPTCHA detection events
- Session state changes
- Resolution acknowledgments

## Manual CAPTCHA Resolution Process

1. **When Alert Appears**:
   - Click the provided URL link
   - Opens target page in new tab
   - Solve any CAPTCHA challenges
   - Wait for page to load normally

2. **Resume Scraping**:
   - Return to scraper application
   - Click "✅ Continue Scraping" button
   - Scraping resumes automatically

## Expected Behavior

```json
{
    "status": "captcha_required",
    "progress": 1,
    "total": 5,
    "results": [],
    "errors": [],
    "captchaRequired": true,
    "message": "🛑 CAPTCHA detected for https://postcode.my/...",
    "captchaUrl": "https://postcode.my/..."
}
```

When working properly:
1. Alert appears with pulsing animation
2. Clear instructions are shown
3. URL link opens target page
4. "Continue" button acknowledges resolution
5. Scraping resumes with success message
