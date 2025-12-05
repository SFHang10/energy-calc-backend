const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🔍 Testing calculator-wix route directly...\n');

// Test the exact functions from the route
const MANUAL_DB_PATH = path.join(__dirname, 'database', 'energy_calculator.db');
const ETL_DB_PATH = path.join(__dirname, 'database', 'energy_calculator_with_collection.db');

function getProductsFromManualDatabase(limit = 50, offset = 0) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(MANUAL_DB_PATH, (err) => {
            if (err) {
                console.error('Manual database connection error:', err);
                reject(err);
                return;
            }
        });

        const query = `
            SELECT 
                id, name, brand, category, subcategory, power, running_cost_per_year, 
                energy_rating, efficiency, source, model_number, image_url
            FROM products 
            ORDER BY name 
            LIMIT ? OFFSET ?
        `;

        db.all(query, [limit, offset], (err, rows) => {
            if (err) {
                console.error('Manual database query error:', err);
                reject(err);
            } else {
                const products = rows.map(row => ({
                    id: `manual_${row.id}`,
                    name: row.name || 'Unknown Product',
                    category: row.category || 'Unknown',
                    subcategory: row.subcategory || '',
                    brand: row.brand || 'Unknown',
                    power: row.power || 0,
                    energyRating: row.energy_rating || 'Unknown',
                    efficiency: row.efficiency || 'Unknown',
                    runningCostPerYear: row.running_cost_per_year || 0,
                    description: `${row.name} - ${row.brand} ${row.category}`,
                    manufacturer: row.brand || 'Unknown',
                    model: row.model_number || row.id,
                    sku: row.id,
                    imageUrl: row.image_url || '',
                    source: 'manual_database'
                }));
                resolve(products);
            }
        });

        db.close();
    });
}

// Test the function
getProductsFromManualDatabase(5, 0)
    .then(products => {
        console.log('✅ Manual database function works!');
        console.log(`📊 Loaded ${products.length} products:`);
        products.forEach((p, i) => {
            console.log(`  ${i+1}. ${p.name} (${p.category}) - ${p.brand} - Source: ${p.source}`);
        });
    })
    .catch(error => {
        console.error('❌ Manual database function failed:', error);
    });



