const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database', 'members.db');

if (!fs.existsSync(dbPath)) {
    console.log('❌ Database file does not exist at:', dbPath);
    process.exit(1);
}

console.log('📂 Database path:', dbPath);
console.log('📊 Checking members table schema...\n');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        process.exit(1);
    }
    
    // Get table schema
    db.all('PRAGMA table_info(members)', [], (err, rows) => {
        if (err) {
            console.error('❌ Error getting schema:', err.message);
            db.close();
            process.exit(1);
        }
        
        console.log('📋 Current members table columns:');
        console.log('-----------------------------------');
        rows.forEach(col => {
            console.log(`  ${col.name} (${col.type})${col.notnull ? ' NOT NULL' : ''}${col.dflt_value ? ` DEFAULT ${col.dflt_value}` : ''}`);
        });
        
        console.log('\n📊 Total columns:', rows.length);
        
        // Check for specific columns
        const columnNames = rows.map(r => r.name.toLowerCase());
        const requiredColumns = ['first_name', 'last_name', 'company', 'phone', 'subscription_tier', 'subscription_status'];
        
        console.log('\n🔍 Checking for required columns:');
        requiredColumns.forEach(col => {
            const exists = columnNames.includes(col.toLowerCase());
            console.log(`  ${col}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
        });
        
        // Check if there are any users
        db.get('SELECT COUNT(*) as count FROM members', [], (err, row) => {
            if (err) {
                console.error('❌ Error counting users:', err.message);
            } else {
                console.log(`\n👥 Total users in database: ${row.count}`);
                
                if (row.count > 0) {
                    // Get a sample user to see what columns have data
                    db.get('SELECT * FROM members LIMIT 1', [], (err, user) => {
                        if (err) {
                            console.error('❌ Error getting sample user:', err.message);
                        } else {
                            console.log('\n📝 Sample user data (first user):');
                            console.log(JSON.stringify(user, null, 2));
                        }
                        db.close();
                    });
                } else {
                    db.close();
                }
            }
        });
    });
});





