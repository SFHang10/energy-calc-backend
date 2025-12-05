const express = require('express');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

console.log('🛒 Shop Products router loading...');

// Connect to the central database (ETL products + manual products, no comparative data)
let db;
try {
    const dbPath = path.join(__dirname, '..', 'database', 'energy_calculator_central.db');
    db = new sqlite3.Database(dbPath);
    console.log(`🔗 Connected to shop database: ${dbPath}`);
} catch (error) {
    console.error('❌ Failed to connect to shop database:', error);
    // Create a dummy database connection to prevent crashes
    db = null;
}

// Cache for products to reduce database calls
let productsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to load products from database
async function loadProductsFromDatabase() {
    return new Promise((resolve, reject) => {
        if (!db) {
            console.error('❌ Database not connected');
            reject(new Error('Database not connected'));
            return;
        }
        
        const query = `
            SELECT 
                id,
                name,
                brand as manufacturer,
                category,
                subcategory,
                power as power_consumption,
                energyRating as energy_efficiency_rating,
                price,
                imageUrl as image_url,
                modelNumber as description,
                sku,
                efficiency,
                runningCostPerYear,
                descriptionShort,
                descriptionFull,
                specifications,
                marketingInfo,
                productPageUrl,
                affiliateInfo
            FROM products 
            WHERE category != 'Comparison Data'
            AND category IS NOT NULL
            ORDER BY category, name
        `;
        
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('❌ Database error:', err);
                reject(err);
            } else {
                // Enhance products with better categorization
                const enhancedRows = rows.map(product => {
                    // Create better category mapping for shop display
                    let displayCategory = product.category;
                    let displaySubcategory = product.subcategory;
                    
                    // Enhanced categorization for ETL Technology products
                    if (product.category === 'ETL Technology') {
                        const subcategory = product.subcategory || '';
                        
                        // Heat Pumps and Heating Equipment
                        if (subcategory.includes('Baxi Heating-Commercial') || 
                            subcategory.includes('Heat Pump') || 
                            subcategory.includes('heat pump') ||
                            product.name.toLowerCase().includes('heat pump')) {
                            displayCategory = 'Heat Pumps';
                            displaySubcategory = 'Air to Water Heat Pumps';
                        }
                        // HVAC Equipment
                        else if (subcategory.includes('HVAC') || 
                                 subcategory.includes('Reznor') ||
                                 subcategory.includes('Air Conditioning')) {
                            displayCategory = 'HVAC Equipment';
                            displaySubcategory = subcategory.includes('HVAC') ? 'HVAC Drives' : 'Heating Systems';
                        }
                        // Motor Drives and Controls
                        else if (subcategory.includes('Motor') || 
                                 subcategory.includes('Drive') ||
                                 subcategory.includes('Inverter') ||
                                 subcategory.includes('Control')) {
                            displayCategory = 'Motor Drives';
                            displaySubcategory = 'Variable Speed Drives';
                        }
                        // Heating Equipment
                        else if (subcategory.includes('HEATING') || 
                                 subcategory.includes('Heating') ||
                                 subcategory.includes('Boiler') ||
                                 subcategory.includes('Water Heater')) {
                            displayCategory = 'Heating Equipment';
                            displaySubcategory = subcategory;
                        }
                        // Lighting
                        else if (subcategory.includes('Lighting') || 
                                 subcategory.includes('LED') ||
                                 subcategory.includes('Lamp')) {
                            displayCategory = 'Lighting';
                            displaySubcategory = subcategory;
                        }
                        // Keep as ETL Technology for other products
                        else {
                            displayCategory = 'ETL Technology';
                            displaySubcategory = subcategory;
                        }
                    }
                    // Keep other categories as is
                    else {
                        displayCategory = product.category;
                        displaySubcategory = product.subcategory;
                    }
                    
                    return {
                        ...product,
                        displayCategory,
                        displaySubcategory,
                        // Add shop-specific fields
                        shopCategory: displayCategory,
                        shopSubcategory: displaySubcategory,
                        isHVAC: displayCategory === 'HVAC Equipment' || displayCategory === 'Heat Pumps',
                        isMotor: displayCategory === 'Motor Drives',
                        isHeating: displayCategory === 'Heat Pumps' || displayCategory === 'Heating Equipment'
                    };
                });
                
                console.log(`✅ Loaded ${enhancedRows.length} ETL products from database`);
                console.log(`🌡️ HVAC products: ${enhancedRows.filter(p => p.isHVAC).length}`);
                console.log(`⚙️ Motor products: ${enhancedRows.filter(p => p.isMotor).length}`);
                console.log(`🔥 Heat Pumps: ${enhancedRows.filter(p => p.shopCategory === 'Heat Pumps').length}`);
                console.log(`🏠 Heating Equipment: ${enhancedRows.filter(p => p.shopCategory === 'Heating Equipment').length}`);
                console.log(`💡 Lighting: ${enhancedRows.filter(p => p.shopCategory === 'Lighting').length}`);
                resolve(enhancedRows);
            }
        });
    });
}

// Load products on startup
if (db) {
    loadProductsFromDatabase()
        .then(products => {
            productsCache = products;
            cacheTimestamp = Date.now();
            console.log(`🚀 Shop initialized with ${products.length} ETL products`);
        })
        .catch(error => {
            console.error('❌ Failed to load products:', error);
            productsCache = [];
        });
} else {
    console.error('❌ Cannot load products - database not connected');
    productsCache = [];
}

// Helper function to get products (with cache)
async function getProducts() {
    const now = Date.now();
    
    // Check if cache is valid
    if (productsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
        return productsCache;
    }
    
    // Reload from database
    try {
        const products = await loadProductsFromDatabase();
        productsCache = products;
        cacheTimestamp = now;
        return products;
    } catch (error) {
        console.error('❌ Error reloading products:', error);
        return productsCache || [];
    }
}

// GET /shop-products - Get all products for the shop
router.get('/', async (req, res) => {
    try {
        const products = await getProducts();
        res.json({
            success: true,
            total_products: products.length,
            products: products,
            source: 'etl_database',
            last_updated: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error getting products:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load products',
            products: []
        });
    }
});

// GET /shop-products/count - Get product count
router.get('/count', async (req, res) => {
    try {
        const products = await getProducts();
        res.json({ count: products.length });
    } catch (error) {
        res.status(500).json({ count: 0 });
    }
});

// GET /shop-products/categories - Get all categories
router.get('/categories', async (req, res) => {
    try {
        const products = await getProducts();
        const categories = [...new Set(products.map(p => p.shopCategory || p.displayCategory || p.category).filter(Boolean))];
        res.json(categories.sort());
    } catch (error) {
        res.status(500).json([]);
    }
});

// GET /shop-products/category/:category - Get products by category
router.get('/category/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const products = await getProducts();
        const filteredProducts = products.filter(p => p.category === category);
        
        res.json({
            success: true,
            category: category,
            total_products: filteredProducts.length,
            products: filteredProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            category: req.params.category,
            total_products: 0,
            products: []
        });
    }
});

// GET /shop-products/search - Search products
router.get('/search', async (req, res) => {
    try {
        const searchTerm = req.query.q || '';
        const category = req.query.category || '';
        const products = await getProducts();
        
        let filteredProducts = products;
        
        if (searchTerm) {
            filteredProducts = filteredProducts.filter(p => 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (p.manufacturer && p.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        
        if (category) {
            filteredProducts = filteredProducts.filter(p => p.category === category);
        }
        
        res.json({
            success: true,
            search_term: searchTerm,
            category: category,
            total_products: filteredProducts.length,
            products: filteredProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            search_term: req.query.q || '',
            category: req.query.category || '',
            total_products: 0,
            products: []
        });
    }
});

console.log('✅ Shop Products router loaded successfully');

module.exports = router;
