const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Wix Site Configuration
const WIX_SITE_ID = 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4';
const WIX_API_KEY = process.env.WIX_API_KEY || '';

// File paths
const fullDatabasePath = path.join(__dirname, 'FULL-DATABASE-5554.json');

console.log('🔍 Verifying Wix Media Access for Products with wixId...\n');

// Helper function to fetch Wix product media (same as in product-widget.js)
async function fetchWixProductMedia(wixId) {
  try {
    const response = await fetch(`https://www.wixapis.com/stores-reader/v1/products/${wixId}`, {
      headers: {
        'Authorization': WIX_API_KEY,
        'wix-site-id': WIX_SITE_ID,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return { error: `HTTP ${response.status}`, status: response.status };
    }

    const data = await response.json();
    return data.product || null;
  } catch (error) {
    return { error: error.message };
  }
}

// Helper function to extract images and videos from Wix media (same as in product-widget.js)
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
      videos.push(mainMedia.video.files[0].url);
    }
  }

  // Extract additional media items
  if (wixProduct.media.items && Array.isArray(wixProduct.media.items)) {
    wixProduct.media.items.forEach(item => {
      if (item.mediaType === 'image' && item.image?.url) {
        images.push(item.image.url);
      } else if (item.mediaType === 'video' && item.video?.files?.[0]?.url) {
        videos.push(item.video.files[0].url);
      }
    });
  }

  return { images, videos };
}

// Load full database
let fullDatabaseData = null;
try {
  const fullDatabaseRaw = fs.readFileSync(fullDatabasePath, 'utf8');
  fullDatabaseData = JSON.parse(fullDatabaseRaw);
  console.log(`✅ Loaded ${fullDatabaseData.products.length} products from FULL-DATABASE-5554.json`);
} catch (error) {
  console.error('❌ Error loading FULL-DATABASE-5554.json:', error.message);
  process.exit(1);
}

// Find all products with wixId
const productsWithWixId = fullDatabaseData.products.filter(p => p.wixId);

console.log(`\n📊 Found ${productsWithWixId.length} products with wixId\n`);

if (productsWithWixId.length === 0) {
  console.log('⚠️ No products with wixId found in database.');
  console.log('💡 This might mean:');
  console.log('   - Products were uploaded but wixId was not saved to database');
  console.log('   - Products are stored in a different file');
  console.log('   - wixId field name might be different');
  process.exit(0);
}

// Test a sample of products (first 10, or all if less than 10)
const testProducts = productsWithWixId.slice(0, Math.min(10, productsWithWixId.length));

console.log(`🧪 Testing ${testProducts.length} products (sample from ${productsWithWixId.length} total)...\n`);

const results = {
  total: productsWithWixId.length,
  tested: 0,
  accessible: 0,
  withImages: 0,
  withVideos: 0,
  errors: 0,
  details: []
};

// Test each product
async function testProduct(product) {
  const result = {
    id: product.id,
    name: product.name,
    wixId: product.wixId,
    accessible: false,
    images: 0,
    videos: 0,
    error: null
  };

  try {
    const wixProduct = await fetchWixProductMedia(product.wixId);
    
    if (wixProduct && !wixProduct.error) {
      result.accessible = true;
      const media = extractWixMedia(wixProduct);
      result.images = media.images.length;
      result.videos = media.videos.length;
      
      if (media.images.length > 0) {
        results.withImages++;
      }
      if (media.videos.length > 0) {
        results.withVideos++;
      }
    } else {
      result.error = wixProduct?.error || 'Product not found';
      results.errors++;
    }
  } catch (error) {
    result.error = error.message;
    results.errors++;
  }

  return result;
}

// Test all products in sample
async function runTests() {
  for (const product of testProducts) {
    results.tested++;
    const result = await testProduct(product);
    
    if (result.accessible) {
      results.accessible++;
      console.log(`✅ ${result.name}`);
      console.log(`   Wix ID: ${result.wixId}`);
      console.log(`   Images: ${result.images}, Videos: ${result.videos}`);
    } else {
      console.log(`❌ ${result.name}`);
      console.log(`   Wix ID: ${result.wixId}`);
      console.log(`   Error: ${result.error}`);
    }
    
    results.details.push(result);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total products with wixId: ${results.total}`);
  console.log(`Products tested: ${results.tested}`);
  console.log(`✅ Accessible: ${results.accessible}`);
  console.log(`📸 With images: ${results.withImages}`);
  console.log(`🎥 With videos: ${results.withVideos}`);
  console.log(`❌ Errors: ${results.errors}`);
  
  if (results.accessible > 0) {
    console.log('\n✅ CONFIRMED: Wix media integration is working!');
    console.log('   Products with wixId can access their media via the API.');
  } else {
    console.log('\n⚠️ WARNING: No products were accessible via Wix API.');
    console.log('   Please check:');
    console.log('   - WIX_API_KEY is set correctly in .env file');
    console.log('   - Wix API key has proper permissions');
    console.log('   - wixId values are correct');
  }

  // Save detailed results
  const resultsPath = path.join(__dirname, 'wix-media-verification-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Detailed results saved to: ${resultsPath}`);
  
  // List all products with wixId (for reference)
  const allWixProducts = productsWithWixId.map(p => ({
    id: p.id,
    name: p.name,
    wixId: p.wixId
  }));
  
  const listPath = path.join(__dirname, 'all-products-with-wixid.json');
  fs.writeFileSync(listPath, JSON.stringify({ total: allWixProducts.length, products: allWixProducts }, null, 2));
  console.log(`📋 All products with wixId listed in: ${listPath}`);
}

// Check API key first
if (!WIX_API_KEY) {
  console.error('❌ ERROR: WIX_API_KEY not found in environment variables.');
  console.error('   Please set WIX_API_KEY in your .env file.');
  process.exit(1);
}

// Run tests
runTests().catch(error => {
  console.error('❌ Error running tests:', error);
  process.exit(1);
});






