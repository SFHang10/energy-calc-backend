const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator_central.db');
const db = new sqlite3.Database(dbPath);

const allGlassUrl = 'https://static.wixstatic.com/media/c123de_e8e3856e5d4f4043bcae90d8198038ed~mv2.jpeg';
const antiReflectiveUrl = 'https://static.wixstatic.com/media/c123de_f0dbfab76a1e4c23b178c27f90624ea3~mv2.jpeg';

console.log('🔄 Updating Carrier images in database...\n');

// Update "all glass door"
db.run(
    `UPDATE products 
     SET imageUrl = ? 
     WHERE name = 'Carrier Refrigeration all glass door' 
     AND imageUrl = 'Product Placement/Motor.jpg'`,
    [allGlassUrl],
    function(err) {
        if (err) {
            console.error('❌ Error updating all glass door:', err);
        } else {
            console.log(`✅ Updated ${this.changes} "all glass door" products`);
        }
        
        // Update "anti-reflective"
        db.run(
            `UPDATE products 
             SET imageUrl = ? 
             WHERE name = 'Carrier Refrigeration anti-reflective all glass door' 
             AND imageUrl = 'Product Placement/Motor.jpg'`,
            [antiReflectiveUrl],
            function(err2) {
                if (err2) {
                    console.error('❌ Error updating anti-reflective:', err2);
                } else {
                    console.log(`✅ Updated ${this.changes} "anti-reflective" products\n`);
                }
                
                console.log('💾 Database updated. Now run: node safe_sync_images_to_json.js');
                db.close();
            }
        );
    }
);

