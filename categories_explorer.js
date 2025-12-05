const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "database", "energy_calculator.db");
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

console.log(" SAFE READ-ONLY Database Exploration");
console.log(" Total products: 5554\n");

// Get product categories breakdown
console.log(" Product categories breakdown:");
db.all("SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC", (err, categories) => {
    if (err) {
        console.error(" Error getting categories:", err.message);
        return;
    }
    
    categories.forEach(cat => {
        console.log(`   ${cat.category}: ${cat.count} products`);
    });
    
    // Get subcategories breakdown
    console.log("\n Top subcategories:");
    db.all("SELECT subcategory, COUNT(*) as count FROM products WHERE subcategory IS NOT NULL GROUP BY subcategory ORDER BY count DESC LIMIT 15", (err, subcats) => {
        if (err) {
            console.error(" Error getting subcategories:", err.message);
            return;
        }
        
        subcats.forEach(subcat => {
            console.log(`   ${subcat.subcategory}: ${subcat.count} products`);
        });
        
        db.close();
        console.log("\n SAFE exploration complete - no changes made to database!");
    });
});
