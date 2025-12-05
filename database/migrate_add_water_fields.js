const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'energy_calculator.db');
const db = new sqlite3.Database(dbPath);

function run(sql) {
  return new Promise((resolve, reject) => {
    db.run(sql, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

(async () => {
  try {
    await run('BEGIN TRANSACTION');
    await run("ALTER TABLE products ADD COLUMN water_per_cycle_liters REAL");
    await run("ALTER TABLE products ADD COLUMN water_per_year_liters REAL");
    await run("ALTER TABLE products ADD COLUMN capacity_kg REAL");
    await run("ALTER TABLE products ADD COLUMN place_settings INTEGER");
    await run('COMMIT');
    console.log('✅ Migration applied: water usage and capacity fields added');
  } catch (err) {
    await run('ROLLBACK').catch(() => {});
    if (err && /duplicate column name/i.test(err.message)) {
      console.log('ℹ️ Columns already exist; migration previously applied.');
      process.exit(0);
    }
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    db.close();
  }
})();







