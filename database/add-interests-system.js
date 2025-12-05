const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'members.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Adding interests and notifications system...');

db.serialize(() => {
  // Create interest_categories table
  db.run(`CREATE TABLE IF NOT EXISTS interest_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ Error creating interest_categories table:', err.message);
    } else {
      console.log('✅ interest_categories table created');
    }
  });

  // Create user_notifications table
  db.run(`CREATE TABLE IF NOT EXISTS user_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    content_id INTEGER,
    notification_type TEXT NOT NULL DEFAULT 'content_match',
    title TEXT NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members (id),
    FOREIGN KEY (content_id) REFERENCES content (id)
  )`, (err) => {
    if (err) {
      console.error('❌ Error creating user_notifications table:', err.message);
    } else {
      console.log('✅ user_notifications table created');
    }
  });

  // Create index for faster queries
  db.run(`CREATE INDEX IF NOT EXISTS idx_member_interests_member_id ON member_interests(member_id)`, (err) => {
    if (err) {
      console.error('❌ Error creating index:', err.message);
    } else {
      console.log('✅ Index created for member_interests');
    }
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_user_notifications_member_id ON user_notifications(member_id)`, (err) => {
    if (err) {
      console.error('❌ Error creating index:', err.message);
    } else {
      console.log('✅ Index created for user_notifications');
    }
  });

  db.run(`CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read)`, (err) => {
    if (err) {
      console.error('❌ Error creating index:', err.message);
    } else {
      console.log('✅ Index created for user_notifications is_read');
    }
  });

  // Insert default interest categories
  const interestCategories = [
    { name: 'Energy Saving Products', description: 'Products that help reduce energy consumption', icon: '⚡' },
    { name: 'Water Saving Products', description: 'Products that help conserve water', icon: '💧' },
    { name: 'Solar Products', description: 'Solar panels, solar water heaters, and related products', icon: '☀️' },
    { name: 'HVAC Systems', description: 'Heating, ventilation, and air conditioning systems', icon: '🌡️' },
    { name: 'LED Lighting', description: 'Energy-efficient LED lighting solutions', icon: '💡' },
    { name: 'Insulation', description: 'Building insulation materials and solutions', icon: '🏠' },
    { name: 'Heat Pumps', description: 'Air source and ground source heat pumps', icon: '🔥' },
    { name: 'Smart Controls', description: 'Smart thermostats and building automation systems', icon: '📱' },
    { name: 'Renewable Energy', description: 'Wind, solar, and other renewable energy solutions', icon: '🌱' },
    { name: 'Building Materials', description: 'Sustainable and eco-friendly building materials', icon: '🧱' }
  ];

  const stmt = db.prepare(`INSERT OR IGNORE INTO interest_categories (name, description, icon) VALUES (?, ?, ?)`);
  
  interestCategories.forEach(category => {
    stmt.run([category.name, category.description, category.icon], (err) => {
      if (err) {
        console.error(`❌ Error inserting ${category.name}:`, err.message);
      }
    });
  });

  stmt.finalize((err) => {
    if (err) {
      console.error('❌ Error finalizing statement:', err.message);
    } else {
      console.log('✅ Interest categories seeded');
    }
  });

  // Close database after a short delay to ensure all operations complete
  setTimeout(() => {
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
      } else {
        console.log('✅ Database migration completed successfully!');
        console.log('\n📋 Summary:');
        console.log('   - interest_categories table created');
        console.log('   - user_notifications table created');
        console.log('   - Indexes created for performance');
        console.log('   - Default interest categories seeded');
      }
    });
  }, 1000);
});


