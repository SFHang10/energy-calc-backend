const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 ENERGY AUDIT WIDGET PRODUCT COUNT CHECK\n');

// Check what products the Energy Audit Widget can access
async function checkAuditWidgetProducts() {
    console.log('📊 Checking Energy Audit Widget product access...\n');
    
    // Check Central DB (where ETL integration loads from)
    const centralDbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
    
    if (!require('fs').existsSync(centralDbPath)) {
        console.log('❌ Central database not found');
        return;
    }
    
    const db = new sqlite3.Database(centralDbPath);
    
    // Get total count
    db.get('SELECT COUNT(*) as total FROM products', (err, row) => {
        if (err) {
            console.log('❌ Error getting total count:', err.message);
            db.close();
            return;
        }
        
        console.log(`📈 Total products available to Energy Audit Widget: ${row.total}`);
        
        // Get category breakdown
        db.all(`
            SELECT category, COUNT(*) as count 
            FROM products 
            GROUP BY category 
            ORDER BY count DESC
        `, (err, categories) => {
            if (err) {
                console.log('❌ Error getting categories:', err.message);
                db.close();
                return;
            }
            
            console.log('\n📂 Products by category:');
            categories.forEach(cat => {
                console.log(`  ${cat.category}: ${cat.count} products`);
            });
            
            // Check for heating products specifically
            db.all(`
                SELECT name, category, brand 
                FROM products 
                WHERE name LIKE '%heat%' OR name LIKE '%boiler%' OR name LIKE '%pump%' OR category = 'Heating'
                LIMIT 10
            `, (err, heatingProducts) => {
                if (err) {
                    console.log('❌ Error getting heating products:', err.message);
                } else {
                    console.log(`\n🔥 Heating-related products available: ${heatingProducts.length}`);
                    if (heatingProducts.length > 0) {
                        console.log('First 5 heating products:');
                        heatingProducts.slice(0, 5).forEach(p => {
                            console.log(`  - ${p.name} (${p.brand}) - ${p.category}`);
                        });
                    }
                }
                
                // Check for restaurant/commercial products
                db.all(`
                    SELECT name, category, brand 
                    FROM products 
                    WHERE category LIKE '%restaurant%' OR category LIKE '%food%' OR category LIKE '%professional%'
                    LIMIT 10
                `, (err, restaurantProducts) => {
                    if (err) {
                        console.log('❌ Error getting restaurant products:', err.message);
                    } else {
                        console.log(`\n🍽️ Restaurant/Commercial products available: ${restaurantProducts.length}`);
                        if (restaurantProducts.length > 0) {
                            console.log('First 5 restaurant products:');
                            restaurantProducts.slice(0, 5).forEach(p => {
                                console.log(`  - ${p.name} (${p.brand}) - ${p.category}`);
                            });
                        }
                    }
                    
                    // Check for appliances
                    db.all(`
                        SELECT name, category, brand 
                        FROM products 
                        WHERE category = 'Appliances'
                        LIMIT 10
                    `, (err, applianceProducts) => {
                        if (err) {
                            console.log('❌ Error getting appliance products:', err.message);
                        } else {
                            console.log(`\n🏠 Appliance products available: ${applianceProducts.length}`);
                            if (applianceProducts.length > 0) {
                                console.log('First 5 appliance products:');
                                applianceProducts.slice(0, 5).forEach(p => {
                                    console.log(`  - ${p.name} (${p.brand}) - ${p.category}`);
                                });
                            }
                        }
                        
                        console.log('\n✅ Energy Audit Widget product check complete!');
                        console.log('\n💡 The Energy Audit Widget should now have access to all these products');
                        console.log('   through the ETL integration script we added earlier.');
                        
                        db.close();
                    });
                });
            });
        });
    });
}

checkAuditWidgetProducts().catch(console.error);


















