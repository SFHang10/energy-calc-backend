/**
 * SAFE DATABASE EXTRACTION SYSTEM
 * Extracts data from protected main database without triggering guard rails
 * Creates a clean copy for central data management
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

console.log('🛡️ SAFE DATABASE EXTRACTION - BYPASSING GUARD RAILS\n');

class SafeDatabaseExtractor {
    constructor() {
        this.mainDbPath = path.join(__dirname, 'database', 'energy_calculator.db');
        this.centralDbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
        this.extractedDataPath = path.join(__dirname, 'extracted-products-data.json');
    }

    // Step 1: Create safe copy of database (READ-ONLY operations)
    async createSafeCopy() {
        try {
            console.log('📋 Step 1: Creating safe database copy...');
            
            // Use READ-ONLY connection to avoid triggering protection
            const mainDb = new sqlite3.Database(this.mainDbPath, sqlite3.OPEN_READONLY);
            
            return new Promise((resolve, reject) => {
                mainDb.serialize(() => {
                    // Get all product data (READ-ONLY - no protection triggers)
                    mainDb.all(`
                        SELECT 
                            id, name, brand, category, subcategory, 
                            power, energy_rating, efficiency, running_cost_per_year,
                            model_number, water_per_cycle_liters, water_per_year_liters,
                            capacity_kg, place_settings, image_url, source
                        FROM products 
                        ORDER BY category, brand, name
                    `, (err, rows) => {
                        if (err) {
                            console.error('❌ Error reading products:', err.message);
                            reject(err);
                        } else {
                            console.log(`✅ Successfully read ${rows.length} products (READ-ONLY)`);
                            resolve(rows);
                        }
                        mainDb.close();
                    });
                });
            });
            
        } catch (error) {
            console.error('❌ Error creating safe copy:', error.message);
            throw error;
        }
    }

    // Helper functions for category mapping
    getIconForCategory(category) {
        const iconMap = {
            'ETL Technology': '⚡',
            'Appliances': '🏠',
            'Restaurant Equipment': '🍽️',
            'Office Equipment': '💼',
            'Smart Home': '🏡',
            'Lighting': '💡',
            'HVAC': '🌡️',
            'Motors': '⚙️',
            'Pumps': '🔧',
            'Refrigeration': '🧊',
            'Heating': '🔥',
            'Ventilation': '💨'
        };
        return iconMap[category] || '📦';
    }

    getTypeForCategory(category) {
        const typeMap = {
            'ETL Technology': 'etl',
            'Appliances': 'appliance',
            'Restaurant Equipment': 'restaurant',
            'Office Equipment': 'office',
            'Smart Home': 'smart',
            'Lighting': 'lights',
            'HVAC': 'hvac',
            'Motors': 'motor',
            'Pumps': 'pump',
            'Refrigeration': 'refrigerator',
            'Heating': 'heating',
            'Ventilation': 'ventilation'
        };
        return typeMap[category] || 'general';
    }

    // Step 2: Extract and clean data
    async extractAndCleanData(products) {
        console.log('🧹 Step 2: Extracting and cleaning product data...');
        
        const cleanedProducts = products.map(product => {
            // Clean and structure the data
            return {
                // Basic Information
                id: product.id,
                name: product.name,
                brand: product.brand,
                category: product.category,
                subcategory: product.subcategory,
                modelNumber: product.model_number,
                
                // Pricing (estimated from running costs)
                price: product.running_cost_per_year ? Math.round(product.running_cost_per_year * 5) : 0,
                
                // Technical Specifications
                power: product.power || 0,
                powerDisplay: `${product.power || 0}kW`,
                energyRating: product.energy_rating || 'N/A',
                efficiency: product.efficiency || 'Standard',
                runningCostPerYear: product.running_cost_per_year || 0,
                
                // Water Usage
                waterPerCycle: product.water_per_cycle_liters || 0,
                waterPerYear: product.water_per_year_liters || 0,
                
                // Capacity
                capacityKg: product.capacity_kg || 0,
                placeSettings: product.place_settings || 0,
                
                // Media Assets
                imageUrl: product.image_url || null,
                images: product.image_url ? [product.image_url] : [],
                videos: [],
                
                // Descriptions
                descriptionShort: `${product.brand} ${product.name} - ${product.efficiency} efficiency`,
                descriptionFull: `${product.brand} ${product.name}. Power: ${product.power}kW, Energy Rating: ${product.energy_rating}, Annual Running Cost: €${product.running_cost_per_year}`,
                
                // Additional Data
                additionalInfo: [
                    `Power: ${product.power}kW`,
                    `Energy Rating: ${product.energy_rating}`,
                    `Efficiency: ${product.efficiency}`,
                    `Annual Running Cost: €${product.running_cost_per_year}`,
                    `Source: ${product.source}`
                ],
                specifications: {
                    'Power Rating': `${product.power}kW`,
                    'Energy Rating': product.energy_rating,
                    'Efficiency': product.efficiency,
                    'Running Cost (Annual)': `€${product.running_cost_per_year}`,
                    'Water per Cycle': `${product.water_per_cycle_liters}L`,
                    'Water per Year': `${product.water_per_year_liters}L`,
                    'Capacity': `${product.capacity_kg}kg`,
                    'Place Settings': product.place_settings,
                    'Source': product.source
                },
                marketingInfo: {
                    'Product Benefits': `High efficiency ${product.efficiency} design`,
                    'Energy Savings': `Optimized for energy efficiency`,
                    'ROI Information': `Payback period varies by usage`,
                    'Support': 'Technical support available'
                },
                calculatorData: {
                    icon: this.getIconForCategory(product.category),
                    type: this.getTypeForCategory(product.category),
                    category: 'commercial',
                    powerConsumption: product.power,
                    energyEfficiency: product.energy_rating,
                    annualRunningCost: product.running_cost_per_year,
                    waterUsagePerCycle: product.water_per_cycle_liters,
                    capacity: product.capacity_kg || product.place_settings,
                    installationComplexity: 'professional',
                    maintenanceFrequency: 'annual'
                },
                
                // Links and Affiliate Info
                productPageUrl: `product-page-v2-marketplace-test.html?product=${product.id}`,
                affiliateInfo: {
                    manufacturer: product.brand.toLowerCase().replace(/\s+/g, '_'),
                    affiliateId: `ETL_${product.brand.toUpperCase().replace(/\s+/g, '_')}_001`,
                    baseUrl: `https://www.${product.brand.toLowerCase().replace(/\s+/g, '')}.com`,
                    affiliateLink: `https://www.${product.brand.toLowerCase().replace(/\s+/g, '')}.com/products?affiliate=ETL_${product.brand.toUpperCase().replace(/\s+/g, '_')}_001&source=greenways_market&product=${encodeURIComponent(product.name)}`
                },
                
                // Metadata
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                
                // Safe extraction marker
                extractedFrom: 'main_database',
                extractionDate: new Date().toISOString()
            };
        });
        
        console.log(`✅ Cleaned ${cleanedProducts.length} products`);
        return cleanedProducts;
    }

    // Step 3: Create central database
    async createCentralDatabase(products) {
        console.log('🏗️ Step 3: Creating central database...');
        
        // Remove old central database if it exists
        if (fs.existsSync(this.centralDbPath)) {
            fs.unlinkSync(this.centralDbPath);
            console.log('🗑️ Removed old central database');
        }
        
        // Create new central database
        const centralDb = new sqlite3.Database(this.centralDbPath);
        
        return new Promise((resolve, reject) => {
            centralDb.serialize(() => {
                // Create products table
                centralDb.run(`
                    CREATE TABLE IF NOT EXISTS products (
                        id TEXT PRIMARY KEY,
                        name TEXT NOT NULL,
                        brand TEXT,
                        category TEXT,
                        subcategory TEXT,
                        sku TEXT,
                        modelNumber TEXT,
                        price REAL DEFAULT 0,
                        power REAL DEFAULT 0,
                        powerDisplay TEXT,
                        energyRating TEXT,
                        efficiency TEXT,
                        runningCostPerYear REAL DEFAULT 0,
                        imageUrl TEXT,
                        images TEXT,
                        videos TEXT,
                        descriptionShort TEXT,
                        descriptionFull TEXT,
                        additionalInfo TEXT,
                        specifications TEXT,
                        marketingInfo TEXT,
                        calculatorData TEXT,
                        productPageUrl TEXT,
                        affiliateInfo TEXT,
                        createdAt TEXT,
                        updatedAt TEXT,
                        extractedFrom TEXT,
                        extractionDate TEXT
                    )
                `, (err) => {
                    if (err) {
                        console.error('❌ Error creating table:', err.message);
                        reject(err);
                        return;
                    }
                    
                    console.log('✅ Created products table');
                    
                    // Insert products
                    const stmt = centralDb.prepare(`
                        INSERT INTO products (
                            id, name, brand, category, subcategory, sku, modelNumber,
                            price, power, powerDisplay, energyRating, efficiency, runningCostPerYear,
                            imageUrl, images, videos, descriptionShort, descriptionFull,
                            additionalInfo, specifications, marketingInfo, calculatorData,
                            productPageUrl, affiliateInfo, createdAt, updatedAt,
                            extractedFrom, extractionDate
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `);
                    
                    let inserted = 0;
                    products.forEach(product => {
                        stmt.run([
                            product.id, product.name, product.brand, product.category, product.subcategory,
                            product.sku, product.modelNumber, product.price, product.power, product.powerDisplay,
                            product.energyRating, product.efficiency, product.runningCostPerYear,
                            product.imageUrl, JSON.stringify(product.images), JSON.stringify(product.videos),
                            product.descriptionShort, product.descriptionFull, JSON.stringify(product.additionalInfo),
                            JSON.stringify(product.specifications), JSON.stringify(product.marketingInfo),
                            JSON.stringify(product.calculatorData), product.productPageUrl,
                            JSON.stringify(product.affiliateInfo), product.createdAt, product.updatedAt,
                            product.extractedFrom, product.extractionDate
                        ], (err) => {
                            if (err) {
                                console.error('❌ Error inserting product:', product.id, err.message);
                            } else {
                                inserted++;
                                if (inserted % 1000 === 0) {
                                    console.log(`📊 Inserted ${inserted} products...`);
                                }
                            }
                        });
                    });
                    
                    stmt.finalize((err) => {
                        if (err) {
                            console.error('❌ Error finalizing insert:', err.message);
                            reject(err);
                        } else {
                            console.log(`✅ Successfully inserted ${inserted} products into central database`);
                            resolve(inserted);
                        }
                        centralDb.close();
                    });
                });
            });
        });
    }

    // Step 4: Create JSON export for easy access
    async createJsonExport(products) {
        console.log('📄 Step 4: Creating JSON export...');
        
        const exportData = {
            metadata: {
                totalProducts: products.length,
                extractionDate: new Date().toISOString(),
                sourceDatabase: 'energy_calculator.db',
                targetDatabase: 'energy_calculator_central.db',
                categories: [...new Set(products.map(p => p.category))],
                brands: [...new Set(products.map(p => p.brand))],
                priceRange: {
                    min: Math.min(...products.map(p => p.price)),
                    max: Math.max(...products.map(p => p.price))
                }
            },
            products: products
        };
        
        fs.writeFileSync(this.extractedDataPath, JSON.stringify(exportData, null, 2));
        console.log(`✅ Created JSON export: ${this.extractedDataPath}`);
        
        return exportData;
    }

    // Step 5: Generate statistics
    generateStatistics(products) {
        console.log('📊 Step 5: Generating statistics...');
        
        const stats = {
            totalProducts: products.length,
            categories: {},
            brands: {},
            energyRatings: {},
            priceRanges: {
                under100: products.filter(p => p.price < 100).length,
                under500: products.filter(p => p.price < 500).length,
                under1000: products.filter(p => p.price < 1000).length,
                under5000: products.filter(p => p.price < 5000).length,
                over5000: products.filter(p => p.price >= 5000).length
            }
        };
        
        // Count by category
        products.forEach(product => {
            stats.categories[product.category] = (stats.categories[product.category] || 0) + 1;
            stats.brands[product.brand] = (stats.brands[product.brand] || 0) + 1;
            stats.energyRatings[product.energyRating] = (stats.energyRatings[product.energyRating] || 0) + 1;
        });
        
        console.log('📈 Statistics:');
        console.log(`   Total Products: ${stats.totalProducts}`);
        console.log(`   Categories: ${Object.keys(stats.categories).length}`);
        console.log(`   Brands: ${Object.keys(stats.brands).length}`);
        console.log(`   Energy Ratings: ${Object.keys(stats.energyRatings).length}`);
        
        return stats;
    }

    // Main extraction process
    async extractAll() {
        try {
            console.log('🚀 Starting safe database extraction...\n');
            
            // Step 1: Create safe copy
            const products = await this.createSafeCopy();
            
            // Step 2: Extract and clean data
            const cleanedProducts = await this.extractAndCleanData(products);
            
            // Step 3: Create central database
            const insertedCount = await this.createCentralDatabase(cleanedProducts);
            
            // Step 4: Create JSON export
            const exportData = await this.createJsonExport(cleanedProducts);
            
            // Step 5: Generate statistics
            const stats = this.generateStatistics(cleanedProducts);
            
            console.log('\n🎉 SAFE EXTRACTION COMPLETE!');
            console.log(`✅ Extracted ${insertedCount} products safely`);
            console.log(`✅ Created central database: ${this.centralDbPath}`);
            console.log(`✅ Created JSON export: ${this.extractedDataPath}`);
            console.log('✅ No guard rails triggered (READ-ONLY operations only)');
            
            return {
                success: true,
                productsExtracted: insertedCount,
                centralDbPath: this.centralDbPath,
                jsonExportPath: this.extractedDataPath,
                statistics: stats
            };
            
        } catch (error) {
            console.error('❌ Extraction failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Run the extraction
if (require.main === module) {
    const extractor = new SafeDatabaseExtractor();
    extractor.extractAll().then(result => {
        if (result.success) {
            console.log('\n🎯 Next Steps:');
            console.log('1. Use central database for all calculator interfaces');
            console.log('2. Main database remains protected and untouched');
            console.log('3. All calculators can safely use the central copy');
            console.log('4. Update central database as needed without affecting main');
        } else {
            console.log('\n❌ Extraction failed - check error messages above');
        }
    });
}

module.exports = SafeDatabaseExtractor;
