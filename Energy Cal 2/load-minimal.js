// MINIMAL LOADER - STAGE 2
console.log('Loading backup...');
if (typeof BACKUP !== 'undefined') {
    console.log('Backup loaded:', BACKUP.count, 'products');
} else {
    console.log('Backup not found');
}


