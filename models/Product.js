/**
 * Product Model for MongoDB
 * Stores product catalog information
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Original ID from SQLite (for migration compatibility)
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Basic Information
  name: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  brand: {
    type: String,
    index: true,
    trim: true
  },
  sku: {
    type: String,
    trim: true
  },
  
  // Categorization
  category: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  subcategory: {
    type: String,
    index: true,
    trim: true
  },
  
  // Energy Information
  power: {
    type: Number,
    index: true
  },
  energyRating: {
    type: String,
    index: true,
    trim: true
  },
  efficiency: {
    type: String,
    trim: true
  },
  runningCostPerYear: {
    type: Number
  },
  
  // Pricing
  price: {
    type: Number,
    index: true
  },
  
  // Media
  imageUrl: {
    type: String,
    trim: true
  },
  
  // Descriptions
  descriptionShort: {
    type: String,
    trim: true
  },
  descriptionFull: {
    type: String,
    trim: true
  },
  modelNumber: {
    type: String,
    trim: true
  },
  
  // Flexible Data (stored as JSON in SQLite, as objects in MongoDB)
  specifications: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  marketingInfo: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  affiliateInfo: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // URLs
  productPageUrl: {
    type: String,
    trim: true
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
  }
}, {
  // Enable automatic index creation
  autoIndex: true,
  // Enable versioning
  versionKey: false
});

// Compound indexes for common queries
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ brand: 1, category: 1 });
productSchema.index({ energyRating: 1, price: 1 });
productSchema.index({ category: 1, price: 1 });

// Text search index (for search functionality)
productSchema.index({
  name: 'text',
  brand: 'text',
  descriptionFull: 'text',
  descriptionShort: 'text'
});

// Update the updatedAt field before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find products by category
productSchema.statics.findByCategory = function(category) {
  return this.find({ category: new RegExp(category, 'i') });
};

// Static method to find products by energy rating
productSchema.statics.findByEnergyRating = function(rating) {
  return this.find({ energyRating: rating });
};

// Instance method to get formatted price
productSchema.methods.getFormattedPrice = function() {
  return this.price ? `€${this.price.toFixed(2)}` : 'Price on request';
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;






