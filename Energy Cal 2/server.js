require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Add fetch for Node.js (if using Node < 18)
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

const app = express();
app.use(cors());
app.use(express.json());

// Import route modules
const productsRouter = require('./routes/products');
const calculateRouter = require('./routes/calculate');
const etlWixRouter = require('./routes/etl-wix');

// Mount routes with proper prefixes
app.use('/api/products', productsRouter);
app.use('/api/calculate', calculateRouter);
app.use('/api/etl', etlWixRouter);

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

// GET /api/calculator-wix/products - Get all products from ETL API
app.get('/api/calculator-wix/products', async (req, res) => {
  try {
    // First try to get products from ETL API
    const response = await fetch(`${process.env.ETL_BASE_URL}/api/v1/products`, {
      headers: {
        'x-api-key': process.env.ETL_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      // Transform ETL products to match our calculator format
      const products = data.products.map(product => ({
        id: product.id.toString(),
        name: product.name,
        power: extractPowerFromFeatures(product.features) || 0,
        category: getTechnologyName(product.technologyId, data.technologies) || 'Unknown',
        brand: product.manufacturer ? product.manufacturer.name : 'Unknown',
        runningCostPerYear: calculateRunningCost(extractPowerFromFeatures(product.features) || 0),
        energyRating: extractEnergyRatingFromFeatures(product.features) || 'Unknown',
        efficiency: determineEfficiency(extractPowerFromFeatures(product.features) || 0, extractEnergyRatingFromFeatures(product.features))
      }));
      res.json(products);
    } else {
      // Fallback to sample products if ETL API fails
      console.log('ETL API failed, using sample products');
      res.json(sampleProducts);
    }
  } catch (error) {
    console.log('ETL API error, using sample products:', error.message);
    // Fallback to sample products
    res.json(sampleProducts);
  }
});

// Helper function to calculate running cost
function calculateRunningCost(powerUsage) {
  const averageHoursPerDay = 8;
  const electricityRate = 0.15; // $0.15 per kWh
  const daysPerYear = 365;
  return (powerUsage / 1000) * averageHoursPerDay * electricityRate * daysPerYear;
}

// Helper function to extract power from product features
function extractPowerFromFeatures(features) {
  if (!features || !Array.isArray(features)) return 0;
  
  // Look for power-related features
  const powerFeature = features.find(f => 
    f.name && (
      f.name.toLowerCase().includes('power') ||
      f.name.toLowerCase().includes('consumption') ||
      f.name.toLowerCase().includes('watt') ||
      f.name.toLowerCase().includes('kw')
    )
  );
  
  if (powerFeature && powerFeature.numericValue) {
    return powerFeature.numericValue;
  }
  
  if (powerFeature && powerFeature.value) {
    const numValue = parseFloat(powerFeature.value);
    return isNaN(numValue) ? 0 : numValue;
  }
  
  return 0;
}

// Helper function to extract energy rating from features
function extractEnergyRatingFromFeatures(features) {
  if (!features || !Array.isArray(features)) return 'Unknown';
  
  const ratingFeature = features.find(f => 
    f.name && (
      f.name.toLowerCase().includes('rating') ||
      f.name.toLowerCase().includes('efficiency') ||
      f.name.toLowerCase().includes('energy')
    )
  );
  
  return ratingFeature ? ratingFeature.value : 'Unknown';
}

// Helper function to determine efficiency level
function determineEfficiency(power, rating) {
  if (rating && (rating.includes('A+++') || rating.includes('A++'))) return 'high';
  if (power < 100) return 'high';
  if (power < 300) return 'medium';
  return 'low';
}

// Helper function to get technology name (placeholder - you may need to implement this)
function getTechnologyName(technologyId, technologies) {
  // This is a placeholder - you may need to implement proper technology lookup
  return 'Technology ' + technologyId;
}

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
  console.log(`🚀 Energy Calculator API running on port ${PORT}`);
  console.log(`🔗 Available endpoints:`);
  console.log(`   - GET /health (health check)`);
  console.log(`   - GET /test (test endpoint)`);
  console.log(`   - GET /api/products (all products)`);
  console.log(`   - POST /api/calculate (energy calculations)`);
  console.log(`   - GET /api/etl/products (ETL products)`);
  console.log(`   - GET /api/calculator-wix/products (Wix calculator products)`);
  console.log(`   - GET /api/calculator-wix/categories (Wix calculator categories)`);
  console.log(`   - GET /api/calculator-wix/energy-efficient (Wix calculator energy efficient)`);
  console.log(`   - GET /api/calculator-wix/standard-products (Wix calculator standard products)`);
  console.log(`   - GET /api/calculator-wix/compare-efficiency (Compare efficient vs standard)`);
  console.log(`   - GET /api/calculator-wix/brands (Wix calculator brands)`);
}); 