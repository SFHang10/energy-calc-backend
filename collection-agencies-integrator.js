/**
 * COLLECTION AGENCIES INTEGRATOR
 * Integrates collection agencies system with existing product database
 * Adds collection agencies field to each product based on category, subcategory, and region
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Import the collection agencies system
const {
    COLLECTION_AGENCIES_DATABASE,
    getCollectionAgencies,
    calculateCollectionIncentiveTotal,
    addCollectionAgenciesToProduct,
    getAvailableCollectionRegions,
    getCollectionAgenciesStats,
    formatCollectionAgenciesDisplay
} = require('./collection-agencies-system.js');

console.log('♻️ COLLECTION AGENCIES INTEGRATOR - Adding Collection Agencies to Product Database\n');

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================

const DATABASE_PATH = path.join(__dirname, 'database', 'energy_calculator_with_grants.db');
const OUTPUT_DATABASE_PATH = path.join(__dirname, 'database', 'energy_calculator_with_collection.db');
const OUTPUT_JSON_PATH = path.join(__dirname, 'products-with-collection.json');

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Add collection agencies columns to products table
 * @param {sqlite3.Database} db - Database connection
 * @returns {Promise<void>}
 */
function addCollectionAgenciesColumns(db) {
    return new Promise((resolve, reject) => {
        const columns = [
            { name: 'collection_agencies', type: 'TEXT', default: "'[]'" },
            { name: 'collection_incentive_total', type: 'REAL', default: '0' },
            { name: 'collection_currency', type: 'TEXT', default: "'GBP'" },
            { name: 'collection_region', type: 'TEXT', default: "'uk.england'" },
            { name: 'collection_agencies_count', type: 'INTEGER', default: '0' }
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
                        console.log('✅ All collection agencies columns added successfully');
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
                extractedFrom, extractionDate, grants, grants_total,
                grants_currency, grants_region, grants_count
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
 * Update product with collection agencies information
 * @param {sqlite3.Database} db - Database connection
 * @param {Object} product - Product object with collection agencies
 * @returns {Promise<void>}
 */
function updateProductWithCollectionAgencies(db, product) {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE products 
            SET 
                collection_agencies = ?,
                collection_incentive_total = ?,
                collection_currency = ?,
                collection_region = ?,
                collection_agencies_count = ?
            WHERE id = ?
        `;
        
        const params = [
            JSON.stringify(product.collectionAgencies),
            product.collectionIncentiveTotal,
            product.collectionCurrency,
            product.collectionRegion,
            product.collectionAgenciesCount,
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
 * Process all products and add collection agencies
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
        withCollectionAgencies: 0,
        withoutCollectionAgencies: 0,
        totalIncentiveAmount: 0,
        categories: {},
        regions: {},
        agencyTypes: {}
    };
    
    console.log('🔄 Processing products and adding collection agencies...');
    
    for (const product of products) {
        try {
            // Add collection agencies to product
            const productWithCollection = addCollectionAgenciesToProduct(product, 'uk.england');
            
            // Update database
            await updateProductWithCollectionAgencies(db, productWithCollection);
            
            // Update statistics
            stats.processed++;
            if (productWithCollection.collectionAgenciesCount > 0) {
                stats.withCollectionAgencies++;
                stats.totalIncentiveAmount += productWithCollection.collectionIncentiveTotal;
                
                // Category stats
                if (!stats.categories[product.category]) {
                    stats.categories[product.category] = 0;
                }
                stats.categories[product.category]++;
                
                // Region stats
                if (!stats.regions[productWithCollection.collectionRegion]) {
                    stats.regions[productWithCollection.collectionRegion] = 0;
                }
                stats.regions[productWithCollection.collectionRegion]++;
                
                // Agency type stats
                productWithCollection.collectionAgencies.forEach(agency => {
                    if (!stats.agencyTypes[agency.agencyType]) {
                        stats.agencyTypes[agency.agencyType] = 0;
                    }
                    stats.agencyTypes[agency.agencyType]++;
                });
            } else {
                stats.withoutCollectionAgencies++;
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
 * Export products with collection agencies to JSON
 * @param {sqlite3.Database} db - Database connection
 * @returns {Promise<void>}
 */
async function exportProductsWithCollectionAgencies(db) {
    console.log('📤 Exporting products with collection agencies to JSON...');
    
    const products = await getAllProducts(db);
    const productsWithCollection = products.map(product => addCollectionAgenciesToProduct(product, 'uk.england'));
    
    const exportData = {
        metadata: {
            exportDate: new Date().toISOString(),
            totalProducts: productsWithCollection.length,
            collectionSystem: 'Collection Agencies & Recycling Incentives',
            version: '1.0.0'
        },
        collectionStats: getCollectionAgenciesStats(),
        availableRegions: getAvailableCollectionRegions(),
        products: productsWithCollection
    };
    
    const fs = require('fs');
    fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(exportData, null, 2));
    console.log(`✅ Exported ${productsWithCollection.length} products to ${OUTPUT_JSON_PATH}`);
}

/**
 * Create a copy of the database with collection agencies
 * @param {string} sourcePath - Source database path
 * @param {string} targetPath - Target database path
 * @returns {Promise<void>}
 */
async function copyDatabaseWithCollectionAgencies(sourcePath, targetPath) {
    console.log('📋 Creating copy of database with collection agencies...');
    
    const fs = require('fs');
    
    // Copy the database file
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ Database copied to ${targetPath}`);
    
    // Open the new database and add collection agencies
    const db = new sqlite3.Database(targetPath);
    
    try {
        // Add collection agencies columns
        await addCollectionAgenciesColumns(db);
        
        // Process all products
        const stats = await processAllProducts(db);
        
        // Export to JSON
        await exportProductsWithCollectionAgencies(db);
        
        console.log('\n🎉 COLLECTION AGENCIES INTEGRATION COMPLETE!');
        console.log('📊 Final Statistics:');
        console.log(`   Total Products: ${stats.total}`);
        console.log(`   Products with Collection Agencies: ${stats.withCollectionAgencies}`);
        console.log(`   Products without Collection Agencies: ${stats.withoutCollectionAgencies}`);
        console.log(`   Total Incentive Amount Available: €${stats.totalIncentiveAmount.toLocaleString()}`);
        console.log(`   Categories with Collection Agencies: ${Object.keys(stats.categories).length}`);
        console.log(`   Regions Covered: ${Object.keys(stats.regions).length}`);
        console.log(`   Agency Types: ${Object.keys(stats.agencyTypes).length}`);
        
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
        console.log('🚀 Starting Collection Agencies Integration...\n');
        
        // Check if source database exists
        const fs = require('fs');
        if (!fs.existsSync(DATABASE_PATH)) {
            throw new Error(`Source database not found: ${DATABASE_PATH}`);
        }
        
        // Display collection agencies system information
        console.log('♻️ Collection Agencies System Information:');
        const collectionStats = getCollectionAgenciesStats();
        console.log(`   Total Agencies Available: ${collectionStats.totalAgencies}`);
        console.log(`   Categories Covered: ${collectionStats.totalCategories}`);
        console.log(`   Subcategories Covered: ${collectionStats.totalSubcategories}`);
        console.log(`   Regions Covered: ${collectionStats.totalRegions}`);
        console.log(`   Max Incentive Amount: €${collectionStats.maxIncentive.toLocaleString()}`);
        console.log(`   Min Incentive Amount: €${collectionStats.minIncentive.toLocaleString()}`);
        console.log(`   Agency Types: ${Object.keys(collectionStats.agencyTypes).join(', ')}`);
        console.log('');
        
        // Process the database
        await copyDatabaseWithCollectionAgencies(DATABASE_PATH, OUTPUT_DATABASE_PATH);
        
        console.log('\n✅ All operations completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during collection agencies integration:', error);
        process.exit(1);
    }
}

// Run the main function
if (require.main === module) {
    main();
}

module.exports = {
    addCollectionAgenciesColumns,
    getAllProducts,
    updateProductWithCollectionAgencies,
    processAllProducts,
    exportProductsWithCollectionAgencies,
    copyDatabaseWithCollectionAgencies
};






