# Cloudflare Worker: ENTSO-E XML -> JSON

This worker proxies ENTSO-E XML responses and returns normalized JSON.

## Deploy (Wrangler)

1) Install Wrangler:
```
npm i -g wrangler
```

2) Login:
```
wrangler login
```

3) From repo root:
```
cd cloudflare
wrangler deploy
```

## Environment Variables (Cloudflare)

Set these as Worker secrets:

```
wrangler secret put ENTSOE_API_KEY
wrangler secret put ENTSOE_URL_TEMPLATE
```

- `ENTSOE_URL_TEMPLATE` can include `{API_KEY}` which will be replaced automatically.
- You can also pass a `url` query param at runtime to override the template.

## Example Usage

```
https://<your-worker>.workers.dev/?url=https://web-api.tp.entsoe.eu/api?documentType=A44&processType=A16&in_Domain=10Y1001A1001A83F&out_Domain=10Y1001A1001A83F&periodStart=202601210000&periodEnd=202601220000&securityToken={API_KEY}
```

## Render Env Vars (Energy Ticker)

Point the backend to your worker outputs:

```
ENTSOE_API_KEY=your_key_here
ENTSOE_PRICE_URL=https://<your-worker>.workers.dev/?url=...A44...
ENTSOE_RENEWABLE_URL=https://<your-worker>.workers.dev/?url=...A75...
ENERGY_TICKER_CACHE_MS=1800000
```

## Notes
- The worker response is JSON with `data.timeSeries[].periods[].points[]`.
- The backend expects arrays for `allEnergy` and `renewableShare`.
- If you want, we can add a server-side mapper to convert ENTSO-E JSON into the `allEnergy` / `renewableShare` arrays directly.
