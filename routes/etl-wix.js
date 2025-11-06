const express = require('express');
const router = express.Router();
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database Configuration
const DATABASE_PATH = path.join(__dirname, '..', 'database', 'energy_calculator_with_collection.db');

// ETL API Configuration (Fallback)
const ETL_API_KEY = process.env.ETL_API_KEY || 'de6a4b7c-771e-4f22-9721-11f39763d794';
const ETL_BASE_URL = 'https://api.etl.energysecurity.gov.uk/api/v1';

// Helper function to calculate running cost
function calculateRunningCost(powerUsage) {
    const averageHoursPerDay = 8;
    const electricityRate = 0.15; // €0.15 per kWh
    const daysPerYear = 365;
    
    return (powerUsage / 1000) * averageHoursPerDay * electricityRate * daysPerYear;
}

// Helper function to get products from embedded database
function getProductsFromDatabase(limit = 50, offset = 0) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DATABASE_PATH, (err) => {
            if (err) {
                console.error('Database connection error:', err);
                reject(err);
                return;
            }
        });

        const query = `
            SELECT 
                id, name, brand, category, subcategory, sku, modelNumber, price, power, 
                powerDisplay, energyRating, efficiency, runningCostPerYear, imageUrl, 
                images, videos, descriptionShort, descriptionFull, additionalInfo, 
                specifications, marketingInfo, calculatorData, productPageUrl, 
                affiliateInfo, createdAt, updatedAt, extractedFrom, extractionDate,
                grants_count, grants_currency, grants_total, grants, grants_region,
                collection_agencies, collection_region, collection_incentive_total, 
                collection_currency, collection_agencies_count
            FROM products 
            ORDER BY name 
            LIMIT ? OFFSET ?
        `;

        db.all(query, [limit, offset], (err, rows) => {
            if (err) {
                console.error('Database query error:', err);
                reject(err);
            } else {
                // Transform database rows to API format
                const products = rows.map(row => ({
                    id: row.id,
                    name: row.name || 'Unknown Product',
                    category: row.category || 'Unknown',
                    subcategory: row.subcategory || '',
                    brand: row.brand || 'Unknown',
                    power: row.power || 0,
                    energyRating: row.energyRating || 'Unknown',
                    efficiency: row.efficiency || 'Unknown',
                    runningCostPerYear: row.runningCostPerYear || 0,
                    description: row.descriptionFull || row.descriptionShort || '',
                    manufacturer: row.brand || 'Unknown',
                    model: row.modelNumber || row.id,
                    sku: row.sku || row.id,
                    imageUrl: row.imageUrl || '',
                    price: row.price || 0,
                    // Government schemes
                    grants: row.grants ? JSON.parse(row.grants) : [],
                    grantsTotal: row.grants_total || 0,
                    grantsCurrency: row.grants_currency || 'EUR',
                    grantsCount: row.grants_count || 0,
                    // Collection agencies
                    collectionAgencies: row.collection_agencies ? JSON.parse(row.collection_agencies) : [],
                    collectionIncentiveTotal: row.collection_incentive_total || 0,
                    collectionCurrency: row.collection_currency || 'EUR',
                    collectionAgenciesCount: row.collection_agencies_count || 0,
                    // Additional data
                    specifications: row.specifications || '',
                    marketingInfo: row.marketingInfo || '',
                    additionalInfo: row.additionalInfo || '',
                    inShop: true,
                    source: 'embedded_database'
                }));
                resolve(products);
            }
        });

        db.close();
    });
}

// Helper function to get total count from database
function getTotalCountFromDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DATABASE_PATH, (err) => {
            if (err) {
                console.error('Database connection error:', err);
                reject(err);
                return;
            }
        });

        db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
            if (err) {
                console.error('Database count error:', err);
                reject(err);
            } else {
                resolve(row.count);
            }
        });

        db.close();
    });
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

// Get all products - PRIMARY: Embedded Database, FALLBACK: ETL API
router.get('/products', async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        console.log('🔄 ETL Router: Attempting to load products from embedded database...');

        // PRIMARY: Try embedded database first
        try {
            const products = await getProductsFromDatabase(parseInt(limit), parseInt(offset));
            const total = await getTotalCountFromDatabase();

            console.log(`✅ ETL Router: Loaded ${products.length} products from embedded database (${total} total)`);

            res.json({
                products,
                total,
                source: 'embedded_database',
                message: 'Products loaded from embedded database'
            });

        } catch (dbError) {
            console.log('⚠️ ETL Router: Embedded database failed, falling back to ETL API...', dbError.message);

            // FALLBACK: Use ETL API if database fails
            if (!ETL_API_KEY) {
                return res.status(500).json({ 
                    error: 'Both embedded database and ETL API failed',
                    message: 'Embedded database error: ' + dbError.message + '. ETL API key not configured.',
                    source: 'fallback_failed'
                });
            }

            // Make request to ETL API
            const response = await axios.get(`${ETL_BASE_URL}/products`, {
                headers: {
                    'x-api-key': ETL_API_KEY,
                    'Content-Type': 'application/json'
                },
                params: {
                    size: limit,
                    listingStatus: 'current'
                }
            });

            // Transform ETL data to our format
            const products = response.data.products.map(product => ({
                id: product.id,
                name: product.name || product.description || 'Unknown Product',
                category: product.technologyId ? `Technology ${product.technologyId}` : 'Unknown',
                power: extractPowerFromFeatures(product.features) || 0,
                energyUsageKwhPerYear: 0,
                energyRating: extractEnergyRatingFromFeatures(product.features) || 'Unknown',
                inShop: true,
                runningCostPerYear: calculateRunningCost(extractPowerFromFeatures(product.features) || 0),
                description: product.description || '',
                manufacturer: product.manufacturer ? product.manufacturer.name : 'Unknown',
                model: product.modelNumber || product.id,
                sku: product.id,
                source: 'etl_api'
            }));

            console.log(`✅ ETL Router: Fallback successful - loaded ${products.length} products from ETL API`);

            res.json({
                products,
                total: response.data.total || products.length,
                source: 'etl_api',
                message: 'Products loaded from ETL API (embedded database failed)'
            });
        }

    } catch (error) {
        console.error('❌ ETL Router: Both embedded database and ETL API failed:', error.message);
        
        if (error.response?.status === 401) {
            res.status(401).json({ 
                error: 'ETL API authentication failed',
                message: 'Please check your ETL_API_KEY in the .env file',
                source: 'api_auth_failed'
            });
        } else {
            res.status(500).json({ 
                error: 'All data sources failed',
                message: error.message,
                source: 'all_failed'
            });
        }
    }
});

// Test both embedded database and ETL API connection
router.get('/test', async (req, res) => {
    const results = {
        embedded_database: { status: 'unknown', message: '', count: 0 },
        etl_api: { status: 'unknown', message: '', configured: false }
    };

    // Test embedded database
    try {
        const count = await getTotalCountFromDatabase();
        results.embedded_database = {
            status: 'success',
            message: `Embedded database accessible with ${count} products`,
            count: count
        };
    } catch (dbError) {
        results.embedded_database = {
            status: 'error',
            message: 'Embedded database error: ' + dbError.message,
            count: 0
        };
    }

    // Test ETL API
    try {
        if (!ETL_API_KEY) {
            results.etl_api = {
                status: 'error',
                message: 'ETL API key not configured',
                configured: false
            };
        } else {
            // Test with a simple API call
            const response = await axios.get(`${ETL_BASE_URL}/products?size=1`, {
                headers: {
                    'x-api-key': ETL_API_KEY,
                    'Content-Type': 'application/json'
                }
            });

            results.etl_api = {
                status: 'success',
                message: 'ETL API connection successful',
                configured: true,
                apiStatus: response.data
            };
        }
    } catch (apiError) {
        results.etl_api = {
            status: 'error',
            message: 'ETL API connection failed: ' + (apiError.response?.data || apiError.message),
            configured: true
        };
    }

    // Determine overall status
    const overallStatus = results.embedded_database.status === 'success' ? 'success' : 
                        results.etl_api.status === 'success' ? 'partial' : 'error';

    res.json({
        status: overallStatus,
        message: overallStatus === 'success' ? 'All systems operational' : 
                overallStatus === 'partial' ? 'Embedded database failed, ETL API available' : 
                'All systems failed',
        results: results
    });
});

module.exports = router;