# Work Todos from Chat History

**Extracted on:** 2025-11-09  
**Source:** Recovered chat conversations

---

## 🔧 Chat Recovery & Account Issues

1. [ ] Check if any old conversations appear there
2. [ ] Install SQLite from: https://www.sqlite.org/download.html
3. [ ] Run: `sqlite3 state.vscdb .dump > chat_export.txt`
4. [ ] Download Node.js from: https://nodejs.org/
5. [ ] Install the LTS version of Node.js
6. [ ] Run: `git clone https://github.com/thomas-pedersen/cursor-chat-browser.git`
7. [ ] Check if chats are in a different location — search for other database files
8. [ ] Check the other large database for chats
9. [ ] Check globalStorage database for chat history
10. [ ] Check cursorDiskKV table for chat history
11. [ ] Check account context and chat associations
12. [ ] Check which workspace the chats are associated with
13. [ ] Check account context for chats - anonymous vs signed-in account
14. [ ] Check workspace context mismatch - what Cursor expects vs what chats have
15. [ ] Install better-sqlite3: `npm install better-sqlite3`
16. [ ] Run recovery script again to extract full chat data
17. [ ] Check the summary file for a quick overview

---

## 📧 Account Recovery Tasks

1. [ ] Check Your Email
2. [ ] Check Payment Records
3. [ ] Check Cursor Settings
4. [ ] Check your credit card/bank statements for Cursor charges
5. [ ] Check PayPal if you used it
6. [ ] Check if there's any account information displayed
7. [ ] Check your email (`Stephen.hanglan@gmail.com`) for:
   - Account confirmation emails
   - Payment receipts
   - Sign-up notifications
8. [ ] Create a new email to: `support@cursoragent.com`
9. [ ] Add your GitHub email address if it's different from Stephen.hanglan@gmail.com (replace the placeholder in the email)

---

## 🛠️ Development & Product Tasks

1. [ ] Fix a bug
2. [ ] Add a feature
3. [ ] Update the database
4. [ ] Documentation files
5. [ ] Fix products not showing — add the JSON file to Git or initialize the database
6. [ ] Check current products — see what's in the Wix store
7. [ ] Fix the missing JSON file — ensure the database file is deployed
8. [ ] Update products — modify product data in Wix
9. [ ] Check product details — view specific products
10. [ ] Update site settings
11. [ ] Check existing products and any referral/affiliate configuration

---

## 📦 Product Image Tasks

1. [ ] Review `_TOMORROW_PRODUCT_IMAGES.md`
2. [ ] Review `-TOMORROW-upload-final-batch.md`
3. [ ] Review `S_FOR_TOMORROW.md`
4. [ ] Upload final batch of product images
5. [ ] Verify all product images are uploaded

---

## 🔍 Testing & Verification Tasks

1. [ ] Test one
2. [ ] Verify
3. [ ] Upload
4. [ ] Monitor
5. [ ] Test on production
6. [ ] Verify all functionality
7. [ ] Create database directory if missing and initialize tables
8. [ ] Run script again: `node enrich-hand-dryers-WITH-MCP-DATA.js`

---

## 📂 File & Backup Tasks

1. [ ] Check git history: `git log --all --full-history -- [filename]`
2. [ ] Check backups in the `database/backups/` folder
3. [ ] Check the many backup JSON files in root directory
4. [ ] Check your extensions
5. [ ] Double-click: `C:\Users\steph\Documents\energy-cal-backend\energy-cal-backend.code-workspace`
6. [ ] Settings lost? - Check workspace settings

---

## 📚 Documentation & Research

1. [ ] Build Apps documentation
2. [ ] Review exported chat data
3. [ ] Check the summary file for a quick overview

---

## 🎯 Marketplace Tasks

## 🔗 Navigation & Product Page Issues

### Product Page Route Not Working (In Progress)
**Issue:** Getting root route JSON response instead of product page  
**Error:** Request to `/product-page-v2.html?product=...` returns `{"status":"API is running"...}`  
**Status:** ⚠️ Route handler added but not matching requests

**📄 Complete Documentation:** 
- `PRODUCT_PAGE_NAVIGATION_COMPLETE_DOC.md` - Full navigation changes documentation
- `PRODUCT_PAGE_ROUTE_DEBUG.md` - **DEBUGGING GUIDE** (read this for current issue)
- `MARKETPLACE_BUTTON_FIX.md` - Category page button fixes

**Quick Summary:**
- ✅ Navigation changed from new tab to same page (audit widget)
- ✅ Back button added to product pages
- ✅ Fallback URL generation for products without shop links
- ✅ Category page buttons fixed (View Details, Add to Cart)
- ✅ Route handler added to server with logging
- ❌ Route not matching - requests hitting root route instead

**What We've Done:**
- Added route handler for `product-page-v2.html` (line 11 in server-new.js)
- Added extensive logging to debug route matching
- Updated static middleware to skip product-page-v2.html
- Fixed category page `viewProduct()` function
- Changed to use `res.sendFile()` with root option

**Current Problem:**
- Requests to `/product-page-v2.html?product=...` are hitting root route (`/`)
- Route handler logs not appearing in server console
- Need to verify: URL generation, route matching, server restart

**Next Steps:**
- [ ] **Check browser console** - What URL is logged when clicking "View Details"?
- [ ] **Check server console** - Do route handler logs appear?
- [ ] **Check network tab** - What's the actual request URL and response?
- [ ] **Test direct URL** - `http://localhost:4000/product-page-v2.html?product=sample_3`
- [ ] **Verify server restarted** - Are new logs appearing?
- [ ] **Check route order** - Ensure route is before static middleware and root route

**Related Files:**
- `PRODUCT_PAGE_NAVIGATION_COMPLETE_DOC.md` - Complete documentation
- `PRODUCT_PAGE_ROUTE_DEBUG.md` - **Current debugging guide**
- `MARKETPLACE_BUTTON_FIX.md` - Category page button fixes
- `TROUBLESHOOTING_PRODUCT_PAGE.md` - General troubleshooting
- `NAVIGATION_CHANGES_SUMMARY.md` - Summary of navigation changes

## 🎯 Marketplace Tasks (Original)

1. [ ] Check existing products and any referral/affiliate configuration
2. [ ] Review marketplace settings
3. [ ] Verify affiliate links are working

---

## 💾 Energy Audit Save/Load Functionality (2025-01-10)

### Phase 1: MVP Implementation
1. [ ] Design database schema for saved audits (embedded in Member document)
2. [ ] Add `energyAudits` array to Member schema (MongoDB)
3. [ ] Create save audit function (capture current state)
4. [ ] Create load audit function (restore saved state)
5. [ ] Add "Save Audit" button to UI
6. [ ] Add "My Audits" button/modal to UI
7. [ ] Create audit list view (name, space, savings, date)
8. [ ] Implement audit deletion
9. [ ] Add data validation before save
10. [ ] Store product snapshots (not just IDs) for data integrity

### Phase 2: Enhanced Features
11. [ ] Add audit naming/description
12. [ ] Implement auto-save drafts
13. [ ] Add audit versioning system
14. [ ] Create migration function for schema changes
15. [ ] Add audit archiving (old audits >1 year)
16. [ ] Implement pagination for audit list
17. [ ] Add search/filter for saved audits
18. [ ] Add audit sharing (optional, future)

### Phase 3: Export Functionality
19. [ ] Design PDF report template
20. [ ] Implement PDF export (audit summary + products)
21. [ ] Implement Excel export (multiple sheets)
22. [ ] Implement JSON export (full data)
23. [ ] Add export options modal
24. [ ] Test all export formats

### Technical Considerations
25. [ ] Implement lazy loading for audit data
26. [ ] Add caching strategy (localStorage for recent audits)
27. [ ] Add error handling for save/load operations
28. [ ] Add user feedback (success/error messages)
29. [ ] Implement rate limiting (saves per day)
30. [ ] Add data compression for large audits
31. [ ] Create backup strategy for audit data
32. [ ] Add analytics tracking (save/load usage)

### Testing & Quality
33. [ ] Test save with all product types
34. [ ] Test load with missing products (fallback)
35. [ ] Test with custom user-added products
36. [ ] Test with large audits (20+ products)
37. [ ] Test version migration
38. [ ] Test export formats
39. [ ] Performance testing (load time)
40. [ ] Security testing (user isolation)

### Documentation
41. [ ] Document save/load API endpoints
42. [ ] Create user guide for save/load feature
43. [ ] Document data structure
44. [ ] Document migration process

**Storage Estimate:** ~2.6 KB per audit, ~26 KB per user (10 audits)
**Scalability:** Works for 100K+ users with proper indexing

---

## 🛒 Product Page Features - Configuration Required (2025-01-10)

### Additional Services Section
**Status:** ⏸️ Hidden until services are configured  
**Location:** `product-page-v2-marketplace-test.html` (lines 2391-2430, currently commented out)

**Tasks:**
- [ ] Set up service provider partnerships (installation, warranty)
- [ ] Configure service pricing structure
- [ ] Create `services-config.json` with service definitions
- [ ] Integrate service pricing into cart calculation
- [ ] Test service selection and checkout flow
- [ ] Uncomment and activate Additional Services section

**Current Services (hidden):**
- Professional Installation (+€150)
- Extended Warranty (+€99)

### Financing Options Section
**Status:** ⏸️ Hidden until financing is configured  
**Location:** `product-page-v2-marketplace-test.html` (lines 2432-2458, currently commented out)

**Tasks:**
- [ ] Partner with financing provider
- [ ] Configure financing terms (APR, credit requirements)
- [ ] Create `financing-config.json` with financing options
- [ ] Integrate financing calculations (monthly payments, interest)
- [ ] Add credit approval workflow
- [ ] Test financing selection and application process
- [ ] Uncomment and activate Financing Options section

**Current Options (hidden):**
- 24 months financing
- 36 months financing
- 48 months financing
- 0% APR for qualified buyers

**Related Files:**
- `MARKETPLACE_DEVELOPMENT_ROADMAP.md` - See Step 3.2 and 3.3 for detailed implementation plan

---

## 📝 Notes

- Some todos may have been completed already
- Check the detailed chat export (`cursor-chat-recovery/chat-export-*.json`) for more context on each task
- Todos are organized by category for easier reference
- Mark todos as complete by changing `[ ]` to `[x]`

---

**Related Files:**
- `CHAT_TODOS_LIST.md` - Detailed list with sources
- `CHAT_TODOS_CHECKLIST.md` - Simple checklist format
- `WORK_TODOS.md` - This file (curated actionable todos)
