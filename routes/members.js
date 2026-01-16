const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const FormData = require('form-data');
const cron = require('node-cron');

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

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/members');
if (!fs.existsSync(uploadsDir)) {
  console.log('📁 Creating uploads directory:', uploadsDir);
  fs.mkdirSync(uploadsDir, { recursive: true });
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
        first_name TEXT,
        last_name TEXT,
        display_name TEXT,
        company TEXT,
        phone TEXT,
        job_title TEXT,
        bio TEXT,
        location TEXT,
        profile_photo_url TEXT,
        cover_photo_url TEXT,
        subscription_tier TEXT DEFAULT 'Free',
        subscription_status TEXT DEFAULT 'active',
        wix_member_id TEXT,
        wix_site_id TEXT,
        wix_plan_id TEXT,
        wix_order_id TEXT,
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

      // Add missing columns if database already existed
      const columnsToAdd = [
        { name: 'first_name', type: 'TEXT' },
        { name: 'last_name', type: 'TEXT' },
        { name: 'display_name', type: 'TEXT' },
        { name: 'company', type: 'TEXT' },
        { name: 'phone', type: 'TEXT' },
        { name: 'job_title', type: 'TEXT' },
        { name: 'bio', type: 'TEXT' },
        { name: 'location', type: 'TEXT' },
        { name: 'profile_photo_url', type: 'TEXT' },
        { name: 'cover_photo_url', type: 'TEXT' },
        { name: 'subscription_tier', type: 'TEXT' },
        { name: 'subscription_status', type: 'TEXT' },
        { name: 'wix_member_id', type: 'TEXT' },
        { name: 'wix_site_id', type: 'TEXT' },
        { name: 'wix_plan_id', type: 'TEXT' },
        { name: 'wix_order_id', type: 'TEXT' },
        { name: 'saved_videos', type: 'TEXT' },
        { name: 'saved_blogs', type: 'TEXT' },
        { name: 'saved_reports', type: 'TEXT' },
        { name: 'saved_products', type: 'TEXT' }
      ];

      columnsToAdd.forEach((column) => {
        db.run(`ALTER TABLE members ADD COLUMN ${column.name} ${column.type}`, (error) => {
          if (error) {
            if (!error.message.includes('duplicate column name')) {
              console.error(`❌ Error adding column ${column.name}:`, error.message);
            }
          } else {
            console.log(`✅ Added column ${column.name} to members table`);
          }
        });
      });
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

const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image uploads are allowed'));
    }
  }
});

const uploadImport = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

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

const SAVED_COLUMNS = {
  videos: 'saved_videos',
  blogs: 'saved_blogs',
  reports: 'saved_reports',
  products: 'saved_products'
};

const CATALOG_PATH = path.join(__dirname, '../wix-integration/member-content/content-catalog.json');
const catalogCache = {
  items: null,
  loadedAt: 0,
  ttl: 5 * 60 * 1000
};

const INTEREST_KEYWORDS = {
  'energy saving': ['energy', 'efficiency', 'saving'],
  'energy generating': ['solar', 'wind', 'renewable', 'generation'],
  'water saving': ['water', 'conservation'],
  'solar power': ['solar', 'pv'],
  'heat pumps': ['heat pump', 'hvac', 'heating'],
  'led lighting': ['led', 'lighting'],
  'smart home': ['smart', 'automation', 'iot'],
  'insulation': ['insulation', 'building fabric'],
  'electric vehicles': ['ev', 'electric vehicle', 'charging'],
  'wind energy': ['wind'],
  'battery storage': ['battery', 'storage'],
  'water heating': ['water heating', 'hot water'],
  'building efficiency': ['building', 'retrofit'],
  'grants & funding': ['grants', 'funding', 'incentive'],
  'renewable certifications': ['certification', 'green']
};

const ADMIN_KEY = process.env.ADMIN_KEY || '';
const CONTENT_SYNC_CRON = process.env.CONTENT_CATALOG_SYNC_CRON || '0 */6 * * *';
const CONTENT_SYNC_ENABLED = process.env.CONTENT_CATALOG_SYNC_ENABLED !== 'false';
const CONTENT_SYNC_ON_START = process.env.CONTENT_CATALOG_SYNC_ON_START !== 'false';

function parseSavedList(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function normalizeSavedItem(item, type) {
  if (!item || typeof item !== 'object') return null;
  const id = String(item.id || item._id || item.videoId || item.slug || item.title || '').trim();
  if (!id) return null;
  return {
    id,
    title: String(item.title || item.name || 'Saved item'),
    description: String(item.description || ''),
    category: String(item.category || ''),
    url: String(item.url || item.link || ''),
    imageUrl: item.imageUrl ? String(item.imageUrl) : undefined,
    thumbnail: item.thumbnail ? String(item.thumbnail) : undefined,
    type
  };
}

function isAdminRequest(req) {
  if (ADMIN_KEY && req.headers['x-admin-key'] === ADMIN_KEY) {
    return true;
  }
  if (!ADMIN_KEY) {
    console.warn('⚠️ ADMIN_KEY not set. Allowing catalog admin actions.');
    return true;
  }
  return false;
}

function loadCatalog() {
  const now = Date.now();
  if (catalogCache.items && (now - catalogCache.loadedAt) < catalogCache.ttl) {
    return catalogCache.items;
  }

  try {
    const raw = fs.readFileSync(CATALOG_PATH, 'utf8');
    const data = JSON.parse(raw);
    catalogCache.items = Array.isArray(data.items) ? data.items : [];
    catalogCache.loadedAt = now;
    return catalogCache.items;
  } catch (error) {
    console.error('❌ Failed to load content catalog:', error.message);
    return [];
  }
}

function writeCatalog(items) {
  const payload = { items };
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(payload, null, 2));
  catalogCache.items = items;
  catalogCache.loadedAt = Date.now();
}

function buildInterestTokens(interests) {
  const tokens = new Set();
  (interests || []).forEach((interest) => {
    const key = String(interest).toLowerCase();
    tokens.add(key);
    const mapped = INTEREST_KEYWORDS[key];
    if (mapped) {
      mapped.forEach((token) => tokens.add(token));
    }
  });
  return Array.from(tokens);
}

function filterCatalogByInterests(items, interests, type) {
  let filtered = items;
  if (type) {
    filtered = filtered.filter((item) => item.type === type);
  }

  const tokens = buildInterestTokens(interests);
  if (tokens.length === 0) {
    return filtered;
  }

  return filtered.filter((item) => {
    const haystack = [
      item.title,
      item.description,
      item.category,
      ...(item.tags || [])
    ]
      .join(' ')
      .toLowerCase();
    return tokens.some((token) => haystack.includes(token));
  });
}

async function uploadImageToWix(file) {
  const authToken = await getWixAuthToken();
  if (!authToken) {
    throw new Error('Wix credentials not configured');
  }

  const filename = file.originalname || `profile-${Date.now()}.png`;
  const mimeType = file.mimetype || 'image/png';

  const uploadUrlResponse = await fetch('https://www.wixapis.com/site-media/v1/files/generate-upload-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authToken
    },
    body: JSON.stringify({ mimeType, fileName: filename })
  });

  if (!uploadUrlResponse.ok) {
    const errorText = await uploadUrlResponse.text();
    throw new Error(`Wix upload URL error: ${uploadUrlResponse.status} ${errorText}`);
  }

  const uploadUrlData = await uploadUrlResponse.json();
  const uploadUrl = uploadUrlData.uploadUrl;
  if (!uploadUrl) {
    throw new Error('Wix upload URL not returned');
  }

  const form = new FormData();
  form.append('file', file.buffer, { filename, contentType: mimeType });

  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: form.getHeaders(),
    body: form
  });

  const uploadText = await uploadResponse.text();
  let uploadData = {};
  try {
    uploadData = JSON.parse(uploadText);
  } catch (error) {
    uploadData = { raw: uploadText };
  }

  if (!uploadResponse.ok) {
    throw new Error(`Wix upload failed: ${uploadResponse.status} ${uploadText}`);
  }

  const url = uploadData?.file?.url || uploadData?.file?.media?.url || uploadData?.url;
  if (!url) {
    throw new Error('Wix upload response missing file URL');
  }

  return { url, raw: uploadData, uploadUrl };
}

function saveBufferToLocal(file) {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.png';
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const filename = `${unique}${safeExt}`;
  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, file.buffer);
  return `/uploads/members/${filename}`;
}

function normalizeCatalogImportItem(item, index) {
  if (!item || typeof item !== 'object') return null;
  const id = String(item.id || item.slug || item.title || `import-${Date.now()}-${index}`).trim();
  const type = String(item.type || 'blog').toLowerCase();
  const title = String(item.title || item.name || '').trim();
  if (!title) return null;
  const tags = Array.isArray(item.tags)
    ? item.tags
    : String(item.tags || item.tag || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

  return {
    id,
    type,
    title,
    description: String(item.description || item.summary || ''),
    category: String(item.category || ''),
    tags,
    url: String(item.url || item.link || ''),
    imageUrl: item.imageUrl ? String(item.imageUrl) : undefined,
    thumbnail: item.thumbnail ? String(item.thumbnail) : undefined,
    source: item.source || 'import'
  };
}

async function syncCatalogFromWix() {
  const [videos, blogs] = await Promise.all([fetchVideosFromWix(), fetchBlogsFromWix()]);
  const items = loadCatalog();
  const map = new Map(items.map((item) => [item.id, item]));

  (videos || []).forEach((video) => {
    const id = video.id ? `wix-video-${video.id}` : `wix-video-${video.title}`;
    map.set(id, {
      id,
      type: 'video',
      title: video.title,
      description: video.description,
      category: video.category || 'video',
      tags: video.tags || [],
      url: video.videoUrl || (video.videoId ? `https://www.youtube.com/watch?v=${video.videoId}` : ''),
      thumbnail: video.thumbnail,
      source: 'wix',
      updatedAt: new Date().toISOString()
    });
  });

  (blogs || []).forEach((blog) => {
    map.set(blog.id, { ...blog, updatedAt: new Date().toISOString() });
  });

  const updated = Array.from(map.values());
  writeCatalog(updated);
  return {
    total: updated.length,
    syncedVideos: (videos || []).length,
    syncedBlogs: (blogs || []).length
  };
}

function startCatalogAutoSync() {
  if (!CONTENT_SYNC_ENABLED) {
    console.log('⏸️ Content catalog auto-sync disabled');
    return;
  }

  if (!cron.validate(CONTENT_SYNC_CRON)) {
    console.warn(`⚠️ Invalid CONTENT_CATALOG_SYNC_CRON: ${CONTENT_SYNC_CRON}`);
    return;
  }

  cron.schedule(CONTENT_SYNC_CRON, async () => {
    try {
      const result = await syncCatalogFromWix();
      console.log(`✅ Auto-sync complete: ${result.syncedVideos} videos, ${result.syncedBlogs} blogs`);
    } catch (error) {
      console.error('❌ Auto-sync failed:', error.message);
    }
  });

  if (CONTENT_SYNC_ON_START) {
    syncCatalogFromWix()
      .then((result) => {
        console.log(`✅ Initial catalog sync: ${result.syncedVideos} videos, ${result.syncedBlogs} blogs`);
      })
      .catch((error) => {
        console.error('❌ Initial catalog sync failed:', error.message);
      });
  }
}

async function getWixAuthToken() {
  const WIX_APP_TOKEN = process.env.WIX_APP_TOKEN;
  const WIX_APP_ID = process.env.WIX_APP_ID;
  const WIX_APP_SECRET = process.env.WIX_APP_SECRET;
  const WIX_INSTANCE_ID = process.env.WIX_INSTANCE_ID;

  if (WIX_APP_TOKEN) {
    return WIX_APP_TOKEN.startsWith('Bearer ') ? WIX_APP_TOKEN : `Bearer ${WIX_APP_TOKEN}`;
  }

  if (WIX_APP_ID && WIX_APP_SECRET && WIX_INSTANCE_ID) {
    const tokenResponse = await fetch('https://www.wixapis.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: WIX_APP_ID,
        client_secret: WIX_APP_SECRET,
        instance_id: WIX_INSTANCE_ID
      })
    });

    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      return `Bearer ${tokenData.access_token}`;
    }
  }

  return null;
}

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
  db.get(`SELECT id, email, first_name, last_name, display_name, company, phone, job_title, bio, location,
      profile_photo_url, cover_photo_url, interests, subscription_tier, subscription_status, created_at, last_login
    FROM members WHERE id = ?`, [req.user.id], (err, user) => {
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

// Update member profile (authenticated)
router.put('/profile', authenticateToken, (req, res) => {
  const {
    first_name,
    last_name,
    display_name,
    company,
    phone,
    job_title,
    bio,
    location,
    profile_photo_url,
    cover_photo_url
  } = req.body;

  const toText = (value, max = 2000) => {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
  };

  const params = [
    toText(first_name, 80),
    toText(last_name, 80),
    toText(display_name, 120),
    toText(company, 120),
    toText(phone, 40),
    toText(job_title, 120),
    toText(bio, 2000),
    toText(location, 120),
    toText(profile_photo_url, 500),
    toText(cover_photo_url, 500),
    req.user.id
  ];

  const sql = `UPDATE members
    SET first_name = ?, last_name = ?, display_name = ?, company = ?, phone = ?, job_title = ?, bio = ?, location = ?,
        profile_photo_url = ?, cover_photo_url = ?
    WHERE id = ?`;

  db.run(sql, params, function(err) {
    if (err) {
      console.error('❌ Database error in profile update:', err.message);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    res.json({ success: true, message: 'Profile updated successfully' });
  });
});

// Upload profile images (avatar/cover)
router.post('/profile/upload', authenticateToken, (req, res) => {
  uploadImage.single('file')(req, res, (error) => {
    if (error) {
      console.error('❌ Upload error:', error.message);
      return res.status(400).json({ error: 'Upload failed', details: error.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const type = req.query.type === 'cover' ? 'cover_photo_url' : 'profile_photo_url';
    uploadImageToWix(req.file)
      .then((uploadResult) => {
        db.run(`UPDATE members SET ${type} = ? WHERE id = ?`, [uploadResult.url, req.user.id], function(err) {
          if (err) {
            console.error('❌ Database error updating profile image:', err.message);
            return res.status(500).json({ error: 'Failed to update profile image' });
          }

          res.json({
            success: true,
            url: uploadResult.url,
            type: type === 'cover_photo_url' ? 'cover' : 'avatar'
          });
        });
      })
      .catch((uploadError) => {
        console.error('❌ Wix upload failed:', uploadError.message);
        if (process.env.ALLOW_LOCAL_PROFILE_UPLOADS === 'true') {
          const localUrl = saveBufferToLocal(req.file);
          db.run(`UPDATE members SET ${type} = ? WHERE id = ?`, [localUrl, req.user.id], function(err) {
            if (err) {
              console.error('❌ Database error updating profile image:', err.message);
              return res.status(500).json({ error: 'Failed to update profile image' });
            }

            res.json({
              success: true,
              url: localUrl,
              type: type === 'cover_photo_url' ? 'cover' : 'avatar',
              fallback: 'local'
            });
          });
          return;
        }

        res.status(500).json({ error: 'Failed to upload image to Wix', details: uploadError.message });
      });
  });
});

// Saved items hub
router.get('/saved-items', authenticateToken, (req, res) => {
  db.get(
    'SELECT saved_videos, saved_blogs, saved_reports, saved_products FROM members WHERE id = ?',
    [req.user.id],
    (err, row) => {
      if (err) {
        console.error('❌ Database error fetching saved items:', err.message);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        saved: {
          videos: parseSavedList(row.saved_videos),
          blogs: parseSavedList(row.saved_blogs),
          reports: parseSavedList(row.saved_reports),
          products: parseSavedList(row.saved_products)
        }
      });
    }
  );
});

router.post('/saved-items/:type', authenticateToken, (req, res) => {
  const column = SAVED_COLUMNS[req.params.type];
  if (!column) {
    return res.status(400).json({ error: 'Invalid saved item type' });
  }

  const normalized = normalizeSavedItem(req.body, req.params.type);
  if (!normalized) {
    return res.status(400).json({ error: 'Invalid item payload' });
  }

  db.get(`SELECT ${column} FROM members WHERE id = ?`, [req.user.id], (err, row) => {
    if (err) {
      console.error('❌ Database error reading saved items:', err.message);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }

    const list = parseSavedList(row[column]);
    const exists = list.some((item) => item.id === normalized.id);
    if (!exists) {
      list.unshift({ ...normalized, savedAt: new Date().toISOString() });
    }

    const trimmed = list.slice(0, 50);
    db.run(`UPDATE members SET ${column} = ? WHERE id = ?`, [JSON.stringify(trimmed), req.user.id], (updateErr) => {
      if (updateErr) {
        console.error('❌ Database error saving item:', updateErr.message);
        return res.status(500).json({ error: 'Database error', details: updateErr.message });
      }
      res.json({ saved: trimmed, added: !exists });
    });
  });
});

router.put('/saved-items/:type', authenticateToken, (req, res) => {
  const column = SAVED_COLUMNS[req.params.type];
  if (!column) {
    return res.status(400).json({ error: 'Invalid saved item type' });
  }

  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const normalized = items
    .map((item) => normalizeSavedItem(item, req.params.type))
    .filter(Boolean)
    .slice(0, 50);

  db.run(`UPDATE members SET ${column} = ? WHERE id = ?`, [JSON.stringify(normalized), req.user.id], (err) => {
    if (err) {
      console.error('❌ Database error saving items:', err.message);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    res.json({ saved: normalized });
  });
});

router.delete('/saved-items/:type/:id', authenticateToken, (req, res) => {
  const column = SAVED_COLUMNS[req.params.type];
  if (!column) {
    return res.status(400).json({ error: 'Invalid saved item type' });
  }

  db.get(`SELECT ${column} FROM members WHERE id = ?`, [req.user.id], (err, row) => {
    if (err) {
      console.error('❌ Database error reading saved items:', err.message);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }

    const list = parseSavedList(row[column]);
    const filtered = list.filter((item) => String(item.id) !== String(req.params.id));
    db.run(`UPDATE members SET ${column} = ? WHERE id = ?`, [JSON.stringify(filtered), req.user.id], (updateErr) => {
      if (updateErr) {
        console.error('❌ Database error removing item:', updateErr.message);
        return res.status(500).json({ error: 'Database error', details: updateErr.message });
      }
      res.json({ saved: filtered });
    });
  });
});

// Blog feed (catalog-based)
router.get('/blogs', authenticateToken, (req, res) => {
  const items = loadCatalog();
  const blogs = items.filter((item) => item.type === 'blog');
  res.json({ blogs, total: blogs.length, source: 'catalog' });
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

// Content catalog
router.get('/content-catalog', authenticateToken, (req, res) => {
  const type = req.query.type;
  const items = loadCatalog();
  const filtered = type ? items.filter((item) => item.type === type) : items;
  res.json({ items: filtered, total: filtered.length, source: 'catalog' });
});

router.post('/content-catalog', authenticateToken, (req, res) => {
  if (!isAdminRequest(req)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const items = loadCatalog();
  const item = req.body || {};
  if (!item.id || !item.type || !item.title) {
    return res.status(400).json({ error: 'Missing required fields: id, type, title' });
  }
  if (items.some((existing) => existing.id === item.id)) {
    return res.status(409).json({ error: 'Item ID already exists' });
  }

  const next = { ...item, source: item.source || 'manual', updatedAt: new Date().toISOString() };
  const updated = [next, ...items];
  writeCatalog(updated);
  res.json({ item: next, total: updated.length });
});

router.put('/content-catalog/:id', authenticateToken, (req, res) => {
  if (!isAdminRequest(req)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const items = loadCatalog();
  const itemId = req.params.id;
  const index = items.findIndex((item) => item.id === itemId);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const updatedItem = { ...items[index], ...req.body, id: itemId, updatedAt: new Date().toISOString() };
  const updated = [...items];
  updated[index] = updatedItem;
  writeCatalog(updated);
  res.json({ item: updatedItem });
});

router.delete('/content-catalog/:id', authenticateToken, (req, res) => {
  if (!isAdminRequest(req)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const items = loadCatalog();
  const itemId = req.params.id;
  const updated = items.filter((item) => item.id !== itemId);
  writeCatalog(updated);
  res.json({ total: updated.length });
});

router.post('/content-catalog/reorder', authenticateToken, (req, res) => {
  if (!isAdminRequest(req)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  if (ids.length === 0) {
    return res.status(400).json({ error: 'No ids provided' });
  }

  const items = loadCatalog();
  const map = new Map(items.map((item) => [item.id, item]));
  const reordered = ids.map((id) => map.get(id)).filter(Boolean);
  const remaining = items.filter((item) => !ids.includes(item.id));
  const updated = [...reordered, ...remaining];
  writeCatalog(updated);

  res.json({ total: updated.length });
});

router.post('/content-catalog/import', authenticateToken, (req, res) => {
  uploadImport.single('file')(req, res, async (error) => {
    if (error) {
      return res.status(400).json({ error: 'Import failed', details: error.message });
    }

    if (!isAdminRequest(req)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const mode = String(req.body.mode || req.query.mode || 'merge').toLowerCase();
    const ext = path.extname(req.file.originalname || '').toLowerCase();
    const raw = req.file.buffer.toString('utf8');
    let importedItems = [];

    try {
      if (ext === '.json' || req.file.mimetype.includes('json')) {
        const parsed = JSON.parse(raw);
        const list = Array.isArray(parsed) ? parsed : parsed.items;
        importedItems = Array.isArray(list) ? list : [];
      } else if (ext === '.csv' || req.file.mimetype.includes('csv')) {
        const csv = require('csvtojson');
        importedItems = await csv().fromString(raw);
      } else {
        return res.status(400).json({ error: 'Unsupported file type. Use CSV or JSON.' });
      }
    } catch (parseError) {
      return res.status(400).json({ error: 'Failed to parse import file', details: parseError.message });
    }

    const normalized = importedItems
      .map((item, index) => normalizeCatalogImportItem(item, index))
      .filter(Boolean);

    if (normalized.length === 0) {
      return res.status(400).json({ error: 'No valid catalog items found in import file' });
    }

    const existing = loadCatalog();
    const map = new Map((mode === 'replace' ? [] : existing).map((item) => [item.id, item]));
    const now = new Date().toISOString();

    normalized.forEach((item) => {
      map.set(item.id, { ...map.get(item.id), ...item, updatedAt: now });
    });

    const updated = Array.from(map.values());
    writeCatalog(updated);

    res.json({
      imported: normalized.length,
      total: updated.length,
      mode
    });
  });
});

router.post('/content-catalog/sync', authenticateToken, async (req, res) => {
  if (!isAdminRequest(req)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const result = await syncCatalogFromWix();
  res.json(result);
});

// Recommendations (catalog-based)
router.get('/recommendations', authenticateToken, (req, res) => {
  db.get('SELECT interests FROM members WHERE id = ?', [req.user.id], (err, member) => {
    if (err) {
      console.error('❌ Database error in recommendations:', err.message);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    const interests = member?.interests || '';
    const interestList = interests.split(',').map((i) => i.trim()).filter((i) => i);
    const type = req.query.type;

    const items = loadCatalog();
    const recommendations = filterCatalogByInterests(items, interestList, type).slice(0, 12);

    res.json({
      recommendations,
      interests: interestList,
      total: recommendations.length,
      source: 'catalog'
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
  const WIX_SITE_ID = process.env.WIX_SITE_ID || 'd9c9c6b1-f79a-49a3-8183-4c5a8e24a413'; // Greenways Buildings

  const authToken = await getWixAuthToken();
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

async function fetchBlogsFromWix() {
  const authToken = await getWixAuthToken();
  if (!authToken) {
    console.log('⚠️  Wix credentials not configured. Using catalog-only blogs');
    return null;
  }

  try {
    const response = await fetch('https://www.wixapis.com/blog/v3/posts/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
      body: JSON.stringify({ paging: { limit: 50 } })
    });

    if (!response.ok) {
      throw new Error(`Wix Blog API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const posts = data.posts || data.items || data.results || [];
    const siteUrl = process.env.WIX_SITE_URL || 'https://greenwaysbuildings.com';

    return posts.map((post, index) => {
      const title = post.title?.text || post.title || post.titlePlain || 'Blog post';
      const excerpt = post.excerpt?.text || post.excerpt || post.summary || '';
      const slug = post.slug?.slug || post.slug || post.url?.slug || '';
      const url = post.url?.url || (slug ? `${siteUrl}/post/${slug}` : siteUrl);
      const imageUrl =
        post.featuredMedia?.url ||
        post.coverMedia?.image?.url ||
        post.coverMedia?.url ||
        '';
      const tags = (post.tags || post.categories || []).map((tag) => (tag.name || tag).toString());

      return {
        id: `wix-blog-${post.id || slug || index}`,
        type: 'blog',
        title,
        description: excerpt,
        category: post.category?.name || (tags[0] || 'Blog'),
        tags,
        url,
        imageUrl,
        source: 'wix'
      };
    });
  } catch (error) {
    console.error('❌ Error fetching blogs from Wix:', error.message);
    return null;
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

startCatalogAutoSync();