# 📰 Sustainability News Finder

**Skill Type:** Sustainability News Research & Report Generation  
**Output:** Monthly/weekly HTML news reports + sources list  
**Workflow:** Draft → review → ready → publish (Content Ops)

---

## 🎯 Purpose

Generate professional sustainability news roundups covering EU policy updates, funding opportunities, circular economy developments, sustainable technology, and organization highlights. Output is prepared for review before publishing.

**Consumer chat:** monthly editions and policy news surface on **Media Agent** (`/greenways/media-agent`), which cross-links **sustainability map** case studies from `data/companies.json` when assessing energy techniques and savings benchmarks. See **`greenways-chat-interface-skill.md`**.

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
- European Investment Bank (EIB) — climate finance, projects, and policy updates: https://www.eib.org/en/index
- EIB newsletter and announcements (investment updates): https://t.eib.org/nl3/onbIEztJwoxMWNYAr74SOA?m=AV8AAIsPlFoAAcp0O8IAAM2ZvcMAASKD_84AJIO2AAgi3ABpb0gCBMim2UE-SguQCR55Lb5BPQAHvRc&b=9f2c5072&e=2f720d74&x=fmoyytDNVLwlSEzjucxMbD4HB0maogYKAKS54LfgSvU
- Recognized industry and research publications

Use the references list in `Skills/Sustainability News USAGE_GUIDE.md` for full URLs and verification checklists.

---

## ⏱️ Recency Window (Last 30 Days)

Default scope is **last 30 days** unless the user explicitly asks for a wider
timeframe (quarterly or annual). This keeps reports timely while still using
official sources.

**Use this filter in research:**
- Prefer updates, calls, or announcements published in the last 30 days
- If no official updates exist, use the most recent authoritative item and
  mark it as "latest available"

**Trigger phrase examples:**
- "last 30 days only"
- "monthly update"
- "recent policy changes"

---

## 📚 Supporting Reference Files (Use for Inputs)

These are supporting, non-skill docs to improve sourcing and structure:
- `Skills/Email Templates for Sustainability News Organisati.md` (outreach templates for access/newsletters)
- `Skills/Could yet up one of these_.md` (EEB setup workflow and sources)
- `Skills/Could you provide me a list of 20 organisations in.md` (org/source list + links)
- `Skills/Top funded circular economy topics in Horizon Euro.md` (funding themes + topics)
- `Skills/Key EU sustainability laws adopted in 2025 and tim.md` (policy timeline reference)
- `Skills/How will the Carbon Border Adjustment Mechanism im.md` (CBAM impacts)
- `Skills/Major EU funding programs for circular economy pro.md` (funding programs overview)
- `Skills/Could you provide a detailed News report of the cu.md` (regional coverage outline)

Use these for topic ideas, source discovery, and verification. Do not copy text verbatim.

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
Add a **hero photo strip** under the header using **1 image from each folder set (A/B/C)** in:
```
content-ops/drafts/sustainability-news/hero-photo-pool.json
```
Rotate monthly so every summary has a different mix, but always keep
one image per folder set.

**Anchor behavior (Wix embeds):**
- Add `scroll-padding-top: 20px` to the `html` rule.
- Add `scroll-margin-top: 20px` to `.section`.
- Do **not** add custom sidebar scroll scripts; rely on native anchor behavior.

**External links in Wix embeds (MANDATORY):**
- Many official sites (for example EEA/EIB pages) block iframe embedding via CSP `frame-ancestors`.
- Ensure all external links open outside the embed:
  - add `target="_blank"` and `rel="noopener noreferrer"` to external `http/https` links.
- Recommended script snippet before `</body>`:
```html
<script>
  (function () {
    const isExternal = (href) => /^https?:\/\//i.test(href || '');
    document.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (!isExternal(href)) return;
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
  })();
</script>
```

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

### Country Highlights – Region Illustration Set (Standard)
When adding country highlight cards or blocks for UK, Netherlands, Spain, and Portugal,
reuse the standard illustration images for consistency across monthly reports:

- Netherlands: https://static.wixstatic.com/media/c123de_cc1b13a403af4c628862cfe90b38ef36~mv2.jpg
- United Kingdom: https://static.wixstatic.com/media/c123de_cb6e8abcf2854234b64b2924634b7027~mv2.jpeg
- Spain: https://static.wixstatic.com/media/c123de_f9897452c9e340b68c0ea6c407e1ad5d~mv2.jpeg
- Portugal: https://static.wixstatic.com/media/c123de_6562e0f95d3a4b9fbbe043e7caba39d6~mv2.jpeg

If new regions are added, require Wix static URLs and extend the set.

---

## 🔗 Product & Example Link Rules (MANDATORY)

When a story mentions a product, you must link to the **specific** marketplace product:

- **Source of truth:** `energy-calculator/products-with-grants-and-collection.json`
- **Fallback:** `energy-calculator/products-with-grants.json`
- **Product ID format:** `etl_[category]_[number]` (verify product exists before linking)
- **Marketplace link format (Render):**
  - `https://energy-calc-backend.onrender.com/product-page-v2-marketplace.html?product=[ID]&fromPopup=true`

**View Example button:**
- Always link to a concrete example (product, guide, or grant page).
- Prefer a product example when the story implies savings or equipment changes.
- If no product fits, link to a verified policy/grant explainer.

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

## 📚 Knowledge Base (Cumulative)

Maintain a rolling knowledge base so each month builds on previous updates.

**File:**
```
data/news-category-knowledge.json
```

**How to update each month:**
1. Add new entries under the relevant category (`policy`, `funding`, `circular`, `countries`).
2. Include `similarTo` references to prior entries when a new scheme resembles an older one.
3. Capture key differences and practical impact notes.

**Entry format:**
```
{
  "id": "policy-2026-02-circular-economy-act",
  "title": "Circular Economy Act (2026)",
  "summary": "Proposed Act to strengthen the single market for circular products.",
  "impact": ["More consistent circular requirements across EU markets"],
  "similarTo": ["policy-2025-12-circular-measures-package"],
  "differences": ["Moves from pilots to single‑market framework"],
  "sources": ["https://environment.ec.europa.eu/strategy/circular-economy_en"]
}
```

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
