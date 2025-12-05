/**
 * Check for account/user IDs in chat data that might be causing the issue
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

console.log('🔍 Checking Account/User IDs in Chat Data\n');
console.log('='.repeat(60) + '\n');

const currentDb = new Database(path.join(GLOBAL_STORAGE, 'state.vscdb'), { readonly: true });
const backupDb = new Database(path.join(GLOBAL_STORAGE, 'state.vscdb.backup'), { readonly: true });

try {
  // Check for account-related keys
  console.log('📂 Checking for account/user ID keys...\n');
  
  const currentAccountKeys = currentDb.prepare("SELECT key FROM ItemTable WHERE key LIKE '%account%' OR key LIKE '%user%' OR key LIKE '%auth%' OR key LIKE '%email%'").all();
  const backupAccountKeys = backupDb.prepare("SELECT key FROM ItemTable WHERE key LIKE '%account%' OR key LIKE '%user%' OR key LIKE '%auth%' OR key LIKE '%email%'").all();
  
  console.log(`Current account-related keys: ${currentAccountKeys.length}`);
  currentAccountKeys.forEach(item => console.log(`   - ${item.key}`));
  console.log('');
  
  console.log(`Backup account-related keys: ${backupAccountKeys.length}`);
  backupAccountKeys.forEach(item => console.log(`   - ${item.key}`));
  console.log('');
  
  // Check cursorAuth keys specifically
  const currentAuth = currentDb.prepare("SELECT * FROM ItemTable WHERE key LIKE 'cursorAuth%' OR key LIKE 'cursorai%'").all();
  const backupAuth = backupDb.prepare("SELECT * FROM ItemTable WHERE key LIKE 'cursorAuth%' OR key LIKE 'cursorai%'").all();
  
  console.log(`Current auth keys: ${currentAuth.length}`);
  currentAuth.forEach(item => {
    console.log(`   - ${item.key}`);
    try {
      const value = JSON.parse(item.value);
      if (typeof value === 'object') {
        console.log(`     Keys: ${Object.keys(value).join(', ')}`);
      }
    } catch (e) {
      // Not JSON
    }
  });
  console.log('');
  
  console.log(`Backup auth keys: ${backupAuth.length}`);
  backupAuth.forEach(item => {
    console.log(`   - ${item.key}`);
    try {
      const value = JSON.parse(item.value);
      if (typeof value === 'object') {
        console.log(`     Keys: ${Object.keys(value).join(', ')}`);
      }
    } catch (e) {
      // Not JSON
    }
  });
  console.log('');
  
  // Check a sample composerData for account info
  const sampleComposer = backupDb.prepare("SELECT * FROM cursorDiskKV WHERE key LIKE 'composerData:%' LIMIT 1").get();
  if (sampleComposer) {
    try {
      const parsed = JSON.parse(sampleComposer.value);
      console.log('📂 Sample composerData account info...\n');
      
      // Look for any account-related fields
      const accountFields = Object.keys(parsed).filter(k => 
        k.toLowerCase().includes('account') ||
        k.toLowerCase().includes('user') ||
        k.toLowerCase().includes('auth') ||
        k.toLowerCase().includes('email') ||
        k.toLowerCase().includes('id')
      );
      
      if (accountFields.length > 0) {
        console.log(`Found account-related fields: ${accountFields.join(', ')}\n`);
        accountFields.forEach(field => {
          console.log(`   ${field}: ${JSON.stringify(parsed[field]).substring(0, 100)}`);
        });
      } else {
        console.log('No obvious account-related fields in composerData\n');
      }
    } catch (e) {
      console.log(`Could not parse composerData: ${e.message}\n`);
    }
  }

} finally {
  currentDb.close();
  backupDb.close();
}

console.log('='.repeat(60));
console.log('\n✅ Check complete!\n');












