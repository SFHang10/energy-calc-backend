/**
 * Check which workspace the chats are associated with
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const os = require('os');

const APPDATA = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const globalDbPath = path.join(APPDATA, 'Cursor', 'User', 'globalStorage', 'state.vscdb');

console.log('🔍 Checking Chat Workspace Association\n');

if (!fs.existsSync(globalDbPath)) {
  console.log('❌ Database does not exist!');
  process.exit(1);
}

try {
  const db = new Database(globalDbPath, { readonly: true });
  
  // Get a sample chat bubble to see its structure
  const mainConversationId = '12a35db3-caec-4775-90dd-94e45151e9ba';
  const sampleBubble = db.prepare(`SELECT * FROM cursorDiskKV WHERE key LIKE ? LIMIT 1`).get(`bubbleId:${mainConversationId}:%`);
  
  if (sampleBubble) {
    console.log('📄 Sample Chat Bubble Structure:\n');
    console.log(`Key: ${sampleBubble.key}\n`);
    
    try {
      const value = JSON.parse(sampleBubble.value);
      console.log('Value structure:');
      console.log(JSON.stringify(value, null, 2).substring(0, 2000));
      console.log('\n... [truncated]\n');
      
      // Check for workspace-related fields
      if (value.workspacePath || value.workspaceId || value.workspaceHash) {
        console.log('\n🔍 Workspace info in chat data:');
        if (value.workspacePath) console.log(`  workspacePath: ${value.workspacePath}`);
        if (value.workspaceId) console.log(`  workspaceId: ${value.workspaceId}`);
        if (value.workspaceHash) console.log(`  workspaceHash: ${value.workspaceHash}`);
      }
    } catch (e) {
      console.log('Could not parse as JSON');
    }
  }
  
  // Check composerData for workspace info
  const composerData = db.prepare(`SELECT * FROM cursorDiskKV WHERE key = ?`).get(`composerData:${mainConversationId}`);
  if (composerData) {
    console.log('\n📝 Composer Data:\n');
    try {
      const value = JSON.parse(composerData.value);
      console.log('Composer structure:');
      console.log(JSON.stringify(value, null, 2).substring(0, 1000));
      console.log('\n... [truncated]\n');
    } catch (e) {
      console.log('Could not parse composer data as JSON');
    }
  }
  
  // Check if there are any workspace transfer or migration keys
  console.log('\n🔍 Checking for workspace transfer/migration data...\n');
  const transferData = db.prepare(`SELECT * FROM ItemTable WHERE key LIKE '%transfer%' OR key LIKE '%migration%' OR key LIKE '%workspace%'`).all();
  if (transferData.length > 0) {
    transferData.forEach(row => {
      console.log(`  ${row.key}: ${row.value.substring(0, 200)}`);
    });
  }
  
  // Check all workspace hashes mentioned in chat keys
  console.log('\n🔍 All workspace/conversation IDs found in chats:\n');
  const allChatKeys = db.prepare(`SELECT key FROM cursorDiskKV WHERE key LIKE 'bubbleId:%' OR key LIKE 'composerData:%'`).all();
  const workspaceIds = new Set();
  allChatKeys.forEach(row => {
    const matches = row.key.match(/^[^:]+:([a-f0-9-]{36})/);
    if (matches) {
      workspaceIds.add(matches[1]);
    }
  });
  
  console.log(`Found ${workspaceIds.size} unique workspace/conversation IDs:\n`);
  Array.from(workspaceIds).sort().forEach(id => {
    const count = allChatKeys.filter(k => k.key.includes(id)).length;
    console.log(`  ${id}: ${count} entries`);
  });
  
  // Check current workspace
  const currentWorkspacePath = process.cwd();
  const crypto = require('crypto');
  const currentWorkspaceHash = crypto.createHash('md5')
    .update(currentWorkspacePath.toLowerCase())
    .digest('hex');
  
  console.log(`\n📂 Current workspace:`);
  console.log(`  Path: ${currentWorkspacePath}`);
  console.log(`  Hash: ${currentWorkspaceHash}`);
  
  if (workspaceIds.has(currentWorkspaceHash)) {
    console.log(`\n✅ Current workspace hash found in chat data!`);
  } else {
    console.log(`\n⚠️  Current workspace hash NOT found in chat data.`);
    console.log(`   This might explain why chats aren't showing.`);
  }
  
  // Check if main conversation ID matches any workspace hash
  if (workspaceIds.has(mainConversationId)) {
    console.log(`\n💡 The main conversation ID (${mainConversationId}) is itself a workspace/conversation ID.`);
    console.log(`   This suggests chats might be organized by conversation/workspace context.`);
  }
  
  db.close();
  
} catch (error) {
  console.error(`\n❌ Error:`, error.message);
  process.exit(1);
}
















