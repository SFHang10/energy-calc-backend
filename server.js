require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (including the widget HTML)
app.use(express.static('.'));

// Import route modules
const productsRouter = require('./routes/products');
const calculateRouter = require('./routes/calculate');
const etlWixRouter = require('./routes/etl-wix');
const calculatorWixRouter = require('./routes/calculator-wix');
const categoriesRouter = require('./routes/categories');
const productWidgetRouter = require('./routes/product-widget');
const wixProductsRouter = require('./routes/wix-products-local');
const wixIntegrationRouter = require('./routes/wix-integration');
const shopProductsRouter = require('./routes/shop-products');
const membersRouter = require('./routes/members');

// Mount routes with proper prefixes
app.use('/api/products', productsRouter);
app.use('/api/calculate', calculateRouter);
app.use('/api/etl', etlWixRouter);
app.use('/api/calculator-wix', calculatorWixRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/product-widget', productWidgetRouter);
app.use('/api/wix-products-local', wixProductsRouter);
app.use('/api/wix', wixIntegrationRouter);
app.use('/api/shop-products', shopProductsRouter);
app.use('/api/members', membersRouter);

// Serve the energy widget HTML file
app.get('/product-energy-widget.html', (req, res) => {
  res.sendFile(__dirname + '/product-energy-widget.html');
});

// Also serve it without the .html extension
app.get('/product-energy-widget', (req, res) => {
  res.sendFile(__dirname + '/product-energy-widget.html');
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
  console.log(` Energy Calculator API running on port ${PORT}`);
  console.log(` Available endpoints:`);
  console.log(`   - GET /health (health check)`);
  console.log(`   - GET /test (test endpoint)`);
  console.log(`   - GET /api/products (all products)`);
  console.log(`   - GET /api/categories (distinct categories)`);
  console.log(`   - GET /api/categories/:category/subcategories (distinct subcategories)`);
  console.log(`   - POST /api/calculate (energy calculations)`);
  console.log(`   - GET /api/etl/products (ETL products)`);
  console.log(`   - GET /api/calculator-wix/products (Wix calculator products)`);
  console.log(`   - GET /api/product-widget/:productId (product widget data)`);
  console.log(`   - GET /api/product-widget/compare/:productId (product comparison)`);
  console.log(`   - POST /api/product-widget/calculate (custom calculation)`);
});
