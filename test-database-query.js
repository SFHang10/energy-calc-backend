const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/energy_calculator_with_collection.db');

console.log('🔍 Testing database query...\n');

// Test the exact query from calculator-wix.js
const query = `
    SELECT 
        id, name, brand, category, subcategory, sku, modelNumber, price, power, 
        powerDisplay, energyRating, efficiency, runningCostPerYear, imageUrl, 
        images, videos, descriptionShort, descriptionFull, additionalInfo, 
        specifications, marketingInfo, calculatorData, productPageUrl, 
        affiliateInfo, createdAt, updatedAt, extractedFrom, extractionDate,
        grants_count, grants_currency, grants_total, grants, grants_region,
        collection_agencies, collection_region, collection_incentive_total, 
        collection_currency, collection_agencies_count
    FROM products 
    WHERE category != 'Comparison Data' AND category IS NOT NULL
    ORDER BY name 
    LIMIT ? OFFSET ?
`;

db.all(query, [5, 0], (err, rows) => {
    if (err) {
        console.error('❌ Database query error:', err);
    } else {
        console.log(`✅ Query successful! Found ${rows.length} products:`);
        rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.name} (${row.category}) - ${row.brand}`);
        });
    }
    db.close();
});



