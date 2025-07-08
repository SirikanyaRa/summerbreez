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

// Session management
let sessionCookies = '';

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
      
      // Store session cookies
      if (response.headers['set-cookie']) {
        sessionCookies = response.headers['set-cookie'].join('; ');
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
      
      // More specific detection - only trigger if we have clear CAPTCHA indicators
      const hasSpecificCaptchaPattern = captchaPatterns.some(pattern => pattern.test(data));
      const isBlockingResponse = response.status === 403 || response.status === 429;
      const isEmptyOrErrorPage = data.length < 500 || 
                                (data.includes('error') && data.length < 2000) ||
                                data.includes('Service Unavailable');
      
      // Check if the page has normal postcode.my content
      const hasNormalContent = data.includes('postcode.my') || 
                              data.includes('postal code') || 
                              data.includes('Location Information') ||
                              data.includes('GPS') ||
                              data.includes('office');
      
      const isCaptchaPage = (hasSpecificCaptchaPattern || isBlockingResponse || isEmptyOrErrorPage) && !hasNormalContent;
      
      // Check if CAPTCHA detection is bypassed for this session
      const bypassDetection = session?.bypassCaptchaDetection || false;
      
      if (isCaptchaPage && !bypassDetection) {
        console.log(`CAPTCHA/Blocking detected for ${url}:`, {
          status: response.status,
          contentLength: data.length,
          hasSpecificCaptchaPattern,
          isBlockingResponse,
          isEmptyOrErrorPage,
          hasNormalContent,
          matchedPatterns: captchaPatterns.filter(pattern => pattern.test(data)).map(p => p.source)
        });
        
        if (session) {
          session.captchaRequired = true;
          session.status = 'captcha_required';
          session.message = `🛑 CAPTCHA or blocking detected for ${url}. Please solve it manually and click "Continue" to resume.`;
          session.captchaUrl = url;
        }
        
        console.log(`Waiting for CAPTCHA resolution for session ${sessionId}`);
        
        // Wait for CAPTCHA resolution
        await waitForCaptchaResolution(sessionId, activeSessions);
        
        console.log(`CAPTCHA resolved for session ${sessionId}, retrying request`);
        
        // Try again after CAPTCHA resolution
        const finalResponse = await axios.get(url, config);
        return finalResponse.data;
      } else if (isCaptchaPage && bypassDetection) {
        console.log(`CAPTCHA detection bypassed for ${url} (Detection disabled for testing)`);
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
      if (currentSession && !currentSession.captchaRequired) {
        console.log(`CAPTCHA resolved for session ${sessionId}`);
        clearInterval(checkInterval);
        // Add a small delay to ensure UI updates
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
const extractPostcodeData = async (url, sessionId, activeSessions) => {
  const html = await fetchWithRetry(url, 3, 2000, sessionId, activeSessions);
  const $ = cheerio.load(html);

  const detail = { url };

  // LOCATION INFO block
  const locationPanel = $('h3.panel-title-custom')
    .filter((i, el) => $(el).text().trim() === 'Location Information')
    .closest('.panel');

  locationPanel.find('table#t2 tr').each((_, row) => {
    const tds = $(row).find('td');
    if (tds.length === 2) {
      const label = $(tds[0]).text().trim().toLowerCase();
      const value = $(tds[1]).text().trim();

      if (label === 'location') detail.location = value;
      else if (label === 'post office') detail.city = value;
      else if (label === 'state') detail.state = value;
      else if (label === 'postcode') detail.postcode = value;
    }
  });

  // GPS COORDINATE block
  const gpsPanel = $('h3.panel-title-custom')
    .filter((i, el) => $(el).text().trim() === 'GPS Coordinate (Approximate)')
    .closest('.panel');

  gpsPanel.find('table#t2 tr').each((_, row) => {
    const tds = $(row).find('td');
    if (tds.length === 2) {
      const label = $(tds[0]).text().trim().toLowerCase();
      const value = $(tds[1]).text().trim();

      if (label === 'latitude') detail.gps_lat = value;
      else if (label === 'longitude') detail.gps_lng = value;
    }
  });

  return detail;
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
    session.status = 'running';
    session.message = `Starting to scrape ${filteredLinks.length} postcode pages...`;
    
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
