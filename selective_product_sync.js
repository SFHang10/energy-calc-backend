const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🎯 SELECTIVE PRODUCT SYNC SYSTEM\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

class SelectiveProductSync {
    constructor() {
        this.syncRules = {
            // Only sync products that meet these criteria
            categories: ['Appliances', 'Lighting', 'Heating', 'Restaurant Equipment'],
            subcategories: ['Hand Dryers', 'Heat Pumps', 'LED Bulbs', 'Professional Food Service'],
            minPowerRating: 'A+', // Only high efficiency products
            maxProducts: 50, // Limit total products
            excludeSources: ['Sample'] // Don't sync sample products
        };
    }

    // Get filtered products for store sync
    async getProductsForStore() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM products 
                WHERE category IN (${this.syncRules.categories.map(() => '?').join(',')})
                AND subcategory IN (${this.syncRules.subcategories.map(() => '?').join(',')})
                AND energy_rating >= ?
                AND source NOT IN (${this.syncRules.excludeSources.map(() => '?').join(',')})
                ORDER BY energy_rating DESC, running_cost_per_year ASC
                LIMIT ?
            `;
            
            const params = [
                ...this.syncRules.categories,
                ...this.syncRules.subcategories,
                this.syncRules.minPowerRating,
                ...this.syncRules.excludeSources,
                this.syncRules.maxProducts
            ];
            
            db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(`✅ Found ${rows.length} products matching store criteria`);
                    resolve(rows);
                }
            });
        });
    }

    // Show sync preview
    async showSyncPreview() {
        console.log('📋 STORE SYNC PREVIEW\n');
        
        const products = await this.getProductsForStore();
        
        console.log('🎯 Sync Rules:');
        console.log(`   Categories: ${this.syncRules.categories.join(', ')}`);
        console.log(`   Subcategories: ${this.syncRules.subcategories.join(', ')}`);
        console.log(`   Min Energy Rating: ${this.syncRules.minPowerRating}`);
        console.log(`   Max Products: ${this.syncRules.maxProducts}`);
        console.log(`   Exclude Sources: ${this.syncRules.excludeSources.join(', ')}\n`);
        
        console.log('📦 Products to Sync:');
        products.forEach((product, index) => {
            console.log(`   ${index + 1}. ${product.name}`);
            console.log(`      Category: ${product.category} > ${product.subcategory}`);
            console.log(`      Energy Rating: ${product.energy_rating}`);
            console.log(`      Power: ${product.power}W`);
            console.log(`      Annual Cost: €${product.running_cost_per_year}`);
            console.log('');
        });
        
        return products;
    }

    // Update sync rules
    updateSyncRules(newRules) {
        this.syncRules = { ...this.syncRules, ...newRules };
        console.log('✅ Sync rules updated');
    }
}

// Test the selective sync
async function testSelectiveSync() {
    const sync = new SelectiveProductSync();
    
    try {
        await sync.showSyncPreview();
        
        console.log('💡 You can customize the sync rules by calling:');
        console.log('   sync.updateSyncRules({');
        console.log('     categories: ["Appliances", "Lighting"],');
        console.log('     maxProducts: 25,');
        console.log('     minPowerRating: "A++"');
        console.log('   });');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        db.close();
    }
}

testSelectiveSync();















