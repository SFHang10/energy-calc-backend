const express = require('express');
const router = express.Router();

console.log('🧪 Wix Test Router loading...');

router.get('/test', (req, res) => {
  res.json({ message: 'Wix test router is working!' });
});

router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'Wix Test Router',
    timestamp: new Date().toISOString()
  });
});

console.log('✅ Wix Test Router loaded successfully');

module.exports = router;


