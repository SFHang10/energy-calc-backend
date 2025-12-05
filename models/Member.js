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
  interests: {
    type: [String],
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






