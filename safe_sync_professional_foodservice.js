const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔄 SAFE DATA SYNC - CENTRAL DB → CALCULATOR DB\n');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CENTRAL_DB_PATH = path.join(__dirname, 'database', 'energy_calculator_central.db');
const CALCULATOR_DB_PATH = path.join(__dirname, 'database', 'energy_calculator.db');

// Column mapping from Central DB (new schema) to Calculator DB (old schema)
const COLUMN_MAPPING = {
    // Central DB -> Calculator DB
    'id': 'id',
    'name': 'name',
    'brand': 'brand',
    'category': 'category',
    'subcategory': 'subcategory',
    'power': 'power',
    'energyRating': 'energy_rating',
    'efficiency': 'efficiency',
    'runningCostPerYear': 'running_cost_per_year',
    'modelNumber': 'model_number',
    'imageUrl': 'image_url'
};

// ============================================================================
// SAFE SYNC FUNCTION
// ============================================================================

async function safeSyncProfessionalFoodserviceProducts() {
    try {
        console.log('🚀 Starting safe data sync...');
        
        // Open both databases
        const centralDb = new sqlite3.Database(CENTRAL_DB_PATH);
        const calculatorDb = new sqlite3.Database(CALCULATOR_DB_PATH);
        
        return new Promise((resolve, reject) => {
            console.log('📋 Loading professional foodservice products from Central DB...');
            
            // Get all professional foodservice products from Central DB
            centralDb.all(`
                SELECT 
                    id, name, brand, category, subcategory, 
                    power, energyRating, efficiency, runningCostPerYear,
                    modelNumber, imageUrl, sku, price, powerDisplay,
                    descriptionShort, descriptionFull, additionalInfo, 
                    specifications, marketingInfo, calculatorData,
                    productPageUrl, affiliateInfo, createdAt, updatedAt,
                    extractedFrom, extractionDate
                FROM products 
                WHERE category = 'professional-foodservice'
                ORDER BY brand, name
            `, [], (err, centralProducts) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                console.log(`✅ Found ${centralProducts.length} professional foodservice products in Central DB`);
                
                let updatedCount = 0;
                let insertedCount = 0;
                let skippedCount = 0;
                
                // Process each Central DB product
                centralProducts.forEach((centralProduct, index) => {
                    // Check if product already exists in Calculator DB
                    calculatorDb.get(`
                        SELECT * FROM products 
                        WHERE name = ? AND brand = ?
                    `, [centralProduct.name, centralProduct.brand], (err, existingProduct) => {
                        if (err) {
                            console.error(`❌ Error checking product ${centralProduct.name}:`, err);
                            return;
                        }
                        
                        if (existingProduct) {
                            // Product exists - update with Central DB data while preserving Calculator DB info
                            const updateData = {
                                id: centralProduct.id || existingProduct.id,
                                name: centralProduct.name,
                                brand: centralProduct.brand,
                                category: centralProduct.category || 'professional-foodservice',
                                subcategory: centralProduct.subcategory || existingProduct.subcategory || '',
                                power: centralProduct.power || existingProduct.power || 0,
                                energy_rating: centralProduct.energyRating || existingProduct.energy_rating || '',
                                efficiency: centralProduct.efficiency || existingProduct.efficiency || '',
                                running_cost_per_year: centralProduct.runningCostPerYear || existingProduct.running_cost_per_year || 0,
                                image_url: centralProduct.imageUrl || existingProduct.image_url || '',
                                model_number: centralProduct.modelNumber || existingProduct.model_number || ''
                            };
                            
                            calculatorDb.run(`
                                UPDATE products SET
                                    id = ?, name = ?, brand = ?, category = ?, subcategory = ?,
                                    power = ?, energy_rating = ?, efficiency = ?, 
                                    running_cost_per_year = ?, image_url = ?, model_number = ?
                                WHERE name = ? AND brand = ?
                            `, [
                                updateData.id, updateData.name, updateData.brand, updateData.category, updateData.subcategory,
                                updateData.power, updateData.energy_rating, updateData.efficiency,
                                updateData.running_cost_per_year, updateData.image_url, updateData.model_number,
                                centralProduct.name, centralProduct.brand
                            ], function(err) {
                                if (err) {
                                    console.error(`❌ Error updating ${centralProduct.name}:`, err);
                                } else {
                                    updatedCount++;
                                    console.log(`✅ Updated: ${centralProduct.name} (${centralProduct.brand})`);
                                }
                            });
                            
                        } else {
                            // Product doesn't exist - insert new product
                            const insertData = {
                                id: centralProduct.id || `pf_${Date.now()}_${index}`,
                                name: centralProduct.name,
                                brand: centralProduct.brand,
                                category: centralProduct.category || 'professional-foodservice',
                                subcategory: centralProduct.subcategory || '',
                                power: centralProduct.power || 0,
                                energy_rating: centralProduct.energyRating || '',
                                efficiency: centralProduct.efficiency || '',
                                running_cost_per_year: centralProduct.runningCostPerYear || 0,
                                image_url: centralProduct.imageUrl || '',
                                model_number: centralProduct.modelNumber || ''
                            };
                            
                            calculatorDb.run(`
                                INSERT INTO products (
                                    id, name, brand, category, subcategory, power, 
                                    energy_rating, efficiency, running_cost_per_year, 
                                    image_url, model_number
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `, [
                                insertData.id, insertData.name, insertData.brand, insertData.category, insertData.subcategory,
                                insertData.power, insertData.energy_rating, insertData.efficiency,
                                insertData.running_cost_per_year, insertData.image_url, insertData.model_number
                            ], function(err) {
                                if (err) {
                                    console.error(`❌ Error inserting ${centralProduct.name}:`, err);
                                } else {
                                    insertedCount++;
                                    console.log(`✅ Inserted: ${centralProduct.name} (${centralProduct.brand})`);
                                }
                            });
                        }
                    });
                });
                
                // Wait for all operations to complete
                setTimeout(() => {
                    console.log('\n📊 SYNC RESULTS:');
                    console.log(`   Products updated: ${updatedCount}`);
                    console.log(`   Products inserted: ${insertedCount}`);
                    console.log(`   Total processed: ${updatedCount + insertedCount}`);
                    
                    centralDb.close();
                    calculatorDb.close();
                    
                    resolve({
                        updatedCount,
                        insertedCount,
                        totalProcessed: updatedCount + insertedCount
                    });
                }, 3000);
            });
        });
        
    } catch (error) {
        console.error('❌ Error during safe sync:', error);
        throw error;
    }
}

// ============================================================================
// VERIFICATION FUNCTION
// ============================================================================

async function verifySyncResults() {
    try {
        console.log('\n🔍 Verifying sync results...');
        
        const calculatorDb = new sqlite3.Database(CALCULATOR_DB_PATH);
        
        return new Promise((resolve, reject) => {
            calculatorDb.all(`
                SELECT name, brand, image_url, power, energy_rating, efficiency
                FROM products 
                WHERE category = 'professional-foodservice'
                ORDER BY brand, name
            `, [], (err, products) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                console.log(`✅ Calculator DB now has ${products.length} professional foodservice products`);
                
                const withImages = products.filter(p => p.image_url && p.image_url.trim() !== '');
                const withPower = products.filter(p => p.power && p.power > 0);
                const withEnergyRating = products.filter(p => p.energy_rating && p.energy_rating.trim() !== '');
                
                console.log(`   Products with images: ${withImages.length}/${products.length}`);
                console.log(`   Products with power data: ${withPower.length}/${products.length}`);
                console.log(`   Products with energy rating: ${withEnergyRating.length}/${products.length}`);
                
                // Show first 5 products as examples
                console.log('\n📋 Sample products:');
                products.slice(0, 5).forEach((product, index) => {
                    console.log(`   ${index + 1}. ${product.name} (${product.brand})`);
                    console.log(`      Image: ${product.image_url ? 'Yes' : 'No'}`);
                    console.log(`      Power: ${product.power}W`);
                    console.log(`      Energy Rating: ${product.energy_rating}`);
                });
                
                calculatorDb.close();
                resolve({
                    totalProducts: products.length,
                    withImages: withImages.length,
                    withPower: withPower.length,
                    withEnergyRating: withEnergyRating.length
                });
            });
        });
        
    } catch (error) {
        console.error('❌ Error verifying sync:', error);
        throw error;
    }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
    try {
        console.log('🚀 Starting Safe Data Sync Process...\n');
        
        // Step 1: Safe sync
        const syncResult = await safeSyncProfessionalFoodserviceProducts();
        
        // Step 2: Verify results
        const verification = await verifySyncResults();
        
        console.log('\n✅ SAFE SYNC COMPLETE!');
        console.log(`   Products processed: ${syncResult.totalProcessed}`);
        console.log(`   Final product count: ${verification.totalProducts}`);
        console.log(`   Products with images: ${verification.withImages}`);
        
        console.log('\n🎯 NEXT STEPS:');
        console.log('   1. Test the professional-foodservice page');
        console.log('   2. Verify images are loading correctly');
        console.log('   3. Check that all calculators still work');
        console.log('   4. Test grants and collections integration');
        
        console.log('\n🛡️ ROLLBACK AVAILABLE:');
        console.log('   If anything breaks, run: node backup_rollback_system.js restore backup_session_2025-10-22T18-30-37-865Z');
        
    } catch (error) {
        console.error('❌ Safe sync failed:', error);
        console.log('\n🛡️ ROLLBACK AVAILABLE:');
        console.log('   Run: node backup_rollback_system.js restore backup_session_2025-10-22T18-30-37-865Z');
        process.exit(1);
    }
}

// Run the main function
if (require.main === module) {
    main();
}

module.exports = {
    safeSyncProfessionalFoodserviceProducts,
    verifySyncResults
};



















