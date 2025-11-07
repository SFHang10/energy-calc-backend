const express = require('express');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
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
                console.error('❌ Database error:', err);
                reject(err);
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
                console.error('❌ Error loading ETL products:', error);
                // Fallback to hardcoded if ETL fails
                products = hardcodedProducts.length > 0 ? hardcodedProducts : [];
                console.log(`⚠️ Fallback to hardcoded: ${products.length} products`);
            }
        } else {
            console.log(`⚠️ Database not connected, using hardcoded: ${hardcodedProducts.length} products`);
            products = hardcodedProducts;
        }
    }
    
    // Apply enhanced categorization to all products
    return products.map(product => {
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
}

// Load ETL products on startup (background update)
if (db) {
    loadProductsFromETLDatabase()
        .then(products => {
            etlProducts = products;
            lastETLUpdate = Date.now();
            console.log(`🚀 ETL products loaded in background: ${products.length} products`);
        })
        .catch(error => {
            console.error('❌ Failed to load ETL products:', error);
        });
}

// GET /products - Return all products (hybrid: hardcoded first, ETL fallback)
router.get('/', async (req, res) => {
    try {
        const products = await getProducts();
        res.json({
            success: true,
            total_products: products.length,
            products: products,
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

// GET /products/count - Return product count
router.get('/count', async (req, res) => {
    try {
        const products = await getProducts();
        res.json({ count: products.length });
    } catch (error) {
        res.status(500).json({ count: 0 });
    }
});

// GET /products/categories - Return all categories (enhanced)
router.get('/categories', async (req, res) => {
    try {
        const products = await getProducts();
        const categories = [...new Set(products.map(p => p.shopCategory || p.displayCategory || p.category).filter(Boolean))];
        res.json(categories.sort());
    } catch (error) {
        res.status(500).json([]);
    }
});

// GET /products/category/:category - Return products by category
router.get('/category/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const products = await getProducts();
        const filteredProducts = products.filter(p => 
            (p.shopCategory || p.displayCategory || p.category) === category
        );
        
        res.json({
            success: true,
            category: category,
            total_products: filteredProducts.length,
            products: filteredProducts,
            source: hardcodedProducts.length > 0 ? 'hardcoded_json' : 'etl_database'
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

console.log('✅ Products router loaded successfully (Hybrid: JSON + ETL)');

module.exports = router;
