# 🌍 Europe Data Sources for Greenways (Draft)

**Purpose:** Reference list of data sources to support energy savings, retrofit
planning, and grant matching across the UK, Netherlands, Spain, Portugal, and
broader Europe.

**Status:** Draft. API availability and access terms must be verified per source.

---

## ✅ Priority Countries (Phase 1)
- United Kingdom
- Netherlands
- Spain
- Portugal

## ✅ Suggested Phase 2 Countries (15+ EU)
- Ireland
- France
- Germany
- Belgium
- Italy
- Austria
- Sweden
- Denmark
- Finland
- Poland
- Czechia
- Slovakia
- Hungary
- Romania
- Greece
- Slovenia
- Croatia
- Lithuania
- Latvia
- Estonia

---

## 🔌 Core Data Categories

### 1) Energy Prices & Grid Data
**Goal:** Show market trends, energy savings context, and timing nudges.
- **ENTSO‑E Transparency Platform** (EU-wide backbone)
  - Day‑ahead prices, generation mix, load, cross‑border flows.
  - Requires API key and usage compliance.
  - Site: https://transparency.entsoe.eu/

**Country TSOs (examples)**
- UK: National Grid ESO (carbon intensity, grid data)
- NL: TenneT
- ES: REE (Red Eléctrica de España)
- PT: REN (Redes Energéticas Nacionais)

**Note:** TSO APIs and endpoints vary; confirm per country.

---

### 2) Carbon Intensity
**Goal:** Carbon‑aware usage advice and retrofit impact messaging.
- **UK Carbon Intensity API** (GB)
  - https://api.carbonintensity.org.uk/
- **ENTSO‑E** as EU fallback for generation mix → inferred carbon intensity.

---

### 3) Grants & Subsidies
**Goal:** Local grant matching for retrofit and low‑energy products.

**EU‑level (multi‑country)**
- CORDIS (EU R&D grants, Horizon)
  - https://cordis.europa.eu/
- LIFE Programme
  - https://cinea.ec.europa.eu/life_en
- Innovation Fund
  - https://climate.ec.europa.eu/

**Country examples (Phase 1)**
- UK: Ofgem / DESNZ (ECO, boiler upgrade, etc.)
- NL: RVO (e.g., ISDE, energy efficiency schemes)
- ES: IDAE (energy efficiency programmes)
- PT: ADENE / Fundo Ambiental

**Note:** Most grant data is in portals rather than APIs; scraping or manual
sync may be required.

---

### 4) Building Performance Data (EPC / BER)
**Goal:** Baseline building performance, before/after retrofit scoring.
- UK EPC register (open datasets)
- NL energy labels (EP‑Online / RVO)
- ES energy certificates (regional registries)
- PT SCE certificates (ADENE)

**EU‑wide references**
- EU Building Stock Observatory (BSO)
  - https://energy.ec.europa.eu/topics/energy-efficiency/energy-performance-of-buildings/eu-building-stock-observatory_en

---

### 5) Product Efficiency & Labels
**Goal:** Validate product performance and compare efficiency.
- **ETL (UK)** for energy‑efficient product listings
  - https://etl.energysecurity.gov.uk/
- **EPREL (EU Product Registry for Energy Labelling)**
  - https://eprel.ec.europa.eu/
- **EU Ecolabel** (product sustainability references)
  - https://environment.ec.europa.eu/

**Note:** EPREL provides public product data, but API access/format must be
verified.

---

### 6) Climate & Weather (Savings Accuracy)
**Goal:** Localize savings using degree‑days and climate factors.
- Meteostat or Open‑Meteo for degree‑days and weather normals
  - https://meteostat.net/
  - https://open-meteo.com/

---

## 🧭 Orchestrator Mapping (Draft)

**Inputs**: country, region, building type, product category, timeframe  
**Outputs**: energy prices, carbon intensity, grants list, retrofit plan,
product efficiency evidence.

**Fallbacks**
- Prefer national TSO + grant portal.
- Use ENTSO‑E for grid data when national APIs are missing.
- Use manual grant updates if no structured data is available.

---

## ✅ Next Actions (Proposed)
1. Confirm **Phase 2 country list** (15+ EU).
2. Verify **TSO API access** for NL/ES/PT.
3. Decide whether to use **ENTSO‑E as default EU backbone**.
4. Identify which **grant portals** are machine‑readable vs manual updates.

---

**Last Updated:** January 2026
