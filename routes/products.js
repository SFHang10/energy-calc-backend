const express = require('express');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { categorizeProduct } = require('../utils/categorization');
const router = express.Router();

console.log('📦 Products router loading...');

// Connect to the ETL database (same as shop-products)
let db;
try {
    const dbPath = path.join(__dirname, '..', 'database', 'energy_calculator_central.db');
    const dbDir = path.dirname(dbPath);
    
    // Ensure database directory exists
    if (!fs.existsSync(dbDir)) {
        console.log('📁 Creating database directory:', dbDir);
        fs.mkdirSync(dbDir, { recursive: true });
    }
    
    db = new sqlite3.Database(dbPath);
    console.log(`🔗 Connected to ETL database: ${dbPath}`);
} catch (error) {
    console.error('❌ Failed to connect to ETL database:', error);
    db = null;
}

// Cache for products
let productsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to load products from ETL database
async function loadProductsFromETLDatabase() {
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
                console.log(`✅ Loaded ${rows.length} ETL products from database`);
                resolve(rows);
            }
        });
    });
}

// Hybrid approach: Use hardcoded JSON first, ETL API as fallback/update
let hardcodedProducts = [];
let etlProducts = [];
let lastETLUpdate = null;
const ETL_UPDATE_INTERVAL = 30 * 60 * 1000; // 30 minutes

// Load hardcoded products from JSON file (fast, saves API calls)
try {
    const dataPath = path.join(__dirname, '..', 'FULL-DATABASE-5554.json');
    console.log(`📂 Attempting to load JSON from: ${dataPath}`);
    console.log(`📂 Current directory: ${__dirname}`);
    
    // Check if file exists first
    if (!fs.existsSync(dataPath)) {
        console.error(`❌ JSON file not found at: ${dataPath}`);
        hardcodedProducts = [];
    } else {
        console.log(`✅ JSON file found, reading...`);
        const data = fs.readFileSync(dataPath, 'utf8');
        const jsonData = JSON.parse(data);
        hardcodedProducts = jsonData.products || [];
        console.log(`✅ Loaded ${hardcodedProducts.length} hardcoded products from JSON`);
    }
} catch (error) {
    console.error('❌ Error loading hardcoded products:', error.message);
    console.error('❌ Error stack:', error.stack);
    hardcodedProducts = [];
}

// Function to load products from ETL database (up-to-date)
async function loadProductsFromETLDatabase() {
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
                // If database table doesn't exist, reject with specific error that can be handled
                if (err.code === 'SQLITE_ERROR' && err.message.includes('no such table')) {
                    console.log(`ℹ️ Database table not found - using JSON products instead (${hardcodedProducts.length} products)`);
                    reject(new Error('TABLE_NOT_FOUND'));
                } else {
                    console.error('❌ Database error:', err);
                    reject(err);
                }
            } else {
                console.log(`✅ Loaded ${rows.length} ETL products from database`);
                resolve(rows);
            }
        });
    });
}

// Helper function to get products (hybrid approach with enhanced categorization)
async function getProducts(forceETL = false) {
    const now = Date.now();
    
    // Use hardcoded products by default (fast)
    let products = [];
    console.log(`🔍 getProducts called - forceETL: ${forceETL}, hardcodedProducts.length: ${hardcodedProducts.length}`);
    
    if (!forceETL && hardcodedProducts.length > 0) {
        console.log(`✅ Using hardcoded products (${hardcodedProducts.length} products)`);
        products = hardcodedProducts;
    } else {
        console.log(`⚠️ Hardcoded products empty or ETL forced, trying database...`);
        // Use ETL products if hardcoded is empty or forced
        if (db) {
            try {
                console.log(`🔄 Loading from ETL database...`);
                products = await loadProductsFromETLDatabase();
                etlProducts = products;
                lastETLUpdate = now;
                console.log(`✅ Loaded ${products.length} products from ETL database`);
            } catch (error) {
                // If table not found, silently fall back to hardcoded products
                if (error.message === 'TABLE_NOT_FOUND') {
                    products = hardcodedProducts.length > 0 ? hardcodedProducts : [];
                    console.log(`ℹ️ Using hardcoded products (${products.length} products)`);
                } else {
                    console.error('❌ Error loading ETL products:', error);
                    // Fallback to hardcoded if ETL fails
                    products = hardcodedProducts.length > 0 ? hardcodedProducts : [];
                    console.log(`⚠️ Fallback to hardcoded: ${products.length} products`);
                }
            }
        } else {
            console.log(`⚠️ Database not connected, using hardcoded: ${hardcodedProducts.length} products`);
            products = hardcodedProducts;
        }
    }
    
    // Apply unified categorization to all products (matches audit widget)
    const categorizedProducts = products.map(product => {
        // Use unified categorization function that matches audit widget
        const categorization = categorizeProduct(
            product.category || '',
            product.subcategory || '',
            product.name || ''
        );
        
        return {
            ...product,
            // Unified categorization fields (matches audit widget)
            displayCategory: categorization.displayCategory,
            displaySubcategory: categorization.displaySubcategory,
            productType: categorization.productType, // For audit widget compatibility
            // Shop-specific fields (same as displayCategory for marketplace)
            shopCategory: categorization.shopCategory,
            shopSubcategory: categorization.shopSubcategory,
            // Helper flags
            isHVAC: categorization.isHVAC,
            isMotor: categorization.isMotor,
            isHeating: categorization.isHeating
        };
    });
    
    // Debug: Log category distribution
    if (categorizedProducts.length > 0) {
        const categoryCounts = {};
        categorizedProducts.forEach(p => {
            const cat = p.displayCategory || p.shopCategory || p.category || 'Uncategorized';
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
        console.log('📊 Category distribution:', Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([cat, count]) => `${cat}: ${count}`)
            .join(', '));
    }
    
    return categorizedProducts;
}

/**
 * Filter products for marketplace display
 * Excludes comparative products (non-ETL products) that are only for calculator comparisons
 * @param {Array} products - All products
 * @returns {Array} - Only ETL products for marketplace
 */
function filterMarketplaceProducts(products) {
    // Only include products with IDs starting with 'etl_' (ETL products)
    // Exclude comparative products like 'oven_1', 'sample_*', etc.
    return products.filter(product => {
        const productId = product.id || '';
        return productId.startsWith('etl_');
    });
}

// Load ETL products on startup (background update)
// This is optional - if database is empty, it's fine, we use JSON instead
if (db) {
    loadProductsFromETLDatabase()
        .then(products => {
            etlProducts = products;
            lastETLUpdate = Date.now();
            console.log(`🚀 ETL products loaded in background: ${products.length} products`);
        })
        .catch(error => {
            // Database might be empty - that's OK, we use JSON instead
            if ((error.code === 'SQLITE_ERROR' && error.message.includes('no such table')) || 
                error.message === 'TABLE_NOT_FOUND') {
                console.log(`ℹ️ Database table not found - using JSON products instead (${hardcodedProducts.length} products)`);
            } else {
                console.error('❌ Failed to load ETL products:', error.message);
            }
        });
}

// GET /products - Return products with pagination (like test version)
router.get('/', async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;
        const limitNum = parseInt(limit) || 50;
        const offsetNum = parseInt(offset) || 0;
        
        console.log(`🔍 getProducts called - limit: ${limitNum}, offset: ${offsetNum}`);
        
        const allProducts = await getProducts();
        // Filter out comparative products - only show ETL products in marketplace
        const marketplaceProducts = filterMarketplaceProducts(allProducts);
        const totalProducts = marketplaceProducts.length;
        
        // Apply pagination (like test version)
        const paginatedProducts = marketplaceProducts.slice(offsetNum, offsetNum + limitNum);
        
        res.json({
            success: true,
            total_products: totalProducts,
            limit: limitNum,
            offset: offsetNum,
            products: paginatedProducts,
            source: hardcodedProducts.length > 0 ? 'hardcoded_json' : 'etl_database',
            last_updated: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error getting products:', error);
        res.status(500).json({
            error: 'Failed to load products',
            products: []
        });
    }
});

// GET /products/etl - Force ETL database update
router.get('/etl', async (req, res) => {
    try {
        const products = await getProducts(true); // Force ETL
        res.json({
            success: true,
            total_products: products.length,
            products: products,
            source: 'etl_database',
            last_updated: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error getting ETL products:', error);
        res.status(500).json({
            error: 'Failed to load ETL products',
            products: []
        });
    }
});

// GET /products/all - Return ALL products including comparative products (for calculator use)
router.get('/all', async (req, res) => {
    try {
        const { limit = 10000, offset = 0 } = req.query;
        const limitNum = parseInt(limit) || 10000;
        const offsetNum = parseInt(offset) || 0;
        
        console.log(`🔍 getProducts/all called - limit: ${limitNum}, offset: ${offsetNum}`);
        
        const allProducts = await getProducts();
        // DO NOT filter - return ALL products including comparative ones for calculator
        const totalProducts = allProducts.length;
        
        // Apply pagination
        const paginatedProducts = allProducts.slice(offsetNum, offsetNum + limitNum);
        
        res.json({
            success: true,
            total_products: totalProducts,
            limit: limitNum,
            offset: offsetNum,
            products: paginatedProducts,
            source: hardcodedProducts.length > 0 ? 'hardcoded_json' : 'etl_database',
            last_updated: new Date().toISOString(),
            note: 'This endpoint returns ALL products including comparative products for calculator use'
        });
    } catch (error) {
        console.error('❌ Error getting all products:', error);
        res.status(500).json({
            error: 'Failed to load products',
            products: []
        });
    }
});

// GET /products/count - Return product count (marketplace only - ETL products)
router.get('/count', async (req, res) => {
    try {
        const products = await getProducts();
        const marketplaceProducts = filterMarketplaceProducts(products);
        res.json({ count: marketplaceProducts.length });
    } catch (error) {
        res.status(500).json({ count: 0 });
    }
});

// GET /products/categories - Return all categories (enhanced - marketplace only)
router.get('/categories', async (req, res) => {
    try {
        const products = await getProducts();
        const marketplaceProducts = filterMarketplaceProducts(products);
        const categories = [...new Set(marketplaceProducts.map(p => p.shopCategory || p.displayCategory || p.category).filter(Boolean))];
        res.json(categories.sort());
    } catch (error) {
        res.status(500).json([]);
    }
});

// GET /products/category/:category - Return products by category
router.get('/category/:category', async (req, res) => {
    try {
        const category = decodeURIComponent(req.params.category);
        console.log(`🔍 Filtering products for category: "${category}"`);
        
        const products = await getProducts();
        console.log(`📦 Total products loaded: ${products.length}`);
        
        // Filter out comparative products - only show ETL products in marketplace
        const marketplaceProducts = filterMarketplaceProducts(products);
        console.log(`🛒 Marketplace products (ETL only): ${marketplaceProducts.length}`);
        
        // Filter products - check multiple category fields and normalize comparison
        const filteredProducts = marketplaceProducts.filter(p => {
            const shopCat = (p.shopCategory || '').trim();
            const displayCat = (p.displayCategory || '').trim();
            const origCat = (p.category || '').trim();
            const searchCat = category.trim();
            
            // Case-insensitive comparison
            return shopCat.toLowerCase() === searchCat.toLowerCase() ||
                   displayCat.toLowerCase() === searchCat.toLowerCase() ||
                   origCat.toLowerCase() === searchCat.toLowerCase();
        });
        
        console.log(`✅ Found ${filteredProducts.length} products for category "${category}"`);
        
        // Log sample categories for debugging
        if (filteredProducts.length === 0 && products.length > 0) {
            const sampleCategories = [...new Set(products.slice(0, 50).map(p => 
                p.shopCategory || p.displayCategory || p.category
            ).filter(Boolean))];
            console.log(`⚠️ No products found for "${category}". Sample categories in database:`, sampleCategories);
            
            // Also check for products that might match but with different casing/spacing
            const potentialMatches = products.filter(p => {
                const shopCat = (p.shopCategory || '').toLowerCase();
                const displayCat = (p.displayCategory || '').toLowerCase();
                const origCat = (p.category || '').toLowerCase();
                const searchLower = category.toLowerCase();
                
                return shopCat.includes(searchLower) || 
                       displayCat.includes(searchLower) || 
                       origCat.includes(searchLower) ||
                       searchLower.includes(shopCat) ||
                       searchLower.includes(displayCat) ||
                       searchLower.includes(origCat);
            });
            
            if (potentialMatches.length > 0) {
                console.log(`💡 Found ${potentialMatches.length} potential matches with similar category names:`);
                potentialMatches.slice(0, 5).forEach(p => {
                    console.log(`   - "${p.name}": shopCategory="${p.shopCategory}", displayCategory="${p.displayCategory}", category="${p.category}"`);
                });
            }
        }
        
        res.json({
            success: true,
            category: category,
            total_products: filteredProducts.length,
            products: filteredProducts,
            source: hardcodedProducts.length > 0 ? 'hardcoded_json' : 'etl_database'
        });
    } catch (error) {
        console.error('❌ Error filtering products by category:', error);
        res.status(500).json({
            success: false,
            category: req.params.category,
            total_products: 0,
            products: [],
            error: error.message
        });
    }
});

console.log('✅ Products router loaded successfully (Hybrid: JSON + ETL)');

module.exports = router;
