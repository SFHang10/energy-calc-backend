// Clear Node.js require cache
console.log('Clearing Node.js require cache...');
Object.keys(require.cache).forEach(key => {
  delete require.cache[key];
});

console.log('Starting server with fresh cache...');
require('./server.js'); 