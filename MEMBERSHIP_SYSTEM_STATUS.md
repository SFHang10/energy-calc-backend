# Membership System - Current Status & Enhancement Plan

## ✅ **What's Already Built**

### Backend (`routes/members.js`)
- ✅ User registration with email/password
- ✅ User login with JWT authentication
- ✅ Get user profile (authenticated)
- ✅ Get member content based on subscription tier
- ✅ Get subscription tiers
- ✅ Update member interests
- ✅ Get recommendations based on interests
- ✅ Password reset (forgot password + reset with token)
- ✅ Database connection (SQLite: `database/members.db`)

### Backend (`routes/subscriptions-simple.js`)
- ✅ Test endpoint
- ✅ Get current subscription
- ✅ Create checkout session
- ✅ Payment history
- ✅ Cancel subscription
- ✅ Webhook handler
- ✅ Get plans

### Frontend (`wix-integration/members-section.html`)
- ✅ Login/Registration forms
- ✅ Member dashboard
- ✅ Subscription tiers display
- ✅ Content grid
- ✅ Password reset UI

### Database Schema (Current)
```sql
CREATE TABLE members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  interests TEXT,
  reset_token TEXT,
  reset_expires DATETIME
);

CREATE TABLE subscription_tiers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  features TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## ❌ **What's Missing / Needs Enhancement**

### 1. **Database Schema Issues** ⚠️ CRITICAL
**Problem:** The code references fields that don't exist in the schema:
- `first_name`, `last_name` - Used in INSERT but not in CREATE TABLE
- `company`, `phone` - Used in INSERT but not in CREATE TABLE
- `subscription_tier`, `subscription_status` - Used in INSERT but not in CREATE TABLE
- `wix_member_id` - Needed for Wix integration
- `wix_site_id` - Needed to track which Wix site (Buildings vs Marketplace)

**Action Required:** Add migration to add missing columns

### 2. **Wix Integration - Missing**
- ❌ No Wix member sync (link local members to Wix members)
- ❌ No Wix Pricing Plans integration
- ❌ No dual-site support (Greenways Buildings + Greenways Marketplace)
- ❌ No Wix member lookup by email
- ❌ No Wix subscription status sync

### 3. **Unified Membership Service - Missing**
- ❌ No service to manage members across both Wix sites
- ❌ No unified membership dashboard showing access to both sites
- ❌ No cross-site content access control
- ❌ No membership tier sync between local DB and Wix

### 4. **Content Access Control - Needs Enhancement**
- ⚠️ Current content system doesn't differentiate between Buildings and Marketplace
- ❌ No site-specific content (Buildings content vs Marketplace content)
- ❌ No unified content access based on membership tier

---

## 🎯 **Enhancement Plan**

### Phase 1: Fix Database Schema
1. Create migration script to add missing columns
2. Add `wix_member_id` and `wix_site_id` columns
3. Update existing records if needed

### Phase 2: Wix Integration
1. Create Wix member sync service
2. Link local members to Wix members on both sites
3. Sync subscription status from Wix Pricing Plans
4. Create endpoints to query Wix members

### Phase 3: Unified Membership
1. Create unified membership service
2. Update dashboard to show access to both sites
3. Create site-specific content access control
4. Add membership tier management across both sites

### Phase 4: Frontend Updates
1. Update membership dashboard to show both sites
2. Add site switcher/toggle
3. Show site-specific content
4. Update branding for Greenways Buildings + Marketplace

---

## 📋 **Next Steps**

**Before building anything new, I need to:**
1. ✅ Confirm what's already built (DONE - see above)
2. ⏳ Get approval to proceed with enhancements
3. ⏳ Fix database schema first (critical)
4. ⏳ Then build Wix integration
5. ⏳ Then build unified membership service

**Ready to proceed?** Please confirm which phase to start with.








