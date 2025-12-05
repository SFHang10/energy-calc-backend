/**
 * Inspect ItemTable to see what's actually stored
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const os = require('os');

const APPDATA = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const WORKSPACE_STORAGE = path.join(APPDATA, 'Cursor', 'User', 'workspaceStorage');

// Check both databases
const currentWorkspacePath = process.cwd();
const crypto = require('crypto');
const workspaceHash = crypto.createHash('md5')
  .update(currentWorkspacePath.toLowerCase())
  .digest('hex');

const currentDbPath = path.join(WORKSPACE_STORAGE, workspaceHash, 'state.vscdb');
const otherDbPath = path.join(WORKSPACE_STORAGE, 'fe58f8872bb1c4d058df05fff78d1f1b', 'state.vscdb');

function inspectDatabase(dbPath, label) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📂 ${label}`);
  console.log(`${'='.repeat(60)}\n`);
  
  if (!fs.existsSync(dbPath)) {
    console.log('❌ Database does not exist!');
    return;
  }
  
  try {
    const db = new Database(dbPath, { readonly: true });
    
    // Get ItemTable schema
    const columns = db.prepare(`PRAGMA table_info(ItemTable)`).all();
    console.log(`📋 ItemTable columns: ${columns.map(c => c.name).join(', ')}\n`);
    
    // Get row count
    const count = db.prepare(`SELECT COUNT(*) as count FROM ItemTable`).get();
    console.log(`📊 Total rows: ${count.count}\n`);
    
    // Get sample rows
    console.log(`🔍 Sample rows (first 10):\n`);
    const rows = db.prepare(`SELECT * FROM ItemTable LIMIT 10`).all();
    
    rows.forEach((row, i) => {
      console.log(`Row ${i + 1}:`);
      Object.keys(row).forEach(key => {
        let value = row[key];
        if (typeof value === 'string') {
          // Truncate long strings
          if (value.length > 200) {
            value = value.substring(0, 200) + '... [truncated]';
          }
          // Check if it looks like JSON
          if (value.startsWith('{') || value.startsWith('[')) {
            try {
              const parsed = JSON.parse(value);
              if (typeof parsed === 'object') {
                value = JSON.stringify(parsed, null, 2).substring(0, 300) + '...';
              }
            } catch (e) {
              // Not JSON, keep as is
            }
          }
        }
        console.log(`  ${key}: ${value}`);
      });
      console.log('');
    });
    
    // Check for chat-related content
    console.log(`\n🔍 Searching for chat-related content...\n`);
    
    // Try to find rows that might contain chat data
    const allRows = db.prepare(`SELECT * FROM ItemTable`).all();
    let chatMatches = 0;
    const chatKeys = [];
    
    allRows.forEach((row, i) => {
      const rowStr = JSON.stringify(row).toLowerCase();
      if (rowStr.includes('chat') || rowStr.includes('message') || 
          rowStr.includes('conversation') || rowStr.includes('prompt') ||
          rowStr.includes('assistant') || rowStr.includes('user')) {
        chatMatches++;
        if (chatKeys.length < 5) {
          chatKeys.push(i);
        }
      }
    });
    
    console.log(`Found ${chatMatches} rows that might contain chat data\n`);
    
    if (chatKeys.length > 0) {
      console.log(`Sample chat-related rows:\n`);
      chatKeys.forEach(idx => {
        const row = allRows[idx];
        console.log(`Row ${idx + 1}:`);
        Object.keys(row).forEach(key => {
          let value = row[key];
          if (typeof value === 'string' && value.length > 500) {
            value = value.substring(0, 500) + '... [truncated]';
          }
          console.log(`  ${key}: ${value}`);
        });
        console.log('');
      });
    }
    
    db.close();
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

// Inspect both databases
inspectDatabase(currentDbPath, 'CURRENT DATABASE');
inspectDatabase(otherDbPath, 'OTHER LARGE DATABASE');
















