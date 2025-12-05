/**
 * Script to fetch Wix product media and update the database
 * This script uses Wix MCP to fetch media for all products that have a wixId
 * and updates the FULL-DATABASE-5554.json file with the media URLs
 */

const fs = require('fs');
const path = require('path');

const FULL_DATABASE_PATH = path.join(__dirname, 'FULL-DATABASE-5554.json');
const WIX_SITE_ID = 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4';

// Load the database
let database;
try {
  const databaseContent = fs.readFileSync(FULL_DATABASE_PATH, 'utf8');
  database = JSON.parse(databaseContent);
  console.log(`✅ Loaded database with ${database.products?.length || 0} products`);
} catch (error) {
  console.error('❌ Error loading database:', error.message);
  process.exit(1);
}

// Function to extract images and videos from Wix media response
function extractWixMedia(wixProduct) {
  if (!wixProduct || !wixProduct.media) {
    return { images: [], videos: [] };
  }

  const images = [];
  const videos = [];

  // Extract main media
  if (wixProduct.media.mainMedia) {
    const mainMedia = wixProduct.media.mainMedia;
    if (mainMedia.mediaType === 'image' && mainMedia.image?.url) {
      images.push(mainMedia.image.url);
    } else if (mainMedia.mediaType === 'video' && mainMedia.video?.files?.[0]?.url) {
      // Use the highest quality video (first in array is usually highest)
      videos.push(mainMedia.video.files[0].url);
    }
  }

  // Extract additional media items
  if (wixProduct.media.items && Array.isArray(wixProduct.media.items)) {
    wixProduct.media.items.forEach(item => {
      if (item.mediaType === 'image' && item.image?.url) {
        images.push(item.image.url);
      } else if (item.mediaType === 'video' && item.video?.files?.[0]?.url) {
        // Use the highest quality video (first in array is usually highest)
        videos.push(item.video.files[0].url);
      }
    });
  }

  return { images, videos };
}

// Function to update a single product with Wix media
async function updateProductWithWixMedia(product, wixProduct) {
  const wixMedia = extractWixMedia(wixProduct);
  
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
  wixMedia.images.forEach(imgUrl => {
    if (!allImages.includes(imgUrl)) {
      allImages.push(imgUrl);
    }
  });

  const allVideos = [...existingVideos];
  wixMedia.videos.forEach(videoUrl => {
    if (!allVideos.includes(videoUrl)) {
      allVideos.push(videoUrl);
    }
  });

  // Update product
  product.images = JSON.stringify(allImages);
  product.videos = JSON.stringify(allVideos);
  
  return {
    imagesAdded: wixMedia.images.length,
    videosAdded: wixMedia.videos.length,
    totalImages: allImages.length,
    totalVideos: allVideos.length
  };
}

// Main function to process all products
async function processAllProducts() {
  const productsWithWixId = database.products.filter(p => p.wixId);
  console.log(`\n📊 Found ${productsWithWixId.length} products with wixId`);
  console.log('⚠️  This script requires manual execution via Wix MCP');
  console.log('⚠️  You need to call the Wix API for each product manually');
  console.log('\n📋 Products to update:');
  
  productsWithWixId.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name} (${product.id}) - wixId: ${product.wixId}`);
  });

  console.log('\n💡 To update products, you need to:');
  console.log('1. Use Wix MCP to fetch product data for each wixId');
  console.log('2. Extract media from the Wix API response');
  console.log('3. Update the database with the media URLs');
  console.log('\n📝 Example Wix MCP call:');
  console.log(`   CallWixSiteAPI with siteId: ${WIX_SITE_ID}`);
  console.log(`   URL: https://www.wixapis.com/stores-reader/v1/products/{wixId}`);
  console.log(`   Method: GET`);
}

// Run the script
if (require.main === module) {
  processAllProducts().catch(error => {
    console.error('❌ Error processing products:', error);
    process.exit(1);
  });
}

module.exports = {
  extractWixMedia,
  updateProductWithWixMedia,
  processAllProducts
};










