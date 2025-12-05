# MongoDB Quick Start Guide

**For Production Marketplace Launch**

---

## 🚀 **Quick Setup (30 minutes)**

### **Step 1: Get MongoDB Connection String (5 min)**

1. **Log into MongoDB Atlas:**
   - Go to: https://cloud.mongodb.com/
   - Sign in with your Greenways account

2. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database`

3. **Update Password:**
   - Replace `<password>` with your actual database user password
   - If you need to reset password: Database Access → Edit User → Reset Password

---

### **Step 2: Update Environment Variables (2 min)**

#### **Local Development (.env file):**
```env
USE_MONGODB=true
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/energy_calculator
```

#### **Production (Render Dashboard):**
1. Go to Render Dashboard
2. Select your service
3. Go to "Environment" tab
4. Add:
   - Key: `USE_MONGODB`
   - Value: `true`
   - Key: `MONGODB_URI`
   - Value: `mongodb+srv://username:password@cluster.mongodb.net/energy_calculator`

---

### **Step 3: Test Connection (5 min)**

```bash
# Test MongoDB connection
node test-mongodb-connection.js
```

**Expected Output:**
```
✅ MongoDB connection successful!
   Connected to: energy_calculator
   Host: cluster.mongodb.net
   ✅ Ping test successful
```

---

### **Step 4: Update server-new.js (5 min)**

Add MongoDB connection at startup:

```javascript
// At the top with other requires
const { connectMongoDB } = require('./database/mongodb');

// After all routes are mounted, before app.listen
(async () => {
  try {
    const connected = await connectMongoDB();
    if (connected) {
      console.log('✅ MongoDB ready for production');
    } else {
      console.log('⚠️ MongoDB not available, using SQLite fallback');
    }
  } catch (error) {
    console.error('⚠️ MongoDB setup failed:', error.message);
    console.log('⚠️ Continuing with SQLite fallback');
  }
})();
```

---

### **Step 5: Migrate Data (10 min)**

**⚠️ BACKUP FIRST!**

```bash
# Backup SQLite databases
cp database/energy_calculator_central.db database/energy_calculator_central.db.backup
cp database/members.db database/members.db.backup
```

**Run Migration:**
```bash
node scripts/migrate-to-mongodb.js
```

**Expected Output:**
```
🚀 Starting MongoDB migration...
✅ MongoDB connected successfully
📦 Migrating products...
✅ Products migrated: 5000 success, 0 failed
👥 Migrating members...
✅ Members migrated: 150 success, 0 failed
✅ Migration complete!
```

---

### **Step 6: Update Routes (10 min)**

See `MONGODB_PRODUCTION_MIGRATION_PLAN.md` for detailed route updates.

**Quick Test:**
```bash
# Start server
npm start

# Test products endpoint
curl http://localhost:4000/api/products

# Should return products from MongoDB
```

---

## ✅ **Verification Checklist**

- [ ] MongoDB connection string added to `.env` and Render
- [ ] `test-mongodb-connection.js` passes
- [ ] `server-new.js` includes MongoDB connection
- [ ] Data migration completed successfully
- [ ] API endpoints return data from MongoDB
- [ ] Production deployment successful
- [ ] Monitor MongoDB Atlas dashboard

---

## 🆘 **Troubleshooting**

### **Connection Failed:**
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for Render)
- Verify username/password
- Check cluster is running

### **Migration Errors:**
- Check data types match schema
- Verify MongoDB indexes created
- Check connection string format

### **Production Issues:**
- Check Render environment variables
- Verify MongoDB Atlas cluster is active
- Check MongoDB Atlas monitoring

---

## 📊 **Next Steps After Setup**

1. **Monitor Performance:**
   - Check MongoDB Atlas metrics
   - Monitor query performance
   - Set up alerts

2. **Optimize:**
   - Review slow queries
   - Add indexes as needed
   - Optimize data structure

3. **Scale:**
   - Monitor cluster usage
   - Upgrade tier if needed
   - Add read replicas for high traffic

---

**Ready to launch! 🚀**






