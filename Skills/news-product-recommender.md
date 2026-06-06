# 🧠 News → Product Recommender Skill

## Purpose
Automatically suggest **relevant marketplace products** for each news item,
based on the knowledge base and enriched product data. This keeps "View example"
links accurate, consistent, and helpful without manual guessing.

## Core Idea
Use a **circular flow of information**:
1) News summary → 2) Knowledge base mapping → 3) Product suggestions →
4) Example links in the newsletter → 5) Feedback improves future mapping.

## Inputs (Sources of Truth)
- News items (HTML or structured summaries)
  - `content-ops/drafts/sustainability-news/*.html`
- Knowledge base (cumulative):
  - `data/news-category-knowledge.json`
- Impact mapping (policy → action):
  - `data/personalized-impact-map.json`
- Enriched products (with grants/collection):
  - `energy-calculator/products-with-grants-and-collection.json`
  - fallback: `energy-calculator/products-with-grants.json`

## Output
- `data/news-product-recommendations.json`

**Output shape (minimal):**
```json
{
  "generatedAt": "ISO_DATE",
  "items": [
    {
      "newsId": "policy-2026-02-circular-economy-act",
      "headline": "Circular Economy Act (Q3 2026)",
      "recommendations": [
        {
          "productId": "etl_11_80637",
          "productName": "VLT DriveMotor Drive",
          "reason": "Energy-efficient drives align with circular sourcing and efficiency upgrades.",
          "url": "https://energy-calc-backend.onrender.com/product-page-v2-marketplace.html?product=etl_11_80637&fromPopup=true"
        }
      ],
      "moreLink": "https://environment.ec.europa.eu/strategy/circular-economy_en"
    }
  ]
}
```

## Mapping Rules (How to Recommend)
1. **Match by category/topic** using `news-category-knowledge.json`
2. **Refine by impact/action** using `personalized-impact-map.json`
3. **Select products** that are:
   - ETL-listed and available in enriched data
   - Relevant to the action (upgrade, retrofit, efficiency, compliance)
4. **Always link to the specific product page** (Render URL).

## Safety Rules
- No live API calls.
- Use only enriched product datasets.
- Never link to marketplace homepage.
- If no good match, link to a **verified policy/grant source** instead.

## Suggested Workflow
1. Parse monthly news items (headline + tags).
2. Use knowledge base to find similar items and differences.
3. Map each item to **1–3 product recommendations**.
4. Write to `data/news-product-recommendations.json`.
5. Newsletter HTML pulls from this file for "View example".

## CLI Helper (Quick Suggestions)
Use this to quickly review a headline and get 1–3 product suggestions:
```
node suggest-news-products.js "Circular Economy Act timeline confirmed" --limit=3
```

## Trigger Phrases
Use this skill when the user says:
- "auto link products from news"
- "news to product matching"
- "recommend products from news"
- "automate example product links"
- "suggest products for policy updates"

## Success Criteria
- Example links are always specific and valid
- Suggestions map to real products we stock
- Knowledge base improves each month (clear similar/different notes)
