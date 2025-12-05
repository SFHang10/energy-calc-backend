/**
 * Script to help find your production backend URL
 * This script checks various sources where the backend URL might be stored
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Searching for backend URL...\n');

// Check environment variables
console.log('1️⃣ Checking environment variables:');
console.log('   PORT:', process.env.PORT || 'Not set');
console.log('   BACKEND_URL:', process.env.BACKEND_URL || 'Not set');
console.log('   PRODUCTION_URL:', process.env.PRODUCTION_URL || 'Not set');
console.log('   API_URL:', process.env.API_URL || 'Not set');
console.log('');

// Check package.json for homepage or repository
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('2️⃣ Checking package.json:');
  console.log('   Homepage:', packageJson.homepage || 'Not set');
  console.log('   Repository:', packageJson.repository?.url || 'Not set');
  console.log('');
} catch (err) {
  console.log('2️⃣ package.json not found or invalid');
  console.log('');
}

// Check for .env files
console.log('3️⃣ Checking for .env files:');
const envFiles = ['.env', '.env.production', '.env.local', '.env.development'];
envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ Found: ${file}`);
    try {
      const envContent = fs.readFileSync(file, 'utf8');
      const backendUrlMatch = envContent.match(/BACKEND_URL|PRODUCTION_URL|API_URL/i);
      if (backendUrlMatch) {
        console.log(`   ⚠️  Contains ${backendUrlMatch[0]} - check manually`);
      }
    } catch (err) {
      console.log(`   ⚠️  Could not read ${file}`);
    }
  } else {
    console.log(`   ❌ Not found: ${file}`);
  }
});
console.log('');

// Check HTML files for backend URLs
console.log('4️⃣ Checking HTML files for backend URLs:');
const htmlFiles = [
  'product-categories.html',
  'product-categories-optimized.html',
  'product-page-v2.html',
  'category-product-page.html'
];

htmlFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      // Look for localhost, http://, https:// patterns
      const urlMatches = content.match(/https?:\/\/[^\s"']+/g);
      if (urlMatches) {
        console.log(`   ✅ ${file}:`);
        urlMatches.forEach(url => {
          if (!url.includes('fonts.googleapis') && !url.includes('cdnjs.cloudflare') && !url.includes('wixstatic')) {
            console.log(`      - ${url}`);
          }
        });
      }
    } catch (err) {
      console.log(`   ⚠️  Could not read ${file}`);
    }
  }
});
console.log('');

// Check server-new.js for PORT or URL
console.log('5️⃣ Checking server-new.js:');
if (fs.existsSync('server-new.js')) {
  try {
    const serverContent = fs.readFileSync('server-new.js', 'utf8');
    const portMatch = serverContent.match(/PORT\s*=\s*process\.env\.PORT\s*\|\|\s*(\d+)/);
    if (portMatch) {
      console.log(`   Default PORT: ${portMatch[1]}`);
    }
  } catch (err) {
    console.log('   ⚠️  Could not read server-new.js');
  }
}
console.log('');

// Suggestions
console.log('📋 Next Steps:');
console.log('');
console.log('1. Check your Wix site Network tab for backend requests');
console.log('2. Check your deployment platform (Heroku, Railway, Vercel, Render)');
console.log('3. Check your Wix Editor iframe src attribute');
console.log('4. Check your browser bookmarks/history for backend URLs');
console.log('5. Check your email for deployment confirmation messages');
console.log('');
console.log('💡 Common backend URL patterns:');
console.log('   - https://your-app.herokuapp.com');
console.log('   - https://your-app.railway.app');
console.log('   - https://your-app.vercel.app');
console.log('   - https://your-app.onrender.com');
console.log('   - https://api.yoursite.com');
console.log('   - https://backend.yoursite.com');
console.log('');






