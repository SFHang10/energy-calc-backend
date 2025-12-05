/**
 * Check if chats are actually accessible and can be loaded
 * Verifies session links, message data, and data integrity
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
  console.error('❌ better-sqlite3 not installed');
  process.exit(1);
}

console.log('🔍 Checking Chat Accessibility\n');
console.log('='.repeat(70) + '\n');

if (!fs.existsSync(globalDbPath)) {
  console.error('❌ Database not found');
  process.exit(1);
}

const db = new Database(globalDbPath, { readonly: true });

try {
  // Get interactive.sessions
  const sessionsItem = db.prepare("SELECT * FROM ItemTable WHERE key = 'interactive.sessions'").get();
  let sessions = {};
  
  if (sessionsItem) {
    try {
      sessions = JSON.parse(sessionsItem.value);
      console.log(`📊 Found ${Object.keys(sessions).length} sessions in interactive.sessions\n`);
    } catch (e) {
      console.log('❌ Could not parse interactive.sessions\n');
      db.close();
      process.exit(1);
    }
  } else {
    console.log('❌ interactive.sessions not found\n');
    db.close();
    process.exit(1);
  }
  
  // Check each session
  const issues = [];
  const accessible = [];
  
  Object.keys(sessions).forEach((sessionId, index) => {
    console.log(`\n${index + 1}. Checking session: ${sessionId.substring(0, 8)}...`);
    
    const session = sessions[sessionId];
    const checks = {
      hasComposerData: false,
      hasMessages: false,
      messageCount: 0,
      hasValidData: false,
      errors: []
    };
    
    // Check if composerData exists
    const composerData = db.prepare("SELECT * FROM cursorDiskKV WHERE key = ?").get(`composerData:${sessionId}`);
    if (composerData) {
      checks.hasComposerData = true;
      console.log('   ✅ composerData found');
      
      // Try to parse it
      try {
        const data = JSON.parse(composerData.value);
        if (data.text || data.richText || data.messages || data.conversationMap) {
          checks.hasValidData = true;
          console.log('   ✅ composerData is valid');
        } else {
          checks.errors.push('composerData has no text/messages');
          console.log('   ⚠️  composerData exists but has no content');
        }
      } catch (e) {
        checks.errors.push('composerData is not valid JSON: ' + e.message);
        console.log('   ❌ composerData is corrupted: ' + e.message);
      }
    } else {
      checks.errors.push('No composerData found');
      console.log('   ❌ composerData NOT found');
    }
    
    // Check for messages (bubbleId entries)
    const messageCount = db.prepare("SELECT COUNT(*) as count FROM cursorDiskKV WHERE key LIKE ?").get(`bubbleId:${sessionId}:%`);
    if (messageCount && messageCount.count > 0) {
      checks.hasMessages = true;
      checks.messageCount = messageCount.count;
      console.log(`   ✅ Found ${messageCount.count} messages`);
    } else {
      checks.errors.push('No messages found');
      console.log('   ❌ No messages found');
    }
    
    // Check session metadata
    if (session.title) {
      console.log(`   📝 Title: ${session.title}`);
    }
    if (session.createdAt) {
      console.log(`   📅 Created: ${new Date(session.createdAt).toLocaleString()}`);
    }
    
    // Determine if accessible
    if (checks.hasComposerData && checks.hasMessages && checks.hasValidData) {
      accessible.push(sessionId);
      console.log('   ✅ Session is ACCESSIBLE');
    } else {
      issues.push({
        sessionId: sessionId,
        checks: checks
      });
      console.log('   ❌ Session has ISSUES');
      if (checks.errors.length > 0) {
        checks.errors.forEach(err => console.log(`      - ${err}`));
      }
    }
  });
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 SUMMARY\n');
  console.log(`Total sessions: ${Object.keys(sessions).length}`);
  console.log(`✅ Accessible: ${accessible.length}`);
  console.log(`❌ Has issues: ${issues.length}\n`);
  
  if (issues.length > 0) {
    console.log('🔧 ISSUES FOUND:\n');
    issues.forEach((issue, i) => {
      console.log(`${i + 1}. Session: ${issue.sessionId.substring(0, 8)}...`);
      issue.checks.errors.forEach(err => {
        console.log(`   - ${err}`);
      });
      console.log('');
    });
    
    console.log('💡 RECOMMENDATIONS:\n');
    
    // Check if we need to add missing sessions
    const allComposerData = db.prepare("SELECT key FROM cursorDiskKV WHERE key LIKE 'composerData:%'").all();
    const missingSessions = allComposerData.filter(row => {
      const sessionId = row.key.replace('composerData:', '');
      return !sessions[sessionId];
    });
    
    if (missingSessions.length > 0) {
      console.log(`⚠️  Found ${missingSessions.length} chat(s) with data but not in interactive.sessions:`);
      missingSessions.forEach(row => {
        const sessionId = row.key.replace('composerData:', '');
        const msgCount = db.prepare("SELECT COUNT(*) as count FROM cursorDiskKV WHERE key LIKE ?").get(`bubbleId:${sessionId}:%`);
        console.log(`   - ${sessionId.substring(0, 8)}... (${msgCount.count} messages)`);
      });
      console.log('\n   💡 These need to be added to interactive.sessions\n');
    }
    
    console.log('   Try running: node fix-chat-loading.js again');
    console.log('   Or: node clear-cursor-cache.js (with Cursor closed)\n');
  } else {
    console.log('✅ All sessions appear to be accessible!');
    console.log('💡 If chats still don\'t load in Cursor, try:');
    console.log('   1. Clear cache: node clear-cursor-cache.js');
    console.log('   2. Restart Cursor');
    console.log('   3. Check Cursor version compatibility\n');
  }
  
} finally {
  db.close();
}











