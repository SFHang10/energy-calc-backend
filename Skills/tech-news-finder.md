# 🧪 New in Tech News Finder

**Skill Type:** Tech News Research & Report Generation  
**Output:** Monthly/weekly HTML news reports + sources list  
**Workflow:** Draft → review → ready → publish (Content Ops)

---

## 🎯 Purpose

Generate a **New in Tech** newsletter using the **same format** as the sustainability
news page, with emphasis on:
- **Green/clean tech** and technology that enables sustainability
- **General tech news** relevant to businesses and consumers
- Coverage across **Europe, UK, US, and global**

---

## 🗂️ Output Location (MANDATORY)

Save all generated content here:
```
content-ops/drafts/sustainability-news/
```

**File naming:**
- `YYYY-MM-new-in-tech.html`
- `YYYY-MM-new-in-tech-sources.md`

Do **not** publish directly. The content must move through `content-ops/review/`
and `content-ops/ready/` before updating the catalog.

---

## ✅ When To Use

Use this skill when the user asks for:
- Tech news roundups
- "New in Tech" page for the newsletter
- Green tech / clean tech updates
- General technology news with business impact

---

## 🔍 Research Sources (Authoritative First)

Prioritize official sources and verified publications:

**EU & UK (policy + funding)**
- European Commission, EUR‑Lex, CORDIS, CINEA
- Funding & Tenders Portal
- European Investment Bank (EIB): https://www.eib.org/en/index
- Eurostat, EEA (data + indicators)
- UK DESNZ, Innovate UK, UKRI

**US (tech + energy + innovation)**
- U.S. DOE, ARPA‑E, NREL
- U.S. EPA, NSF

**Global + Research**
- IEA (tech outlooks), OECD
- IEEE, standards bodies (when relevant)
- Major peer‑reviewed research hubs (if cited)

Use credible tech outlets only to **supplement** official sources (not replace them).

---

## ⏱️ Recency Window (Last 30 Days)

Default scope is **last 30 days** unless the user explicitly asks for a wider
timeframe. This keeps reports timely while still using official sources.

**Use this filter in research:**
- Prefer updates, calls, or announcements published in the last 30 days
- If no official updates exist, use the most recent authoritative item and
  mark it as "latest available"

---

## 🧱 Report Structure (HTML)

Use the same template and layout as sustainability news:
```
content-ops/drafts/sustainability-news/TEMPLATE_Sustainability_News.html
```

Keep the **sidebar menu navigation** and overall layout. Only replace the content blocks.
Add a **hero photo strip** under the header using **1 image from each folder set (A/B/C)** in:
```
content-ops/drafts/sustainability-news/hero-photo-pool.json
```

**Sections to keep (same format):**
1. **Header**
2. **Top Stories**
3. **Policy & Regulation**
4. **Funding Opportunities**
5. **Circular Economy / Sustainable Tech** (green tech angle)
6. **Country Highlights**
7. **Technology & Innovation** (general tech)
8. **Organization Spotlight**
9. **Looking Ahead**

Use the same section structure and anchors so the page stays consistent.

**Anchor behavior (Wix embeds):**
- Add `scroll-padding-top: 20px` to the `html` rule.
- Add `scroll-margin-top: 20px` to `.section`.
- Do **not** add custom sidebar scroll scripts; rely on native anchor behavior.

**External links in Wix embeds (MANDATORY):**
- Some sources block iframe embedding via CSP `frame-ancestors`, so links can fail inside Wix if opened in-frame.
- Set all external links to open in a new tab:
  - `target="_blank"`
  - `rel="noopener noreferrer"`
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

---

## 🔗 Product & Example Link Rules (When Relevant)

If a tech story references equipment or savings, link to a **specific** marketplace product:

- **Source of truth:** `energy-calculator/products-with-grants-and-collection.json`
- **Product ID format:** `etl_[category]_[number]`
- **Marketplace link format (Render):**
  - `https://energy-calc-backend.onrender.com/product-page-v2-marketplace.html?product=[ID]&fromPopup=true`

If no product fits, link to a verified explainer (policy or research source).

---

## 🧾 Sources File Format

Create a companion file: `YYYY-MM-new-in-tech-sources.md`

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
data/tech-news-category-knowledge.json
```

**How to update each month:**
1. Add new entries under the relevant category (`greenTech`, `generalTech`, `policy`, `funding`, `countries`).
2. Include `similarTo` references to prior entries when new items resemble older ones.
3. Capture key differences and practical impact notes.

