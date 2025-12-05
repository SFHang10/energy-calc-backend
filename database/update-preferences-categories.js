/**
 * Migration script to update interest categories to the new list
 * Run: node database/update-preferences-categories.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'members.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Updating interest categories...\n');

// New categories to use
const newCategories = [
  { name: 'Energy Saving', description: 'Products and solutions that help reduce energy consumption', icon: '⚡' },
  { name: 'Energy Generating', description: 'Renewable energy generation systems and solutions', icon: '🔋' },
  { name: 'Water Saving', description: 'Products and solutions that help conserve water', icon: '💧' },
  { name: 'Water Regeneration', description: 'Water recycling and regeneration systems', icon: '♻️' },
  { name: 'Gas Saving', description: 'Solutions to reduce gas consumption and improve efficiency', icon: '🔥' },
  { name: 'Alternative Fuel Solutions', description: 'Alternative and renewable fuel options', icon: '🌿' },
  { name: 'Home Energy', description: 'Energy solutions specifically for residential homes', icon: '🏠' },
  { name: 'Restaurant Energy', description: 'Energy efficiency solutions for restaurants and food service', icon: '🍽️' },
  { name: 'Office Buildings and Offices', description: 'Energy solutions for commercial office buildings', icon: '🏢' }
];

db.serialize(() => {
  // First, delete all existing categories (if table exists)
  db.run('DELETE FROM interest_categories', (err) => {
    if (err && !err.message.includes('no such table')) {
      console.error('❌ Error deleting old categories:', err.message);
      process.exit(1);
    } else if (!err) {
      console.log('✅ Cleared old categories');
    }
  });

  // Then insert new categories
  const stmt = db.prepare('INSERT INTO interest_categories (name, description, icon) VALUES (?, ?, ?)');
  
  newCategories.forEach((category, index) => {
    stmt.run(category.name, category.description, category.icon, (err) => {
      if (err) {
        console.error(`❌ Error inserting "${category.name}":`, err.message);
      } else {
        console.log(`✅ Added: ${category.icon} ${category.name}`);
      }
      
      // Close database when done
      if (index === newCategories.length - 1) {
        stmt.finalize((err) => {
          if (err) {
            console.error('❌ Error finalizing statement:', err.message);
          } else {
            console.log('\n🎉 Categories updated successfully!');
            console.log(`   Total categories: ${newCategories.length}\n`);
          }
          db.close();
        });
      }
    });
  });
});

