const mongoose = require('mongoose');

const StatsSchema = new mongoose.Schema(
  {
    savings: { type: String, trim: true },
    energy: { type: String, trim: true },
    co2: { type: String, trim: true },
    payback: { type: String, trim: true }
  },
  { _id: false }
);

const CompanySchema = new mongoose.Schema(
  {
    id: { type: Number, index: true },
    name: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    city: { type: String, trim: true },
    lng: { type: Number },
    lat: { type: Number },
    sector: { type: String, default: 'other', trim: true },
    color: { type: String, trim: true },
    desc: { type: String, trim: true },
    stats: { type: StatsSchema },
    nameLower: { type: String, index: true },
    countryLower: { type: String, index: true }
  },
  { timestamps: true }
);

CompanySchema.pre('save', function setLowerFields(next) {
  if (this.name) this.nameLower = this.name.toLowerCase();
  if (this.country) this.countryLower = this.country.toLowerCase();
  next();
});

module.exports = mongoose.model('Company', CompanySchema);
