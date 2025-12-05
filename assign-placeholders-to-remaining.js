const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');

console.log('\n🖼️ ASSIGNING PLACEHOLDER IMAGES TO REMAINING PRODUCTS');
console.log('='.repeat(70));
console.log('');

// Placeholder image mappings (same as apply-placeholder-images.js)
const placeholderMappings = [
    // Appliances
    {
        category: 'Appliances',
        image: 'Product Placement/Appliances.jpg',
        description: 'Appliances'
    },
    // Lighting
    {
        category: 'Lighting',
        image: 'Product Placement/Light.jpeg',
        description: 'Lighting'
    },
    // Smart Home
    {
        category: 'Smart Home',
        image: 'Product Placement/Smart Home. jpeg.jpeg',
        description: 'Smart Home'
    },
    // Motors
    {
        category: 'Motor',
        image: 'Product Placement/Motor.jpg',
        description: 'Motors'
    },
    // HVAC
    {
        category: 'ETL Technology',
        subcategory: 'Evapco Europe NV',
        image: 'Product Placement/HVAC1.jpeg',
        description: 'HVAC Equipment'
    },
    {
        category: 'ETL Technology',
        subcategory: 'Baltimore Aircoil Ltd.',
        image: 'Product Placement/HVAC1.jpeg',
        description: 'HVAC Systems'
    },
    // Heat Pumps
    {
        category: 'ETL Technology',
        subcategory: 'Heat Pumps',
        image: 'Product Placement/HeatPumps.jpg',
        description: 'Heat Pumps'
    },
    // Foodservice
    {
        category: 'Restaurant Equipment',
        image: 'Product Placement/Food Services.jpeg',
        description: 'Foodservice Equipment'
    },
    // Refrigeration
    {
        category: 'Restaurant Equipment',
        subcategory: 'Commercial Fridges',
        image: 'Product Placement/Cm Fridge.jpeg',
        description: 'Commercial Fridges'
    },
    {
        category: 'Restaurant Equipment',
        subcategory: 'Commercial Freezers',
        image: 'Product Placement/Cm Fridge.jpeg',
        description: 'Commercial Freezers'
    },
    // Generic fallback
    {
        category: null,
        image: 'Product Placement/Motor.jpg',
        description: 'Generic products'
    }
];

const db = new sqlite3.Database(dbPath);

// Find products without images
db.all(
    `SELECT id, name, category, subcategory 
     FROM products 
     WHERE image_url IS NULL 
     OR image_url = '' 
     OR image_url = 'null'`,
    (err, products) => {
        if (err) {
            console.error('❌ Database error:', err);
            db.close();
            return;
        }

        if (products.length === 0) {
            console.log('✅ All products already have images!\n');
            db.close();
            return;
        }

        console.log(`📊 Found ${products.length} products without images\n`);
        console.log('🔄 Assigning placeholders based on category...\n');

        let updated = 0;
        let processed = 0;

        // Process each product
        function processNext() {
            if (processed >= products.length) {
                // All done
                console.log('\n📊 RESULTS:');
                console.log(`   ✅ Updated: ${updated} products`);
                console.log(`   📊 Total processed: ${products.length} products\n`);

                // Verify final count
                db.all(
                    `SELECT COUNT(*) as total 
                     FROM products 
                     WHERE image_url IS NOT NULL 
                     AND image_url != '' 
                     AND image_url != 'null'`,
                    (err, result) => {
                        if (!err) {
                            console.log(`✅ Total products with images: ${result[0].total}`);
                        }

                        db.all(
                            `SELECT COUNT(*) as total 
                             FROM products 
                             WHERE image_url IS NULL 
                             OR image_url = '' 
                             OR image_url = 'null'`,
                            (err, remaining) => {
                                if (!err) {
                                    console.log(`❌ Products still without images: ${remaining[0].total}\n`);
                                    
                                    if (remaining[0].total === 0) {
                                        console.log('🎉 SUCCESS! All products now have placeholder images!\n');
                                    }
                                }

                                db.close();
                            }
                        );
                    }
                );
                return;
            }

            const product = products[processed];
            
            // Find matching placeholder
            let placeholder = null;
            
            for (const mapping of placeholderMappings) {
                const categoryMatch = !mapping.category || product.category === mapping.category;
                const subcategoryMatch = !mapping.subcategory || product.subcategory === mapping.subcategory;
                
                if (categoryMatch && subcategoryMatch) {
                    placeholder = mapping.image;
                    break;
                }
            }

            // Use fallback if no match
            if (!placeholder) {
                placeholder = 'Product Placement/Motor.jpg'; // Generic fallback
            }

            // Update product
            db.run(
                `UPDATE products 
                 SET image_url = ? 
                 WHERE id = ?`,
                [placeholder, product.id],
                (err) => {
                    if (err) {
                        console.error(`❌ Error updating ${product.id}:`, err);
                    } else {
                        updated++;
                        if (processed < 10) {
                            console.log(`   ✅ ${product.id}: ${product.name.substring(0, 50)}...`);
                            console.log(`      Category: ${product.category || 'Unknown'}`);
                            console.log(`      Placeholder: ${placeholder}`);
                        }
                    }

                    processed++;
                    processNext();
                }
            );
        }

        // Start processing
        processNext();
    }
);







