const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Update products with real images from product-images folder
const dbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Updating products with real images...\n');

// Map product names to their image files
const imageMappings = {
    'Electrolux EI30EF55QS 30" Single Wall Oven': 'Electrolux EI30EF55QS 30 Single Wall Oven.jpg',
    'Frigidaire Gallery FGEW3065UF 30" Wall Oven': 'Frigidaire Gallery FGEW3065UF 30 Wall Oven.jpg',
    'GE Profile P2B940YPFS 30" Double Wall Oven': 'GE Profile P2B940YPFS 30 Double Wall Oven.jpeg',
    'Hisense Dishwasher': 'Hisense Dishwasher.jpg',
    'KitchenAid KODE500ESS 30" Double Wall Oven': 'KitchenAid KODE500ESS 30 Double Wall Oven.jpg',
    'LG LDE4413ST 30" Double Wall Oven': 'LG LDE4413ST 30 Double Wall Oven.jpeg',
    'Maytag MWO5105BZ 30" Single Wall Oven': 'Maytag MWO5105BZ 30 Single Wall Ovenjpg.jpg',
    'Samsung NE58K9430WS 30" Wall Oven': 'Samsung NE58K9430WS 30 Wall Oven.jpg',
    'Whirlpool WOD51HZES 30" Double Wall Oven': 'Whirlpool WOD51HZES 30 Double Wall Oven.jpg'
};

// Electrolux Professional ecostore products
const ecostoreImages = [
    'ecostore HP  by Electrolux Professional Model number EJ4HBAAAAG.jpeg',
    'ecostore HP  by Electrolux Professional.jpeg',
    'ecostore HP  by Electrolux Professional.Model number EJ2HBAAXXG.jpeg',
    'ecostore HP by Electrolux Professional Model number EJ3HBAAAXG .jpeg',
    'ecostore HP Premium by Electrolux Professional.Jpeg'
];

let updatedCount = 0;

// Update individual products with specific images
Object.entries(imageMappings).forEach(([productName, imageFile]) => {
    const imageUrl = `http://localhost:4000/product-images/${encodeURIComponent(imageFile)}`;
    
    db.run(`
        UPDATE products 
        SET imageUrl = ? 
        WHERE name = ? AND category = 'professional-foodservice'
    `, [imageUrl, productName], function(err) {
        if (err) {
            console.error(`❌ Error updating ${productName}:`, err);
        } else {
            console.log(`✅ Updated ${productName} with ${imageFile}`);
            updatedCount++;
        }
    });
});

// Update CHEFTOP products with a generic professional oven image
const cheftopImageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjhGOUZBIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2Qzc1N0QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DSEVGVE9QPC90ZXh0Pgo8dGV4dCB4PSIxNTAiIHk9IjEyMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjNkM3NTdEIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UHJvZmVzc2lvbmFsIE92ZW48L3RleHQ+Cjwvc3ZnPgo=';

db.run(`
    UPDATE products 
    SET imageUrl = ? 
    WHERE name LIKE '%CHEFTOP%' AND category = 'professional-foodservice'
`, [cheftopImageUrl], function(err) {
    if (err) {
        console.error('❌ Error updating CHEFTOP products:', err);
    } else {
        console.log(`✅ Updated CHEFTOP products with custom image`);
        updatedCount++;
    }
});

// Update ecostore products with available images
ecostoreImages.forEach((imageFile, index) => {
    const imageUrl = `http://localhost:4000/product-images/${encodeURIComponent(imageFile)}`;
    
    // Update ecostore HP products
    db.run(`
        UPDATE products 
        SET imageUrl = ? 
        WHERE name = 'ecostore HP' AND category = 'professional-foodservice'
        LIMIT 1
    `, [imageUrl], function(err) {
        if (err) {
            console.error(`❌ Error updating ecostore HP:`, err);
        } else {
            console.log(`✅ Updated ecostore HP with ${imageFile}`);
            updatedCount++;
        }
    });
});

// Update ecostore HP Premium products
const premiumImageUrl = `http://localhost:4000/product-images/${encodeURIComponent('ecostore HP Premium by Electrolux Professional.Jpeg')}`;

db.run(`
    UPDATE products 
    SET imageUrl = ? 
    WHERE name = 'ecostore HP Premium' AND category = 'professional-foodservice'
`, [premiumImageUrl], function(err) {
    if (err) {
        console.error('❌ Error updating ecostore HP Premium:', err);
    } else {
        console.log(`✅ Updated ecostore HP Premium products`);
        updatedCount++;
    }
});

// Close database after a short delay to allow all updates to complete
setTimeout(() => {
    console.log(`\n📊 Updated ${updatedCount} products with real images`);
    console.log('✅ Image update complete!');
    db.close();
}, 2000);



















