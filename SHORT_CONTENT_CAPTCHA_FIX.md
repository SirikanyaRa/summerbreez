# Short Content CAPTCHA Detection Update

## Issue Identified
When the scraper encountered short content (like 2528 bytes), it was returning empty data instead of treating it as a potential CAPTCHA/blocking situation that requires user intervention.

## Solution Implemented

### Enhanced Short Content Detection
The scraper now intelligently handles short content by:

1. **Detecting Short Pages**: Pages under 3000 bytes are flagged for investigation
2. **Differentiating Error vs CAPTCHA**: 
   - True error pages (404, redirects) → Return empty data
   - Short content without error indicators → Trigger CAPTCHA resolution

### CAPTCHA Flow for Short Content
When short content is detected (likely CAPTCHA):

1. **Set Session State**:
   ```javascript
   session.captchaRequired = true;
   session.status = 'captcha_required';
   session.captchaUrl = url;
   ```

2. **Display User Alert**: Shows CAPTCHA resolution UI with the problematic URL

3. **Wait for Resolution**: Pauses scraping until user solves CAPTCHA manually

4. **Retry Extraction**: After resolution, re-fetches the page and continues if successful

### User Experience Flow

1. **Short Content Detected**: `⚠️ Short content detected (2528 bytes)`
2. **CAPTCHA Alert Shown**: User sees popup with URL to solve CAPTCHA
3. **Manual Resolution**: User opens URL, solves CAPTCHA in browser
4. **Continue Scraping**: User clicks "Continue" button to resume
5. **Automatic Retry**: Scraper re-fetches page with full content
6. **Normal Extraction**: Continues with enhanced data extraction logic

## Benefits

- **Reduces False Negatives**: No more empty data due to CAPTCHA blocking
- **Maintains User Control**: User manually solves CAPTCHAs as needed
- **Seamless Recovery**: Automatic retry after CAPTCHA resolution
- **Better Debugging**: Clear logging of why content is short

## Code Changes

### `extractPostcodeData()` Function
- Added intelligent short content detection
- Integrated CAPTCHA resolution workflow
- Implemented retry logic after CAPTCHA solving
- Enhanced error differentiation

### Enhanced Logging
```
⚠️ Short content detected (2528 bytes), checking if it's a valid page...
Short content detected - likely CAPTCHA or blocking. Triggering CAPTCHA resolution...
CAPTCHA handling triggered for session 12345, URL: https://postcode.my/...
CAPTCHA resolved for https://postcode.my/..., retrying extraction...
Retry successful - got 15420 bytes. Continuing with extraction...
```

## Testing
- Short content (< 3000 bytes) now triggers CAPTCHA flow
- User gets clear instructions to solve CAPTCHA manually
- Successful resolution allows normal data extraction to continue
- Failed resolution gracefully returns empty data

This update ensures that the scraper properly handles CAPTCHA challenges that manifest as unusually short page content, providing a robust user experience for resolving blocking issues.
