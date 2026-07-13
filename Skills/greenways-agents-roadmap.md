# Greenways Transition Agents — Roadmap

**Purpose:** One place to return to for agent product, technical, and commercial plans.  
**Orchestrator:** Say *“agents roadmap”* → this file.  
**Related:** `greenways-transition-agents.md` (roster) · `greenways-chat-interface-skill.md` (UI/API) · `SKILL-ORCHESTRATOR.md`  
**Last updated:** 12 Jul 2026

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

**Progress (Jul 2026):** Site knowledge cards live (`data/greenways-site-knowledge/cards.json`); marketplace bridge modules (`marketplace-about`, `marketplace-home`, `marketplace-hvac`); Zyanne first-person marketplace explainer; in-module navigation via `GreenwaysAgentContentModule`.

---

## Platform power roadmap (Jul 2026)

**Goal:** Move from **guided expert portal** → **powerful, efficient, helpful copilot** — personal context, trustworthy freshness, composed plans, finish-the-task actions, proactive nudges, measurable improvement.

**Working queue:** `Skills/greenways-agents-improvements-master.md` (combined gaps + Ralph waves) ⭐  
**Ralph PRD:** `tasks/prd-agents-power-platform.json` — say *“Start Ralph loop for agents power platform”* to iterate stories in order.

**Orchestrator:** *“agents power roadmap”* · *“what’s missing from agents”* → this section.

### Where we are strong today

| Strength | Detail |
|----------|--------|
| Specialist roster | Seven agents + Orchestra hub; handoffs + module tablets |
| Static knowledge | Schemes, grants overlay, `etl_*` / `sust_*`, deals feed, site cards |
| In-agent tools | Finders, schemes portals, deep dive, savings projection, marketplace bridges |
| Staff ops | `agents-admin`, refresh playbook, Edwardo verify, `validate:agent-data` |

### Gap summary (what still feels missing to users)

| Gap | User symptom |
|-----|----------------|
| **Personal context** | Answers feel generic even when logged in or asking about *their* site |
| **Closed-loop actions** | Chat explains well but user still leaves to finish (apply, buy, save, export) |
| **Live building data** | No “your wok line is X% above benchmark” from real meters/assets |
| **Uneven voice depth** | Some agents conversational (Zyanne/Vincent polish); others still doc-like |
| **Pull-only** | Nothing surfaces until the user knows what to ask |
| **Trust signals** | Stale scheme/deal/news undermines confidence |
| **Cross-agent synthesis** | User hops specialists manually instead of one upgrade plan |
| **Measurement** | Hard to prioritise next intents without ask analytics |

### Implementation waves (priority order)

Waves map onto existing phases — **do not replace Phase 1–4**; they deepen them.

#### Wave 1 — Member + site context (extends Phase 3)

**Goal:** `/ask` knows who is asking and what site they represent.

| Task | Priority | Notes |
|------|----------|-------|
| Pass `tier`, `memberId`, Wix member token from embeds | High | `unified-membership-dashboard.html` + Wix agent iframes → `profile` on `/ask` |
| Resolve member → region, sector, marketplace access | High | Reuse `/api/members` patterns; fail open to public |
| `:::profile-context` when profile fields present | Medium | Already in `greenways-agent-turn-ui.js` — wire server-side |
| Saved shortlist in `sessionStorage` (product ids) | Medium | Zyanne + Artemis read shortlist in answers |
| Per-site equipment from `data/restaurant-assets/*.json` | Medium | Optional `siteId` on profile — Edwardo/Artemis pilot |

**Exit criteria:** Member on dashboard asks Zyanne “what fits my restaurant?” and answer references their region + sector without re-asking.

**PRD stories:** US-001 – US-004

---

#### Wave 2 — Upgrade plans (cross-agent synthesis)

**Goal:** One composed answer: product + grants + payback + deal — not four handoffs.

| Task | Priority | Notes |
|------|----------|-------|
| `upgrade_plan` block type in `blocks[]` | High | Left summary + steps + linked tablets |
| Orchestrator intent `equipment_upgrade_plan` | High | Guide routes → primary agent + enriches from others |
| `services/greenways-upgrade-plan.js` composer | High | Pulls grants (Andrieus), savings (Vincent), products (Zyanne), deals (Zara) |
| Pilot vertical: restaurant fridge or wok | High | `data/savings-projection-scenarios.json` + schemes + catalog |
| Render smokes for composed plan | Medium | `npm run smoke:agents-ask` extension |

**Exit criteria:** “Upgrade our walk-in fridge in Amsterdam restaurant” returns one plan with € range, grant names, payback hint, and product finder tablet.

**PRD stories:** US-005 – US-007

---

#### Wave 3 — Trust & freshness (visible to users)

**Goal:** Users see data is current; staff pipeline stays automated.

| Task | Priority | Notes |
|------|----------|-------|
| `meta.generatedAt` / `meta.updatedAt` on feeds in tablet footers | High | Deals, schemes snapshot, news edition |
| “Data as of …” chip on agent turns when evidence used | Medium | Site knowledge + deals + grants |
| Scheduled `validate:agent-data` on Render (cron) | Medium | Alert → agents-admin stale badges |
| Weekly `npm run build:agent-highlights` in deploy hook | Low | Sidebar nudge content stays fresh |

**Exit criteria:** Zara deal tablet shows “Deals feed · updated [date]”; Edwardo flags stale file before users notice.

**PRD stories:** US-008 – US-010

---

#### Wave 4 — Actions from chat (closed loop)

**Goal:** Finish common tasks without losing the agent.

| Task | Priority | Notes |
|------|----------|-------|
| **Save shortlist** button on product sample / finder rows | High | `sessionStorage` + sidebar “Your shortlist (n)” |
| Deep-link marketplace product with grants pre-loaded | High | `/product-page-v2-marketplace.html?product=etl_*&fromPopup=true` from chat CTA |
| **Export plan** (copy markdown / print-friendly) | Medium | Upgrade plan block → `navigator.clipboard` |
| Grant scheme row → schemes portal module with scheme id | Medium | `?scheme=` query on portal HTML |
| **Later:** Wix cart / apply-for-grant workflow | Low | Needs Wix APIs |

**Exit criteria:** User shortlists 3 products in Zyanne, opens one with grants visible, never uses browser back.

**PRD stories:** US-011 – US-013

---

#### Wave 5 — Voice & depth parity (extends Launch Track B)

**Goal:** Every agent feels like a named specialist, not a documentation dump.

| Task | Priority | Notes |
|------|----------|-------|
| First-person intro pattern (Zyanne template) | High | `zyanneIntroParagraph` → shared `agentIntroParagraph(agentKey)` |
| `skipOpenerIntents` + skip duplicate blocks per agent | Medium | Marketplace pattern in all meta-intents |
| Expand `GREENWAYS_AGENT_POLISH_AGENTS` one agent per week | Medium | After smokes pass per agent |
| Marketplace / portal copy: no internal terms (Wix, iframe, bridge) | Low | User-facing module copy only |

**Exit criteria:** Andrieus + Artemis top-5 intents pass conversational smoke without pasted catalogues in left column.

**PRD stories:** US-014 – US-016

---

#### Wave 6 — Proactive intelligence (pull → push)

**Goal:** Agents surface timely value in sidebar and welcome.

| Task | Priority | Notes |
|------|----------|-------|
| Sidebar **This week** slot from `agent-highlights.json` | High | Per-agent spotlight line + one tablet |
| Grant deadlines chip (next 90 days, region-filtered) | Medium | Andrieus sidebar when `profile.region` set |
| Deal spotlight auto-suggest on agent open | Medium | Zara — top live deal for region |
| **Later:** push notification | Low | Membership tier — see Wave 9 email |

**Exit criteria:** Returning visitor sees one relevant deadline or deal without typing a question.

**PRD stories:** US-017 – US-019

---

#### Wave 7 — Measurement & live ops (extends Phase 4 + Edwardo)

**Goal:** Improve agents from real usage; connect to building data when available.

| Task | Priority | Notes |
|------|----------|-------|
| Log anonymised ask events (`agent`, `intentId`, `source`, miss?) | High | Append JSONL or SQLite table on Render |
| `agents-admin` **Top misses** panel | Medium | Staff prioritises new intents |
| Dashboard sensor lines → Edwardo evidence cards | Low | When real connectivity payloads exist |
| `restaurant-assets` → Artemis benchmark line in answers | Low | File-based until IoT live |

**Exit criteria:** Staff can list top 10 unanswered question patterns from last 7 days.

**PRD stories:** US-020 – US-022

---

#### Wave 8 — Agent voice (speak & listen)

**Goal:** Agents match the illustrated design — users speak questions and hear character-appropriate replies, not only read chat.

**Foundation already in repo:** `greenways-agent-voice.js` (browser Web Speech API), `spokenSummary` on `/ask`, 🎤/🔊 on all shells. **Gap:** several agents have `voiceEnabled: false`; TTS is robotic; Wix iframe mic often blocked; no branded voices.

| Task | Priority | Notes |
|------|----------|-------|
| Enable voice pilot on all seven agents in `greenways-agent-voice-config.json` | High | Start with Andrieus + Zyanne; test on full Render URL before Wix |
| `spokenSummary` on knowledge hits for every agent | High | `applyPersona()` / `spokenSummary()` — not only grants + LLM fallback |
| Document Wix mic + autoplay constraints | Medium | `WIX-GREENWAYS-AGENTS-EMBED.md` — permissions, user gesture for 🔊 |
| `POST /api/agent-voice/tts` — server audio playback | Medium | SkillBoss → ElevenLabs or MiniMax **or** direct vendor; client plays MP3/wav |
| Per-agent `voiceId` + `ttsProvider` in voice config | Medium | Distinct timbre per character |
| Optional `POST /api/agent-voice/stt` when browser STT fails | Low | Whisper-class via SkillBoss; member tier first |
| `autoSpeakOnReply` pilot for members only | Low | After TTS quality acceptable |
| Voice quota (daily TTS seconds) with membership tier | Low | Same pattern as LLM roadmap |

**SkillBoss fit:** Unified gateway for **TTS/STT vendors** (see `docs/reference/skillboss-evaluation.md` § Agent voice). Greenways still builds UI, `spokenSummary`, config, quotas, and audio player.

**Exit criteria:** User asks Zyanne by mic on Render; hears a natural (or improved) voice read `spokenSummary`; tablets stay visible; no invented facts in spoken line.

**PRD stories:** US-023 – US-027

---

#### Wave 9 — Agent email (async channel)

**Goal:** Each agent has a **dedicated mailbox identity** (e.g. `zyanne@…`, `andrieus@…`) for follow-up plans, grant summaries, and deal digests — not only “email me a copy.” Chat stays primary; agent inboxes extend reach for members and staff. **SkillBoss** (`aws/send-emails`, inbound webhooks later) is a good fit once mailboxes are provisioned — see `docs/reference/skillboss-evaluation.md`.

| Task | Priority | Notes |
|------|----------|-------|
| Agent mailbox registry (`data/greenways-agent-mailboxes.json`) | High | `agentId`, display name, from-address, reply-to, allowed templates |
| **Email me this answer** CTA in chat (member) | High | Sends `spokenSummary` + link back to agent + optional plan PDF later |
| Render route `POST /api/agent-mail/send` with auth + rate limit | High | Never open relay — template bodies only, grounded content from last turn |
| SkillBoss `aws/send-emails` or SES pilot | Medium | Staff secretary pattern first; then member-facing transactional |
| Inbound parse stub (`POST /api/agent-mail/inbound`) | Low | Webhook from mail provider → queue for Edwardo/staff review |
| Agent persona sign-off in email templates | Medium | Andrieus vs Zyanne voice in plain English (not LLM invention) |
| GDPR / opt-in copy on membership dashboard | High | Before enabling send |

**SkillBoss fit:** **Higher value here than for chat** — `aws/send-emails`, `ses/send-batch` for outbound without separate AWS setup (see `secretary-skill.md`, `skillboss-evaluation.md`). Inbound + triage still needs your routes and review queue.

**Exit criteria:** Member clicks **Email me this** on Vincent; receives one message with payback summary and link to finance agent; send logged; no PII leak.

**PRD stories:** US-028 – US-031

**Depends on:** Wave 1 (member context) for personalised To: and region; Wave 2 optional for upgrade-plan emails.

---

### Suggested execution order (next 12–16 weeks)

```text
Week 1–2   Wave 3 (trust dates) + Wave 5 quick wins (copy/voice template)
Week 3–4   Wave 1 (member context pilot on dashboard + Zyanne)
Week 5–6   Wave 2 (upgrade plan — fridge or wok vertical)
Week 7–8   Wave 4 (shortlist + product deep-links)
Week 9–10  Wave 6 (proactive sidebar)
Week 11–12 Wave 7 (analytics) + Wave 8 pilot (enable browser voice + spokenSummary all agents)
Week 13–14 Wave 8 premium TTS (SkillBoss or ElevenLabs) — 2 character voices
Week 15+   Wave 9 (agent email registry + Email me this — member pilot)
```

### Mapping to original phases

| Original phase | Power waves that extend it |
|----------------|----------------------------|
| Phase 2 Site expertise | Waves 3, 5, 6 (evidence + voice + nudges) |
| Phase 3 Membership | Wave 1 (context), Wave 4 (actions) |
| Phase 4 Scale | Waves 3, 7 (freshness automation, analytics) |
| Post-launch LLM | Wave 5 (polish breadth) |
| Future IoT | Wave 7 live ops |
| **Agent voice** | Wave 8 (browser → premium TTS; SkillBoss optional) |
| **Agent email** | Wave 9 (mailboxes + SkillBoss send pilot) |

---

### Phase 3 — Membership tier (paid full experience)

**Goal:** Members get full agent access; subscription covers AI.

**Note:** Wave 1 of **Platform power roadmap** accelerates profile-aware answers — implement alongside or before strict quotas.

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
| **Power platform PRD** | `tasks/prd-agents-power-platform.json` |
| **Agent voice (client)** | `HTMLS GWM GWB/js/greenways-agent-voice.js` · `data/greenways-agent-voice-config.json` |
| **Agent voice (server, to create)** | `routes/agent-voice.js` · `services/agent-voice-service.js` (TTS/STT; SkillBoss optional) |
| **Agent mail (to create)** | `data/greenways-agent-mailboxes.json` · `routes/agent-mail.js` |
| **SkillBoss evaluation** | `docs/reference/skillboss-evaluation.md` — TTS/STT + email; not implemented |
| Upgrade plan composer (to create) | `services/greenways-upgrade-plan.js` (suggested) |
| Ask analytics (to create) | `data/agent-ask-analytics.jsonl` or DB table (suggested) |
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
| 2026-07-12 | **Waves 8–9** — Agent voice (speak/listen, SkillBoss TTS optional) + agent email (mailboxes, Email me this, SkillBoss send pilot) |
| 2026-07-11 | **Platform power roadmap** — Waves 1–7 (context, upgrade plans, freshness, actions, voice parity, proactive nudges, analytics); Ralph PRD `tasks/prd-agents-power-platform.json` |
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
