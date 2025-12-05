const sqlite3 = require('sqlite3').verbose();

console.log('🔄 UPDATING ETL DATABASE CATEGORIES FOR PROFESSIONAL FOODSERVICE PRODUCTS\n');

const db = new sqlite3.Database('./database/energy_calculator_central.db');

// First, let's see what products we're going to update
const selectQuery = `
    SELECT id, name, brand, category, subcategory
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
    AND category != 'professional-foodservice'
    ORDER BY brand, name
`;

console.log('📋 Products to be updated:');
db.all(selectQuery, [], (err, rows) => {
    if (err) {
        console.error('❌ Error:', err);
        db.close();
        return;
    }
    
    console.log(`Found ${rows.length} products to update to 'professional-foodservice' category`);
    
    // Show first 10 products as examples
    console.log('\n📦 Sample products to update:');
    rows.slice(0, 10).forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (${product.brand}) - Current: ${product.category}`);
    });
    
    if (rows.length > 10) {
        console.log(`... and ${rows.length - 10} more products`);
    }
    
    // Update the categories
    console.log('\n🔄 Updating categories...');
    const updateQuery = `
        UPDATE products 
        SET category = 'professional-foodservice',
            subcategory = CASE 
                WHEN name LIKE '%combination%' OR name LIKE '%combi%' OR name LIKE '%steam%' THEN 'Combination Steam Ovens'
                WHEN name LIKE '%hood%' AND name LIKE '%dishwasher%' THEN 'Hood-Type Dishwashers'
                WHEN name LIKE '%undercounter%' AND name LIKE '%dishwasher%' THEN 'Undercounter Dishwashers'
                WHEN name LIKE '%convection%' AND name LIKE '%oven%' THEN 'Convection Ovens'
                WHEN name LIKE '%dishwasher%' THEN 'Commercial Dishwashers'
                WHEN name LIKE '%oven%' THEN 'Commercial Ovens'
                WHEN brand LIKE '%electrolux%' AND name LIKE '%ecostore%' THEN 'Heat Pumps'
                ELSE 'Professional Foodservice Equipment'
            END,
            updatedAt = datetime('now')
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
        AND category != 'professional-foodservice'
    `;
    
    db.run(updateQuery, [], function(err) {
        if (err) {
            console.error('❌ Error updating categories:', err);
        } else {
            console.log(`✅ Updated ${this.changes} products to 'professional-foodservice' category`);
            
            // Verify the update
            db.get('SELECT COUNT(*) as count FROM products WHERE category = "professional-foodservice"', [], (err, result) => {
                if (err) {
                    console.error('❌ Error verifying update:', err);
                } else {
                    console.log(`\n📊 Verification: ${result.count} products now have 'professional-foodservice' category`);
                    console.log('\n✅ Database update complete!');
                    console.log('\n📝 Next steps:');
                    console.log('1. Restart the server to clear cache');
                    console.log('2. Test the professional-foodservice category page');
                    console.log('3. Verify the flashing issue is resolved');
                }
                db.close();
            });
        }
    });
});



















