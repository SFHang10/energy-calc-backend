# Skills backend — automation & optional enhancements

**Skill type:** Reference (staff / builder)  
**Status:** **Enhancement only** — do not replace existing pipelines; add when a skill has clear repetitive pain.  
**Orchestrator:** *“skills backend”*, *“skill automation”*, *“enhance skills backend”*  
**Related:** `docs/reference/skillboss-evaluation.md` · `SKILL-ORCHESTRATOR.md` · `greenways-agents-roadmap.md`  
**Last updated:** 28 May 2026

---

## Guiding principle

**Build on what you have.** Greenways already runs on:

- Canonical JSON (`schemes.json`, deals feed, product overlays, news KB)
- `npm run` / Node integrators (`product-grants-integrator.js`, `build-deals-feed.js`, …)
- **Skills** as documented workflows (Orchestrator + `Skills/*.md`)
- **Agents** that **read** published data only

**Enhancements** = optional shortcuts (search, scrape, parse, email, extra LLM routing) that **speed up maintaining** catalogues and content. They must **not**:

- Bypass human review for grants, prices, or policy text
- Write straight into production JSON from an unreviewed LLM call
- Replace deterministic scripts (grants mapping, calculator cohesion, hover cache)
- Become a runtime dependency on every public `/ask`

```text
Skills (staff) → scripts & review → published JSON/HTML
                                      ↓
                         Transition Agents (read only)
```

---

## What stays manual / scripted (no enhancement layer needed)

| Skill / pipeline | Why keep as-is |
|------------------|----------------|
| `product-addition-workflow.md` | Category → grants mapping is deterministic |
| `product-grants-integrator.js` | Must stay reproducible and auditable |
| `calculator-cohesion.md` | Safety boundaries on calculator data |
| `hover-data-aggregator.md` | Local merge from enriched products |
| `Greenways Market Manager MD.md` | Wix MCP / store — vendor-specific |
| `Systems MD.md` | Health checks on your stack |

---

## Where optional automation helps (priority order)

Use this when you return to “should we add SkillBoss / scrape / email?” — **pilot one row at a time**.

| Priority | Skill | Enhancement type | Output (always reviewed) |
|----------|-------|------------------|---------------------------|
| **1** | `grants-schemes-finder.md` | Search + scrape official scheme pages | Review queue → edit `schemes.json` |
| **2** | `sustainability-news-finder.md` / `tech-news-finder.md` | Research / scrape sources | Draft in content-ops |
| **3** | `content-operations.md` | PDF/DOCX parse to markdown | Draft folder, not live site |
| **4** | `secretary-skill.md` | Send email API | Logged outreach |
| **5** | Evidence cards (roadmap Phase 2) | Batch extract from HTML | `data/greenways-site-knowledge/` |
| **5b** | Portal tool registration (partial ✅ Jun 2026) | Staff form on admin map | `data/greenways-content-modules.json` via `POST /api/agents-admin/content-modules` |
| **6** | `greenways-agent-llm.js` | Optional second provider (e.g. SkillBoss) | Same grounded LLM pattern |

**Low priority for automation:** image gen, video gen, social boost, open-ended “research agents”.

---

## Optional gateway pattern (if you adopt later)

One module only — do not scatter vendor calls across skills:

| Approach | Suggested path |
|----------|----------------|
| Single wrapper | `services/external-ai-gateway.js` or extend `greenways-agent-llm.js` with `SKILLS_` / `SKILLBOSS_` env prefix |
| Staff-only | Called from `scripts/` or admin routes — **not** from public agent routes by default |
| Env-gated | No key = skill doc workflow stays manual (zero regression) |

Example staff flow (grants):

```text
npm run review:scheme-links   (future script)
  → gateway: scrape + compare title/date
  → writes data/scheme-review-queue.json
  → human approves
  → edit schemes.json + product-grants-integrator.js
```

---

## Agents vs skills — enhancement placement

| Layer | SkillBoss / automation fit |
|-------|---------------------------|
| **Skills backend** | **Primary** — research, parse, email, batch evidence |
| **Public agents** | **Minimal** — maybe LLM routing only; no open web tools |
| **Member agents** | **Later** — bounded tools (e.g. email my summary) after save/report phase |
| **Cursor / Orchestrator** | IDE skill pack (`skillboss.co/skill.md`) for **builders** only |

---

## Skill doc convention (when enhancing a skill)

Add one line to the skill’s header when automation exists:

```markdown
**Automation:** manual | `npm run …` | optional gateway (search/scrape/email) — see `skills-backend-automation.md`
```

---

## Decision checklist

Before adding any enhancement:

- [ ] Existing script + skill doc workflow is insufficient (repetitive pain)
- [ ] Output goes to **review queue** or draft, not live catalogue
- [ ] Works with **no API key** (degrades to manual)
- [ ] Documented in this file + relevant skill `.md`
- [ ] Not required for agents to function on Wix

---

## Related references

| Doc | Purpose |
|-----|---------|
| `docs/reference/skillboss-evaluation.md` | Vendor opinion, agent vs staff fit, security |
| `Skills/greenways-agents-roadmap.md` | Phases 1–4; external references table |
| `Skills/greenways-transition-agents.md` | Agents vs shared skills |
| `services/greenways-agent-llm.js` | Current LLM integration |

---

## Changelog

| Date | Note |
|------|------|
| 2026-05-28 | Created — enhancement-only principle, pilot order, gateway pattern |
