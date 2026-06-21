# Greenways Transition Agents — Roadmap

**Purpose:** One place to return to for agent product, technical, and commercial plans.  
**Orchestrator:** Say *“agents roadmap”* → this file.  
**Related:** `greenways-transition-agents.md` (roster) · `greenways-chat-interface-skill.md` (UI/API) · `SKILL-ORCHESTRATOR.md`  
**Last updated:** 21 Jun 2026

---

## North star

**Greenways Transition Agents** (Andrieus, Vincent, Artemis, Zara, Cheryce, Zyanne, Edwardo) are the **client-facing specialists** that guide businesses through energy and sustainability transitions.

**Skills** power them behind the scenes. Skills can be **shared** across agents; document all homes + optional **Primary** (who to ask first).

**Commercial model:**

| Audience | Goal | AI |
|----------|------|-----|
| **Public (Wix)** | Wow at launch — personality, tablets, polished prose | LLM **on** (polish + fallback); **quotas deferred** initially |
| **Members (paid)** | Full ongoing transition guidance | **Higher limits**; AI cost **included in subscription** |

Knowledge-first answers stay generous for everyone (cheap, credible). **LLM sells the experience at launch; catalogue lookups stay unlimited.** Meter LLM when subscriptions and usage data justify it.

---

## Launch mode (Jun 2026 — active until membership tier ships)

**Product intent:** Best first impression on Wix — warm phrasing, helpful fallbacks, rich right-column evidence. Subscriptions later fund member LLM allowance; public users always keep knowledge + `blocks[]`.

**Orchestrator:** *“launch mode”* · *“agent rollout”* → this section + **`greenways-agents-go-live.md`**.

### Policy (launch)

| Layer | Launch behaviour |
|-------|------------------|
| **Facts** | From repo data only — no invented schemes, URLs, or € figures |
| **Structure** | Short left summary + `blocks[]` / tablets / banner (Cheryce/Zara pattern) |
| **Phrasing** | **LLM encouraged** — tone, “what this means for you”, follow-ups |
| **Misses** | `buildAgentAskFallback` → LLM (no dead ends) |
| **Quotas** | **Deferred** — review cost after 2–4 weeks |
| **Transparency** | Source pill: `knowledge` · `llm` · `intentId` · version |

### Current code vs launch target

| Capability | Today | Launch target |
|------------|--------|----------------|
| Knowledge hit | Returns answer as-is | Optional **LLM polish** on hit (grounded payload; blocks unchanged) |
| Knowledge miss | LLM fallback | Keep; enable Render `ASSISTANT_*` / `{AGENT}_AGENT_*` |
| Quota middleware | Not built | Skip until post-launch |
| Site knowledge cards | Not built | Vincent pilot (Phase 2) |

### Low-risk implementation order

**Track A — Shared (~1 week):** `meaningForProfile()` · `buildAgentHandoff()` · optional `maybePolishKnowledgeAnswer()` · smoke script.

**Track B — One agent (~2–4 days each):** Vincent → Andrieus → Artemis → Cheryce → Zara → Zyanne. Top 3–5 intents only → smokes → deploy → 24–48h gap.

**Track C — Knowledge cards (~2 weeks MVP):** `data/greenways-site-knowledge/` + validator + Vincent pilot + human review per card.

### Accuracy gates (even with LLM)

LLM rewrites **only** `groundedContext`; links from catalogue/`blocks[]`; deploy = `/health` + `POST /ask` + Wix click; document in Orchestrator + `AGENTS.md`.

### Exit launch mode when

Membership tier ready → enable quotas (Phase 1); or cost/abuse spike → soft limit then daily LLM cap with knowledge-only fallback + CTA.

---

## The seven agents (built)

| Name | Slug | Status |
|------|------|--------|
| Andrieus | `grants-agent` | ✅ Live shell + API |
| Vincent | `finance-agent` | ✅ |
| Artemis | `equipment-agent` | ✅ |
| Zara | `deals-agent` | ✅ |
| Cheryce | `media-agent` | ✅ |
| Zyanne | `sustainable-products-agent` | ✅ |
| Edwardo | `systems-agent` | ✅ Staff-oriented |

**Not in the seven:** Greenways Guide (hub conductor, WIP) · Music Guide (parallel product).

**Embed ref:** `HTMLS GWM GWB/WIX-GREENWAYS-AGENTS-EMBED.md`

---

## Roadmap phases

### Phase 0 — Done (May 2026)

- [x] Seven agent HTML shells + shared turn UI (`greenways-agent-turn-ui.js`)
- [x] Character names + Wix portraits (`AGENT_PROFILE`)
- [x] API routes `/api/{agent}-agent/*` + `/greenways/{slug}`
- [x] Knowledge services + intents per agent
- [x] Optional LLM layer (`greenways-agent-llm.js`)
- [x] Roster + agents-vs-skills docs (`greenways-transition-agents.md`)
- [x] Wix embed gotchas documented (absolute turn-ui paths)

---

### Phase 1 — Public launch (discovery)

**Gradual Wix rollout (this week):** **`Skills/greenways-agents-go-live.md`** — one agent per day, shared gate, smoke prompts. Ship Tier A first (Andrieus → Vincent → Artemis → Cheryce); Tier B (Zara, Zyanne) after feed/catalog check; Edwardo staff-only.

**Goal:** Let visitors try agents with **LLM polish and fallback** for the best first impression; **defer strict quotas** until usage data exists (see **Launch mode** above).

| Task | Priority | Notes |
|------|----------|-------|
| Enable LLM on public agents (env per agent prefix) | **High (launch)** | Knowledge path always; LLM on miss **today**; polish-on-hit when Track A lands |
| **LLM quota middleware** (shared across 7 agents) | Medium — **post-launch** | Defer during launch mode; ship when membership tier nears |
| Public limits (starting point) | Medium — **post-launch** | e.g. 5–10 LLM turns/day — tune after 2–4 weeks metrics |
| Graceful fallback when capped | Medium | Knowledge/heuristic answer + membership CTA — build with quota middleware |
| UI quota indicator | Low (launch) | Add when caps enabled |
| Basic logging | High | Log `agent`, `source` (knowledge\|llm\|heuristic), `intentId`; tokens optional |
| Render warm instance + `/health` watch | High | Avoid cold-start first impression |
| Soft rate limit on `/ask` (abuse) | Medium | Pattern: `music-venue-inquiries.js` IP window |
| **Launch mode rollout** | **High** | Track A → Vincent (Track B) → next agents; **`greenways-agents-go-live.md`** |

**Exit criteria (launch):** Tier A agents on Wix with LLM enabled; smokes pass; Orchestrator runbook updated; weekly cost review started. **Full Phase 1 exit** (caps + CTA): when membership tier ships.

---

### Phase 2 — Site expertise (grounded prose)

**Goal:** Agents cite examples — graphs, news, projections — not only link to pages.

| Task | Priority | Notes |
|------|----------|-------|
| **Site knowledge cards** index | High | `data/greenways-site-knowledge/` — id, claim, evidence JSON, page href, `agents[]`, `primary` |
| **Staff portal toolkit (partial ✅ Jun 2026)** | High | `agents-admin-map.html` visualizes + registers **`greenways-content-modules.json`**; `POST /api/agents-admin/content-modules`; not URL scrape / PDF ingest yet |
| Pilot: **Vincent** + one projection scenario + one news item | High | Pattern for all agents |
| Wire card retrieval into `*-agent-knowledge.js` | High | Intent → rank cards + JSON slices → `blocks[]` |
| LLM polish with **grounded payload only** | High | “Cite only provided evidence” |
| Deepen Zara / Cheryce / Zyanne copy + `blocks[]` | Medium | UI shell done; incremental |
| Shared cards across agents | Ongoing | Same evidence, different voice (see transition-agents § Shared skills) |

**Exit criteria:** At least one agent answers with “For example, our fridge scenario shows…” with link to chart page.

---

### Phase 3 — Membership tier (paid full experience)

**Goal:** Members get full agent access; subscription covers AI.

| Task | Priority | Notes |
|------|----------|-------|
| `tier: "public" \| "member"` on `/ask` | High | Verify Wix member via existing `/api/members` patterns |
| Member embed in `unified-membership-dashboard.html` | High | Same agent HTML; pass tier + memberId |
| Higher LLM quota for members | High | e.g. 100/day fair use — tune from Phase 1 logs |
| Membership CTA copy in public chat | Medium | Link to signup / upgrade |
| Price tier includes avg LLM cost | Business | Revisit limits after 4–8 weeks metrics |
| **Later:** saved conversations | Low | Cross-device; needs DB |
| **Later:** profile-aware answers | Low | Region, site, appliances from member profile |
| **Later:** personalized evidence | Low | `personalized-impact-hover` family |

**Exit criteria:** Logged-in member gets higher limit; public user hits cap and sees CTA; billing story matches usage.

---

### Phase 4 — Scale & polish

**Goal:** Smooth under growth; consistent content.

| Task | Priority | Notes |
|------|----------|-------|
| Cache TTL or admin “reload catalogues” | Medium | After JSON updates without redeploy |
| Long-cache static agent assets | Medium | turn-ui.js/css |
| Guide agent (hub conductor) HTML + mount | Medium | `guide-agent` routes exist; not live |
| Dashboard agent tabs (lazy-load one iframe) | Low | `Greenways Interface .html` |
| Redis quotas (if multi-instance) | Low | Only when Render scales horizontally |
| Evidence index build script | Low | Regenerate cards from JSON/news/scenarios |

---

## Architecture reminders

```text
User (Wix public or Member)
  → iframe: /greenways/{slug}
  → POST /api/{agent}-agent/ask { question, profile, tier?, memberId? }
       → quota check (LLM only)
       → answerFromKnowledge (intents + JSON + site cards)
       → optional maybeCallGreenwaysLlm (grounded facts)
  → answer + blocks[] + { llmRemaining? }
```

| Principle | Detail |
|-----------|--------|
| Stateless API | Chat history in browser `sessionStorage` — scales horizontally |
| Knowledge-first | Fast, cheap, consistent — unlimited for public |
| LLM = cost lever | Meter for public; bundle for members |
| Access ≠ understanding | Evidence cards + JSON, not raw HTML crawl |
| Shared skills | One skill → many agents; document all homes |

---

## Suggested starting limits (tune later — **not enforced during launch mode**)

| Tier | Knowledge answers | LLM-assisted turns | Fallback when capped |
|------|-------------------|--------------------|----------------------|
| **Public (launch)** | Unlimited | **Unmetered** — monitor cost weekly | N/A until caps ship |
| **Public (post-launch)** | Unlimited | 5–10 / day (or 3 / session / agent) | Knowledge + heuristic + membership CTA |
| **Member** | Unlimited | 50–100 / day fair use | Knowledge + heuristic; rare hard cap |

---

## Key files (implementation checklist)

| Area | Path |
|------|------|
| Roster & skill map | `Skills/greenways-transition-agents.md` |
| UI/API pattern | `Skills/greenways-chat-interface-skill.md` |
| LLM | `services/greenways-agent-llm.js` |
| Agent routes | `routes/*-agent.js` |
| Knowledge | `services/*-agent-knowledge.js` |
| Members | `routes/members.js`, `wix-integration/unified-membership-dashboard.html` |
| Subscriptions (scaffold) | `routes/subscriptions-simple.js` |
| Rate limit example | `routes/music-venue-inquiries.js` |
| Site knowledge (to create) | `data/greenways-site-knowledge/` |
| Portal tools registry | `data/greenways-content-modules.json` — chat module tablets + admin map middle ring |
| Staff network map | `agents-admin-map.html` · `GET/POST /api/agents-admin/*` |
| Portal story / highlights | `/greenways/agents-story` · `/greenways/agents-highlights` · `npm run build:agent-highlights` |
| Quota service (to create) | `services/greenways-agent-quota.js` (suggested name) |

---

## Metrics to watch

| Metric | Why |
|--------|-----|
| Requests / agent / day | Traffic shape |
| % `source: knowledge` vs `llm` vs `heuristic` | Cost drivers |
| LLM calls blocked by quota | CTA effectiveness |
| Avg latency p95 on `/ask` | UX |
| Member vs public LLM ratio | Pricing validation |
| Render CPU / memory | When to scale plan |

---

## External references (evaluate only — enhance, don’t replace)

| Topic | Doc | Status |
|-------|-----|--------|
| **SkillBoss** (unified AI API gateway) | `docs/reference/skillboss-evaluation.md` | Not implemented |
| **Skills backend automation** (staff pilots, gateway pattern) | `Skills/skills-backend-automation.md` | Not implemented — enhancement layer only |

---

## Open decisions (fill in as you go)

| Decision | Options | Chosen |
|----------|---------|--------|
| Public LLM limit | Per day vs per session vs per agent | **Deferred — launch mode unmetered; review in 2–4 weeks** |
| Member verification | Wix token header vs member id + backend lookup | _TBD_ |
| First evidence pilot agent | Vincent recommended | _TBD_ |
| Guide agent on hub | Before or after membership tier | _TBD_ |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-14 | **Track B — Zyanne** — module tablets (`theme: products`); finder/deep-dive/eco planner intents → `module` blocks; sidebar `moduleOpen`; intercept + in-panel quick links |
| 2026-06-14 | **Track B — Edwardo** — module tablets (`theme: systems`); monitoring/dashboard intents → `module` blocks; sidebar `moduleOpen` on guides + dashboards; **Ops verify** sidebar block unchanged; TurnUi split for chat tablets |
| 2026-06-14 | **Track B — Zara** — module tablets (`theme: deals`); registry id **`deals-full-page`**; portal intents → `module` blocks; sidebar `moduleOpen` for Deals page, energy portal, ticker, water finder |
| 2026-06-14 | **Track B — Cheryce** — module tablets (`theme: media`); sidebar `moduleOpen` for news, references, monitoring, water, deals, ticker; map stays `mapOpen`; portal intents → `module` blocks |
| 2026-06-14 | **Track B — Artemis** — module tablets (`theme: equipment`); registry rows for renovations, insulation, renovation plans, appliance comparison; deep dive / portal intents → `module` blocks |
| 2026-06-14 | **Track B — Andrieus** — module tablets (`theme: grants`); `schemes-portal-restaurant` + `schemes-portal-eu` registry rows; portal/sector/equipment intents → `module` blocks; sidebar `moduleOpen` quick links |
| 2026-06-14 | **Track B — Vincent** — `FINANCE_HANDOFF_RULES` wired via `buildAgentHandoff`; conversational polish on `energy_prices`, `bnpl`, `green_loans`, `price_upgrade_case`, `etl_products` |
| 2026-06-14 | **Track A1** — `finishKnowledgeAskResponse` on all seven `/ask` routes |
| 2026-06-14 | **Launch mode (Jun 2026)** — LLM polish + fallback encouraged; quotas deferred; Track A/B/C implementation order; accuracy gates |
| 2026-05-28 | Initial roadmap: phases 0–4, public/member AI tiers, site knowledge, scale notes |
