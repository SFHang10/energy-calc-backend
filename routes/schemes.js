/**
 * Schemes API Routes
 * Handles CRUD operations for energy grants, subsidies, and certifications
 * Includes admin-only endpoints for management
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { connectMongoDB, isMongoDBConnected } = require('../database/mongodb');
const Scheme = require('../models/Scheme');
const Member = require('../models/Member');

console.log('🚀 Schemes router loading...');

const router = express.Router();

// Connect to MongoDB on startup
connectMongoDB().then(connected => {
  if (connected) {
    console.log('✅ Schemes route connected to MongoDB');
  } else {
    console.log('⚠️ Schemes route: MongoDB not connected');
  }
});

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'greenways-secret-key-2025';

// ============================================
// MIDDLEWARE
// ============================================

// Authenticate JWT tokens
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

// Check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const member = await Member.findById(req.user.id);
    
    if (!member) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (member.role !== 'admin' && member.role !== 'superadmin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.member = member;
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

// Check specific permission
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const member = await Member.findById(req.user.id);
      
      if (!member) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Superadmin has all permissions
      if (member.role === 'superadmin') {
        req.member = member;
        return next();
      }
      
      // Check if admin has specific permission
      if (member.role === 'admin' && member.permissions?.includes(permission)) {
        req.member = member;
        return next();
      }
      
      return res.status(403).json({ error: `Permission '${permission}' required` });
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};

// ============================================
// AUTOMATIC STATUS UPDATE - DISABLED
// Status updates should be done manually via JSON import
// ============================================

// let lastAutoUpdate = null;
// const AUTO_UPDATE_INTERVAL = 24 * 60 * 60 * 1000;
// async function autoUpdateStatusesIfNeeded() { ... } - DISABLED

// ============================================
// PUBLIC ENDPOINTS (No auth required)
// ============================================

// GET /api/schemes - Get all active schemes (public)
router.get('/', async (req, res) => {
  try {
    // Automatic status update DISABLED - manage manually via JSON import
    // autoUpdateStatusesIfNeeded();
    
    const { region, type, search, limit = 100 } = req.query;
    
    const query = { status: { $in: ['active', 'expiring-soon'] } };
    
    if (region && region !== 'all') {
      query.region = region;
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    let schemes;
    
    if (search) {
      schemes = await Scheme.find({
        ...query,
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { keywords: { $regex: search, $options: 'i' } }
        ]
      })
      .select('-internalNotes -lastReviewedBy')
      .sort({ priority: -1, displayOrder: 1 })
      .limit(parseInt(limit));
    } else {
      schemes = await Scheme.find(query)
        .select('-internalNotes -lastReviewedBy')
        .sort({ priority: -1, displayOrder: 1 })
        .limit(parseInt(limit));
    }
    
    // Track view (increment asynchronously)
    if (schemes.length > 0) {
      Scheme.updateMany(
        { _id: { $in: schemes.map(s => s._id) } },
        { $inc: { views: 1 } }
      ).exec();
    }
    
    res.json({
      success: true,
      count: schemes.length,
      schemes
    });
  } catch (error) {
    console.error('❌ Error fetching schemes:', error);
    res.status(500).json({ error: 'Failed to fetch schemes', details: error.message });
  }
});

// GET /api/schemes/stats - Get public stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await Scheme.getStats();
    
    res.json({
      success: true,
      stats: {
        total: stats.total,
        regions: stats.byRegion.length,
        types: stats.byType.length,
        expiringSoon: stats.expiringSoon
      }
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
  }
});

// GET /api/schemes/regions - Get list of regions
router.get('/regions', async (req, res) => {
  try {
    const regions = await Scheme.distinct('region', { status: { $in: ['active', 'expiring-soon'] } });
    res.json({ success: true, regions: regions.sort() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
});

// GET /api/schemes/types - Get list of scheme types
router.get('/types', async (req, res) => {
  try {
    const types = await Scheme.distinct('type', { status: { $in: ['active', 'expiring-soon'] } });
    res.json({ success: true, types: types.sort() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch types' });
  }
});

// GET /api/schemes/:id - Get single scheme
router.get('/:id', async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id)
      .select('-internalNotes -lastReviewedBy');
    
    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found' });
    }
    
    // Track click
    scheme.clicks += 1;
    await scheme.save();
    
    res.json({ success: true, scheme });
  } catch (error) {
    console.error('❌ Error fetching scheme:', error);
    res.status(500).json({ error: 'Failed to fetch scheme', details: error.message });
  }
});

// ============================================
// ADMIN ENDPOINTS (Auth required)
// ============================================

// GET /api/schemes/admin/all - Get ALL schemes including expired (admin only)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, region, type, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (region && region !== 'all') query.region = region;
    if (type && type !== 'all') query.type = type;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [schemes, total] = await Promise.all([
      Scheme.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Scheme.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      schemes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Admin fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch schemes', details: error.message });
  }
});

// GET /api/schemes/admin/stats - Get detailed admin stats
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await Scheme.getStats();
    
    // Get schemes expiring in next 7 days
    const sevenDays = new Date();
    sevenDays.setDate(sevenDays.getDate() + 7);
    const urgentExpiring = await Scheme.countDocuments({
      endDate: { $lte: sevenDays, $gte: new Date() },
      status: { $in: ['active', 'expiring-soon'] }
    });
    
    // Get recently added (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyAdded = await Scheme.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    res.json({
      success: true,
      stats: {
        ...stats,
        urgentExpiring,
        recentlyAdded
      }
    });
  } catch (error) {
    console.error('❌ Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats', details: error.message });
  }
});

// GET /api/schemes/admin/expiring - Get expiring schemes
router.get('/admin/expiring', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const schemes = await Scheme.findExpiring(parseInt(days));
    
    res.json({
      success: true,
      count: schemes.length,
      schemes
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expiring schemes' });
  }
});

// POST /api/schemes/admin - Create new scheme (admin only)
router.post('/admin', authenticateToken, requirePermission('manage_schemes'), async (req, res) => {
  try {
    const schemeData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    // Parse endDate if deadline is provided
    if (schemeData.deadline && !schemeData.endDate) {
      const parsed = new Date(schemeData.deadline);
      if (!isNaN(parsed.getTime())) {
        schemeData.endDate = parsed;
      }
    }
    
    const scheme = new Scheme(schemeData);
    await scheme.save();
    
    console.log(`✅ New scheme created: ${scheme.title} by ${req.member.email}`);
    
    res.status(201).json({
      success: true,
      message: 'Scheme created successfully',
      scheme
    });
  } catch (error) {
    console.error('❌ Error creating scheme:', error);
    res.status(500).json({ error: 'Failed to create scheme', details: error.message });
  }
});

// PUT /api/schemes/admin/:id - Update scheme (admin only)
router.put('/admin/:id', authenticateToken, requirePermission('manage_schemes'), async (req, res) => {
  try {
    const updates = {
      ...req.body,
      lastReviewedAt: new Date(),
      lastReviewedBy: req.user.id
    };
    
    // Parse endDate if deadline is updated
    if (updates.deadline && !updates.endDate) {
      const parsed = new Date(updates.deadline);
      if (!isNaN(parsed.getTime())) {
        updates.endDate = parsed;
      }
    }
    
    const scheme = await Scheme.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found' });
    }
    
    console.log(`✅ Scheme updated: ${scheme.title} by ${req.member.email}`);
    
    res.json({
      success: true,
      message: 'Scheme updated successfully',
      scheme
    });
  } catch (error) {
    console.error('❌ Error updating scheme:', error);
    res.status(500).json({ error: 'Failed to update scheme', details: error.message });
  }
});

// DELETE /api/schemes/admin/:id - Delete scheme (admin only)
router.delete('/admin/:id', authenticateToken, requirePermission('manage_schemes'), async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndDelete(req.params.id);
    
    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found' });
    }
    
    console.log(`🗑️ Scheme deleted: ${scheme.title} by ${req.member.email}`);
    
    res.json({
      success: true,
      message: 'Scheme deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting scheme:', error);
    res.status(500).json({ error: 'Failed to delete scheme', details: error.message });
  }
});

// POST /api/schemes/admin/bulk-update-status - Update statuses based on dates
router.post('/admin/bulk-update-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await Scheme.updateStatuses();
    
    console.log(`🔄 Bulk status update completed at ${result.timestamp}`);
    
    res.json({
      success: true,
      message: 'Statuses updated',
      ...result
    });
  } catch (error) {
    console.error('❌ Bulk update error:', error);
    res.status(500).json({ error: 'Failed to update statuses', details: error.message });
  }
});

// POST /api/schemes/admin/import - Bulk import schemes
router.post('/admin/import', authenticateToken, requirePermission('manage_schemes'), async (req, res) => {
  try {
    const { schemes, overwrite = false } = req.body;
    
    if (!Array.isArray(schemes) || schemes.length === 0) {
      return res.status(400).json({ error: 'schemes array is required' });
    }
    
    const results = {
      created: 0,
      updated: 0,
      errors: []
    };
    
    for (const schemeData of schemes) {
      try {
        // Check if scheme exists by title and region
        const existing = await Scheme.findOne({
          title: schemeData.title,
          region: schemeData.region
        });
        
        if (existing) {
          if (overwrite) {
            await Scheme.findByIdAndUpdate(existing._id, {
              ...schemeData,
              lastReviewedAt: new Date(),
              lastReviewedBy: req.user.id
            });
            results.updated++;
          }
        } else {
          const newScheme = new Scheme({
            ...schemeData,
            createdBy: req.user.id
          });
          await newScheme.save();
          results.created++;
        }
      } catch (err) {
        results.errors.push({ title: schemeData.title, error: err.message });
      }
    }
    
    console.log(`📥 Bulk import: ${results.created} created, ${results.updated} updated, ${results.errors.length} errors`);
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('❌ Import error:', error);
    res.status(500).json({ error: 'Import failed', details: error.message });
  }
});

// POST /api/schemes/admin/export - Export schemes as JSON
router.get('/admin/export', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status = 'active' } = req.query;
    
    const query = status === 'all' ? {} : { status: { $in: ['active', 'expiring-soon'] } };
    const schemes = await Scheme.find(query)
      .select('-views -clicks -internalNotes -lastReviewedBy')
      .sort({ region: 1, displayOrder: 1 });
    
    res.json({
      success: true,
      exportDate: new Date().toISOString(),
      count: schemes.length,
      schemes
    });
  } catch (error) {
    res.status(500).json({ error: 'Export failed', details: error.message });
  }
});

// ============================================
// ADMIN USER MANAGEMENT
// ============================================

// POST /api/schemes/admin/set-admin - Set user as admin (superadmin only or with admin key)
router.post('/admin/set-admin', async (req, res) => {
  const { email, adminKey, role = 'admin', permissions = ['manage_schemes'] } = req.body;
  
  // Allow with admin key for initial setup
  const ADMIN_KEY = process.env.ADMIN_KEY || 'greenways-admin-2025';
  
  if (adminKey !== ADMIN_KEY) {
    return res.status(403).json({ error: 'Invalid admin key' });
  }
  
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }
  
  try {
    const member = await Member.findOne({ email: email.toLowerCase() });
    
    if (!member) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    member.role = role;
    member.permissions = permissions;
    await member.save();
    
    console.log(`👑 User ${email} set as ${role}`);
    
    res.json({
      success: true,
      message: `User ${email} is now ${role}`,
      user: {
        email: member.email,
        role: member.role,
        permissions: member.permissions
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set admin', details: error.message });
  }
});

console.log('✅ Schemes router loaded');

module.exports = router;

