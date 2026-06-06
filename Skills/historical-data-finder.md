# Historical Data Finder Skill

## Purpose
Build comparative, time-based product cost insights using energy prices and
appliance consumption so we can show “cost today” and “cost over time” on
Greenways Market product pages.

## Core Idea
Use the energy ticker price data as the **price input** and pair it with
**product consumption** (kWh/year or kWh/month) to estimate:
- Cost today (at current tariff)
- Cost trend (how cost rises/falls with energy prices)
- Savings vs baseline (old/standard appliance)

This is explicitly **relative** to energy price movement, not a retail bill
estimate, so we include a disclaimer on product pages.

## Inputs
- Product usage data (kWh/year, kWh/month, or kWh/cycle)
- Baseline/older appliance usage data for comparison
- Current energy price (from `/api/energy-ticker`)
- Historic price points (cached snapshots of ticker data)
- Region (UK, NL, ES, PT initially; expand later)

## Outputs
- Comparable cost ranges (today + historical range)
- Savings trend (low-energy vs baseline)
- Simple charts (monthly/annual cost)
- Data block for product pages (JSON for UI)

## Data Sources (Starting Set)
From `Im trying to show the benefits of using low energy (2).md`:
- Eurostat building energy data (sector benchmarks)
- ODYSSEE‑MURE building efficiency briefs
- HotMaps heating/cooling demand maps
- BPIE EU buildings database
- REHVA HVAC energy use references
- TABULA/EPISCOPE building archetypes
- National benchmarks (CBS, RVO, ISSO for NL)

These are used to build baseline “typical appliance/system” ranges when we
don’t have manufacturer kWh data.

## Data Strategy
1. **Short‑term**: Use known ETL product kWh + a “typical old unit” benchmark.
2. **Mid‑term**: Build a small baseline library for common appliances
   (fridges, heat pumps, HVAC/HRV, dishwashers).
3. **Long‑term**: Expand with regional building archetypes and national
   datasets for more accurate baselines.

## Recommended Storage
Create a local JSON cache (price snapshots + baseline library) to:
- Reduce API calls
- Keep “historical” comparisons
- Enable fast rendering

Example files:
- `data/energy-price-history.json`
- `data/baseline-appliance-library.json`

## API/Backend (Planned)
New endpoint idea (not required yet):
- `GET /api/historical-cost?productId=...&region=UK`
  - Returns cost today + cost range (1w/1m/6m)
  - Provides savings vs baseline

## Product Page Integration (Planned)
Add a “Historical Cost” card:
- “Costs £X today; ranged between £Y–£Z in the last 6 months”
- “Low‑energy model saves ~£A–£B/yr vs standard”
- Disclaimer: “Wholesale price proxy; actual bills vary by supplier.”

## Trigger Phrases
Use this skill when the user asks for:
- “historical cost comparisons”
- “price history vs appliance cost”
- “baseline vs low‑energy comparison”
- “how much does this product cost to run today”
- “cost over time using energy prices”

## Success Criteria
- Clear, explainable cost comparison tied to energy prices
- Data sources cited and transparent assumptions
- Ready-to-render JSON for product pages

## Notes
- Keep the focus on **relative savings** and **trend direction**.
- Use caching to reduce external API cost.
