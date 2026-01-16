# 👥 Member Manager Skill

**Skill Type:** Membership Profile & Access Management  
**Purpose:** Manage member profiles, uploads, and member experience  
**Location:** `C:\Users\steph\Documents\energy-cal-backend\Skills\`

---

## 🎯 Goal

Provide a professional, Greenways-branded membership system without exposing Wix branding:

- ✅ Profile page and editable user details
- ✅ Profile photo + cover image upload
- ✅ Secure member data updates
- ✅ Consistent styling across membership pages

---

## ✅ Core Features

### 1) Profile Page
- **File:** `wix-integration/member-profile.html`
- Shows profile header, avatar, cover image, and bio
- Allows users to edit details and save

### 2) Profile API Endpoints
- `GET /api/members/profile` → fetch profile info
- `PUT /api/members/profile` → update profile fields
- `POST /api/members/profile/upload?type=avatar|cover` → upload images

### 3) Data Fields Stored
```
display_name
first_name
last_name
company
phone
job_title
bio
location
profile_photo_url
cover_photo_url
```

### 4) Content Catalog System
- **Catalog File:** `wix-integration/member-content/content-catalog.json`
- **Admin UI:** `wix-integration/content-catalog-admin.html`
- **Endpoints:**
  - `GET /api/members/content-catalog`
  - `POST /api/members/content-catalog`
  - `PUT /api/members/content-catalog/:id`
  - `DELETE /api/members/content-catalog/:id`
  - `POST /api/members/content-catalog/sync` (Wix blog + video sync)
  - `POST /api/members/content-catalog/reorder` (drag-drop ordering)
- `POST /api/members/content-catalog/import` (CSV/JSON bulk import)
  - `GET /api/members/recommendations?type=blog|video|html|report`

---

## 🔄 Workflow (MANDATORY)

1. **User logs in** → token stored locally  
2. **Profile loads** from `/api/members/profile`  
3. **User uploads images** (avatar/cover)  
4. **User edits info** and saves  
5. **Backend updates** database fields  

### Content Catalog Workflow
1. **Add new content** to `content-catalog.json` (or via admin UI)  
2. **Include tags + category** for interest matching  
3. **Sync Wix content** via admin UI or scheduled auto-sync  
4. **Recommendations** pull from catalog by interest  

---

## ⚠️ Production Notes

- **Uploads are stored in Wix Media Manager** when Wix credentials are configured  
- Optional local fallback (`/uploads/members`) when `ALLOW_LOCAL_PROFILE_UPLOADS=true`  
- SQLite on Render is **ephemeral** → long-term use MongoDB or external DB  
- Auto-sync schedule uses `CONTENT_CATALOG_SYNC_CRON` (default: every 6 hours)

---

## ✅ Trigger Phrases

Activate this skill when the user says:

```
"member manager"
"profile page"
"member profile"
"user uploads"
"profile image"
"cover photo"
"member dashboard"
```

---

## ✅ Success Criteria

- Profile page loads with current user data  
- Users can upload avatar + cover photo  
- Profile data saves successfully  
- Greenways branding stays consistent  

---

## 🧠 Lessons Learned

### Issue: MongoDB members router lacked Wix video integration

**Date:** January 2026  
**Problem:** Member videos in `members-section.html` returned fallback samples when MongoDB was enabled.  
**Root Cause:** Wix media integration existed only in `routes/members.js` (SQLite).  
**Solution:** Port Wix video fetch + filtering logic to `routes/members-mongodb.js`.  
**Prevention/Future Use:** Keep feature parity between SQLite and Mongo routers.

### Issue: Preferences format mismatch between SQLite and Mongo

**Date:** January 2026  
**Problem:** Preferences UI expected `interest.id`, but Mongo stored `interests` as string names.  
**Root Cause:** Mongo `Member` schema uses `interests: [String]`.  
**Solution:** Map interest names ⇄ IDs in `member-preferences.html` and normalize Mongo endpoints.  
**Prevention/Future Use:** Always return interest objects `{ id, name }` from API.

### Issue: Saved content should persist beyond local storage

**Date:** January 2026  
**Problem:** Saved videos/blogs/products only lived in `localStorage`.  
**Root Cause:** No backend storage for saved items.  
**Solution:** Add saved item collections to Mongo model and SQLite columns, plus `/api/members/saved-items` endpoints.  
**Prevention/Future Use:** Always persist saved content to DB and use local storage only as cache.

### Issue: No centralized content pipeline for recommendations

**Date:** January 2026  
**Problem:** Blogs/videos/HTML resources had no unified catalog for recommendations.  
**Root Cause:** Content lived in separate places (Wix videos, static blogs, HTML files).  
**Solution:** Create `content-catalog.json` + `/api/members/content-catalog` and `/api/members/recommendations`.  
**Prevention/Future Use:** All new content must be added to the catalog with type/category/tags.

### Issue: Admin management needed for catalog updates

**Date:** January 2026  
**Problem:** No UI to manage catalog entries.  
**Root Cause:** Catalog edits required manual JSON updates.  
**Solution:** Added `content-catalog-admin.html` with sync + CRUD actions.  
**Prevention/Future Use:** Use admin UI for catalog changes, keep JSON as source of truth.

### Issue: Bulk catalog updates were slow without import

**Date:** January 2026  
**Problem:** Large content batches needed manual entry.  
**Root Cause:** No CSV/JSON bulk import in admin UI.  
**Solution:** Added `/api/members/content-catalog/import` with CSV/JSON support.  
**Prevention/Future Use:** Use bulk import for catalog seeding and scheduled updates.
