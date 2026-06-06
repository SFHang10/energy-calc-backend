# IQBI Secure Setup

Use this flow to connect IQBI safely without exposing sensitive credentials in code or git.

## 1) Prefer token auth

Create a dedicated IQBI integration user and generate a read-only token if available.

Set environment variables:

- `DASHBOARD_PROVIDER_PROFILE=iqbi`
- `DASHBOARD_LIVE_MODE=live`
- `IQBI_BASE_URL=https://api.iqbi.nl`
- `IQBI_API_TOKEN=<read-only-token>`
- `IQBI_MEASUREMENT_POINT_GROUP_IDS=<comma-separated-group-ids>` (recommended)
- `IQBI_INTERVAL=hourly` (`hourly`, `daily`, `monthly`, `fifteen-minutes`)
- `IQBI_SITE_ID=<site-id>` (optional fallback if numeric MPG id)
- `IQBI_COMPANY_ID=<company-id>` (optional fallback if numeric MPG id)

Official IQBI API mode (recommended) uses:

- `POST /api/v1/auth/login` (when using username/password)
- `GET /api/v1/partner/measurement-point-groups/consumptions/{interval}`

If `IQBI_BASE_URL` is set and custom endpoint URLs are not set, the backend uses this official API mode automatically.

Custom provider endpoint URLs (legacy/custom mode; optional):

- `IQBI_ELECTRICITY_URL=...`
- `IQBI_GAS_URL=...`
- `IQBI_WATER_URL=...`
- `IQBI_SMARTPLUG_URL=...`
- `IQBI_SENSOR_URL=...`

## 2) If token auth is unavailable

Use a dedicated low-privilege account (never personal admin credentials).

Set:

- `IQBI_AUTH_URL=<iqbi-auth-endpoint>`
- `IQBI_USERNAME=<integration-username>`
- `IQBI_PASSWORD=<integration-password>`

The backend will request a session token and reuse it until expiry.

## 3) Security guardrails

- Never commit `.env` to git.
- Use deployment secret manager in production.
- Rotate credentials regularly.
- Use least privilege and read-only scopes.
- If supported by IQBI, restrict access by source IP.

## 4) Verify wiring

Check provider profile + enabled state:

- `GET /api/dashboard/providers`

Fetch live dashboard payload:

- `GET /api/dashboard/live?mode=live&forceRefresh=true`

If IQBI endpoints fail, dashboard falls back to mock payload safely.
