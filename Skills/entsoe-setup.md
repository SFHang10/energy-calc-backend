# ENTSO-E setup (Greenways live EU grid + energy ticker)

One API key powers:

- **Site energy reading** — NL / ES / PT live generation mix (`/api/site-energy-reading/lookup`)
- **Energy ticker + Vincent finance wire prices** — day-ahead €/MWh + renewable share (`/api/energy-ticker`)

Optional: **Electricity Maps** (`ELECTRICITY_MAPS_API_KEY`) adds EU carbon forecast on site energy reading.

---

## 1. Register

1. Create an account at [transparency.entsoe.eu](https://transparency.entsoe.eu/).
2. Email **transparency@entsoe.eu** with subject **Restful API access** and your registered email in the body.
3. After approval (often a few working days): **My Account** → generate **security token**.

---

## 2. Render environment

On the **energy-calc-backend** web service → **Environment**:

| Variable | Required | Purpose |
|----------|----------|---------|
| `ENTSOE_API_KEY` | Yes | Transparency API token |
| `ELECTRICITY_MAPS_API_KEY` | No | EU 24h carbon forecast on site energy reading |
| `ENTSOE_PRICE_URL` | No | Legacy JSON proxy (Cloudflare worker); skip if using native ticker |
| `ENTSOE_RENEWABLE_URL` | No | Legacy JSON proxy for renewables |
| `ENERGY_TICKER_CACHE_MS` | No | Default 30 minutes |

Save → wait for redeploy (~2–3 min).

---

## 3. Verify

```bash
# Local (with .env containing ENTSOE_API_KEY)
npm run smoke:entsoe
```

**Production:**

- `GET https://energy-calc-backend.onrender.com/api/site-energy-reading/health`  
  → `euLiveReady: true` when `entsoe` or `electricityMaps` is set  
- `GET .../api/site-energy-reading/lookup?country=nl&postcode=1012AB`  
  → `live: true`, `source: "ENTSO-E"`  
- `GET .../api/energy-ticker/health`  
  → `probe.isLive: true`, `probe.source: "ENTSO-E"`  
- `GET .../api/energy-ticker?refresh=1`  
  → `isLive: true` (not `demo`)  
- Vincent finance wire: `GET .../api/finance-wire/snapshot` — prices lane should show live ticker metadata

---

## 4. Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| `Acknowledgement` / no data | Token not approved yet, or wrong period window |
| Site EU still “benchmark” | Key missing on Render or deploy not finished |
| Ticker `isLive: false` but site works | Rare zone A44 gap — check `/api/energy-ticker/health` `probe` |
| Rate limits | Ticker batches 3 zones at a time; cache default 30 min |

Advanced JSON proxy (optional): `cloudflare/README.md`.
