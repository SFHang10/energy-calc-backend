# Energy Guidance Core Spec v1

Use this as the single source of truth for dashboard calculations, recommendation scoring, and ingestion readiness across:

- `HTMLS GWM GWB/restaurant-equipment-deep-dive.html`
- `HTMLS GWM GWB/equipment_intelligence_tool.html`
- `HTMLS GWM GWB/utility-detail.html`
- `services/equipment-intelligence-service.js`
- `routes/equipment-intelligence.js`

## 1) Goal

Provide consistent, explainable guidance for reducing energy bills by combining:

- actual utility data (when available),
- equipment benchmark intelligence,
- marketplace and non-marketplace alternatives,
- grant support context.

## 2) Canonical Domain Model

All modules should use this normalized shape.

```json
{
  "siteId": "string",
  "equipmentId": "string",
  "equipmentType": "refrigerator|dishwasher|oven|fryer|other",
  "timeZone": "Europe/Amsterdam",
  "daily": {
    "electricityKwh": 0,
    "gasKwh": 0,
    "waterLitres": 0
  },
  "rates": {
    "electricityEurPerKwh": 0.30,
    "gasEurPerKwh": 0.11,
    "waterEurPerLitre": 0.0025
  },
  "sourceQuality": {
    "electricity": "meter|estimated|missing",
    "gas": "meter|estimated|missing",
    "water": "meter|estimated|missing"
  }
}
```

## 3) Unit Standards

- Electricity: `kWh`
- Gas: `kWh` (convert from `m3` if provider sends volume)
- Water: `L` (convert from `m3` where required)
- Time:
  - Daily baseline for all option comparisons
  - Horizons:
    - `1m=30`
    - `6m=182`
    - `1y=365`
    - `2y=730`
    - `10y=3650`

## 4) Normalization Rules

Before calculations:

1. Convert source units to canonical units.
2. Apply timezone normalization to avoid date-window drift.
3. Clamp impossible values (negative usage/rates).
4. Mark missing fields explicitly (`sourceQuality`), do not silently zero unless fallback rule applies.

Fallbacks (only when missing):

- `electricityEurPerKwh = 0.30`
- `gasEurPerKwh = 0.11`
- `waterEurPerLitre = 0.0025`

## 5) Core Formulas

Daily operating cost:

`dailyCost = (electricityKwh * electricityRate) + (gasKwh * gasRate) + (waterLitres * waterRate)`

Horizon cost:

`horizonCost = dailyCost * horizonDays`

Savings vs baseline:

`horizonSavings = baselineHorizonCost - optionHorizonCost`

Grant-adjusted outcome (Greenways options):

`netBenefit = horizonSavings + grantValueApplied - capexDelta`

## 6) Recommendation Confidence

Return `confidenceScore` (0-100) and `confidenceBand`.

Base scoring:

- +35 if electricity from meter
- +20 if gas from meter
- +20 if water from meter
- +15 if benchmark match score >= 60
- +10 if rate inputs are explicit user/provider values

Penalties:

- -15 for each utility using fallback estimated usage
- -10 if benchmark range unavailable
- -10 if required fields missing and imputed

Bands:

- `high`: >= 75
- `medium`: 45-74
- `low`: < 45

## 7) Kitchen Operations Adjustment Layer (v1)

Add optional adjustment factors for restaurant realism:

- `serviceWindowFactor` (prep/lunch/dinner/night)
- `occupancyFactor` (covers/day index)
- `idleLoadFactor` (% idle contribution)
- `seasonalityFactor` (month/temperature proxy)

Applied as:

`adjustedDailyUsage = rawDailyUsage * serviceWindowFactor * occupancyFactor * seasonalityFactor`

Note: keep `idleLoadFactor` as diagnostic output if not yet reliably measured.

## 8) Ingestion Contract (Dashboard Data Readiness)

Required fields for each point:

- `timestamp` (ISO8601)
- `timezone`
- `siteId`
- `metricType` (`electricity|gas|water`)
- `value`
- `unit`

Optional but preferred:

- `equipmentId`
- `sourceSystem`
- `qualityFlag` (`raw|validated|estimated`)
- `intervalMinutes`

Validation outcomes:

- `accept`: valid and usable
- `accept_with_flags`: usable with caveats
- `reject`: malformed / unsupported unit / impossible value

## 9) API Contract Alignment

### Existing endpoints to align

- `GET /api/equipment-intelligence/compare`
- `GET /api/equipment-intelligence/alternatives`
- `GET /api/equipment-intelligence/decision-matrix`

### Minimum response additions (all recommendation endpoints)

```json
{
  "calculationVersion": "energy-guidance-core-v1",
  "assumptions": {
    "ratesFallbackUsed": false,
    "missingUtilities": []
  },
  "confidence": {
    "score": 0,
    "band": "high|medium|low",
    "reasons": []
  }
}
```

## 10) UX Requirements (Trust + Actionability)

Each recommendation card should show:

- projected cost for selected horizon,
- projected savings vs current,
- confidence band,
- top assumptions used,
- next action (`view`, `apply grant`, `suggest for marketplace`, `track action`).

## 11) Implementation Sequence

1. Centralize formulas in service layer (single helper module).
2. Add response metadata (`calculationVersion`, assumptions, confidence).
3. Normalize all incoming utility data before endpoint logic.
4. Add kitchen adjustment factors as optional params.
5. Surface confidence + assumptions in UI cards.

## 12) Definition of Done

Core is accepted when:

- Same inputs yield same outputs across all pages.
- All recommendation responses include assumptions + confidence.
- Unit conversions are explicit and test-covered.
- Missing-data behavior is deterministic and visible to users.
- At least one end-to-end test validates horizon cost and savings math.

