// Direct test of the scraper endpoint
import axios from 'axios';

async function testScraper() {
  try {
    console.log('🧪 Testing scraper endpoint directly...\n');
    
    // Start scraping with the smallest file
    console.log('1️⃣ Starting scraping with perlis_2.json (5 records)...');
    const scrapeResponse = await axios.post('http://localhost:3000/api/scrape/perlis_2.json', {
      selectedRecords: null
    });
    
    console.log('✅ Scrape request accepted');
    console.log('Session ID:', scrapeResponse.data.sessionId);
    
    const sessionId = scrapeResponse.data.sessionId;
    
    // Monitor progress
    console.log('\n2️⃣ Monitoring progress...');
    for (let i = 0; i < 15; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const progressResponse = await axios.get(`http://localhost:3000/api/progress/${sessionId}`);
      const progress = progressResponse.data;
      
      console.log(`\nCheck ${i + 1}:`);
      console.log(`  Progress: ${progress.progress}/${progress.total}`);
      console.log(`  Status: ${progress.status}`);
      console.log(`  Message: ${progress.message}`);
      console.log(`  CAPTCHA Required: ${progress.captchaRequired}`);
      console.log(`  Results Count: ${progress.results?.length || 0}`);
      
      if (progress.results && progress.results.length > 0) {
        console.log('  Latest Result:', JSON.stringify(progress.results[progress.results.length - 1], null, 2));
      }
      
      if (progress.status === 'completed') {
        console.log('\n✅ Scraping completed successfully!');
        console.log(`Total results: ${progress.results?.length || 0}`);
        break;
      }
      
      if (progress.status === 'error') {
        console.log('\n❌ Scraping failed');
        break;
      }
      
      if (progress.captchaRequired) {
        console.log('\n⚠️ CAPTCHA detected, please solve manually and continue');
        break;
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testScraper();
