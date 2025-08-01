import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// User agents to rotate for better stealth
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0'
];

// Session management with better cookie handling
let sessionCookies = '';
let lastCookieUpdate = Date.now();

// Helper to check hCaptcha configuration
const checkHCaptchaConfig = async () => {
  try {
    console.log('🔍 Checking hCaptcha configuration for postcode.my...');
    
    const response = await axios.post("https://api.hcaptcha.com/checksiteconfig", null, {
      params: {
        v: 'ca737f0560add5b36452dede62296c160c23bb19',
        host: 'postcode.my',
        sitekey: 'c6fddc4c-b0dd-42a7-9c25-a5384ae1a72b',
        sc: '1',
        swa: '1',
        spst: '1'
      },
      headers: {
        "accept": "application/json",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "text/plain",
        "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Google Chrome\";v=\"138\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "cookie": sessionCookies || "hmt_id=888c9f0b-64ca-4e13-a250-7cd399271944",
        "Referer": "https://newassets.hcaptcha.com/"
      },
      timeout: 10000
    });
    
    console.log('🧩 hCaptcha Config Response:', response.data);
    return response.data;
  } catch (error) {
    console.log('⚠️ hCaptcha config check failed:', error.message);
    return null;
  }
};

// Helper to reset cookies when CAPTCHA is detected
const resetSessionCookies = () => {
  sessionCookies = '';
  lastCookieUpdate = Date.now();
  console.log('🔄 Session cookies reset due to CAPTCHA detection');
};

// Helper to check if we should retry with fresh session
const shouldRetryWithFreshSession = () => {
  const timeSinceUpdate = Date.now() - lastCookieUpdate;
  return timeSinceUpdate > 30000; // 30 seconds since last cookie update
};

// Helper functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getRandomDelay = (min = 2000, max = 8000) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomUserAgent = () => {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

// Enhanced fetch with retry and CAPTCHA detection
const fetchWithRetry = async (url, maxRetries = 3, baseDelay = 2000, sessionId, activeSessions) => {
  const session = activeSessions.get(sessionId);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const userAgent = getRandomUserAgent();
      const config = {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'DNT': '1',
          'Sec-GPC': '1',
          ...(sessionCookies && { 'Cookie': sessionCookies })
        },
        timeout: 45000,
        maxRedirects: 5,
        validateStatus: function (status) {
          return status < 500;
        }
      };
      
      if (session) {
        session.message = `Attempting to fetch ${url} (attempt ${attempt}/${maxRetries})`;
      }
      
      const response = await axios.get(url, config);
      const { data } = response;
      
      // Store session cookies with timestamp
      if (response.headers['set-cookie']) {
        sessionCookies = response.headers['set-cookie'].join('; ');
        lastCookieUpdate = Date.now();
        console.log(`🍪 Updated session cookies from ${url}`);
      }
      
      // Enhanced CAPTCHA/blocking detection with more specific patterns
      const captchaPatterns = [
        /captcha/i,
        /hCaptcha/i,
        /recaptcha/i,
        /cloudflare.*challenge/i,
        /security check/i,
        /verify you are human/i,
        /access denied/i,
        /rate limit exceeded/i,
        /too many requests/i,
        /temporarily blocked/i,
        /please complete.*verification/i
      ];
      
      // Check if the page has normal postcode.my content
      const hasNormalContent = data.includes('postcode.my') || 
                              data.includes('postal code') || 
                              data.includes('Location Information') ||
                              data.includes('GPS Coordinate') ||
                              data.includes('Post Office');
      
      // More specific detection - only trigger if we have clear CAPTCHA indicators AND no normal content
      const hasSpecificCaptchaPattern = captchaPatterns.some(pattern => pattern.test(data));
      const isBlockingResponse = response.status === 403 || response.status === 429;
      const isEmptyOrErrorPage = data.length < 500 || 
                                data.includes('Service Unavailable') ||
                                data.includes('Error 404');
      
      // Only consider it CAPTCHA if we have specific patterns AND no normal content, or clear blocking responses
      const isCaptchaPage = (hasSpecificCaptchaPattern && !hasNormalContent) || 
                           (isBlockingResponse && !hasNormalContent) ||
                           (isEmptyOrErrorPage && !hasNormalContent);
      
      console.log(`Page analysis for ${url}:`, {
        status: response.status,
        contentLength: data.length,
        hasSpecificCaptchaPattern,
        hasNormalContent,
        isBlockingResponse,
        isEmptyOrErrorPage,
        isCaptchaPage
      });
      
      if (isCaptchaPage) {
        console.log(`CAPTCHA/Blocking detected for ${url}:`, {
          status: response.status,
          contentLength: data.length,
          hasSpecificCaptchaPattern,
          isBlockingResponse,
          isEmptyOrErrorPage,
          hasNormalContent,
          matchedPatterns: captchaPatterns.filter(pattern => pattern.test(data)).map(p => p.source)
        });
        
        // Get hCaptcha configuration details
        const hcaptchaConfig = await checkHCaptchaConfig();
        
        // Reset session cookies when CAPTCHA is detected
        resetSessionCookies();
        
        if (session) {
          session.captchaRequired = true;
          session.status = 'captcha_required';
          
          let captchaMessage = `🛑 CAPTCHA detected for ${url}. Please follow these steps:

1. 📱 Open this exact URL in a NEW TAB: ${url}
2. 🧩 Solve the CAPTCHA challenge on that page
3. ✅ After solving, return to this tab and click "Continue"

🔧 IMPORTANT: This will automatically share your solved CAPTCHA session with the scraper.
⏰ You have 10 minutes to complete this process.`;

          // Add hCaptcha specific information if available
          if (hcaptchaConfig) {
            captchaMessage += `\n\n🧩 hCaptcha Details:
- Site Key: ${hcaptchaConfig.sitekey || 'c6fddc4c-b0dd-42a7-9c25-a5384ae1a72b'}
- Challenge Type: ${hcaptchaConfig.challenge_type || 'image'}
- Pass Required: ${hcaptchaConfig.pass_required || false}`;

            if (hcaptchaConfig.challenge_url) {
              captchaMessage += `\n- Direct Challenge: ${hcaptchaConfig.challenge_url}`;
            }
          }
          
          session.message = captchaMessage;
          session.captchaUrl = url;
          session.hcaptchaConfig = hcaptchaConfig; // Store for frontend use
        }
        
        console.log(`Waiting for CAPTCHA resolution for session ${sessionId}`);
        
        // Wait for CAPTCHA resolution
        await waitForCaptchaResolution(sessionId, activeSessions);
        
        console.log(`CAPTCHA resolved for session ${sessionId}, implementing session restoration strategy`);
        
        // Check if we have user-provided cookies
        const currentSession = activeSessions.get(sessionId);
        
        if (currentSession && currentSession.userCookies) {
          console.log(`Using user-provided cookies for ${url}`);
          
          // Strategy 1: Use user's actual browser cookies
          try {
            const userCookieResponse = await axios.get(url, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Cookie': currentSession.userCookies, // Use user's cookies!
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              },
              timeout: 30000,
              maxRedirects: 5,
              validateStatus: function (status) {
                return status >= 200 && status < 500;
              }
            });
            
            console.log(`User cookie request successful for ${url} (Length: ${userCookieResponse.data.length})`);
            return userCookieResponse.data;
            
          } catch (userCookieError) {
            console.log(`User cookie strategy failed: ${userCookieError.message}, trying fresh session strategy`);
          }
        }
        
        // Strategy 2: Fresh session approach (fallback)
        resetSessionCookies();
        
        // Give time for CAPTCHA solution to propagate on the server side
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Strategy 3: Try with completely fresh request (no session reuse)
        console.log(`Attempting fresh session request for ${url}`);
        
        try {
          // Make a completely fresh request
          const freshResponse = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Accept-Encoding': 'gzip, deflate, br',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            timeout: 30000,
            maxRedirects: 5,
            validateStatus: function (status) {
              return status >= 200 && status < 500;
            }
          });
          
          // Update session cookies from fresh response
          if (freshResponse.headers['set-cookie']) {
            sessionCookies = freshResponse.headers['set-cookie'].join('; ');
            lastCookieUpdate = Date.now();
            console.log(`🍪 Got fresh session cookies after CAPTCHA: ${sessionCookies.substring(0, 100)}...`);
          }
          
          console.log(`Fresh request successful for ${url} (Length: ${freshResponse.data.length})`);
          return freshResponse.data;
          
        } catch (freshError) {
          console.log(`Fresh session attempt failed: ${freshError.message}, trying minimal fallback strategy`);
          
          // Strategy 4: Try with minimal session data
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const fallbackResponse = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Connection': 'keep-alive'
            },
            timeout: 30000,
            validateStatus: function (status) {
              return status >= 200 && status < 500;
            }
          });
          
          if (fallbackResponse.headers['set-cookie']) {
            sessionCookies = fallbackResponse.headers['set-cookie'].join('; ');
            lastCookieUpdate = Date.now();
            console.log(`🍪 Got fallback session cookies`);
          }
          
          return fallbackResponse.data;
        }
      } else {
        console.log(`Normal page detected for ${url} (Length: ${data.length}, Status: ${response.status})`);
      }
      
      return data;
    } catch (error) {
      if (session) {
        session.message = `Attempt ${attempt} failed: ${error.message}`;
      }
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      await sleep(delay);
    }
  }
};

// Wait for CAPTCHA resolution
const waitForCaptchaResolution = async (sessionId, activeSessions) => {
  const session = activeSessions.get(sessionId);
  console.log(`Starting CAPTCHA wait for session ${sessionId}`);
  
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      const currentSession = activeSessions.get(sessionId);
      
      // Check if CAPTCHA is resolved
      if (currentSession && !currentSession.captchaRequired) {
        console.log(`CAPTCHA resolved for session ${sessionId}`);
        
        // Check if user provided cookies
        if (currentSession.userCookies) {
          sessionCookies = currentSession.userCookies;
          lastCookieUpdate = Date.now();
          console.log(`🍪 Using user-provided cookies after CAPTCHA resolution`);
          console.log(`Cookies preview: ${sessionCookies.substring(0, 100)}...`);
        }
        
        clearInterval(checkInterval);
        // Add a delay to ensure UI updates and allow server-side processing
        setTimeout(resolve, 1000);
      }
    }, 1000); // Check every second
    
    // Timeout after 10 minutes
    setTimeout(() => {
      console.log(`CAPTCHA resolution timeout for session ${sessionId}`);
      clearInterval(checkInterval);
      if (session) {
        session.message = '⏰ CAPTCHA resolution timeout. Please try again.';
        session.status = 'error';
        session.captchaRequired = false;
      }
      resolve();
    }, 600000);
  });
};

// Extract data from postcode page
// Extract data from postcode page
const extractPostcodeData = async (url, sessionId, activeSessions) => {
  console.log(`Extracting data from: ${url}`);
  
  let html = await fetchWithRetry(url, 3, 2000, sessionId, activeSessions);
  
  if (!html || html.length < 100) {
    throw new Error(`Invalid or empty HTML response (length: ${html ? html.length : 0})`);
  }

  // Check for suspiciously short content that might indicate CAPTCHA or blocking
  if (html.length < 3000) {
    console.log(`⚠️ Short content detected (${html.length} bytes), checking if it's a valid page...`);
    
    const $initial = cheerio.load(html);
    const pageTitle = $initial('title').text().trim();
    const bodyText = $initial('body').text().trim();
    
    console.log(`Page title: "${pageTitle}"`);
    console.log(`Body text length: ${bodyText.length}`);
    
    // Check if it's a genuine error page
    if (bodyText.toLowerCase().includes('error') || 
        bodyText.toLowerCase().includes('not found') ||
        bodyText.toLowerCase().includes('redirect') ||
        pageTitle.toLowerCase().includes('error')) {
      console.log('Detected genuine error page, returning empty data');
      return {
        url,
        location: '-',
        city: '-', 
        state: '-',
        postcode: '-',
        gps_lat: '-',
        gps_lng: '-'
      };
    }
    
    // Short content likely indicates CAPTCHA or blocking - trigger resolution
    console.log('Short content detected - likely CAPTCHA or blocking. Triggering CAPTCHA resolution...');
    
    const session = activeSessions.get(sessionId);
    if (session) {
      session.captchaRequired = true;
      session.status = 'captcha_required';
      session.message = `🛑 Short content detected (${html.length} bytes) - likely CAPTCHA blocking.

Please follow these steps:
1. Open this URL in a new browser tab: ${url}
2. Complete any CAPTCHA challenge that appears
3. Verify you can see the postcode information page
4. Return here and click "Continue" to resume scraping

⚠️ Important: Keep the browser tab open and use the same browser session!`;
      session.captchaUrl = url;
      
      console.log(`CAPTCHA handling triggered for session ${sessionId}, URL: ${url}`);
      
      // Reset session cookies before waiting
      resetSessionCookies();
      
      // Wait for CAPTCHA resolution
      await waitForCaptchaResolution(sessionId, activeSessions);
      
      console.log(`CAPTCHA resolved for ${url}, retrying extraction with fresh session...`);
      
      // Retry fetching the page after CAPTCHA resolution with fresh session
      html = await fetchWithRetry(url, 3, 2000, sessionId, activeSessions);
      
      if (!html || html.length < 3000) {
        console.log(`Retry still returned short content (${html ? html.length : 0} bytes). CAPTCHA solution may not have worked.`);
        
        // One more attempt with completely fresh session
        resetSessionCookies();
        try {
          html = await fetchWithRetry(url, 1, 1000, sessionId, activeSessions);
          if (html && html.length >= 3000) {
            console.log(`Third attempt successful - got ${html.length} bytes`);
          } else {
            console.log(`All attempts failed. Returning empty data for ${url}`);
            return {
              url,
              location: '-',
              city: '-', 
              state: '-',
              postcode: '-',
              gps_lat: '-',
              gps_lng: '-'
            };
          }
        } catch (finalErr) {
          console.log(`Final retry failed: ${finalErr.message}`);
          return {
            url,
            location: '-',
            city: '-', 
            state: '-',
            postcode: '-',
            gps_lat: '-',
            gps_lng: '-'
          };
        }
      }
      
      console.log(`Retry successful - got ${html.length} bytes. Continuing with extraction...`);
    } else {
      console.log('No session found for CAPTCHA handling, returning empty data');
      return {
        url,
        location: '-',
        city: '-', 
        state: '-',
        postcode: '-',
        gps_lat: '-',
        gps_lng: '-'
      };
    }
  }

  const $ = cheerio.load(html);
  const detail = { url };

  console.log(`HTML loaded, content length: ${html.length}`);

  // LOCATION INFO block
  console.log('Looking for Location Information panel...');
  const locationPanel = $('h3.panel-title-custom')
    .filter((i, el) => $(el).text().trim() === 'Location Information')
    .closest('.panel');

  console.log(`Location panel found: ${locationPanel.length > 0}`);

  if (locationPanel.length > 0) {
    const table = locationPanel.find('table#t2');
    console.log(`Location table found: ${table.length > 0}`);
    
    if (table.length > 0) {
      const rows = table.find('tr');
      console.log(`Location table rows: ${rows.length}`);
      
      rows.each((i, row) => {
        const tds = $(row).find('td');
        if (tds.length === 2) {
          const label = $(tds[0]).text().trim().toLowerCase();
          const value = $(tds[1]).text().trim();
          console.log(`Location row: "${label}" => "${value}"`);

          if (label === 'location') detail.location = value;
          else if (label === 'post office') detail.city = value;
          else if (label === 'state') detail.state = value;
          else if (label === 'postcode') detail.postcode = value;
        }
      });
    }
  } else {
    console.log('No Location Information panel found. Checking all h3 elements:');
    $('h3').each((i, el) => {
      console.log(`  H3 ${i}: "${$(el).text().trim()}"`);
    });
    
    // Fallback Strategy 1: Look for any heading containing "location" or similar
    console.log('Trying fallback strategies for location data...');
    
    // Check for alternative panel structures
    let altLocationPanel = $('h3, h2, h4')
      .filter((i, el) => {
        const text = $(el).text().toLowerCase();
        return text.includes('location') || text.includes('address') || text.includes('details');
      })
      .parent();
    
    if (altLocationPanel.length > 0) {
      console.log('Found alternative location panel');
      altLocationPanel.find('table tr, .row, .data-row').each((i, row) => {
        const cells = $(row).find('td, .col, .data-cell');
        if (cells.length >= 2) {
          const label = $(cells[0]).text().trim().toLowerCase();
          const value = $(cells[1]).text().trim();
          console.log(`Alt location row: "${label}" => "${value}"`);
          
          if (label.includes('location') && !detail.location) detail.location = value;
          else if ((label.includes('office') || label.includes('city')) && !detail.city) detail.city = value;
          else if (label.includes('state') && !detail.state) detail.state = value;
          else if ((label.includes('postcode') || label.includes('postal')) && !detail.postcode) detail.postcode = value;
        }
      });
    }
    
    // Fallback Strategy 2: Search all tables for relevant data
    if (!detail.location && !detail.city && !detail.state && !detail.postcode) {
      console.log('Searching all tables for location data...');
      $('table').each((tableIndex, table) => {
        $(table).find('tr').each((rowIndex, row) => {
          const tds = $(row).find('td');
          if (tds.length >= 2) {
            const label = $(tds[0]).text().trim().toLowerCase();
            const value = $(tds[1]).text().trim();
            
            if (value && value !== '-' && value.length > 0) {
              if (label.includes('location') && !detail.location) {
                detail.location = value;
                console.log(`Found location in table ${tableIndex}: ${value}`);
              } else if ((label.includes('office') || label.includes('city')) && !detail.city) {
                detail.city = value;
                console.log(`Found city in table ${tableIndex}: ${value}`);
              } else if (label.includes('state') && !detail.state) {
                detail.state = value;
                console.log(`Found state in table ${tableIndex}: ${value}`);
              } else if ((label.includes('postcode') || label.includes('postal')) && !detail.postcode) {
                detail.postcode = value;
                console.log(`Found postcode in table ${tableIndex}: ${value}`);
              }
            }
          }
        });
      });
    }
  }

  // GPS COORDINATE block
  console.log('Looking for GPS Coordinate panel...');
  const gpsPanel = $('h3.panel-title-custom')
    .filter((i, el) => $(el).text().trim() === 'GPS Coordinate (Approximate)')
    .closest('.panel');

  console.log(`GPS panel found: ${gpsPanel.length > 0}`);

  if (gpsPanel.length > 0) {
    const table = gpsPanel.find('table#t2');
    console.log(`GPS table found: ${table.length > 0}`);
    
    if (table.length > 0) {
      const rows = table.find('tr');
      console.log(`GPS table rows: ${rows.length}`);
      
      rows.each((i, row) => {
        const tds = $(row).find('td');
        if (tds.length === 2) {
          const label = $(tds[0]).text().trim().toLowerCase();
          const value = $(tds[1]).text().trim();
          console.log(`GPS row: "${label}" => "${value}"`);

          if (label === 'latitude') detail.gps_lat = value;
          else if (label === 'longitude') detail.gps_lng = value;
        }
      });
    }
  } else {
    console.log('No GPS Coordinate panel found');
    
    // Fallback Strategy 1: Look for any heading containing "GPS", "coordinate", etc.
    console.log('Trying fallback strategies for GPS data...');
    
    let altGpsPanel = $('h3, h2, h4')
      .filter((i, el) => {
        const text = $(el).text().toLowerCase();
        return text.includes('gps') || text.includes('coordinate') || text.includes('latitude') || text.includes('longitude');
      })
      .parent();
    
    if (altGpsPanel.length > 0) {
      console.log('Found alternative GPS panel');
      altGpsPanel.find('table tr, .row, .data-row').each((i, row) => {
        const cells = $(row).find('td, .col, .data-cell');
        if (cells.length >= 2) {
          const label = $(cells[0]).text().trim().toLowerCase();
          const value = $(cells[1]).text().trim();
          console.log(`Alt GPS row: "${label}" => "${value}"`);
          
          if ((label.includes('latitude') || label.includes('lat')) && !detail.gps_lat) detail.gps_lat = value;
          else if ((label.includes('longitude') || label.includes('lng') || label.includes('long')) && !detail.gps_lng) detail.gps_lng = value;
        }
      });
    }
    
    // Fallback Strategy 2: Search all tables for GPS data
    if (!detail.gps_lat && !detail.gps_lng) {
      console.log('Searching all tables for GPS data...');
      $('table').each((tableIndex, table) => {
        $(table).find('tr').each((rowIndex, row) => {
          const tds = $(row).find('td');
          if (tds.length >= 2) {
            const label = $(tds[0]).text().trim().toLowerCase();
            const value = $(tds[1]).text().trim();
            
            if (value && value !== '-' && value.length > 0) {
              if ((label.includes('latitude') || label.includes('lat')) && !detail.gps_lat) {
                detail.gps_lat = value;
                console.log(`Found latitude in table ${tableIndex}: ${value}`);
              } else if ((label.includes('longitude') || label.includes('lng') || label.includes('long')) && !detail.gps_lng) {
                detail.gps_lng = value;
                console.log(`Found longitude in table ${tableIndex}: ${value}`);
              }
            }
          }
        });
      });
    }
    
    // Fallback Strategy 3: Look for coordinate patterns in text content
    if (!detail.gps_lat && !detail.gps_lng) {
      console.log('Looking for coordinate patterns in page text...');
      const pageText = $('body').text();
      
      // Look for lat/lng patterns like "3.1234, 101.5678" or "Lat: 3.1234 Lng: 101.5678"
      const coordPatterns = [
        /(?:latitude|lat)[\s:]+([0-9.-]+)/i,
        /(?:longitude|lng|long)[\s:]+([0-9.-]+)/i,
        /([0-9.-]+)[\s]*,[\s]*([0-9.-]+)/
      ];
      
      coordPatterns.forEach((pattern, index) => {
        const match = pageText.match(pattern);
        if (match) {
          if (index === 0 && !detail.gps_lat) {
            detail.gps_lat = match[1];
            console.log(`Found latitude pattern: ${match[1]}`);
          } else if (index === 1 && !detail.gps_lng) {
            detail.gps_lng = match[1];
            console.log(`Found longitude pattern: ${match[1]}`);
          } else if (index === 2 && !detail.gps_lat && !detail.gps_lng) {
            detail.gps_lat = match[1];
            detail.gps_lng = match[2];
            console.log(`Found coordinate pair: ${match[1]}, ${match[2]}`);
          }
        }
      });
    }
  }

  console.log('Extracted detail:', detail);
  
  // Set default values for missing fields to ensure consistent output
  detail.location = detail.location || '-';
  detail.city = detail.city || '-';
  detail.state = detail.state || '-';
  detail.postcode = detail.postcode || '-';
  detail.gps_lat = detail.gps_lat || '-';
  detail.gps_lng = detail.gps_lng || '-';

  return detail;
};

// Pre-check for CAPTCHA before starting scraping
const preCaptchaCheck = async (url, sessionId, activeSessions) => {
  console.log(`Pre-checking for CAPTCHA at: ${url}`);
  const session = activeSessions.get(sessionId);
  
  try {
    const userAgent = getRandomUserAgent();
    const config = {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'DNT': '1'
      },
      timeout: 30000,
      maxRedirects: 3
    };
    
    const response = await axios.get(url, config);
    const { data } = response;
    
    // Check for CAPTCHA patterns
    const captchaPatterns = [
      /captcha/i,
      /hCaptcha/i,
      /recaptcha/i,
      /cloudflare.*challenge/i,
      /security check/i,
      /verify you are human/i,
      /access denied/i,
      /rate limit exceeded/i,
      /too many requests/i,
      /temporarily blocked/i,
      /please complete.*verification/i
    ];
    
    const hasSpecificCaptchaPattern = captchaPatterns.some(pattern => pattern.test(data));
    const isBlockingResponse = response.status === 403 || response.status === 429;
    const isEmptyOrErrorPage = data.length < 500 || 
                              (data.includes('error') && data.length < 2000) ||
                              data.includes('Service Unavailable');
    
    const hasNormalContent = data.includes('postcode.my') || 
                            data.includes('postal code') || 
                            data.includes('Location Information') ||
                            data.includes('GPS') ||
                            data.includes('office');
    
    const isCaptchaPage = (hasSpecificCaptchaPattern || isBlockingResponse || isEmptyOrErrorPage) && !hasNormalContent;
    
    if (isCaptchaPage) {
      console.log(`CAPTCHA detected during pre-check for ${url}`);
      
      // Reset session cookies
      resetSessionCookies();
      
      if (session) {
        session.captchaRequired = true;
        session.status = 'captcha_required';
        session.message = `🛑 CAPTCHA detected before starting scraping.

Please follow these steps:
1. Open this URL in a new browser tab: ${url}
2. Complete any CAPTCHA challenge 
3. Verify the page loads correctly
4. Return here and click "Continue" to start scraping

⚠️ Keep the browser tab open during scraping!`;
        session.captchaUrl = url;
      }
      
      // Wait for CAPTCHA resolution before proceeding
      await waitForCaptchaResolution(sessionId, activeSessions);
      console.log(`CAPTCHA resolved during pre-check, proceeding with fresh session`);
    } else {
      console.log(`No CAPTCHA detected during pre-check. Safe to proceed.`);
    }
    
    return true;
  } catch (error) {
    console.log(`Pre-check failed for ${url}: ${error.message}`);
    if (session) {
      session.message = `⚠️ Pre-check failed, but proceeding with scraping: ${error.message}`;
    }
    return true; // Continue even if pre-check fails
  }
};

// Main scraping function
export const scrapePostcodeDetails = async (filename, selectedRecords, sessionId, activeSessions) => {
  const session = activeSessions.get(sessionId);
  
  try {
    // Read input file
    const inputFile = path.join(__dirname, '..', 'data', filename);
    const json = await fs.readJson(inputFile);
    
    // Use selected records or all records
    const recordsToProcess = selectedRecords || json;
    const filteredLinks = recordsToProcess.filter(p => p.url && p.url.endsWith('.html'));
    
    session.total = filteredLinks.length;
    session.status = 'pre_checking';
    session.message = `🔍 Pre-checking for CAPTCHA before starting scraping...`;
    
    // Pre-check the first URL for CAPTCHA
    const firstUrl = filteredLinks[0].url;
    await preCaptchaCheck(firstUrl, sessionId, activeSessions);
    
    // Update session status after pre-check
    const currentSession = activeSessions.get(sessionId);
    if (!currentSession || currentSession.status === 'error') {
      return; // Stop if session was terminated or errored during pre-check
    }
    
    session.status = 'running';
    session.message = `✅ Pre-check passed. Starting to scrape ${filteredLinks.length} postcode pages...`;
    
    const results = [];
    
    for (let i = 0; i < filteredLinks.length; i++) {
      const { office, url } = filteredLinks[i];
      
      session.progress = i + 1;
      session.message = `Scraping ${i + 1}/${filteredLinks.length}: ${office}`;
      
      try {
        const detail = await extractPostcodeData(url, sessionId, activeSessions);
        const result = { office, ...detail };
        results.push(result);
        session.results.push(result);
        
        session.message = `✅ Successfully scraped: ${office}`;
      } catch (err) {
        const error = `❌ Error scraping ${url}: ${err.message}`;
        session.errors.push(error);
        session.message = error;
        
        // If CAPTCHA is detected during scraping, wait for resolution
        if (session.captchaRequired) {
          console.log(`CAPTCHA detected during scraping, waiting for resolution...`);
          await waitForCaptchaResolution(sessionId, activeSessions);
          
          // Retry the current URL after CAPTCHA resolution
          try {
            const detail = await extractPostcodeData(url, sessionId, activeSessions);
            const result = { office, ...detail };
            results.push(result);
            session.results.push(result);
            session.message = `✅ Successfully scraped after CAPTCHA resolution: ${office}`;
          } catch (retryErr) {
            const retryError = `❌ Error scraping ${url} after CAPTCHA resolution: ${retryErr.message}`;
            session.errors.push(retryError);
            session.message = retryError;
          }
        }
      }
      
      // Random delay between requests
      const delay = getRandomDelay(2000, 5000);
      session.message = `⏳ Waiting ${Math.round(delay)}ms before next request...`;
      await sleep(delay);
    }
    
    // Save results
    const outputFile = path.join(__dirname, '..', 'data', filename.replace('.json', '_details.json'));
    await fs.writeJson(outputFile, results, { spaces: 2 });
    
    session.status = 'completed';
    session.message = `✅ Scraping completed! Extracted ${results.length} records to ${filename.replace('.json', '_details.json')}`;
    
  } catch (error) {
    session.status = 'error';
    session.message = `❌ Scraping failed: ${error.message}`;
  }
};
