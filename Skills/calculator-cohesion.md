# Calculator Cohesion Skill

## Purpose
Ensure all calculators use the **same enriched product data** (ETL + grants + schemes + collection)
without breaking existing behavior or losing comparative products.

## Scope
- Applies to **all calculator pages** and related widgets
- Keeps **comparative products** (e.g., `sample_*`, `oven_*`, `rest_*`)
- Preserves safety guarantees from:
  - `CALCULATOR_SAFETY_ANALYSIS.md`
  - `CALCULATOR_SAFETY_GUARANTEE.md`

## Known Calculator Files (Scan Reference)
- `HTMLS GWM GWB/Energy Calculator Orginal.html`
- `energy-calculator/energy-calculator-enhanced-2.html`
- `energy-audit-widget-main.html`
- `energy-calculator/energy-calculator-enhanced.html`
- `energy-calculator/energy-calculator.html`
- `energy-calculator/energy-calculator-working.html`
- `energy-calculator/energy-calculator-working-restored.html`
- `energy-calculator/energy-calculator-enhanced-copy-test*.html`
- `energy-calculator/energy-calculator-enhanced-test2*.html`
- `energy-calculator/energy-calculator-enhanced-saved.html`
- `energy-calculator/energy-calculator-enhanced-BACKUP.html`
- `energy-calculator/energy-calculator-enhanced - Copy.html`
- `energy-calculator/energy-calculator-enhanced-copy-test.html`
- `energy-calculator/energy-calculator-enhanced-copy-test2.html`
- `energy-calculator/energy-calculator-enhanced-test2-BACKUP.html`
- `energy-calculator/energy-calculator-enhanced-test2.html`
- `energy-calculator/energy-calculator-enhanced-copy-test2.html`
- `energy-calculator/energy-calculator-enhanced.html`
- `energy-calculator/energy-calculator.html`
- `energy-calculator/energy-calculator-working.html`
- `energy-calculator/energy-calculator-working-restored.html`
- `energy-calculator/energy-calculator-enhanced-2.html`
- `energy-audit-widget-main.html`
- `energy-audit-widget-v3-embedded-test.html`
- `energy-audit-widget-v3-experimental.html`
- `energy-audit-widget-v3-futuristic.html`
- `energy-audit-widget-v3-future-bite.html`
- `energy-audit-widget-v3-experimental-background.html`
- `energy-audit-widget-v3-embedded-test.html`
- `energy-audit-widget-v2-fixed.html`
- `energy-audit-widget-v3-embedded-test.html`
- `energy-audit-widget-v3-experimental.html`
- `energy-audit-widget-v3-futuristic.html`
- `energy-audit-widget-v3-future-bite.html`
- `energy-audit-widget-v3-experimental-background.html`
- `energy-audit-widget-v3-embedded-test.html`

Note: This list is a scan reference. Primary live files should be confirmed
before edits to avoid unintended regressions.

## Current Data Reality
- **Original + Enhanced calculators** use backend endpoints:
  - `/api/products` and `/api/products/all`
- **Audit calculator** uses embedded JS datasets with optional API fallback
- **Enriched data** exists in:
  - `energy-calculator/products-with-grants-and-collection.json` (preferred)
  - `energy-calculator/products-with-grants.json` (fallback)

## Recommended Single Source (Safe)
Use a single API endpoint that serves **enriched products** and normalize to the
fields calculators already expect.

**Endpoint:** `/api/products/enriched`
- Reads from `products-with-grants-and-collection.json` (preferred)
- Falls back to `products-with-grants.json`
- Keeps comparative products
- Adds grants + schemes + collection data

## Safety Principles
- Do **not** remove existing endpoints
- Always **fallback** to old endpoints if new endpoint fails
- Preserve data shape to avoid UI breakage
- Keep embedded datasets as fallback for audit widget

## Implementation Checklist (Low Risk)
1. Add `/api/products/enriched` endpoint
2. Normalize enriched products to existing calculator fields
3. Update calculators to **try enriched first**, then fallback:
   - Original → `/api/products/enriched` → `/api/products`
   - Enhanced → `/api/products/enriched` → `/api/products/all`
   - Audit → add `/api/products/enriched` as a source option
4. Leave old endpoints untouched
5. Sanity check: product counts + sample product fields

## Validation Steps
- `GET /api/products/enriched?limit=1` returns 200
- `products[0].grants` exists (even if empty)
- Calculators still load products when enriched is unavailable
- No removal of comparative products

## Trigger Phrases
Use this skill when the user asks for:
- “calculator data source alignment”
- “make all calculators use same data”
- “enriched products for calculators”
- “grants on calculators”
- “don’t break calculators”
- “calculator safety check”

## Success Criteria
- All calculators have access to the **same enriched dataset**
- Grants + schemes info is available for hover tooltips
- No regressions due to fallback safety
