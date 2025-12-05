/**
 * Find where Cursor actually stores chat history
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const APPDATA = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const CURSOR_USER = path.join(APPDATA, 'Cursor', 'User');

console.log('🔍 Searching for Cursor Chat Storage\n');
console.log(`Cursor User folder: ${CURSOR_USER}\n`);

// Check various storage locations
const locations = [
  'workspaceStorage',
  'globalStorage',
  'History',
  'storage',
  'User History'
];

function searchDirectory(dir, depth = 0, maxDepth = 3) {
  if (depth > maxDepth) return [];
  
  const results = [];
  
  try {
    if (!fs.existsSync(dir)) return results;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Check if directory name suggests chat storage
        const nameLower = entry.name.toLowerCase();
        if (nameLower.includes('chat') || 
            nameLower.includes('conversation') ||
            nameLower.includes('history') ||
            nameLower.includes('storage')) {
          results.push({ type: 'directory', path: fullPath, name: entry.name });
        }
        
        // Recurse into subdirectories
        results.push(...searchDirectory(fullPath, depth + 1, maxDepth));
      } else if (entry.isFile()) {
        // Check for database files
        if (entry.name.endsWith('.vscdb') || 
            entry.name.endsWith('.db') ||
            entry.name.endsWith('.sqlite') ||
            entry.name.endsWith('.sqlite3')) {
          const stats = fs.statSync(fullPath);
          if (stats.size > 1024) { // At least 1KB
            results.push({ 
              type: 'database', 
              path: fullPath, 
              name: entry.name,
              size: stats.size,
              sizeMB: (stats.size / 1024 / 1024).toFixed(2)
            });
          }
        }
        // Check for JSON files that might contain chats
        if (entry.name.endsWith('.json') && entry.name.toLowerCase().includes('chat')) {
          const stats = fs.statSync(fullPath);
          results.push({ 
            type: 'json', 
            path: fullPath, 
            name: entry.name,
            size: stats.size
          });
        }
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return results;
}

// Search in Cursor User folder
console.log('📂 Searching Cursor User folder...\n');
const allResults = searchDirectory(CURSOR_USER);

// Group results
const databases = allResults.filter(r => r.type === 'database');
const chatDirs = allResults.filter(r => r.type === 'directory');
const jsonFiles = allResults.filter(r => r.type === 'json');

console.log(`\n📊 Found:\n`);
console.log(`   Databases: ${databases.length}`);
console.log(`   Chat-related directories: ${chatDirs.length}`);
console.log(`   Chat JSON files: ${jsonFiles.length}\n`);

if (databases.length > 0) {
  console.log(`\n💾 Databases found:\n`);
  databases.forEach((db, i) => {
    console.log(`${i + 1}. ${db.name}`);
    console.log(`   Path: ${db.path}`);
    console.log(`   Size: ${db.sizeMB} MB\n`);
  });
}

if (chatDirs.length > 0) {
  console.log(`\n📁 Chat-related directories:\n`);
  chatDirs.forEach((dir, i) => {
    console.log(`${i + 1}. ${dir.name}`);
    console.log(`   Path: ${dir.path}\n`);
  });
}

if (jsonFiles.length > 0) {
  console.log(`\n📄 Chat JSON files:\n`);
  jsonFiles.forEach((file, i) => {
    console.log(`${i + 1}. ${file.name}`);
    console.log(`   Path: ${file.path}`);
    console.log(`   Size: ${(file.size / 1024).toFixed(2)} KB\n`);
  });
}

// Also check globalStorage specifically
const globalStorage = path.join(CURSOR_USER, 'globalStorage');
if (fs.existsSync(globalStorage)) {
  console.log(`\n🔍 Checking globalStorage folder...\n`);
  const globalDirs = fs.readdirSync(globalStorage, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => ({ name: e.name, path: path.join(globalStorage, e.name) }));
  
  console.log(`Found ${globalDirs.length} folders in globalStorage:\n`);
  globalDirs.forEach((dir, i) => {
    console.log(`${i + 1}. ${dir.name}`);
    
    // Check for database files in this folder
    try {
      const files = fs.readdirSync(dir.path);
      const dbFiles = files.filter(f => f.endsWith('.vscdb') || f.endsWith('.db'));
      if (dbFiles.length > 0) {
        dbFiles.forEach(dbFile => {
          const dbPath = path.join(dir.path, dbFile);
          const stats = fs.statSync(dbPath);
          console.log(`   📊 ${dbFile}: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        });
      }
    } catch (e) {
      // Can't read
    }
    console.log('');
  });
}

console.log(`\n✅ Search complete!`);
















