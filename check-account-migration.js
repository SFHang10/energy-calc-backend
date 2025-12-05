/**
 * Check account context for chats - anonymous vs signed-in account
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const os = require('os');

const APPDATA = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const globalDbPath = path.join(APPDATA, 'Cursor', 'User', 'globalStorage', 'state.vscdb');

console.log('🔍 Checking Account Context for Chats\n');

try {
  const db = new Database(globalDbPath, { readonly: true });
  
  // Check current account info
  console.log('👤 Current Account Information:\n');
  const accountInfo = db.prepare(`SELECT * FROM ItemTable WHERE key LIKE '%auth%' OR key LIKE '%account%' OR key LIKE '%user%'`).all();
  
  accountInfo.forEach(row => {
    if (row.key.includes('email') || row.key.includes('Email')) {
      console.log(`  ${row.key}: ${row.value}`);
    } else if (row.key.includes('token') || row.key.includes('Token')) {
      const value = row.value || '';
      console.log(`  ${row.key}: ${value.substring(0, 50)}... (truncated)`);
    } else {
      console.log(`  ${row.key}: ${row.value.substring(0, 100)}...`);
    }
  });
  
  // Check if there are multiple account contexts
  console.log('\n🔍 Checking for account/user IDs in chat data...\n');
  
  const chatConversationId = '12a35db3-caec-4775-90dd-94e45151e9ba';
  const sampleChats = db.prepare(`SELECT * FROM cursorDiskKV WHERE key LIKE ? LIMIT 10`).all(`bubbleId:${chatConversationId}:%`);
  
  // Look for account/user identifiers in chat data
  const accountIds = new Set();
  sampleChats.forEach(chat => {
    try {
      const value = JSON.parse(chat.value);
      const valueStr = JSON.stringify(value);
      
      // Look for user IDs, account IDs, or auth identifiers
      const userIdMatches = valueStr.match(/user[_\-]?id["\s:]+([a-f0-9\-]+)/gi);
      const accountMatches = valueStr.match(/account[_\-]?id["\s:]+([a-f0-9\-]+)/gi);
      const authMatches = valueStr.match(/auth0\|([a-z0-9_]+)/gi);
      
      if (userIdMatches) userIdMatches.forEach(m => accountIds.add(m));
      if (accountMatches) accountMatches.forEach(m => accountIds.add(m));
      if (authMatches) authMatches.forEach(m => accountIds.add(m));
    } catch (e) {
      // Not JSON
    }
  });
  
  if (accountIds.size > 0) {
    console.log('Found account/user identifiers in chat data:');
    Array.from(accountIds).forEach(id => console.log(`  ${id}`));
  } else {
    console.log('No explicit account identifiers found in chat data.');
    console.log('This suggests chats might be associated with anonymous/local account.');
  }
  
  // Check when chats were created vs when account was created
  console.log('\n📅 Checking timestamps...\n');
  
  // Get account creation/sign-in time
  const authToken = db.prepare(`SELECT value FROM ItemTable WHERE key = 'cursorAuth/accessToken'`).get();
  if (authToken) {
    try {
      // JWT tokens have timestamps - decode the payload (base64)
      const tokenParts = authToken.value.split('.');
      if (tokenParts.length >= 2) {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        if (payload.time) {
          const accountTime = new Date(parseInt(payload.time) * 1000);
          console.log(`  Account sign-in time: ${accountTime.toLocaleString()}`);
        }
        if (payload.sub) {
          console.log(`  Account user ID: ${payload.sub}`);
        }
      }
    } catch (e) {
      console.log(`  Could not decode token: ${e.message}`);
    }
  }
  
  // Check chat timestamps
  const chatTimestamps = [];
  sampleChats.forEach(chat => {
    try {
      const value = JSON.parse(chat.value);
      if (value.createdAt || value.timestamp || value.time) {
        chatTimestamps.push({
          key: chat.key,
          time: value.createdAt || value.timestamp || value.time
        });
      }
    } catch (e) {
      // Not JSON or no timestamp
    }
  });
  
  if (chatTimestamps.length > 0) {
    console.log(`\n  Found ${chatTimestamps.length} chats with timestamps`);
    const sorted = chatTimestamps.sort((a, b) => {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      return timeA - timeB;
    });
    if (sorted.length > 0) {
      console.log(`  Oldest chat: ${new Date(sorted[0].time).toLocaleString()}`);
      console.log(`  Newest chat: ${new Date(sorted[sorted.length - 1].time).toLocaleString()}`);
    }
  }
  
  // Check if there's a machine ID or anonymous account identifier
  console.log('\n🔍 Checking for machine/anonymous account identifiers...\n');
  
  const machineId = db.prepare(`SELECT value FROM ItemTable WHERE key LIKE '%machine%' OR key LIKE '%device%' OR key LIKE '%anonymous%'`).all();
  if (machineId.length > 0) {
    machineId.forEach(row => {
      console.log(`  ${row.key}: ${row.value}`);
    });
  } else {
    console.log('  No machine/anonymous identifiers found in ItemTable');
  }
  
  // Check cursorDiskKV for account context
  const allRows = db.prepare(`SELECT * FROM cursorDiskKV`).all();
  const accountContextKeys = allRows
    .map(r => r.key)
    .filter(k => {
      const key = (k || '').toLowerCase();
      return key.includes('account') || 
             key.includes('user') ||
             key.includes('auth') ||
             key.includes('machine');
    });
  
  if (accountContextKeys.length > 0) {
    console.log(`\n  Found ${accountContextKeys.length} account-related keys in cursorDiskKV:`);
    accountContextKeys.slice(0, 10).forEach(key => {
      console.log(`    ${key}`);
    });
  }
  
  db.close();
  
  console.log('\n✅ Analysis complete!');
  console.log('\n💡 Key Insight:');
  console.log('   If chats were created BEFORE you signed in, they are associated with');
  console.log('   an anonymous/local account context. After signing in, Cursor created');
  console.log('   a new account context and can\'t see the old anonymous account\'s chats.');
  
} catch (error) {
  console.error(`\n❌ Error:`, error.message);
  process.exit(1);
}
















