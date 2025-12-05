const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/energy_calculator.db');

db.all('SELECT id, name, water_per_cycle_liters, capacity_kg, place_settings FROM products WHERE source = "Backend"', (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Backend products with water data:');
    console.log(JSON.stringify(rows, null, 2));
  }
  db.close();
});








