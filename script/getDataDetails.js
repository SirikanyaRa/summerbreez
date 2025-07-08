import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs-extra';

const filename = 'pahang_15'
const inputFile = `../data/${filename}.json`
const outputFile = `../data/${filename}_details.json`;

// User agents to rotate for better stealth (more diverse and recent)
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0'
];

// Session management to maintain cookies
let sessionCookies = '';

// Sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to pause and wait for manual CAPTCHA solving
const waitForManualSolve = async (url) => {
  console.log('\n🛑 CAPTCHA DETECTED!');
  console.log('📋 Please:');
  console.log(`   1. Open ${url} in your browser`);
  console.log('   2. Solve the CAPTCHA manually');
  console.log('   3. Wait for the page to load normally');
  console.log('   4. Press any key here to continue...\n');
  
  // Wait for user input
  process.stdin.setRawMode(true);
  return new Promise(resolve => {
    process.stdin.once('data', () => {
      process.stdin.setRawMode(false);
      resolve();
    });
  });
};

// Random delay ranges
const getRandomDelay = (min = 2000, max = 8000) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Get random user agent
const getRandomUserAgent = () => {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

// Retry mechanism with exponential backoff
const fetchWithRetry = async (url, maxRetries = 3, baseDelay = 2000) => {
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
        timeout: 45000, // 45 second timeout
        maxRedirects: 5,
        validateStatus: function (status) {
          return status < 500; // Accept 4xx errors to handle them gracefully
        }
      };
      
      console.log(`   🔄 Attempt ${attempt}/${maxRetries} with User-Agent: ${userAgent.substring(0, 50)}...`);
      
      const response = await axios.get(url, config);
      const { data } = response;
      
      // Store session cookies if received
      if (response.headers['set-cookie']) {
        sessionCookies = response.headers['set-cookie'].join('; ');
      }
      
      // Enhanced CAPTCHA/blocking detection
      if (data.includes('captcha') || data.includes('hCaptcha') || data.includes('blocked') || 
          data.includes('403') || data.includes('rate limit') || data.includes('too many requests') ||
          data.includes('security check') || data.includes('verify') || data.length < 1000) {
        console.log('🚫 CAPTCHA or blocking detected.');
        
        // Wait for manual solving on last attempt
        if (attempt === maxRetries) {
          await waitForManualSolve(url);
          // Try one more time after manual solving
          const finalResponse = await axios.get(url, config);
          return finalResponse.data;
        }
        
        throw new Error('CAPTCHA or rate limit detected - manual intervention needed');
      }
      
      return data;
    } catch (error) {
      console.log(`   ⚠️  Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      console.log(`   ⏳ Waiting ${Math.round(delay)}ms before retry...`);
      await sleep(delay);
    }
  }
};

const extractExpectedData = async (url) => {
  const html = await fetchWithRetry(url);
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

(async () => {
  const json = await fs.readJson(inputFile);
  const postOffices = json.url ?? json;

  const filteredLinks = postOffices.filter(p => p.url.endsWith('.html'));

  console.log(`🔎 Found ${filteredLinks.length} post office pages to process...`);

  const results = [];
  //filteredLinks.length

  for (let i = 0; i < filteredLinks.length; i++) {
    const { office, url } = filteredLinks[i];
    console.log(`Scraping ${i + 1}/${filteredLinks.length}: ${office}`);

    try {
      const detail = await extractExpectedData(url);
      results.push({ office, ...detail });
    } catch (err) {
      console.error(`❌ Error scraping ${url}: ${err.message}`);
    }

    // Random delay between requests for better stealth
    const delay = getRandomDelay(2000, 5000);
    console.log(`   ⏳ Waiting ${Math.round(delay)}ms before next request...`);
    await sleep(delay);
  }

  await fs.writeJson(outputFile, results, { spaces: 2 });
  console.log(results)
  console.log(`✅ Done. Extracted ${results.length} records to ${outputFile}`);
})();