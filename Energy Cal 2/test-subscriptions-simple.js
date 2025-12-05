console.log('Testing minimal subscriptions...');

try {
  console.log('1. Testing basic imports...');
  const express = require('express');
  const path = require('path');
  console.log('✅ Basic imports OK');
  
  console.log('2. Testing sqlite3...');
  const sqlite3 = require('sqlite3').verbose();
  console.log('✅ SQLite3 OK');
  
  console.log('3. Testing database connection...');
  const dbPath = path.join(__dirname, './database/members.db');
  console.log('Database path:', dbPath);
  
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.log('❌ Database connection error:', err.message);
    } else {
      console.log('✅ Database connection OK');
      db.close();
    }
  });
  
} catch (e) {
  console.log('❌ Error:', e.message);
}

console.log('Test complete');


