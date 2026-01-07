/**
 * Scheme Model for MongoDB
 * Stores energy grants, subsidies, and certification schemes
 */

const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  // Classification
  type: {
    type: String,
    required: true,
    enum: ['Grant', 'Subsidy', 'Loan', 'Tax Credit', 'Certification', 'Rebate', 'Feed-in Tariff', 'Other'],
    index: true
  },
  region: {
    type: String,
    required: true,
    index: true
  },
  
  // Funding Details
  maxFunding: {
    type: String,
    default: 'Variable'
  },
  fundingDetails: {
    type: String,
    trim: true
  },
  
  // Dates
  deadline: {
    type: String,  // Flexible format: "2025-12-31", "Ongoing", "Rolling", etc.
    index: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date,
    index: true
  },
  
  // Priority & Status
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'expiring-soon', 'expired', 'upcoming', 'paused'],
    default: 'active',
    index: true
  },
  
  // Links
  links: {
    apply: {
      type: String,
      trim: true
    },
    info: {
      type: String,
      trim: true
    },
    contact: {
      type: String,
      trim: true
    }
  },
  
  // Searchability
  keywords: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  
  // Eligibility
  eligibility: {
    type: String,
    trim: true
  },
  requirements: [{
    type: String,
    trim: true
  }],
  
  // Target Audience
  relevance: {
    type: String,
    trim: true
  },
  targetSectors: [{
    type: String,
    trim: true
  }],
  
  // Display
  icon: {
    type: String,
    default: '💶'
  },
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  
  // Tracking
  views: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  
  // Admin Notes
  internalNotes: {
    type: String,
    trim: true
  },
  lastReviewedAt: {
    type: Date
  },
  lastReviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  }
}, {
  versionKey: false
});

// Compound indexes for common queries
schemeSchema.index({ region: 1, status: 1 });
schemeSchema.index({ type: 1, status: 1 });
schemeSchema.index({ region: 1, type: 1, status: 1 });
schemeSchema.index({ keywords: 1 });
schemeSchema.index({ featured: 1, displayOrder: 1 });

// Text index for search
schemeSchema.index({ 
  title: 'text', 
  description: 'text', 
  keywords: 'text',
  eligibility: 'text'
});

// Pre-save middleware to update timestamps
schemeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for days until deadline
schemeSchema.virtual('daysUntilDeadline').get(function() {
  if (!this.endDate) return null;
  const now = new Date();
  const deadline = new Date(this.endDate);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to check if scheme is expiring soon (within 30 days)
schemeSchema.methods.isExpiringSoon = function() {
  const days = this.daysUntilDeadline;
  return days !== null && days > 0 && days <= 30;
};

// Method to check if scheme is expired
schemeSchema.methods.isExpired = function() {
  const days = this.daysUntilDeadline;
  return days !== null && days < 0;
};

// Static method to find active schemes
schemeSchema.statics.findActive = function() {
  return this.find({ status: 'active' }).sort({ displayOrder: 1, createdAt: -1 });
};

// Static method to find schemes by region
schemeSchema.statics.findByRegion = function(region) {
  return this.find({ region, status: { $in: ['active', 'expiring-soon'] } })
    .sort({ priority: -1, displayOrder: 1 });
};

// Static method to find expiring schemes
schemeSchema.statics.findExpiring = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    endDate: { $lte: futureDate, $gte: new Date() },
    status: { $in: ['active', 'expiring-soon'] }
  }).sort({ endDate: 1 });
};

// Static method to update status based on dates
// IMPORTANT: Only checks endDate field (Date type), NOT deadline field (which is a string like "Ongoing", "2025", etc.)
schemeSchema.statics.updateStatuses = async function() {
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  // Mark expired schemes - ONLY check endDate (must exist and be a valid date)
  const expiredResult = await this.updateMany(
    { 
      endDate: { $exists: true, $ne: null, $lt: now },
      status: { $nin: ['expired', 'paused', 'draft'] }
    },
    { $set: { status: 'expired' } }
  );
  
  // Mark expiring-soon schemes - ONLY check endDate (must exist and be within 30 days)
  const expiringSoonResult = await this.updateMany(
    { 
      endDate: { $exists: true, $ne: null, $gte: now, $lte: thirtyDaysFromNow },
      status: 'active'
    },
    { $set: { status: 'expiring-soon' } }
  );
  
  return { 
    updated: true, 
    timestamp: now,
    expiredCount: expiredResult.modifiedCount || 0,
    expiringSoonCount: expiringSoonResult.modifiedCount || 0
  };
};

// Static method for search
schemeSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {};
  
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  if (filters.region) {
    searchQuery.region = filters.region;
  }
  
  if (filters.type) {
    searchQuery.type = filters.type;
  }
  
  if (filters.status) {
    searchQuery.status = filters.status;
  } else {
    searchQuery.status = { $in: ['active', 'expiring-soon'] };
  }
  
  return this.find(searchQuery).sort({ priority: -1, displayOrder: 1, createdAt: -1 });
};

// Static method to get stats
schemeSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $facet: {
        total: [{ $count: 'count' }],
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        byRegion: [
          { $match: { status: { $in: ['active', 'expiring-soon'] } } },
          { $group: { _id: '$region', count: { $sum: 1 } } }
        ],
        byType: [
          { $match: { status: { $in: ['active', 'expiring-soon'] } } },
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ],
        expiringSoon: [
          { $match: { status: 'expiring-soon' } },
          { $count: 'count' }
        ]
      }
    }
  ]);
  
  return {
    total: stats[0].total[0]?.count || 0,
    byStatus: stats[0].byStatus,
    byRegion: stats[0].byRegion,
    byType: stats[0].byType,
    expiringSoon: stats[0].expiringSoon[0]?.count || 0
  };
};

const Scheme = mongoose.model('Scheme', schemeSchema);

module.exports = Scheme;

