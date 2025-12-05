const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking Calculator DB after rollback...');

// Check total products
db.all('SELECT COUNT(*) as count FROM products', (err, rows) => {
    if (err) {
        console.error('❌ Error:', err);
        return;
    }
    console.log('📊 Total products in Calculator DB:', rows[0].count);
    
    // Check professional-foodservice products
    db.all('SELECT COUNT(*) as count FROM products WHERE category = "professional-foodservice"', (err, rows) => {
        if (err) {
            console.error('❌ Error:', err);
            return;
        }
        console.log('🍽️ Professional-foodservice products in Calculator DB:', rows[0].count);
        
        // Check sample products
        db.all('SELECT COUNT(*) as count FROM products WHERE category = "Appliances"', (err, rows) => {
            if (err) {
                console.error('❌ Error:', err);
                return;
            }
            console.log('🏠 Appliances products in Calculator DB:', rows[0].count);
            
            // Check a few sample products
            db.all('SELECT name, category, power, running_cost_per_year FROM products LIMIT 5', (err, rows) => {
                if (err) {
                    console.error('❌ Error:', err);
                    return;
                }
                console.log('🔍 Sample products:');
                rows.forEach(row => {
                    console.log(`  - ${row.name} (${row.category}) - Power: ${row.power}W, Cost: €${row.running_cost_per_year}/year`);
                });
                
                db.close();
            });
        });
    });
});



















