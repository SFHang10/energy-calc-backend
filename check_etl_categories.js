const sqlite3 = require('sqlite3').verbose();

console.log('🔍 CHECKING ETL DATABASE CATEGORIES FOR PROFESSIONAL FOODSERVICE PRODUCTS\n');

const db = new sqlite3.Database('./database/energy_calculator_central.db');

// Check what categories contain professional foodservice products
const query = `
    SELECT DISTINCT category, COUNT(*) as count
    FROM products 
    WHERE (
        name LIKE '%oven%' OR 
        name LIKE '%steam%' OR 
        name LIKE '%dishwasher%' OR 
        name LIKE '%combination%' OR 
        name LIKE '%convection%' OR 
        name LIKE '%undercounter%' OR 
        name LIKE '%hood%' OR 
        name LIKE '%combi%' OR
        brand LIKE '%electrolux%' OR 
        brand LIKE '%lainox%' OR 
        brand LIKE '%eloma%' OR 
        brand LIKE '%lincat%' OR
        brand LIKE '%cheftop%' OR
        brand LIKE '%rational%' OR
        brand LIKE '%mkn%'
    )
    AND category IS NOT NULL
    GROUP BY category
    ORDER BY count DESC
`;

db.all(query, [], (err, rows) => {
    if (err) {
        console.error('❌ Error:', err);
    } else {
        console.log('📊 Categories containing professional foodservice products:');
        rows.forEach(row => {
            console.log(`   ${row.category}: ${row.count} products`);
        });
        
        // Now check the total count
        const totalQuery = `
            SELECT COUNT(*) as total
            FROM products 
            WHERE (
                name LIKE '%oven%' OR 
                name LIKE '%steam%' OR 
                name LIKE '%dishwasher%' OR 
                name LIKE '%combination%' OR 
                name LIKE '%convection%' OR 
                name LIKE '%undercounter%' OR 
                name LIKE '%hood%' OR 
                name LIKE '%combi%' OR
                brand LIKE '%electrolux%' OR 
                brand LIKE '%lainox%' OR 
                brand LIKE '%eloma%' OR 
                brand LIKE '%lincat%' OR
                brand LIKE '%cheftop%' OR
                brand LIKE '%rational%' OR
                brand LIKE '%mkn%'
            )
            AND category IS NOT NULL
        `;
        
        db.get(totalQuery, [], (err, result) => {
            if (err) {
                console.error('❌ Error:', err);
            } else {
                console.log(`\n📈 Total professional foodservice products in ETL database: ${result.total}`);
                console.log(`\n🎯 Expected from ETL website: 71 products`);
                console.log(`\n📝 The issue: Products are in different categories, not 'professional-foodservice'`);
                console.log(`\n✅ Solution: Update the category field for these products to 'professional-foodservice'`);
            }
            db.close();
        });
    }
});



















