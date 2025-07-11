import axios from 'axios';
import * as cheerio from 'cheerio';

const testUrl = 'https://postcode.my/perlis-arau-arau-02600.html';

async function debugPageStructure() {
  try {
    console.log('Fetching:', testUrl);
    
    const config = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive'
      },
      timeout: 30000
    };
    
    const response = await axios.get(testUrl, config);
    const html = response.data;
    
    console.log('Response status:', response.status);
    console.log('Content length:', html.length);
    
    // Check for CAPTCHA first
    const captchaPatterns = [
      /captcha/i,
      /hCaptcha/i,
      /recaptcha/i,
      /cloudflare.*challenge/i
    ];
    
    const hasCaptcha = captchaPatterns.some(pattern => pattern.test(html));
    console.log('Has CAPTCHA:', hasCaptcha);
    
    if (hasCaptcha) {
      console.log('CAPTCHA detected, cannot proceed with HTML analysis');
      return;
    }
    
    const $ = cheerio.load(html);
    
    // Debug: Check what's actually on the page
    console.log('\n=== PAGE TITLE ===');
    console.log($('title').text());
    
    console.log('\n=== CHECKING FOR PANELS ===');
    $('h3.panel-title-custom').each((i, el) => {
      console.log('Panel title:', $(el).text().trim());
    });
    
    console.log('\n=== CHECKING FOR TABLES ===');
    $('table').each((i, el) => {
      const id = $(el).attr('id');
      const rows = $(el).find('tr').length;
      console.log(`Table ${i}: id="${id}", rows=${rows}`);
      
      if (id === 't2' || rows > 0) {
        console.log('Table content:');
        $(el).find('tr').each((j, row) => {
          const cells = $(row).find('td').map((k, cell) => $(cell).text().trim()).get();
          if (cells.length > 0) {
            console.log(`  Row ${j}:`, cells);
          }
        });
      }
    });
    
    console.log('\n=== CHECKING ALL TABLES WITH DATA ===');
    $('table tr').each((i, row) => {
      const tds = $(row).find('td');
      if (tds.length === 2) {
        const label = $(tds[0]).text().trim();
        const value = $(tds[1]).text().trim();
        if (label && value) {
          console.log(`Found data row: "${label}" => "${value}"`);
        }
      }
    });
    
    console.log('\n=== RAW HTML SAMPLE (first 2000 chars) ===');
    console.log(html.substring(0, 2000));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugPageStructure();
