const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const axios = require('axios');

console.log('🚀 FETCHING ALL ETL PRODUCTS - UNLIMITED DATABASE\n');

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

// Get all available technologies first
async function getAllTechnologies() {
    try {
        console.log('🔍 Fetching all available technologies...');
        
        const response = await axios.get(`${ETL_BASE_URL}/technologies`, {
            headers: {
                'x-api-key': ETL_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        const technologies = response.data.technologies || [];
        console.log(`✅ Found ${technologies.length} technologies available`);
        
        return technologies;
    } catch (error) {
        console.error('❌ Error fetching technologies:', error.message);
        return [];
    }
}

// Fetch ALL products for a specific technology
async function fetchAllProductsForTechnology(tech, maxProducts = 1000) {
    let allProducts = [];
    let offset = 0;
    const pageSize = 50; // ETL API max per request
    
    try {
        console.log(`   📥 Fetching ALL products for ${tech.name}...`);
        
        while (allProducts.length < maxProducts) {
            const response = await axios.get(`${ETL_BASE_URL}/products`, {
                headers: {
                    'x-api-key': ETL_API_KEY,
                    'Content-Type': 'application/json'
                },
                params: {
                    size: pageSize,
                    offset: offset,
                    listingStatus: 'current',
                    technologyId: tech.id
                }
            });
            
            const products = response.data.products || [];
            
            if (products.length === 0) {
                console.log(`   ✅ No more products for ${tech.name} (fetched ${allProducts.length})`);
                break;
            }
            
            const techProducts = products.map(product => {
                const power = extractPowerFromFeatures(product.features);
                
                // Extract image URL (use first image if available)
                let imageUrl = null;
                if (product.images && product.images.length > 0) {
                    imageUrl = product.images[0].url || product.images[0].src || null;
                }
                
                return {
                    id: `etl_${tech.id}_${product.id}`,
                    name: product.name || 'ETL Certified Product',
                    category: mapTechnologyToCategory(tech.name),
                    subcategory: tech.name,
                    power: power,
                    energyRating: extractEnergyRatingFromFeatures(product.features),
                    manufacturer: product.manufacturer ? product.manufacturer.name : 'ETL Certified',
                    source: 'ETL',
                    technologyId: tech.id,
                    technologyName: tech.name,
                    description: product.description || `ETL Certified ${tech.name}`,
                    model: product.modelNumber || product.id,
                    sku: product.id,
                    imageUrl: imageUrl
                };
            });
            
            allProducts = [...allProducts, ...techProducts];
            offset += pageSize;
            
            console.log(`   📊 ${tech.name}: ${allProducts.length} products fetched so far...`);
            
            // Small delay to be respectful to the API
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`   ✅ ${tech.name}: Total ${allProducts.length} products`);
        return allProducts;
        
    } catch (error) {
        console.log(`   ❌ Error fetching ${tech.name}: ${error.message}`);
        return allProducts; // Return what we got so far
    }
}

// Map technology names to our categories
function mapTechnologyToCategory(techName) {
    const categoryMap = {
        'Hand Dryers': 'Appliances',
        'Heat Pumps': 'Heating',
        'HVAC Equipment': 'Heating',
        'Lighting': 'Lighting',
        'Professional Foodservice Equipment': 'Restaurant Equipment',
        'Refrigeration Equipment': 'Appliances',
        'Showers': 'Appliances',
        'Wastewater Heat Recovery': 'Appliances',
        'Refrigeration Compressors': 'Appliances',
        'Refrigerated Display Cabinets': 'Appliances',
        'Packaged Chillers': 'Appliances',
        'Air Cooled Condensing Units': 'Appliances',
        'Combination Steam Ovens': 'Restaurant Equipment',
        'Hood-Type Dishwashers': 'Restaurant Equipment',
        'Undercounter Dishwashers': 'Restaurant Equipment'
    };
    
    return categoryMap[techName] || 'Appliances';
}

// Add products to database
async function addProductsToDatabase(products) {
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
                    water_per_cycle_liters, water_per_year_liters, capacity_kg, place_settings, image_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            let inserted = 0;
            const total = products.length;
            
            products.forEach((product, index) => {
                const runningCost = calculateRunningCost(product.power);
                
                stmt.run([
                    product.id,
                    product.name,
                    product.category,
                    product.subcategory,
                    product.manufacturer,
                    product.power,
                    runningCost,
                    product.energyRating,
                    'High',
                    product.source,
                    0, // water_per_cycle_liters
                    0, // water_per_year_liters
                    null, // capacity_kg
                    null, // place_settings
                    product.imageUrl // image_url
                ], (err) => {
                    if (err) {
                        console.error(`Error inserting ETL product ${product.id}:`, err);
                    } else {
                        inserted++;
                        if (inserted % 100 === 0) {
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
        // Get all technologies
        const technologies = await getAllTechnologies();
        
        if (technologies.length === 0) {
            console.log('❌ No technologies found. Check API connection.');
            db.close();
            return;
        }
        
        // Fetch products for each technology
        let allProducts = [];
        
        for (const tech of technologies) {
            const techProducts = await fetchAllProductsForTechnology(tech, 1000); // Limit to 1000 per tech to avoid overwhelming
            allProducts = [...allProducts, ...techProducts];
            
            // Small delay between technologies
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        console.log(`\n📊 TOTAL ETL PRODUCTS FETCHED: ${allProducts.length}`);
        
        if (allProducts.length === 0) {
            console.log('❌ No ETL products fetched. Check API connection.');
            db.close();
            return;
        }
        
        // Add to database
        const inserted = await addProductsToDatabase(allProducts);
        
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









