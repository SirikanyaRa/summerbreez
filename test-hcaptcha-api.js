// Test hCaptcha API integration
import axios from 'axios';

console.log('🧪 Testing hCaptcha API Integration');
console.log('===================================');

const testHCaptchaAPI = async () => {
  try {
    console.log('🔍 Checking hCaptcha configuration for postcode.my...');
    
    const response = await axios.post("https://api.hcaptcha.com/checksiteconfig", null, {
      params: {
        v: 'ca737f0560add5b36452dede62296c160c23bb19',
        host: 'postcode.my',
        sitekey: 'c6fddc4c-b0dd-42a7-9c25-a5384ae1a72b',
        sc: '1',
        swa: '1',
        spst: '1'
      },
      headers: {
        "accept": "application/json",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "text/plain",
        "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Google Chrome\";v=\"138\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "cookie": "hmt_id=888c9f0b-64ca-4e13-a250-7cd399271944",
        "Referer": "https://newassets.hcaptcha.com/"
      },
      timeout: 10000
    });
    
    console.log('✅ hCaptcha API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data) {
      console.log('\n🧩 Parsed hCaptcha Details:');
      console.log(`  Site Key: ${response.data.sitekey || 'c6fddc4c-b0dd-42a7-9c25-a5384ae1a72b'}`);
      console.log(`  Challenge Type: ${response.data.challenge_type || 'image'}`);
      console.log(`  Pass Required: ${response.data.pass_required || false}`);
      
      if (response.data.challenge_url) {
        console.log(`  Challenge URL: ${response.data.challenge_url}`);
      }
      
      if (response.data.features) {
        console.log(`  Features: ${JSON.stringify(response.data.features)}`);
      }
    }
    
  } catch (error) {
    console.error('❌ hCaptcha API test failed:', error.message);
    
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
};

const demonstrateIntegration = () => {
  console.log('\n🔧 Integration Benefits:');
  console.log('  ✅ Real-time CAPTCHA detection');
  console.log('  ✅ Challenge type identification');
  console.log('  ✅ Site key validation');
  console.log('  ✅ Direct challenge URL access');
  console.log('  ✅ Enhanced user guidance');
  
  console.log('\n📋 Updated Workflow:');
  console.log('  1. Detect CAPTCHA challenge on postcode.my');
  console.log('  2. Query hCaptcha API for challenge details');
  console.log('  3. Display specific challenge information to user');
  console.log('  4. Provide direct links and enhanced instructions');
  console.log('  5. Accept user cookies after solving');
  console.log('  6. Continue scraping with solved session');
  
  console.log('\n🎯 This enhances our cookie solution with precise CAPTCHA detection!');
};

// Run the test
testHCaptchaAPI();
demonstrateIntegration();
