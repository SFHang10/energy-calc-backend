/**
 * Check account context and chat associations
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const os = require('os');

const APPDATA = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const globalDbPath = path.join(APPDATA, 'Cursor', 'User', 'globalStorage', 'state.vscdb');

console.log('🔍 Checking Account Context and Chat Associations\n');

if (!fs.existsSync(globalDbPath)) {
  console.log('❌ Database does not exist!');
  process.exit(1);
}

try {
  const db = new Database(globalDbPath, { readonly: true });
  
  // Get all rows from cursorDiskKV
  const allRows = db.prepare(`SELECT * FROM cursorDiskKV`).all();
  
  // Find account-related keys
  console.log('🔑 Looking for account-related keys...\n');
  const accountKeys = allRows
    .map(r => r.key)
    .filter(k => {
      const key = (k || '').toLowerCase();
      return key.includes('account') || 
             key.includes('user') ||
             key.includes('auth') ||
             key.includes('cursor.auth') ||
             key.includes('machineid') ||
             key.includes('session');
    });
  
  console.log(`Found ${accountKeys.length} account-related keys:\n`);
  accountKeys.forEach(key => {
    const row = allRows.find(r => r.key === key);
    let value = row.value || '';
    if (typeof value === 'string' && value.length > 200) {
      value = value.substring(0, 200) + '...';
    }
    console.log(`  ${key}`);
    console.log(`    Value: ${value}\n`);
  });
  
  // Analyze conversation IDs from chat data
  console.log('\n💬 Analyzing conversation/workspace IDs from chats...\n');
  const chatRows = allRows.filter(row => {
    const key = (row.key || '').toLowerCase();
    return key.includes('bubbleid') || 
           key.includes('messageRequestContext') ||
           key.includes('composerData');
  });
  
  // Extract unique conversation/workspace IDs
  const conversationIds = new Set();
  chatRows.forEach(row => {
    const key = row.key || '';
    // Extract IDs from keys like "bubbleId:12a35db3-caec-4775-90dd-94e45151e9ba:..."
    const matches = key.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/gi);
    if (matches) {
      matches.forEach(id => conversationIds.add(id));
    }
  });
  
  console.log(`Found ${conversationIds.size} unique conversation/workspace IDs in chat data:\n`);
  Array.from(conversationIds).sort().forEach(id => {
    const count = chatRows.filter(r => (r.key || '').includes(id)).length;
    console.log(`  ${id}: ${count} chat entries`);
  });
  
  // Check ItemTable for account info
  console.log('\n📋 Checking ItemTable for account/workspace info...\n');
  try {
    const itemRows = db.prepare(`SELECT * FROM ItemTable WHERE key LIKE '%account%' OR key LIKE '%auth%' OR key LIKE '%user%' OR key LIKE '%workspace%'`).all();
    if (itemRows.length > 0) {
      console.log(`Found ${itemRows.length} account-related items in ItemTable:\n`);
      itemRows.forEach(row => {
        let value = row.value || '';
        if (typeof value === 'string' && value.length > 300) {
          value = value.substring(0, 300) + '...';
        }
        console.log(`  ${row.key}`);
        console.log(`    Value: ${value}\n`);
      });
    }
  } catch (e) {
    console.log(`  Could not query ItemTable: ${e.message}`);
  }
  
  // Check for workspace storage references
  console.log('\n🔍 Checking for workspace storage references...\n');
  const workspaceRefs = allRows.filter(row => {
    const value = (row.value || '').toLowerCase();
    return value.includes('workspacestorage') || 
           value.includes('workspace') ||
           value.includes('ad317fcaae6c3b89d618237a0b77e170'); // Current workspace hash
  });
  
  if (workspaceRefs.length > 0) {
    console.log(`Found ${workspaceRefs.length} rows referencing workspace storage:\n`);
    workspaceRefs.slice(0, 5).forEach(row => {
      console.log(`  Key: ${row.key}`);
      let value = row.value || '';
      if (value.length > 200) {
        value = value.substring(0, 200) + '...';
      }
      console.log(`  Value: ${value}\n`);
    });
  }
  
  // Check if there are any keys that might indicate chat visibility settings
  console.log('\n👁️  Checking for chat visibility or display settings...\n');
  const visibilityKeys = allRows
    .map(r => r.key)
    .filter(k => {
      const key = (k || '').toLowerCase();
      return key.includes('hidden') || 
             key.includes('visible') ||
             key.includes('display') ||
             key.includes('show') ||
             key.includes('panel');
    });
  
  if (visibilityKeys.length > 0) {
    console.log(`Found ${visibilityKeys.length} visibility-related keys:\n`);
    visibilityKeys.slice(0, 10).forEach(key => {
      const row = allRows.find(r => r.key === key);
      console.log(`  ${key}: ${row.value}`);
    });
  }
  
  db.close();
  
  console.log('\n✅ Analysis complete!');
  
} catch (error) {
  console.error(`\n❌ Error:`, error.message);
  process.exit(1);
}
















