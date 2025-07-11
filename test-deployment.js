// Production Deployment Test Script
import http from 'http';
import fs from 'fs-extra';
import path from 'path';

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

console.log('🧪 Running production deployment tests...\n');

// Test configurations
const tests = [
  {
    name: 'Health Check',
    path: '/health',
    method: 'GET',
    expectedStatus: 200,
    expectedContent: 'healthy'
  },
  {
    name: 'Data Files API',
    path: '/api/data-files',
    method: 'GET', 
    expectedStatus: 200,
    expectedContent: 'json'
  },
  {
    name: 'Debug Sessions',
    path: '/api/debug/sessions',
    method: 'GET',
    expectedStatus: 200,
    expectedContent: 'activeSessions'
  },
  {
    name: 'Main Page',
    path: '/',
    method: 'GET',
    expectedStatus: 200,
    expectedContent: 'html'
  }
];

let passed = 0;
let failed = 0;

// Run a single test
async function runTest(test) {
  return new Promise((resolve) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: test.path,
      method: test.method,
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const statusMatch = res.statusCode === test.expectedStatus;
        const contentMatch = data.toLowerCase().includes(test.expectedContent.toLowerCase());
        
        if (statusMatch && contentMatch) {
          console.log(`✅ ${test.name}: PASSED`);
          console.log(`   Status: ${res.statusCode}, Content: ${data.length} bytes`);
          passed++;
        } else {
          console.log(`❌ ${test.name}: FAILED`);
          console.log(`   Expected Status: ${test.expectedStatus}, Got: ${res.statusCode}`);
          console.log(`   Expected Content: "${test.expectedContent}", Got: ${data.substring(0, 100)}...`);
          failed++;
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${test.name}: ERROR - ${err.message}`);
      failed++;
      resolve();
    });

    req.on('timeout', () => {
      console.log(`❌ ${test.name}: TIMEOUT`);
      req.destroy();
      failed++;
      resolve();
    });

    req.setTimeout(5000);
    req.end();
  });
}

// Check if server is running
function checkServer() {
  return new Promise((resolve) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: '/health',
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      resolve(true);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      resolve(false);
    });

    req.setTimeout(3000);
    req.end();
  });
}

// Main test runner
async function runAllTests() {
  console.log(`🔍 Testing deployment at http://${HOST}:${PORT}\n`);

  // Check if server is running
  const isRunning = await checkServer();
  if (!isRunning) {
    console.log(`❌ Server is not running at http://${HOST}:${PORT}`);
    console.log('   Please start the server with: npm start');
    process.exit(1);
  }

  console.log(`✅ Server is running at http://${HOST}:${PORT}\n`);

  // Run all tests
  for (const test of tests) {
    await runTest(test);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }

  // Summary
  console.log('\n📊 Test Results:');
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total:  ${passed + failed}`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Deployment is ready.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the server configuration.');
    process.exit(1);
  }
}

// Check environment
console.log('📋 Environment Information:');
console.log(`   Node.js: ${process.version}`);
console.log(`   Platform: ${process.platform}`);
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`   Target: http://${HOST}:${PORT}`);
console.log('');

// Run tests
runAllTests().catch((error) => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});
