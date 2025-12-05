const fs = require('fs');
const path = require('path');

const backupPath = './database/backups/backup_session_2025-10-22T18-30-37-865Z/energy_calculator.db';

console.log('🔍 Checking backup file...');

if (fs.existsSync(backupPath)) {
    console.log('✅ Backup file exists:', backupPath);
    const stats = fs.statSync(backupPath);
    console.log('📅 Backup created:', stats.birthtime);
    console.log('📏 Backup size:', stats.size, 'bytes');
    
    // Check if it's the same as current
    const currentPath = './database/energy_calculator.db';
    if (fs.existsSync(currentPath)) {
        const currentStats = fs.statSync(currentPath);
        console.log('📏 Current size:', currentStats.size, 'bytes');
        
        if (stats.size === currentStats.size) {
            console.log('✅ Backup and current files are the same size');
        } else {
            console.log('❌ Backup and current files are different sizes');
        }
    }
} else {
    console.log('❌ Backup file not found:', backupPath);
    
    // List what's in the backup directory
    const backupDir = './database/backups/backup_session_2025-10-22T18-30-37-865Z/';
    if (fs.existsSync(backupDir)) {
        console.log('📁 Backup directory contents:');
        const files = fs.readdirSync(backupDir);
        files.forEach(file => {
            const filePath = path.join(backupDir, file);
            const fileStats = fs.statSync(filePath);
            console.log(`  - ${file}: ${fileStats.size} bytes`);
        });
    } else {
        console.log('❌ Backup directory not found:', backupDir);
    }
}



















