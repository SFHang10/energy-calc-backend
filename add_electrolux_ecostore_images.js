const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Adding Electrolux ECO Store product images...');

// New Electrolux ECO Store products with their image URLs
const electroluxProducts = [
    {
        name: 'ECO Store HP by Electrolux Professional',
        brand: 'Electrolux',
        modelNumber: 'EJ4HBAAAAG',
        imageUrl: 'http://localhost:4000/product-images/ecostore%20HP%20%20by%20Electrolux%20Professional%20Model%20number%20EJ4HBAAAAG.jpeg'
    },
    {
        name: 'ECO Store HP by Electrolux Professional',
        brand: 'Electrolux',
        modelNumber: 'EJ2HBAAXXG',
        imageUrl: 'http://localhost:4000/product-images/ecostore%20HP%20%20by%20Electrolux%20Professional.Model%20number%20EJ2HBAAXXG.jpeg'
    },
    {
        name: 'ECO Store HP by Electrolux Professional',
        brand: 'Electrolux',
        modelNumber: 'EJ3HBAAAXG',
        imageUrl: 'http://localhost:4000/product-images/ecostore%20HP%20by%20Electrolux%20Professional%20Model%20number%20EJ3HBAAAXG%20.jpeg'
    },
    {
        name: 'ECO Store HP Premium by Electrolux Professional',
        brand: 'Electrolux',
        modelNumber: 'Premium',
        imageUrl: 'http://localhost:4000/product-images/ecostore%20HP%20Premium%20by%20Electrolux%20Professional.Jpeg'
    },
    {
        name: 'Electrolux Professional',
        brand: 'Electrolux',
        modelNumber: 'EJ2KBAAXXG',
        imageUrl: 'http://localhost:4000/product-images/Electrolux%20Professional%20Model%20number%20EJ2KBAAXXG.jpeg'
    }
];

// Function to update or insert product
function updateProduct(product) {
    return new Promise((resolve, reject) => {
        // First, try to find existing product by name and brand
        db.get(
            `SELECT id FROM products WHERE name LIKE ? AND brand = ?`,
            [`%${product.name}%`, product.brand],
            (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (row) {
                    // Update existing product
                    db.run(
                        `UPDATE products SET imageUrl = ? WHERE id = ?`,
                        [product.imageUrl, row.id],
                        function(err) {
                            if (err) {
                                reject(err);
                            } else {
                                console.log(`✅ Updated existing product: ${product.name} (${product.brand})`);
                                resolve();
                            }
                        }
                    );
                } else {
                    // Insert new product
                    const insertQuery = `
                        INSERT INTO products (
                            name, brand, modelNumber, imageUrl, category, 
                            power, energyRating, efficiency, runningCostPerYear,
                            descriptionShort, descriptionFull, createdAt, updatedAt
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
                    `;
                    
                    db.run(insertQuery, [
                        product.name,
                        product.brand,
                        product.modelNumber,
                        product.imageUrl,
                        'professional-foodservice',
                        1000, // Default power
                        'A+', // Default energy rating
                        'High', // Default efficiency
                        43.8, // Default running cost
                        `${product.brand} ${product.name} - High efficiency`,
                        `${product.brand} ${product.name}. Professional foodservice equipment with high energy efficiency.`,
                    ], function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            console.log(`✅ Added new product: ${product.name} (${product.brand})`);
                            resolve();
                        }
                    });
                }
            }
        );
    });
}

// Process all products
async function processProducts() {
    try {
        for (const product of electroluxProducts) {
            await updateProduct(product);
        }
        
        console.log('\n🎯 Electrolux ECO Store Products Status:');
        
        // Check final status
        db.all(`
            SELECT COUNT(*) as total,
                   SUM(CASE WHEN imageUrl IS NOT NULL AND imageUrl != '' THEN 1 ELSE 0 END) as with_images
            FROM products 
            WHERE brand = 'Electrolux' AND category = 'professional-foodservice'
        `, (err, rows) => {
            if (err) {
                console.error('❌ Error checking status:', err);
            } else {
                const stats = rows[0];
                console.log(`   Total Electrolux products: ${stats.total}`);
                console.log(`   Products with images: ${stats.with_images}`);
                console.log(`   Products without images: ${stats.total - stats.with_images}`);
            }
            
            db.close();
            console.log('\n✅ SUCCESS! Electrolux ECO Store images have been added.');
            console.log('   Test: http://localhost:4000/category-product-page.html?category=professional-foodservice');
        });
        
    } catch (error) {
        console.error('❌ Error processing products:', error);
        db.close();
    }
}

processProducts();
