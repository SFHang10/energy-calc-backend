/**
 * Member Model for MongoDB
 * Stores user account information
 */

const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  // Authentication
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  passwordHash: {
    type: String,
    required: true
  },
  
  // Personal Information
  name: {
    first: {
      type: String,
      trim: true
    },
    last: {
      type: String,
      trim: true
    }
  },
  company: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  displayName: {
    type: String,
    trim: true
  },
  jobTitle: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  profilePhotoUrl: {
    type: String,
    trim: true
  },
  coverPhotoUrl: {
    type: String,
    trim: true
  },
  interests: {
    type: [String],
    default: []
  },

  // Saved content hub
  savedVideos: {
    type: [
      {
        id: String,
        title: String,
        description: String,
        category: String,
        url: String,
        thumbnail: String,
        type: { type: String, default: 'video' },
        savedAt: { type: Date, default: Date.now }
      }
    ],
    default: []
  },
  savedBlogs: {
    type: [
      {
        id: String,
        title: String,
        description: String,
        category: String,
        url: String,
        imageUrl: String,
        type: { type: String, default: 'blog' },
        savedAt: { type: Date, default: Date.now }
      }
    ],
    default: []
  },
  savedReports: {
    type: [
      {
        id: String,
        title: String,
        description: String,
        category: String,
        url: String,
        type: { type: String, default: 'report' },
        savedAt: { type: Date, default: Date.now }
      }
    ],
    default: []
  },
  savedProducts: {
    type: [
      {
        id: String,
        title: String,
        description: String,
        category: String,
        url: String,
        imageUrl: String,
        type: { type: String, default: 'product' },
        savedAt: { type: Date, default: Date.now }
      }
    ],
    default: []
  },
  
  // Subscription Information
  subscriptionTier: {
    type: String,
    default: 'Free',
    index: true,
    enum: ['Free', 'Premium', 'Enterprise']
  },
  subscriptionStatus: {
    type: String,
    default: 'active',
    index: true,
    enum: ['active', 'cancelled', 'expired', 'suspended']
  },
  
  // Role/Permissions
  role: {
    type: String,
    default: 'member',
    index: true,
    enum: ['member', 'admin', 'superadmin']
  },
  permissions: [{
    type: String,
    enum: ['manage_schemes', 'manage_members', 'manage_products', 'view_analytics', 'manage_content']
  }],
  
  // Wix Integration
  wixUserId: {
    type: String,
    index: true,
    sparse: true
  },
  wixSiteId: {
    type: String,
    index: true,
    sparse: true
  },
  
  // Password Reset
  resetToken: {
    type: String,
    default: null
  },
  resetExpires: {
    type: Date,
    default: null
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  versionKey: false
});

// Compound indexes
memberSchema.index({ subscriptionTier: 1, subscriptionStatus: 1 });
memberSchema.index({ email: 1, subscriptionStatus: 1 });

// Virtual for full name
memberSchema.virtual('fullName').get(function() {
  if (this.name.first && this.name.last) {
    return `${this.name.first} ${this.name.last}`;
  }
  return this.email;
});

// Method to update last login
memberSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Static method to find active members
memberSchema.statics.findActive = function() {
  return this.find({ subscriptionStatus: 'active' });
};

// Static method to find by subscription tier
memberSchema.statics.findByTier = function(tier) {
  return this.find({ subscriptionTier: tier, subscriptionStatus: 'active' });
};

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;






