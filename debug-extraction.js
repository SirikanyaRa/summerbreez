// Test extraction with real URLs to debug the data issue
import axios from 'axios';
import * as cheerio from 'cheerio';

async function testExtraction() {
  const testUrl = 'https://postcode.my/perlis-arau-arau-02600.html';
  
  console.log('🧪 Testing Data Extraction');
  console.log('=========================\n');
  console.log('URL:', testUrl);
  
  try {
    const response = await axios.get(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 30000
    });
    
    console.log('✅ Request successful');
    console.log('Status Code:', response.status);
    console.log('Content Length:', response.data.length);
    
    // Check for CAPTCHA first
    const lowerHTML = response.data.toLowerCase();
    const captchaFound = lowerHTML.includes('captcha') || lowerHTML.includes('cloudflare');
    
    if (captchaFound) {
      console.log('❌ CAPTCHA detected in response');
      console.log('Cannot proceed with extraction');
      return;
    }
    
    console.log('✅ No CAPTCHA detected');
    
    const $ = cheerio.load(response.data);
    
    // Check what H3 elements exist
    console.log('\n📋 Found H3 Elements:');
    $('h3').each((i, el) => {
      const text = $(el).text().trim();
      const className = $(el).attr('class') || 'no-class';
      console.log(`  ${i + 1}. "${text}" (class: ${className})`);
    });
    
    // Test our extraction logic
    console.log('\n🔍 Testing Location Information Extraction:');
    
    const locationPanel = $('h3.panel-title-custom')
      .filter((i, el) => $(el).text().trim() === 'Location Information')
      .closest('.panel');
    
    console.log('Location panel found:', locationPanel.length > 0);
    
    if (locationPanel.length > 0) {
      const table = locationPanel.find('table#t2');
      console.log('Table#t2 in location panel:', table.length > 0);
      
      if (table.length > 0) {
        console.log('Location table rows:', table.find('tr').length);
        
        table.find('tr').each((i, row) => {
          const tds = $(row).find('td');
          if (tds.length >= 2) {
            const label = $(tds[0]).text().trim();
            const value = $(tds[1]).text().trim();
            console.log(`  Row ${i}: "${label}" => "${value}"`);
          }
        });
      }
    }
    
    console.log('\n🗺️ Testing GPS Coordinate Extraction:');
    
    const gpsPanel = $('h3.panel-title-custom')
      .filter((i, el) => $(el).text().trim() === 'GPS Coordinate (Approximate)')
      .closest('.panel');
    
    console.log('GPS panel found:', gpsPanel.length > 0);
    
    if (gpsPanel.length > 0) {
      const table = gpsPanel.find('table#t2');
      console.log('Table#t2 in GPS panel:', table.length > 0);
      
      if (table.length > 0) {
        console.log('GPS table rows:', table.find('tr').length);
        
        table.find('tr').each((i, row) => {
          const tds = $(row).find('td');
          if (tds.length >= 2) {
            const label = $(tds[0]).text().trim();
            const value = $(tds[1]).text().trim();
            console.log(`  Row ${i}: "${label}" => "${value}"`);
          }
        });
      }
    }
    
    // Final extraction test
    console.log('\n🎯 Final Extraction Test:');
    const detail = { url: testUrl };
    
    // Location data
    const locPanel = $('h3.panel-title-custom')
      .filter((i, el) => $(el).text().trim() === 'Location Information')
      .closest('.panel');
    
    locPanel.find('table#t2 tr').each((_, row) => {
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
    
    // GPS data
    const gpsPanel2 = $('h3.panel-title-custom')
      .filter((i, el) => $(el).text().trim() === 'GPS Coordinate (Approximate)')
      .closest('.panel');
    
    gpsPanel2.find('table#t2 tr').each((_, row) => {
      const tds = $(row).find('td');
      if (tds.length === 2) {
        const label = $(tds[0]).text().trim().toLowerCase();
        const value = $(tds[1]).text().trim();

        if (label === 'latitude') detail.gps_lat = value;
        else if (label === 'longitude') detail.gps_lng = value;
      }
    });
    
    console.log('Extracted Data:', JSON.stringify(detail, null, 2));
    
    const hasData = detail.location || detail.city || detail.state || detail.postcode || detail.gps_lat || detail.gps_lng;
    console.log('\n' + (hasData ? '✅ Data extraction successful!' : '❌ No data extracted'));
    
    if (!hasData) {
      console.log('\n🔍 Debugging - checking all tables:');
      $('table').each((i, table) => {
        const id = $(table).attr('id') || 'no-id';
        const rows = $(table).find('tr').length;
        console.log(`Table ${i}: id="${id}", rows=${rows}`);
        
        if (rows > 0 && rows < 20) {
          $(table).find('tr').each((j, row) => {
            const cells = $(row).find('td');
            if (cells.length === 2) {
              const col1 = $(cells[0]).text().trim();
              const col2 = $(cells[1]).text().trim();
              if (col1 && col2) {
                console.log(`  ${col1}: ${col2}`);
              }
            }
          });
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
    }
  }
}

testExtraction();
