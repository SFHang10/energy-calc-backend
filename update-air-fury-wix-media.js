/**
 * Script to update the Air Fury product with Wix media from the API response
 * This updates the FULL-DATABASE-5554.json file with the media URLs from Wix
 */

const fs = require('fs');
const path = require('path');

const FULL_DATABASE_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');

// Wix media data for Air Fury product (from API response)
const airFuryWixMedia = {
  wixId: 'ee8ca797-5ec6-1801-5c77-d00ef9e5659c',
  images: [
    'https://static.wixstatic.com/media/c123de_2ff386b859d24ff19033ac1a4ca6ed25~mv2.jpg/v1/fit/w_500,h_500,q_90/file.jpg',
    'https://static.wixstatic.com/media/c123de_8c0152248bfa4f5fbac5708def91b834~mv2.jpg/v1/fit/w_1100,h_1100,q_90/file.jpg',
    'https://static.wixstatic.com/media/c123de_f00613f2029847a0b776280372cdbd93~mv2.jpg/v1/fit/w_720,h_720,q_90/file.jpg',
    'https://static.wixstatic.com/media/c123de_b693194df473495aa61fdd2755ccb91b~mv2.jpg/v1/fit/w_1000,h_1000,q_90/file.jpg'
  ],
  videos: [
    'https://video.wixstatic.com/video/c123de_1a15a4e8081e40188e5c7b33fcbb6b0f/720p/mp4/file.mp4'
  ]
};

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

// Find and update the Air Fury product
let updated = false;
let productsUpdated = 0;

database.products.forEach((product, index) => {
  // Update the specific Air Fury product with wixId
  if (product.wixId === airFuryWixMedia.wixId) {
    console.log(`\n📦 Found product: ${product.name} (${product.id})`);
    
    // Parse existing images
    let existingImages = [];
    if (product.images) {
      try {
        const parsed = JSON.parse(product.images);
        existingImages = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        if (typeof product.images === 'string') {
          existingImages = [product.images];
        }
      }
    }

    // Parse existing videos
    let existingVideos = [];
    if (product.videos) {
      try {
        const parsed = JSON.parse(product.videos);
        existingVideos = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        if (typeof product.videos === 'string') {
          existingVideos = [product.videos];
        }
      }
    }

    // Merge Wix media with existing media (avoid duplicates)
    const allImages = [...existingImages];
    airFuryWixMedia.images.forEach(imgUrl => {
      if (!allImages.includes(imgUrl)) {
        allImages.push(imgUrl);
      }
    });

    const allVideos = [...existingVideos];
    airFuryWixMedia.videos.forEach(videoUrl => {
      if (!allVideos.includes(videoUrl)) {
        allVideos.push(videoUrl);
      }
    });

    // Update product
    const imagesBefore = existingImages.length;
    const videosBefore = existingVideos.length;
    
    product.images = JSON.stringify(allImages);
    product.videos = JSON.stringify(allVideos);
    
    console.log(`✅ Updated product ${product.name}:`);
    console.log(`   Images: ${imagesBefore} → ${allImages.length} (added ${allImages.length - imagesBefore})`);
    console.log(`   Videos: ${videosBefore} → ${allVideos.length} (added ${allVideos.length - videosBefore})`);
    
    updated = true;
    productsUpdated++;
  }
});

// Save the updated database
if (updated) {
  try {
    console.log('\n💾 Saving updated database...');
    fs.writeFileSync(FULL_DATABASE_PATH, JSON.stringify(database, null, 2), 'utf8');
    console.log(`✅ Successfully updated database with Wix media for ${productsUpdated} product(s)`);
  } catch (error) {
    console.error('❌ Error saving database:', error.message);
    process.exit(1);
  }
} else {
  console.log('\n⚠️  No products found with the specified wixId');
  console.log(`   Looking for wixId: ${airFuryWixMedia.wixId}`);
}










