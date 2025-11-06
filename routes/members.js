const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

console.log('🚀 Members router loading...');

const router = express.Router();

// Database connection
const dbPath = path.join(__dirname, '../database/members.db');
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  console.log('📁 Creating database directory:', dbDir);
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log('🔍 Database path:', dbPath);
console.log('🔍 Current directory:', __dirname);
console.log('🔍 Absolute database path:', path.resolve(dbPath));

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Database connected successfully to:', dbPath);
    // Initialize database tables if they don't exist
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        interests TEXT,
        reset_token TEXT,
        reset_expires DATETIME
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS subscription_tiers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        features TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
    });
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
        console.error('❌ Database error in registration:', err.message);
        return res.status(500).json({ error: 'Database error', details: err.message });
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
          console.error('❌ Failed to create user:', err.message);
          return res.status(500).json({ error: 'Failed to create user', details: err.message });
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
    console.error('❌ Server error in registration:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
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
      console.error('❌ Database error in login:', err.message);
      return res.status(500).json({ error: 'Database error', details: err.message });
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
      console.error('❌ Database error in profile:', err.message);
      return res.status(500).json({ error: 'Database error', details: err.message });
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
      console.error('❌ Database error in content:', err.message);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    const tier = member.subscription_tier || 'Free';
    
    db.all('SELECT * FROM content WHERE required_tier = ? OR required_tier = "free" ORDER BY created_at DESC', [tier], (err, content) => {
      if (err) {
        console.error('❌ Database error in content query:', err.message);
        return res.status(500).json({ error: 'Database error', details: err.message });
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
  console.log('🧪 Fetching subscription tiers...');
  db.all('SELECT * FROM subscription_tiers ORDER BY price_monthly ASC', (err, tiers) => {
    if (err) {
      console.error('❌ Database error in subscription tiers:', err.message);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    console.log('✅ Subscription tiers fetched successfully:', tiers.length, 'tiers found');
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
      console.error('❌ Failed to update interests:', err.message);
      return res.status(500).json({ error: 'Failed to update interests', details: err.message });
    }

    res.json({ 
      message: 'Interests updated successfully',
      interests: interests
    });
  });
});

// Get member recommendations based on interests
router.get('/recommendations', authenticateToken, (req, res) => {
  db.get('SELECT interests FROM members WHERE id = ?', [req.user.id], (err, member) => {
    if (err) {
      console.error('❌ Database error in recommendations:', err.message);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    const interests = member.interests || '';
    const interestList = interests.split(',').map(i => i.trim()).filter(i => i);

    if (interestList.length === 0) {
      return res.json({ recommendations: [], message: 'No interests set' });
    }

    // Get content matching interests
    const placeholders = interestList.map(() => '?').join(',');
    const query = `SELECT * FROM content WHERE tags LIKE ? OR category IN (${placeholders}) ORDER BY created_at DESC LIMIT 10`;
    const params = [`%${interestList.join('%')}%`, ...interestList];

    db.all(query, params, (err, content) => {
      if (err) {
        console.error('❌ Database error in recommendations query:', err.message);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }

      res.json({ 
        recommendations: content,
        interests: interestList,
        message: `Found ${content.length} recommendations based on your interests`
      });
    });
  });
});

// Password reset request
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Check if user exists
  db.get('SELECT id, email, first_name FROM members WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error('❌ Database error in forgot password:', err.message);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.',
        success: true 
      });
    }

    // Generate a simple reset token (in production, use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in database
    db.run('UPDATE members SET reset_token = ?, reset_expires = ? WHERE id = ?', 
      [resetToken, resetExpires.toISOString(), user.id], function(err) {
      if (err) {
        console.error('❌ Failed to store reset token:', err.message);
        return res.status(500).json({ error: 'Failed to process reset request', details: err.message });
      }

      // In a real application, you would send an email here
      // For now, we'll return the reset link in the response for testing
      const resetLink = `file:///C:/Users/steph/Documents/energy-cal-backend/wix-integration/password-reset.html?token=${resetToken}`;
      
      console.log(`🔑 Password reset link for ${email}: ${resetLink}`);
      
      res.json({ 
        message: 'Password reset link sent to your email',
        success: true,
        // Only include this in development - remove in production
        resetLink: resetLink,
        resetToken: resetToken,
        note: 'In production, this link would be sent via email'
      });
    });
  });
});

// Password reset with token
router.post('/reset-password', (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  // Check if token is valid and not expired
  db.get('SELECT id FROM members WHERE reset_token = ? AND reset_expires > ?', 
    [token, new Date().toISOString()], async (err, user) => {
    if (err) {
      console.error('❌ Database error in reset password:', err.message);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    try {
      // Hash new password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password and clear reset token
      db.run('UPDATE members SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?', 
        [passwordHash, user.id], function(err) {
        if (err) {
          console.error('❌ Failed to update password:', err.message);
          return res.status(500).json({ error: 'Failed to update password', details: err.message });
        }

        res.json({ 
          message: 'Password updated successfully. You can now login with your new password.',
          success: true 
        });
      });
    } catch (error) {
      console.error('❌ Error hashing password:', error.message);
      res.status(500).json({ error: 'Failed to process password reset', details: error.message });
    }
  });
});

module.exports = router;