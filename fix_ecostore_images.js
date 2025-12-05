const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Fix remaining ecostore HP products
const dbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Fixing remaining ecostore HP products...\n');

// Update ecostore HP products (without LIMIT clause)
const ecostoreHPImageUrl = 'http://localhost:4000/product-images/ecostore%20HP%20%20by%20Electrolux%20Professional.jpeg';

db.run(`
    UPDATE products 
    SET imageUrl = ? 
    WHERE name = 'ecostore HP' AND category = 'professional-foodservice'
`, [ecostoreHPImageUrl], function(err) {
    if (err) {
        console.error('❌ Error updating ecostore HP:', err);
    } else {
        console.log(`✅ Updated ${this.changes} ecostore HP products`);
    }
});

// Update ecostore HPe products
const ecostoreHPeImageUrl = 'http://localhost:4000/product-images/ecostore%20HP%20Premium%20by%20Electrolux%20Professional.Jpeg';

db.run(`
    UPDATE products 
    SET imageUrl = ? 
    WHERE name = 'ecostore HPe' AND category = 'professional-foodservice'
`, [ecostoreHPeImageUrl], function(err) {
    if (err) {
        console.error('❌ Error updating ecostore HPe:', err);
    } else {
        console.log(`✅ Updated ${this.changes} ecostore HPe products`);
    }
});

// Update ecostore Premium HPe products
db.run(`
    UPDATE products 
    SET imageUrl = ? 
    WHERE name = 'ecostore Premium HPe' AND category = 'professional-foodservice'
`, [ecostoreHPeImageUrl], function(err) {
    if (err) {
        console.error('❌ Error updating ecostore Premium HPe:', err);
    } else {
        console.log(`✅ Updated ${this.changes} ecostore Premium HPe products`);
    }
});

// Update ecostore Premium cabinet products
db.run(`
    UPDATE products 
    SET imageUrl = ? 
    WHERE name = 'ecostore Premium cabinet' AND category = 'professional-foodservice'
`, [ecostoreHPeImageUrl], function(err) {
    if (err) {
        console.error('❌ Error updating ecostore Premium cabinet:', err);
    } else {
        console.log(`✅ Updated ${this.changes} ecostore Premium cabinet products`);
    }
});

// Close database after updates
setTimeout(() => {
    console.log('\n✅ All ecostore products updated!');
    db.close();
}, 1000);



















