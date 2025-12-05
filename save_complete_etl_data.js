const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const ETL_API_KEY = 'de6a4b7c-771e-4f22-9721-11f39763d794';
const ETL_BASE_URL = 'https://api.etl.energysecurity.gov.uk/api/v1';

const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

console.log('💾 Saving Complete ETL Data to Database...\n');

async function saveAllProductsToDatabase() {
    try {
        let allProducts = [];
        let page = 0;
        let hasMorePages = true;
        
        console.log('📡 Fetching all products...');
        
        while (hasMorePages) {
            const response = await axios.get(`${ETL_BASE_URL}/products`, {
                headers: { 'x-api-key': ETL_API_KEY },
                params: {
                    page: page,
                    size: 200,
                    listingStatus: 'current'
                }
            });
            
            const products = response.data.products;
            allProducts = allProducts.concat(products);
            
            const totalPages = response.data.page.totalPages;
            hasMorePages = page < totalPages - 1;
            page++;
            
            console.log(`   ✅ Fetched page ${page}/${totalPages} (${products.length} products)`);
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`\n🎯 Total products fetched: ${allProducts.length}`);
        
        // Clear existing ETL products
        console.log('🗑️  Clearing existing ETL products...');
        db.run('DELETE FROM products WHERE source = "ETL"', (err) => {
            if (err) {
                console.error('Error clearing existing products:', err);
                return;
            }
            
            console.log('✅ Cleared existing ETL products');
            
            // Prepare insert statement
            const stmt = db.prepare(`
                INSERT INTO products (
                    id, name, power, category, subcategory, brand,
                    running_cost_per_year, energy_rating, efficiency, source,
                    water_per_cycle_liters, water_per_year_liters, capacity_kg, place_settings, image_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            console.log('💾 Saving products to database...');
            
            let savedCount = 0;
            let errorCount = 0;
            
            allProducts.forEach((product, index) => {
                // Extract image URL (use first image if available)
                let imageUrl = null;
                if (product.images && product.images.length > 0) {
                    imageUrl = product.images[0].url || product.images[0].src || null;
                }
                
                // Extract power from features
                let power = 'Unknown';
                if (product.features) {
                    const powerFeature = product.features.find(f => 
                        f.name.toLowerCase().includes('power') || 
                        f.name.toLowerCase().includes('consumption') ||
                        f.name.toLowerCase().includes('rating')
                    );
                    if (powerFeature) {
                        power = powerFeature.value || powerFeature.numericValue || 'Unknown';
                    }
                }
                
                // Extract energy rating
                let energyRating = 'Unknown';
                if (product.features) {
                    const ratingFeature = product.features.find(f => 
                        f.name.toLowerCase().includes('rating') || 
                        f.name.toLowerCase().includes('efficiency')
                    );
                    if (ratingFeature) {
                        energyRating = ratingFeature.value || ratingFeature.numericValue || 'Unknown';
                    }
                }
                
                const productData = {
                    id: `etl_${product.technologyId}_${product.id}`,
                    name: product.name || 'ETL Product',
                    power: power,
                    category: 'ETL Technology', // We'll get the actual technology name later
                    subcategory: product.manufacturer.name || 'ETL Manufacturer',
                    brand: product.manufacturer.name || 'ETL Manufacturer',
                    running_cost_per_year: 0,
                    energy_rating: energyRating,
                    efficiency: 'High',
                    source: 'ETL',
                    water_per_cycle_liters: 0,
                    water_per_year_liters: 0,
                    capacity_kg: null,
                    place_settings: null,
                    image_url: imageUrl
                };
                
                stmt.run([
                    productData.id,
                    productData.name,
                    productData.power,
                    productData.category,
                    productData.subcategory,
                    productData.brand,
                    productData.running_cost_per_year,
                    productData.energy_rating,
                    productData.efficiency,
                    productData.source,
                    productData.water_per_cycle_liters,
                    productData.water_per_year_liters,
                    productData.capacity_kg,
                    productData.place_settings,
                    productData.image_url
                ], (err) => {
                    if (err) {
                        errorCount++;
                        if (errorCount < 10) { // Only show first 10 errors
                            console.error(`Error saving product ${product.name}:`, err.message);
                        }
                    } else {
                        savedCount++;
                    }
                    
                    if (savedCount + errorCount === allProducts.length) {
                        console.log(`\n✅ Database save complete!`);
                        console.log(`📊 Saved: ${savedCount} products`);
                        console.log(`❌ Errors: ${errorCount} products`);
                        console.log(`🖼️  Products with images: ${allProducts.filter(p => p.images && p.images.length > 0).length}`);
                        
                        stmt.finalize();
                        db.close();
                    }
                });
            });
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        db.close();
    }
}

// Run the save
saveAllProductsToDatabase();






