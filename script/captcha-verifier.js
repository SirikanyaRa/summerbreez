// captcha-verifier.js - A utility to check if URLs are accessible without captcha

import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Check if running in production deployment environment
const isProductionDeployment = process.env.NODE_ENV === 'production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// User agents to rotate for better stealth
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
];

// Get a random user agent
const getRandomUserAgent = () => {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

/**
 * Verify if a URL is accessible without captcha
 * @param {string} url - The URL to check
 * @param {string} [cookies=''] - Optional cookies to include in the request
 * @returns {Promise<Object>} - Status of the URL check
 */
export const verifyUrlAccess = async (url, cookies = '') => {
  console.log(`🔍 Checking URL accessibility: ${url}`);
  
  try {
    // Prepare request config
    const config = {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 15000,
      validateStatus: status => true // Accept all status codes
    };
    
    // Add cookies if provided
    if (cookies) {
      config.headers['Cookie'] = cookies;
      console.log('Using provided cookies');
    }
    
    const response = await axios.get(url, config);
    const contentLength = response.data ? response.data.length : 0;
    
    // Check for indicators of CAPTCHA or blocking
    const isCaptchaPresent = response.data &&
      typeof response.data === 'string' &&
      (response.data.includes('captcha') || 
       response.data.includes('hCaptcha') || 
       response.data.includes('recaptcha'));
       
    const hasValidContent = response.data && 
      typeof response.data === 'string' &&
      (response.data.includes('Postcode') || 
       response.data.includes('Post Office') ||
       response.data.includes('Location Information'));
    
    // Status evaluation
    const isAccessible = (
      response.status === 200 && 
      contentLength > 3000 && 
      !isCaptchaPresent &&
      hasValidContent
    );
    
    // Log the result
    console.log(`URL ${url} check result:`, {
      status: response.status,
      contentLength,
      isCaptchaPresent,
      hasValidContent,
      isAccessible
    });
    
    // Save HTML for debugging if needed
    if (!isAccessible) {
      const debugPath = path.join(__dirname, 'debug', 'captcha-debug.html');
      await fs.ensureDir(path.dirname(debugPath));
      await fs.writeFile(debugPath, typeof response.data === 'string' ? response.data : 'Non-text response');
      console.log(`Debug HTML saved to ${debugPath}`);
    }
    
    return {
      url,
      isAccessible,
      status: response.status,
      contentLength,
      hasCaptcha: isCaptchaPresent,
      hasContent: hasValidContent,
      message: isAccessible ? 
        'URL is accessible without CAPTCHA' : 
        'URL requires CAPTCHA or is blocked'
    };
  } catch (error) {
    console.error(`Error checking URL ${url}:`, error.message);
    
    return {
      url,
      isAccessible: false,
      status: error.response?.status || 0,
      contentLength: 0,
      hasCaptcha: false,
      hasContent: false,
      message: `Error checking URL: ${error.message}`,
      error: true
    };
  }
};

// Add server endpoint for URL verification
export const addCaptchaVerifierRoutes = (app) => {
  app.post('/api/verify-url', async (req, res) => {
    try {
      const { url, cookies } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }
      
      // Basic validation to ensure we're only checking postcode.my URLs
      if (!url.startsWith('https://postcode.my/')) {
        return res.status(400).json({ 
          error: 'Invalid URL. Only postcode.my URLs are supported.' 
        });
      }
      
      const result = await verifyUrlAccess(url, cookies);
      res.json(result);
    } catch (error) {
      console.error('Error in verify-url endpoint:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  console.log('✅ Captcha verifier routes added');
};

// Command-line interface for direct testing
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const testUrl = process.argv[2] || 'https://postcode.my/pahang-kuantan-jalan-aspa-26080.html';
  const cookies = process.argv[3] || '';
  
  console.log(`🧪 Testing URL verification for: ${testUrl}`);
  verifyUrlAccess(testUrl, cookies)
    .then(result => {
      console.log('Result:', JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(err => {
      console.error('Error:', err);
      process.exit(1);
    });
}
