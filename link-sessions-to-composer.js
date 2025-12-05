/**
 * Link composerData sessions to interactive.sessions so Cursor can display them
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const APPDATA = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const CURSOR_USER = path.join(APPDATA, 'Cursor', 'User');
const GLOBAL_STORAGE = path.join(CURSOR_USER, 'globalStorage');

let Database;
try {
  Database = require('better-sqlite3');
} catch (e) {
  console.error('❌ better-sqlite3 not installed');
  process.exit(1);
}

console.log('🔗 Linking Composer Sessions to interactive.sessions\n');
console.log('='.repeat(60) + '\n');
console.log('⚠️  Make sure Cursor is CLOSED!\n');

const dbPath = path.join(GLOBAL_STORAGE, 'state.vscdb');
const db = new Database(dbPath);

try {
  // Check ItemTable schema
  const schema = db.prepare("PRAGMA table_info(ItemTable)").all();
  console.log('📊 ItemTable schema:');
  schema.forEach(col => console.log(`   - ${col.name} (${col.type})`));
  console.log('');

  // Get all composerData keys
  const composerData = db.prepare("SELECT key FROM cursorDiskKV WHERE key LIKE 'composerData:%'").all();
  console.log(`📊 Found ${composerData.length} composerData entries\n`);

  if (composerData.length === 0) {
    console.log('⚠️  No composerData found. Nothing to link.\n');
    process.exit(0);
  }

  // Extract session IDs from composerData keys
  // Format: composerData:sessionId
  const sessionIds = composerData.map(item => {
    const match = item.key.match(/^composerData:(.+)$/);
    return match ? match[1] : null;
  }).filter(id => id !== null);

  console.log(`📊 Found ${sessionIds.length} unique session IDs\n`);

  // Get current interactive.sessions
  let currentSessions = {};
  try {
    const sessionsItem = db.prepare("SELECT * FROM ItemTable WHERE key = 'interactive.sessions'").get();
    if (sessionsItem) {
      try {
        currentSessions = JSON.parse(sessionsItem.value);
      } catch (e) {
        // Not JSON or empty
      }
    }
  } catch (e) {
    // Key doesn't exist
  }

  console.log(`📊 Current interactive.sessions has ${Object.keys(currentSessions).length} entries\n`);

  // Build new sessions object with all composerData sessions
  const newSessions = { ...currentSessions };
  
  // Add all composerData sessions
  for (const sessionId of sessionIds) {
    if (!newSessions[sessionId]) {
      // Create a minimal session entry
      newSessions[sessionId] = {
        sessionId: sessionId,
        // Add minimal metadata - Cursor will populate the rest
      };
    }
  }

  console.log(`📊 New interactive.sessions will have ${Object.keys(newSessions).length} entries\n`);

  // Update interactive.sessions
  if (Object.keys(newSessions).length > Object.keys(currentSessions).length) {
    console.log('🔄 Updating interactive.sessions...\n');
    
    // Check if timestamp column exists
    const hasTimestamp = schema.some(col => col.name === 'timestamp');
    
    if (hasTimestamp) {
      db.prepare("INSERT OR REPLACE INTO ItemTable (key, value, timestamp) VALUES (?, ?, ?)")
        .run('interactive.sessions', JSON.stringify(newSessions), Date.now());
    } else {
      db.prepare("INSERT OR REPLACE INTO ItemTable (key, value) VALUES (?, ?)")
        .run('interactive.sessions', JSON.stringify(newSessions));
    }
    
    console.log(`✅ Updated interactive.sessions with ${Object.keys(newSessions).length} sessions!`);
    console.log('💡 Restart Cursor to see your chats\n');
  } else {
    console.log('✅ interactive.sessions already has all sessions\n');
  }

} finally {
  db.close();
}

console.log('='.repeat(60));
console.log('\n✅ Linking complete!\n');
