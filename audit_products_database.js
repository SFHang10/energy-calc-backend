const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

console.log('🔍 COMPREHENSIVE PRODUCT DATABASE AUDIT\n');

// Check multiple database sources
const databases = [
    { name: 'Central DB', path: path.join(__dirname, 'database', 'energy_calculator_central.db') },
    { name: 'Calculator DB', path: path.join(__dirname, 'database', 'energy_calculator.db') }
];

// Check JSON file
const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');

async function auditDatabase(dbInfo) {
    return new Promise((resolve) => {
        console.log(`\n📊 AUDITING ${dbInfo.name.toUpperCase()}`);
        console.log('='.repeat(50));
        
        if (!fs.existsSync(dbInfo.path)) {
            console.log(`❌ Database not found: ${dbInfo.path}`);
            resolve(null);
            return;
        }
        
        const db = new sqlite3.Database(dbInfo.path);
        
        // Get table schema
        db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
            if (err) {
                console.log(`❌ Error getting tables: ${err.message}`);
                resolve(null);
                return;
            }
            
            console.log(`📋 Tables found: ${tables.map(t => t.name).join(', ')}`);
            
            // Check if products table exists
            const productsTable = tables.find(t => t.name === 'products');
            if (!productsTable) {
                console.log('❌ No products table found');
                db.close();
                resolve(null);
                return;
            }
            
            // Get table schema
            db.all("PRAGMA table_info(products)", (err, columns) => {
                if (err) {
                    console.log(`❌ Error getting schema: ${err.message}`);
                    db.close();
                    resolve(null);
                    return;
                }
                
                console.log(`\n🏗️ Products table schema:`);
                columns.forEach(col => {
                    console.log(`  - ${col.name} (${col.type})`);
                });
                
                // Get total product count
                db.get("SELECT COUNT(*) as total FROM products", (err, row) => {
                    if (err) {
                        console.log(`❌ Error getting count: ${err.message}`);
                        db.close();
                        resolve(null);
                        return;
                    }
                    
                    console.log(`\n📈 Total products: ${row.total}`);
                    
                    // Get category breakdown
                    db.all(`
                        SELECT category, COUNT(*) as count 
                        FROM products 
                        GROUP BY category 
                        ORDER BY count DESC
                    `, (err, categories) => {
                        if (err) {
                            console.log(`❌ Error getting categories: ${err.message}`);
                            db.close();
                            resolve(null);
                            return;
                        }
                        
                        console.log(`\n📂 Products by category:`);
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
                                console.log(`❌ Error getting heating products: ${err.message}`);
                            } else {
                                console.log(`\n🔥 Heating-related products (first 10):`);
                                if (heatingProducts.length === 0) {
                                    console.log('  ❌ No heating products found');
                                } else {
                                    heatingProducts.forEach(p => {
                                        console.log(`  - ${p.name} (${p.brand}) - ${p.category}`);
                                    });
                                }
                            }
                            
                            // Check for restaurant equipment
                            db.all(`
                                SELECT name, category, brand 
                                FROM products 
                                WHERE category LIKE '%restaurant%' OR category LIKE '%food%' OR name LIKE '%commercial%'
                                LIMIT 10
                            `, (err, restaurantProducts) => {
                                if (err) {
                                    console.log(`❌ Error getting restaurant products: ${err.message}`);
                                } else {
                                    console.log(`\n🍽️ Restaurant/Commercial products (first 10):`);
                                    if (restaurantProducts.length === 0) {
                                        console.log('  ❌ No restaurant products found');
                                    } else {
                                        restaurantProducts.forEach(p => {
                                            console.log(`  - ${p.name} (${p.brand}) - ${p.category}`);
                                        });
                                    }
                                }
                                
                                db.close();
                                resolve({
                                    name: dbInfo.name,
                                    total: row.total,
                                    categories: categories,
                                    heatingCount: heatingProducts.length,
                                    restaurantCount: restaurantProducts.length
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

async function auditJSON() {
    console.log(`\n📊 AUDITING JSON FILE`);
    console.log('='.repeat(50));
    
    if (!fs.existsSync(jsonPath)) {
        console.log(`❌ JSON file not found: ${jsonPath}`);
        return null;
    }
    
    try {
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        if (!jsonData.products || !Array.isArray(jsonData.products)) {
            console.log('❌ Invalid JSON structure - no products array');
            return null;
        }
        
        console.log(`📈 Total products: ${jsonData.products.length}`);
        
        // Category breakdown
        const categoryCounts = {};
        jsonData.products.forEach(product => {
            const category = product.category || 'Unknown';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        
        console.log(`\n📂 Products by category:`);
        Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .forEach(([category, count]) => {
                console.log(`  ${category}: ${count} products`);
            });
        
        // Check for heating products
        const heatingProducts = jsonData.products.filter(p => 
            (p.name && (p.name.toLowerCase().includes('heat') || p.name.toLowerCase().includes('boiler') || p.name.toLowerCase().includes('pump'))) ||
            p.category === 'Heating'
        );
        
        console.log(`\n🔥 Heating-related products: ${heatingProducts.length}`);
        if (heatingProducts.length > 0) {
            heatingProducts.slice(0, 5).forEach(p => {
                console.log(`  - ${p.name} (${p.brand}) - ${p.category}`);
            });
        }
        
        // Check for restaurant products
        const restaurantProducts = jsonData.products.filter(p => 
            p.category && (p.category.toLowerCase().includes('restaurant') || p.category.toLowerCase().includes('food') || p.category.toLowerCase().includes('professional'))
        );
        
        console.log(`\n🍽️ Restaurant/Commercial products: ${restaurantProducts.length}`);
        if (restaurantProducts.length > 0) {
            restaurantProducts.slice(0, 5).forEach(p => {
                console.log(`  - ${p.name} (${p.brand}) - ${p.category}`);
            });
        }
        
        return {
            total: jsonData.products.length,
            categories: categoryCounts,
            heatingCount: heatingProducts.length,
            restaurantCount: restaurantProducts.length
        };
        
    } catch (error) {
        console.log(`❌ Error reading JSON: ${error.message}`);
        return null;
    }
}

async function runAudit() {
    console.log('🚀 Starting comprehensive product database audit...\n');
    
    // Audit databases
    const dbResults = [];
    for (const dbInfo of databases) {
        const result = await auditDatabase(dbInfo);
        if (result) {
            dbResults.push(result);
        }
    }
    
    // Audit JSON
    const jsonResult = await auditJSON();
    
    // Summary
    console.log(`\n📋 AUDIT SUMMARY`);
    console.log('='.repeat(50));
    
    if (dbResults.length > 0) {
        console.log('🗄️ Database Results:');
        dbResults.forEach(result => {
            console.log(`  ${result.name}: ${result.total} products`);
            console.log(`    - Heating: ${result.heatingCount}`);
            console.log(`    - Restaurant: ${result.restaurantCount}`);
        });
    }
    
    if (jsonResult) {
        console.log(`\n📄 JSON File: ${jsonResult.total} products`);
        console.log(`  - Heating: ${jsonResult.heatingCount}`);
        console.log(`  - Restaurant: ${jsonResult.restaurantCount}`);
    }
    
    // Issues identified
    console.log(`\n🚨 ISSUES IDENTIFIED:`);
    let hasIssues = false;
    
    if (jsonResult && jsonResult.heatingCount === 0) {
        console.log('  ❌ No heating products in JSON file');
        hasIssues = true;
    }
    
    if (dbResults.some(r => r.heatingCount === 0)) {
        console.log('  ❌ No heating products in some databases');
        hasIssues = true;
    }
    
    if (!hasIssues) {
        console.log('  ✅ No major issues found');
    }
    
    console.log('\n✅ Audit complete!');
}

runAudit().catch(console.error);


















