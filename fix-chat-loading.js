/**
 * Fix chat loading issues by:
 * 1. Verifying session links match actual chat data
 * 2. Rebuilding interactive.sessions if needed
 * 3. Checking for orphaned sessions
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const APPDATA = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const GLOBAL_STORAGE = path.join(APPDATA, 'Cursor', 'User', 'globalStorage');
const globalDbPath = path.join(GLOBAL_STORAGE, 'state.vscdb');

let Database;
try {
  Database = require('better-sqlite3');
} catch (e) {
  console.error('❌ better-sqlite3 not installed. Run: npm install better-sqlite3');
  process.exit(1);
}

console.log('🔧 Fixing Cursor Chat Loading Issues\n');
console.log('='.repeat(70) + '\n');

if (!fs.existsSync(globalDbPath)) {
  console.error('❌ Database not found at: ' + globalDbPath);
  process.exit(1);
}

// Create backup first
const backupPath = globalDbPath + '.backup-' + Date.now();
console.log('📦 Creating backup...');
fs.copyFileSync(globalDbPath, backupPath);
console.log(`✅ Backup created: ${path.basename(backupPath)}\n`);

const db = new Database(globalDbPath);

try {
  // Get all composerData entries (actual chats)
  const composerData = db.prepare("SELECT key, value FROM cursorDiskKV WHERE key LIKE 'composerData:%'").all();
  console.log(`📊 Found ${composerData.length} chat sessions in database\n`);
  
  if (composerData.length === 0) {
    console.log('⚠️  No chat sessions found. Nothing to fix.');
    db.close();
    process.exit(0);
  }
  
  // Extract session IDs
  const sessionIds = composerData.map(row => row.key.replace('composerData:', ''));
  console.log('📋 Session IDs found:');
  sessionIds.forEach((id, i) => {
    console.log(`   ${i + 1}. ${id.substring(0, 8)}...`);
  });
  console.log('');
  
  // Get current interactive.sessions
  const sessionsItem = db.prepare("SELECT * FROM ItemTable WHERE key = 'interactive.sessions'").get();
  let currentSessions = {};
  
  if (sessionsItem) {
    try {
      currentSessions = JSON.parse(sessionsItem.value);
      console.log(`📊 Current interactive.sessions has ${Object.keys(currentSessions).length} entries\n`);
    } catch (e) {
      console.log('⚠️  Could not parse interactive.sessions, will rebuild\n');
    }
  } else {
    console.log('⚠️  interactive.sessions not found, will create\n');
  }
  
  // Build new sessions object with only sessions that have actual chat data
  const newSessions = {};
  let fixed = 0;
  let removed = 0;
  
  sessionIds.forEach(sessionId => {
    // Check if this session has messages
    const messageCount = db.prepare("SELECT COUNT(*) as count FROM cursorDiskKV WHERE key LIKE ?").get(`bubbleId:${sessionId}:%`);
    
    if (messageCount && messageCount.count > 0) {
      // Use existing session data if available, or create minimal entry
      if (currentSessions[sessionId]) {
        newSessions[sessionId] = currentSessions[sessionId];
      } else {
        // Create minimal session entry
        newSessions[sessionId] = {
          id: sessionId,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        fixed++;
      }
    } else {
      console.log(`⚠️  Session ${sessionId.substring(0, 8)}... has no messages, skipping`);
      removed++;
    }
  });
  
  // Check for orphaned sessions (in interactive.sessions but no chat data)
  const orphaned = Object.keys(currentSessions).filter(id => !sessionIds.includes(id));
  if (orphaned.length > 0) {
    console.log(`\n⚠️  Found ${orphaned.length} orphaned sessions (in interactive.sessions but no chat data)`);
    console.log('   These will be removed from interactive.sessions\n');
    removed += orphaned.length;
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   - Valid sessions: ${Object.keys(newSessions).length}`);
  console.log(`   - Sessions to add: ${fixed}`);
  console.log(`   - Sessions to remove: ${removed}\n`);
  
  // Update interactive.sessions
  if (Object.keys(newSessions).length > 0) {
    console.log('💾 Updating interactive.sessions...');
    
    // Delete old entry
    db.prepare("DELETE FROM ItemTable WHERE key = 'interactive.sessions'").run();
    
    // Insert new entry
    db.prepare("INSERT INTO ItemTable (key, value) VALUES (?, ?)").run(
      'interactive.sessions',
      JSON.stringify(newSessions)
    );
    
    console.log('✅ interactive.sessions updated!\n');
  } else {
    console.log('⚠️  No valid sessions to link. Chats may be in a different format.\n');
  }
  
  // Verify the update
  const verifyItem = db.prepare("SELECT * FROM ItemTable WHERE key = 'interactive.sessions'").get();
  if (verifyItem) {
    const verifySessions = JSON.parse(verifyItem.value);
    console.log(`✅ Verification: interactive.sessions now has ${Object.keys(verifySessions).length} entries\n`);
  }
  
  console.log('='.repeat(70));
  console.log('\n✅ Fix complete!\n');
  console.log('💡 Next steps:');
  console.log('   1. Close Cursor completely');
  console.log('   2. Restart Cursor');
  console.log('   3. Check chat history panel (Alt+Ctrl+\')');
  console.log('   4. If chats still don\'t appear, the issue may be:');
  console.log('      - Cursor version incompatibility');
  console.log('      - Account/user ID mismatch');
  console.log('      - Cache needs clearing (run: node clear-cursor-cache.js)\n');
  
} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error('\n💡 Restoring from backup...');
  try {
    fs.copyFileSync(backupPath, globalDbPath);
    console.log('✅ Database restored from backup');
  } catch (e) {
    console.error('❌ Could not restore backup:', e.message);
  }
  process.exit(1);
} finally {
  db.close();
}











