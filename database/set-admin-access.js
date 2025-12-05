/**
 * Script to set a user's subscription tier to Enterprise Member for admin access
 * Usage: node database/set-admin-access.js <email>
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'members.db');
const db = new sqlite3.Database(dbPath);

const email = process.argv[2];

if (!email) {
  console.log('❌ Please provide an email address');
  console.log('Usage: node database/set-admin-access.js <email>');
  process.exit(1);
}

// Update user to Enterprise Member tier (highest tier)
db.run(
  'UPDATE members SET subscription_tier = ? WHERE email = ?',
  ['Enterprise Member', email],
  function(err) {
    if (err) {
      console.error('❌ Error updating user:', err.message);
      db.close();
      process.exit(1);
    }
    
    if (this.changes === 0) {
      console.log(`❌ No user found with email: ${email}`);
      db.close();
      process.exit(1);
    }
    
    console.log(`✅ Successfully updated ${email} to Enterprise Member tier`);
    console.log(`   Changes: ${this.changes} row(s) updated`);
    
    // Verify the update
    db.get('SELECT email, subscription_tier FROM members WHERE email = ?', [email], (err, row) => {
      if (err) {
        console.error('❌ Error verifying update:', err.message);
      } else {
        console.log(`✅ Verified: ${row.email} is now ${row.subscription_tier}`);
      }
      db.close();
    });
  }
);


