/**
 * Script to update all products with wixId with their Wix media
 * This script identifies products with wixId and provides instructions
 * for fetching their media using Wix MCP
 */

const fs = require('fs');
const path = require('path');

const FULL_DATABASE_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');
const WIX_SITE_ID = 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4';

// Load the database
let database;
try {
  console.log('📂 Loading database...');
  const databaseContent = fs.readFileSync(FULL_DATABASE_PATH, 'utf8');
  database = JSON.parse(databaseContent);
  console.log(`✅ Loaded database with ${database.products?.length || 0} products`);
} catch (error) {
  console.error('❌ Error loading database:', error.message);
  process.exit(1);
}

// Find all products with wixId
const productsWithWixId = database.products.filter(p => p.wixId);
console.log(`\n📊 Found ${productsWithWixId.length} products with wixId\n`);

// Display products that need updating
console.log('📋 Products with wixId:');
productsWithWixId.forEach((product, index) => {
  const hasVideos = product.videos && product.videos !== '[]' && product.videos !== '[""]';
  const videoCount = hasVideos ? JSON.parse(product.videos).length : 0;
  const imageCount = product.images ? JSON.parse(product.images).length : 0;
  
  console.log(`${index + 1}. ${product.name}`);
  console.log(`   ID: ${product.id}`);
  console.log(`   wixId: ${product.wixId}`);
  console.log(`   Images: ${imageCount}, Videos: ${videoCount}`);
  console.log(`   Wix URL: https://www.greenwaysmarket.com${product.wixProductUrl || ''}`);
  console.log('');
});

console.log('\n💡 To update all products with Wix media:');
console.log('1. Use Wix MCP to fetch product data for each wixId');
console.log('2. Extract media from the Wix API response');
console.log('3. Update the database with the media URLs');
console.log('\n📝 Example Wix MCP call for each product:');
console.log(`   CallWixSiteAPI`);
console.log(`   siteId: ${WIX_SITE_ID}`);
console.log(`   url: https://www.wixapis.com/stores-reader/v1/products/{wixId}`);
console.log(`   method: GET`);
console.log('\n⚠️  Note: This script only identifies products. You need to manually fetch');
console.log('   media for each product using Wix MCP and update the database.');










