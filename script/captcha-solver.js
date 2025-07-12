// Direct captcha solver script using Puppeteer
// This can be run independently when users encounter captcha issues

import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { verifyUrlAccess } from './captcha-verifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create interface for command line input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt for user input
const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
};

// Main function to solve captchas
const solveCaptcha = async (url, isHeadless = false) => {
  console.log(`🤖 Starting captcha solver for URL: ${url}`);
  console.log('Launching browser...');
  
  // Launch browser with stealth options
  const browser = await puppeteer.launch({
    headless: isHeadless ? 'new' : false, // Use new headless mode if headless is true, otherwise show browser
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins',
      '--disable-site-isolation-trials',
      '--window-size=1280,720'
    ],
    defaultViewport: {
      width: 1280,
      height: 720
    }
  });

  try {
    // Create a new page
    const page = await browser.newPage();
    
    // Set common headers and user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br'
    });
    
    // Enable request interception to log requests
    await page.setRequestInterception(true);
    
    page.on('request', (request) => {
      if (request.url().includes('captcha') || request.url().includes('hcaptcha')) {
        console.log(`🔍 Captcha-related request: ${request.url()}`);
      }
      request.continue();
    });
    
    // Log console messages
    page.on('console', msg => console.log('Browser console:', msg.text()));
    
    // Navigate to the URL
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Check if captcha is present
    const hasCaptcha = await page.evaluate(() => {
      return document.body.textContent.toLowerCase().includes('captcha') ||
             document.body.innerHTML.toLowerCase().includes('h-captcha') ||
             document.body.innerHTML.toLowerCase().includes('g-recaptcha') ||
             document.body.innerHTML.toLowerCase().includes('iframe');
    });
    
    if (hasCaptcha) {
      console.log('🧩 CAPTCHA detected on the page');
      
      if (!isHeadless) {
        console.log('Please solve the CAPTCHA in the browser window.');
        console.log('The script will wait for you to complete it...');
        
        // Wait for navigation or significant content change
        await Promise.race([
          page.waitForNavigation({ timeout: 120000 }), // 2 minutes to solve
          new Promise(resolve => setTimeout(resolve, 120000))
        ]);
        
        // Check if the page content indicates successful CAPTCHA solution
        const captchaSolved = await page.evaluate(() => {
          return !document.body.textContent.toLowerCase().includes('captcha') &&
                 (document.body.textContent.includes('Postcode') || 
                  document.body.textContent.includes('Post Office'));
        });
        
        if (captchaSolved) {
          console.log('✅ CAPTCHA appears to be solved!');
        } else {
          console.log('⚠️ CAPTCHA may not be fully solved yet or page still loading...');
        }
      } else {
        console.log('⚠️ Running in headless mode - cannot solve CAPTCHA automatically');
        console.log('Please run in non-headless mode (--show flag) to solve CAPTCHAs manually');
      }
    } else {
      console.log('✅ No CAPTCHA detected on the page');
    }
    
    // Extract cookies
    const cookies = await page.cookies();
    const formattedCookies = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    
    console.log(`📝 Extracted ${cookies.length} cookies`);
    
    // Take screenshot
    const screenshotPath = path.join(__dirname, '../debug', 'captcha-page.png');
    await fs.ensureDir(path.dirname(screenshotPath));
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved to ${screenshotPath}`);
    
    // Save HTML content
    const content = await page.content();
    const htmlPath = path.join(__dirname, '../debug', 'captcha-page.html');
    await fs.writeFile(htmlPath, content);
    console.log(`💾 HTML content saved to ${htmlPath}`);
    
    // Save cookies to file
    const cookiesPath = path.join(__dirname, '../debug', 'cookies.json');
    await fs.writeJson(cookiesPath, cookies, { spaces: 2 });
    console.log(`🍪 Cookies saved to ${cookiesPath}`);
    
    return {
      success: true,
      cookies: formattedCookies,
      hasCaptcha,
      captchaSolved: !hasCaptcha || (!isHeadless)
    };
  } catch (error) {
    console.error('❌ Error during captcha solving:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    if (isHeadless) {
      await browser.close();
    } else {
      console.log('\nPress Enter to close the browser when you are done...');
      await prompt('');
      await browser.close();
    }
    
    rl.close();
  }
};

// Verify URL is accessible after solving captcha
const verifySolution = async (url, cookies) => {
  console.log('🔍 Verifying if URL is now accessible...');
  const result = await verifyUrlAccess(url, cookies);
  
  if (result.isAccessible) {
    console.log('✅ Success! URL is now accessible without CAPTCHA');
  } else {
    console.log('⚠️ URL still has access issues or CAPTCHA');
    console.log('Details:', result);
  }
  
  return result;
};

// Main function
const main = async () => {
  console.log('🤖 Postcode.my CAPTCHA Solver 🧩');
  console.log('-----------------------------');
  
  // Get URL from command line or prompt
  let url = process.argv[2];
  if (!url) {
    url = await prompt('Enter postcode.my URL to solve CAPTCHA for: ');
    if (!url.startsWith('http')) {
      url = 'https://postcode.my/' + url;
    }
  }
  
  // Determine headless mode from command line
  const showFlag = process.argv.includes('--show');
  const isHeadless = !showFlag;
  
  if (isHeadless) {
    console.log('⚠️ Running in headless mode. Use --show flag to see and interact with the browser.');
  }
  
  // Solve captcha
  const result = await solveCaptcha(url, isHeadless);
  
  if (result.success) {
    console.log('\n✅ Process completed successfully');
    
    if (result.cookies) {
      console.log('\n📋 Use these cookies in your scraper:');
      console.log(result.cookies);
      
      // Verify the solution
      await verifySolution(url, result.cookies);
    }
  } else {
    console.log('\n❌ Failed to solve CAPTCHA');
    console.log('Error:', result.error);
  }
  
  process.exit(0);
};

// Run the script if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

// Export for use in other scripts
export { solveCaptcha, verifySolution };
