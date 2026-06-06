# Grants and Schemes Review - 2026-05-11

## Summary
- Total current schemes in `schemes.json`: 62
- Review scope: official 2026 updates from UK GOV, SEAI, RVO, KfW, CINEA/LIFE, Belgium regional portals, IDAE, and Fundo Ambiental
- Proposed actions before JSON update:
  - New: 2
  - Update: 9
  - Expire/Pause: 3
  - Remove: 0 (recommend pause/expire first instead of hard delete)

## New Schemes (Proposed)

### 1) Warm Homes Plan (UK)
- ID: `uk-warm-homes-plan`
- Region: United Kingdom
- Type: grant
- Max Funding: Program-level public investment (multi-year)
- Deadline: Ongoing (to 2030 horizon)
- Target: Homes / low-income households
- Source: https://www.gov.uk/government/publications/warm-homes-plan/warm-homes-plan-html
- Status: Verified
- Notes: Useful umbrella policy entry for customer-facing context.

[APPROVE] [REJECT] [MODIFY]

### 2) LIFE 2026 Clean Energy Transition Calls
- ID: `eu-life-cet-2026`
- Region: EU-Wide
- Type: grant
- Max Funding: Call-based; 2026 CET envelope published
- Deadline: 2026-09-16 (for key CET calls)
- Target: Businesses / local authorities / project developers
- Source: https://cinea.ec.europa.eu/life-calls-proposals-2026_en
- Status: Verified
- Notes: Add as an annual call entry with clear deadline.

[APPROVE] [REJECT] [MODIFY]

## Updated Schemes (Proposed)

### 1) Boiler Upgrade Scheme (BUS)
- ID: `bus-grant`
- Change: update notes to reflect April 2026 budget increase
- Deadline: unchanged (program ongoing within current policy window)
- Source: https://www.gov.uk/government/publications/boiler-upgrade-scheme-budget-increase-april-2026
- Status: Verified

[APPROVE] [REJECT] [MODIFY]

### 2) ECO4
- ID: `eco4`
- Change: update deadline to `2026-12-31` (extension confirmed)
- Source: https://www.gov.uk/government/consultations/extending-the-eco4-end-date/outcome/extending-the-eco4-end-date-government-response-html
- Status: Verified

[APPROVE] [REJECT] [MODIFY]

### 3) SEAI Heat Pump Grant
- ID: `seai-heat-pump`
- Change: funding update to new higher maximum (up to EUR 12,500 context-dependent)
- Source: https://seai.ie/grants/home-grants/better-energy-homes/heat-pump-systems/
- Status: Verified

[APPROVE] [REJECT] [MODIFY]

### 4) ISDE Scheme (Netherlands)
- ID: `isde`
- Change: 2026 policy updates (budget envelope + measure adjustments)
- Source: https://www.rvo.nl/subsidies-financiering/isde-wat-wijzigt-er-2026
- Status: Verified

[APPROVE] [REJECT] [MODIFY]

### 5) EIA - Energy Investment Allowance (Netherlands)
- ID: `eia`
- Change: update 2026 parameters and keep type as `tax`
- Source: https://rvo.nl/subsidies-financiering/eia/ondernemers
- Status: Verified

[APPROVE] [REJECT] [MODIFY]

### 6) KfW Energy Efficiency Loans / Heating Support (Germany)
- ID: `kfw-loans`
- Change: align wording with current KfW heating support references and 2026 guidance context
- Source: https://www.kfw.de/inlandsfoerderung/Heizungsf%C3%B6rderung/
- Status: Verified

[APPROVE] [REJECT] [MODIFY]

### 7) MaPrimeRenov
- ID: `maprimenov`
- Change: add 2026 modality changes and stricter pathway notes
- Source: https://www.service-public.fr/particuliers/vosdroits/F35083?lang=en
- Status: Verified

[APPROVE] [REJECT] [MODIFY]

### 8) Flanders Energy Premium
- ID: `be-flanders-premium`
- Change: add 2026 reform note (changes from March 2026)
- Source: https://www.vlaanderen.be/wonen-in-vlaanderen/nieuws/wijzigingen-mijn-verbouwpremie-vanaf-1-maart-2026
- Status: Verified

[APPROVE] [REJECT] [MODIFY]

### 9) Wallonia Energy Primes
- ID: `be-wallonia-prime`
- Change: note temporary regime and request window cutoff
- Source: https://energie.wallonie.be/home/soutiens-financiers/particuliers/primes-pour-la-renovation/prime-habitation/prime-pour-son-habitation-a-partir-du-14-fevrier-2025.html
- Status: Verified

[APPROVE] [REJECT] [MODIFY]

## Expire / Pause (Proposed)

### 1) Great British Insulation Scheme
- ID: `gbis`
- Proposed action: set status to `expired`
- Reason: official scheme ended 2026-03-31
- Source: https://www.gov.uk/government/statistics/great-british-insulation-scheme-release-april-2026/summary-of-the-great-british-insulation-scheme-april-2026
- Status: Verified

[APPROVE] [REJECT] [MODIFY]

### 2) Brussels RENOLUTION
- ID: `be-brussels-prime`
- Proposed action: set status to `paused` with note "2026 continuation pending official decision"
- Reason: official page indicates no open 2025/2026 application window yet
- Source: https://renolution.brussels/fr/les-primes-renolution
- Status: Verified

[APPROVE] [REJECT] [MODIFY]

### 3) MOVES III Electric Mobility
- ID: `moves-iii`
- Proposed action: mark `expiring-soon` (not full expire yet)
- Reason: successive MOVES call windows are time-bound and region-administered; keep visible but urgent
- Source: https://www.idae.es/en/node/36423
- Status: Needs final per-region confirmation

[APPROVE] [REJECT] [MODIFY]

## Remove (Proposed)
- No hard removals recommended in this pass.
- Safer approach: change status to `expired`/`paused` first, then remove after one review cycle if still inactive.

## Normalization Notes for Next Step
- Keep existing `schemes.json` schema for compatibility with current HTML consumers.
- Do not migrate to Mongo schema format in this pass.
- Preserve region codes (`uk`, `ie`, `nl`, etc.) and existing `links` array shape.
