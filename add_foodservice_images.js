const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const db = new sqlite3.Database('database/energy_calculator.db');

console.log('🖼️ Adding Professional Foodservice Equipment images to database...\n');

// Define image mappings for products
const imageMappings = [
    {
        productName: 'Bosch Dishwasher',
        brand: 'Bosch',
        images: [
            'C:\\Users\\steph\\Documents\\energy-cal-backend\\Equipment Pictures\\Bosch Dishwasher\\1575647053-bosch-300-series-1540395474.jpeg',
            'C:\\Users\\steph\\Documents\\energy-cal-backend\\Equipment Pictures\\Bosch Dishwasher\\Bosch SHE3AR75UC-2.jpeg'
        ]
    },
    {
        productName: 'Bosch HBL8453UC 30" Single Wall Oven',
        brand: 'Bosch',
        images: [
            'C:\\Users\\steph\\Documents\\energy-cal-backend\\Equipment Pictures\\Bosch Single Wall Oven\\1-1-download.jpeg',
            'C:\\Users\\steph\\Documents\\energy-cal-backend\\Equipment Pictures\\Bosch Single Wall Oven\\1-2550x544.jpg',
            'C:\\Users\\steph\\Documents\\energy-cal-backend\\Equipment Pictures\\Bosch Single Wall Oven\\124x121.jpg',
            'C:\\Users\\steph\\Documents\\energy-cal-backend\\Equipment Pictures\\Bosch Single Wall Oven\\124x69 (1).jpg',
            'C:\\Users\\steph\\Documents\\energy-cal-backend\\Equipment Pictures\\Bosch Single Wall Oven\\124x69.jpg',
            'C:\\Users\\steph\\Documents\\energy-cal-backend\\Equipment Pictures\\Bosch Single Wall Oven\\398x840.jpg'
        ]
    }
];

async function addImagesToDatabase() {
    try {
        for (const mapping of imageMappings) {
            console.log(`🔄 Processing ${mapping.productName}...`);
            
            // Find the product in database
            const product = await new Promise((resolve, reject) => {
                db.get(
                    'SELECT id, name, brand FROM products WHERE name = ? AND brand = ?',
                    [mapping.productName, mapping.brand],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                );
            });
            
            if (!product) {
                console.log(`❌ Product not found: ${mapping.productName}`);
                continue;
            }
            
            console.log(`✅ Found product: ${product.name} (ID: ${product.id})`);
            
            // Check which images exist
            const existingImages = mapping.images.filter(imagePath => {
                const exists = fs.existsSync(imagePath);
                if (!exists) {
                    console.log(`⚠️ Image not found: ${path.basename(imagePath)}`);
                }
                return exists;
            });
            
            if (existingImages.length === 0) {
                console.log(`❌ No valid images found for ${mapping.productName}`);
                continue;
            }
            
            // Use the first valid image as the primary image
            const primaryImage = existingImages[0];
            const imageUrl = `file:///${primaryImage.replace(/\\/g, '/')}`;
            
            console.log(`📸 Setting primary image: ${path.basename(primaryImage)}`);
            
            // Update the database
            await new Promise((resolve, reject) => {
                db.run(
                    'UPDATE products SET image_url = ? WHERE id = ?',
                    [imageUrl, product.id],
                    function(err) {
                        if (err) reject(err);
                        else {
                            console.log(`✅ Updated ${mapping.productName} with image`);
                            resolve();
                        }
                    }
                );
            });
            
            // Store additional images in a JSON field (if you want to use them later)
            if (existingImages.length > 1) {
                console.log(`📸 Found ${existingImages.length - 1} additional images (storing for future use)`);
                existingImages.slice(1).forEach((img, index) => {
                    console.log(`   ${index + 1}. ${path.basename(img)}`);
                });
            }
            
            console.log('');
        }
        
        console.log('🎉 Image update completed successfully!');
        
    } catch (error) {
        console.error('❌ Error updating images:', error);
    } finally {
        db.close();
    }
}

addImagesToDatabase();
