/**
 * Check globalStorage database for chat history
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const os = require('os');

const APPDATA = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const globalDbPath = path.join(APPDATA, 'Cursor', 'User', 'globalStorage', 'state.vscdb');

console.log('🔍 Checking Global Storage Database\n');
console.log(`Database: ${globalDbPath}\n`);

if (!fs.existsSync(globalDbPath)) {
  console.log('❌ Database does not exist!');
  process.exit(1);
}

try {
  const db = new Database(globalDbPath, { readonly: true });
  
  // Get all tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  console.log(`📊 Found ${tables.length} tables:\n`);
  
  let totalRows = 0;
  let chatRows = 0;
  
  for (const table of tables) {
    try {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
      const rowCount = count ? count.count : 0;
      totalRows += rowCount;
      
      // Get table schema
      const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
      const columnNames = columns.map(c => c.name).join(', ');
      
      // Check if it's chat-related
      const tableNameLower = table.name.toLowerCase();
      const columnsLower = columnNames.toLowerCase();
      const isChatRelated = tableNameLower.includes('chat') || 
                           tableNameLower.includes('message') || 
                           tableNameLower.includes('conversation') ||
                           columnsLower.includes('chat') ||
                           columnsLower.includes('message') ||
                           columnsLower.includes('conversation');
      
      if (isChatRelated) {
        chatRows += rowCount;
      }
      
      const marker = isChatRelated ? '💬' : '📋';
      console.log(`${marker} ${table.name}: ${rowCount} rows`);
      console.log(`   Columns: ${columnNames}`);
      
      // If it's ItemTable, check for chat keys
      if (table.name === 'ItemTable' && rowCount > 0) {
        console.log(`\n   🔍 Searching for chat-related keys in ItemTable...\n`);
        
        // Get all keys
        const allRows = db.prepare(`SELECT key FROM ItemTable`).all();
        const chatKeys = allRows
          .map(r => r.key)
          .filter(key => {
            const keyLower = key.toLowerCase();
            return keyLower.includes('chat') || 
                   keyLower.includes('conversation') ||
                   keyLower.includes('message') ||
                   keyLower.includes('cursor.chat') ||
                   keyLower.includes('aichat');
          });
        
        console.log(`   Found ${chatKeys.length} chat-related keys:\n`);
        chatKeys.slice(0, 20).forEach(key => {
          console.log(`   - ${key}`);
        });
        
        if (chatKeys.length > 20) {
          console.log(`   ... and ${chatKeys.length - 20} more`);
        }
        
        // Get sample values for chat keys
        if (chatKeys.length > 0) {
          console.log(`\n   📄 Sample chat data:\n`);
          const sampleKey = chatKeys[0];
          const sampleRow = db.prepare(`SELECT value FROM ItemTable WHERE key = ?`).get(sampleKey);
          if (sampleRow) {
            let value = sampleRow.value;
            if (typeof value === 'string' && value.length > 500) {
              value = value.substring(0, 500) + '... [truncated]';
            }
            console.log(`   Key: ${sampleKey}`);
            console.log(`   Value preview: ${value.substring(0, 200)}...\n`);
          }
        }
      }
      
      console.log('');
    } catch (error) {
      console.log(`   ⚠️  Error reading table: ${error.message}`);
    }
  }
  
  console.log(`\n📈 Summary:`);
  console.log(`   Total tables: ${tables.length}`);
  console.log(`   Total rows: ${totalRows}`);
  console.log(`   Chat-related rows: ${chatRows}`);
  
  if (chatRows > 0 || totalRows > 100) {
    console.log(`\n✅ This database likely contains your chat history!`);
  }
  
  db.close();
  
} catch (error) {
  console.error(`\n❌ Error reading database:`, error.message);
  if (error.message.includes('database is locked')) {
    console.log(`\n⚠️  Database is locked! Cursor must be closed to inspect it.`);
  }
  process.exit(1);
}
















