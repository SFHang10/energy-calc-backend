const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectMongoDB, isMongoDBConnected } = require('../database/mongodb');
const Member = require('../models/Member');

console.log('🚀 Members MongoDB router loading...');

const router = express.Router();

// Connect to MongoDB on startup
connectMongoDB().then(connected => {
  if (connected) {
    console.log('✅ Members route connected to MongoDB');
  } else {
    console.log('⚠️ Members route: MongoDB not connected');
  }
});

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'greenways-secret-key-2025';

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Test database connection
router.get('/test-db', async (req, res) => {
  try {
    const count = await Member.countDocuments();
    res.json({ 
      success: true, 
      database: 'MongoDB',
      connected: isMongoDBConnected(),
      memberCount: count,
      message: 'MongoDB is working!' 
    });
  } catch (error) {
    res.json({ error: 'Database error', details: error.message });
  }
});

// Member registration
router.post('/register', async (req, res) => {
  const { email, password, first_name, last_name, company, phone, interests } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Check if email already exists
    const existingMember = await Member.findOne({ email: email.toLowerCase() });
    if (existingMember) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new member
    const member = new Member({
      email: email.toLowerCase(),
      passwordHash,
      name: {
        first: first_name,
        last: last_name
      },
      company,
      phone,
      interests: interests ? interests.split(',').map(i => i.trim()) : [],
      subscriptionTier: 'Free',
      subscriptionStatus: 'active'
    });

    await member.save();

    // Generate JWT token
    const token = jwt.sign({ id: member._id, email: member.email }, JWT_SECRET, { expiresIn: '30d' });

    console.log(`✅ New member registered: ${email}`);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: member._id,
        email: member.email,
        first_name: member.name.first,
        last_name: member.name.last,
        company: member.company,
        subscription_tier: member.subscriptionTier
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// Member login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const member = await Member.findOne({ email: email.toLowerCase() });
    
    if (!member) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, member.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    member.lastLogin = new Date();
    await member.save();

    // Generate JWT token
    const token = jwt.sign({ id: member._id, email: member.email }, JWT_SECRET, { expiresIn: '30d' });

    console.log(`✅ Member logged in: ${email}`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: member._id,
        email: member.email,
        first_name: member.name?.first,
        last_name: member.name?.last,
        company: member.company,
        phone: member.phone,
        interests: member.interests?.join(', '),
        subscription_tier: member.subscriptionTier,
        subscription_status: member.subscriptionStatus
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// Get member profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const member = await Member.findById(req.user.id);
    
    if (!member) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: member._id,
        email: member.email,
        first_name: member.name?.first,
        last_name: member.name?.last,
        company: member.company,
        phone: member.phone,
        interests: member.interests?.join(', '),
        subscription_tier: member.subscriptionTier,
        subscription_status: member.subscriptionStatus,
        created_at: member.createdAt,
        last_login: member.lastLogin
      }
    });
  } catch (error) {
    console.error('❌ Profile error:', error.message);
    res.status(500).json({ error: 'Failed to get profile', details: error.message });
  }
});

// Refresh token
router.post('/refresh-token', authenticateToken, async (req, res) => {
  try {
    const member = await Member.findById(req.user.id);
    
    if (!member) {
      return res.status(401).json({ error: 'User not found' });
    }

    const newToken = jwt.sign({ id: member._id, email: member.email }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      message: 'Token refreshed',
      token: newToken,
      user: {
        id: member._id,
        email: member.email,
        subscription_tier: member.subscriptionTier
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Token refresh failed', details: error.message });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const member = await Member.findOne({ email: email.toLowerCase() });

    if (!member) {
      // Don't reveal if email exists
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.',
        success: true 
      });
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    member.resetToken = resetToken;
    member.resetExpires = resetExpires;
    await member.save();

    const resetLink = `https://energy-calc-backend.onrender.com/wix-integration/password-reset.html?token=${resetToken}`;

    console.log(`🔑 Password reset for ${email}: ${resetLink}`);

    res.json({ 
      message: 'Password reset link sent to your email',
      success: true,
      resetLink: resetLink,
      resetToken: resetToken,
      note: 'In production, this link would be sent via email'
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error.message);
    res.status(500).json({ error: 'Failed to process reset request', details: error.message });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  try {
    const member = await Member.findOne({
      resetToken: token,
      resetExpires: { $gt: new Date() }
    });

    if (!member) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    member.passwordHash = passwordHash;
    member.resetToken = null;
    member.resetExpires = null;
    await member.save();

    console.log(`✅ Password reset successful for: ${member.email}`);

    res.json({ 
      message: 'Password updated successfully. You can now login with your new password.',
      success: true 
    });
  } catch (error) {
    console.error('❌ Reset password error:', error.message);
    res.status(500).json({ error: 'Failed to reset password', details: error.message });
  }
});

// Admin password reset (temporary - remove after use)
router.post('/admin-reset-password', async (req, res) => {
  const { email, newPassword, adminKey } = req.body;
  
  if (adminKey !== 'greenways-admin-2025') {
    return res.status(403).json({ error: 'Invalid admin key' });
  }
  
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password required' });
  }
  
  try {
    const member = await Member.findOne({ email: email.toLowerCase() });
    
    if (!member) {
      return res.status(404).json({ error: 'Email not found' });
    }
    
    const passwordHash = await bcrypt.hash(newPassword, 10);
    member.passwordHash = passwordHash;
    await member.save();
    
    console.log(`✅ Admin password reset for: ${email}`);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password', details: error.message });
  }
});

// Get subscription tiers
router.get('/subscription-tiers', (req, res) => {
  res.json({
    tiers: [
      {
        id: 1,
        name: 'Free',
        price: 0,
        features: 'Basic access to energy calculators and community resources'
      },
      {
        id: 2,
        name: 'Green Member',
        price: 20,
        features: 'Advanced calculators, data storage, and priority support'
      },
      {
        id: 3,
        name: 'Green Partner',
        price: 80,
        features: 'Professional tools, custom reports, and dedicated support'
      }
    ]
  });
});

// Get member interests
router.get('/interests', authenticateToken, async (req, res) => {
  try {
    const member = await Member.findById(req.user.id);
    if (!member) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ interests: member.interests || [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get interests', details: error.message });
  }
});

// Update member interests
router.put('/interests', authenticateToken, async (req, res) => {
  const { interests } = req.body;

  try {
    const member = await Member.findById(req.user.id);
    if (!member) {
      return res.status(404).json({ error: 'User not found' });
    }

    member.interests = Array.isArray(interests) ? interests : [];
    await member.save();

    res.json({ message: 'Interests updated', interests: member.interests });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update interests', details: error.message });
  }
});

// Get member content
router.get('/content', authenticateToken, async (req, res) => {
  try {
    const member = await Member.findById(req.user.id);
    const tier = member?.subscriptionTier || 'Free';
    
    // Return sample content based on tier
    res.json({ 
      tier,
      content: [
        { id: 1, title: 'Energy Saving Tips', type: 'article', tier: 'Free' },
        { id: 2, title: 'Calculator Guide', type: 'guide', tier: 'Free' }
      ],
      message: `Content for ${tier} tier`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get content', details: error.message });
  }
});

// Get videos
router.get('/videos', authenticateToken, async (req, res) => {
  res.json({
    videos: [
      { id: 1, title: 'Introduction to Energy Efficiency', category: 'Energy Saving', url: '#' },
      { id: 2, title: 'Solar Panel Basics', category: 'Solar', url: '#' }
    ],
    user_interests: []
  });
});

console.log('✅ Members MongoDB router loaded');

module.exports = router;
