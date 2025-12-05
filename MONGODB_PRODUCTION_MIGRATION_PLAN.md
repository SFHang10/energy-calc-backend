# MongoDB Production Migration Plan

**Date:** Current Session  
**Status:** 🚀 **PRODUCTION LAUNCH READY**  
**Goal:** Migrate from SQLite to MongoDB for production marketplace

---

## 🎯 **Strategy: Hybrid Approach (Recommended)**

**Use MongoDB as PRIMARY database for:**
- ✅ Products (main catalog)
- ✅ Members (user accounts)
- ✅ Subscriptions (payment data)
- ✅ Orders/Transactions (future)

**Keep SQLite as FALLBACK for:**
- ✅ Local development/testing
- ✅ Backup/read-only queries
- ✅ Migration safety net

---

## 📊 **Current SQLite Structure**

### **Database 1: `energy_calculator_central.db`**
**Table: `products`**
- Product catalog (5000+ products)
- Categories, subcategories
- Energy ratings, power consumption
- Images, pricing, specifications

### **Database 2: `members.db`**
**Table: `members`**
- User accounts (email, password_hash)
- Profile information
- Subscription tier/status

**Table: `subscription_tiers`**
- Pricing plans
- Features per tier

---

## 🏗️ **MongoDB Schema Design**

### **Collection 1: `products`**
```javascript
{
  _id: ObjectId,
  id: String,              // Original ID from SQLite
  name: String,
  brand: String,
  category: String,
  subcategory: String,
  power: Number,
  energyRating: String,
  price: Number,
  imageUrl: String,
  sku: String,
  efficiency: String,
  runningCostPerYear: Number,
  descriptionShort: String,
  descriptionFull: String,
  specifications: Object,  // Flexible nested data
  marketingInfo: Object,
  productPageUrl: String,
  affiliateInfo: Object,
  createdAt: Date,
  updatedAt: Date,
  // Indexes for fast queries
  // category, brand, energyRating, price range
}
```

### **Collection 2: `members`**
```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  passwordHash: String,
  name: {
    first: String,
    last: String
  },
  company: String,
  phone: String,
  interests: [String],
  subscriptionTier: String,
  subscriptionStatus: String,
  wixUserId: String,       // For Wix integration
  wixSiteId: String,       // Which Wix site
  createdAt: Date,
  lastLogin: Date,
  resetToken: String,
  resetExpires: Date
}
```

### **Collection 3: `subscriptions`**
```javascript
{
  _id: ObjectId,
  memberId: ObjectId (ref: members),
  tier: String,
  status: String,           // active, cancelled, expired
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  startDate: Date,
  endDate: Date,
  price: Number,
  currency: String,
  features: [String],
  paymentHistory: [{
    paymentId: String,
    amount: Number,
    date: Date,
    status: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### **Collection 4: `subscription_tiers`** (Pricing Plans)
```javascript
{
  _id: ObjectId,
  name: String,
  price: Number,
  currency: String,
  features: [String],
  description: String,
  public: Boolean,
  createdAt: Date
}
```

---

## 🔧 **Implementation Steps**

### **Phase 1: MongoDB Setup (Day 1)**

#### **Step 1.1: Create MongoDB Connection Module**
**File: `database/mongodb.js`**
```javascript
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 
                   process.env.MONGO_URI || 
                   process.env.DATABASE_URL;

let isConnected = false;

async function connectMongoDB() {
  if (isConnected) {
    console.log('✅ MongoDB already connected');
    return;
  }

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    throw new Error('MongoDB connection string required');
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
      isConnected = false;
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    isConnected = false;
    throw error;
  }
}

module.exports = { connectMongoDB, mongoose };
```

#### **Step 1.2: Create MongoDB Models**
**File: `models/Product.js`**
```javascript
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  brand: { type: String, index: true },
  category: { type: String, required: true, index: true },
  subcategory: { type: String, index: true },
  power: Number,
  energyRating: { type: String, index: true },
  price: { type: Number, index: true },
  imageUrl: String,
  sku: String,
  efficiency: String,
  runningCostPerYear: Number,
  descriptionShort: String,
  descriptionFull: String,
  specifications: mongoose.Schema.Types.Mixed,
  marketingInfo: mongoose.Schema.Types.Mixed,
  productPageUrl: String,
  affiliateInfo: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ brand: 1, category: 1 });
productSchema.index({ energyRating: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);
```

**File: `models/Member.js`**
```javascript
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  name: {
    first: String,
    last: String
  },
  company: String,
  phone: String,
  interests: [String],
  subscriptionTier: { type: String, default: 'Free', index: true },
  subscriptionStatus: { type: String, default: 'active', index: true },
  wixUserId: String,
  wixSiteId: String,
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
  resetToken: String,
  resetExpires: Date
});

module.exports = mongoose.model('Member', memberSchema);
```

**File: `models/Subscription.js`**
```javascript
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
  tier: { type: String, required: true, index: true },
  status: { type: String, required: true, index: true },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  startDate: { type: Date, required: true },
  endDate: Date,
  price: Number,
  currency: { type: String, default: 'EUR' },
  features: [String],
  paymentHistory: [{
    paymentId: String,
    amount: Number,
    date: Date,
    status: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
```

#### **Step 1.3: Update `server-new.js`**
Add MongoDB connection at startup:
```javascript
const { connectMongoDB } = require('./database/mongodb');

// After all route mounting, before app.listen
(async () => {
  try {
    await connectMongoDB();
  } catch (error) {
    console.error('⚠️ MongoDB connection failed, continuing with SQLite fallback');
  }
})();

app.listen(PORT, () => {
  // ... existing code
});
```

---

### **Phase 2: Data Migration (Day 1-2)**

#### **Step 2.1: Create Migration Script**
**File: `scripts/migrate-to-mongodb.js`**
```javascript
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { connectMongoDB, mongoose } = require('../database/mongodb');
const Product = require('../models/Product');
const Member = require('../models/Member');
const Subscription = require('../models/Subscription');

async function migrateProducts() {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, '../database/energy_calculator_central.db');
    const db = new sqlite3.Database(dbPath);
    
    db.all('SELECT * FROM products WHERE category != "Comparison Data"', [], async (err, rows) => {
      if (err) {
        console.error('❌ Error reading SQLite products:', err);
        return reject(err);
      }
      
      console.log(`📦 Migrating ${rows.length} products to MongoDB...`);
      
      let success = 0;
      let failed = 0;
      
      for (const row of rows) {
        try {
          const product = new Product({
            id: row.id,
            name: row.name,
            brand: row.brand,
            category: row.category,
            subcategory: row.subcategory,
            power: row.power,
            energyRating: row.energyRating,
            price: row.price,
            imageUrl: row.imageUrl,
            sku: row.sku,
            efficiency: row.efficiency,
            runningCostPerYear: row.runningCostPerYear,
            descriptionShort: row.descriptionShort,
            descriptionFull: row.descriptionFull,
            specifications: row.specifications ? JSON.parse(row.specifications) : {},
            marketingInfo: row.marketingInfo ? JSON.parse(row.marketingInfo) : {},
            productPageUrl: row.productPageUrl,
            affiliateInfo: row.affiliateInfo ? JSON.parse(row.affiliateInfo) : {},
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          await product.save();
          success++;
        } catch (error) {
          console.error(`❌ Failed to migrate product ${row.id}:`, error.message);
          failed++;
        }
      }
      
      console.log(`✅ Products migrated: ${success} success, ${failed} failed`);
      db.close();
      resolve({ success, failed });
    });
  });
}

async function migrateMembers() {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, '../database/members.db');
    const db = new sqlite3.Database(dbPath);
    
    db.all('SELECT * FROM members', [], async (err, rows) => {
      if (err) {
        console.error('❌ Error reading SQLite members:', err);
        return reject(err);
      }
      
      console.log(`👥 Migrating ${rows.length} members to MongoDB...`);
      
      let success = 0;
      let failed = 0;
      
      for (const row of rows) {
        try {
          const nameParts = (row.name || '').split(' ');
          const member = new Member({
            email: row.email,
            passwordHash: row.password_hash,
            name: {
              first: nameParts[0] || '',
              last: nameParts.slice(1).join(' ') || ''
            },
            company: row.company,
            phone: row.phone,
            interests: row.interests ? row.interests.split(',') : [],
            subscriptionTier: row.subscription_tier || 'Free',
            subscriptionStatus: row.subscription_status || 'active',
            createdAt: row.created_at ? new Date(row.created_at) : new Date(),
            lastLogin: row.last_login ? new Date(row.last_login) : null,
            resetToken: row.reset_token,
            resetExpires: row.reset_expires ? new Date(row.reset_expires) : null
          });
          
          await member.save();
          success++;
        } catch (error) {
          console.error(`❌ Failed to migrate member ${row.email}:`, error.message);
          failed++;
        }
      }
      
      console.log(`✅ Members migrated: ${success} success, ${failed} failed`);
      db.close();
      resolve({ success, failed });
    });
  });
}

async function main() {
  try {
    console.log('🚀 Starting MongoDB migration...\n');
    
    await connectMongoDB();
    
    console.log('📦 Migrating products...');
    await migrateProducts();
    
    console.log('\n👥 Migrating members...');
    await migrateMembers();
    
    console.log('\n✅ Migration complete!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
```

#### **Step 2.2: Run Migration**
```bash
node scripts/migrate-to-mongodb.js
```

---

### **Phase 3: Update Routes to Use MongoDB (Day 2-3)**

#### **Step 3.1: Update `routes/products.js`**
Replace SQLite queries with MongoDB:

```javascript
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, subcategory, brand, energyRating, minPrice, maxPrice } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (brand) query.brand = brand;
    if (energyRating) query.energyRating = energyRating;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    const products = await Product.find(query).sort({ category: 1, name: 1 });
    res.json(products);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});
```

#### **Step 3.2: Update `routes/members.js`**
Replace SQLite with MongoDB:

```javascript
const Member = require('../models/Member');

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, company, phone, interests } = req.body;
    
    // Check if user exists
    const existing = await Member.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create member
    const member = new Member({
      email,
      passwordHash,
      name: { first: first_name, last: last_name },
      company,
      phone,
      interests: interests ? interests.split(',') : []
    });
    
    await member.save();
    
    // Generate JWT
    const token = jwt.sign({ id: member._id, email }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ token, member: { id: member._id, email: member.email } });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});
```

---

### **Phase 4: Hybrid Fallback System (Day 3)**

#### **Step 4.1: Create Database Service Layer**
**File: `services/database-service.js`**
```javascript
const Product = require('../models/Product');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DatabaseService {
  constructor() {
    this.useMongoDB = process.env.USE_MONGODB !== 'false';
    this.sqliteDb = null;
    
    if (!this.useMongoDB) {
      this.initSQLite();
    }
  }
  
  initSQLite() {
    const dbPath = path.join(__dirname, '../database/energy_calculator_central.db');
    this.sqliteDb = new sqlite3.Database(dbPath);
  }
  
  async getProducts(query = {}) {
    if (this.useMongoDB) {
      try {
        return await Product.find(query);
      } catch (error) {
        console.error('❌ MongoDB error, falling back to SQLite:', error);
        return this.getProductsFromSQLite(query);
      }
    } else {
      return this.getProductsFromSQLite(query);
    }
  }
  
  getProductsFromSQLite(query) {
    // SQLite fallback implementation
    return new Promise((resolve, reject) => {
      // ... SQLite query logic
    });
  }
}

module.exports = new DatabaseService();
```

---

### **Phase 5: Environment Configuration**

#### **Step 5.1: Update `.env` Template**
```env
# Database Configuration
USE_MONGODB=true
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/energy_calculator?retryWrites=true&w=majority

# Fallback (if MongoDB fails)
USE_SQLITE_FALLBACK=true
DB_PATH=./database/members.db
```

#### **Step 5.2: Update Render Environment Variables**
1. Go to Render Dashboard
2. Select your service
3. Go to Environment tab
4. Add:
   - `USE_MONGODB=true`
   - `MONGODB_URI=your_mongodb_atlas_connection_string`

---

## 🚀 **Deployment Checklist**

### **Pre-Launch:**
- [ ] MongoDB Atlas cluster created and configured
- [ ] Connection string added to Render environment variables
- [ ] Migration script tested on staging data
- [ ] All routes updated to use MongoDB
- [ ] Fallback system tested
- [ ] Indexes created for performance
- [ ] Backup strategy configured

### **Launch Day:**
- [ ] Run migration script (backup SQLite first!)
- [ ] Verify data integrity
- [ ] Test all API endpoints
- [ ] Monitor MongoDB connection
- [ ] Check performance metrics

### **Post-Launch:**
- [ ] Monitor error logs
- [ ] Verify MongoDB Atlas metrics
- [ ] Keep SQLite as backup for 30 days
- [ ] Document any issues

---

## 📈 **Performance Optimizations**

### **MongoDB Indexes:**
```javascript
// Products collection
db.products.createIndex({ category: 1, subcategory: 1 });
db.products.createIndex({ brand: 1 });
db.products.createIndex({ energyRating: 1, price: 1 });
db.products.createIndex({ name: "text", descriptionFull: "text" }); // Text search

// Members collection
db.members.createIndex({ email: 1 }); // Already unique
db.members.createIndex({ subscriptionTier: 1, subscriptionStatus: 1 });

// Subscriptions collection
db.subscriptions.createIndex({ memberId: 1 });
db.subscriptions.createIndex({ status: 1, tier: 1 });
```

---

## 🔒 **Security Considerations**

1. **Connection String Security:**
   - Never commit `MONGODB_URI` to Git
   - Use Render environment variables
   - Rotate passwords regularly

2. **Data Validation:**
   - Use Mongoose schema validation
   - Sanitize user inputs
   - Validate email formats

3. **Access Control:**
   - Use MongoDB Atlas IP whitelist
   - Limit database user permissions
   - Enable MongoDB Atlas monitoring

---

## 📊 **Monitoring & Maintenance**

### **MongoDB Atlas Monitoring:**
- Set up alerts for:
  - Connection failures
  - High memory usage
  - Slow queries
  - Disk space

### **Application Monitoring:**
- Log MongoDB connection status
- Track query performance
- Monitor error rates
- Set up alerts for failures

---

## ✅ **Success Criteria**

- [ ] All products migrated successfully
- [ ] All members migrated successfully
- [ ] API endpoints respond faster than SQLite
- [ ] No data loss during migration
- [ ] Fallback system works if MongoDB fails
- [ ] Production traffic handled smoothly

---

## 🆘 **Rollback Plan**

If MongoDB fails in production:

1. **Immediate:** Set `USE_MONGODB=false` in Render
2. **Restart:** Service will use SQLite fallback
3. **Investigate:** Check MongoDB Atlas logs
4. **Fix:** Resolve connection/performance issues
5. **Re-enable:** Set `USE_MONGODB=true` after fix

---

**Last Updated:** Current Session  
**Status:** Ready for Implementation  
**Estimated Time:** 2-3 days for full migration






