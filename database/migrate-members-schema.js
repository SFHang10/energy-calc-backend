/**
 * Database Migration Script
 * Adds missing columns to members table to support unified membership system
 * Run this once to update the database schema
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'members.db');
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  console.log('📁 Creating database directory:', dbDir);
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log('🔍 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

// Function to check if column exists
function columnExists(tableName, columnName, callback) {
  db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
    if (err) {
      return callback(err, false);
    }
    const exists = rows.some(row => row.name === columnName);
    callback(null, exists);
  });
}

// Function to add column if it doesn't exist
function addColumnIfNotExists(tableName, columnName, columnDefinition, callback) {
  columnExists(tableName, columnName, (err, exists) => {
    if (err) {
      return callback(err);
    }
    if (exists) {
      console.log(`   ✓ Column ${columnName} already exists`);
      return callback(null);
    }
    db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`, (err) => {
      if (err) {
        console.error(`   ❌ Error adding column ${columnName}:`, err.message);
        return callback(err);
      }
      console.log(`   ✅ Added column ${columnName}`);
      callback(null);
    });
  });
}

// Migration function
function migrate() {
  console.log('\n🔄 Starting database migration...\n');

  const columnsToAdd = [
    { name: 'first_name', definition: 'TEXT' },
    { name: 'last_name', definition: 'TEXT' },
    { name: 'company', definition: 'TEXT' },
    { name: 'phone', definition: 'TEXT' },
    { name: 'subscription_tier', definition: 'TEXT DEFAULT "Free"' },
    { name: 'subscription_status', definition: 'TEXT DEFAULT "active"' },
    { name: 'wix_member_id', definition: 'TEXT' },
    { name: 'wix_site_id', definition: 'TEXT' },
    { name: 'wix_plan_id', definition: 'TEXT' },
    { name: 'wix_order_id', definition: 'TEXT' }
  ];

  let completed = 0;
  const total = columnsToAdd.length;

  columnsToAdd.forEach(({ name, definition }) => {
    addColumnIfNotExists('members', name, definition, (err) => {
      completed++;
      if (err) {
        console.error(`❌ Migration failed for column ${name}`);
        process.exit(1);
      }
      if (completed === total) {
        console.log('\n✅ Database migration completed successfully!\n');
        
        // Also update subscription_tiers table if needed
        db.run(`CREATE TABLE IF NOT EXISTS subscription_tiers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          price REAL NOT NULL,
          price_monthly REAL,
          features TEXT,
          wix_plan_id TEXT,
          wix_site_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
          if (err) {
            console.error('❌ Error creating subscription_tiers table:', err.message);
          } else {
            console.log('✅ Subscription tiers table ready');
          }
          
          // Add missing columns to subscription_tiers if they don't exist
          const tierColumns = [
            { name: 'price', definition: 'REAL' },
            { name: 'price_monthly', definition: 'REAL' },
            { name: 'wix_plan_id', definition: 'TEXT' },
            { name: 'wix_site_id', definition: 'TEXT' }
          ];
          
          let tierCompleted = 0;
          tierColumns.forEach(({ name, definition }) => {
            addColumnIfNotExists('subscription_tiers', name, definition, (err) => {
              tierCompleted++;
              if (tierCompleted === tierColumns.length) {
                // Create content table if it doesn't exist
                db.run(`CREATE TABLE IF NOT EXISTS content (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  title TEXT NOT NULL,
                  description TEXT,
                  category TEXT,
                  required_tier TEXT DEFAULT 'Free',
                  site_access TEXT DEFAULT 'both',
                  content_url TEXT,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`, (err) => {
                  if (err) {
                    console.error('❌ Error creating content table:', err.message);
                  } else {
                    console.log('✅ Content table ready');
                  }
                  
                  db.close((err) => {
                    if (err) {
                      console.error('❌ Error closing database:', err.message);
                      process.exit(1);
                    }
                    console.log('✅ Database connection closed');
                    process.exit(0);
                  });
                });
              }
            });
          });
        });
      }
    });
  });
}

// Run migration
migrate();

