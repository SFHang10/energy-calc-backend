const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/energy_calculator.db');

console.log('🔍 CHECKING EXACT SUBCATEGORY NAMES\n');

db.all('SELECT DISTINCT subcategory FROM products ORDER BY subcategory', (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('All subcategories:');
    rows.forEach(row => {
      console.log(`  "${row.subcategory}"`);
    });
    
    console.log('\n🎯 Store-worthy categories:');
    const storeCategories = rows.filter(row => 
      row.subcategory.includes('Hand') || 
      row.subcategory.includes('Heat') || 
      row.subcategory.includes('Light') || 
      row.subcategory.includes('Professional') || 
      row.subcategory.includes('HVAC')
    );
    
    storeCategories.forEach(row => {
      console.log(`  "${row.subcategory}"`);
    });
  }
  
  db.close();
});















