console.log('Testing individual route files...');

console.log('\n1. Testing members.js...');
try {
  const members = require('./routes/members');
  console.log('✅ Members route loaded successfully');
  console.log('Type:', typeof members);
  console.log('Is Router:', members.constructor.name);
} catch (e) {
  console.log('❌ Members error:', e.message);
  console.log('Stack:', e.stack);
}

console.log('\n2. Testing subscriptions.js...');
try {
  const subscriptions = require('./routes/subscriptions');
  console.log('✅ Subscriptions route loaded successfully');
  console.log('Type:', typeof subscriptions);
  console.log('Is Router:', subscriptions.constructor.name);
} catch (e) {
  console.log('❌ Subscriptions error:', e.message);
  console.log('Stack:', e.stack);
}

console.log('\nTest complete');
