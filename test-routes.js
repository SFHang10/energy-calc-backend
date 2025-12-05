const express = require('express');
const app = express();

// Test the routes
try {
  console.log('Testing members route...');
  const membersRouter = require('./routes/members');
  console.log('✅ Members route loaded successfully');
  
  console.log('Testing subscriptions route...');
  const subscriptionsRouter = require('./routes/subscriptions');
  console.log('✅ Subscriptions route loaded successfully');
  
  console.log('All routes loaded successfully!');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
}