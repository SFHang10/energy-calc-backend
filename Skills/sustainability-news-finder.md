# 📰 Sustainability News Finder

**Skill Type:** Sustainability News Research & Report Generation  
**Output:** Monthly/weekly HTML news reports + sources list  
**Workflow:** Draft → review → ready → publish (Content Ops)

---

## 🎯 Purpose

Generate professional sustainability news roundups covering EU policy updates, funding opportunities, circular economy developments, sustainable technology, and organization highlights. Output is prepared for review before publishing.

---

## 🗂️ Output Location (MANDATORY)

Save all generated content here:
```
content-ops/drafts/sustainability-news/
```

**File naming:**
- `YYYY-MM-sustainability-news.html`
- `YYYY-MM-sustainability-news-sources.md`

Do **not** publish directly. The content must move through `content-ops/review/` and `content-ops/ready/` before updating the catalog.

---

## ✅ When To Use

Use this skill when the user asks for:
- Sustainability news roundups
- Monthly or quarterly sustainability updates
- Circular economy or EU policy news reports
- Funding and innovation updates
- Organization spotlights or sector briefings

---

## 🔍 Research Sources (Authoritative First)

Prioritize official sources and verified publications:
- European Commission, CORDIS, CINEA, EUR-Lex
- Funding & Tenders Portal
- National government agencies (Netherlands, UK, Spain, Portugal, Germany)
- Eurostat and EEA for data
- Recognized industry and research publications

Use the references list in `Skills/Sustainability News USAGE_GUIDE.md` for full URLs and verification checklists.

---

## 🧭 Research Process

1. **Scan Official Updates**
   - EU policy/regulation changes
   - Funding programs and calls
   - Official press releases
2. **Collect Industry News**
   - Circular economy initiatives
   - Sustainable tech launches
   - Company achievements
3. **Verify Facts**
   - Dates, numbers, funding amounts
   - Cross-check with official sources
4. **Extract Key Metrics**
   - Funding totals
   - Deadlines and timelines
   - Impact statistics

---

## 🧱 Report Structure (HTML)

Use the template at:
```
content-ops/drafts/sustainability-news/TEMPLATE_Sustainability_News.html
```

Keep the **sidebar menu navigation** and overall layout. Only replace the content blocks.

Sections to keep:
1. **Header**
   - Title, date, executive summary
2. **Top Stories (3–5)**
3. **Policy & Regulation**
4. **Funding Opportunities**
5. **Circular Economy Developments**
6. **Country Highlights**
7. **Technology & Innovation**
8. **Organization Spotlight**
9. **Looking Ahead**

Use sustainability-themed styling (greens/blues), and maintain accessibility (contrast, headings, alt text).

---

## 🧾 Sources File Format

Create a companion file: `YYYY-MM-sustainability-news-sources.md`

Include:
- Article title
- Source name
- Publication date
- Link
- One-line relevance note

---

## ✅ Review Checklist (Before Move to Review)

- [ ] Facts verified with official sources
- [ ] All links included in sources file
- [ ] HTML renders correctly in browser
- [ ] Images are Wix-ready URLs or marked for upload
- [ ] Summary is clear and actionable

---

## 📦 Handoff to Content Operations

After drafting:
1. Move files to `content-ops/review/sustainability-news/`
2. Apply the review checklist from `Skills/content-operations.md`
3. After approval, move to `content-ops/ready/sustainability-news/`
4. Only then add to `wix-integration/member-content/content-catalog.json`

---

## 🧩 Recommended Catalog Entry (After Approval)

```json
{
  "id": "sustainability-news-YYYY-MM",
  "type": "blog",
  "title": "Sustainability News Roundup — YYYY-MM",
  "category": "Sustainability News",
  "tags": ["sustainability", "policy", "circular economy", "funding"],
  "url": "https://...",
  "imageUrl": "https://static.wixstatic.com/media/...",
  "status": "published",
  "lastReviewedAt": "YYYY-MM-DD",
  "source": "manual"
}
```

---

## ✅ Success Criteria

- News report saved in drafts folder
- Sources list included and verified
- Ready for review → publish pipeline
- Clear, professional HTML output

---

**Last Updated:** January 2026
