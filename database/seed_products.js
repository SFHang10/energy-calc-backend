const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function seed(products) {
  const insertSql = `INSERT OR REPLACE INTO products (
    id, name, power, category, subcategory, brand, running_cost_per_year, energy_rating, efficiency, source, model_number,
    water_per_cycle_liters, water_per_year_liters, capacity_kg, place_settings
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  return products.reduce((p, product) => {
    return p.then(() => run(insertSql, [
      product.id,
      product.name,
      product.power,
      product.category,
      product.subcategory || null,
      product.brand || null,
      product.runningCostPerYear || null,
      product.energyRating || null,
      product.efficiency || null,
      product.source || 'Sample',
      product.modelNumber || null,
      product.waterPerCycleLiters || null,
      product.waterPerYearLiters || null,
      product.capacityKg || null,
      product.placeSettings || null,
    ]));
  }, Promise.resolve());
}

// Minimal subset seeded; frontend can still use its own in-page sample/ETL/ES sources.
const sampleProducts = [
  { id: 'sample_1', name: 'LG GSL760PZXV 601L French Door Fridge', power: 120, category: 'Appliances', subcategory: 'Refrigerator', brand: 'LG', runningCostPerYear: 52.56, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
  { id: 'sample_2', name: 'Samsung Washing Machine', power: 180, category: 'Appliances', subcategory: 'Washing Machine', brand: 'Samsung', runningCostPerYear: 78.90, energyRating: 'A', efficiency: 'Medium', source: 'Sample', waterPerCycleLiters: 50, capacityKg: 9 },
  { id: 'sample_5', name: 'Philips LED Bulb 9W', power: 9, category: 'Lighting', subcategory: 'LED Bulbs', brand: 'Philips', runningCostPerYear: 3.94, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
  { id: 'oven_1', name: 'Bosch HBL8453UC 30" Single Wall Oven', power: 2400, category: 'Appliances', subcategory: 'Oven', brand: 'Bosch', runningCostPerYear: 105.12, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
  { id: 'office_monitor_1', name: 'Dell UltraSharp U2720Q 27" Monitor', power: 25, category: 'Office Equipment', subcategory: 'Monitors', brand: 'Dell', runningCostPerYear: 10.95, energyRating: 'A+', efficiency: 'High', source: 'Sample' },
  // Added water-using appliances
  { id: 'dish_1', name: 'Bosch Series 6 Dishwasher', power: 1500, category: 'Appliances', subcategory: 'Dishwasher', brand: 'Bosch', runningCostPerYear: 65.70, energyRating: 'A+', efficiency: 'High', source: 'Sample', waterPerCycleLiters: 9, placeSettings: 14 },
  { id: 'wash_2', name: 'Miele WWR 860 Washing Machine', power: 170, category: 'Appliances', subcategory: 'Washing Machine', brand: 'Miele', runningCostPerYear: 74.49, energyRating: 'A', efficiency: 'High', source: 'Sample', waterPerCycleLiters: 49, capacityKg: 9 },
];

(async () => {
  try {
    await run('PRAGMA journal_mode=WAL;');
    await run('BEGIN TRANSACTION;');
    await seed(sampleProducts);
    await run('COMMIT;');
    console.log(`✅ Seeded ${sampleProducts.length} products into energy_calculator.db`);
  } catch (err) {
    await run('ROLLBACK;').catch(() => {});
    console.error('❌ Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    db.close();
  }
})();


