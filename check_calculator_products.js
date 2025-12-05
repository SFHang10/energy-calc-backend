const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Checking calculator product counts...');

// Check the main JSON file
const fs = require('fs');
const jsonPath = path.join(__dirname, 'FULL-DATABASE-5554.json');

try {
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`📄 JSON file: ${jsonData.length} products`);
    
    // Count by category
    const categoryCounts = {};
    jsonData.forEach(product => {
        const category = product.category || 'Unknown';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    console.log('📊 Products by category in JSON:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
        console.log(`  ${category}: ${count}`);
    });
    
} catch (error) {
    console.error('❌ Error reading JSON file:', error.message);
}

// Check the calculator database
const dbPath = path.join(__dirname, 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

db.all(`
    SELECT category, COUNT(*) as count 
    FROM products 
    GROUP BY category 
    ORDER BY count DESC
`, (err, rows) => {
    if (err) {
        console.error('❌ Error querying calculator database:', err.message);
    } else {
        console.log('\n📊 Products by category in Calculator DB:');
        rows.forEach(row => {
            console.log(`  ${row.category}: ${row.count}`);
        });
    }
    
    // Check total count
    db.get('SELECT COUNT(*) as total FROM products', (err, row) => {
        if (err) {
            console.error('❌ Error getting total count:', err.message);
        } else {
            console.log(`\n📈 Total products in Calculator DB: ${row.total}`);
        }
        
        db.close();
    });
});

// Check the central database
const centralDbPath = path.join(__dirname, 'energy_calculator_central.db');
const centralDb = new sqlite3.Database(centralDbPath);

centralDb.all(`
    SELECT category, COUNT(*) as count 
    FROM products 
    GROUP BY category 
    ORDER BY count DESC
`, (err, rows) => {
    if (err) {
        console.error('❌ Error querying central database:', err.message);
    } else {
        console.log('\n📊 Products by category in Central DB:');
        rows.forEach(row => {
            console.log(`  ${row.category}: ${row.count}`);
        });
    }
    
    // Check total count
    centralDb.get('SELECT COUNT(*) as total FROM products', (err, row) => {
        if (err) {
            console.error('❌ Error getting total count:', err.message);
        } else {
            console.log(`\n📈 Total products in Central DB: ${row.total}`);
        }
        
        centralDb.close();
    });
});



















