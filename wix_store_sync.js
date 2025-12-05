const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🛒 WIX STORE SYNC SYSTEM\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

class WixStoreSync {
    constructor() {
        this.syncConfig = {
            // Select which categories to sync to store
            enabledCategories: [
                'Hand Dryers',
                'Heat Pumps', 
                'Lighting',
                'Professional Foodservice Equipment',
                'Heating, Ventilation and Air Conditioning (HVAC) Equipment'
            ],
            maxProductsPerCategory: 10, // Limit products per category
            minEnergyRating: 'A+', // Only high efficiency products
            excludeSources: ['Sample'], // Don't sync sample products
            addImages: false // ETL doesn't provide images
        };
    }

    // Get products ready for store sync
    async getStoreProducts() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    id,
                    name,
                    category,
                    subcategory,
                    brand,
                    power,
                    energy_rating,
                    running_cost_per_year,
                    source,
                    model_number,
                    sku
                FROM products 
                WHERE subcategory IN (${this.syncConfig.enabledCategories.map(() => '?').join(',')})
                AND energy_rating >= ?
                AND source NOT IN (${this.syncConfig.excludeSources.map(() => '?').join(',')})
                ORDER BY subcategory, energy_rating DESC, running_cost_per_year ASC
            `;
            
            const params = [
                ...this.syncConfig.enabledCategories,
                this.syncConfig.minEnergyRating,
                ...this.syncConfig.excludeSources
            ];
            
            db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    // Group by category and limit products per category
                    const groupedProducts = this.groupAndLimitProducts(rows);
                    resolve(groupedProducts);
                }
            });
        });
    }

    // Group products by category and limit per category
    groupAndLimitProducts(products) {
        const grouped = {};
        
        products.forEach(product => {
            if (!grouped[product.subcategory]) {
                grouped[product.subcategory] = [];
            }
            
            if (grouped[product.subcategory].length < this.syncConfig.maxProductsPerCategory) {
                grouped[product.subcategory].push(product);
            }
        });
        
        return grouped;
    }

    // Generate Wix product data format
    generateWixProductData(products) {
        const wixProducts = [];
        
        Object.entries(products).forEach(([category, categoryProducts]) => {
            categoryProducts.forEach(product => {
                wixProducts.push({
                    // Wix product structure
                    name: product.name,
                    description: this.generateProductDescription(product),
                    sku: product.sku || product.id,
                    price: this.calculateProductPrice(product),
                    category: this.mapToWixCategory(category),
                    customFields: {
                        power: product.power,
                        energyRating: product.energy_rating,
                        annualCost: product.running_cost_per_year,
                        brand: product.brand,
                        model: product.model_number || product.id,
                        source: product.source
                    },
                    tags: [
                        'Energy Efficient',
                        product.energy_rating,
                        product.brand,
                        category
                    ],
                    // Note: Images need to be added manually
                    images: [], // You'll need to add these manually
                    inventory: {
                        trackQuantity: false,
                        quantity: 999 // Set as available
                    }
                });
            });
        });
        
        return wixProducts;
    }

    // Generate product description
    generateProductDescription(product) {
        return `Energy-efficient ${product.subcategory} by ${product.brand}. 
        
Power: ${product.power}W
Energy Rating: ${product.energy_rating}
Annual Running Cost: €${product.running_cost_per_year}

This product is ETL certified for energy efficiency and is perfect for businesses looking to reduce their energy costs while maintaining high performance.`;
    }

    // Calculate product price (you can customize this logic)
    calculateProductPrice(product) {
        // Base price on power consumption and energy rating
        let basePrice = 100; // Base price
        
        // Adjust for power consumption
        if (product.power > 1000) basePrice += 200;
        else if (product.power > 500) basePrice += 100;
        else if (product.power > 100) basePrice += 50;
        
        // Adjust for energy rating
        if (product.energy_rating === 'A+++') basePrice += 100;
        else if (product.energy_rating === 'A++') basePrice += 50;
        else if (product.energy_rating === 'A+') basePrice += 25;
        
        return Math.round(basePrice);
    }

    // Map categories to Wix store categories
    mapToWixCategory(category) {
        const categoryMap = {
            'Hand Dryers': 'Bathroom Equipment',
            'Heat Pumps': 'Heating & Cooling',
            'Lighting': 'Lighting',
            'Professional Foodservice Equipment': 'Restaurant Equipment',
            'Heating, Ventilation and Air Conditioning (HVAC) Equipment': 'HVAC'
        };
        
        return categoryMap[category] || 'Energy Efficiency';
    }

    // Check for duplicates (by SKU/ID)
    async checkForDuplicates(products) {
        return new Promise((resolve, reject) => {
            const skus = products.map(p => p.sku || p.id);
            const placeholders = skus.map(() => '?').join(',');
            
            const sql = `SELECT sku, id FROM products WHERE id IN (${placeholders})`;
            
            db.all(sql, skus, (err, existing) => {
                if (err) {
                    reject(err);
                } else {
                    const existingSkus = new Set(existing.map(p => p.sku || p.id));
                    const duplicates = products.filter(p => existingSkus.has(p.sku || p.id));
                    resolve(duplicates);
                }
            });
        });
    }

    // Show sync preview
    async showSyncPreview() {
        console.log('🛒 WIX STORE SYNC PREVIEW\n');
        
        const products = await this.getStoreProducts();
        const totalProducts = Object.values(products).flat().length;
        
        console.log('📋 Sync Configuration:');
        console.log(`   Categories: ${this.syncConfig.enabledCategories.join(', ')}`);
        console.log(`   Max per category: ${this.syncConfig.maxProductsPerCategory}`);
        console.log(`   Min energy rating: ${this.syncConfig.minEnergyRating}`);
        console.log(`   Total products to sync: ${totalProducts}\n`);
        
        console.log('📦 Products by Category:');
        Object.entries(products).forEach(([category, categoryProducts]) => {
            console.log(`   ${category}: ${categoryProducts.length} products`);
            categoryProducts.slice(0, 3).forEach(product => {
                console.log(`     - ${product.name} (${product.energy_rating}, €${this.calculateProductPrice(product)})`);
            });
            if (categoryProducts.length > 3) {
                console.log(`     ... and ${categoryProducts.length - 3} more`);
            }
            console.log('');
        });
        
        // Generate Wix format
        const wixProducts = this.generateWixProductData(products);
        console.log('🎯 Wix Product Format Sample:');
        console.log(JSON.stringify(wixProducts[0], null, 2));
        
        return { products, wixProducts, totalProducts };
    }
}

// Test the store sync
async function testStoreSync() {
    const sync = new WixStoreSync();
    
    try {
        const result = await sync.showSyncPreview();
        
        console.log('\n💡 Next Steps:');
        console.log('1. Customize syncConfig.enabledCategories to select which categories to sync');
        console.log('2. Adjust maxProductsPerCategory to control how many products per category');
        console.log('3. Add product images manually to your Wix store');
        console.log('4. Use the generated wixProducts data to create products in Wix');
        
        console.log('\n🖼️  Image Requirements:');
        console.log('   - ETL API does not provide product images');
        console.log('   - You will need to add images manually in Wix');
        console.log('   - Consider using generic category images or manufacturer websites');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        db.close();
    }
}

testStoreSync();















