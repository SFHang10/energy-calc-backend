require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Energy ticker cache + demo data
const ENERGY_TICKER_CACHE_MS = Number(process.env.ENERGY_TICKER_CACHE_MS || 30 * 60 * 1000);
let energyTickerCache = { timestamp: 0, data: null };

const demoEnergyTickerData = {
  allEnergy: [
    { code: 'FR', name: 'France', priceEurMwh: 101.31, changePct: -2.5 },
    { code: 'ES', name: 'Spain', priceEurMwh: 101.54, changePct: -2.2 },
    { code: 'PT', name: 'Portugal', priceEurMwh: 101.54, changePct: -2.1 },
    { code: 'DE', name: 'Germany', priceEurMwh: 156.17, changePct: 1.2 },
    { code: 'NL', name: 'Netherlands', priceEurMwh: 122.76, changePct: -1.2 },
    { code: 'IT', name: 'Italy', priceEurMwh: 142.24, changePct: -0.3 },
    { code: 'PL', name: 'Poland', priceEurMwh: 141.00, changePct: 0.0 },
    { code: 'SE1', name: 'Sweden SE1', priceEurMwh: 160.50, changePct: 2.3 },
    { code: 'DK1', name: 'Denmark West', priceEurMwh: 163.26, changePct: 1.6 },
    { code: 'NO1', name: 'Norway SE1', priceEurMwh: 138.26, changePct: 0.3 }
  ],
  renewableShare: [
    { code: 'FR', name: 'France', sharePct: 52.4, changePct: 0.8 },
    { code: 'ES', name: 'Spain', sharePct: 61.1, changePct: 1.2 },
    { code: 'PT', name: 'Portugal', sharePct: 67.3, changePct: 0.5 },
    { code: 'DE', name: 'Germany', sharePct: 58.4, changePct: -1.2 },
    { code: 'NL', name: 'Netherlands', sharePct: 39.8, changePct: -0.4 },
    { code: 'IT', name: 'Italy', sharePct: 45.2, changePct: 0.1 },
    { code: 'PL', name: 'Poland', sharePct: 27.6, changePct: 0.2 },
    { code: 'SE1', name: 'Sweden SE1', sharePct: 74.9, changePct: 0.6 },
    { code: 'DK1', name: 'Denmark West', sharePct: 69.8, changePct: 0.4 },
    { code: 'NO1', name: 'Norway SE1', sharePct: 96.2, changePct: 0.1 }
  ]
};

async function getFetch() {
  if (typeof fetch !== 'undefined') {
    return fetch;
  }
  try {
    const nodeFetch = await import('node-fetch');
    return nodeFetch.default;
  } catch (error) {
    return null;
  }
}

function resolveExternalUrl(urlTemplate, apiKey) {
  if (!urlTemplate) return null;
  if (apiKey) {
    return urlTemplate.replace('{API_KEY}', apiKey);
  }
  return urlTemplate;
}

async function fetchJsonFromUrl(url) {
  if (!url) return null;
  const fetchFn = await getFetch();
  if (!fetchFn) return null;

  const response = await fetchFn(url);
  if (!response.ok) return null;

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

// Explicitly serve product-categories.html BEFORE any static middleware
app.get('/product-categories.html', (req, res) => {
  console.log('📂 Route handler called for product-categories.html');
  console.log('📂 __dirname:', __dirname);
  const filePath = path.join(__dirname, 'product-categories.html');
  console.log('📂 File path:', filePath);
  const fs = require('fs');
  if (fs.existsSync(filePath)) {
    console.log('✅ File exists, sending file');
    res.sendFile('product-categories.html', { root: __dirname });
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

// Live Music Finder — explicit routes (Wix embed + folder path with spaces)
const LIVE_MUSIC_GWB_DIR = path.join(__dirname, 'HTMLS GWM GWB');
const LIVE_MUSIC_FILES = [
  'live-music-hub-render.html',
  'live-music-hub.html',
  'live-music-finder.html',
  'live-events-ticker.html',
  'live-events-updates.html'
];
const LIVE_MUSIC_DATA = [
  ['live-events-feed.json', path.join(__dirname, 'data', 'live-events-feed.json')],
  ['music-venues.json', path.join(__dirname, 'data', 'music-venues.json')],
  ['europe.geojson', path.join(__dirname, 'data', 'europe.geojson')]
];

function sendLiveMusicHtml(res, filename) {
  const fsSync = require('fs');
  const filePath = path.join(LIVE_MUSIC_GWB_DIR, filename);
  if (!fsSync.existsSync(filePath)) {
    return res.status(404).json({
      error: 'File not found',
      message: `${filename} not found on server`,
      path: filePath
    });
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.sendFile(filename, { root: LIVE_MUSIC_GWB_DIR });
}

LIVE_MUSIC_FILES.forEach((filename) => {
  const webPath = `/HTMLS GWM GWB/${filename}`;
  app.get(webPath, (req, res) => sendLiveMusicHtml(res, filename));
});

// Short URL for Wix HTML embed (no spaces) — same Render Version page
app.get('/live-music/render', (req, res) => sendLiveMusicHtml(res, 'live-music-hub-render.html'));
app.get('/live-music/hub', (req, res) => sendLiveMusicHtml(res, 'live-music-hub.html'));
app.get('/live-music/map', (req, res) => {
  const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  return res.redirect(302, `/HTMLS%20GWM%20GWB/live-music-finder.html${qs}`);
});

LIVE_MUSIC_DATA.forEach(([name, filePath]) => {
  app.get(`/data/${name}`, (req, res) => {
    const fsSync = require('fs');
    if (!fsSync.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found', message: name });
    }
    if (name.endsWith('.geojson')) {
      res.type('application/geo+json');
    } else {
      res.type('json');
    }
    return res.sendFile(path.basename(filePath), { root: path.dirname(filePath) });
  });
});

// Explicitly serve product-page-v2.html BEFORE any static middleware
// Match both with and without query parameters
app.get('/product-page-v2.html', (req, res, next) => {
  console.log('📂 Route handler hit for product-page-v2.html');
  console.log('📂 Request URL:', req.url);
  console.log('📂 Original URL:', req.originalUrl);
  console.log('📂 Query params:', req.query);
  
  const filePath = path.join(__dirname, 'product-page-v2.html');
  const fs = require('fs');
  console.log('📂 Looking for file at:', filePath);
  console.log('📂 __dirname is:', __dirname);
  
  if (fs.existsSync(filePath)) {
    console.log('✅ File exists, sending...');
    // Use sendFile with root option for better path resolution
    res.sendFile('product-page-v2.html', { root: __dirname });
  } else {
    console.log('❌ File does not exist at:', filePath);
    res.status(404).json({
      error: 'File not found',
      message: 'product-page-v2.html not found in deployment',
      path: filePath,
      dirname: __dirname
    });
  }
});

// Serve static files from root directory (for HTML files, images, etc.)
// BUT skip product-page-v2.html and product-categories.html since we have explicit routes for them
app.use(express.static('.', {
  index: false,
  setHeaders: (res, filePath) => {
    // Skip product-page-v2.html and product-categories.html - let explicit routes handle them
    if (filePath.includes('product-page-v2.html') || filePath.includes('product-categories.html')) {
      return; // Don't serve via static middleware
    }
    if (filePath.endsWith('.html') || filePath.endsWith('.htm')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
  }
}));

// Specifically serve product-placement folder with proper headers
app.use('/product-placement', express.static(path.join(__dirname, 'product-placement'), {
    setHeaders: (res, filePath) => {
        // Set cache headers for images (1 year)
        if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || 
            filePath.endsWith('.png') || filePath.endsWith('.webp') || 
            filePath.endsWith('.avif') || filePath.endsWith('.gif')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        }
        // Set CORS headers (though same origin, good practice)
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
}));

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

// Members + companies routers resolved after MongoDB ping (see bootstrapStorageRouters)
const { bootstrapStorageRouters } = require('./database/bootstrap-storage');
let membersRouter;
let companiesRouter;
let storageBootstrap = null;

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

console.log('Loading dashboard live router...');
let dashboardLiveRouter;
try {
  dashboardLiveRouter = require('./routes/dashboard-live');
  console.log('Dashboard live router loaded successfully');
} catch (error) {
  console.error('❌ Failed to load dashboard live router:', error.message);
  dashboardLiveRouter = null;
}

console.log('Loading assistant router...');
let assistantRouter;
try {
  assistantRouter = require('./routes/assistant');
  console.log('Assistant router loaded successfully');
} catch (error) {
  console.error('❌ Failed to load assistant router:', error.message);
  assistantRouter = null;
}

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

console.log('Loading schemes router...');
let schemesRouter;
try {
  schemesRouter = require('./routes/schemes');
  console.log('Schemes router loaded successfully');
} catch (error) {
  console.error('❌ Failed to load schemes router:', error.message);
  console.error('Error details:', error);
  schemesRouter = null;
}

console.log('Loading equipment intelligence router...');
let equipmentIntelligenceRouter;
try {
  equipmentIntelligenceRouter = require('./routes/equipment-intelligence');
  console.log('Equipment intelligence router loaded successfully');
} catch (error) {
  console.error('❌ Failed to load equipment intelligence router:', error.message);
  console.error('Error details:', error);
  equipmentIntelligenceRouter = null;
}

console.log('Loading live music routers...');
let musicVenuesRouter;
let musicGuideRouter;
let musicVenueInquiriesRouter;
try {
  musicVenuesRouter = require('./routes/music-venues');
  musicGuideRouter = require('./routes/music-guide');
  musicVenueInquiriesRouter = require('./routes/music-venue-inquiries');
  console.log('Live music routers loaded successfully');
} catch (error) {
  console.error('❌ Failed to load live music routers:', error.message);
  musicVenuesRouter = null;
  musicGuideRouter = null;
  musicVenueInquiriesRouter = null;
}

function mountApiRoutes() {
  console.log('Mounting routes...');
  app.use('/api/products', productsRouter);
  console.log('✅ /api/products route mounted');
  app.use('/api/calculate', calculateRouter);
  console.log('✅ /api/calculate route mounted');
  app.use('/api/etl', etlWixRouter);
  console.log('✅ /api/etl route mounted');
  app.use('/api/members', membersRouter);
  console.log(`✅ /api/members route mounted (${storageBootstrap?.membersBackend || 'unknown'})`);
  app.use('/api/subscriptions', subscriptionsRouter);
  console.log('✅ /api/subscriptions route mounted');

  if (wixPricingPlansRouter) {
    app.use('/api/wix-pricing-plans', wixPricingPlansRouter);
    console.log('✅ /api/wix-pricing-plans route mounted');
  } else {
    console.log('⚠️ Wix pricing plans routes not mounted due to loading error');
  }

  app.use('/api/product-widget', productWidgetRouter);
  if (dashboardLiveRouter) {
    app.use('/api/dashboard', dashboardLiveRouter);
    console.log('✅ /api/dashboard route mounted');
  } else {
    console.log('⚠️ Dashboard live routes not mounted due to loading error');
  }
  if (assistantRouter) {
    app.use('/api/assistant', assistantRouter);
    console.log('✅ /api/assistant route mounted');
  }
  app.use('/api/companies', companiesRouter);
  console.log(`✅ /api/companies route mounted (${storageBootstrap?.companiesBackend || 'unknown'})`);
  console.log('✅ /api/product-widget route mounted');
  try {
    app.use('/api/company-updates', require('./routes/company-updates'));
    console.log('✅ /api/company-updates route mounted');
  } catch (error) {
    console.log('⚠️ Company-updates routes not mounted:', error.message);
  }

  if (wixIntegrationRouter) {
    app.use('/api/wix', wixIntegrationRouter);
    console.log('✅ Wix integration routes mounted successfully');
  } else {
    console.log('⚠️ Wix integration routes not mounted due to loading error');
  }

  if (schemesRouter) {
    app.use('/api/schemes', schemesRouter);
    console.log('✅ /api/schemes route mounted (Mongo when connected, else schemes.json fallback in router)');
  } else {
    console.log('⚠️ Schemes routes not mounted due to loading error');
  }

  if (equipmentIntelligenceRouter) {
    app.use('/api/equipment-intelligence', equipmentIntelligenceRouter);
    console.log('✅ /api/equipment-intelligence route mounted');
  } else {
    console.log('⚠️ Equipment intelligence routes not mounted due to loading error');
  }

  if (musicVenuesRouter) {
    app.use('/api/music-venues', musicVenuesRouter);
    console.log('✅ /api/music-venues route mounted');
  }
  if (musicGuideRouter) {
    app.use('/api/music-guide', musicGuideRouter);
    console.log('✅ /api/music-guide route mounted');
  }
  if (musicVenueInquiriesRouter) {
    app.use('/api/music-venue-inquiries', musicVenueInquiriesRouter);
    console.log('✅ /api/music-venue-inquiries route mounted');
  }

  console.log('All routes mounted successfully');
}

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
    message: 'Energy Calculator API is running',
    storage: storageBootstrap
      ? {
          wantMongo: storageBootstrap.wantMongo,
          mongoConnected: storageBootstrap.mongoConnected,
          members: storageBootstrap.membersBackend,
          companies: storageBootstrap.companiesBackend
        }
      : { note: 'Storage bootstrap in progress' }
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

// Energy ticker endpoint (supports external source URL or demo data)
app.get('/api/energy-ticker', async (req, res) => {
  try {
    const now = Date.now();
    if (energyTickerCache.data && (now - energyTickerCache.timestamp) < ENERGY_TICKER_CACHE_MS) {
      return res.json(energyTickerCache.data);
    }

    const sourceUrl = process.env.ENERGY_TICKER_URL;
    const entsoeApiKey = process.env.ENTSOE_API_KEY;
    const entsoePriceUrl = resolveExternalUrl(process.env.ENTSOE_PRICE_URL, entsoeApiKey);
    const entsoeRenewableUrl = resolveExternalUrl(process.env.ENTSOE_RENEWABLE_URL, entsoeApiKey);
    let payload = null;
    let isLive = false;

    if (entsoePriceUrl || entsoeRenewableUrl) {
      const [priceData, renewableData] = await Promise.all([
        fetchJsonFromUrl(entsoePriceUrl),
        fetchJsonFromUrl(entsoeRenewableUrl)
      ]);

      const allEnergy = priceData?.allEnergy || priceData;
      const renewableShare = renewableData?.renewableShare || renewableData;

      if (Array.isArray(allEnergy) && Array.isArray(renewableShare)) {
        payload = {
          updatedAt: new Date().toISOString(),
          isLive: true,
          source: 'ENTSO-E',
          allEnergy,
          renewableShare
        };
        isLive = true;
      }
    } else if (sourceUrl) {
      const externalData = await fetchJsonFromUrl(sourceUrl);
      if (externalData && externalData.allEnergy && externalData.renewableShare) {
        payload = {
          updatedAt: externalData.updatedAt || new Date().toISOString(),
          isLive: true,
          source: sourceUrl,
          allEnergy: externalData.allEnergy,
          renewableShare: externalData.renewableShare
        };
        isLive = true;
      }
    }

    if (!payload) {
      payload = {
        updatedAt: new Date().toISOString(),
        isLive: isLive,
        source: sourceUrl || entsoePriceUrl || entsoeRenewableUrl || 'demo',
        allEnergy: demoEnergyTickerData.allEnergy,
        renewableShare: demoEnergyTickerData.renewableShare
      };
    }

    energyTickerCache = { timestamp: now, data: payload };
    res.json(payload);
  } catch (error) {
    console.error('❌ Energy ticker endpoint error:', error.message);
    res.status(500).json({ error: 'Failed to load energy ticker data' });
  }
});

// Route handler moved to top (before static middleware) - see line ~11

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

// Serve schemes admin dashboard
app.get('/schemes-admin.html', (req, res) => {
  console.log('📂 Serving schemes-admin.html');
  const filePath = __dirname + '/schemes-admin.html';
  const fs = require('fs');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      error: 'File not found',
      message: 'schemes-admin.html not found in deployment'
    });
  }
});

// Serve EU energy schemes portal
app.get('/eu-energy-schemes.html', (req, res) => {
  console.log('📂 Serving eu-energy-schemes.html');
  const filePath = __dirname + '/eu-energy-schemes.html';
  const fs = require('fs');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      error: 'File not found',
      message: 'eu-energy-schemes.html not found in deployment'
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

const PORT = process.env.PORT || 4000;

function registerErrorHandlers() {
  app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong on the server'
    });
  });

  app.use('*', (req, res) => {
    res.status(404).json({
      error: 'Route not found',
      message: `The route ${req.originalUrl} does not exist`
    });
  });
}

async function startServer() {
  try {
    storageBootstrap = await bootstrapStorageRouters();
    membersRouter = storageBootstrap.membersRouter;
    companiesRouter = storageBootstrap.companiesRouter;
    mountApiRoutes();
    registerErrorHandlers();
  } catch (error) {
    console.error('❌ Storage bootstrap failed:', error.message);
    console.log('⚠️ Emergency fallback: SQLite members + JSON companies');
    storageBootstrap = {
      wantMongo: wantsMongoFromEnv(),
      mongoConnected: false,
      membersBackend: 'sqlite-emergency',
      companiesBackend: 'json-emergency'
    };
    membersRouter = require('./routes/members');
    companiesRouter = require('./routes/companies');
    mountApiRoutes();
    registerErrorHandlers();
  }

  app.listen(PORT, () => {
  console.log(`🚀 Energy Calculator API (NEW) running on port ${PORT}`);
  if (storageBootstrap) {
    const mode = storageBootstrap.mongoConnected
      ? 'MongoDB (production path)'
      : storageBootstrap.wantMongo
        ? 'SQLite/JSON fallback (MongoDB configured but not connected)'
        : 'SQLite/JSON (local default)';
    console.log(`📦 Active storage: ${mode}`);
    console.log(`   Members → ${storageBootstrap.membersBackend} · Companies → ${storageBootstrap.companiesBackend}`);
  }
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
  console.log(`   - GET /api/dashboard/live (dashboard smart meter feed contract)`);
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
}

function wantsMongoFromEnv() {
  return process.env.USE_MONGODB === 'true' && Boolean(process.env.MONGODB_URI);
}

startServer().catch((error) => {
  console.error('❌ Server failed to start:', error);
  process.exit(1);
});