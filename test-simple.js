import axios from 'axios';
import * as cheerio from 'cheerio';

// Test just the extraction logic with a real URL
async function testSingleExtraction() {
  const testUrl = 'https://postcode.my/perlis-arau-arau-02600.html';
  
  console.log('Testing extraction for:', testUrl);
  
  try {
    const response = await axios.get(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive'
      },
      timeout: 30000
    });
    
    console.log('✅ Successfully fetched page');
    console.log('Response status:', response.status);
    console.log('Content length:', response.data.length);
    
    // Check for CAPTCHA
    const hasCaptcha = response.data.toLowerCase().includes('captcha');
    if (hasCaptcha) {
      console.log('❌ CAPTCHA detected, cannot extract data');
      return null;
    }
    
    const $ = cheerio.load(response.data);
    const detail = { url: testUrl };

    console.log('\n🔍 Searching for Location Information...');
    
    // Find all h3 elements first for debugging
    $('h3').each((i, el) => {
      const text = $(el).text().trim();
      console.log(`H3[${i}]: "${text}"`);
    });

    // LOCATION INFO block
    const locationPanel = $('h3.panel-title-custom')
      .filter((i, el) => $(el).text().trim() === 'Location Information')
      .closest('.panel');

    console.log('Location panel found:', locationPanel.length > 0);

    if (locationPanel.length > 0) {
      const table = locationPanel.find('table#t2');
      console.log('Table#t2 found:', table.length > 0);
      
      table.find('tr').each((i, row) => {
        const tds = $(row).find('td');
        if (tds.length === 2) {
          const label = $(tds[0]).text().trim().toLowerCase();
          const value = $(tds[1]).text().trim();
          console.log(`Data: "${label}" => "${value}"`);

          if (label === 'location') detail.location = value;
          else if (label === 'post office') detail.city = value;
          else if (label === 'state') detail.state = value;
          else if (label === 'postcode') detail.postcode = value;
        }
      });
    }

    console.log('\n🗺️ Searching for GPS Coordinates...');
    
    // GPS COORDINATE block
    const gpsPanel = $('h3.panel-title-custom')
      .filter((i, el) => $(el).text().trim() === 'GPS Coordinate (Approximate)')
      .closest('.panel');

    console.log('GPS panel found:', gpsPanel.length > 0);

    if (gpsPanel.length > 0) {
      const table = gpsPanel.find('table#t2');
      console.log('GPS Table#t2 found:', table.length > 0);
      
      table.find('tr').each((i, row) => {
        const tds = $(row).find('td');
        if (tds.length === 2) {
          const label = $(tds[0]).text().trim().toLowerCase();
          const value = $(tds[1]).text().trim();
          console.log(`GPS Data: "${label}" => "${value}"`);

          if (label === 'latitude') detail.gps_lat = value;
          else if (label === 'longitude') detail.gps_lng = value;
        }
      });
    }

    console.log('\n📊 Final Result:');
    console.log(JSON.stringify(detail, null, 2));
    
    const hasData = detail.location || detail.city || detail.state || detail.postcode;
    const hasGPS = detail.gps_lat || detail.gps_lng;
    
    console.log('\n✅ Extraction Summary:');
    console.log('Has location data:', hasData);
    console.log('Has GPS data:', hasGPS);
    
    if (!hasData && !hasGPS) {
      console.log('\n🔍 DEBUG: Checking alternative selectors...');
      
      // Check if there are any tables at all
      $('table').each((i, table) => {
        const tableId = $(table).attr('id') || 'no-id';
        const rows = $(table).find('tr').length;
        console.log(`Table[${i}]: id="${tableId}", rows=${rows}`);
        
        if (rows > 0) {
          $(table).find('tr').each((j, row) => {
            const cells = $(row).find('td');
            if (cells.length > 0) {
              const cellTexts = [];
              cells.each((k, cell) => {
                cellTexts.push($(cell).text().trim());
              });
              console.log(`  Row[${j}]: ${cellTexts.join(' | ')}`);
            }
          });
        }
      });
    }
    
    return detail;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

testSingleExtraction();
