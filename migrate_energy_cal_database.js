const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Import the Energy Cal 2 database
const PRODUCT_DATABASE_BACKUP = require('./Energy Cal 2/product-database-backup.js');

console.log('🔄 Migrating Energy Cal 2 database to main backend...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

// First, let's see what we have in the Energy Cal 2 database
console.log('📊 Energy Cal 2 Database Analysis:');
console.log(`   Sample Products: ${PRODUCT_DATABASE_BACKUP.sampleProducts.length}`);
console.log(`   Ovens: ${PRODUCT_DATABASE_BACKUP.ovens ? PRODUCT_DATABASE_BACKUP.ovens.length : 0}`);
console.log(`   Restaurant Equipment: ${PRODUCT_DATABASE_BACKUP.restaurantEquipment ? PRODUCT_DATABASE_BACKUP.restaurantEquipment.length : 0}`);
console.log(`   Office Equipment: ${PRODUCT_DATABASE_BACKUP.officeEquipment ? PRODUCT_DATABASE_BACKUP.officeEquipment.length : 0}`);

// Get all products from Energy Cal 2 database
const allEnergyCalProducts = PRODUCT_DATABASE_BACKUP.sampleProducts || [];

// Add other categories if they exist
if (PRODUCT_DATABASE_BACKUP.ovens) allEnergyCalProducts.push(...PRODUCT_DATABASE_BACKUP.ovens);
if (PRODUCT_DATABASE_BACKUP.restaurantEquipment) allEnergyCalProducts.push(...PRODUCT_DATABASE_BACKUP.restaurantEquipment);
if (PRODUCT_DATABASE_BACKUP.officeEquipment) allEnergyCalProducts.push(...PRODUCT_DATABASE_BACKUP.officeEquipment);

console.log(`\n📈 Total products to migrate: ${allEnergyCalProducts.length}`);

// Function to migrate products
function migrateProducts() {
    return new Promise((resolve, reject) => {
        // Clear existing products first (optional - comment out if you want to keep existing)
        console.log('🗑️  Clearing existing products...');
        
        db.run('DELETE FROM products', (err) => {
            if (err) {
                console.error('Error clearing products:', err);
                reject(err);
                return;
            }
            
            console.log('✅ Existing products cleared');
            
            // Insert Energy Cal 2 products
            console.log('📥 Inserting Energy Cal 2 products...');
            
            const stmt = db.prepare(`
                INSERT INTO products (
                    id, name, power, category, subcategory, brand, 
                    running_cost_per_year, energy_rating, efficiency, source,
                    water_per_cycle_liters, water_per_year_liters, capacity_kg, place_settings
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            let inserted = 0;
            const total = allEnergyCalProducts.length;
            
            allEnergyCalProducts.forEach((product, index) => {
                // Map the product data to database schema
                const dbProduct = {
                    id: product.id,
                    name: product.name,
                    power: product.power || 0,
                    category: product.category || 'Unknown',
                    subcategory: product.subcategory || 'Unknown',
                    brand: product.brand || 'Unknown',
                    running_cost_per_year: product.runningCostPerYear || 0,
                    energy_rating: product.energyRating || 'Unknown',
                    efficiency: product.efficiency || 'Unknown',
                    source: product.source || 'Energy Cal 2',
                    water_per_cycle_liters: product.waterUsage || 0,
                    water_per_year_liters: 0, // Calculate if needed
                    capacity_kg: product.capacity || null,
                    place_settings: product.placeSettings || null
                };
                
                stmt.run([
                    dbProduct.id,
                    dbProduct.name,
                    dbProduct.power,
                    dbProduct.category,
                    dbProduct.subcategory,
                    dbProduct.brand,
                    dbProduct.running_cost_per_year,
                    dbProduct.energy_rating,
                    dbProduct.efficiency,
                    dbProduct.source,
                    dbProduct.water_per_cycle_liters,
                    dbProduct.water_per_year_liters,
                    dbProduct.capacity_kg,
                    dbProduct.place_settings
                ], (err) => {
                    if (err) {
                        console.error(`Error inserting product ${product.id}:`, err);
                    } else {
                        inserted++;
                        if (inserted % 10 === 0) {
                            console.log(`   Inserted ${inserted}/${total} products...`);
                        }
                    }
                    
                    if (index === total - 1) {
                        stmt.finalize((err) => {
                            if (err) {
                                console.error('Error finalizing statement:', err);
                                reject(err);
                            } else {
                                console.log(`✅ Successfully migrated ${inserted} products!`);
                                resolve(inserted);
                            }
                        });
                    }
                });
            });
        });
    });
}

// Run migration
migrateProducts()
    .then((count) => {
        console.log(`\n🎉 Migration completed! ${count} products migrated to main database.`);
        
        // Verify migration
        db.get('SELECT COUNT(*) as total FROM products', (err, row) => {
            if (err) {
                console.error('Error verifying migration:', err);
            } else {
                console.log(`📊 Total products in database: ${row.total}`);
            }
            db.close();
        });
    })
    .catch((error) => {
        console.error('❌ Migration failed:', error);
        db.close();
    });















