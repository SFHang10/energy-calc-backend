/**
 * PRODUCT GRANTS INTEGRATOR
 * Integrates hardcoded grants system with existing product database
 * Adds grants field to each product based on category, subcategory, and region
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Import the hardcoded grants system
const {
    PRODUCT_GRANTS_MAPPING,
    getProductGrants,
    calculateProductGrantTotal,
    addGrantsToProduct,
    addGrantsToProducts,
    getAvailableGrantRegions,
    getGrantsSystemStats,
    formatProductGrantsDisplay
} = require('./hardcoded-grants-system.js');

console.log('🏛️ PRODUCT GRANTS INTEGRATOR - Adding Grants to Product Database\n');

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================

const DATABASE_PATH = path.join(__dirname, 'database', 'energy_calculator_central.db');
const OUTPUT_DATABASE_PATH = path.join(__dirname, 'database', 'energy_calculator_with_grants.db');
const OUTPUT_JSON_PATH = path.join(__dirname, 'products-with-grants.json');

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Add grants columns to products table
 * @param {sqlite3.Database} db - Database connection
 * @returns {Promise<void>}
 */
function addGrantsColumn(db) {
    return new Promise((resolve, reject) => {
        const columns = [
            { name: 'grants', type: 'TEXT', default: "'[]'" },
            { name: 'grants_total', type: 'REAL', default: '0' },
            { name: 'grants_currency', type: 'TEXT', default: "'EUR'" },
            { name: 'grants_region', type: 'TEXT', default: "'uk.england'" },
            { name: 'grants_count', type: 'INTEGER', default: '0' }
        ];
        
        let completed = 0;
        let hasError = false;
        
        columns.forEach(column => {
            const sql = `ALTER TABLE products ADD COLUMN ${column.name} ${column.type} DEFAULT ${column.default}`;
            
            db.run(sql, (err) => {
                if (err) {
                    // Column might already exist, which is fine
                    if (err.message.includes('duplicate column name')) {
                        console.log(`✅ Column ${column.name} already exists`);
                    } else {
                        console.error(`❌ Error adding column ${column.name}:`, err.message);
                        hasError = true;
                    }
                } else {
                    console.log(`✅ Added column ${column.name} to products table`);
                }
                
                completed++;
                if (completed === columns.length) {
                    if (hasError) {
                        reject(new Error('Some columns could not be added'));
                    } else {
                        console.log('✅ All grants columns added successfully');
                        resolve();
                    }
                }
            });
        });
    });
}

/**
 * Get all products from database
 * @param {sqlite3.Database} db - Database connection
 * @returns {Promise<Array>} Array of products
 */
function getAllProducts(db) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                id, name, brand, category, subcategory, 
                power, energyRating, efficiency, runningCostPerYear,
                modelNumber, imageUrl, sku, price, powerDisplay,
                images, videos, descriptionShort, descriptionFull,
                additionalInfo, specifications, marketingInfo, calculatorData,
                productPageUrl, affiliateInfo, createdAt, updatedAt,
                extractedFrom, extractionDate
            FROM products 
            ORDER BY category, brand, name
        `;
        
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

/**
 * Update product with grants information
 * @param {sqlite3.Database} db - Database connection
 * @param {Object} product - Product object with grants
 * @returns {Promise<void>}
 */
function updateProductWithGrants(db, product) {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE products 
            SET 
                grants = ?,
                grants_total = ?,
                grants_currency = ?,
                grants_region = ?,
                grants_count = ?
            WHERE id = ?
        `;
        
        const params = [
            JSON.stringify(product.grants),
            product.grantsTotal,
            product.grantsCurrency,
            product.grantsRegion,
            product.grantsCount,
            product.id
        ];
        
        db.run(sql, params, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 * Process all products and add grants
 * @param {sqlite3.Database} db - Database connection
 * @returns {Promise<Object>} Processing statistics
 */
async function processAllProducts(db) {
    console.log('📊 Loading products from database...');
    const products = await getAllProducts(db);
    console.log(`✅ Loaded ${products.length} products`);
    
    const stats = {
        total: products.length,
        processed: 0,
        withGrants: 0,
        withoutGrants: 0,
        totalGrantAmount: 0,
        categories: {},
        regions: {}
    };
    
    console.log('🔄 Processing products and adding grants...');
    
    for (const product of products) {
        try {
            // Add grants to product
            const productWithGrants = addGrantsToProduct(product, 'uk.england');
            
            // Update database
            await updateProductWithGrants(db, productWithGrants);
            
            // Update statistics
            stats.processed++;
            if (productWithGrants.grantsCount > 0) {
                stats.withGrants++;
                stats.totalGrantAmount += productWithGrants.grantsTotal;
                
                // Category stats
                if (!stats.categories[product.category]) {
                    stats.categories[product.category] = 0;
                }
                stats.categories[product.category]++;
                
                // Region stats
                if (!stats.regions[productWithGrants.grantsRegion]) {
                    stats.regions[productWithGrants.grantsRegion] = 0;
                }
                stats.regions[productWithGrants.grantsRegion]++;
            } else {
                stats.withoutGrants++;
            }
            
            // Progress indicator
            if (stats.processed % 100 === 0) {
                console.log(`📈 Processed ${stats.processed}/${stats.total} products...`);
            }
            
        } catch (error) {
            console.error(`❌ Error processing product ${product.id}:`, error.message);
        }
    }
    
    return stats;
}

/**
 * Export products with grants to JSON
 * @param {sqlite3.Database} db - Database connection
 * @returns {Promise<void>}
 */
async function exportProductsWithGrants(db) {
    console.log('📤 Exporting products with grants to JSON...');
    
    const products = await getAllProducts(db);
    const productsWithGrants = products.map(product => addGrantsToProduct(product, 'uk.england'));
    
    const exportData = {
        metadata: {
            exportDate: new Date().toISOString(),
            totalProducts: productsWithGrants.length,
            grantsSystem: 'Hardcoded Product-Specific Grants',
            version: '1.0.0'
        },
        grantsStats: getGrantsSystemStats(),
        availableRegions: getAvailableGrantRegions(),
        products: productsWithGrants
    };
    
    const fs = require('fs');
    fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(exportData, null, 2));
    console.log(`✅ Exported ${productsWithGrants.length} products to ${OUTPUT_JSON_PATH}`);
}

/**
 * Create a copy of the database with grants
 * @param {string} sourcePath - Source database path
 * @param {string} targetPath - Target database path
 * @returns {Promise<void>}
 */
async function copyDatabaseWithGrants(sourcePath, targetPath) {
    console.log('📋 Creating copy of database with grants...');
    
    const fs = require('fs');
    
    // Copy the database file
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ Database copied to ${targetPath}`);
    
    // Open the new database and add grants
    const db = new sqlite3.Database(targetPath);
    
    try {
        // Add grants columns
        await addGrantsColumn(db);
        
        // Process all products
        const stats = await processAllProducts(db);
        
        // Export to JSON
        await exportProductsWithGrants(db);
        
        console.log('\n🎉 GRANTS INTEGRATION COMPLETE!');
        console.log('📊 Final Statistics:');
        console.log(`   Total Products: ${stats.total}`);
        console.log(`   Products with Grants: ${stats.withGrants}`);
        console.log(`   Products without Grants: ${stats.withoutGrants}`);
        console.log(`   Total Grant Amount Available: €${stats.totalGrantAmount.toLocaleString()}`);
        console.log(`   Categories with Grants: ${Object.keys(stats.categories).length}`);
        console.log(`   Regions Covered: ${Object.keys(stats.regions).length}`);
        
        console.log('\n📁 Output Files:');
        console.log(`   Database: ${OUTPUT_DATABASE_PATH}`);
        console.log(`   JSON Export: ${OUTPUT_JSON_PATH}`);
        
    } finally {
        db.close();
    }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
    try {
        console.log('🚀 Starting Product Grants Integration...\n');
        
        // Check if source database exists
        const fs = require('fs');
        if (!fs.existsSync(DATABASE_PATH)) {
            throw new Error(`Source database not found: ${DATABASE_PATH}`);
        }
        
        // Display grants system information
        console.log('🏛️ Grants System Information:');
        const grantsStats = getGrantsSystemStats();
        console.log(`   Total Grants Available: ${grantsStats.totalGrants}`);
        console.log(`   Categories Covered: ${grantsStats.totalCategories}`);
        console.log(`   Subcategories Covered: ${grantsStats.totalSubcategories}`);
        console.log(`   Regions Covered: ${grantsStats.totalRegions}`);
        console.log(`   Max Grant Amount: €${grantsStats.maxAmount.toLocaleString()}`);
        console.log(`   Min Grant Amount: €${grantsStats.minAmount.toLocaleString()}`);
        console.log('');
        
        // Process the database
        await copyDatabaseWithGrants(DATABASE_PATH, OUTPUT_DATABASE_PATH);
        
        console.log('\n✅ All operations completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during grants integration:', error);
        process.exit(1);
    }
}

// Run the main function
if (require.main === module) {
    main();
}

module.exports = {
    addGrantsColumn,
    getAllProducts,
    updateProductWithGrants,
    processAllProducts,
    exportProductsWithGrants,
    copyDatabaseWithGrants
};
