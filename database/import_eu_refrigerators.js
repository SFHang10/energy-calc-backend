const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'energy_calculator.db');
const csvPath = path.join(__dirname, '..', 'data', 'eu_refrigerators.csv');

const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function insertRow(row) {
  const id = `eu_ref_${row.model || row['Model'] || Math.random().toString(36).slice(2)}`;
  const name = row.name || row['Product'] || row['Model'] || 'EU Refrigerator';
  const brand = row.brand || row['Brand'] || 'EU';
  const power = row.annual_energy_kwh ? (parseFloat(row.annual_energy_kwh) * 1000) / 8760 : 120;
  const energyRating = row.energy_class || row['Energy Class'] || 'A+';

  return run(
    `INSERT OR REPLACE INTO products (
      id, name, power, category, subcategory, brand, running_cost_per_year, energy_rating, efficiency, source
    ) VALUES (?, ?, ?, 'Appliances', 'Refrigerator', ?, NULL, ?, NULL, 'EU CSV')`,
    [id, name, power, brand, energyRating]
  );
}

(async () => {
  try {
    await run('BEGIN TRANSACTION');
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          // Queue inserts serially to keep it simple
          insertRow(row).catch(reject);
        })
        .on('end', resolve)
        .on('error', reject);
    });
    await run('COMMIT');
    console.log('✅ EU refrigerators imported');
  } catch (err) {
    await run('ROLLBACK').catch(() => {});
    console.error('❌ Import failed:', err.message);
    process.exitCode = 1;
  } finally {
    db.close();
  }
})();









