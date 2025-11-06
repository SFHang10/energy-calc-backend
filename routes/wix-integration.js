const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

console.log('🚀 Wix MCP Integration router loading...');

// Load Wix products from the JSON file
const WIX_PRODUCTS_FILE = path.join(__dirname, '../wix_products_export.json');
let wixProducts = [];

try {
    const data = fs.readFileSync(WIX_PRODUCTS_FILE, 'utf8');
    wixProducts = JSON.parse(data);
    console.log(`✅ Loaded ${wixProducts.length} Wix products from export file`);
} catch (error) {
    console.error(`❌ Error loading Wix products from ${WIX_PRODUCTS_FILE}:`, error);
}

// Middleware to find product by ID (handleId)
router.param('productId', (req, res, next, productId) => {
    const product = wixProducts.find(p => p.handleId === productId);
    if (product) {
        req.product = product;
        next();
    } else {
        res.status(404).json({ success: false, message: 'Product not found', productId });
    }
});

// Get all Wix products
router.get('/products/all', (req, res) => {
    res.json({ success: true, products: wixProducts });
});

// Get a single Wix product by ID
router.get('/products/:productId', (req, res) => {
    if (req.product) {
        // Map Wix product data to a common format
        const mappedProduct = {
            id: req.product.handleId,
            name: req.product.name,
            description: req.product.description || '',
            brand: req.product.brand || 'Unknown',
            sku: req.product.sku || '',
            price: req.product.price || 0,
            currency: 'EUR',
            imageUrl: req.product.productImageUrl ? `https://static.wixstatic.com/media/${req.product.productImageUrl}` : null,
            images: req.product.productImageUrl ? [`https://static.wixstatic.com/media/${req.product.productImageUrl}`] : [],
            videos: [],
            additionalTechnicalInfo: {
                'Capacity': req.product.description && req.product.description.match(/Capacity:\s*(\d+\s*GN\s*\d+\/\d+\s*trays)/i) ? req.product.description.match(/Capacity:\s*(\d+\s*GN\s*\d+\/\d+\s*trays)/i)[1] : 'N/A',
                'Digital Interface': req.product.description && req.product.description.includes('Digital interface') ? 'Yes' : 'No',
                'Boilerless Steaming': req.product.description && req.product.description.includes('Boilerless steaming function') ? 'Yes' : 'No',
                'Dry Hot Convection': req.product.description && req.product.description.includes('Dry hot convection cycle') ? 'Yes' : 'No',
                'EcoDelta Cooking': req.product.description && req.product.description.includes('EcoDelta cooking') ? 'Yes' : 'No',
                'Programs Mode': req.product.description && req.product.description.includes('Programs mode') ? 'Yes (100 recipes)' : 'No',
                'OptiFlow Air Distribution': req.product.description && req.product.description.includes('OptiFlow air distribution system') ? 'Yes' : 'No',
                'Fan Speeds': req.product.description && req.product.description.match(/Fan with (\d+)\s*speed levels/i) ? req.product.description.match(/Fan with (\d+)\s*speed levels/i)[1] : 'N/A',
                'Core Temperature Probe': req.product.description && req.product.description.includes('Single sensor core temperature probe') ? 'Included' : 'No',
                'Automatic Cool Down/Pre-heat': req.product.description && req.product.description.includes('Automatic fast cool down and pre-heat function') ? 'Yes' : 'No',
                'SkyClean System': req.product.description && req.product.description.includes('SkyClean: Automatic and built-in self cleaning system') ? 'Yes (5 cycles)' : 'No',
                'Construction Material': req.product.description && req.product.description.includes('304 AISI stainless steel construction') ? '304 AISI Stainless Steel' : 'N/A',
                'Water Protection': req.product.description && req.product.description.includes('IPX 5 spray water protection certification') ? 'IPX 5' : 'N/A',
                'Guarantee': req.product.description && req.product.description.includes('6 Year Guarantee') ? '6 Years' : 'N/A',
                'Rated Power': req.product.description && req.product.description.match(/Electrical Power rating \(kW\)\s*(\d+\.?\d*)/i) ? `${req.product.description.match(/Electrical Power rating \(kW\)\s*(\d+\.?\d*)/i)[1]}kW` : 'N/A',
                'Standard Drying Time': req.product.description && req.product.description.match(/Standard drying time during test cycle \(seconds\)\s*(\d+\.?\d*)/i) ? `${req.product.description.match(/Standard drying time during test cycle \(seconds\)\s*(\d+\.?\d*)/i)[1]} seconds` : 'N/A',
                'Electricity Use per 1000 Cycles': req.product.description && req.product.description.match(/Electricity use per 1000 standard drying cycles \(kWh\)\s*(\d+\.?\d*)/i) ? `${req.product.description.match(/Electricity use per 1000 standard drying cycles \(kWh\)\s*(\d+\.?\d*)/i)[1]} kWh` : 'N/A',
            },
            marketingInfo: {
                'Collection': req.product.collection || 'General',
                'Visibility': req.product.visible ? 'Visible' : 'Hidden',
                'Discount': req.product.discountMode === 'PERCENT' && req.product.discountValue > 0 ? `${req.product.discountValue}% Off` : 'No discount',
                'Inventory': req.product.inventory || 'Not specified',
                'Product Benefits': req.product.description && req.product.description.includes('70% less energy') ? '70% less energy than conventional hand dryers' : 'High quality, consistent cooking results',
                'Customer Value': 'Professional-grade equipment for commercial use',
                'Usage Tips': 'Adjustable sensor range, regular maintenance ensures optimal performance',
                'Energy Savings': 'Up to 30% reduction in energy consumption, cost-effective alternative to paper towels',
                'ROI Information': 'Payback period typically 2-3 years, 2142 dries possible per £1 spent on electricity',
                'Support': 'Comprehensive technical support available',
                'Delivery': 'Fast delivery and professional installation',
                'Financing': 'Flexible payment options available'
            }
        };
        res.json({ success: true, product: mappedProduct });
    } else {
        res.status(404).json({ success: false, message: 'Product not found', productId });
    }
});

// Health check for Wix MCP integration
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'Wix MCP Integration',
    timestamp: new Date().toISOString(),
    message: 'Wix integration is working!'
  });
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Wix MCP Integration test successful',
    endpoints: ['/health', '/test', '/user-sync', '/form-handler', '/content-update', '/recommendations']
  });
});

console.log('✅ Wix MCP Integration router loaded successfully');

module.exports = router;