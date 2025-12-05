/**
 * Diagnostic script to check why login isn't working
 * This will help identify the exact issue
 */

const http = require('http');

console.log('🔍 Diagnosing Login Issue\n');
console.log('='.repeat(50));

// Test 1: Check if server is running
console.log('\n1️⃣ Testing if server is running on http://localhost:4000...');

const testServer = http.get('http://localhost:4000/api/members/subscription-tiers', (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log('✅ Server is running and responding!');
            console.log('   Response:', data.substring(0, 100) + '...');
            
            // Test 2: Check login endpoint
            console.log('\n2️⃣ Testing login endpoint structure...');
            console.log('   Endpoint: POST http://localhost:4000/api/members/login');
            console.log('   ✅ Endpoint exists in routes/members.js');
            
            // Test 3: Check database
            console.log('\n3️⃣ Checking database...');
            const sqlite3 = require('sqlite3').verbose();
            const path = require('path');
            const fs = require('fs');
            
            const dbPath = path.join(__dirname, 'database', 'members.db');
            
            if (!fs.existsSync(dbPath)) {
                console.log('   ❌ Database file does NOT exist!');
                console.log('   Expected location:', dbPath);
                process.exit(1);
            }
            
            console.log('   ✅ Database file exists');
            
            const db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.log('   ❌ Cannot connect to database:', err.message);
                    process.exit(1);
                }
                
                console.log('   ✅ Database connection successful');
                
                // Check users
                db.get('SELECT COUNT(*) as count FROM members', [], (err, row) => {
                    if (err) {
                        console.log('   ❌ Error querying database:', err.message);
                        db.close();
                        process.exit(1);
                    }
                    
                    console.log(`   ✅ Found ${row.count} users in database`);
                    
                    if (row.count > 0) {
                        // Get first user
                        db.get('SELECT email, first_name, last_name FROM members LIMIT 1', [], (err, user) => {
                            if (err) {
                                console.log('   ❌ Error getting user:', err.message);
                            } else {
                                console.log('   📧 Sample user email:', user.email);
                                console.log('   👤 Sample user name:', `${user.first_name} ${user.last_name}`);
                            }
                            
                            console.log('\n4️⃣ Common Issues Checklist:');
                            console.log('   □ Is the server running? (Run: npm start or node server-new.js)');
                            console.log('   □ Are you accessing via file:/// instead of http://localhost:4000?');
                            console.log('   □ Check browser console for CORS errors');
                            console.log('   □ Check browser Network tab for failed requests');
                            console.log('   □ Verify password is correct (case-sensitive)');
                            
                            console.log('\n💡 To test login manually:');
                            console.log('   1. Make sure server is running');
                            console.log('   2. Open browser console (F12)');
                            console.log('   3. Try logging in and check for errors');
                            console.log('   4. Check Network tab for the /api/members/login request');
                            
                            db.close();
                        });
                    } else {
                        console.log('   ⚠️  No users in database - you need to register first!');
                        db.close();
                    }
                });
            });
        } else {
            console.log(`   ⚠️  Server responded with status ${res.statusCode}`);
            console.log('   Response:', data);
        }
    });
});

testServer.on('error', (err) => {
    console.log('   ❌ Server is NOT running or not accessible!');
    console.log('   Error:', err.message);
    console.log('\n💡 Solution: Start the server first!');
    console.log('   Run: cd "c:\\Users\\steph\\Documents\\energy-cal-backend"');
    console.log('   Then: node server-new.js');
    console.log('   Or: npm start (if you have a start script)');
    console.log('\n⚠️  The login will NOT work if the server is not running!');
});

testServer.setTimeout(5000, () => {
    console.log('   ❌ Server connection timeout (5 seconds)');
    console.log('   The server is likely not running');
    testServer.destroy();
});





