const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔄 Adding ETL products to database...\n');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

// ETL products based on your etl-wix.js route
const etlProducts = [
    // Hand Dryers
    { id: 'etl_handdryer_1', name: 'ETL Certified Hand Dryer - High Speed', category: 'Appliances', subcategory: 'Hand Dryers', power: 1200, energyRating: 'A+', manufacturer: 'ETL Certified', source: 'ETL', technologyName: 'Hand Dryers' },
    { id: 'etl_handdryer_2', name: 'ETL Certified Hand Dryer - Energy Efficient', category: 'Appliances', subcategory: 'Hand Dryers', power: 800, energyRating: 'A++', manufacturer: 'ETL Certified', source: 'ETL', technologyName: 'Hand Dryers' },
    
    // Heat Pumps
    { id: 'etl_heatpump_1', name: 'ETL Certified Air Source Heat Pump 8kW', category: 'Heating', subcategory: 'Heat Pumps', power: 8000, energyRating: 'A+', manufacturer: 'ETL Certified', source: 'ETL', technologyName: 'Heat Pumps' },
    { id: 'etl_heatpump_2', name: 'ETL Certified Ground Source Heat Pump 12kW', category: 'Heating', subcategory: 'Heat Pumps', power: 12000, energyRating: 'A++', manufacturer: 'ETL Certified', source: 'ETL', technologyName: 'Heat Pumps' },
    
    // HVAC Equipment
    { id: 'etl_hvac_1', name: 'ETL Certified HVAC Unit - Commercial', category: 'Heating', subcategory: 'HVAC Equipment', power: 15000, energyRating: 'A+', manufacturer: 'ETL Certified', source: 'ETL', technologyName: 'HVAC Equipment' },
    { id: 'etl_hvac_2', name: 'ETL Certified Ventilation System', category: 'Heating', subcategory: 'HVAC Equipment', power: 2000, energyRating: 'A+', manufacturer: 'ETL Certified', source: 'ETL', technologyName: 'HVAC Equipment' },
    
    // Lighting
    { id: 'etl_lighting_1', name: 'ETL Certified LED Panel 40W', category: 'Lighting', subcategory: 'LED Bulbs', power: 40, energyRating: 'A+', manufacturer: 'ETL Certified', source: 'ETL', technologyName: 'Lighting' },
    { id: 'etl_lighting_2', name: 'ETL Certified LED Tube 18W', category: 'Lighting', subcategory: 'LED Tubes', power: 18, energyRating: 'A++', manufacturer: 'ETL Certified', source: 'ETL', technologyName: 'Lighting' },
    
    // Professional Food Service Equipment (Restaurant Equipment)
    { id: 'etl_food_1', name: 'ETL Certified Commercial Oven - Electric', category: 'Restaurant Equipment', subcategory: 'Professional Food Service', power: 12000, energyRating: 'A+', manufacturer: 'ETL Certified', source: 'ETL', technologyName: 'Professional Foodservice Equipment' },
    { id: 'etl_food_2', name: 'ETL Certified Commercial Refrigerator', category: 'Restaurant Equipment', subcategory: 'Professional Food Service', power: 800, energyRating: 'A+', manufacturer: 'ETL Certified', source: 'ETL', technologyName: 'Professional Foodservice Equipment' },
    
    // Refrigeration Equipment
    { id: 'etl_refrigeration_1', name: 'ETL Certified Commercial Refrigeration Unit', category: 'Appliances', subcategory: 'Refrigerator Equipment', power: 1200, energyRating: 'A+', manufacturer: 'ETL Certified', source: 'ETL', technologyName: 'Refrigeration Equipment' },
    { id: 'etl_refrigeration_2', name: 'ETL Certified Energy Efficient Freezer', category: 'Appliances', subcategory: 'Refrigerator Equipment', power: 800, energyRating: 'A++', manufacturer: 'ETL Certified', source: 'ETL', technologyName: 'Refrigeration Equipment' },
    
    // Showers
    { id: 'etl_shower_1', name: 'ETL Certified Electric Shower 8.5kW', category: 'Appliances', subcategory: 'Showers', power: 8500, energyRating: 'A+', manufacturer: 'ETL Certified', source: 'ETL', technologyName: 'Showers' },
    { id: 'etl_shower_2', name: 'ETL Certified Water Saving Shower Head', category: 'Appliances', subcategory: 'Showers', power: 0, energyRating: 'A+', manufacturer: 'ETL Certified', source: 'ETL', technologyName: 'Showers' },
    
    // Wastewater Heat Recovery
    { id: 'etl_heatrecovery_1', name: 'ETL Certified Shower Heat Recovery Unit', category: 'Appliances', subcategory: 'Heat Recovery', power: 0, energyRating: 'A+', manufacturer: 'ETL Certified', source: 'ETL', technologyName: 'Wastewater Heat Recovery' },
    { id: 'etl_heatrecovery_2', name: 'ETL Certified Wastewater Heat Exchanger', category: 'Appliances', subcategory: 'Heat Recovery', power: 0, energyRating: 'A+', manufacturer: 'ETL Certified', source: 'ETL', technologyName: 'Wastewater Heat Recovery' }
];

// Helper function to calculate running cost
function calculateRunningCost(powerUsage) {
    const averageHoursPerDay = 8;
    const electricityRate = 0.15; // €0.15 per kWh
    const daysPerYear = 365;
    
    return (powerUsage / 1000) * averageHoursPerDay * electricityRate * daysPerYear;
}

// Add ETL products to database
function addETLProducts() {
    return new Promise((resolve, reject) => {
        console.log(`📥 Adding ${etlProducts.length} ETL products...`);
        
        const stmt = db.prepare(`
            INSERT INTO products (
                id, name, power, category, subcategory, brand, 
                running_cost_per_year, energy_rating, efficiency, source,
                water_per_cycle_liters, water_per_year_liters, capacity_kg, place_settings
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        let inserted = 0;
        const total = etlProducts.length;
        
        etlProducts.forEach((product, index) => {
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
                    console.log(`   ✅ Added: ${product.name} (${product.category})`);
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
}

// Run the addition
addETLProducts()
    .then((count) => {
        console.log(`\n🎉 ETL products addition completed! ${count} products added.`);
        
        // Verify final count
        db.get('SELECT COUNT(*) as total FROM products', (err, row) => {
            if (err) {
                console.error('Error verifying final count:', err);
            } else {
                console.log(`📊 Total products in database: ${row.total}`);
                
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
    })
    .catch((error) => {
        console.error('❌ ETL products addition failed:', error);
        db.close();
    });















