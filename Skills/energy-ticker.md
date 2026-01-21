# ⚡ Energy Ticker (Greenways Buildings)

**Skill Type:** Data + HTML Widget  
**Purpose:** Build a live (or cached) energy price ticker for Greenways Buildings  
**Output:** HTML widget + optional backend proxy endpoint

---

## 📋 Overview

This skill creates an embeddable **energy price ticker** that shows:
1) **All Energy (Europe)** prices (day-ahead wholesale, €/MWh)  
2) **Renewable Energy** share or price proxy (Europe)

The ticker should be embedded in Wix as HTML and refresh on a schedule (hourly/daily).

---

## ✅ Feasibility

Yes, this is possible. The cleanest approach is:
- **Backend proxy** to fetch energy data (avoids CORS)
- **Cached API** endpoint consumed by the HTML widget

---

## 🔗 Data Sources (Preferred → Fallback)

### Primary (Recommended)
- **ENTSO‑E Transparency Platform API**  
  - Free API key available  
  - Day‑ahead prices + generation by type  
  - Best source for European coverage

### Secondary (Demo / Rapid Prototype)
- **euenergy.live** (ENTSO‑E based)  
  - Good for demo data  
  - Requires proxy due to CORS

### Optional (If ENTSO‑E unavailable)
- National or regional operators (e.g., UK Elexon, DE/FR exchanges)  
  - Use only if we need a fallback for a specific country

---

## 📁 Supporting Reference Files (Inputs)

- `Skills/Energy Ticker.txt` (starter HTML layout + styling)

---

## 🎯 When to Use

Use this skill when the user asks for:
- "energy ticker"
- "live energy prices"
- "electricity price bar"
- "renewables price ticker"
- "European electricity prices"

---

## 🧩 Data Model (Recommended)

Expose a single endpoint that returns both lines:

```json
{
  "updatedAt": "2026-01-21T09:00:00Z",
  "allEnergy": [
    { "code": "DE", "name": "Germany", "priceEurMwh": 156.17, "changePct": 12.0 }
  ],
  "renewableShare": [
    { "code": "DE", "name": "Germany", "sharePct": 58.4, "changePct": -1.2 }
  ]
}
```

---

## 🔐 Environment Variables

Set these on Render to enable live data:

```
ENTSOE_API_KEY=your_key_here
ENTSOE_PRICE_URL=https://...{API_KEY}...
ENTSOE_RENEWABLE_URL=https://...{API_KEY}...
ENERGY_TICKER_URL=https://... (optional fallback JSON)
ENERGY_TICKER_CACHE_MS=1800000
```

Notes:
- `{API_KEY}` is replaced automatically if present in the URL.
- Price/Renewable URLs must return JSON arrays (or `{ allEnergy }` / `{ renewableShare }`).

---

## 🛠️ Implementation Steps

1. **Choose scope**
   - Default: Europe (ENTSO‑E zones)
   - Optional: UK / Ireland / specific regions

2. **Create backend proxy**
   - Node/Express route in `server-new.js`  
   - Fetch ENTSO‑E (or proxy euenergy.live)  
   - Cache results for 15–60 minutes

3. **Normalize data**
   - Convert to €/MWh (prices)  
   - Calculate change % vs previous day  
   - Renewable line: share % (generation mix) or a price proxy

4. **Build HTML widget**
   - Two ticker rows (All Energy + Renewables)
   - Update every X minutes

5. **Embed in Wix**
   - Use HTML embed  
   - Keep height ~200px  
   - Add `wix-html-scroll` meta to avoid scroll

---

## 🧾 HTML Output (Template)

Use the structure from `Skills/Energy Ticker.txt`. Add a second ticker row:

```html
<div class="ticker-container">
  <div class="ticker-header">
    <div class="ticker-title">European Electricity Prices</div>
  </div>
  <div class="ticker-wrapper">
    <div class="ticker-content" id="allEnergyTicker"></div>
  </div>

  <div class="ticker-header">
    <div class="ticker-title">Renewable Energy Share</div>
  </div>
  <div class="ticker-wrapper">
    <div class="ticker-content" id="renewableTicker"></div>
  </div>
</div>
```

Script should fetch from `/api/energy-ticker` and render both lines.

---

## ✅ Review Checklist

- [ ] Prices update on schedule  
- [ ] Renewable line shows % share (or price proxy)  
- [ ] Works in Wix HTML embed (no CORS errors)  
- [ ] No horizontal scroll within Wix iframe  
- [ ] Clear data source attribution

---

## 📦 Recommended Output Location

- HTML draft: `content-ops/drafts/energy-ticker/`
- Backend route: `server-new.js`

---

## ✅ Success Criteria

- Two-line ticker visible on Greenways Buildings  
- Day‑ahead prices for Europe  
- Renewables line updates from same data source  
- Stable refresh without CORS issues  

---

**Last Updated:** January 2026  
**Maintained By:** Greenways Systems + Content Team
