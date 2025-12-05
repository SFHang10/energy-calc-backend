/**
 * Check workspace context mismatch - what Cursor expects vs what chats have
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const APPDATA = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const globalDbPath = path.join(APPDATA, 'Cursor', 'User', 'globalStorage', 'state.vscdb');
const WORKSPACE_STORAGE = path.join(APPDATA, 'Cursor', 'User', 'workspaceStorage');

console.log('🔍 Checking Workspace Context Mismatch\n');

// Current workspace
const currentWorkspacePath = process.cwd();
const currentWorkspaceHash = crypto.createHash('md5')
  .update(currentWorkspacePath.toLowerCase())
  .digest('hex');

console.log('📂 Current Workspace:');
console.log(`  Path: ${currentWorkspacePath}`);
console.log(`  Hash: ${currentWorkspaceHash}\n`);

// Chat conversation ID
const chatConversationId = '12a35db3-caec-4775-90dd-94e45151e9ba';
console.log(`💬 Chat Conversation ID: ${chatConversationId}\n`);

try {
  const db = new Database(globalDbPath, { readonly: true });
  
  // Check what workspace context the current workspace database expects
  const currentWorkspaceDbPath = path.join(WORKSPACE_STORAGE, currentWorkspaceHash, 'state.vscdb');
  if (fs.existsSync(currentWorkspaceDbPath)) {
    console.log('📊 Checking current workspace database for chat references...\n');
    try {
      const workspaceDb = new Database(currentWorkspaceDbPath, { readonly: true });
      
      // Check ItemTable for chat/composer references
      const chatRefs = workspaceDb.prepare(`SELECT * FROM ItemTable WHERE key LIKE '%chat%' OR key LIKE '%composer%' OR key LIKE '%conversation%'`).all();
      
      if (chatRefs.length > 0) {
        console.log('Found chat-related keys in current workspace:');
        chatRefs.forEach(row => {
          console.log(`  ${row.key}: ${row.value.substring(0, 200)}`);
        });
      } else {
        console.log('  No chat references found in current workspace database.');
      }
      
      workspaceDb.close();
    } catch (e) {
      console.log(`  Could not read workspace database: ${e.message}`);
    }
  }
  
  // Check globalStorage for workspace-to-conversation mappings
  console.log('\n🔍 Checking for workspace-to-conversation mappings...\n');
  
  // Look for keys that might map workspace to conversation
  const allRows = db.prepare(`SELECT * FROM cursorDiskKV`).all();
  
  // Check if there's a mapping from workspace hash to conversation ID
  const workspaceMappings = allRows.filter(row => {
    const key = row.key || '';
    const value = row.value || '';
    return key.includes(currentWorkspaceHash) || 
           value.includes(currentWorkspaceHash) ||
           (key.includes('workspace') && value.includes(chatConversationId));
  });
  
  if (workspaceMappings.length > 0) {
    console.log(`Found ${workspaceMappings.length} potential workspace mappings:`);
    workspaceMappings.slice(0, 10).forEach(row => {
      console.log(`  Key: ${row.key}`);
      console.log(`  Value: ${row.value.substring(0, 200)}`);
      console.log('');
    });
  } else {
    console.log('  No workspace-to-conversation mappings found.');
  }
  
  // Check composerData for the conversation ID
  console.log('\n🔍 Checking composerData for conversation ID...\n');
  const composerData = db.prepare(`SELECT * FROM cursorDiskKV WHERE key = ?`).get(`composerData:${chatConversationId}`);
  
  if (composerData) {
    console.log('Found composerData for conversation ID');
    try {
      const value = JSON.parse(composerData.value);
      console.log(`  Composer ID: ${value.composerId}`);
      console.log(`  Version: ${value._v}`);
      if (value.fullConversationHeadersOnly) {
        console.log(`  Conversation bubbles: ${value.fullConversationHeadersOnly.length}`);
      }
    } catch (e) {
      console.log('  Could not parse composer data');
    }
  } else {
    console.log('  No composerData found for this conversation ID');
  }
  
  // Check if there are any active composer references
  console.log('\n🔍 Checking for active composer references...\n');
  const activeComposers = allRows
    .map(r => r.key)
    .filter(k => k.startsWith('composerData:') && k !== `composerData:${chatConversationId}`);
  
  if (activeComposers.length > 0) {
    console.log(`Found ${activeComposers.length} other composer references:`);
    activeComposers.slice(0, 10).forEach(key => {
      console.log(`  ${key}`);
    });
  }
  
  // Check ItemTable for workspace transfer or chat settings
  console.log('\n🔍 Checking ItemTable for chat/workspace settings...\n');
  const itemRows = db.prepare(`SELECT * FROM ItemTable WHERE key LIKE '%chat%' OR key LIKE '%workspace%' OR key LIKE '%transfer%'`).all();
  
  if (itemRows.length > 0) {
    itemRows.forEach(row => {
      console.log(`  ${row.key}: ${row.value.substring(0, 300)}`);
    });
  }
  
  // The key question: Is the conversation ID supposed to match the workspace hash?
  console.log('\n💡 Analysis:\n');
  console.log(`  Current workspace hash: ${currentWorkspaceHash}`);
  console.log(`  Chat conversation ID:   ${chatConversationId}`);
  console.log(`  Match: ${currentWorkspaceHash === chatConversationId ? 'YES ✅' : 'NO ❌'}\n`);
  
  if (currentWorkspaceHash !== chatConversationId) {
    console.log('  This is the problem! Cursor is looking for chats with conversation ID');
    console.log(`  matching the workspace hash (${currentWorkspaceHash}), but your chats`);
    console.log(`  are stored under a different conversation ID (${chatConversationId}).\n`);
    console.log('  Possible reasons:');
    console.log('  1. After the upgrade, Cursor changed how it generates conversation IDs');
    console.log('  2. The conversation ID was created before the workspace was properly initialized');
    console.log('  3. There\'s a bug in Cursor\'s workspace-to-conversation mapping after upgrade');
  }
  
  db.close();
  
} catch (error) {
  console.error(`\n❌ Error:`, error.message);
  process.exit(1);
}
















