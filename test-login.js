const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database', 'members.db');

if (!fs.existsSync(dbPath)) {
    console.log('❌ Database file does not exist');
    process.exit(1);
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        process.exit(1);
    }
    
    console.log('📊 Checking users in database...\n');
    
    // Get all users
    db.all('SELECT id, email, first_name, last_name, password_hash FROM members', [], async (err, users) => {
        if (err) {
            console.error('❌ Error getting users:', err.message);
            db.close();
            process.exit(1);
        }
        
        console.log(`Found ${users.length} users:\n`);
        
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email}`);
            console.log(`   Name: ${user.first_name} ${user.last_name}`);
            console.log(`   Password hash: ${user.password_hash.substring(0, 20)}...`);
            console.log('');
        });
        
        if (users.length > 0) {
            console.log('💡 To test login, you can try:');
            console.log('   Email:', users[0].email);
            console.log('   (Password is hashed, so you need to know the original password)');
        }
        
        db.close();
    });
});





