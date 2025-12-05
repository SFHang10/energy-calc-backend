/**
 * Inspect Cursor Database Contents
 * Shows what's actually stored in the database
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const os = require('os');

const APPDATA = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const WORKSPACE_STORAGE = path.join(APPDATA, 'Cursor', 'User', 'workspaceStorage');

// Get current workspace path and calculate hash
const currentWorkspacePath = process.cwd();
const crypto = require('crypto');
const workspaceHash = crypto.createHash('md5')
  .update(currentWorkspacePath.toLowerCase())
  .digest('hex');

const currentDbPath = path.join(WORKSPACE_STORAGE, workspaceHash, 'state.vscdb');

console.log('🔍 Inspecting Current Database\n');
console.log(`Workspace: ${currentWorkspacePath}`);
console.log(`Database: ${currentDbPath}\n`);

if (!fs.existsSync(currentDbPath)) {
  console.log('❌ Database does not exist!');
  process.exit(1);
}

try {
  const db = new Database(currentDbPath, { readonly: true });
  
  // Get all tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  console.log(`📊 Found ${tables.length} tables:\n`);
  
  let totalRows = 0;
  let chatRelatedRows = 0;
  
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
      }
      
      // Show table info
      const marker = isChatRelated ? '💬' : '📋';
      console.log(`${marker} ${table.name}: ${rowCount} rows`);
      
      if (rowCount > 0 && rowCount < 10) {
        // Show sample data for small tables
        try {
          const sample = db.prepare(`SELECT * FROM ${table.name} LIMIT 3`).all();
          if (sample.length > 0) {
            console.log(`   Columns: ${columnNames}`);
            if (isChatRelated) {
              // Show a preview of chat content
              sample.forEach((row, i) => {
                const keys = Object.keys(row);
                const preview = keys.slice(0, 3).map(k => {
                  const val = row[k];
                  if (typeof val === 'string' && val.length > 50) {
                    return `${k}: "${val.substring(0, 50)}..."`;
                  }
                  return `${k}: ${val}`;
                }).join(', ');
                console.log(`   Row ${i + 1}: ${preview}`);
              });
            }
          }
        } catch (e) {
          // Can't read data, that's okay
        }
      }
      
      // For chat-related tables, try to get more info
      if (isChatRelated && rowCount > 0) {
        try {
          // Try to find timestamp or date columns
          const dateColumns = columns.filter(c => 
            c.name.toLowerCase().includes('time') || 
            c.name.toLowerCase().includes('date') ||
            c.name.toLowerCase().includes('created') ||
            c.name.toLowerCase().includes('updated')
          );
          
          if (dateColumns.length > 0) {
            const dateCol = dateColumns[0].name;
            const oldest = db.prepare(`SELECT ${dateCol} FROM ${table.name} ORDER BY ${dateCol} ASC LIMIT 1`).get();
            const newest = db.prepare(`SELECT ${dateCol} FROM ${table.name} ORDER BY ${dateCol} DESC LIMIT 1`).get();
            if (oldest && newest) {
              console.log(`   Date range: ${oldest[dateCol]} to ${newest[dateCol]}`);
            }
          }
        } catch (e) {
          // Can't get dates, that's okay
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
  
  if (chatRelatedRows === 0) {
    console.log(`\n⚠️  WARNING: No chat-related data found in current database!`);
    console.log(`   This database appears to be empty of chats.`);
  } else {
    console.log(`\n✅ Found ${chatRelatedRows} chat-related rows in current database.`);
  }
  
  db.close();
  
} catch (error) {
  console.error(`\n❌ Error reading database:`, error.message);
  if (error.message.includes('database is locked')) {
    console.log(`\n⚠️  Database is locked! Cursor must be closed to inspect it.`);
  }
  process.exit(1);
}
















