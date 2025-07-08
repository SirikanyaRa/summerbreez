import axios from 'axios';
import * as cheerio from 'cheerio';

// Test a real postcode.my URL to see what the content looks like
const testUrl = 'https://postcode.my/perlis-kaki-bukit-jalan-padang-besar-batu-16-02200.html';

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

console.log(`Testing URL: ${testUrl}\n`);

try {
  const response = await axios.get(testUrl, {
    headers: {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    },
    timeout: 30000
  });

  const { data } = response;
  console.log('Response Status:', response.status);
  console.log('Content Length:', data.length);
  console.log('Content Type:', response.headers['content-type']);
  console.log('\nFirst 500 characters of content:');
  console.log(data.substring(0, 500));
  console.log('\n--- Content Analysis ---');
  
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
  
  const matchedPatterns = captchaPatterns.filter(pattern => pattern.test(data));
  console.log('Matched CAPTCHA patterns:', matchedPatterns.map(p => p.source));
  
  // Check for normal content
  const normalContentIndicators = [
    'postcode.my',
    'postal code', 
    'Location Information',
    'GPS',
    'office'
  ];
  
  const foundNormalContent = normalContentIndicators.filter(indicator => 
    data.toLowerCase().includes(indicator.toLowerCase())
  );
  console.log('Found normal content indicators:', foundNormalContent);
  
  // Parse with Cheerio to extract specific content
  const $ = cheerio.load(data);
  console.log('\n--- Parsed Content ---');
  console.log('Title:', $('title').text().trim());
  console.log('Has Location Information panel:', $('h3.panel-title-custom:contains("Location Information")').length > 0);
  console.log('Number of panels:', $('.panel').length);
  
  // Look for specific postcode data
  const locationPanel = $('h3.panel-title-custom')
    .filter((i, el) => $(el).text().trim() === 'Location Information')
    .closest('.panel');
    
  if (locationPanel.length > 0) {
    console.log('Location panel found - this is a normal postcode page');
    const rows = locationPanel.find('.panel-body table tbody tr');
    console.log('Data rows found:', rows.length);
  } else {
    console.log('No location panel found - might be an error page');
  }

} catch (error) {
  console.error('Error fetching URL:', error.message);
  if (error.response) {
    console.log('Response status:', error.response.status);
    console.log('Response headers:', error.response.headers);
  }
}
