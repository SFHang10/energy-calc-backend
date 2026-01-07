const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./database/members.db');

// Get the password to test from command line
const testPassword = process.argv[2] || 'test123';

db.get('SELECT * FROM members WHERE email = ?', ['Stephen.Hanglan@gmail.com'], async (err, user) => {
    if (err) {
        console.log('❌ Database error:', err.message);
        db.close();
        return;
    }
    
    if (!user) {
        console.log('❌ User not found');
        db.close();
        return;
    }
    
    console.log('✅ User found:', user.email);
    console.log('   Password hash:', user.password_hash.substring(0, 30) + '...');
    
    // Test password
    console.log('\n🔐 Testing password:', testPassword);
    const isValid = await bcrypt.compare(testPassword, user.password_hash);
    
    if (isValid) {
        console.log('✅ PASSWORD CORRECT! Login should work.');
    } else {
        console.log('❌ PASSWORD INCORRECT. Please check your password.');
    }
    
    db.close();
});
