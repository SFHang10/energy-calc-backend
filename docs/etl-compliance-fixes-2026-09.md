# ETL compliance fixes (2026-09)

Follow-up to `docs/etl-mentions-inventory-2026-09.md` for the DESNZ / ETL team email.

## What changed

### A. Renovation project plans (`HTMLs/Renovation project plans.html`)
- Removed ECA / tax-benefit stats and the **Tax Benefit** table column.
- Grants shown as illustrative cash only (£8,000); net investment £72,000 (no tax relief).
- Banner clarifies: ETL = DESNZ efficiency criteria; costs/savings/grants = Greenways examples.
- Phase 4 renamed **Claims & monitoring**; ECA claim wording removed.
- ROI comparison no longer subtracts tax relief.

### B. Sustainable References (+ HVAC / sustainable-tech live pages)
- Tags: `ETL official` → `UK ETL (DESNZ)` / equivalent (never “ETL Official”).
- Product link: `/product-search` → `/products`.
- GOV.UK label: **purchaser guidance** (not “policy note” / “Official Guidance”).
- Greenways tool card kept clearly separate.

### C. Energy Monitoring References
- Legend: `UK ETL list`.
- Card [2] + disclaimer: savings/ROI on monitoring pages are **not** from the ETL; cite ISO/case studies/other cards.
- `energy-monitoring-citations.js` hover copy aligned (no ETL-sourced savings implication).

### D. Render routes for Wix embeds
| Route | File |
|-------|------|
| `/greenways/sustainable-references` | `Sustainable References .HTML` |
| `/greenways/energy-monitoring` | `Importance of Energy Monitoring.html` |
| `/greenways/energy-monitoring-references` | `Refrenece Energy monitoring .Html` |
| `/greenways/renovation-plans` | `HTMLs/Renovation project plans.html` |
| `/greenways/eco-project-planner` | `HTMLs/eco_project_planning_guide_fixed.html` |

Module hrefs in `data/greenways-content-modules.json` updated to these paths.
