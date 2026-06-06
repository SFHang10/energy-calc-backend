# Hover Data Operations

## Purpose
Keep hover tooltips in sync with:
- marketplace product links
- grants/schemes previews
- weekly deals/offers

This uses **cached JSON** so hover never calls live APIs.

## Source Files
- Enriched products:
  - `energy-calculator/products-with-grants-and-collection.json` (preferred)
  - `energy-calculator/products-with-grants.json` (fallback)
- Weekly deals input (manual):
  - `data/deals-weekly-input.json`
- Deals cache (generated):
  - `data/deals-cache.json`
- **Consumer deals feed (generated, separate from hover cache):**
  - `data/deals-feed-seeds.json` (curated; edit this)
  - `data/deals-feed.json` (output of `npm run build:deals-feed` — also merges `deals-weekly-input.json` for ticker hub)
- Hover cache (generated):
  - `data/hover-data.json`

## Weekly Update Steps

### 1) Update weekly deals input
Edit:
```
data/deals-weekly-input.json
```
Format:
```
{
  "source": "weekly-manual",
  "deals": [
    {
      "productId": "etl_21_29475",
      "name": "Example Spring Deal",
      "price": "€1,999",
      "url": "https://example.com/deal",
      "expires": "2026-02-15"
    }
  ]
}
```

### 2b) (Optional) Rebuild consumer deals ticker feed
```
npm run build:deals-feed
```
Serves `HTMLS GWM GWB/deals-ticker-hub.html` over HTTP.

### 3) Build deals cache
```
node build-deals-cache.js data/deals-weekly-input.json
```

### 4) Build hover cache
```
node build-hover-data-cache.js
```

## Notes
- Grants shown in hover are pulled from enriched product data, so they stay in sync.
- Deals are optional; if none exist, hover will show grants only.
- Keep previews short (1-2 grants, 0-2 deals) to avoid oversized hover cards.
