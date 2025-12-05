/**
 * Check cursorDiskKV table for chat history
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const os = require('os');

const APPDATA = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const globalDbPath = path.join(APPDATA, 'Cursor', 'User', 'globalStorage', 'state.vscdb');

console.log('🔍 Checking cursorDiskKV Table\n');
console.log(`Database: ${globalDbPath}\n`);

if (!fs.existsSync(globalDbPath)) {
  console.log('❌ Database does not exist!');
  process.exit(1);
}

try {
  const db = new Database(globalDbPath, { readonly: true });
  
  // Get row count
  const count = db.prepare(`SELECT COUNT(*) as count FROM cursorDiskKV`).get();
  console.log(`📊 Total rows in cursorDiskKV: ${count.count}\n`);
  
  // Get schema
  const columns = db.prepare(`PRAGMA table_info(cursorDiskKV)`).all();
  console.log(`📋 Columns: ${columns.map(c => c.name).join(', ')}\n`);
  
  // Get all rows
  const allRows = db.prepare(`SELECT * FROM cursorDiskKV`).all();
  
  // Find chat-related keys
  console.log(`🔍 Searching for chat-related keys...\n`);
  
  const chatRows = allRows.filter(row => {
    const key = (row.key || '').toLowerCase();
    const value = (row.value || '').toLowerCase();
    return key.includes('chat') || 
           key.includes('conversation') ||
           key.includes('message') ||
           key.includes('cursor.chat') ||
           value.includes('"role"') ||
           value.includes('"user"') ||
           value.includes('"assistant"');
  });
  
  console.log(`Found ${chatRows.length} potentially chat-related rows\n`);
  
  // Group by key prefix
  const keyGroups = {};
  chatRows.forEach(row => {
    const key = row.key || 'unknown';
    const prefix = key.split('.')[0] || key.split('/')[0] || 'other';
    if (!keyGroups[prefix]) {
      keyGroups[prefix] = [];
    }
    keyGroups[prefix].push(row);
  });
  
  console.log(`📂 Grouped by key prefix:\n`);
  Object.keys(keyGroups).sort().forEach(prefix => {
    console.log(`   ${prefix}: ${keyGroups[prefix].length} rows`);
  });
  
  // Show sample keys
  console.log(`\n📋 Sample keys (first 30):\n`);
  allRows.slice(0, 30).forEach((row, i) => {
    const key = row.key || 'unknown';
    const valuePreview = (row.value || '').substring(0, 100);
    const isChat = chatRows.includes(row);
    const marker = isChat ? '💬' : '📄';
    console.log(`${marker} ${i + 1}. ${key}`);
    if (isChat) {
      console.log(`      Value: ${valuePreview}...`);
    }
  });
  
  // Show chat-related rows in detail
  if (chatRows.length > 0) {
    console.log(`\n💬 Chat-related rows (first 10):\n`);
    chatRows.slice(0, 10).forEach((row, i) => {
      console.log(`${i + 1}. Key: ${row.key}`);
      let value = row.value || '';
      if (value.length > 500) {
        value = value.substring(0, 500) + '... [truncated]';
      }
      console.log(`   Value: ${value}\n`);
    });
  }
  
  // Try to find conversation/chat IDs
  console.log(`\n🔍 Looking for conversation patterns...\n`);
  const conversationKeys = allRows
    .map(r => r.key)
    .filter(k => {
      const key = (k || '').toLowerCase();
      return key.includes('conversation') || 
             key.match(/chat[\/\-_][a-f0-9\-]+/i) ||
             key.match(/cursor[\/\-_]chat/i);
    });
  
  if (conversationKeys.length > 0) {
    console.log(`Found ${conversationKeys.length} conversation-related keys:\n`);
    conversationKeys.slice(0, 20).forEach(key => {
      console.log(`   - ${key}`);
    });
  } else {
    console.log(`No obvious conversation keys found.`);
    console.log(`Checking all keys for patterns...\n`);
    
    // Show all unique key prefixes
    const prefixes = new Set();
    allRows.forEach(row => {
      const key = row.key || '';
      const parts = key.split(/[\/\-_\.]/);
      if (parts.length > 0) {
        prefixes.add(parts[0]);
      }
    });
    
    console.log(`Unique key prefixes (${prefixes.size}):\n`);
    Array.from(prefixes).sort().slice(0, 30).forEach(prefix => {
      console.log(`   - ${prefix}`);
    });
  }
  
  db.close();
  
} catch (error) {
  console.error(`\n❌ Error:`, error.message);
  process.exit(1);
}
















