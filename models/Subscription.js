/**
 * Subscription Model for MongoDB
 * Stores subscription and payment information
 */

const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  // Member Reference
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
    index: true
  },
  
  // Subscription Details
  tier: {
    type: String,
    required: true,
    index: true,
    enum: ['Free', 'Premium', 'Enterprise']
  },
  status: {
    type: String,
    required: true,
    index: true,
    enum: ['active', 'cancelled', 'expired', 'suspended', 'pending']
  },
  
  // Stripe Integration
  stripeCustomerId: {
    type: String,
    index: true,
    sparse: true
  },
  stripeSubscriptionId: {
    type: String,
    index: true,
    sparse: true
  },
  
  // Dates
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  
  // Pricing
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'EUR',
    enum: ['EUR', 'USD', 'GBP']
  },
  
  // Features
  features: {
    type: [String],
    default: []
  },
  
  // Payment History
  paymentHistory: [{
    paymentId: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    status: {
      type: String,
      required: true,
      enum: ['succeeded', 'pending', 'failed', 'refunded']
    },
    description: {
      type: String
    }
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

// Compound indexes
subscriptionSchema.index({ memberId: 1, status: 1 });
subscriptionSchema.index({ status: 1, tier: 1 });
subscriptionSchema.index({ stripeCustomerId: 1 });

// Update updatedAt before saving
subscriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to add payment to history
subscriptionSchema.methods.addPayment = function(paymentData) {
  this.paymentHistory.push(paymentData);
  return this.save();
};

// Method to cancel subscription
subscriptionSchema.methods.cancel = function() {
  this.status = 'cancelled';
  // Set end date to end of current billing period
  if (!this.endDate) {
    const endDate = new Date(this.startDate);
    endDate.setMonth(endDate.getMonth() + 1); // Assuming monthly
    this.endDate = endDate;
  }
  return this.save();
};

// Static method to find active subscriptions
subscriptionSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

// Static method to find by member
subscriptionSchema.statics.findByMember = function(memberId) {
  return this.find({ memberId, status: 'active' });
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;






