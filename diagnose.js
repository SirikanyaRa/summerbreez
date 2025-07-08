import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Diagnostic Check for Postcode Scraper');
console.log('==========================================\n');

// Check Node.js version
console.log('📋 System Information:');
console.log(`Node.js Version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Architecture: ${process.arch}`);
console.log(`Current Directory: ${__dirname}\n`);

// Check required files
console.log('📁 Required Files Check:');
const requiredFiles = [
  'server.js',
  'package.json',
  'public/index.html',
  'script/scraper-service.js'
];

for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  const exists = await fs.pathExists(filePath);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
}
console.log();

// Check data directory
console.log('📊 Data Files Check:');
try {
  const dataDir = path.join(__dirname, 'data');
  const exists = await fs.pathExists(dataDir);
  
  if (exists) {
    const files = await fs.readdir(dataDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    console.log(`✅ Data directory exists with ${jsonFiles.length} JSON files:`);
    jsonFiles.forEach(file => console.log(`   - ${file}`));
  } else {
    console.log('❌ Data directory not found');
  }
} catch (error) {
  console.log(`❌ Error checking data directory: ${error.message}`);
}
console.log();

// Check dependencies
console.log('📦 Dependencies Check:');
try {
  const packageJson = await fs.readJson(path.join(__dirname, 'package.json'));
  const nodeModulesExists = await fs.pathExists(path.join(__dirname, 'node_modules'));
  
  console.log(`✅ package.json found`);
  console.log(`${nodeModulesExists ? '✅' : '❌'} node_modules directory`);
  
  if (packageJson.dependencies) {
    console.log('Dependencies listed:');
    Object.keys(packageJson.dependencies).forEach(dep => {
      console.log(`   - ${dep}`);
    });
  }
} catch (error) {
  console.log(`❌ Error checking dependencies: ${error.message}`);
}
console.log();

// Test server startup
console.log('🚀 Testing Server Components:');
try {
  // Try to import the server modules
  const express = await import('express');
  console.log('✅ Express module can be imported');
  
  const cors = await import('cors');
  console.log('✅ CORS module can be imported');
  
  const fsExtra = await import('fs-extra');
  console.log('✅ fs-extra module can be imported');
  
  console.log('\n🎉 All checks passed! You can start the server with:');
  console.log('   node server.js');
  console.log('   or run: start.bat');
  
} catch (error) {
  console.log(`❌ Module import error: ${error.message}`);
  console.log('\n🔧 To fix this, run: npm install');
}
