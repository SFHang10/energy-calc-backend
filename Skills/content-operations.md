# 📦 Content Operations Workflow

**Skill Type:** Content Pipeline & Publishing  
**Purpose:** Standardize how content moves from draft to published  
**Location:** `C:\Users\steph\Documents\energy-cal-backend\Skills\`

---

## 🎯 Goal

Create a smooth, repeatable process for blogs, videos, reports, HTML pages,
product news, and supporting images so everything is organized and production-ready.

---

## 🗂️ Source of Truth (Folders)

All content is organized under:
```
content-ops/
├── drafts/       # raw notes, first drafts, research
├── review/       # fact check, formatting, image checks
├── ready/        # approved, publish-ready content
├── assets/       # local images, diagrams, source files
└── manifests/    # Wix media URL mapping + publish tracking
```

## 📌 Active Drafts (Index)

- `content-ops/drafts/html/HVACA Comparison.html` — HVAC comparisons page (draft)
- `HTMLS GWM GWB/Restuarant Appliance Comparison.html` — restaurant equipment comparisons (draft)
- `HTMLS GWM GWB/European Company - Case Study Finder .html` — company case study finder (draft)

---

## ✅ Publish Flow (MANDATORY)

1. **Draft**
   - Place raw content in `content-ops/drafts/`.
2. **Review**
   - Move to `content-ops/review/`.
   - Apply the checklist below.
3. **Ready**
   - Move to `content-ops/ready/`.
4. **Publish**
   - Add/update `wix-integration/member-content/content-catalog.json`.
   - Upload images to Wix and update `content-ops/manifests/wix-media-manifest.json`.
   - Push to GitHub (Render auto-deploys).

---

## ✅ Pre-Publish Check

Run the checklist script before publishing:
```
node scripts/publish-checklist.js
```

---

## ✅ Review Checklist

- Accuracy verified (facts, links, dates)
- Images have Wix static URLs
- Tags and category match site taxonomy
- Content previewed in Wix or on Render
- Content catalog entry updated
- External links open in new tab (`target="_blank"`, `rel="noopener noreferrer"`) to avoid iframe CSP blocks on official sites

---

## 📌 Content Catalog Metadata (Recommended)

For every catalog item, add:
```
status: "draft" | "review" | "published"
lastReviewedAt: "YYYY-MM-DD"
source: "wix" | "manual" | "import"
```

---

## 🔧 Trigger Phrases

Activate this skill when the user says:
```
"content workflow"
"publish content"
"content pipeline"
"draft review publish"
"content operations"
"prepare content"
"content staging"
```

---

## ✅ Success Criteria

- Content is easy to find and trace
- Images always have Wix static URLs
- Catalog entries are consistent and tagged
- Publish process is repeatable and fast

---

**Last Updated:** January 2026
