require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Import route modules
console.log('Loading products router...');
const productsRouter = require('./routes/products');
console.log('Products router loaded successfully');

console.log('Loading calculate router...');
const calculateRouter = require('./routes/calculate');
console.log('Calculate router loaded successfully');

console.log('Loading ETL router...');
const etlWixRouter = require('./routes/etl-wix');
console.log('ETL router loaded successfully');

console.log('Loading members router...');
const membersRouter = require('./routes/members');
console.log('Members router loaded successfully');

console.log('Loading subscriptions router...');
const subscriptionsRouter = require('./routes/subscriptions-simple');
console.log('Subscriptions router loaded successfully');

console.log('Loading Wix pricing plans router...');
let wixPricingPlansRouter;
try {
  wixPricingPlansRouter = require('./routes/wix-pricing-plans');
  console.log('Wix pricing plans router loaded successfully');
} catch (error) {
  console.error('❌ Failed to load Wix pricing plans router:', error.message);
  console.error('Error details:', error);
  // Don't exit, just continue without Wix pricing plans router
  wixPricingPlansRouter = null;
}

console.log('Loading product widget router...');
const productWidgetRouter = require('./routes/product-widget');
console.log('Product widget router loaded successfully');

console.log('Loading Wix MCP integration router...');
let wixIntegrationRouter;
try {
  wixIntegrationRouter = require('./routes/wix-integration');
  console.log('Wix MCP integration router loaded successfully');
} catch (error) {
  console.error('❌ Failed to load Wix integration router:', error.message);
  console.error('Error details:', error);
  // Don't exit, just continue without Wix integration
  wixIntegrationRouter = null;
}

// Mount routes with proper prefixes
console.log('Mounting routes...');
app.use('/api/products', productsRouter);
console.log('✅ /api/products route mounted');
app.use('/api/calculate', calculateRouter);
console.log('✅ /api/calculate route mounted');
app.use('/api/etl', etlWixRouter);
console.log('✅ /api/etl route mounted');
app.use('/api/members', membersRouter);
console.log('✅ /api/members route mounted');
app.use('/api/subscriptions', subscriptionsRouter);
console.log('✅ /api/subscriptions route mounted');

// Mount Wix pricing plans router only if it loaded successfully
if (wixPricingPlansRouter) {
  app.use('/api/wix-pricing-plans', wixPricingPlansRouter);
  console.log('✅ /api/wix-pricing-plans route mounted');
} else {
  console.log('⚠️ Wix pricing plans routes not mounted due to loading error');
}

app.use('/api/product-widget', productWidgetRouter);
console.log('✅ /api/product-widget route mounted');

// Mount Wix integration router only if it loaded successfully
if (wixIntegrationRouter) {
  app.use('/api/wix', wixIntegrationRouter);
  console.log('✅ Wix integration routes mounted successfully');
} else {
  console.log('⚠️ Wix integration routes not mounted due to loading error');
}

console.log('All routes mounted successfully');

// Direct implementation of calculator-wix routes to avoid module loading issues
const sampleProducts = [
  // Energy Efficient Products
  {
    id: '1',
    name: 'Energy Efficient Fridge',
    power: 150,
    category: 'Appliances',
    brand: 'EcoBrand',
    runningCostPerYear: 45.50,
    energyRating: 'A+++',
    efficiency: 'high'
  },
  {
    id: '2', 
    name: 'LED TV 55"',
    power: 80,
    category: 'Electronics',
    brand: 'GreenTech',
    runningCostPerYear: 24.30,
    energyRating: 'A',
    efficiency: 'high'
  },
  {
    id: '3',
    name: 'Solar Panel System',
    power: 0,
    category: 'Renewable',
    brand: 'SunPower',
    runningCostPerYear: -120.00,
    energyRating: 'A+++',
    efficiency: 'renewable'
  },
  {
    id: '4',
    name: 'Smart Thermostat',
    power: 5,
    category: 'Smart Home',
    brand: 'EcoControl',
    runningCostPerYear: 1.50,
    energyRating: 'A+',
    efficiency: 'high'
  },
  // Regular/Standard Products for Comparison
  {
    id: '5',
    name: 'Standard Fridge',
    power: 300,
    category: 'Appliances',
    brand: 'StandardBrand',
    runningCostPerYear: 91.00,
    energyRating: 'C',
    efficiency: 'low'
  },
  {
    id: '6',
    name: 'Traditional TV 55"',
    power: 150,
    category: 'Electronics',
    brand: 'StandardTech',
    runningCostPerYear: 45.60,
    energyRating: 'D',
    efficiency: 'low'
  },
  {
    id: '7',
    name: 'Old Washing Machine',
    power: 500,
    category: 'Appliances',
    brand: 'OldBrand',
    runningCostPerYear: 151.67,
    energyRating: 'E',
    efficiency: 'low'
  },
  {
    id: '8',
    name: 'Energy Efficient Washing Machine',
    power: 200,
    category: 'Appliances',
    brand: 'EcoWash',
    runningCostPerYear: 60.67,
    energyRating: 'A++',
    efficiency: 'high'
  },
  {
    id: '9',
    name: 'Desktop Computer',
    power: 250,
    category: 'Electronics',
    brand: 'TechCorp',
    runningCostPerYear: 75.83,
    energyRating: 'C',
    efficiency: 'medium'
  },
  {
    id: '10',
    name: 'Laptop Computer',
    power: 45,
    category: 'Electronics',
    brand: 'PortableTech',
    runningCostPerYear: 13.65,
    energyRating: 'A',
    efficiency: 'high'
  }
];

// GET /api/calculator-wix/products - Get all products
app.get('/api/calculator-wix/products', (req, res) => {
  res.json(sampleProducts);
});

// GET /api/calculator-wix/products/:category - Get products by category
app.get('/api/calculator-wix/products/:category', (req, res) => {
  const category = req.params.category;
  const filteredProducts = sampleProducts.filter(product => 
    product.category.toLowerCase() === category.toLowerCase()
  );
  
  if (filteredProducts.length === 0) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  res.json(filteredProducts);
});

// GET /api/calculator-wix/categories - Get all categories
app.get('/api/calculator-wix/categories', (req, res) => {
  const categories = [...new Set(sampleProducts.map(product => product.category))];
  res.json(categories);
});

// GET /api/calculator-wix/energy-efficient - Get energy efficient products
app.get('/api/calculator-wix/energy-efficient', (req, res) => {
  const efficientProducts = sampleProducts.filter(product => 
    product.efficiency === 'high' || product.efficiency === 'renewable'
  );
  res.json(efficientProducts);
});

// GET /api/calculator-wix/standard-products - Get standard/regular products
app.get('/api/calculator-wix/standard-products', (req, res) => {
  const standardProducts = sampleProducts.filter(product => 
    product.efficiency === 'low' || product.efficiency === 'medium'
  );
  res.json(standardProducts);
});

// GET /api/calculator-wix/compare-efficiency - Compare efficient vs standard products
app.get('/api/calculator-wix/compare-efficiency', (req, res) => {
  const efficient = sampleProducts.filter(product => 
    product.efficiency === 'high' || product.efficiency === 'renewable'
  );
  const standard = sampleProducts.filter(product => 
    product.efficiency === 'low' || product.efficiency === 'medium'
  );
  
  res.json({
    efficient: efficient,
    standard: standard,
    summary: {
      efficientCount: efficient.length,
      standardCount: standard.length,
      averageEfficientCost: efficient.reduce((sum, p) => sum + p.runningCostPerYear, 0) / efficient.length,
      averageStandardCost: standard.reduce((sum, p) => sum + p.runningCostPerYear, 0) / standard.length
    }
  });
});

// GET /api/calculator-wix/brands - Get all brands
app.get('/api/calculator-wix/brands', (req, res) => {
  const brands = [...new Set(sampleProducts.map(product => product.brand))];
  res.json(brands);
});

// POST /api/calculator-wix/calculate-single
app.post('/api/calculator-wix/calculate-single', (req, res) => {
  const { productId, hoursPerDay, electricityRate } = req.body;
  
  const product = sampleProducts.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  const daily = (product.power / 1000) * hoursPerDay * electricityRate;
  const monthly = daily * 30;
  const yearly = daily * 365;
  
  res.json({
    productId,
    product: product.name,
    daily,
    monthly,
    yearly,
    hoursPerDay,
    electricityRate
  });
});

// POST /api/calculator-wix/calculate-multiple
app.post('/api/calculator-wix/calculate-multiple', (req, res) => {
  const { products, hoursPerDay, electricityRate } = req.body;
  
  const results = products.map(item => {
    const product = sampleProducts.find(p => p.id === item.productId);
    if (!product) {
      return { error: 'Product not found', productId: item.productId };
    }
    
    const daily = (product.power / 1000) * hoursPerDay * electricityRate;
    const monthly = daily * 30;
    const yearly = daily * 365;
    
    return {
      productId: product.id,
      product: product.name,
      daily,
      monthly,
      yearly,
      hoursPerDay,
      electricityRate
    };
  });
  
  res.json(results);
});

// POST /api/calculator-wix/compare
app.post('/api/calculator-wix/compare', (req, res) => {
  const { productIds, hoursPerDay, electricityRate } = req.body;
  
  const comparison = productIds.map(productId => {
    const product = sampleProducts.find(p => p.id === productId);
    if (!product) {
      return { error: 'Product not found', productId };
    }
    
    const daily = (product.power / 1000) * hoursPerDay * electricityRate;
    const monthly = daily * 30;
    const yearly = daily * 365;
    
    return {
      productId: product.id,
      product: product.name,
      power: product.power,
      category: product.category,
      brand: product.brand,
      daily,
      monthly,
      yearly,
      hoursPerDay,
      electricityRate
    };
  });
  
  res.json(comparison);
});

// Root route handler
app.get('/', (req, res) => {
  res.json({
    status: 'API is running',
    message: 'Energy Calculator API',
    endpoints: {
      health: '/health',
      products: '/api/products',
      calculate: '/api/calculate',
      members: '/api/members'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Energy Calculator API is running'
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Test member routes are working
app.get('/test-members', (req, res) => {
  res.json({ 
    message: 'Testing member routes',
    membersRoute: typeof membersRouter,
    subscriptionsRoute: typeof subscriptionsRouter
  });
});

// Explicitly serve product-categories.html BEFORE static middleware
app.get('/product-categories.html', (req, res) => {
  console.log('📂 Route handler called for product-categories.html');
  console.log('📂 __dirname:', __dirname);
  const filePath = require('path').join(__dirname, 'product-categories.html');
  console.log('📂 File path:', filePath);
  const fs = require('fs');
  if (fs.existsSync(filePath)) {
    console.log('✅ File exists, sending file');
    res.sendFile(filePath);
  } else {
    console.log('❌ File does not exist at:', filePath);
    res.status(404).json({
      error: 'File not found',
      message: 'product-categories.html not found in deployment',
      path: filePath,
      dirname: __dirname
    });
  }
});

// Explicitly serve category-product-page.html BEFORE static middleware
app.get('/category-product-page.html', (req, res) => {
  console.log('📂 Serving category-product-page.html');
  const filePath = __dirname + '/category-product-page.html';
  const fs = require('fs');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      error: 'File not found',
      message: 'category-product-page.html not found in deployment'
    });
  }
});

// Serve static files (including the widget HTML) - BUT NOT THE WIDGET FILES
app.use(express.static('.', {
  index: false,
  setHeaders: (res, path) => {
    // Don't serve widget files as static files
    if (path.includes('product-energy-widget')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Explicitly serve product-placement images to ensure they're accessible
app.use('/product-placement', express.static(path.join(__dirname, 'product-placement'), {
  setHeaders: (res, filePath) => {
    // Set appropriate cache headers for images
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
  }
}));

// Serve the robust image energy widget HTML file - FORCE UPDATE WITH CACHE BUSTING
app.get('/product-energy-widget.html', (req, res) => {
  console.log('🎨 Serving GLASSMORPHISM version of widget');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(__dirname + '/product-energy-widget-glassmorphism.html');
});

// Also serve it without the .html extension
app.get('/product-energy-widget', (req, res) => {
  console.log('🎨 Serving GLASSMORPHISM version of widget (no extension)');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(__dirname + '/product-energy-widget-glassmorphism.html');
});

// Routes moved above static middleware to ensure they're checked first

// Explicitly serve product-page-v2-marketplace-v2-enhanced.html
app.get('/product-page-v2-marketplace-v2-enhanced.html', (req, res) => {
  console.log('📂 Serving product-page-v2-marketplace-v2-enhanced.html');
  const filePath = __dirname + '/product-page-v2-marketplace-v2-enhanced.html';
  const fs = require('fs');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      error: 'File not found',
      message: 'product-page-v2-marketplace-v2-enhanced.html not found in deployment'
    });
  }
});

// Explicitly serve product-page-v2-marketplace-test.html (test version with image fixes)
app.get('/product-page-v2-marketplace-test.html', (req, res) => {
  console.log('📂 Serving product-page-v2-marketplace-test.html');
  const filePath = __dirname + '/product-page-v2-marketplace-test.html';
  const fs = require('fs');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      error: 'File not found',
      message: 'product-page-v2-marketplace-test.html not found in deployment'
    });
  }
});

// Serve energy calculator
app.get('/Energy Cal 2/energy-calculator-enhanced.html', (req, res) => {
  const fs = require('fs');
  const filePath = __dirname + '/Energy Cal 2/energy-calculator-enhanced.html';
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      error: 'File not found',
      message: 'Energy calculator file not found'
    });
  }
});

// Serve member content pages
app.get('/member-content/:page', (req, res) => {
  const fs = require('fs');
  const page = req.params.page;
  const filePath = __dirname + '/wix-integration/member-content/' + page;
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      error: 'File not found',
      message: `Member content page ${page} not found`
    });
  }
});

// Test widget endpoint
app.get('/test-widget', (req, res) => {
  res.json({
    message: 'Widget route is working!',
    widgetFile: __dirname + '/product-energy-widget.html',
    fileExists: require('fs').existsSync(__dirname + '/product-energy-widget.html')
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong on the server'
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist`
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Energy Calculator API (NEW) running on port ${PORT}`);
  console.log(`🔗 Available endpoints:`);
  console.log(`   - GET /health (health check)`);
  console.log(`   - GET /test (test endpoint)`);
  console.log(`   - GET /test-members (test member routes)`);
  console.log(`   - GET /api/products (all products)`);
  console.log(`   - POST /api/calculate (energy calculations)`);
  console.log(`   - GET /api/etl/products (ETL products)`);
  console.log(`   - GET /api/calculator-wix/products (Wix calculator products)`);
  console.log(`   - GET /api/calculator-wix/categories (Wix calculator categories)`);
  console.log(`   - GET /api/calculator-wix/energy-efficient (Wix calculator energy efficient)`);
  console.log(`   - GET /api/calculator-wix/standard-products (Wix calculator standard products)`);
  console.log(`   - GET /api/calculator-wix/compare-efficiency (Compare efficient vs standard)`);
  console.log(`   - GET /api/calculator-wix/brands (Wix calculator brands)`);
  console.log(`   - POST /api/members/register (Member registration)`);
  console.log(`   - GET /api/members/login (Member login)`);
  console.log(`   - GET /api/members/profile (Member profile)`);
  console.log(`   - GET /api/members/content (Member content)`);
  console.log(`   - GET /api/members/subscription-tiers (Subscription tiers)`);
  console.log(`   - POST /api/subscriptions/create-checkout-session (Create payment session)`);
  console.log(`   - GET /api/subscriptions/current (Current subscription)`);
  console.log(`   - GET /api/subscriptions/payment-history (Payment history)`);
  console.log(`   - POST /api/subscriptions/cancel (Cancel subscription)`);
  console.log(`   - GET /api/product-widget/:productId (product widget data)`);
  console.log(`   - GET /api/product-widget/compare/:productId (product comparison)`);
  console.log(`   - POST /api/product-widget/calculate (custom calculation)`);
  console.log(`   - GET /product-energy-widget.html (widget HTML)`);
  console.log(`   - GET /product-energy-widget (widget HTML without .html)`);
  console.log(`   - GET /test-widget (widget test endpoint)`);
  
  // Add Wix integration endpoints if router loaded successfully
  if (wixIntegrationRouter) {
    console.log(`   - GET /api/wix/health (Wix integration health check)`);
    console.log(`   - GET /api/wix/test (Wix integration test)`);
    console.log(`   - POST /api/wix/user-sync (Sync Wix users)`);
    console.log(`   - POST /api/wix/form-handler (Handle Wix forms)`);
    console.log(`   - POST /api/wix/content-update (Update Wix content)`);
    console.log(`   - GET /api/wix/recommendations/:wixUserId (Get recommendations)`);
  }
});