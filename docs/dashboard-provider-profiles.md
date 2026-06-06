# Dashboard Provider Profiles

The dashboard live endpoint supports profile-based provider mappers.

## Select a profile

Set:

`DASHBOARD_PROVIDER_PROFILE=default|vendorA|vendorB|vendorC`

Then call:

`GET /api/dashboard/live?mode=live`

## Current profiles

- `default`: generic keys (`totalKwh`, `hourlyKwh`, etc.)
- `vendorA`: `metrics`-based payloads
- `vendorB`: `data.readings` payloads
- `vendorC`: `channels + telemetry` payloads

## Vendor C sample

Use this file as reference for payload shape:

- `docs/dashboard-vendor-c-sample.json`

## Fast onboarding workflow for new vendor

1. Copy `services/dashboard-providers/vendor-c-adapters.js` to a new adapter file.
2. Update mapping functions to match vendor JSON keys:
   - `mapElectricityPayload`
   - `mapGasPayload`
   - `mapWaterPayload`
   - `mapPlugPayload`
   - `mapSensorPayload`
3. Register profile in `services/dashboard-providers/index.js`.
4. Set `DASHBOARD_PROVIDER_PROFILE=<newProfile>`.
5. Verify with:
   - `GET /api/dashboard/providers`
   - `GET /api/dashboard/live?mode=live&forceRefresh=true`
