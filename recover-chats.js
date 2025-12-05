/**
 * Recover Cursor chat history from backup databases
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const APPDATA = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const CURSOR_USER = path.join(APPDATA, 'Cursor', 'User');
const GLOBAL_STORAGE = path.join(CURSOR_USER, 'globalStorage');
const WORKSPACE_STORAGE = path.join(CURSOR_USER, 'workspaceStorage');

console.log('🔍 Cursor Chat Recovery Tool\n');
console.log(`Cursor User folder: ${CURSOR_USER}\n`);

// Check if sqlite3 is available
let hasSqlite3 = false;
try {
  execSync('sqlite3 --version', { stdio: 'ignore' });
  hasSqlite3 = true;
} catch (e) {
  console.log('⚠️  sqlite3 not found. Installing better-sqlite3...\n');
}

// Try to use better-sqlite3 if available, otherwise use sqlite3 command
let Database;
try {
  Database = require('better-sqlite3');
  console.log('✅ Using better-sqlite3\n');
} catch (e) {
  console.log('⚠️  better-sqlite3 not installed. Will try to use sqlite3 command line tool.\n');
  console.log('💡 To install better-sqlite3: npm install better-sqlite3\n');
}

function readDatabase(dbPath) {
  if (!fs.existsSync(dbPath)) {
    return null;
  }

  try {
    if (Database) {
      const db = new Database(dbPath, { readonly: true });
      return db;
    }
  } catch (e) {
    console.log(`   ⚠️  Could not open ${dbPath}: ${e.message}`);
    return null;
  }
  
  return null;
}

function extractChatsFromDatabase(db, dbPath) {
  const chats = [];
  
  try {
    // Try common table names for chat storage
    const possibleTables = [
      'ItemTable', 'Item', 'items', 'chats', 'conversations', 
      'messages', 'chat_history', 'conversation_history'
    ];
    
    // Get all tables
    let tables = [];
    try {
      if (db) {
        const allTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        tables = allTables.map(t => t.name);
      }
    } catch (e) {
      console.log(`   ⚠️  Could not read tables: ${e.message}`);
    }
    
    console.log(`   📊 Found tables: ${tables.join(', ')}`);
    
    // Look for chat-related data
    for (const table of tables) {
      try {
        if (db) {
          const rows = db.prepare(`SELECT * FROM ${table} LIMIT 5`).all();
          
          // Check if this looks like chat data
          if (rows.length > 0) {
            const firstRow = rows[0];
            const keys = Object.keys(firstRow);
            
            // Look for chat-related keys
            const chatKeys = keys.filter(k => 
              k.toLowerCase().includes('chat') ||
              k.toLowerCase().includes('message') ||
              k.toLowerCase().includes('conversation') ||
              k.toLowerCase().includes('content') ||
              k.toLowerCase().includes('text') ||
              k.toLowerCase().includes('prompt') ||
              k.toLowerCase().includes('response')
            );
            
            if (chatKeys.length > 0) {
              console.log(`   ✅ Found potential chat data in table: ${table}`);
              console.log(`      Keys: ${chatKeys.join(', ')}`);
              
              // Get all rows
              const allRows = db.prepare(`SELECT * FROM ${table}`).all();
              chats.push({
                table,
                count: allRows.length,
                sample: rows[0],
                allRows: allRows
              });
            }
          }
        }
      } catch (e) {
        // Skip tables we can't read
      }
    }
    
    // Also try to search for chat-related content in any text field
    for (const table of tables) {
      try {
        if (db) {
          const schema = db.prepare(`PRAGMA table_info(${table})`).all();
          const textColumns = schema.filter(col => 
            col.type && col.type.toLowerCase().includes('text')
          ).map(col => col.name);
          
          if (textColumns.length > 0) {
            for (const col of textColumns) {
              try {
                const query = `SELECT * FROM ${table} WHERE ${col} LIKE '%chat%' OR ${col} LIKE '%conversation%' OR ${col} LIKE '%message%' LIMIT 10`;
                const results = db.prepare(query).all();
                if (results.length > 0) {
                  console.log(`   ✅ Found chat-related content in ${table}.${col}`);
                  chats.push({
                    table,
                    column: col,
                    count: results.length,
                    rows: results
                  });
                }
              } catch (e) {
                // Skip if query fails
              }
            }
          }
        }
      } catch (e) {
        // Skip
      }
    }
    
  } catch (e) {
    console.log(`   ⚠️  Error reading database: ${e.message}`);
  }
  
  return chats;
}

function searchDatabase(dbPath, isBackup = false) {
  const label = isBackup ? 'BACKUP' : 'CURRENT';
  console.log(`\n📂 Checking ${label}: ${path.basename(dbPath)}`);
  
  if (!fs.existsSync(dbPath)) {
    console.log(`   ❌ File does not exist`);
    return null;
  }
  
  const stats = fs.statSync(dbPath);
  console.log(`   📊 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   📅 Modified: ${stats.mtime.toISOString()}`);
  
  const db = readDatabase(dbPath);
  if (!db) {
    return null;
  }
  
  const chats = extractChatsFromDatabase(db, dbPath);
  
  if (db && db.close) {
    db.close();
  }
  
  return { path: dbPath, chats, stats };
}

// Check global storage
console.log('🔍 Checking Global Storage...\n');
const globalDb = path.join(GLOBAL_STORAGE, 'state.vscdb');
const globalBackup = path.join(GLOBAL_STORAGE, 'state.vscdb.backup');

const globalCurrent = searchDatabase(globalDb, false);
const globalBackupData = searchDatabase(globalBackup, true);

// Check workspace storage
console.log('\n\n🔍 Checking Workspace Storage...\n');

const workspaceDirs = fs.existsSync(WORKSPACE_STORAGE) 
  ? fs.readdirSync(WORKSPACE_STORAGE, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .map(e => e.name)
  : [];

const workspaceResults = [];

for (const workspaceId of workspaceDirs) {
  const workspacePath = path.join(WORKSPACE_STORAGE, workspaceId);
  const dbPath = path.join(workspacePath, 'state.vscdb');
  const backupPath = path.join(workspacePath, 'state.vscdb.backup');
  
  if (fs.existsSync(dbPath) || fs.existsSync(backupPath)) {
    console.log(`\n📁 Workspace: ${workspaceId}`);
    
    const current = searchDatabase(dbPath, false);
    const backup = searchDatabase(backupPath, true);
    
    workspaceResults.push({
      workspaceId,
      current,
      backup
    });
  }
}

// Summary
console.log('\n\n📊 SUMMARY\n');
console.log('='.repeat(60));

if (globalCurrent && globalCurrent.chats && globalCurrent.chats.length > 0) {
  console.log('\n✅ Global Storage (Current) - Found chat data!');
  globalCurrent.chats.forEach(chat => {
    console.log(`   Table: ${chat.table}, Items: ${chat.count || chat.rows?.length || 0}`);
  });
}

if (globalBackupData && globalBackupData.chats && globalBackupData.chats.length > 0) {
  console.log('\n✅ Global Storage (Backup) - Found chat data!');
  globalBackupData.chats.forEach(chat => {
    console.log(`   Table: ${chat.table}, Items: ${chat.count || chat.rows?.length || 0}`);
  });
}

workspaceResults.forEach(result => {
  if (result.current && result.current.chats && result.current.chats.length > 0) {
    console.log(`\n✅ Workspace ${result.workspaceId} (Current) - Found chat data!`);
    result.current.chats.forEach(chat => {
      console.log(`   Table: ${chat.table}, Items: ${chat.count || chat.rows?.length || 0}`);
    });
  }
  if (result.backup && result.backup.chats && result.backup.chats.length > 0) {
    console.log(`\n✅ Workspace ${result.workspaceId} (Backup) - Found chat data!`);
    result.backup.chats.forEach(chat => {
      console.log(`   Table: ${chat.table}, Items: ${chat.count || chat.rows?.length || 0}`);
    });
  }
});

console.log('\n' + '='.repeat(60));
console.log('\n💡 Next steps:');
console.log('   1. Install better-sqlite3: npm install better-sqlite3');
console.log('   2. Run this script again to extract full chat data');
console.log('   3. Export chats to JSON files for backup\n');














