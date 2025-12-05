const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const axios = require('axios');

console.log('🔄 Fetching full ETL product set (50+ products)...\n');

// ETL API Configuration
const ETL_API_KEY = 'de6a4b7c-771e-4f22-9721-11f39763d794';
const ETL_BASE_URL = 'https://api.etl.energysecurity.gov.uk/api/v1';

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

// Helper function to calculate running cost
function calculateRunningCost(powerUsage) {
    const averageHoursPerDay = 8;
    const electricityRate = 0.15; // €0.15 per kWh
    const daysPerYear = 365;
    
    return (powerUsage / 1000) * averageHoursPerDay * electricityRate * daysPerYear;
}

// Helper function to extract power from product features
function extractPowerFromFeatures(features) {
    if (!features || !Array.isArray(features)) return 100; // Default power
    
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
        return isNaN(numValue) ? 100 : numValue;
    }
    
    return 100; // Default power
}

// Helper function to extract energy rating from features
function extractEnergyRatingFromFeatures(features) {
    if (!features || !Array.isArray(features)) return 'A+';
    
    const ratingFeature = features.find(f => 
        f.name && (
            f.name.toLowerCase().includes('rating') ||
            f.name.toLowerCase().includes('efficiency') ||
            f.name.toLowerCase().includes('energy')
        )
    );
    
    return ratingFeature ? ratingFeature.value : 'A+';
}

// Target technologies with higher limits to get more products
const targetTechnologies = [
    { id: 9, name: 'Hand Dryers', category: 'Appliances', subcategory: 'Hand Dryers', limit: 8 },
    { id: 7, name: 'Heat Pumps', category: 'Heating', subcategory: 'Heat Pumps', limit: 8 },
    { id: 8, name: 'HVAC Equipment', category: 'Heating', subcategory: 'HVAC Equipment', limit: 8 },
    { id: 10, name: 'Lighting', category: 'Lighting', subcategory: 'LED Bulbs', limit: 8 },
    { id: 22, name: 'Professional Foodservice Equipment', category: 'Restaurant Equipment', subcategory: 'Professional Food Service', limit: 8 },
    { id: 14, name: 'Refrigeration Equipment', category: 'Appliances', subcategory: 'Refrigerator Equipment', limit: 8 },
    { id: 24, name: 'Showers', category: 'Appliances', subcategory: 'Showers', limit: 8 },
    { id: 20, name: 'Wastewater Heat Recovery', category: 'Appliances', subcategory: 'Heat Recovery', limit: 4 }
];

async function fetchETLProducts() {
    let allProducts = [];
    
    console.log('🌐 Fetching products from ETL API...');
    
    for (const tech of targetTechnologies) {
        try {
            console.log(`   Fetching ${tech.name} (limit: ${tech.limit})...`);
            
            const response = await axios.get(`${ETL_BASE_URL}/products`, {
                headers: {
                    'x-api-key': ETL_API_KEY,
                    'Content-Type': 'application/json'
                },
                params: {
                    size: tech.limit,
                    listingStatus: 'current',
                    technologyId: tech.id
                }
            });

            if (response.data.products && response.data.products.length > 0) {
                const techProducts = response.data.products.map(product => {
                    const power = extractPowerFromFeatures(product.features);
                    return {
                        id: `etl_${tech.id}_${product.id}`,
                        name: product.name || 'ETL Certified Product',
                        category: tech.category,
                        subcategory: tech.subcategory,
                        power: power,
                        energyRating: extractEnergyRatingFromFeatures(product.features),
                        manufacturer: product.manufacturer ? product.manufacturer.name : 'ETL Certified',
                        source: 'ETL',
                        technologyId: tech.id,
                        technologyName: tech.name,
                        description: product.description || `ETL Certified ${tech.name}`,
                        model: product.modelNumber || product.id,
                        sku: product.id
                    };
                });

                allProducts = [...allProducts, ...techProducts];
                console.log(`   ✅ Found ${techProducts.length} ${tech.name} products`);
            } else {
                console.log(`   ⚠️  No products found for ${tech.name}`);
            }
        } catch (error) {
            console.log(`   ❌ Error fetching ${tech.name}: ${error.message}`);
        }
    }
    
    console.log(`\n📊 Total ETL products fetched: ${allProducts.length}`);
    return allProducts;
}

async function addETLProductsToDatabase(products) {
    return new Promise((resolve, reject) => {
        console.log(`\n📥 Adding ${products.length} ETL products to database...`);
        
        // Clear existing ETL products first
        db.run('DELETE FROM products WHERE source = "ETL"', (err) => {
            if (err) {
                console.error('Error clearing existing ETL products:', err);
                reject(err);
                return;
            }
            
            console.log('✅ Cleared existing ETL products');
            
            const stmt = db.prepare(`
                INSERT INTO products (
                    id, name, power, category, subcategory, brand, 
                    running_cost_per_year, energy_rating, efficiency, source,
                    water_per_cycle_liters, water_per_year_liters, capacity_kg, place_settings
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            let inserted = 0;
            const total = products.length;
            
            products.forEach((product, index) => {
                const runningCost = calculateRunningCost(product.power);
                
                stmt.run([
                    product.id,
                    product.name,
                    product.power,
                    product.category,
                    product.subcategory,
                    product.manufacturer,
                    runningCost,
                    product.energyRating,
                    'High',
                    product.source,
                    0, // water_per_cycle_liters
                    0, // water_per_year_liters
                    null, // capacity_kg
                    null  // place_settings
                ], (err) => {
                    if (err) {
                        console.error(`Error inserting ETL product ${product.id}:`, err);
                    } else {
                        inserted++;
                        if (inserted % 5 === 0) {
                            console.log(`   ✅ Added ${inserted}/${total} products...`);
                        }
                    }
                    
                    if (index === total - 1) {
                        stmt.finalize((err) => {
                            if (err) {
                                console.error('Error finalizing statement:', err);
                                reject(err);
                            } else {
                                console.log(`\n✅ Successfully added ${inserted} ETL products!`);
                                resolve(inserted);
                            }
                        });
                    }
                });
            });
        });
    });
}

// Main execution
async function main() {
    try {
        const etlProducts = await fetchETLProducts();
        
        if (etlProducts.length === 0) {
            console.log('❌ No ETL products fetched. Check API connection.');
            db.close();
            return;
        }
        
        const inserted = await addETLProductsToDatabase(etlProducts);
        
        // Verify final count
        db.get('SELECT COUNT(*) as total FROM products', (err, row) => {
            if (err) {
                console.error('Error verifying final count:', err);
            } else {
                console.log(`\n📊 Total products in database: ${row.total}`);
                
                // Show breakdown by source
                db.all('SELECT source, COUNT(*) as count FROM products GROUP BY source', (err, rows) => {
                    if (err) {
                        console.error('Error getting breakdown:', err);
                    } else {
                        console.log('\n📈 Final breakdown by source:');
                        rows.forEach(row => {
                            console.log(`   ${row.source}: ${row.count} products`);
                        });
                    }
                    db.close();
                });
            }
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
        db.close();
    }
}

main();















