const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Wix Site Configuration
const WIX_SITE_ID = 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4';

// Helper function to fetch Wix product media
async function fetchWixProductMedia(wixId) {
  try {
    // Use Wix REST API to fetch product with media
    // Note: This requires proper authentication via Wix API key or OAuth token
    const apiKey = process.env.WIX_API_KEY || process.env.WIX_ACCESS_TOKEN;
    
    if (!apiKey) {
      console.log(`⚠️ Wix API key not configured - cannot fetch media for product ${wixId}`);
      return null;
    }

    const response = await fetch(`https://www.wixapis.com/stores-reader/v1/products/${wixId}`, {
      headers: {
        'Authorization': apiKey,
        'wix-site-id': WIX_SITE_ID,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`⚠️ Wix API returned ${response.status} for product ${wixId}: ${errorText}`);
      return null;
    }

    const data = await response.json();
    if (data.product && data.product.media) {
      console.log(`✅ Successfully fetched Wix media for ${wixId}: ${data.product.media.items?.length || 0} items`);
    }
    return data.product || null;
  } catch (error) {
    console.log(`⚠️ Error fetching Wix media for ${wixId}:`, error.message);
    return null;
  }
}

// Helper function to extract images and videos from Wix media
function extractWixMedia(wixProduct) {
  if (!wixProduct || !wixProduct.media) {
    console.log('⚠️ No media found in Wix product');
    return { images: [], videos: [] };
  }

  const images = [];
  const videos = [];

  // Extract main media
  if (wixProduct.media.mainMedia) {
    const mainMedia = wixProduct.media.mainMedia;
    if (mainMedia.mediaType === 'image' && mainMedia.image?.url) {
      images.push(mainMedia.image.url);
      console.log(`📸 Added main image: ${mainMedia.image.url}`);
    } else if (mainMedia.mediaType === 'video' && mainMedia.video?.files?.[0]?.url) {
      // Use the highest quality video (first in array is usually highest)
      const videoUrl = mainMedia.video.files[0].url;
      videos.push(videoUrl);
      console.log(`🎥 Added main video: ${videoUrl}`);
    }
  }

  // Extract additional media items
  if (wixProduct.media.items && Array.isArray(wixProduct.media.items)) {
    wixProduct.media.items.forEach((item, index) => {
      if (item.mediaType === 'image' && item.image?.url) {
        images.push(item.image.url);
        console.log(`📸 Added image ${index + 1}: ${item.image.url}`);
      } else if (item.mediaType === 'video' && item.video?.files?.[0]?.url) {
        // Use the highest quality video (first in array is usually highest)
        const videoUrl = item.video.files[0].url;
        videos.push(videoUrl);
        console.log(`🎥 Added video ${index + 1}: ${videoUrl}`);
      }
    });
  }

  console.log(`✅ Extracted ${images.length} images and ${videos.length} videos from Wix media`);
  return { images, videos };
}

// Database connections
const dbPath = path.join(__dirname, '..', 'database', 'energy_calculator.db');
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  console.log('📁 Creating database directory:', dbDir);
  fs.mkdirSync(dbDir, { recursive: true });
}

const grantsDataPath = path.join(__dirname, '..', 'products-with-grants-and-collection.json');
const fullDatabasePath = path.join(__dirname, '..', 'FULL-DATABASE-5554.json');

// Load grants data (5,554 products with government grants)
let grantsData = null;
try {
    const grantsDataRaw = fs.readFileSync(grantsDataPath, 'utf8');
    grantsData = JSON.parse(grantsDataRaw);
    console.log(`✅ Loaded ${grantsData.products.length} products with grants data`);
} catch (error) {
    console.error('❌ Error loading grants data:', error.message);
    grantsData = null;
}

// Load full database (5,556 products with all images - same as /api/products uses)
let fullDatabaseData = null;
try {
    const fullDatabaseRaw = fs.readFileSync(fullDatabasePath, 'utf8');
    fullDatabaseData = JSON.parse(fullDatabaseRaw);
    console.log(`✅ Loaded ${fullDatabaseData.products.length} products from FULL-DATABASE-5554.json`);
} catch (error) {
    console.error('❌ Error loading FULL-DATABASE-5554.json:', error.message);
    fullDatabaseData = null;
}

// GET /api/product-widget/:productId - Get product data for widget
router.get('/:productId', async (req, res) => {
  const { productId } = req.params;
  
  // First, try to find product in FULL-DATABASE-5554.json (has all images - same as /api/products)
  if (fullDatabaseData && fullDatabaseData.products) {
    const fullDbProduct = fullDatabaseData.products.find(p => 
      p.id === productId || 
      p.name.toLowerCase().includes(productId.toLowerCase()) ||
      (p.modelNumber && p.modelNumber.toLowerCase().includes(productId.toLowerCase()))
    );
    
    if (fullDbProduct) {
      console.log(`✅ Found product in FULL-DATABASE: ${fullDbProduct.name}`);
      
      // Helper function to detect gas products
      const isGasProduct = (product) => {
        const name = (product.name || '').toLowerCase();
        const category = (product.category || '').toLowerCase();
        const subcategory = (product.subcategory || '').toLowerCase();
        const fuelType = (product.fuelType || product.fuel_type || '').toLowerCase();
        
        // Check for gas-related keywords
        return name.includes('gas') || 
               name.includes('condensing') || 
               name.includes('warm air unit heater') ||
               name.includes('boiler') ||
               fuelType === 'gas' ||
               category.includes('heating') && (name.includes('heater') || name.includes('boiler'));
      };
      
      // Mapping for known gas products and their heating capacities (from ETL website)
      // Format: { productId or namePattern: heatingCapacity }
      const gasProductHeatingCapacity = {
        'etl_13_75468': 100, // APEN GROUP LK Kondensa Condensing Warm Air Unit Heater
        'etl_13_75467': 100,
        'etl_13_75466': 100,
        'etl_13_75465': 100,
        // Add more as needed
      };
      
      // Check if product is gas-powered
      const isGas = isGasProduct(fullDbProduct);
      let heatingCapacity = null;
      
      // Try to get heating capacity from mapping
      if (isGas) {
        heatingCapacity = gasProductHeatingCapacity[fullDbProduct.id] || 
                          gasProductHeatingCapacity[fullDbProduct.name] ||
                          null;
        
        // Try to extract from specifications if available
        if (!heatingCapacity && fullDbProduct.specifications) {
          try {
            const specs = typeof fullDbProduct.specifications === 'string' 
              ? JSON.parse(fullDbProduct.specifications) 
              : fullDbProduct.specifications;
            if (specs && specs['Heating Capacity']) {
              const capacityStr = specs['Heating Capacity'].toString().replace(/[^\d.]/g, '');
              heatingCapacity = parseFloat(capacityStr) || null;
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }
      
      // Calculate running cost (assuming 0.15€/kWh, 8h/day)
      const electricityRate = 0.15;
      const hoursPerDay = 8;
      // Parse power - handle string or number
      let productPower = typeof fullDbProduct.power === 'string' 
        ? parseFloat(fullDbProduct.power.replace(/[^\d.]/g, '')) || 0
        : (fullDbProduct.power || 0);
      
      // If power is invalid/0, check if energyRating contains the actual power value (from ETL)
      // This handles cases where ETL data was mapped incorrectly (power in energyRating field)
      if (productPower === 0 || productPower === null || isNaN(productPower)) {
        const energyRatingPower = typeof fullDbProduct.energyRating === 'string'
          ? parseFloat(fullDbProduct.energyRating.replace(/[^\d.]/g, ''))
          : (typeof fullDbProduct.energyRating === 'number' ? fullDbProduct.energyRating : null);
        
        if (energyRatingPower && energyRatingPower > 0 && energyRatingPower < 1000) {
          // Use energyRating as power if it's a reasonable power value (0-1000 kW)
          productPower = energyRatingPower;
          console.log(`⚠️ Using energyRating (${energyRatingPower}) as power for product ${fullDbProduct.id}`);
        }
      }
      
      // For gas products, use heating capacity if power is 0/unknown
      if (isGas && (productPower === 0 || productPower === null || isNaN(productPower)) && heatingCapacity) {
        productPower = heatingCapacity;
        console.log(`🔥 Using heating capacity (${heatingCapacity} kW) for gas product ${fullDbProduct.id}`);
      }
      
      const runningCostPerYear = (productPower / 1000) * hoursPerDay * electricityRate * 365;
      
      // Create standard comparison (assume 25% higher power consumption)
      const standardPower = productPower * 1.25;
      const standardRunningCostPerYear = (standardPower / 1000) * hoursPerDay * electricityRate * 365;
      
      // Check if product is also in grants data (might have more up-to-date grants info)
      let grantsProduct = null;
      if (grantsData && grantsData.products) {
        grantsProduct = grantsData.products.find(p => p.id === productId);
      }
      
      // Use grants data if available (may have more recent grants info), otherwise use FULL-DATABASE grants
      // Parse grants if they're stored as JSON strings
      let grants = [];
      if (grantsProduct && grantsProduct.grants) {
        if (Array.isArray(grantsProduct.grants)) {
          grants = grantsProduct.grants;
        } else if (typeof grantsProduct.grants === 'string') {
          try {
            const parsed = JSON.parse(grantsProduct.grants);
            grants = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            grants = [];
          }
        }
      } else if (fullDbProduct.grants) {
        if (Array.isArray(fullDbProduct.grants)) {
          grants = fullDbProduct.grants;
        } else if (typeof fullDbProduct.grants === 'string') {
          try {
            const parsed = JSON.parse(fullDbProduct.grants);
            grants = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            grants = [];
          }
        }
      }
      
      let collectionAgencies = [];
      if (grantsProduct && grantsProduct.collectionAgencies) {
        collectionAgencies = Array.isArray(grantsProduct.collectionAgencies) 
          ? grantsProduct.collectionAgencies 
          : [];
      } else if (fullDbProduct.collectionAgencies) {
        collectionAgencies = Array.isArray(fullDbProduct.collectionAgencies) 
          ? fullDbProduct.collectionAgencies 
          : [];
      }
      
      // Extract currentProduct from JSON (for comparison with existing product)
      let currentProduct = null;
      if (grantsProduct && grantsProduct.currentProduct) {
        currentProduct = typeof grantsProduct.currentProduct === 'string'
          ? JSON.parse(grantsProduct.currentProduct)
          : grantsProduct.currentProduct;
      } else if (fullDbProduct.currentProduct) {
        currentProduct = typeof fullDbProduct.currentProduct === 'string'
          ? JSON.parse(fullDbProduct.currentProduct)
          : fullDbProduct.currentProduct;
      }
      
      // Initialize images and videos arrays from existing data
      let images = [];
      let videos = [];
      
      // Parse existing images field if it exists (JSON string)
      if (fullDbProduct.images) {
        try {
          const parsedImages = JSON.parse(fullDbProduct.images);
          images = Array.isArray(parsedImages) ? parsedImages : [];
        } catch (e) {
          // If not JSON, treat as single string
          if (typeof fullDbProduct.images === 'string') {
            images = [fullDbProduct.images];
          }
        }
      }
      
      // Parse existing videos field if it exists (JSON string)
      if (fullDbProduct.videos) {
        try {
          const parsedVideos = JSON.parse(fullDbProduct.videos);
          videos = Array.isArray(parsedVideos) ? parsedVideos : [];
        } catch (e) {
          // If not JSON, treat as single string
          if (typeof fullDbProduct.videos === 'string') {
            videos = [fullDbProduct.videos];
          }
        }
      }
      
      // Fetch Wix media if product has wixId
      if (fullDbProduct.wixId) {
        try {
          const wixProduct = await fetchWixProductMedia(fullDbProduct.wixId);
          if (wixProduct) {
            const wixMedia = extractWixMedia(wixProduct);
            // Merge Wix images (avoid duplicates)
            wixMedia.images.forEach(imgUrl => {
              if (!images.includes(imgUrl)) {
                images.push(imgUrl);
              }
            });
            // Merge Wix videos (avoid duplicates)
            wixMedia.videos.forEach(videoUrl => {
              if (!videos.includes(videoUrl)) {
                videos.push(videoUrl);
              }
            });
            console.log(`✅ Fetched Wix media: ${wixMedia.images.length} images, ${wixMedia.videos.length} videos`);
          }
        } catch (error) {
          console.log(`⚠️ Error fetching Wix media, using existing data:`, error.message);
          // Continue with existing data
        }
      }
      
      const product = {
        id: fullDbProduct.id,
        name: fullDbProduct.name,
        power: productPower, // Use parsed numeric power (or heating capacity for gas products)
        brand: fullDbProduct.brand || 'Unknown',
        category: fullDbProduct.category || 'General',
        subcategory: fullDbProduct.subcategory,
        energyRating: fullDbProduct.energyRating || 'N/A',
        efficiency: fullDbProduct.efficiency || 'Standard',
        modelNumber: fullDbProduct.modelNumber,
        image_url: fullDbProduct.imageUrl || null, // Use imageUrl from FULL-DATABASE (has all images from Saturday)
        images: images, // Array of image URLs (including Wix images)
        videos: videos, // Array of video URLs (including Wix videos)
        runningCostPerYear: runningCostPerYear,
        // Gas product information
        isGas: isGas,
        heatingCapacity: heatingCapacity || (isGas ? productPower : null), // Include heating capacity for gas products
        fuelType: isGas ? 'Gas' : 'Electric',
        // Government grants data (already parsed above)
        grants: Array.isArray(grants) ? grants : [],
        collectionAgencies: Array.isArray(collectionAgencies) ? collectionAgencies : [],
        // Current product for comparison (from JSON)
        currentProduct: currentProduct || null,
        standardComparison: {
          name: `Standard ${fullDbProduct.category || 'Product'}`,
          power: standardPower,
          brand: 'Standard Brand',
          runningCostPerYear: standardRunningCostPerYear
        }
      };
      
      return res.json({
        success: true,
        product: product,
        source: grantsProduct ? 'full_database_json_with_grants' : 'full_database_json'
      });
    }
  }
  
  // Second, try to find product in grants data (5,554 products with government grants)
  if (grantsData && grantsData.products) {
    const grantsProduct = grantsData.products.find(p => 
      p.id === productId || 
      p.name.toLowerCase().includes(productId.toLowerCase()) ||
      (p.modelNumber && p.modelNumber.toLowerCase().includes(productId.toLowerCase()))
    );
    
    if (grantsProduct) {
      console.log(`✅ Found product in grants data: ${grantsProduct.name}`);
      
      // Calculate running cost (assuming 0.15€/kWh, 8h/day)
      const electricityRate = 0.15;
      const hoursPerDay = 8;
      
      // Parse power - handle string or number
      let grantsPower = typeof grantsProduct.power === 'string' 
        ? parseFloat(grantsProduct.power.replace(/[^\d.]/g, '')) || 0
        : (grantsProduct.power || 0);
      
      // If power is invalid/0, check if energyRating contains the actual power value (from ETL)
      if (grantsPower === 0 || grantsPower === null || isNaN(grantsPower)) {
        const energyRatingPower = typeof grantsProduct.energyRating === 'string'
          ? parseFloat(grantsProduct.energyRating.replace(/[^\d.]/g, ''))
          : (typeof grantsProduct.energyRating === 'number' ? grantsProduct.energyRating : null);
        
        if (energyRatingPower && energyRatingPower > 0 && energyRatingPower < 1000) {
          grantsPower = energyRatingPower;
          console.log(`⚠️ Using energyRating (${energyRatingPower}) as power for grants product ${grantsProduct.id}`);
        }
      }
      
      const runningCostPerYear = (grantsPower / 1000) * hoursPerDay * electricityRate * 365;
      
      // Create standard comparison (assume 25% higher power consumption)
      const standardPower = grantsPower * 1.25;
      const standardRunningCostPerYear = (standardPower / 1000) * hoursPerDay * electricityRate * 365;
      
      // Initialize images and videos arrays from existing data
      let images = [];
      let videos = [];
      
      // Parse existing images field if it exists (JSON string)
      if (grantsProduct.images) {
        try {
          const parsedImages = JSON.parse(grantsProduct.images);
          images = Array.isArray(parsedImages) ? parsedImages : [];
        } catch (e) {
          if (typeof grantsProduct.images === 'string') {
            images = [grantsProduct.images];
          }
        }
      }
      
      // Parse existing videos field if it exists (JSON string)
      if (grantsProduct.videos) {
        try {
          const parsedVideos = JSON.parse(grantsProduct.videos);
          videos = Array.isArray(parsedVideos) ? parsedVideos : [];
        } catch (e) {
          if (typeof grantsProduct.videos === 'string') {
            videos = [grantsProduct.videos];
          }
        }
      }
      
      // Fetch Wix media if product has wixId
      if (grantsProduct.wixId) {
        try {
          const wixProduct = await fetchWixProductMedia(grantsProduct.wixId);
          if (wixProduct) {
            const wixMedia = extractWixMedia(wixProduct);
            // Merge Wix images (avoid duplicates)
            wixMedia.images.forEach(imgUrl => {
              if (!images.includes(imgUrl)) {
                images.push(imgUrl);
              }
            });
            // Merge Wix videos (avoid duplicates)
            wixMedia.videos.forEach(videoUrl => {
              if (!videos.includes(videoUrl)) {
                videos.push(videoUrl);
              }
            });
            console.log(`✅ Fetched Wix media: ${wixMedia.images.length} images, ${wixMedia.videos.length} videos`);
          }
        } catch (error) {
          console.log(`⚠️ Error fetching Wix media, using existing data:`, error.message);
          // Continue with existing data
        }
      }
      
      // Check if product is gas-powered (same logic as above)
      const isGasProduct = (product) => {
        const name = (product.name || '').toLowerCase();
        const category = (product.category || '').toLowerCase();
        const subcategory = (product.subcategory || '').toLowerCase();
        const fuelType = (product.fuelType || product.fuel_type || '').toLowerCase();
        
        return name.includes('gas') || 
               name.includes('condensing') || 
               name.includes('warm air unit heater') ||
               name.includes('boiler') ||
               fuelType === 'gas' ||
               category.includes('heating') && (name.includes('heater') || name.includes('boiler'));
      };
      
      const gasProductHeatingCapacity = {
        'etl_13_75468': 100,
        'etl_13_75467': 100,
        'etl_13_75466': 100,
        'etl_13_75465': 100,
      };
      
      const isGas = isGasProduct(grantsProduct);
      let heatingCapacity = null;
      
      if (isGas) {
        heatingCapacity = gasProductHeatingCapacity[grantsProduct.id] || 
                          gasProductHeatingCapacity[grantsProduct.name] ||
                          null;
        
        if (!heatingCapacity && grantsProduct.specifications) {
          try {
            const specs = typeof grantsProduct.specifications === 'string' 
              ? JSON.parse(grantsProduct.specifications) 
              : grantsProduct.specifications;
            if (specs && specs['Heating Capacity']) {
              const capacityStr = specs['Heating Capacity'].toString().replace(/[^\d.]/g, '');
              heatingCapacity = parseFloat(capacityStr) || null;
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
        
        // Use heating capacity if power is 0/unknown
        if ((grantsPower === 0 || grantsPower === null || isNaN(grantsPower)) && heatingCapacity) {
          grantsPower = heatingCapacity;
          console.log(`🔥 Using heating capacity (${heatingCapacity} kW) for gas product ${grantsProduct.id}`);
        }
      }
      
      // Extract currentProduct from JSON (for comparison with existing product)
      let currentProduct = null;
      if (grantsProduct.currentProduct) {
        currentProduct = typeof grantsProduct.currentProduct === 'string'
          ? JSON.parse(grantsProduct.currentProduct)
          : grantsProduct.currentProduct;
      }
      
      // Parse grants if they're stored as JSON strings
      let grants = [];
      if (grantsProduct.grants) {
        if (Array.isArray(grantsProduct.grants)) {
          grants = grantsProduct.grants;
        } else if (typeof grantsProduct.grants === 'string') {
          try {
            const parsed = JSON.parse(grantsProduct.grants);
            grants = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            grants = [];
          }
        }
      }
      
      // Parse collectionAgencies if stored as JSON strings
      let collectionAgencies = [];
      if (grantsProduct.collectionAgencies) {
        if (Array.isArray(grantsProduct.collectionAgencies)) {
          collectionAgencies = grantsProduct.collectionAgencies;
        } else if (typeof grantsProduct.collectionAgencies === 'string') {
          try {
            const parsed = JSON.parse(grantsProduct.collectionAgencies);
            collectionAgencies = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            collectionAgencies = [];
          }
        }
      }
      
      const product = {
        id: grantsProduct.id,
        name: grantsProduct.name,
        power: grantsPower, // Use parsed power (may use energyRating or heating capacity as fallback)
        brand: grantsProduct.brand || 'Unknown',
        category: grantsProduct.category || 'General',
        subcategory: grantsProduct.subcategory,
        energyRating: grantsProduct.energyRating || 'N/A',
        efficiency: grantsProduct.efficiency || 'Standard',
        modelNumber: grantsProduct.modelNumber,
        image_url: grantsProduct.imageUrl,
        images: images, // Array of image URLs (including Wix images)
        videos: videos, // Array of video URLs (including Wix videos)
        runningCostPerYear: runningCostPerYear,
        // Gas product information
        isGas: isGas,
        heatingCapacity: heatingCapacity || (isGas ? grantsPower : null),
        fuelType: isGas ? 'Gas' : 'Electric',
        // Government grants data (properly parsed from JSON)
        grants: grants,
        collectionAgencies: collectionAgencies,
        // Current product for comparison (from JSON)
        currentProduct: currentProduct || null,
        standardComparison: {
          name: `Standard ${grantsProduct.category || 'Product'}`,
          power: standardPower,
          brand: 'Standard Brand',
          runningCostPerYear: standardRunningCostPerYear
        }
      };
      
      return res.json({
        success: true,
        product: product,
        source: 'grants_database'
      });
    }
  }
  
  // Fallback to original database (1,135 products)
  const db = new sqlite3.Database(dbPath);
  
  // Query the real database for the product
  db.get(
    'SELECT * FROM products WHERE id = ? OR name LIKE ? OR model_number = ?',
    [productId, `%${productId}%`, productId],
    async (err, row) => {
      db.close();
      
      if (err) {
        // If database table doesn't exist, return 404 instead of error
        if (err.code === 'SQLITE_ERROR' && err.message.includes('no such table')) {
          console.log(`ℹ️ Database table not found for compare - product ${productId} not found in JSON fallback`);
          return res.status(404).json({
            success: false,
            message: 'Product not found',
            productId: productId
          });
        }
        
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: err.message
        });
      }
      
      if (!row) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
          productId: productId
        });
      }
      
      // Helper function to detect gas products
      const isGasProduct = (product) => {
        const name = (product.name || '').toLowerCase();
        const category = (product.category || '').toLowerCase();
        const fuelType = (product.fuelType || product.fuel_type || '').toLowerCase();
        
        return name.includes('gas') || 
               name.includes('condensing') || 
               name.includes('warm air unit heater') ||
               name.includes('boiler') ||
               fuelType === 'gas' ||
               category.includes('heating') && (name.includes('heater') || name.includes('boiler'));
      };
      
      const gasProductHeatingCapacity = {
        'etl_13_75468': 100,
        'etl_13_75467': 100,
        'etl_13_75466': 100,
        'etl_13_75465': 100,
      };
      
      const isGas = isGasProduct(row);
      let heatingCapacity = null;
      let productPower = row.power || 0;
      
      if (isGas) {
        heatingCapacity = gasProductHeatingCapacity[row.id] || 
                          gasProductHeatingCapacity[row.name] ||
                          null;
        
        // Use heating capacity if power is 0/unknown
        if ((productPower === 0 || productPower === null || isNaN(productPower)) && heatingCapacity) {
          productPower = heatingCapacity;
          console.log(`🔥 Using heating capacity (${heatingCapacity} kW) for gas product ${row.id}`);
        }
      }
      
      // Calculate running cost (assuming 0.15€/kWh, 8h/day)
      const electricityRate = 0.15;
      const hoursPerDay = 8;
      const runningCostPerYear = (productPower / 1000) * hoursPerDay * electricityRate * 365;
      
      // Create standard comparison (assume 25% higher power consumption)
      const standardPower = productPower * 1.25;
      const standardRunningCostPerYear = (standardPower / 1000) * hoursPerDay * electricityRate * 365;
      
      // Initialize images and videos arrays
      let images = [];
      let videos = [];
      
      // Try to fetch Wix media if product has wixId in database
      // Note: Database doesn't store wixId, but we can check FULL-DATABASE for matching product
      const matchingProduct = fullDatabaseData && fullDatabaseData.products 
        ? fullDatabaseData.products.find(p => p.id === row.id || p.name === row.name)
        : null;
      
      if (matchingProduct && matchingProduct.wixId) {
        try {
          const wixProduct = await fetchWixProductMedia(matchingProduct.wixId);
          if (wixProduct) {
            const wixMedia = extractWixMedia(wixProduct);
            images = wixMedia.images;
            videos = wixMedia.videos;
            console.log(`✅ Fetched Wix media from database product: ${wixMedia.images.length} images, ${wixMedia.videos.length} videos`);
          }
        } catch (error) {
          console.log(`⚠️ Error fetching Wix media for database product:`, error.message);
          // Continue without Wix media
        }
      }
      
      const product = {
        id: row.id,
        name: row.name,
        power: productPower, // Use parsed power (or heating capacity for gas products)
        brand: row.brand || 'Unknown',
        category: row.category || 'General',
        subcategory: row.subcategory,
        energyRating: row.energy_rating || 'N/A',
        efficiency: row.efficiency || 'Standard',
        modelNumber: row.model_number,
        image_url: row.image_url,  // Column is image_url (snake_case) in database
        images: images, // Array of image URLs (including Wix images)
        videos: videos, // Array of video URLs (including Wix videos)
        runningCostPerYear: runningCostPerYear,
        // Gas product information
        isGas: isGas,
        heatingCapacity: heatingCapacity || (isGas ? productPower : null),
        fuelType: isGas ? 'Gas' : 'Electric',
        standardComparison: {
          name: `Standard ${row.category || 'Product'}`,
          power: standardPower,
          brand: 'Standard Brand',
          runningCostPerYear: standardRunningCostPerYear
        }
      };
      
      res.json({
        success: true,
        product: product
      });
    }
  );
});

// GET /api/product-widget/compare/:productId - Get comparison data
router.get('/compare/:productId', (req, res) => {
  const { productId } = req.params;
  const { electricityRate = 0.15, hoursPerDay = 8 } = req.query;

  // First, try to find product in FULL-DATABASE-5554.json (preferred method)
  if (fullDatabaseData && fullDatabaseData.products) {
    const fullDbProduct = fullDatabaseData.products.find(p => 
      p.id === productId || 
      p.name.toLowerCase().includes(productId.toLowerCase()) ||
      (p.modelNumber && p.modelNumber.toLowerCase().includes(productId.toLowerCase()))
    );
    
    if (fullDbProduct) {
      const power = parseFloat(fullDbProduct.power) || 0;
      const powerInKw = power / 1000; // Convert W to kW
      const electricityRateNum = parseFloat(electricityRate) || 0.15;
      const hoursPerDayNum = parseFloat(hoursPerDay) || 8;
      
      const dailyCost = powerInKw * electricityRateNum * hoursPerDayNum;
      const monthlyCost = dailyCost * 30;
      const annualCost = dailyCost * 365;
      
      return res.json({
        success: true,
        product: {
          id: fullDbProduct.id,
          name: fullDbProduct.name,
          power: power,
          brand: fullDbProduct.brand
        },
        results: {
          daily: dailyCost,
          monthly: monthlyCost,
          annual: annualCost,
          inputs: {
            power: power,
            electricityRate: electricityRateNum,
            hoursPerDay: hoursPerDayNum
          }
        }
      });
    }
  }

  // Fallback to database if JSON not available
  const db = new sqlite3.Database(dbPath);
  
  // Query the real database for the product
  db.get(
    'SELECT * FROM products WHERE id = ? OR name LIKE ? OR model_number = ?',
    [productId, `%${productId}%`, productId],
    (err, row) => {
      db.close();
      
      if (err) {
        // If database table doesn't exist, return 404 instead of error
        if (err.code === 'SQLITE_ERROR' && err.message.includes('no such table')) {
          console.log(`ℹ️ Database table not found for compare - product ${productId} not found in JSON fallback`);
          return res.status(404).json({
            success: false,
            message: 'Product not found',
            productId: productId
          });
        }
        
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: err.message
        });
      }
      
      if (!row) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
          productId: productId
        });
      }
      
      const rate = parseFloat(electricityRate);
      const hours = parseFloat(hoursPerDay);
      
      // Calculate costs for the efficient product
      const efficientDailyCost = (row.power / 1000) * hours * rate;
      const efficientAnnualCost = efficientDailyCost * 365;
      
      // Create standard comparison (assume 25% higher power consumption)
      const standardPower = row.power * 1.25;
      const standardDailyCost = (standardPower / 1000) * hours * rate;
      const standardAnnualCost = standardDailyCost * 365;
      
      const annualSavings = standardAnnualCost - efficientAnnualCost;
      const monthlySavings = annualSavings / 12;
      const dailySavings = annualSavings / 365;

      res.json({
        success: true,
        comparison: {
          efficient: {
            name: row.name,
            brand: row.brand || 'Unknown',
            power: row.power,
            dailyCost: efficientDailyCost,
            monthlyCost: efficientDailyCost * 30,
            annualCost: efficientAnnualCost
          },
          standard: {
            name: `Standard ${row.category || 'Product'}`,
            brand: 'Standard Brand',
            power: standardPower,
            dailyCost: standardDailyCost,
            monthlyCost: standardDailyCost * 30,
            annualCost: standardAnnualCost
          },
          savings: {
            daily: dailySavings,
            monthly: monthlySavings,
            annual: annualSavings
          },
          inputs: {
            electricityRate: rate,
            hoursPerDay: hours
          }
        }
      });
    }
  );
});

// POST /api/product-widget/calculate - Calculate energy costs for any product
router.post('/calculate', (req, res) => {
  const { power, electricityRate, hoursPerDay } = req.body;
  
  if (!power || !electricityRate || !hoursPerDay) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: power, electricityRate, hoursPerDay'
    });
  }

  const dailyCost = (power / 1000) * hoursPerDay * electricityRate;
  const monthlyCost = dailyCost * 30;
  const annualCost = dailyCost * 365;

  res.json({
    success: true,
    results: {
      daily: dailyCost,
      monthly: monthlyCost,
      annual: annualCost,
      inputs: {
        power: power,
        electricityRate: electricityRate,
        hoursPerDay: hoursPerDay
      }
    }
  });
});

// GET /api/product-widget/products/all - Get all products for search
router.get('/products/all', (req, res) => {
  let allProducts = [];
  
  // First, add products from grants database (5,554 products with government grants)
  if (grantsData && grantsData.products) {
    const grantsProducts = grantsData.products.map(product => ({
      id: product.id,
      name: product.name,
      power: product.power,
      brand: product.brand || 'Unknown',
      category: product.category || 'General',
      subcategory: product.subcategory,
      energyRating: product.energyRating || 'N/A',
      efficiency: product.efficiency || 'Standard',
      modelNumber: product.modelNumber,
      image_url: product.imageUrl,
      // ADD government grants data
      grants: product.grants || [],
      collectionAgencies: product.collectionAgencies || [],
      source: 'grants_database'
    }));
    allProducts = allProducts.concat(grantsProducts);
    console.log(`✅ Added ${grantsProducts.length} products from grants database`);
  }
  
  // Then, add products from original database (1,135 products)
  const db = new sqlite3.Database(dbPath);
  
  // Get all products with basic info for search
  db.all(
    'SELECT id, name, power, brand, category, subcategory, energy_rating, efficiency, model_number, image_url FROM products ORDER BY name',
    (err, rows) => {
      db.close();
      
      if (err) {
        // If database table doesn't exist, just use JSON products (already loaded above)
        if (err.code === 'SQLITE_ERROR' && err.message.includes('no such table')) {
          console.log(`ℹ️ Database table not found - using JSON products only (${allProducts.length} products)`);
          return res.json({
            success: true,
            products: allProducts,
            total: allProducts.length,
            grantsProducts: grantsData ? grantsData.products.length : 0,
            originalProducts: 0
          });
        }
        
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: err.message
        });
      }
      
      // Transform the data for the widget
      const products = rows.map(row => {
        // Calculate estimated price based on power and category
        let estimatedPrice = 1000; // Base price
        const power = parseFloat(row.power) || 0;
        
        // Adjust price based on power and category
        if (power > 0) {
          estimatedPrice = Math.max(500, power * 50); // €50 per kW minimum €500
        }
        
        // Category-based price adjustments
        if (row.category && row.category.toLowerCase().includes('heat pump')) {
          estimatedPrice *= 1.5; // Heat pumps are more expensive
        } else if (row.category && row.category.toLowerCase().includes('motor')) {
          estimatedPrice *= 0.8; // Motors are typically less expensive
        }
        
        return {
          id: row.id,
          name: row.name,
          power: row.power,
          brand: row.brand || 'Unknown',
          category: row.category || 'General',
          subcategory: row.subcategory,
          energyRating: row.energy_rating || 'N/A',
          efficiency: row.efficiency || 'Standard',
          modelNumber: row.model_number,
          image_url: row.image_url,  // Column is image_url (snake_case) in database
          price: Math.round(estimatedPrice)
        };
      });
      
        // Add products from original database to combined list
        // Products are already transformed correctly above, just add source field
        allProducts = allProducts.concat(products.map(product => ({
          ...product, // Spread all existing fields
          source: 'original_database'
        })));
        
        console.log(`✅ Added ${products.length} products from original database`);
        console.log(`✅ Total products available: ${allProducts.length}`);

        res.json({
          success: true,
          products: allProducts,
          total: allProducts.length,
          grantsProducts: grantsData ? grantsData.products.length : 0,
          originalProducts: products.length
        });
    }
  );
});

// GET /api/product-widget/products/search - Search products
router.get('/products/search', (req, res) => {
  const { q, category, brand } = req.query;
  
  if (!q && !category && !brand) {
    return res.status(400).json({
      success: false,
      message: 'At least one search parameter required (q, category, or brand)'
    });
  }
  
  // First, try to search in JSON database (preferred method)
  if (fullDatabaseData && fullDatabaseData.products) {
    let filteredProducts = fullDatabaseData.products;
    
    // Apply filters
    if (q) {
      const searchTerm = q.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        (p.name && p.name.toLowerCase().includes(searchTerm)) ||
        (p.modelNumber && p.modelNumber.toLowerCase().includes(searchTerm)) ||
        (p.brand && p.brand.toLowerCase().includes(searchTerm))
      );
    }
    
    if (category) {
      const categoryTerm = category.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.category && p.category.toLowerCase().includes(categoryTerm)
      );
    }
    
    if (brand) {
      const brandTerm = brand.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.brand && p.brand.toLowerCase().includes(brandTerm)
      );
    }
    
    // Limit to 50 results
    filteredProducts = filteredProducts.slice(0, 50);
    
    const products = filteredProducts.map(p => ({
      id: p.id,
      name: p.name,
      power: p.power,
      brand: p.brand || 'Unknown',
      category: p.category || 'General',
      subcategory: p.subcategory,
      energyRating: p.energyRating || 'N/A',
      efficiency: p.efficiency || 'Standard',
      modelNumber: p.modelNumber
    }));
    
    return res.json({
      success: true,
      products: products,
      total: products.length,
      searchParams: { q, category, brand }
    });
  }
  
  // Fallback to database if JSON not available
  const db = new sqlite3.Database(dbPath);
  
  let query = 'SELECT id, name, power, brand, category, subcategory, energy_rating, efficiency, model_number FROM products WHERE 1=1';
  const params = [];
  
  if (q) {
    query += ' AND (name LIKE ? OR model_number LIKE ? OR brand LIKE ?)';
    const searchTerm = `%${q}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  if (category) {
    query += ' AND category LIKE ?';
    params.push(`%${category}%`);
  }
  
  if (brand) {
    query += ' AND brand LIKE ?';
    params.push(`%${brand}%`);
  }
  
  query += ' ORDER BY name LIMIT 50';
  
  db.all(query, params, (err, rows) => {
    db.close();
    
    if (err) {
      // If database table doesn't exist, return empty results
      if (err.code === 'SQLITE_ERROR' && err.message.includes('no such table')) {
        console.log(`ℹ️ Database table not found for search - using JSON fallback`);
        return res.json({
          success: true,
          products: [],
          total: 0,
          searchParams: { q, category, brand }
        });
      }
      
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }
    
    const products = rows.map(row => ({
      id: row.id,
      name: row.name,
      power: row.power,
      brand: row.brand || 'Unknown',
      category: row.category || 'General',
      subcategory: row.subcategory,
      energyRating: row.energy_rating || 'N/A',
      efficiency: row.efficiency || 'Standard',
      modelNumber: row.model_number
    }));
    
    res.json({
      success: true,
      products: products,
      total: products.length,
      searchParams: { q, category, brand }
    });
  });
});

// GET /api/product-widget/incentives/:productId - Get incentives for a product
router.get('/incentives/:productId', (req, res) => {
  const { productId } = req.params;
  const { country = 'NL' } = req.query;
  
  // First, try to find product in FULL-DATABASE-5554.json (preferred method)
  if (fullDatabaseData && fullDatabaseData.products) {
    const fullDbProduct = fullDatabaseData.products.find(p => 
      p.id === productId || 
      p.name.toLowerCase().includes(productId.toLowerCase()) ||
      (p.modelNumber && p.modelNumber.toLowerCase().includes(productId.toLowerCase()))
    );
    
    if (fullDbProduct) {
      // Get incentives based on product category and country
      const incentives = getIncentivesForProduct({
        id: fullDbProduct.id,
        name: fullDbProduct.name,
        category: fullDbProduct.category,
        subcategory: fullDbProduct.subcategory,
        brand: fullDbProduct.brand
      }, country);
      
      return res.json({
        success: true,
        product: {
          id: fullDbProduct.id,
          name: fullDbProduct.name,
          category: fullDbProduct.category,
          subcategory: fullDbProduct.subcategory,
          brand: fullDbProduct.brand
        },
        country: country,
        incentives: incentives
      });
    }
  }
  
  // Fallback to database if JSON not available
  const db = new sqlite3.Database(dbPath);
  
  db.get(
    'SELECT * FROM products WHERE id = ? OR name LIKE ? OR model_number = ?',
    [productId, `%${productId}%`, productId],
    (err, row) => {
      db.close();
      
      if (err) {
        // If database table doesn't exist, return 404 instead of error
        if (err.code === 'SQLITE_ERROR' && err.message.includes('no such table')) {
          console.log(`ℹ️ Database table not found for incentives - product ${productId} not found in JSON fallback`);
          return res.status(404).json({
            success: false,
            message: 'Product not found',
            productId: productId
          });
        }
        
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: err.message
        });
      }
      
      if (!row) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
          productId: productId
        });
      }
      
      // Get incentives based on product category and country
      const incentives = getIncentivesForProduct(row, country);
      
      res.json({
        success: true,
        product: {
          id: row.id,
          name: row.name,
          category: row.category,
          subcategory: row.subcategory,
          brand: row.brand
        },
        country: country,
        incentives: incentives
      });
    }
  );
});

// Helper function to get incentives based on product and country
function getIncentivesForProduct(product, country) {
  const incentives = {
    'NL': [
      {
        id: 'isde-nl',
        title: 'ISDE Scheme',
        type: 'subsidy',
        description: 'Investment subsidy for sustainable energy devices like heat pumps, solar boilers, insulation.',
        relevance: 'High if you sell heat pumps, solar thermal, insulation',
        requirements: 'KVK number, product must be on devices list',
        duration: 'Until end 2029',
        priority: false,
        links: [
          { text: '⚡ Check Device List', url: 'https://business.gov.nl/regulation/isde-sustainable-energy-investment-allowance/', type: 'apply' },
          { text: '📋 Requirements', url: 'https://wijgaanverduurzamen.nl', type: 'info' }
        ]
      },
      {
        id: 'eia-nl',
        title: 'EIA - Energy Investment Allowance',
        type: 'tax',
        description: 'Tax deduction for companies investing in energy-efficient technologies.',
        relevance: 'High - Reduces equipment costs',
        requirements: 'Choose from official "Energy List", meet investment criteria',
        priority: false,
        links: [
          { text: '💡 View Energy List', url: 'https://www.rvo.nl/subsidies-financiering/eia', type: 'apply' }
        ]
      }
    ],
    'DE': [
      {
        id: 'bafa-kfw',
        title: 'BAFA & KfW Programs',
        type: 'subsidy',
        description: 'Grants and loans for heat pumps, insulation, efficient boilers.',
        relevance: 'High for heating and cooling systems',
        requirements: 'German establishment, meet efficiency criteria',
        priority: false,
        links: [
          { text: '🏠 Apply Now', url: 'https://www.bafa.de', type: 'apply' },
          { text: '📋 KfW Info', url: 'https://www.kfw.de', type: 'info' }
        ]
      }
    ],
    'ES': [
      {
        id: 'clean-tech-es',
        title: 'Clean Tech Manufacturing',
        type: 'grant',
        description: '€750 million fund for solar panels, batteries, electrolyzers.',
        relevance: 'High for renewable energy products',
        requirements: 'Spanish establishment, innovative technology',
        priority: false,
        links: [
          { text: '🌞 Apply', url: 'https://www.idae.es', type: 'apply' }
        ]
      }
    ],
    'PT': [
      {
        id: 'energy-transition-pt',
        title: 'Energy Transition Aid',
        type: 'subsidy',
        description: '€1 billion Green Deal funding for renewables and efficiency.',
        relevance: 'High for energy efficiency products',
        requirements: 'Portuguese establishment, meet Green Deal criteria',
        priority: false,
        links: [
          { text: '🌱 Apply', url: 'https://www.fundoambiental.pt', type: 'apply' }
        ]
      }
    ]
  };

  // Get base incentives for country
  let relevantIncentives = incentives[country] || [];
  
  // Check if product actually qualifies for each incentive
  relevantIncentives = relevantIncentives.map(incentive => {
    const qualifies = checkProductQualification(product, incentive, country);
    return {
      ...incentive,
      qualifies: qualifies,
      qualificationReason: getQualificationReason(product, incentive, country)
    };
  });

  // Filter to only show incentives the product qualifies for
  return relevantIncentives.filter(incentive => incentive.qualifies);
}

// Check if a product qualifies for a specific incentive
function checkProductQualification(product, incentive, country) {
  const category = (product.category || '').toLowerCase();
  const subcategory = (product.subcategory || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  
  // Enhanced product type detection for ETL products
  const isHeatPump = name.includes('heat pump') || name.includes('altherma') || name.includes('vitocal') || 
                     name.includes('auriga') || name.includes('quinta ace') || name.includes('compress') ||
                     name.includes('logic air') || category.includes('heat pump') || subcategory.includes('heat pump');
  
  const isMotor = name.includes('motor') || name.includes('ie4') || name.includes('ie3') || 
                  name.includes('asynchronous') || name.includes('synchronous') || category.includes('motor') ||
                  subcategory.includes('motor') || brand.includes('nord') || brand.includes('abb');
  
  const isHVAC = name.includes('hvac') || name.includes('drive') || name.includes('frenic') || 
                 name.includes('optidrive') || name.includes('vlt') || name.includes('acs880') ||
                 name.includes('chilled beam') || name.includes('perfect irus') || category.includes('hvac') ||
                 subcategory.includes('hvac') || brand.includes('danfoss') || brand.includes('fuji') ||
                 brand.includes('invertek') || brand.includes('evapco') || brand.includes('jaeggi');
  
  const isSolar = name.includes('solar') || name.includes('thermal') || name.includes('photovoltaic') ||
                  category.includes('solar') || subcategory.includes('solar');
  
  const isInsulation = name.includes('insulation') || name.includes('insulating') || 
                       category.includes('insulation') || subcategory.includes('insulation');
  
  const isBoiler = name.includes('boiler') || name.includes('vitodens') || 
                   category.includes('boiler') || subcategory.includes('boiler');
  
  const isRefrigeration = name.includes('refrigerator') || name.includes('fridge') || name.includes('freezer') ||
                          category.includes('refrigeration') || subcategory.includes('refrigeration');
  
  // ISDE Scheme (Netherlands) - Heat pumps, solar thermal, insulation
  if (incentive.id === 'isde-nl') {
    return isHeatPump || isSolar || isInsulation;
  }
  
  // EIA (Netherlands) - Energy efficient equipment
  if (incentive.id === 'eia-nl') {
    return isHeatPump || isMotor || isHVAC || isRefrigeration;
  }
  
  // BAFA & KfW (Germany) - Heat pumps, boilers, insulation
  if (incentive.id === 'bafa-kfw') {
    return isHeatPump || isBoiler || isHVAC;
  }
  
  // Clean Tech (Spain) - Solar, batteries, renewable
  if (incentive.id === 'clean-tech-es') {
    return isSolar || isHeatPump || name.includes('battery') || name.includes('renewable');
  }
  
  // Energy Transition (Portugal) - Energy efficiency
  if (incentive.id === 'energy-transition-pt') {
    return isHeatPump || isMotor || isHVAC || isRefrigeration || isSolar;
  }
  
  return false;
}

// Get reason why product qualifies
function getQualificationReason(product, incentive, country) {
  const category = (product.category || '').toLowerCase();
  const subcategory = (product.subcategory || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  
  // Enhanced product type detection for ETL products
  const isHeatPump = name.includes('heat pump') || name.includes('altherma') || name.includes('vitocal') || 
                     name.includes('auriga') || name.includes('quinta ace') || name.includes('compress') ||
                     name.includes('logic air') || category.includes('heat pump') || subcategory.includes('heat pump');
  
  const isMotor = name.includes('motor') || name.includes('ie4') || name.includes('ie3') || 
                  name.includes('asynchronous') || name.includes('synchronous') || category.includes('motor') ||
                  subcategory.includes('motor') || brand.includes('nord') || brand.includes('abb');
  
  const isHVAC = name.includes('hvac') || name.includes('drive') || name.includes('frenic') || 
                 name.includes('optidrive') || name.includes('vlt') || name.includes('acs880') ||
                 name.includes('chilled beam') || name.includes('perfect irus') || category.includes('hvac') ||
                 subcategory.includes('hvac') || brand.includes('danfoss') || brand.includes('fuji') ||
                 brand.includes('invertek') || brand.includes('evapco') || brand.includes('jaeggi');
  
  const isSolar = name.includes('solar') || name.includes('thermal') || name.includes('photovoltaic') ||
                  category.includes('solar') || subcategory.includes('solar');
  
  const isInsulation = name.includes('insulation') || name.includes('insulating') || 
                       category.includes('insulation') || subcategory.includes('insulation');
  
  const isBoiler = name.includes('boiler') || name.includes('vitodens') || 
                   category.includes('boiler') || subcategory.includes('boiler');
  
  const isRefrigeration = name.includes('refrigerator') || name.includes('fridge') || name.includes('freezer') ||
                          category.includes('refrigeration') || subcategory.includes('refrigeration');
  
  if (incentive.id === 'isde-nl') {
    if (isHeatPump) return 'Heat pumps qualify for ISDE subsidy';
    if (isSolar) return 'Solar thermal systems qualify for ISDE subsidy';
    if (isInsulation) return 'Insulation products qualify for ISDE subsidy';
  }
  
  if (incentive.id === 'eia-nl') {
    if (isHeatPump) return 'Heat pumps qualify for EIA tax deduction';
    if (isMotor) return 'Energy efficient motors qualify for EIA';
    if (isHVAC) return 'HVAC equipment qualifies for EIA';
    if (isRefrigeration) return 'Refrigeration equipment qualifies for EIA';
  }
  
  if (incentive.id === 'bafa-kfw') {
    if (isHeatPump) return 'Heat pumps qualify for BAFA/KfW programs';
    if (isBoiler) return 'Efficient boilers qualify for BAFA/KfW';
    if (isHVAC) return 'HVAC systems qualify for BAFA/KfW';
  }
  
  if (incentive.id === 'clean-tech-es') {
    if (isSolar) return 'Solar products qualify for Clean Tech funding';
    if (isHeatPump) return 'Heat pumps qualify for Clean Tech funding';
  }
  
  if (incentive.id === 'energy-transition-pt') {
    if (isHeatPump) return 'Heat pumps qualify for Energy Transition Aid';
    if (isMotor) return 'Efficient motors qualify for Energy Transition Aid';
    if (isHVAC) return 'HVAC equipment qualifies for Energy Transition Aid';
    if (isSolar) return 'Solar products qualify for Energy Transition Aid';
  }
  
  return `This ${product.category} product qualifies for ${incentive.title}`;
}

module.exports = router;
