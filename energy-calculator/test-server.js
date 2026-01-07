// Test file to verify server.js content
const fs = require('fs');

// Read the server.js file
const serverContent = fs.readFileSync('./server.js', 'utf8');

console.log('=== Server.js Content Check ===');
console.log('File size:', serverContent.length, 'characters');

// Check for key indicators
const hasCategoriesRoute = serverContent.includes('/api/calculator-wix/categories');
const hasEnergyEfficientRoute = serverContent.includes('/api/calculator-wix/energy-efficient');
const hasBrandsRoute = serverContent.includes('/api/calculator-wix/brands');
const hasSampleProducts = serverContent.includes('sampleProducts');

console.log('Has categories route:', hasCategoriesRoute);
console.log('Has energy-efficient route:', hasEnergyEfficientRoute);
console.log('Has brands route:', hasBrandsRoute);
console.log('Has sampleProducts:', hasSampleProducts);

// Check the startup message
const hasNewEndpoints = serverContent.includes('GET /api/calculator-wix/categories (Wix calculator categories)');

console.log('Has new endpoints in startup message:', hasNewEndpoints);

if (hasCategoriesRoute && hasEnergyEfficientRoute && hasBrandsRoute && hasSampleProducts) {
  console.log('✅ Server.js file looks correct!');
} else {
  console.log('❌ Server.js file is missing expected content');
} 