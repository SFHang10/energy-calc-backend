# Hover Data Aggregator Skill

**Layer:** Infrastructure (not a consumer chat agent). Pairs with **`personalized-impact-hover.md`** (*why it matters*) and future **admin hover explainer** agent. Taxonomy: **`greenways-chat-interface-skill.md`** § Admin vs consumer skills.

## Purpose
Generate a **small, safe hover cache** that links products to:
- Marketplace product URL
- A short grants/schemes preview (1-3 items)
- A short deals/offers preview (0-2 items)

This avoids live API calls on hover and prevents regressions.

## Inputs
- Enriched products JSON (preferred):
  - `energy-calculator/products-with-grants-and-collection.json`
  - fallback: `energy-calculator/products-with-grants.json`
- Deals cache (optional weekly refresh):
  - `data/deals-cache.json`

## Output
- `data/hover-data.json`

## Output Shape (Minimal)
```
{
  "metadata": {
    "generatedAt": "ISO_DATE",
    "totalProducts": 0,
    "maxGrantsPerProduct": 2,
    "maxDealsPerProduct": 2,
    "grantsSource": "products-with-grants-and-collection.json",
    "dealsSource": "data/deals-cache.json"
  },
  "products": [
    {
      "productId": "etl_21_29475",
      "productName": "Example Product",
      "productUrl": "product-page-v2-marketplace.html?product=etl_21_29475",
      "grantsPreview": [
        { "name": "Grant Name", "url": "...", "amount": 5000, "currency": "EUR", "validUntil": "2026-02-01" }
      ],
      "dealsPreview": [
        { "name": "Spring Deal", "url": "...", "price": "€1,999", "expires": "2026-02-15" }
      ]
    }
  ]
}
```

## Safety Rules
- Do **not** call APIs on hover
- Do **not** remove existing calculator data sources
- Grants shown **must** come from the enriched product data
- Deals are optional and can be empty
- Keep the hover data small for performance

## Build Script
Use:
```
node build-hover-data-cache.js
```
This script should:
- Read enriched products
- Extract 1–2 grants (sorted by amount, valid date)
- Merge deals from `data/deals-cache.json` if available
- Write `data/hover-data.json`

## Trigger Phrases
Use this skill when the user asks for:
- “hover data cache”
- “hover tooltip grants and deals”
- “weekly hover updates”
- “product hover info”
- “hover grants sync”

## Success Criteria
- Hover cache generated without errors
- Grants preview always valid and in sync
- No UI regressions due to missing data
