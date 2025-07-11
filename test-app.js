// Test script to verify the app functionality
import axios from 'axios';
import fs from 'fs/promises';

const BASE_URL = 'http://localhost:3000';

async function testApp() {
    console.log('🧪 Starting Application Test...\n');
    
    try {
        // Test 1: Check if server is running
        console.log('1️⃣ Testing server connectivity...');
        try {
            const response = await axios.get(BASE_URL);
            console.log('✅ Server is running and responding');
            console.log(`   Status: ${response.status}`);
        } catch (error) {
            console.log('❌ Server is not accessible');
            console.log('   Please make sure the server is running with: node server.js');
            console.log('   Or use: start.bat\n');
            return;
        }
        
        // Test 2: Check API endpoints
        console.log('\n2️⃣ Testing API endpoints...');
        
        // Test data files endpoint
        try {
            const filesResponse = await axios.get(`${BASE_URL}/api/data-files`);
            console.log('✅ Data files endpoint working');
            console.log(`   Files available: ${filesResponse.data.files ? filesResponse.data.files.length : 0}`);
        } catch (error) {
            console.log('❌ Data files endpoint failed');
        }
        
        // Test completed files endpoint
        try {
            const completedResponse = await axios.get(`${BASE_URL}/api/completed-files`);
            console.log('✅ Completed files endpoint working');
            console.log(`   Completed files: ${completedResponse.data.files ? completedResponse.data.files.length : 0}`);
        } catch (error) {
            console.log('❌ Completed files endpoint failed');
        }
        
        // Test debug sessions endpoint
        try {
            const debugResponse = await axios.get(`${BASE_URL}/api/debug/sessions`);
            console.log('✅ Debug sessions endpoint working');
            console.log(`   Active sessions: ${Object.keys(debugResponse.data.sessions || {}).length}`);
        } catch (error) {
            console.log('❌ Debug sessions endpoint failed');
        }
        
        // Test 3: Test scraping with CAPTCHA detection
        console.log('\n3️⃣ Testing scraping endpoint (should include CAPTCHA detection)...');
        try {
            // Try a small test scrape
            const scrapeResponse = await axios.post(`${BASE_URL}/api/scrape/test-scrape`, {
                state: 'perlis',
                startIndex: 0,
                endIndex: 0  // Just test the first item
            });
            console.log('✅ Scraping endpoint working');
            console.log(`   Response: ${scrapeResponse.data.message || scrapeResponse.data.status}`);
        } catch (error) {
            console.log('❌ Scraping endpoint test failed');
            console.log(`   Error: ${error.message}`);
        }
        
        // Test 4: Check data directory
        console.log('\n4️⃣ Checking data directory...');
        try {
            const dataDir = './data';
            const files = await fs.readdir(dataDir);
            const detailFiles = files.filter(f => f.endsWith('_details.json'));
            console.log(`✅ Data directory exists with ${files.length} total files`);
            console.log(`   Detail files available: ${detailFiles.length}`);
            if (detailFiles.length > 0) {
                console.log(`   Sample files: ${detailFiles.slice(0, 3).join(', ')}`);
            }
        } catch (error) {
            console.log('❌ Data directory check failed');
        }
        
        console.log('\n🎉 Application test completed!');
        console.log('\n📋 Manual Testing Steps:');
        console.log('1. Open browser and go to: http://localhost:3000');
        console.log('2. Try to start scraping a state (e.g., "Perlis")');
        console.log('3. Observe the pre-CAPTCHA check in action');
        console.log('4. Check the download section for available files');
        console.log('5. Test downloading a completed file');
        
        console.log('\n🔍 Key Features to Test:');
        console.log('• Pre-scraping CAPTCHA detection');
        console.log('• CAPTCHA handling during scraping');
        console.log('• Download functionality for completed files');
        console.log('• Error messages and status updates');
        console.log('• No bypass mode should be available');
        
    } catch (error) {
        console.log('❌ Test failed with error:', error.message);
    }
}

// Run the test
testApp();
