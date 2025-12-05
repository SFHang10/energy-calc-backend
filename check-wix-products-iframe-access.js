/**
 * Script to check which Wix hand dryer products are accessible via iframe product pages
 */

const fs = require('fs');
const path = require('path');

const FULL_DATABASE_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');

// Products shown in Wix listing (from image description)
const wixProducts = [
  { name: 'Air Fury High Speed Dryer (C)', price: 543.00 },
  { name: 'Air Fury High Speed Dryer (W)', price: 670.00 },
  { name: 'The Splash Lab Air Fury High Speed Hand Dryer TSL.89', price: 600.95 },
  { name: 'Turboforce® Hand Dryer', price: 477.95 },
  { name: 'Turbo Force Branded White Fast Dry', price: 477.95 }
];

// Load the database
let database;
try {
  console.log('📂 Loading database...');
  const databaseContent = fs.readFileSync(FULL_DATABASE_PATH, 'utf8');
  database = JSON.parse(databaseContent);
  console.log(`✅ Loaded database with ${database.products?.length || 0} products\n`);
} catch (error) {
  console.error('❌ Error loading database:', error.message);
  process.exit(1);
}

// Find matching products
console.log('🔍 Checking which Wix products are accessible via iframe:\n');
console.log('='.repeat(80));

wixProducts.forEach((wixProduct, index) => {
  console.log(`\n${index + 1}. Wix Product: ${wixProduct.name}`);
  console.log(`   Price: €${wixProduct.price}`);
  
  // Search for matching products in database
  const matches = database.products.filter(p => {
    const nameMatch = p.name.toLowerCase().includes(wixProduct.name.toLowerCase().split('(')[0].trim()) ||
                     wixProduct.name.toLowerCase().includes(p.name.toLowerCase().split('(')[0].trim());
    const priceMatch = Math.abs(p.price - wixProduct.price) < 1; // Allow 1 euro difference
    
    return nameMatch && priceMatch;
  });
  
  if (matches.length > 0) {
    matches.forEach(match => {
      console.log(`   ✅ Found in database:`);
      console.log(`      ID: ${match.id}`);
      console.log(`      Name: ${match.name}`);
      console.log(`      Price: €${match.price}`);
      console.log(`      wixId: ${match.wixId || 'N/A'}`);
      console.log(`      Product Page URL: ${match.productPageUrl || 'N/A'}`);
      
      // Check media
      let imageCount = 0;
      let videoCount = 0;
      
      if (match.images) {
        try {
          const images = JSON.parse(match.images);
          imageCount = Array.isArray(images) ? images.length : 0;
        } catch (e) {
          imageCount = 0;
        }
      }
      
      if (match.videos) {
        try {
          const videos = JSON.parse(match.videos);
          videoCount = Array.isArray(videos) ? videos.length : 0;
        } catch (e) {
          videoCount = 0;
        }
      }
      
      console.log(`      Images: ${imageCount}, Videos: ${videoCount}`);
      console.log(`      Iframe Access: ${match.productPageUrl ? '✅ Yes' : '❌ No'}`);
    });
  } else {
    console.log(`   ❌ NOT FOUND in database`);
  }
});

console.log('\n' + '='.repeat(80));
console.log('\n📊 Summary:');
console.log('All products with a "productPageUrl" can be accessed via the iframe product page');
console.log('by using the URL format: product-page-v2-marketplace-test.html?product={id}');










