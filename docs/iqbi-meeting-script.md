# IQBI Integration Meeting Script

Use this as a live checklist/script during your call with IQBI.

## 1) Goal (opening statement)

We are integrating IQBI data into the Greenways Energy Dashboard for existing Greenways members.
We need secure, read-only access to electricity, gas, water, and (if available) smart plug/sensor telemetry.

## 2) Security + access questions (ask first)

1. What is the recommended machine-to-machine auth method?
   - API token / service account (preferred)
   - OAuth/client credentials
   - Username/password login flow
2. Can we have a dedicated **read-only integration account**?
3. Can access be restricted by IP allowlist?
4. What token/session expiry and rotation policy do you require?
5. Are there audit logs for API usage/auth events?

## 3) Data/API questions

Please provide endpoint URLs (or API docs) for:

- Electricity meter data
- Gas meter data
- Water meter data
- Smart plug/device power telemetry (if available)
- Sensor telemetry (occupancy/temp/humidity/CO2, if available)

Ask for each endpoint:

- Required query parameters (`siteId`, `companyId`, start/end time, timezone)
- Response format (JSON schema)
- Units (`kWh`, `m3`, etc.)
- Update frequency / freshness (real-time, 5-min, hourly)
- Pagination (if any)

## 4) Performance + reliability questions

1. API rate limits (per minute/per hour)?
2. Any burst limits?
3. Typical response time and payload sizes?
4. Error model and status codes?
5. Maintenance windows / downtime notifications?

## 5) Request sample payloads

Please provide **sanitized example JSON** for each endpoint:

- electricity
- gas
- water
- smart plugs (optional)
- sensors (optional)

Also request one example error payload for failed auth and rate limit.

## 6) Confirm dashboard mapping expectations

Our dashboard expects:

- Totals for today: electricity (kWh), gas (m3), water (m3)
- Baseline/target values
- Delta vs yesterday (%)
- Hourly trend arrays
- Optional smart plug list with live power + today usage
- Optional sensor values

## 7) Close the meeting with an action summary

Confirm:

1. Auth method selected
2. Endpoint list shared
3. Sample payloads to be delivered
4. Rate limits confirmed
5. Technical contact for follow-up
6. Target date for test credentials

## 8) Post-meeting implementation checklist

Set env vars in backend:

- `DASHBOARD_PROVIDER_PROFILE=iqbi`
- `DASHBOARD_LIVE_MODE=live`
- `IQBI_ELECTRICITY_URL=...`
- `IQBI_GAS_URL=...`
- `IQBI_WATER_URL=...`

Auth:

- Preferred: `IQBI_API_TOKEN=...`
- Or:
  - `IQBI_AUTH_URL=...`
  - `IQBI_USERNAME=...`
  - `IQBI_PASSWORD=...`

Optional:

- `IQBI_SMARTPLUG_URL=...`
- `IQBI_SENSOR_URL=...`
- `IQBI_SITE_ID=...`
- `IQBI_COMPANY_ID=...`
