console.log('Testing route loading...');

try {
  console.log('Loading members...');
  const members = require('./routes/members');
  console.log('✅ Members loaded successfully');
} catch (e) {
  console.log('❌ Members error:', e.message);
}

try {
  console.log('Loading subscriptions...');
  const subscriptions = require('./routes/subscriptions');
  console.log('✅ Subscriptions loaded successfully');
} catch (e) {
  console.log('❌ Subscriptions error:', e.message);
}

console.log('Test complete');

