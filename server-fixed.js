require('dotenv').config();
const express = require('express');
const cors = require('cors');

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
  {
    id: '1',
    name: 'Energy Efficient Fridge',
    power: 150,
    category: 'Appliances',
    brand: 'EcoBrand',
    runningCostPerYear: 45.50
  },
  {
    id: '2', 
    name: 'LED TV 55"',
    power: 80,
    category: 'Electronics',
    brand: 'GreenTech',
    runningCostPerYear: 24.30
  },
  {
    id: '3',
    name: 'Solar Panel System',
    power: 0,
    category: 'Renewable',
    brand: 'SunPower',
    runningCostPerYear: -120.00
  },
  {
    id: '4',
    name: 'Smart Thermostat',
    power: 5,
    category: 'Smart Home',
    brand: 'EcoControl',
    runningCostPerYear: 1.50
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
    product.runningCostPerYear <= 50
  );
  res.json(efficientProducts);
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
  console.log(`🚀 Energy Calculator API (FIXED) running on port ${PORT}`);
  console.log(`🔗 Available endpoints:`);
  console.log(`   - GET /health (health check)`);
  console.log(`   - GET /test (test endpoint)`);
  console.log(`   - GET /api/products (all products)`);
  console.log(`   - POST /api/calculate (energy calculations)`);
  console.log(`   - GET /api/etl/products (ETL products)`);
  console.log(`   - GET /api/calculator-wix/products (Wix calculator products)`);
  console.log(`   - GET /api/calculator-wix/categories (Wix calculator categories)`);
  console.log(`   - GET /api/calculator-wix/energy-efficient (Wix calculator energy efficient)`);
  console.log(`   - GET /api/calculator-wix/brands (Wix calculator brands)`);
});