const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Load Wix products from JSON file
let wixProducts = [];
try {
  const wixData = fs.readFileSync(path.join(__dirname, '..', 'wix_products_export.json'), 'utf8');
  wixProducts = JSON.parse(wixData);
  console.log(`✅ Loaded ${wixProducts.length} Wix products from export file`);
} catch (error) {
  console.error('❌ Error loading Wix products:', error.message);
}

// Helper function to extract additional technical info from description
function extractTechnicalInfo(description) {
  const techInfo = {};
  
  if (description) {
    // Extract energy rating
    const energyMatch = description.match(/Energy Rating:\s*(\d+)/i);
    if (energyMatch) {
      techInfo['Energy Rating'] = energyMatch[1];
    }
    
    // Extract efficiency percentage
    const efficiencyMatch = description.match(/(\d+)%\s*energy recovery efficiency/i);
    if (efficiencyMatch) {
      techInfo['Energy Recovery Efficiency'] = efficiencyMatch[1] + '%';
    }
    
    // Extract manufacturer
    const manufacturerMatch = description.match(/([A-Za-z\s]+)\s*Europe\s*N\.V\./i);
    if (manufacturerMatch) {
      techInfo['Manufacturer'] = manufacturerMatch[1].trim();
    }
    
    // Extract ETL certification
    if (description.includes('ETL Certified')) {
      techInfo['ETL Certification'] = 'Yes';
    }
    
    // Extract application type
    if (description.includes('commercial and residential')) {
      techInfo['Application'] = 'Commercial & Residential';
    } else if (description.includes('commercial')) {
      techInfo['Application'] = 'Commercial';
    } else if (description.includes('residential')) {
      techInfo['Application'] = 'Residential';
    }
  }
  
  return techInfo;
}

// Helper function to extract marketing info
function extractMarketingInfo(product) {
  return {
    'Collection': product.collection || 'General',
    'SKU': product.sku || 'N/A',
    'Price': `€${product.price || 0}`,
    'Availability': product.inventory === 'InStock' ? 'In Stock' : 'Out of Stock',
    'Visibility': product.visible ? 'Visible' : 'Hidden',
    'Discount': product.discountValue > 0 ? `${product.discountValue}% off` : 'No discount'
  };
}

// GET /api/wix-products/all - Get all Wix products
router.get('/all', (req, res) => {
  try {
    const products = wixProducts.map(product => ({
      id: product.handleId,
      name: product.name,
      description: product.description,
      additionalInfo: product.description,
      brand: 'Daikin', // Most products seem to be Daikin
      sku: product.sku,
      price: product.price,
      currency: 'EUR',
      images: product.productImageUrl ? [`https://static.wixstatic.com/media/${product.productImageUrl}`] : [],
      videos: [], // Add video support when available
      customFields: [],
      variants: [],
      siteId: 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4',
      siteName: 'Wix Store',
      source: 'wix_export',
      additionalTechnicalInfo: extractTechnicalInfo(product.description),
      marketingInfo: extractMarketingInfo(product)
    }));
    
    res.json({
      success: true,
      products: products,
      total: products.length
    });
  } catch (error) {
    console.error('Error fetching Wix products:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/wix-products/:productId - Get specific Wix product
router.get('/:productId', (req, res) => {
  try {
    const productId = req.params.productId;
    const product = wixProducts.find(p => p.handleId === productId || p.sku === productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    const formattedProduct = {
      id: product.handleId,
      name: product.name,
      description: product.description,
      additionalInfo: product.description,
      brand: 'Daikin',
      sku: product.sku,
      price: product.price,
      currency: 'EUR',
      images: product.productImageUrl ? [`https://static.wixstatic.com/media/${product.productImageUrl}`] : [],
      videos: [], // Add video support when available
      customFields: [],
      variants: [],
      siteId: 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4',
      siteName: 'Wix Store',
      source: 'wix_export',
      additionalTechnicalInfo: extractTechnicalInfo(product.description),
      marketingInfo: extractMarketingInfo(product)
    };
    
    res.json({
      success: true,
      product: formattedProduct
    });
  } catch (error) {
    console.error('Error fetching Wix product:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

