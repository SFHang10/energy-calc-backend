# ETL mentions inventory & remediation (2026-09-07)

Prepared for DESNZ / ETL team review of Greenways Market content.

**Correct primary URL:** https://etl.energysecurity.gov.uk/  
**Greenways central hub:** https://energy-calc-backend.onrender.com/greenways/etl-official  
**GOV.UK guidance:** secondary policy note only — not the product list.

---

## ETL team requests → actions

| # | Request | Action taken |
|---|---------|--------------|
| 1 | Do not quote pricing/savings as from ETL; case studies → deep links | Softened agent/module copy; monitoring refs clarify modelling vs ETL; case-study pages that already deep-link (HVAC / sustainable-tech) kept |
| 2 | Comprehensive list + centralise ETL info | This inventory + hub `/greenways/etl-official` |
| 3 | Remove Enhanced Capital Allowances (ECA) | Removed/replaced on live Low Energy, Product Comparison, monitoring refs, retrofit/renovation plans, insulation variant, agent briefing |
| 4 | Agents link official ETL site not GOV.UK guidance as primary | Artemis refs + energy-cost-guide + citations + Sustainable References reordered |

---

## Central ETL place (recommended for Wix)

Use **one** embed/page for ETL explainer:

- https://energy-calc-backend.onrender.com/greenways/etl-official  
- File: `HTMLS GWM GWB/etl-official-site.html`

Other pages should link here or to `https://etl.energysecurity.gov.uk/` / product/category/case-study URLs — not duplicate full ETL explainers.

---

## Render links — pages changed this pass (update Wix embeds if used)

| Page | Render URL |
|------|------------|
| Official ETL hub | https://energy-calc-backend.onrender.com/greenways/etl-official |
| Energy cost guide | https://energy-calc-backend.onrender.com/greenways/energy-cost-guide |
| Equipment deep dive | https://energy-calc-backend.onrender.com/greenways/equipment-deep-dive |
| Equipment wire | https://energy-calc-backend.onrender.com/greenways/equipment-wire |
| Low Energy New | https://energy-calc-backend.onrender.com/HTMLS%20GWM%20GWB/Low%20Energy%20New%20.HTML |
| Product Comparison Fridge | https://energy-calc-backend.onrender.com/HTMLS%20GWM%20GWB/Product%20Comparison%20Fridge.html |
| Product Comparison Original | https://energy-calc-backend.onrender.com/HTMLS%20GWM%20GWB/Product%20Comparison%20Original.html |
| Low Energy Classic | https://energy-calc-backend.onrender.com/HTMLS%20GWM%20GWB/Low%20Energy%20Classic%20.html |
| Sustainable References | https://energy-calc-backend.onrender.com/HTMLS%20GWM%20GWB/Sustainable%20References%20.HTML |
| Energy monitoring references | https://energy-calc-backend.onrender.com/HTMLS%20GWM%20GWB/Refrenece%20Energy%20monitoring%20.Html |
| Retrofit Tabbed | https://energy-calc-backend.onrender.com/HTMLs/Retrofit-Tabbed.html |
| Renovation project plans | https://energy-calc-backend.onrender.com/HTMLs/Renovation%20project%20plans.html |
| Insulation (added variant) | https://energy-calc-backend.onrender.com/HTMLS%20GWM%20GWB/Insulation%20added%20.html |
| Insulation guide (routed) | https://energy-calc-backend.onrender.com/greenways/insulation-guide |

**Agent chats (ETL copy / refs — no Wix HTML swap, redeploy covers):**

| Agent | Render URL |
|-------|------------|
| Artemis (equipment) | https://energy-calc-backend.onrender.com/greenways/equipment-agent |
| Vincent (finance) | https://energy-calc-backend.onrender.com/greenways/finance-agent |
| Zyanne (products) | https://energy-calc-backend.onrender.com/greenways/sustainable-products-agent |

---

## Inventory of ETL mentions (by family)

### A. Official / correct primary (`etl.energysecurity.gov.uk`)

Many product, deep-dive, appliance comparison, and hub pages already point here. Keep as standard.

### B. GOV.UK guidance (secondary only after this pass)

- `etl-official-site.html` — labelled policy context  
- `data/equipment-agent-references.json` — retitled “not the product list”  
- `Sustainable References .HTML` — official site first  

### C. ECA wording (removed or historic note)

| File | Status |
|------|--------|
| `Low Energy New .HTML` | Fixed |
| `Low Energy Classic .html` | Fixed |
| `Product Comparison Fridge.html` | Fixed |
| `Product Comparison Original.html` | Fixed |
| `Refrenece Energy monitoring .Html` | Fixed |
| `Insulation added .html` | Fixed this pass |
| `HTMLs/Retrofit-Tabbed.html` | Fixed this pass |
| `HTMLs/Renovation project plans.html` | Fixed this pass |
| `HTMLs/Reno Claud Version.html` | Archive duplicate — review if still embedded |
| `HTMLs/low-energy-equipment-savings.html` | Archive — review if embedded |
| `HTMLs/HVACA Comparison.html` | Archive — review if embedded |
| `HTMLs/Citizen Benefits Guide*.html` | Archive — still may mention ECA / “kits from ETL” |
| `Europes Energy Saving .html` | Mentions ECA in EU finance context — review |

### D. “ETL marketplace” / prices-from-ETL risk

| File | Status |
|------|--------|
| `services/equipment-wire-snapshot.js` | Renamed to Greenways marketplace |
| `greenways-equipment-wire-main.html` | Fallback trust line updated |
| `restaurant-equipment-deep-dive.html` | Wording updated |
| `data/greenways-content-modules.json` | Finance bullet clarified |
| Deals feed `sourceName: Greenways ETL marketplace` | Optional rename later |

### E. Agents

- Artemis external refs: official ETL home + product search primary  
- Product Calculator copy already states Greenways-owned, not ETL-owned  
- Internal `etl_*` IDs = Greenways marketplace rows sourced from ETL-listed catalogue data  

---

## Suggested reply to ETL team

We have:

1. Centralised explainer at `/greenways/etl-official` pointing to etl.energysecurity.gov.uk.  
2. Removed Enhanced Capital Allowance claims from live Low Energy / comparison / monitoring / retrofit / renovation surfaces.  
3. Clarified that payback/pricing is Greenways modelling or named case-study URLs — not ETL selling or quoting prices.  
4. Pointed agents and cost-guide footers at the official ETL site; GOV.UK kept only as policy context.  

Attached inventory lists remaining archive pages for their review. Happy to adjust further wording they flag.
