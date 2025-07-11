import axios from 'axios';
import * as cheerio from 'cheerio';

// Simple extraction test without session management
async function testExtraction() {
  const testUrl = 'https://postcode.my/perlis-arau-arau-02600.html';
  
  try {
    console.log('Testing extraction for:', testUrl);
    
    // Simple fetch
    const response = await axios.get(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 30000
    });
    
    console.log('Response status:', response.status);
    console.log('Content length:', response.data.length);
    
    // Check for obvious CAPTCHA content
    const hasObviousCaptcha = response.data.toLowerCase().includes('captcha');
    console.log('Has obvious CAPTCHA:', hasObviousCaptcha);
    
    if (hasObviousCaptcha) {
      console.log('Cannot proceed - CAPTCHA detected');
      return;
    }
    
    // Extract data using the same logic as scraper-service.js
    const $ = cheerio.load(response.data);
    const detail = { url: testUrl };

    console.log('\n=== Starting Extraction ===');
    
    // LOCATION INFO block
    console.log('Looking for Location Information panel...');
    const locationPanel = $('h3.panel-title-custom')
      .filter((i, el) => $(el).text().trim() === 'Location Information')
      .closest('.panel');

    console.log('Location panel found:', locationPanel.length);
    
    if (locationPanel.length > 0) {
      console.log('Looking for table#t2 in location panel...');
      const table = locationPanel.find('table#t2');
      console.log('Table found:', table.length);
      
      if (table.length > 0) {
        const rows = table.find('tr');
        console.log('Number of rows:', rows.length);
        
        rows.each((i, row) => {
          const tds = $(row).find('td');
          console.log(`Row ${i}: ${tds.length} cells`);
          
          if (tds.length === 2) {
            const label = $(tds[0]).text().trim().toLowerCase();
            const value = $(tds[1]).text().trim();
            console.log(`  ${label} => ${value}`);

            if (label === 'location') detail.location = value;
            else if (label === 'post office') detail.city = value;
            else if (label === 'state') detail.state = value;
            else if (label === 'postcode') detail.postcode = value;
          }
        });
      }
    }

    // GPS COORDINATE block
    console.log('\nLooking for GPS Coordinate panel...');
    const gpsPanel = $('h3.panel-title-custom')
      .filter((i, el) => $(el).text().trim() === 'GPS Coordinate (Approximate)')
      .closest('.panel');

    console.log('GPS panel found:', gpsPanel.length);
    
    if (gpsPanel.length > 0) {
      console.log('Looking for table#t2 in GPS panel...');
      const table = gpsPanel.find('table#t2');
      console.log('GPS Table found:', table.length);
      
      if (table.length > 0) {
        const rows = table.find('tr');
        console.log('GPS rows:', rows.length);
        
        rows.each((i, row) => {
          const tds = $(row).find('td');
          console.log(`GPS Row ${i}: ${tds.length} cells`);
          
          if (tds.length === 2) {
            const label = $(tds[0]).text().trim().toLowerCase();
            const value = $(tds[1]).text().trim();
            console.log(`  ${label} => ${value}`);

            if (label === 'latitude') detail.gps_lat = value;
            else if (label === 'longitude') detail.gps_lng = value;
          }
        });
      }
    }

    console.log('\n=== FINAL RESULT ===');
    console.log(JSON.stringify(detail, null, 2));
    
    // Check what we have
    const hasData = detail.location || detail.city || detail.state || detail.postcode || detail.gps_lat || detail.gps_lng;
    console.log('Has extracted data:', hasData);
    
    if (!hasData) {
      console.log('\n=== DEBUGGING - Let\'s see what\'s on the page ===');
      console.log('All h3 elements:');
      $('h3').each((i, el) => {
        console.log(`  H3 ${i}: "${$(el).text().trim()}"`);
      });
      
      console.log('\nAll panel titles:');
      $('.panel-title-custom').each((i, el) => {
        console.log(`  Panel ${i}: "${$(el).text().trim()}"`);
      });
      
      console.log('\nAll tables:');
      $('table').each((i, el) => {
        const id = $(el).attr('id') || 'no-id';
        const rows = $(el).find('tr').length;
        console.log(`  Table ${i}: id="${id}", rows=${rows}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testExtraction();
