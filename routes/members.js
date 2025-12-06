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

        // Generate JWT token - 30 days expiration for better UX
        const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET, { expiresIn: '30d' });

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

    // Generate JWT token - 30 days expiration for better UX
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

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

// Refresh token - extends session without re-login
router.post('/refresh-token', authenticateToken, (req, res) => {
  // User is already authenticated via the middleware, so we just issue a new token
  const { id, email } = req.user;
  
  // Verify user still exists and is active
  db.get('SELECT id, email, subscription_status FROM members WHERE id = ? AND email = ?', [id, email], (err, user) => {
    if (err) {
      console.error('❌ Database error in token refresh:', err.message);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'User not found or account deactivated' });
    }
    
    // Generate new token with fresh 30-day expiration
    const newToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    
    console.log(`🔄 Token refreshed for user: ${user.email}`);
    
    res.json({
      message: 'Token refreshed successfully',
      token: newToken,
      expiresIn: '30d'
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

// Get all available interest categories
router.get('/interests/categories', (req, res) => {
  db.all('SELECT id, name, description, icon FROM interest_categories ORDER BY name', (err, categories) => {
    if (err) {
      console.error('❌ Failed to fetch interest categories:', err.message);
      return res.status(500).json({ error: 'Failed to fetch categories', details: err.message });
    }

    res.json({ categories });
  });
});

// Get member's current interests
router.get('/interests', authenticateToken, (req, res) => {
  // Get interests from member_interests table (normalized)
  db.all(
    `SELECT ic.id, ic.name, ic.description, ic.icon 
     FROM member_interests mi 
     JOIN interest_categories ic ON mi.interest = ic.name 
     WHERE mi.member_id = ? 
     ORDER BY ic.name`,
    [req.user.id],
    (err, interests) => {
      if (err) {
        console.error('❌ Failed to fetch member interests:', err.message);
        return res.status(500).json({ error: 'Failed to fetch interests', details: err.message });
      }

      res.json({ interests });
    }
  );
});

// Update member interests (using normalized member_interests table)
router.put('/interests', authenticateToken, (req, res) => {
  const { interestIds } = req.body; // Array of interest category IDs

  if (!Array.isArray(interestIds)) {
    return res.status(400).json({ error: 'interestIds must be an array' });
  }

  // Start transaction: delete old interests, insert new ones
  db.serialize(() => {
    // Delete existing interests for this member
    db.run('DELETE FROM member_interests WHERE member_id = ?', [req.user.id], (err) => {
      if (err) {
        console.error('❌ Failed to delete old interests:', err.message);
        return res.status(500).json({ error: 'Failed to update interests', details: err.message });
      }

      // If no interests selected, just return success
      if (interestIds.length === 0) {
        return res.json({ 
          message: 'Interests updated successfully',
          interests: []
        });
      }

      // Get interest names from IDs
      const placeholders = interestIds.map(() => '?').join(',');
      db.all(`SELECT name FROM interest_categories WHERE id IN (${placeholders})`, interestIds, (err, categories) => {
        if (err) {
          console.error('❌ Failed to fetch interest categories:', err.message);
          return res.status(500).json({ error: 'Failed to update interests', details: err.message });
        }

        // Insert new interests
        const stmt = db.prepare('INSERT INTO member_interests (member_id, interest) VALUES (?, ?)');
        let completed = 0;
        const total = categories.length;

        if (total === 0) {
          return res.json({ 
            message: 'Interests updated successfully',
            interests: []
          });
        }

        categories.forEach((category) => {
          stmt.run([req.user.id, category.name], (err) => {
            if (err) {
              console.error('❌ Failed to insert interest:', err.message);
            }
            completed++;
            if (completed === total) {
              stmt.finalize();
              // Also update the legacy interests field for backward compatibility
              const interestsString = categories.map(c => c.name).join(', ');
              db.run('UPDATE members SET interests = ? WHERE id = ?', [interestsString, req.user.id], () => {
                res.json({ 
                  message: 'Interests updated successfully',
                  interests: categories.map(c => ({ id: interestIds[categories.indexOf(c)], name: c.name }))
                });
              });
            }
          });
        });
      });
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

// Wix Site IDs for unified membership
const WIX_SITES = {
  BUILDINGS: 'd9c9c6b1-f79a-49a3-8183-4c5a8e24a413', // Greenways Buildings
  MARKETPLACE: 'cfa82ec2-a075-4152-9799-6a1dd5c01ef4' // Greenways Market
};

// TEMPORARY: Admin password reset (remove after use)
router.post('/admin-reset-password', async (req, res) => {
  const { email, newPassword, adminKey } = req.body;
  
  // Simple admin key check (remove this endpoint after use)
  if (adminKey !== 'greenways-admin-2025') {
    return res.status(403).json({ error: 'Invalid admin key' });
  }
  
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password required' });
  }
  
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    db.run('UPDATE members SET password_hash = ? WHERE email = ?', [hashedPassword, email], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Email not found' });
      }
      
      console.log(`✅ Admin password reset for: ${email}`);
      res.json({ success: true, message: 'Password reset successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password', details: error.message });
  }
});

// Sync member with Wix (link local member to Wix member)
router.post('/sync-wix', authenticateToken, async (req, res) => {
  try {
    db.get('SELECT * FROM members WHERE id = ?', [req.user.id], async (err, localMember) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      if (!localMember) {
        return res.status(404).json({ error: 'Member not found' });
      }

      // Note: Wix member lookup would be done via MCP tools in production
      // For now, return structure for manual linking
      res.json({
        message: 'Wix sync endpoint ready',
        member: {
          id: localMember.id,
          email: localMember.email,
          wix_member_id: localMember.wix_member_id,
          wix_site_id: localMember.wix_site_id
        },
        note: 'Use MCP tools to query Wix members and update wix_member_id and wix_site_id'
      });
    });
  } catch (error) {
    console.error('❌ Error in sync-wix:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get unified membership status (access to both sites)
router.get('/unified-status', authenticateToken, (req, res) => {
  db.get('SELECT * FROM members WHERE id = ?', [req.user.id], (err, member) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({
      member: {
        id: member.id,
        email: member.email,
        name: `${member.first_name || ''} ${member.last_name || ''}`.trim(),
        subscription_tier: member.subscription_tier || 'Free',
        subscription_status: member.subscription_status || 'active'
      },
      wix_sync: {
        buildings: {
          siteId: WIX_SITES.BUILDINGS,
          siteName: 'Greenways Buildings',
          memberId: member.wix_site_id === WIX_SITES.BUILDINGS ? member.wix_member_id : null,
          hasAccess: !!member.wix_member_id && member.wix_site_id === WIX_SITES.BUILDINGS
        },
        marketplace: {
          siteId: WIX_SITES.MARKETPLACE,
          siteName: 'Greenways Marketplace',
          memberId: member.wix_site_id === WIX_SITES.MARKETPLACE ? member.wix_member_id : null,
          hasAccess: !!member.wix_member_id && member.wix_site_id === WIX_SITES.MARKETPLACE
        }
      },
      note: 'Use /sync-wix to link with Wix members via MCP tools'
    });
  });
});

// Update Wix member ID (for manual linking or after MCP sync)
router.put('/wix-link', authenticateToken, (req, res) => {
  const { wix_member_id, wix_site_id, wix_plan_id, wix_order_id } = req.body;

  if (!wix_member_id || !wix_site_id) {
    return res.status(400).json({ error: 'wix_member_id and wix_site_id are required' });
  }

  // Validate site ID
  if (wix_site_id !== WIX_SITES.BUILDINGS && wix_site_id !== WIX_SITES.MARKETPLACE) {
    return res.status(400).json({ error: 'Invalid wix_site_id. Must be Buildings or Marketplace site ID' });
  }

  db.run(
    'UPDATE members SET wix_member_id = ?, wix_site_id = ?, wix_plan_id = ?, wix_order_id = ? WHERE id = ?',
    [wix_member_id, wix_site_id, wix_plan_id || null, wix_order_id || null, req.user.id],
    function(err) {
      if (err) {
        console.error('❌ Failed to update Wix link:', err.message);
        return res.status(500).json({ error: 'Failed to update Wix link', details: err.message });
      }

      res.json({
        message: 'Wix member link updated successfully',
        wix_member_id,
        wix_site_id,
        wix_plan_id,
        wix_order_id
      });
    }
  );
});

// Get content accessible to member (with site filtering)
router.get('/content-unified', authenticateToken, (req, res) => {
  const { site } = req.query; // Optional: 'buildings', 'marketplace', or 'both'
  
  db.get('SELECT subscription_tier, wix_site_id FROM members WHERE id = ?', [req.user.id], (err, member) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    const tier = member.subscription_tier || 'Free';
    let query = 'SELECT * FROM content WHERE (required_tier = ? OR required_tier = "Free")';
    const params = [tier];

    // Filter by site if specified
    if (site === 'buildings') {
      query += ' AND (site_access = ? OR site_access = "both")';
      params.push('buildings');
    } else if (site === 'marketplace') {
      query += ' AND (site_access = ? OR site_access = "both")';
      params.push('marketplace');
    }
    // If site not specified, show all content

    query += ' ORDER BY created_at DESC';

    db.all(query, params, (err, content) => {
      if (err) {
        console.error('❌ Database error in content query:', err.message);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }

      res.json({
        content,
        user_tier: tier,
        site_filter: site || 'all',
        message: `Showing content for ${tier} tier${site ? ` on ${site} site` : ''}`
      });
    });
  });
});

// Get user notifications
router.get('/notifications', authenticateToken, (req, res) => {
  const { unread_only } = req.query;
  let query = `SELECT n.*, c.title as content_title, c.content_url, c.thumbnail_url 
               FROM user_notifications n 
               LEFT JOIN content c ON n.content_id = c.id 
               WHERE n.member_id = ?`;
  const params = [req.user.id];

  if (unread_only === 'true') {
    query += ' AND n.is_read = 0';
  }

  query += ' ORDER BY n.created_at DESC LIMIT 50';

  db.all(query, params, (err, notifications) => {
    if (err) {
      console.error('❌ Failed to fetch notifications:', err.message);
      return res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
    }

    // Get unread count
    db.get('SELECT COUNT(*) as count FROM user_notifications WHERE member_id = ? AND is_read = 0', [req.user.id], (err, result) => {
      if (err) {
        console.error('❌ Failed to count unread notifications:', err.message);
      }

      res.json({ 
        notifications,
        unread_count: result ? result.count : 0
      });
    });
  });
});

// Mark notification as read
router.post('/notifications/:id/read', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('UPDATE user_notifications SET is_read = 1 WHERE id = ? AND member_id = ?', [id, req.user.id], function(err) {
    if (err) {
      console.error('❌ Failed to mark notification as read:', err.message);
      return res.status(500).json({ error: 'Failed to update notification', details: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  });
});

// Mark all notifications as read
router.post('/notifications/read-all', authenticateToken, (req, res) => {
  db.run('UPDATE user_notifications SET is_read = 1 WHERE member_id = ? AND is_read = 0', [req.user.id], function(err) {
    if (err) {
      console.error('❌ Failed to mark all notifications as read:', err.message);
      return res.status(500).json({ error: 'Failed to update notifications', details: err.message });
    }

    res.json({ 
      message: 'All notifications marked as read',
      updated_count: this.changes
    });
  });
});

// Admin: Get interest report (users by interest category)
router.get('/admin/interests-report', authenticateToken, (req, res) => {
  // Check if user is admin (you can add admin check logic here)
  // For now, we'll allow any authenticated user - you should add proper admin check
  
  db.all(`
    SELECT 
      ic.id,
      ic.name as interest_name,
      ic.description,
      ic.icon,
      COUNT(DISTINCT mi.member_id) as user_count,
      GROUP_CONCAT(DISTINCT m.email) as user_emails
    FROM interest_categories ic
    LEFT JOIN member_interests mi ON mi.interest = ic.name
    LEFT JOIN members m ON mi.member_id = m.id
    GROUP BY ic.id, ic.name, ic.description, ic.icon
    ORDER BY user_count DESC, ic.name
  `, (err, report) => {
    if (err) {
      console.error('❌ Failed to fetch interests report:', err.message);
      return res.status(500).json({ error: 'Failed to fetch report', details: err.message });
    }

    // Format the report
    const formattedReport = report.map(row => ({
      interest: {
        id: row.id,
        name: row.interest_name,
        description: row.description,
        icon: row.icon
      },
      user_count: row.user_count || 0,
      users: row.user_emails ? row.user_emails.split(',') : []
    }));

    res.json({ 
      report: formattedReport,
      total_interests: formattedReport.length,
      total_users_with_interests: formattedReport.reduce((sum, r) => sum + r.user_count, 0)
    });
  });
});

// Simple in-memory cache for videos (production: use Redis or similar)
let videoCache = {
  data: null,
  timestamp: null,
  ttl: 30 * 60 * 1000 // 30 minutes
};

// Fetch videos from Wix API
async function fetchVideosFromWix() {
  const WIX_APP_TOKEN = process.env.WIX_APP_TOKEN;
  const WIX_APP_ID = process.env.WIX_APP_ID;
  const WIX_APP_SECRET = process.env.WIX_APP_SECRET;
  const WIX_INSTANCE_ID = process.env.WIX_INSTANCE_ID;
  const WIX_SITE_ID = process.env.WIX_SITE_ID || 'd9c9c6b1-f79a-49a3-8183-4c5a8e24a413'; // Greenways Buildings
  
  let authToken = null;
  
  // Method 1: Use App Token directly (if provided)
  if (WIX_APP_TOKEN) {
    authToken = WIX_APP_TOKEN.startsWith('Bearer ') ? WIX_APP_TOKEN : `Bearer ${WIX_APP_TOKEN}`;
  }
  // Method 2: Use App ID + Secret to create access token (OAuth)
  else if (WIX_APP_ID && WIX_APP_SECRET && WIX_INSTANCE_ID) {
    try {
      const tokenResponse = await fetch('https://www.wixapis.com/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: WIX_APP_ID,
          client_secret: WIX_APP_SECRET,
          instance_id: WIX_INSTANCE_ID
        })
      });
      
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        authToken = `Bearer ${tokenData.access_token}`;
        console.log('✅ Created access token using OAuth');
      } else {
        console.log('⚠️  Failed to create access token, using fallback videos');
        return null;
      }
    } catch (error) {
      console.log('⚠️  Error creating access token:', error.message);
      return null;
    }
  }
  
  // If no authentication method available, return null to use fallback
  if (!authToken) {
    console.log('⚠️  Wix credentials not configured. Options:');
    console.log('   1. Set WIX_APP_TOKEN (direct token)');
    console.log('   2. Set WIX_APP_ID + WIX_APP_SECRET + WIX_INSTANCE_ID (OAuth)');
    console.log('   Using fallback videos');
    return null;
  }

  try {
    const response = await fetch('https://www.wixapis.com/site-media/v1/files/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
      body: JSON.stringify({
        mediaTypes: ['VIDEO'],
        rootFolder: 'MEDIA_ROOT',
        paging: {
          limit: 200
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Wix API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform Wix video format to our frontend format
    const videos = (data.files || []).map((file, index) => {
      const video = file.media?.video;
      const resolutions = video?.resolutions || [];
      const bestResolution = resolutions[0] || {};
      
      // Extract category from labels or filename
      const labels = file.labels || [];
      const category = extractCategoryFromLabels(labels, file.displayName);
      
      return {
        id: file.id || index,
        title: file.displayName || 'Untitled Video',
        description: `Video from Greenways Buildings - ${file.displayName || ''}`,
        thumbnail: file.thumbnailUrl || 'https://via.placeholder.com/320x180?text=Video',
        videoUrl: bestResolution.url || file.url,
        videoId: file.id, // For Wix videos, we'll use the ID
        duration: video?.duration ? formatDuration(video.duration) : 'N/A',
        category: category,
        tags: labels,
        source: 'wix',
        wixFileId: file.id
      };
    });

    return videos;
  } catch (error) {
    console.error('❌ Error fetching videos from Wix:', error.message);
    return null; // Return null to trigger fallback
  }
}

// Extract category from Wix labels or filename
function extractCategoryFromLabels(labels, filename) {
  const filenameLower = (filename || '').toLowerCase();
  const labelsLower = labels.map(l => l.toLowerCase());
  const allText = [...labelsLower, filenameLower].join(' ');

  if (allText.includes('solar') || allText.includes('pv')) return 'solar';
  if (allText.includes('water') || allText.includes('conservation')) return 'water';
  if (allText.includes('hvac') || allText.includes('heating') || allText.includes('cooling')) return 'hvac';
  if (allText.includes('led') || allText.includes('lighting') || allText.includes('light')) return 'lighting';
  if (allText.includes('energy') || allText.includes('efficiency') || allText.includes('saving')) return 'energy';
  
  return 'general';
}

// Format duration from seconds to MM:SS
function formatDuration(seconds) {
  if (!seconds) return 'N/A';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Get videos (with caching and Wix API integration)
async function getVideos() {
  // Check cache first
  const now = Date.now();
  if (videoCache.data && videoCache.timestamp && (now - videoCache.timestamp) < videoCache.ttl) {
    console.log('✅ Returning cached videos');
    return videoCache.data;
  }

  // Try to fetch from Wix
  const wixVideos = await fetchVideosFromWix();
  
  if (wixVideos && wixVideos.length > 0) {
    videoCache.data = wixVideos;
    videoCache.timestamp = now;
    console.log(`✅ Fetched ${wixVideos.length} videos from Wix`);
    return wixVideos;
  }

  // Fallback to sample videos
  console.log('📹 Using fallback sample videos');
  return getSampleVideos();
}

// Helper function for sample videos (fallback)
function getSampleVideos() {
  return [
    {
      id: 1,
      title: 'Introduction to Energy Efficiency',
      description: 'Learn the basics of energy efficiency and how to reduce your carbon footprint.',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      videoId: 'dQw4w9WgXcQ',
      duration: '5:30',
      category: 'energy',
      tags: ['energy saving', 'basics', 'introduction'],
      source: 'fallback'
    },
    {
      id: 2,
      title: 'Solar Panel Installation Guide',
      description: 'Step-by-step guide to installing solar panels for your home or business.',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      videoId: 'dQw4w9WgXcQ',
      duration: '12:45',
      category: 'solar',
      tags: ['solar', 'installation', 'renewable energy'],
      source: 'fallback'
    },
    {
      id: 3,
      title: 'HVAC System Optimization',
      description: 'How to optimize your HVAC system for maximum energy efficiency.',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      videoId: 'dQw4w9WgXcQ',
      duration: '8:20',
      category: 'hvac',
      tags: ['hvac', 'optimization', 'energy saving'],
      source: 'fallback'
    },
    {
      id: 4,
      title: 'LED Lighting Retrofit Benefits',
      description: 'Discover the benefits of retrofitting your lighting to LED technology.',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      videoId: 'dQw4w9WgXcQ',
      duration: '6:15',
      category: 'lighting',
      tags: ['led', 'lighting', 'retrofit'],
      source: 'fallback'
    },
    {
      id: 5,
      title: 'Heat Pump Technology Explained',
      description: 'Understanding how heat pumps work and their energy efficiency benefits.',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      videoId: 'dQw4w9WgXcQ',
      duration: '10:00',
      category: 'energy',
      tags: ['heat pump', 'heating', 'energy efficient'],
      source: 'fallback'
    },
    {
      id: 6,
      title: 'Smart Home Energy Management',
      description: 'How smart home technology can help you save energy and money.',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      videoId: 'dQw4w9WgXcQ',
      duration: '7:30',
      category: 'energy',
      tags: ['smart home', 'automation', 'energy management'],
      source: 'fallback'
    },
    {
      id: 7,
      title: 'Water Saving Technologies',
      description: 'Explore innovative water-saving technologies for homes and businesses.',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      videoId: 'dQw4w9WgXcQ',
      duration: '9:15',
      category: 'water',
      tags: ['water saving', 'conservation', 'efficiency'],
      source: 'fallback'
    }
  ];
}

// Get videos from Wix (filtered by user interests)
router.get('/videos', authenticateToken, async (req, res) => {
  try {
    // Get user's interests
    const userInterests = await new Promise((resolve, reject) => {
      db.all(
        `SELECT ic.name 
         FROM member_interests mi 
         JOIN interest_categories ic ON mi.interest = ic.name 
         WHERE mi.member_id = ?`,
        [req.user.id],
        (err, interests) => {
          if (err) reject(err);
          else resolve(interests.map(i => i.name.toLowerCase()));
        }
      );
    });

    // Fetch all available videos (from Wix or fallback)
    const allVideos = await getVideos();

    // Filter videos based on user interests
    let filteredVideos = allVideos;
    
    if (userInterests.length > 0) {
      // Map interest names to video categories/tags
      const interestToCategory = {
        'energy saving products': ['energy'],
        'water saving products': ['water'],
        'solar products': ['solar'],
        'hvac systems': ['hvac'],
        'led lighting': ['lighting']
      };

      const relevantCategories = new Set();
      userInterests.forEach(interest => {
        const category = interestToCategory[interest];
        if (category) {
          category.forEach(cat => relevantCategories.add(cat));
        }
      });

      if (relevantCategories.size > 0) {
        filteredVideos = allVideos.filter(video => 
          relevantCategories.has(video.category) || 
          (video.tags && video.tags.some(tag => {
            const tagLower = typeof tag === 'string' ? tag.toLowerCase() : '';
            return userInterests.some(interest => 
              tagLower.includes(interest) || interest.includes(tagLower)
            );
          }))
        );
      }

      // If no matches, show all videos but prioritize by interests
      if (filteredVideos.length === 0) {
        filteredVideos = allVideos;
      }
    }

    res.json({
      videos: filteredVideos,
      total: filteredVideos.length,
      user_interests: userInterests,
      source: allVideos[0]?.source || 'fallback',
      message: userInterests.length > 0 
        ? `Showing ${filteredVideos.length} videos based on your interests` 
        : 'Showing all available videos'
    });

  } catch (error) {
    console.error('❌ Error fetching videos:', error);
    res.status(500).json({ 
      error: 'Failed to fetch videos', 
      details: error.message 
    });
  }
});

module.exports = router;