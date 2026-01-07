const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('🚀 Members router loading...');

const router = express.Router();

// Database connection
const dbPath = path.join(__dirname, '../database/members.db');
console.log('🔍 Database path:', dbPath);
console.log('🔍 Current directory:', __dirname);
console.log('🔍 Absolute database path:', path.resolve(dbPath));

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Database connected successfully to:', dbPath);
  }
});

// Add a test route to check database
router.get('/test-db', (req, res) => {
  console.log('🧪 Testing database connection...');
  db.get('SELECT COUNT(*) as count FROM subscription_tiers', (err, row) => {
    if (err) {
      console.error('❌ Test query error:', err.message);
      res.json({ error: 'Database error', details: err.message });
    } else {
      console.log('✅ Test query successful:', row);
      res.json({ success: true, count: row.count, message: 'Database is working!' });
    }
  });
});

// JWT secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

// Member registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, company, phone, interests } = req.body;

    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'Email, password, first name, and last name are required' });
    }

    // Check if user already exists
    db.get('SELECT id FROM members WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (row) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Insert new user
      const stmt = db.prepare(`
        INSERT INTO members (email, password_hash, first_name, last_name, company, phone, interests, subscription_tier, subscription_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Free', 'active')
      `);

      stmt.run([email, passwordHash, first_name, last_name, company || null, phone || null, interests || null], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create user' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: {
            id: this.lastID,
            email,
            first_name,
            last_name,
            company,
            phone,
            interests,
            subscription_tier: 'Free'
          }
        });
      });

      stmt.finalize();
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Member login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM members WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    db.run('UPDATE members SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        company: user.company,
        phone: user.phone,
        interests: user.interests,
        subscription_tier: user.subscription_tier,
        subscription_status: user.subscription_status
      }
    });
  });
});

// Get member profile (authenticated)
router.get('/profile', authenticateToken, (req, res) => {
  db.get('SELECT id, email, first_name, last_name, company, phone, interests, subscription_tier, subscription_status, created_at, last_login FROM members WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  });
});

// Get member content based on subscription tier
router.get('/content', authenticateToken, (req, res) => {
  db.get('SELECT subscription_tier FROM members WHERE id = ?', [req.user.id], (err, member) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const tier = member.subscription_tier || 'Free';
    
    db.all('SELECT * FROM content WHERE required_tier = ? OR required_tier = "free" ORDER BY created_at DESC', [tier], (err, content) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ 
        content,
        user_tier: tier,
        message: `Showing content for ${tier} tier and below`
      });
    });
  });
});

// Get subscription tiers
router.get('/subscription-tiers', (req, res) => {
  db.all('SELECT * FROM subscription_tiers ORDER BY price ASC', (err, tiers) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ tiers });
  });
});

// Update member interests
router.put('/interests', authenticateToken, (req, res) => {
  const { interests } = req.body;

  if (!interests) {
    return res.status(400).json({ error: 'Interests are required' });
  }

  db.run('UPDATE members SET interests = ? WHERE id = ?', [interests, req.user.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update interests' });
    }

    res.json({ 
      message: 'Interests updated successfully',
      interests: interests
    });
  });
});

module.exports = router;
