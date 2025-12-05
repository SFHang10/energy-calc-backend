/**
 * Seed Subscription Tiers
 * Populates the subscription_tiers table with the fallback plans from members-section.html
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'members.db');

console.log('🌱 Seeding subscription tiers...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

// Subscription tiers from members-section.html fallback
const tiers = [
  {
    name: 'Basic Member',
    price: 0,
    price_monthly: 0,
    price_yearly: 0,
    features: 'Basic energy calculators, Community access, Email support',
    wix_plan_id: null,
    wix_site_id: null
  },
  {
    name: 'Premium Member',
    price: 29.99,
    price_monthly: 29.99,
    price_yearly: 359.88, // 29.99 * 12
    features: 'Advanced calculators, Data storage, Priority support',
    wix_plan_id: null,
    wix_site_id: null
  },
  {
    name: 'Professional Member',
    price: 99.99,
    price_monthly: 99.99,
    price_yearly: 1199.88, // 99.99 * 12
    features: 'Building consultancy, Custom reports, API access',
    wix_plan_id: null,
    wix_site_id: null
  },
  {
    name: 'Enterprise Member',
    price: 299.99,
    price_monthly: 299.99,
    price_yearly: 3599.88, // 299.99 * 12
    features: '24/7 support, Custom integrations, SLA guarantees',
    wix_plan_id: null,
    wix_site_id: null
  }
];

// First, get table structure
db.all(`PRAGMA table_info(subscription_tiers)`, (err, columns) => {
  if (err) {
    console.error('❌ Error getting table info:', err.message);
    db.close();
    process.exit(1);
  }
  
  const columnNames = columns.map(c => c.name);
  console.log('📋 Available columns:', columnNames.join(', '));
  
  // Clear existing tiers (optional - only non-Wix tiers)
  db.run('DELETE FROM subscription_tiers WHERE wix_plan_id IS NULL', (err) => {
    if (err) {
      console.log('⚠️ Note: Could not clear existing tiers (may not exist yet)');
    } else {
      console.log('✅ Cleared existing non-Wix tiers');
    }

    // Insert tiers
    let completed = 0;
    const total = tiers.length;

    tiers.forEach((tier) => {
      // Build INSERT statement based on available columns
      const insertCols = ['name', 'price', 'price_monthly', 'price_yearly', 'features', 'wix_plan_id', 'wix_site_id']
        .filter(col => columnNames.includes(col));
      const placeholders = insertCols.map(() => '?').join(', ');
      const values = [
        tier.name,
        tier.price,
        tier.price_monthly,
        tier.price_yearly,
        tier.features,
        tier.wix_plan_id,
        tier.wix_site_id
      ].slice(0, insertCols.length);
      
      db.run(`
        INSERT INTO subscription_tiers (${insertCols.join(', ')}, created_at)
        VALUES (${placeholders}, CURRENT_TIMESTAMP)
      `, values, function(err) {
        if (err) {
          console.error(`❌ Error inserting tier ${tier.name}:`, err.message);
        } else {
          console.log(`✅ Inserted tier: ${tier.name} (€${tier.price}/month)`);
        }
        
        completed++;
        if (completed === total) {
          console.log('\n✅ All subscription tiers seeded successfully!');
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
  });
});
