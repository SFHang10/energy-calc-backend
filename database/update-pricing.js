/**
 * Update Subscription Tier Pricing
 * Updates prices to: Premium €20, Professional €40, Enterprise €80
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'members.db');

console.log('💰 Updating subscription tier pricing...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

// Updated pricing
const pricingUpdates = [
  { name: 'Premium Member', price: 20, price_monthly: 20, price_yearly: 240 },
  { name: 'Professional Member', price: 40, price_monthly: 40, price_yearly: 480 },
  { name: 'Enterprise Member', price: 80, price_monthly: 80, price_yearly: 960 }
];

let completed = 0;
const total = pricingUpdates.length;

pricingUpdates.forEach((tier) => {
  db.run(`
    UPDATE subscription_tiers 
    SET price = ?, price_monthly = ?, price_yearly = ?
    WHERE name = ?
  `, [tier.price, tier.price_monthly, tier.price_yearly, tier.name], function(err) {
    if (err) {
      console.error(`❌ Error updating ${tier.name}:`, err.message);
    } else {
      if (this.changes > 0) {
        console.log(`✅ Updated ${tier.name}: €${tier.price}/month (€${tier.price_yearly}/year)`);
      } else {
        console.log(`⚠️ ${tier.name} not found in database`);
      }
    }
    
    completed++;
    if (completed === total) {
      console.log('\n✅ Pricing update completed!');
      db.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err.message);
          process.exit(1);
        }
        console.log('✅ Database connection closed');
        process.exit(0);
      });
    }
  });
});








