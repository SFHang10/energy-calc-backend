const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const FormData = require('form-data');
const cron = require('node-cron');
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

const SAVED_COLLECTIONS = {
  videos: 'savedVideos',
  blogs: 'savedBlogs',
  reports: 'savedReports',
  products: 'savedProducts'
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

function isAdminRequest(req, member) {
  if (member && (member.role === 'admin' || member.role === 'superadmin')) {
    return true;
  }
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
  console.log('📝 Registration request received:', req.body);
  
  const { email, password, first_name, last_name, company, phone, interests } = req.body;

  if (!email || !password) {
    console.log('❌ Missing email or password');
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Check MongoDB connection
  if (!isMongoDBConnected()) {
    console.log('❌ MongoDB not connected, attempting reconnect...');
    const connected = await connectMongoDB();
    if (!connected) {
      return res.status(500).json({ error: 'Database connection failed. Please try again.' });
    }
  }

  try {
    // Check if email already exists
    console.log('🔍 Checking if email exists:', email);
    const existingMember = await Member.findOne({ email: email.toLowerCase() });
    if (existingMember) {
      console.log('❌ Email already registered');
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new member
    console.log('👤 Creating new member...');
    const member = new Member({
      email: email.toLowerCase(),
      passwordHash,
      name: {
        first: first_name,
        last: last_name
      },
      company,
      phone,
      interests: interests ? (typeof interests === 'string' ? interests.split(',').map(i => i.trim()) : interests) : [],
      subscriptionTier: 'Free',
      subscriptionStatus: 'active'
    });

    console.log('💾 Saving member to MongoDB...');
    await member.save();
    console.log('✅ Member saved successfully');

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
        display_name: member.displayName,
        company: member.company,
        phone: member.phone,
        job_title: member.jobTitle,
        bio: member.bio,
        location: member.location,
        profile_photo_url: member.profilePhotoUrl,
        cover_photo_url: member.coverPhotoUrl,
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

// Update member profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const member = await Member.findById(req.user.id);
    if (!member) {
      return res.status(404).json({ error: 'User not found' });
    }

    const toText = (value, max = 2000) => {
      if (typeof value !== 'string') return undefined;
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
    };

    member.name = member.name || {};
    member.name.first = toText(req.body.first_name, 80) || member.name.first;
    member.name.last = toText(req.body.last_name, 80) || member.name.last;
    member.displayName = toText(req.body.display_name, 120) ?? member.displayName;
    member.company = toText(req.body.company, 120) ?? member.company;
    member.phone = toText(req.body.phone, 40) ?? member.phone;
    member.jobTitle = toText(req.body.job_title, 120) ?? member.jobTitle;
    member.bio = toText(req.body.bio, 2000) ?? member.bio;
    member.location = toText(req.body.location, 120) ?? member.location;
    member.profilePhotoUrl = toText(req.body.profile_photo_url, 500) ?? member.profilePhotoUrl;
    member.coverPhotoUrl = toText(req.body.cover_photo_url, 500) ?? member.coverPhotoUrl;

    await member.save();
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('❌ Profile update error:', error.message);
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

// Upload profile images (avatar/cover)
router.post('/profile/upload', authenticateToken, (req, res) => {
  uploadImage.single('file')(req, res, async (error) => {
    if (error) {
      console.error('❌ Upload error:', error.message);
      return res.status(400).json({ error: 'Upload failed', details: error.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const member = await Member.findById(req.user.id);
      if (!member) {
        return res.status(404).json({ error: 'User not found' });
      }

      const uploadResult = await uploadImageToWix(req.file);
      const field = req.query.type === 'cover' ? 'coverPhotoUrl' : 'profilePhotoUrl';
      member[field] = uploadResult.url;
      await member.save();

      res.json({
        success: true,
        url: uploadResult.url,
        type: field === 'coverPhotoUrl' ? 'cover' : 'avatar'
      });
    } catch (uploadError) {
      console.error('❌ Wix upload failed:', uploadError.message);
      res.status(500).json({ error: 'Failed to upload image to Wix', details: uploadError.message });
    }
  });
});

// Saved items hub
router.get('/saved-items', authenticateToken, async (req, res) => {
  try {
    const member = await Member.findById(req.user.id);
    if (!member) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      saved: {
        videos: member.savedVideos || [],
        blogs: member.savedBlogs || [],
        reports: member.savedReports || [],
        products: member.savedProducts || []
      }
    });
  } catch (error) {
    console.error('❌ Saved items error:', error.message);
    res.status(500).json({ error: 'Failed to load saved items', details: error.message });
  }
});

router.post('/saved-items/:type', authenticateToken, async (req, res) => {
  try {
    const type = req.params.type;
    const field = SAVED_COLLECTIONS[type];
    if (!field) {
      return res.status(400).json({ error: 'Invalid saved item type' });
    }

    const member = await Member.findById(req.user.id);
    if (!member) {
      return res.status(404).json({ error: 'User not found' });
    }

    const normalized = normalizeSavedItem(req.body, type);
    if (!normalized) {
      return res.status(400).json({ error: 'Invalid item payload' });
    }

    const list = member[field] || [];
    const exists = list.some((item) => item.id === normalized.id);
    if (!exists) {
      list.unshift({ ...normalized, savedAt: new Date() });
      member[field] = list.slice(0, 50);
      await member.save();
    }

    res.json({ saved: member[field], added: !exists });
  } catch (error) {
    console.error('❌ Save item error:', error.message);
    res.status(500).json({ error: 'Failed to save item', details: error.message });
  }
});

router.put('/saved-items/:type', authenticateToken, async (req, res) => {
  try {
    const type = req.params.type;
    const field = SAVED_COLLECTIONS[type];
    if (!field) {
      return res.status(400).json({ error: 'Invalid saved item type' });
    }

    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const normalized = items
      .map((item) => normalizeSavedItem(item, type))
      .filter(Boolean)
      .slice(0, 50);

    const member = await Member.findById(req.user.id);
    if (!member) {
      return res.status(404).json({ error: 'User not found' });
    }

    member[field] = normalized.map((item) => ({ ...item, savedAt: new Date() }));
    await member.save();

    res.json({ saved: member[field] });
  } catch (error) {
    console.error('❌ Save items error:', error.message);
    res.status(500).json({ error: 'Failed to save items', details: error.message });
  }
});

router.delete('/saved-items/:type/:id', authenticateToken, async (req, res) => {
  try {
    const type = req.params.type;
    const field = SAVED_COLLECTIONS[type];
    if (!field) {
      return res.status(400).json({ error: 'Invalid saved item type' });
    }

    const member = await Member.findById(req.user.id);
    if (!member) {
      return res.status(404).json({ error: 'User not found' });
    }

    const itemId = String(req.params.id);
    const list = member[field] || [];
    const filtered = list.filter((item) => String(item.id) !== itemId);
    member[field] = filtered;
    await member.save();

    res.json({ saved: member[field] });
  } catch (error) {
    console.error('❌ Remove item error:', error.message);
    res.status(500).json({ error: 'Failed to remove item', details: error.message });
  }
});

// Content catalog
router.get('/content-catalog', authenticateToken, (req, res) => {
  const type = req.query.type;
  const items = loadCatalog();
  const filtered = type ? items.filter((item) => item.type === type) : items;
  res.json({ items: filtered, total: filtered.length, source: 'catalog' });
});

router.post('/content-catalog', authenticateToken, async (req, res) => {
  const member = await Member.findById(req.user.id);
  if (!isAdminRequest(req, member)) {
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

router.put('/content-catalog/:id', authenticateToken, async (req, res) => {
  const member = await Member.findById(req.user.id);
  if (!isAdminRequest(req, member)) {
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

router.delete('/content-catalog/:id', authenticateToken, async (req, res) => {
  const member = await Member.findById(req.user.id);
  if (!isAdminRequest(req, member)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const items = loadCatalog();
  const itemId = req.params.id;
  const updated = items.filter((item) => item.id !== itemId);
  writeCatalog(updated);
  res.json({ total: updated.length });
});

router.post('/content-catalog/reorder', authenticateToken, async (req, res) => {
  const member = await Member.findById(req.user.id);
  if (!isAdminRequest(req, member)) {
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

    const member = await Member.findById(req.user.id);
    if (!isAdminRequest(req, member)) {
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
  const member = await Member.findById(req.user.id);
  if (!isAdminRequest(req, member)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const result = await syncCatalogFromWix();
  res.json(result);
});

// Recommendations (catalog-based)
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const member = await Member.findById(req.user.id);
    if (!member) {
      return res.status(404).json({ error: 'User not found' });
    }

    const type = req.query.type;
    const interests = Array.isArray(member.interests) ? member.interests : [];
    const items = loadCatalog();
    const recommendations = filterCatalogByInterests(items, interests, type).slice(0, 12);

    res.json({
      recommendations,
      interests,
      total: recommendations.length,
      source: 'catalog'
    });
  } catch (error) {
    console.error('❌ Recommendations error:', error.message);
    res.status(500).json({ error: 'Failed to load recommendations', details: error.message });
  }
});

// Blog feed (catalog-based)
router.get('/blogs', authenticateToken, (req, res) => {
  const items = loadCatalog();
  const blogs = items.filter((item) => item.type === 'blog');
  res.json({ blogs, total: blogs.length, source: 'catalog' });
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

// Interest categories (shared)
const INTEREST_CATEGORIES = [
  { id: 1, name: 'Solar Power', description: 'Solar panels, inverters, and solar energy solutions', icon: '☀️' },
  { id: 2, name: 'Heat Pumps', description: 'Air source and ground source heat pump systems', icon: '🌡️' },
  { id: 3, name: 'LED Lighting', description: 'Energy-efficient lighting solutions', icon: '💡' },
  { id: 4, name: 'Smart Home', description: 'Smart thermostats, automation, and energy monitoring', icon: '🏠' },
  { id: 5, name: 'Insulation', description: 'Home insulation and draft proofing', icon: '🧱' },
  { id: 6, name: 'Electric Vehicles', description: 'EV charging and electric transportation', icon: '🚗' },
  { id: 7, name: 'Wind Energy', description: 'Small-scale wind turbines and wind power', icon: '🌬️' },
  { id: 8, name: 'Battery Storage', description: 'Home battery systems and energy storage', icon: '🔋' },
  { id: 9, name: 'Water Heating', description: 'Efficient water heating and hot water systems', icon: '🚿' },
  { id: 10, name: 'Building Efficiency', description: 'Commercial and residential building improvements', icon: '🏢' },
  { id: 11, name: 'Grants & Funding', description: 'Energy efficiency grants and financial incentives', icon: '💰' },
  { id: 12, name: 'Renewable Certifications', description: 'Green certifications and standards', icon: '✅' }
];

// Get interest categories (public endpoint)
router.get('/interests/categories', (req, res) => {
  res.json({ categories: INTEREST_CATEGORIES });
});

// Get member interests
router.get('/interests', authenticateToken, async (req, res) => {
  try {
    const member = await Member.findById(req.user.id);
    if (!member) {
      return res.status(404).json({ error: 'User not found' });
    }
    const interests = Array.isArray(member.interests) ? member.interests : [];
    const mapped = interests.map((name) => {
      const match = INTEREST_CATEGORIES.find((cat) => cat.name === name);
      return match || { id: null, name };
    });
    res.json({ interests: mapped });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get interests', details: error.message });
  }
});

// Update member interests
router.put('/interests', authenticateToken, async (req, res) => {
  // Accept both 'interests' and 'interestIds' for compatibility
  const { interests, interestIds } = req.body;
  const interestData = interests || interestIds || [];

  try {
    const member = await Member.findById(req.user.id);
    if (!member) {
      return res.status(404).json({ error: 'User not found' });
    }

    let selected = [];
    if (Array.isArray(interestData)) {
      selected = interestData
        .map((item) => {
          if (typeof item === 'object' && item !== null) {
            return INTEREST_CATEGORIES.find((cat) => cat.id === item.id || cat.name === item.name)?.name;
          }
          if (typeof item === 'string') {
            const match = INTEREST_CATEGORIES.find((cat) => cat.name === item);
            return match ? match.name : item;
          }
          if (typeof item === 'number') {
            const match = INTEREST_CATEGORIES.find((cat) => cat.id === item);
            return match ? match.name : null;
          }
          return null;
        })
        .filter(Boolean);
    }

    member.interests = selected;
    await member.save();

    const responseInterests = member.interests.map((name) => {
      const match = INTEREST_CATEGORIES.find((cat) => cat.name === name);
      return match || { id: null, name };
    });
    res.json({ message: 'Interests updated', interests: responseInterests });
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
// Simple in-memory cache for videos (production: use Redis or similar)
let videoCache = {
  data: null,
  timestamp: null,
  ttl: 30 * 60 * 1000 // 30 minutes
};

// Fetch videos from Wix API
async function fetchVideosFromWix() {
  const WIX_SITE_ID = process.env.WIX_SITE_ID || 'd9c9c6b1-f79a-49a3-8183-4c5a8e24a413';
  const authToken = await getWixAuthToken();

  if (!authToken) {
    console.log('⚠️  Wix credentials not configured. Using fallback videos');
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
        siteId: WIX_SITE_ID,
        paging: { limit: 200 }
      })
    });

    if (!response.ok) {
      throw new Error(`Wix API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const videos = (data.files || []).map((file, index) => {
      const video = file.media?.video;
      const resolutions = video?.resolutions || [];
      const bestResolution = resolutions[0] || {};
      const labels = file.labels || [];
      const category = extractCategoryFromLabels(labels, file.displayName);

      return {
        id: file.id || index,
        title: file.displayName || 'Untitled Video',
        description: `Video from Greenways Buildings - ${file.displayName || ''}`,
        thumbnail: file.thumbnailUrl || 'https://via.placeholder.com/320x180?text=Video',
        videoUrl: bestResolution.url || file.url,
        videoId: file.id,
        duration: video?.duration ? formatDuration(video.duration) : 'N/A',
        category,
        tags: labels,
        source: 'wix',
        wixFileId: file.id
      };
    });

    return videos;
  } catch (error) {
    console.error('❌ Error fetching videos from Wix:', error.message);
    return null;
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

function extractCategoryFromLabels(labels, filename) {
  const filenameLower = (filename || '').toLowerCase();
  const labelsLower = labels.map((l) => (typeof l === 'string' ? l.toLowerCase() : ''));
  const allText = [...labelsLower, filenameLower].join(' ');

  if (allText.includes('solar') || allText.includes('pv')) return 'solar';
  if (allText.includes('water') || allText.includes('conservation')) return 'water';
  if (allText.includes('hvac') || allText.includes('heating') || allText.includes('cooling')) return 'hvac';
  if (allText.includes('led') || allText.includes('lighting') || allText.includes('light')) return 'lighting';
  if (allText.includes('energy') || allText.includes('efficiency') || allText.includes('saving')) return 'energy';
  return 'general';
}

function formatDuration(seconds) {
  if (!seconds) return 'N/A';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

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

async function getVideos() {
  const now = Date.now();
  if (videoCache.data && videoCache.timestamp && (now - videoCache.timestamp) < videoCache.ttl) {
    return videoCache.data;
  }

  const wixVideos = await fetchVideosFromWix();
  if (wixVideos && wixVideos.length > 0) {
    videoCache.data = wixVideos;
    videoCache.timestamp = now;
    return wixVideos;
  }

  const fallback = getSampleVideos();
  videoCache.data = fallback;
  videoCache.timestamp = now;
  return fallback;
}

// Get videos (filtered by member interests)
router.get('/videos', authenticateToken, async (req, res) => {
  try {
    const member = await Member.findById(req.user.id);
    const userInterests = Array.isArray(member?.interests) ? member.interests.map((i) => i.toLowerCase()) : [];

    const allVideos = await getVideos();
    let filteredVideos = allVideos;

    if (userInterests.length > 0) {
      const interestToCategory = {
        'solar power': ['solar'],
        'heat pumps': ['hvac'],
        'led lighting': ['lighting'],
        'smart home': ['energy'],
        'insulation': ['energy'],
        'electric vehicles': ['energy'],
        'wind energy': ['energy'],
        'battery storage': ['energy'],
        'water heating': ['water'],
        'building efficiency': ['energy'],
        'grants & funding': ['energy'],
        'renewable certifications': ['energy']
      };

      const relevantCategories = new Set();
      userInterests.forEach((interest) => {
        const categories = interestToCategory[interest];
        if (categories) {
          categories.forEach((cat) => relevantCategories.add(cat));
        }
      });

      if (relevantCategories.size > 0) {
        filteredVideos = allVideos.filter((video) => relevantCategories.has(video.category));
      }

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
    console.error('❌ Error fetching videos:', error.message);
    res.status(500).json({ error: 'Failed to fetch videos', details: error.message });
  }
});

console.log('✅ Members MongoDB router loaded');

startCatalogAutoSync();

module.exports = router;
