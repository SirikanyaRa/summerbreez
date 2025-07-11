// Simple test to verify HTML structure and extraction
import axios from 'axios';
import * as cheerio from 'cheerio';

const testUrl = 'https://postcode.my/perlis-arau-arau-02600.html';

async function quickTest() {
  try {
    console.log('Testing URL:', testUrl);
    
    const response = await axios.get(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 30000
    });
    
    console.log('Status:', response.status);
    console.log('Content length:', response.data.length);
    
    const $ = cheerio.load(response.data);
    
    // Test the same extraction logic as the scraper
    const detail = { url: testUrl };

    console.log('\n=== Testing Location Information Panel ===');
    const locationPanel = $('h3.panel-title-custom')
      .filter((i, el) => $(el).text().trim() === 'Location Information')
      .closest('.panel');
    
    console.log('Location panel found:', locationPanel.length > 0);
    
    if (locationPanel.length > 0) {
      const table = locationPanel.find('table#t2');
      console.log('Table#t2 found:', table.length > 0);
      
      if (table.length > 0) {
        console.log('Table rows:', table.find('tr').length);
        
        table.find('tr').each((i, row) => {
          const tds = $(row).find('td');
          if (tds.length === 2) {
            const label = $(tds[0]).text().trim();
            const value = $(tds[1]).text().trim();
            console.log(`  ${label} => ${value}`);
            
            const labelLower = label.toLowerCase();
            if (labelLower === 'location') detail.location = value;
            else if (labelLower === 'post office') detail.city = value;
            else if (labelLower === 'state') detail.state = value;
            else if (labelLower === 'postcode') detail.postcode = value;
          }
        });
      }
    }

    console.log('\n=== Testing GPS Panel ===');
    const gpsPanel = $('h3.panel-title-custom')
      .filter((i, el) => $(el).text().trim() === 'GPS Coordinate (Approximate)')
      .closest('.panel');
      
    console.log('GPS panel found:', gpsPanel.length > 0);
    
    if (gpsPanel.length > 0) {
      const table = gpsPanel.find('table#t2');
      console.log('GPS Table#t2 found:', table.length > 0);
      
      if (table.length > 0) {
        console.log('GPS Table rows:', table.find('tr').length);
        
        table.find('tr').each((i, row) => {
          const tds = $(row).find('td');
          if (tds.length === 2) {
            const label = $(tds[0]).text().trim();
            const value = $(tds[1]).text().trim();
            console.log(`  ${label} => ${value}`);
            
            const labelLower = label.toLowerCase();
            if (labelLower === 'latitude') detail.gps_lat = value;
            else if (labelLower === 'longitude') detail.gps_lng = value;
          }
        });
      }
    }

    console.log('\n=== EXTRACTED RESULT ===');
    console.log(detail);
    
    // Also check if there might be CAPTCHA content
    const html = response.data.toLowerCase();
    const hasCaptcha = html.includes('captcha') || html.includes('recaptcha') || html.includes('hcaptcha');
    console.log('\nHas CAPTCHA content:', hasCaptcha);
    
    if (hasCaptcha) {
      console.log('CAPTCHA patterns found in HTML');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
}

quickTest();
