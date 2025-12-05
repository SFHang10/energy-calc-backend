const express = require('express');
const router = express.Router();

// Wix API Configuration
const WIX_API_BASE = 'https://www.wixapis.com';
const GREENWAYS_BUILDINGS_SITE_ID = 'd9c9c6b1-f79a-49a3-8183-4c5a8e24a413';
const GREENWAYS_MARKET_SITE_ID = 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4';

// Helper function to make Wix API calls
async function callWixAPI(siteId, endpoint, method = 'GET', data = null) {
  try {
    const url = `${WIX_API_BASE}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WIX_API_TOKEN}`,
        'wix-site-id': siteId,
        'wix-account-id': 'c123de33-7291-41b4-8bf2-0547ac5aa01c'
      }
    };
    
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }
    
    console.log(`🔗 Making Wix API call: ${method} ${url}`);
    console.log(`🔑 Using site ID: ${siteId}`);
    
    const response = await fetch(url, options);
    
    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HTTP Error Response:`, errorText);
      throw new Error(`Wix API HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const responseText = await response.text();
    console.log(`📄 Response length: ${responseText.length} characters`);
    
    if (!responseText || responseText.trim() === '') {
      throw new Error('Empty response from Wix API');
    }
    
    try {
      const jsonData = JSON.parse(responseText);
      console.log(`✅ Successfully parsed JSON response`);
      return jsonData;
    } catch (parseError) {
      console.error(`❌ JSON Parse Error:`, parseError.message);
      console.error(`📄 Response content:`, responseText.substring(0, 500));
      throw new Error(`Failed to parse JSON response: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Wix API Error:', error);
    throw error;
  }
}

// GET /wix-products/diagnose - Comprehensive diagnostic endpoint
router.get('/diagnose', async (req, res) => {
  try {
    console.log('🔍 Running comprehensive Wix diagnostic...');
    
    const siteId = 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4';
    const results = {
      siteId: siteId,
      timestamp: new Date().toISOString(),
      tests: {}
    };
    
    // Test 1: Check if we can access the site
    try {
      const siteResponse = await callWixAPI(siteId, '/sites/v2/sites/current', 'GET');
      results.tests.siteAccess = {
        success: true,
        siteName: siteResponse.site?.displayName || 'Unknown',
        siteUrl: siteResponse.site?.url || 'Unknown'
      };
    } catch (error) {
      results.tests.siteAccess = {
        success: false,
        error: error.message
      };
    }
    
    // Test 2: Check Wix Stores
    try {
      const storeResponse = await callWixAPI(siteId, '/stores/v1/products/query', 'POST', {
        query: { paging: { limit: 10, offset: 0 } }
      });
      results.tests.wixStores = {
        success: true,
        productCount: storeResponse.products?.length || 0,
        hasProducts: (storeResponse.products?.length || 0) > 0
      };
    } catch (error) {
      results.tests.wixStores = {
        success: false,
        error: error.message
      };
    }
    
    // Test 3: Check CMS Collections
    try {
      const cmsResponse = await callWixAPI(siteId, '/cms/v1/collections', 'GET');
      results.tests.cmsCollections = {
        success: true,
        collections: cmsResponse.collections?.map(c => ({
          name: c.name,
          id: c.id,
          itemCount: c.itemCount || 0
        })) || []
      };
    } catch (error) {
      results.tests.cmsCollections = {
        success: false,
        error: error.message
      };
    }
    
    // Test 4: Check if there are any products in common collections
    try {
      const commonNames = ['Products', 'products', 'Items', 'items', 'Catalog', 'catalog', 'ETL', 'etl', 'Store', 'store'];
      const collectionTests = {};
      
      for (const collectionName of commonNames) {
        try {
          const collectionResponse = await callWixAPI(siteId, `/cms/v1/collections/${collectionName}/items`, 'GET');
          collectionTests[collectionName] = {
            exists: true,
            itemCount: collectionResponse.items?.length || 0,
            hasItems: (collectionResponse.items?.length || 0) > 0
          };
        } catch (e) {
          collectionTests[collectionName] = {
            exists: false,
            error: e.message
          };
        }
      }
      
      results.tests.collectionTests = collectionTests;
    } catch (error) {
      results.tests.collectionTests = {
        success: false,
        error: error.message
      };
    }
    
    res.json({
      success: true,
      message: 'Diagnostic completed',
      results: results
    });
    
  } catch (error) {
    console.error('Diagnostic error:', error);
    res.status(500).json({
      success: false,
      message: 'Diagnostic failed',
      error: error.message
    });
  }
});

// GET /wix-products/test-token - Test API token and basic connectivity
router.get('/test-token', async (req, res) => {
  try {
    console.log('🔍 Testing Wix API token...');
    
    const siteId = 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4';
    
    // Test basic API connectivity
    const testResponse = await callWixAPI(siteId, '/sites/v2/sites/current', 'GET');
    
    res.json({
      success: true,
      message: 'API token is working',
      siteInfo: testResponse,
      tokenExists: !!process.env.WIX_API_TOKEN,
      tokenLength: process.env.WIX_API_TOKEN?.length || 0
    });
    
  } catch (error) {
    console.error('Token test error:', error);
    res.status(500).json({
      success: false,
      message: 'Token test failed',
      error: error.message,
      tokenExists: !!process.env.WIX_API_TOKEN
    });
  }
});

// GET /wix-products/all - Get all products from Wix sites
router.get('/all', async (req, res) => {
  try {
    console.log('🔄 Fetching Wix store products...');
    
    // Use the correct site ID from your Wix editor URL
    const siteId = 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4'; // Your actual site ID
    
    console.log(`Attempting to fetch from site: ${siteId}`);
    
    const products = await fetchWixStoreProducts(siteId);
    
    console.log(`✅ Found ${products.length} Wix products`);
    
    res.json({
      success: true,
      products: products,
      total: products.length,
      site: siteId,
      message: 'Successfully fetched Wix products'
    });
    
  } catch (error) {
    console.error('Error fetching Wix products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Wix products',
      error: error.message,
      details: error.stack
    });
  }
});

// Helper function to fetch products from a specific Wix site
async function fetchWixStoreProducts(siteId) {
  try {
    console.log(`🔍 Fetching products from site: ${siteId}`);
    
    // Try Wix Stores first
    let storeProducts = [];
    try {
      // Try different Wix API endpoints
      let response;
      
      // First try the stores-reader API
      try {
        response = await callWixAPI(siteId, '/stores-reader/v1/products/query', 'POST', {
          query: { 
            paging: { limit: 100, offset: 0 } 
          },
          includeVariants: true,
          includeHiddenProducts: false,
          includeMerchantSpecificData: true
        });
        console.log('✅ stores-reader API worked');
      } catch (readerError) {
        console.log('❌ stores-reader failed, trying stores API');
        // Fallback to stores API
        response = await callWixAPI(siteId, '/stores/v1/products/query', 'POST', {
          query: { 
            paging: { limit: 100, offset: 0 } 
          },
          includeVariants: true,
          includeHiddenProducts: false,
          includeMerchantSpecificData: true
        });
        console.log('✅ stores API worked');
      }
      
      if (response.products) {
        storeProducts = response.products.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description || '',
          additionalInfo: product.description || '',
          brand: product.brand || 'Unknown',
          sku: product.sku || '',
          price: product.price?.price || 0,
          currency: product.price?.currency || 'EUR',
          images: product.media?.items?.map(item => item.image?.url) || [],
          customFields: product.customFields || [],
          variants: product.variants || [],
          siteId: siteId,
          siteName: siteId === GREENWAYS_BUILDINGS_SITE_ID ? 'Buildings' : 'Market',
          source: 'store',
          // Extract additional information from custom fields
          additionalTechnicalInfo: extractCustomFields(product.customFields),
          // Extract marketing information
          marketingInfo: extractMarketingInfo(product)
        }));
      }
      console.log(`✅ Store products found: ${storeProducts.length}`);
    } catch (storeError) {
      console.log(`❌ Store error: ${storeError.message}`);
    }
    
    // Also try CMS collections
    let cmsProducts = [];
    try {
      console.log(`🔍 Checking CMS collections...`);
      const cmsResponse = await callWixAPI(siteId, '/cms/v1/collections', 'GET');
      console.log(`Available CMS collections:`, cmsResponse.collections?.map(c => c.name) || []);
      
      // Try common collection names
      const commonNames = ['Products', 'products', 'Items', 'items', 'Catalog', 'catalog', 'ETL', 'etl'];
      
      for (const collectionName of commonNames) {
        try {
          const collectionResponse = await callWixAPI(siteId, `/cms/v1/collections/${collectionName}/items`, 'GET');
          if (collectionResponse.items && collectionResponse.items.length > 0) {
            console.log(`✅ Found ${collectionResponse.items.length} items in collection: ${collectionName}`);
            cmsProducts = collectionResponse.items.map(item => ({
              id: item.id,
              name: item.data?.title || item.data?.name || 'Untitled',
              description: item.data?.description || '',
              additionalInfo: item.data?.description || '',
              brand: item.data?.brand || 'Unknown',
              sku: item.data?.sku || '',
              price: item.data?.price || 0,
              currency: 'EUR',
              images: item.data?.image ? [item.data.image] : [],
              customFields: [],
              variants: [],
              siteId: siteId,
              siteName: siteId === GREENWAYS_BUILDINGS_SITE_ID ? 'Buildings' : 'Market',
              source: 'cms',
              additionalTechnicalInfo: {},
              marketingInfo: extractMarketingInfo(item.data)
            }));
            break;
          }
        } catch (e) {
          // Collection doesn't exist, continue
        }
      }
    } catch (cmsError) {
      console.log(`❌ CMS error: ${cmsError.message}`);
    }
    
    // Combine both sources
    const allProducts = [...storeProducts, ...cmsProducts];
    console.log(`📊 Total products found: ${allProducts.length} (Store: ${storeProducts.length}, CMS: ${cmsProducts.length})`);
    
    return allProducts;
  } catch (error) {
    console.error(`❌ Error fetching products from site ${siteId}:`, error);
    return [];
  }
}

// Extract custom fields for technical information
function extractCustomFields(customFields) {
  if (!customFields || !Array.isArray(customFields)) return {};
  
  const techInfo = {};
  
  customFields.forEach(field => {
    if (field.name && field.value) {
      // Map common field names to technical info
      const fieldName = field.name.toLowerCase();
      if (fieldName.includes('power') || fieldName.includes('wattage')) {
        techInfo['Power Rating'] = field.value;
      } else if (fieldName.includes('efficiency') || fieldName.includes('rating')) {
        techInfo['Energy Rating'] = field.value;
      } else if (fieldName.includes('warranty')) {
        techInfo['Warranty Period'] = field.value;
      } else if (fieldName.includes('dimension') || fieldName.includes('size')) {
        techInfo['Dimensions'] = field.value;
      } else if (fieldName.includes('weight')) {
        techInfo['Weight'] = field.value;
      } else if (fieldName.includes('certification') || fieldName.includes('cert')) {
        techInfo['Certification'] = field.value;
      } else if (fieldName.includes('installation')) {
        techInfo['Installation Type'] = field.value;
      } else if (fieldName.includes('maintenance')) {
        techInfo['Maintenance'] = field.value;
      } else {
        // Generic technical field
        techInfo[field.name] = field.value;
      }
    }
  });
  
  return techInfo;
}

// Extract marketing information
function extractMarketingInfo(product) {
  const marketingInfo = {};
  
  // Add description as marketing info
  if (product.description) {
    marketingInfo['Product Description'] = product.description;
  }
  
  // Add any custom fields that seem like marketing content
  if (product.customFields && Array.isArray(product.customFields)) {
    product.customFields.forEach(field => {
      if (field.name && field.value) {
        const fieldName = field.name.toLowerCase();
        if (fieldName.includes('benefit') || fieldName.includes('feature') || 
            fieldName.includes('advantage') || fieldName.includes('customer') ||
            fieldName.includes('usage') || fieldName.includes('tip')) {
          marketingInfo[field.name] = field.value;
        }
      }
    });
  }
  
  return marketingInfo;
}

// GET /wix-products/:productId - Get specific product from Wix
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Try both sites
    const [buildingsProduct, marketProduct] = await Promise.all([
      fetchWixProductById(GREENWAYS_BUILDINGS_SITE_ID, productId),
      fetchWixProductById(GREENWAYS_MARKET_SITE_ID, productId)
    ]);
    
    const product = buildingsProduct || marketProduct;
    
    if (product) {
      res.json({
        success: true,
        product: product
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Product not found in Wix stores'
      });
    }
    
  } catch (error) {
    console.error('Error fetching Wix product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Wix product',
      error: error.message
    });
  }
});

// Helper function to fetch a specific product by ID
async function fetchWixProductById(siteId, productId) {
  try {
    const response = await callWixAPI(siteId, `/stores-reader/v1/products/${productId}`);
    
    if (response.product) {
      const product = response.product;
      return {
        id: product.id,
        name: product.name,
        description: product.description || '',
        additionalInfo: product.description || '',
        brand: product.brand || 'Unknown',
        sku: product.sku || '',
        price: product.price?.price || 0,
        currency: product.price?.currency || 'EUR',
        images: product.media?.items?.map(item => item.image?.url) || [],
        customFields: product.customFields || [],
        variants: product.variants || [],
        siteId: siteId,
        siteName: siteId === GREENWAYS_BUILDINGS_SITE_ID ? 'Buildings' : 'Market',
        additionalTechnicalInfo: extractCustomFields(product.customFields),
        marketingInfo: extractMarketingInfo(product)
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching product ${productId} from site ${siteId}:`, error);
    return null;
  }
}

module.exports = router;
