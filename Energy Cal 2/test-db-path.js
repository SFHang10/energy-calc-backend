const path = require('path');
const sqlite3 = require('sqlite3').verbose();

console.log('🔍 Testing database path resolution...');
console.log('Current directory:', __dirname);
console.log('Database path:', path.join(__dirname, 'database/members.db'));

// Test database connection
const dbPath = path.join(__dirname, 'database/members.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Database connected successfully to:', dbPath);
    
    // Test query
    db.get('SELECT COUNT(*) as count FROM subscription_tiers', (err, row) => {
      if (err) {
        console.error('❌ Query error:', err.message);
      } else {
        console.log('✅ Query successful:', row);
      }
      db.close();
    });
  }
});
