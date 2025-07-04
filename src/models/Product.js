const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  power: { type: Number, required: true }, // in Watts
  energyRating: { type: String },
  manufacturer: { type: String },
  modelNo: { type: String }
});

module.exports = mongoose.model('Product', productSchema); 