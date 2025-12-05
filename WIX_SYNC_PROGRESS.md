# Wix Product Sync - Progress & TODO

**Last Updated:** December 5, 2025
**Status:** Phase 2A & 2B Complete, Remaining Products Listed

---

## Summary

Syncing images and videos from **Wix Store** (greenwaysmarket.com) to the **local ETL database** (FULL-DATABASE-5554.json) so that the HTML product pages show rich media.

---

## What Was Done (December 5, 2025)

### 1. API Bug Fixes ✅

**Problem:** Images/videos weren't displaying on product pages.

**Fixes Applied:**
- Fixed `routes/product-widget.js` to handle both array and JSON string formats
- Fixed filter that was blocking relative paths (only allowing http URLs)
- Now accepts: full URLs, relative paths, and properly filters corrupted data

**Commits:**
- `40537b0` - Handle images/videos as both array and JSON string
- `e142423` - Allow relative paths for images

---

### 2. Product Page Updates ✅

**File:** `product-page-v2-marketplace.html` (renamed from `-test`)

**Changes:**
- Image sizing: Changed `object-fit: cover` to `contain` (shows full image)
- Thumbnail sizing: Same change for consistency
- Removed zoom-on-hover effect

**Commits:**
- `ac56590` - Rename product-page-v2-marketplace-test.html
- `06f1363` - Fix image sizing with object-fit contain

---

### 3. Gallery Implementation ✅

**File:** `wix-integration/member-product-deep-dive.html`

Added simple image gallery:
- Thumbnail row below main image
- Click thumbnail to change main image  
- Video buttons for products with videos
- Pure CSS + vanilla JS (no external libraries)

**Commit:** `d1484c4`

---

### 4. Category Fix ✅

**Product:** JOKER (both variants)

**Change:** Moved from "Professional Foodservice Equipment" → "Commercial Ovens"

**Commit:** `7773196`

---

### 5. Wix Media Sync ✅

**Phase 2A - High Confidence (6 products):**

| Product | ETL ID | Images | Videos |
|---------|--------|--------|--------|
| JOKER | etl_22_86431 | 5 | 2 |
| Air Fury High Speed Hand Dryer | etl_9_75495 | 3→10 | 1→3 |
| Turbo Force Branded Polished Fast Dry | etl_9_69850 | 4→8 | 0 |
| Turbo Force Branded White Fast Dry | etl_9_69848 | 4 | 0 |
| Electrolux Professional Skyline 10 GN1/1 | etl_22_86257 | 2 | 0 |
| Baxi Auriga HP 26T | etl_7_86302 | 1 | 1 |

**Phase 2B - Medium Confidence (2 new products + updates):**

| Product | ETL ID | Images | Videos |
|---------|--------|--------|--------|
| Zanussi Magistar 10 GN1/1 Electric 2-glass | etl_22_86278 | 4 | 1 |
| Invoq | etl_22_86201 | 12 | 2 |

**Final Commit:** `315e342`

---

## Current Status

| Metric | Count |
|--------|-------|
| ETL Database Products | 5,556 |
| Wix Store Products | 151 |
| Successfully Synced | 8 |
| Remaining (No ETL Match) | ~143 |

---

## TODO: Remaining Wix Products to Sync

These Wix products need manual matching or don't have ETL equivalents:

### Heat Pumps & HVAC (Need Manual Match)
- [ ] Daikin VAM-J VAM800J Heat Recovery Ventilation Unit
- [ ] Daikin VAM-J VAM650J Heat Recovery Ventilation Unit
- [ ] Daikin VAM-J VAM500J Heat Recovery Ventilation Unit
- [ ] Daikin VAM-J VAM350J Heat Recovery Ventilation Unit
- [ ] Daikin VAM-J VAM250J Heat Recovery Ventilation Unit
- [ ] Daikin VAM-J VAM150J Heat Recovery Ventilation Unit
- [ ] (Check Wix for full list of Daikin products)

### Baxi Products (Partial Match)
- [ ] Baxi Solarflo (In-Roof) - May match etl_15_46852
- [ ] Other Baxi products in Wix store

### Commercial Kitchen Equipment
- [ ] Magistar 218733 Combi TS (Low confidence match)
- [ ] Additional oven variants
- [ ] Dishwasher products

### Hand Dryers (Check for more variants)
- [ ] Any remaining hand dryer colors/models

### To Get Full List:
Run this to see all Wix products:
```javascript
// Use Wix MCP to query all products
// CallWixSiteAPI with siteId: cfa82ec2-a075-4152-9799-6a1dd5c01ef4
// POST to: https://www.wixapis.com/stores/v1/products/query
// Body: {"query":{"paging":{"limit":100}}}
```

---

## How to Continue Syncing

### Option 1: Manual Matching
For each Wix product, find the matching ETL product by:
1. Search ETL database by brand/name
2. Match by specifications (power, category)
3. Add Wix images/videos to the ETL product

### Option 2: Create New ETL Entries
If Wix product doesn't exist in ETL:
1. Create new product entry in database
2. Copy all Wix media URLs
3. Add calculator data if available

### Sync Script Template:
```javascript
// Add to FULL-DATABASE-5554.json
const product = db.products.find(p => p.id === 'etl_xxx');
product.images = product.images || [];
product.videos = product.videos || [];
product.images.push('https://static.wixstatic.com/...');
product.videos.push('https://video.wixstatic.com/...');
product.wixSynced = true;
```

---

## Backup Files

- `FULL-DATABASE-5554_backup_before_sync.json` - Before Phase 2A
- Use `git log` to see all changes

---

## Scripts Created

| File | Purpose |
|------|---------|
| `improved-sync-analysis.js` | Analyzes and matches Wix → ETL products |
| `execute-sync.js` | Phase 2A sync execution |
| `execute-full-phase2b-sync.js` | Phase 2B sync execution |
| `sync-plan.json` | Saved matching results |

---

## Rollback Instructions

If needed, restore from backup:
```powershell
copy FULL-DATABASE-5554_backup_before_sync.json FULL-DATABASE-5554.json
git add FULL-DATABASE-5554.json
git commit -m "Rollback: Restore database before Wix sync"
git push origin main
```

---

## Key Learnings

1. **Images array format:** Store as actual arrays, not JSON strings
2. **Relative paths:** API must handle both `/product-placement/x.jpg` and full URLs
3. **Object-fit:** Use `contain` not `cover` for product images
4. **Multiple variants:** Many Wix products map to one ETL product (consolidate images)
5. **Test thoroughly:** Gallery code caused crashes before - keep changes small

---

## Contact / Resume

If chat history is lost, this document contains all context needed to continue work.

**Wix Site:** Greenways Market (cfa82ec2-a075-4152-9799-6a1dd5c01ef4)
**Backend:** https://energy-calc-backend.onrender.com
