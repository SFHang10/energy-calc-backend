# Restaurant CSR Scorecard (KPI map)

**Skill type:** Reference / agent knowledge  
**Data:** `data/restaurant-csr-kpi-map.json`  
**Primary consumer:** **Cheryce** (CSR overview, GRI framing)  
**Also:** Guide, Edwardo, Vincent, Artemis, Zyanne, Zara, Andrieus (by KPI)  
**Admin:** Staff may keep the Excel workbook as an operator tool — **do not** embed it in chat  
**Last updated:** 5 Aug 2026

---

## Purpose

Give Greenways Transition Agents a **thin, restaurant-specific CSR vocabulary**: 22 KPIs across four pillars, GRI disclosure codes, and which agent should own each topic.

This closes a real gap — agents were strong on energy, equipment, and grants, but light on **structured CSR** (labour, community, sourcing, GRI readiness). It does **not** turn every agent into an HR or philanthropy consultant.

**Source material:** Restaurant CSR Strategy Scorecard methodology (Excel + markdown). The live formulas stay in the workbook for operators; agents use the JSON map only.

---

## When to use

| User ask | Action |
|----------|--------|
| “CSR / ESG / GRI for our restaurant” | Cheryce (or Guide) — pillars + route Environmental KPIs to specialists |
| “Energy / water / carbon intensity” | Edwardo + Vincent (+ Artemis / Zyanne) |
| “Packaging / local sourcing / certifications” | Zyanne (+ Cheryce) |
| “Green electricity %” | Zara (+ Vincent) |
| “Funding for efficiency that helps our CSR score” | Andrieus + Vincent |
| Living wage, pay gap, H&S, volunteering | Cheryce **acknowledge + hand off** — not product depth |

---

## Rules for agents

1. **Read the map** — `data/restaurant-csr-kpi-map.json` (`kpis[]`, `pillars[]`, `agentRouting`).
2. **Do not invent scores** — maturity 0–5 and RAG need operator data; explain the scale, don’t fake a dashboard.
3. **Sample targets are illustrative** — calibrate for concept and geography (QSR ≠ fine dining; NL ≠ UK).
4. **Greenways wedge first** — meter → save → fund → prove. CSR framing supports that story; it must not dilute it.
5. **Ethical / philanthropic** — acknowledge materiality; hand off to HR / community partners. Never invent legal or payroll advice.
6. **Excel stays offline** — operators may use `Restaurant_CSR_Scorecard_Dashboard.xlsx`; chat answers cite KPIs and GRI codes from JSON.

---

## Four pillars (default weights)

| Pillar | Weight | Primary agent | Greenways depth |
|--------|--------|---------------|-----------------|
| Environmental | 40% | Cheryce (frame) / Edwardo–Zyanne (act) | **Core** — monitoring, products, deals, grants |
| Ethical | 25% | Cheryce | Acknowledge only |
| Philanthropic | 15% | Cheryce | Acknowledge only |
| Economic | 20% | Zyanne / Cheryce | Sourcing & certifications — medium |

---

## Environmental KPIs ↔ product hooks (priority)

| KPI | GRI | Primary agent | Hook |
|-----|-----|---------------|------|
| Energy intensity (kWh/cover) | 302-3 | Edwardo | Submetering, city / interactive monitoring pages |
| Water intensity | 303-3 | Zyanne | Water Saving Finder |
| Carbon Scope 1+2 | 305-1/2 | Vincent | Audit trail, payback |
| Renewable share | 302-1 | Zara | Green tariffs |
| Food waste / diversion | 306-3/4 | Cheryce | Narrative + circular economy |
| Packaging / plastic | 301-2 | Zyanne | Sustainable products |

Full 22-KPI list (including ethical / philanthropic / economic): see JSON.

---

## Initiative prioritisation (for narrative only)

```text
Priority = 35% Impact + 25% Stakeholder/regulatory + 20% Financial value + 20% Feasibility
```

- **High ≥4.0** — now · **Medium 3.0–3.9** — next quarter · **Low &lt;3.0** — backlog  
- Vincent: financial value · Edwardo/Artemis: feasibility · Cheryce: regulatory relevance  

---

## Related

| Asset | Role |
|-------|------|
| `data/restaurant-csr-kpi-map.json` | Canonical KPI → agent → GRI map |
| `data/greenways-sustainability-glossary.json` | Term definitions (CSRD, Scope 1–3, etc.) |
| `HTMLS GWM GWB/city-energy-monitoring.html` | Investor snapshot — energy & funding chapter (knowledge source; not an agent chat module) |
| `HTMLS GWM GWB/interactive_restaurants_monitoring.html` | Investor monitoring evidence & demo (knowledge source; not an agent chat module) |
| Excel workbook (Downloads / staff) | Full scorecard + dashboard for operator entry |

---

## Backlog (optional later)

- Portal content module linking the methodology for staff  
- Feed metered energy/water into Environmental maturity when tenant packs exist  
- Smoke: `csr` / `gri` prompts on Cheryce + Guide in `npm run smoke:agents-ask`

**Shipped (Aug 2026):** Cheryce intent `csr_overview` via `services/restaurant-csr-knowledge.js`; Guide `route_csr` → media; glossary terms `csr`, `gri`, `materiality`, `csr-maturity`, `food-waste-hierarchy`.
