/**
 * Copy imageUrl (+ images) from FULL-DATABASE-5554.json into SQLite when SQLite is empty
 * but the master JSON has a value (ETL CDN or Product Placement path).
 *
 *   node scripts/propagate-full-db-images-to-sqlite.js
 *   node scripts/propagate-full-db-images-to-sqlite.js --apply
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const ROOT = path.join(__dirname, '..');
const FULL_DB_PATH = path.join(ROOT, 'FULL-DATABASE-5554.json');
const SQLITE_PATH = path.join(ROOT, 'database', 'energy_calculator_central.db');
const APPLY = process.argv.includes('--apply');

async function main() {
  const db = JSON.parse(fs.readFileSync(FULL_DB_PATH, 'utf8'));
  const fullMap = new Map(
    (db.products || []).filter((p) => p.id?.startsWith('etl_')).map((p) => [p.id, p])
  );

  const sqlite = new sqlite3.Database(SQLITE_PATH);
  const rows = await new Promise((resolve, reject) => {
    sqlite.all(
      `SELECT id, imageUrl FROM products WHERE id LIKE 'etl_%'`,
      [],
      (err, r) => (err ? reject(err) : resolve(r))
    );
  });

  let wouldUpdate = 0;
  const updates = [];

  for (const row of rows) {
    const full = fullMap.get(row.id);
    if (!full) continue;
    const fromFull = (full.imageUrl || '').trim();
    const fromSqlite = (row.imageUrl || '').trim();
    if (!fromFull || fromSqlite) continue;
    wouldUpdate++;
    updates.push({ id: row.id, imageUrl: fromFull });
  }

  console.log(`\n📋 Propagate images: FULL-DATABASE → SQLite`);
  console.log(`   ETL rows in SQLite: ${rows.length}`);
  console.log(`   Would fill empty SQLite imageUrl: ${wouldUpdate}`);
  console.log(`   Mode: ${APPLY ? 'APPLY' : 'DRY RUN'}\n`);

  if (APPLY && updates.length) {
    await new Promise((resolve, reject) => {
      const stmt = sqlite.prepare('UPDATE products SET imageUrl = ? WHERE id = ?');
      for (const u of updates) stmt.run(u.imageUrl, u.id);
      stmt.finalize((err) => (err ? reject(err) : resolve()));
    });
    console.log('✅ SQLite updated. Run: node product-grants-integrator.js');
  }

  sqlite.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
