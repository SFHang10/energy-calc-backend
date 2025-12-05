const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🚀 Wix MCP Integration router loading...');

// Database connection
const dbPath = path.join(__dirname, '../database/members.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error in Wix integration:', err.message);
  } else {
    console.log('✅ Wix integration database connected successfully');
  }
});

// Wix MCP Server configuration
const WIX_MCP_ENDPOINT = 'https://mcp.wix.com/sse';
const WIX_API_KEY = process.env.WIX_API_KEY || 'your-wix-api-key';

// Middleware to validate Wix requests
const validateWixRequest = (req, res, next) => {
  const wixSignature = req.headers['x-wix-signature'];
  const wixTimestamp = req.headers['x-wix-timestamp'];
  
  if (!wixSignature || !wixTimestamp) {
    return res.status(401).json({ error: 'Invalid Wix request signature' });
  }
  
  // Add your Wix signature validation logic here
  // For now, we'll accept all requests for testing
  
  next();
};

// Sync Wix user with membership system
router.post('/user-sync', validateWixRequest, async (req, res) => {
  try {
    const { wixUserId, email, firstName, lastName, subscriptionTier, interests } = req.body;
    
    console.log('🔄 Syncing Wix user:', { wixUserId, email, subscriptionTier });
    
    // Check if user exists in membership system
    db.get('SELECT * FROM members WHERE email = ?', [email], async (err, existingUser) => {
      if (err) {
        console.error('❌ Database error in user sync:', err.message);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      if (existingUser) {
        // Update existing user with Wix data
        const updateQuery = `
          UPDATE members 
          SET wix_user_id = ?, subscription_tier = ?, interests = ?, updated_at = CURRENT_TIMESTAMP
          WHERE email = ?
        `;
        
        db.run(updateQuery, [wixUserId, subscriptionTier, interests, email], function(err) {
          if (err) {
            console.error('❌ Failed to update user:', err.message);
            return res.status(500).json({ error: 'Failed to update user', details: err.message });
          }
          
          console.log('✅ User updated successfully:', email);
          res.json({ 
            message: 'User synced successfully',
            action: 'updated',
            userId: existingUser.id
          });
        });
      } else {
        // Create new user in membership system
        const insertQuery = `
          INSERT INTO members (wix_user_id, email, first_name, last_name, subscription_tier, interests, subscription_status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)
        `;
        
        db.run(insertQuery, [wixUserId, email, firstName, lastName, subscriptionTier, interests], function(err) {
          if (err) {
            console.error('❌ Failed to create user:', err.message);
            return res.status(500).json({ error: 'Failed to create user', details: err.message });
          }
          
          console.log('✅ New user created successfully:', email);
          res.status(201).json({ 
            message: 'User created and synced successfully',
            action: 'created',
            userId: this.lastID
          });
        });
      }
    });
  } catch (error) {
    console.error('❌ Server error in user sync:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Handle Wix form submissions
router.post('/form-handler', validateWixRequest, async (req, res) => {
  try {
    const { formType, formData, wixUserId } = req.body;
    
    console.log('📝 Processing Wix form submission:', { formType, wixUserId });
    
    switch (formType) {
      case 'member_registration':
        // Handle member registration form
        const { email, password, firstName, lastName, company, phone, interests } = formData;
        
        // Hash password
        const bcrypt = require('bcryptjs');
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        // Insert new member
        const insertQuery = `
          INSERT INTO members (wix_user_id, email, password_hash, first_name, last_name, company, phone, interests, subscription_tier, subscription_status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Free', 'active', CURRENT_TIMESTAMP)
        `;
        
        db.run(insertQuery, [wixUserId, email, passwordHash, firstName, lastName, company, phone, interests], function(err) {
          if (err) {
            console.error('❌ Failed to create member:', err.message);
            return res.status(500).json({ error: 'Failed to create member', details: err.message });
          }
          
          console.log('✅ Member created successfully:', email);
          res.status(201).json({ 
            message: 'Member registration successful',
            userId: this.lastID,
            subscriptionTier: 'Free'
          });
        });
        break;
        
      case 'subscription_upgrade':
        // Handle subscription upgrade form
        const { newTier, paymentMethod } = formData;
        
        db.run('UPDATE members SET subscription_tier = ? WHERE wix_user_id = ?', [newTier, wixUserId], function(err) {
          if (err) {
            console.error('❌ Failed to upgrade subscription:', err.message);
            return res.status(500).json({ error: 'Failed to upgrade subscription', details: err.message });
          }
          
          console.log('✅ Subscription upgraded successfully:', wixUserId, 'to', newTier);
          res.json({ 
            message: 'Subscription upgraded successfully',
            newTier: newTier
          });
        });
        break;
        
      case 'interest_update':
        // Handle interest update form
        const { newInterests } = formData;
        
        db.run('UPDATE members SET interests = ? WHERE wix_user_id = ?', [newInterests, wixUserId], function(err) {
          if (err) {
            console.error('❌ Failed to update interests:', err.message);
            return res.status(500).json({ error: 'Failed to update interests', details: err.message });
          }
          
          console.log('✅ Interests updated successfully:', wixUserId);
          res.json({ 
            message: 'Interests updated successfully',
            interests: newInterests
          });
        });
        break;
        
      default:
        res.status(400).json({ error: 'Unknown form type', formType });
    }
  } catch (error) {
    console.error('❌ Server error in form handler:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Update Wix content based on member access
router.post('/content-update', validateWixRequest, async (req, res) => {
  try {
    const { wixUserId, contentId, action } = req.body;
    
    console.log('📚 Processing content update:', { wixUserId, contentId, action });
    
    // Get user's subscription tier
    db.get('SELECT subscription_tier FROM members WHERE wix_user_id = ?', [wixUserId], (err, user) => {
      if (err) {
        console.error('❌ Database error in content update:', err.message);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Get content access requirements
      db.get('SELECT * FROM content WHERE id = ?', [contentId], (err, content) => {
        if (err) {
          console.error('❌ Database error getting content:', err.message);
          return res.status(500).json({ error: 'Database error', details: err.message });
        }
        
        if (!content) {
          return res.status(404).json({ error: 'Content not found' });
        }
        
        // Check if user has access to this content
        const hasAccess = checkContentAccess(user.subscription_tier, content.required_tier);
        
        console.log('🔐 Content access check:', { 
          userTier: user.subscription_tier, 
          requiredTier: content.required_tier, 
          hasAccess 
        });
        
        res.json({
          hasAccess,
          userTier: user.subscription_tier,
          requiredTier: content.required_tier,
          content: hasAccess ? content : null,
          message: hasAccess ? 'Access granted' : 'Access denied - upgrade required'
        });
      });
    });
  } catch (error) {
    console.error('❌ Server error in content update:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Helper function to check content access
function checkContentAccess(userTier, requiredTier) {
  const tierHierarchy = {
    'Free': 0,
    'Green Member': 1,
    'Eco Professional': 2,
    'Sustainability Partner': 3
  };
  
  const userLevel = tierHierarchy[userTier] || 0;
  const requiredLevel = tierHierarchy[requiredTier] || 0;
  
  return userLevel >= requiredLevel;
}

// Get member recommendations for Wix
router.get('/recommendations/:wixUserId', validateWixRequest, async (req, res) => {
  try {
    const { wixUserId } = req.params;
    
    console.log('🎯 Getting recommendations for Wix user:', wixUserId);
    
    // Get user's interests and subscription tier
    db.get('SELECT interests, subscription_tier FROM members WHERE wix_user_id = ?', [wixUserId], (err, user) => {
      if (err) {
        console.error('❌ Database error getting user:', err.message);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const interests = user.interests || '';
      const interestList = interests.split(',').map(i => i.trim()).filter(i => i);
      
      if (interestList.length === 0) {
        return res.json({ recommendations: [], message: 'No interests set' });
      }
      
      // Get content matching interests and user's tier
      const placeholders = interestList.map(() => '?').join(',');
      const query = `
        SELECT * FROM content 
        WHERE (tags LIKE ? OR category IN (${placeholders}))
        AND (required_tier = ? OR required_tier = 'free')
        ORDER BY created_at DESC LIMIT 10
      `;
      const params = [`%${interestList.join('%')}%`, ...interestList, user.subscription_tier];
      
      db.all(query, params, (err, content) => {
        if (err) {
          console.error('❌ Database error getting recommendations:', err.message);
          return res.status(500).json({ error: 'Database error', details: err.message });
        }
        
        console.log('✅ Recommendations generated successfully:', content.length, 'items');
        res.json({ 
          recommendations: content,
          interests: interestList,
          userTier: user.subscription_tier,
          message: `Found ${content.length} recommendations based on your interests`
        });
      });
    });
  } catch (error) {
    console.error('❌ Server error in recommendations:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Health check for Wix MCP integration
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'Wix MCP Integration',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

module.exports = router;

