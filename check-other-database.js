/**
 * Check the other large database for chats
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const os = require('os');

const APPDATA = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const WORKSPACE_STORAGE = path.join(APPDATA, 'Cursor', 'User', 'workspaceStorage');

// The other large database ID
const otherDbId = 'fe58f8872bb1c4d058df05fff78d1f1b';
const otherDbPath = path.join(WORKSPACE_STORAGE, otherDbId, 'state.vscdb');

console.log('🔍 Checking Other Large Database\n');
console.log(`Database: ${otherDbPath}\n`);

if (!fs.existsSync(otherDbPath)) {
  console.log('❌ Database does not exist!');
  process.exit(1);
}

try {
  const db = new Database(otherDbPath, { readonly: true });
  
  // Get all tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  console.log(`📊 Found ${tables.length} tables:\n`);
  
  let totalRows = 0;
  let chatRelatedRows = 0;
  const chatTables = [];
  
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
                           columnsLower.includes('conversation') ||
                           columnsLower.includes('content');
      
      if (isChatRelated) {
        chatRelatedRows += rowCount;
        chatTables.push({ name: table.name, rows: rowCount, columns: columnNames });
      }
      
      // Show table info
      const marker = isChatRelated ? '💬' : '📋';
      console.log(`${marker} ${table.name}: ${rowCount} rows`);
      
      if (isChatRelated && rowCount > 0) {
        console.log(`   Columns: ${columnNames}`);
        // Try to show a sample
        try {
          const sample = db.prepare(`SELECT * FROM ${table.name} LIMIT 1`).all();
          if (sample.length > 0) {
            const row = sample[0];
            const preview = Object.keys(row).slice(0, 5).map(k => {
              const val = row[k];
              if (typeof val === 'string' && val.length > 100) {
                return `${k}: "${val.substring(0, 100)}..."`;
              }
              return `${k}: ${JSON.stringify(val).substring(0, 100)}`;
            }).join('\n      ');
            console.log(`   Sample row:\n      ${preview}`);
          }
        } catch (e) {
          // Can't read sample
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
  console.log(`   Chat-related rows: ${chatRelatedRows}`);
  
  if (chatRelatedRows > 0) {
    console.log(`\n✅ FOUND CHATS! This database contains ${chatRelatedRows} chat-related rows.`);
    console.log(`\n💬 Chat tables found:`);
    chatTables.forEach(t => {
      console.log(`   - ${t.name}: ${t.rows} rows`);
    });
  } else {
    console.log(`\n⚠️  No chat-related data found in this database either.`);
  }
  
  db.close();
  
} catch (error) {
  console.error(`\n❌ Error reading database:`, error.message);
  if (error.message.includes('database is locked')) {
    console.log(`\n⚠️  Database is locked! Cursor must be closed to inspect it.`);
  }
  process.exit(1);
}
















