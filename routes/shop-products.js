const express = require('express');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { categorizeProduct } = require('../utils/categorization');
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
                const enhancedRows = rows.map((product) => {
                    const categorization = categorizeProduct(
                        product.category || '',
                        product.subcategory || '',
                        product.name || '',
                        { id: product.id, source: 'ETL' }
                    );
                    return {
                        ...product,
                        displayCategory: categorization.displayCategory,
                        displaySubcategory: categorization.displaySubcategory,
                        shopCategory: categorization.shopCategory,
                        shopSubcategory: categorization.shopSubcategory,
                        isHVAC: categorization.isHVAC,
                        isMotor: categorization.isMotor,
                        isHeating: categorization.isHeating,
                    };
                });
                
                console.log(`✅ Loaded ${enhancedRows.length} ETL products from database`);
                console.log(`🌡️ HVAC products: ${enhancedRows.filter(p => p.isHVAC).length}`);
                console.log(`⚙️ Motor products: ${enhancedRows.filter(p => p.isMotor).length}`);
                console.log(`🔥 Heat Pumps: ${enhancedRows.filter(p => p.shopCategory === 'Heat Pumps').length}`);
                console.log(`🏠 Boiler Equipment: ${enhancedRows.filter(p => p.shopCategory === 'Boiler Equipment').length}`);
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
