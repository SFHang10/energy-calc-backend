# Restaurant tenant agent packs

**Skill type:** Architecture + clone playbook (platform + tenant)  
**Consumer homes:** Chain assist UIs (e.g. Wok Assist); Transition Agents stay Europe-wide  
**Administrator:** Master Agents Admin (platform); future chain admin for tenant prefs only  
**Related:** `Skills/greenways-transition-agents.md` · `Skills/greenways-chat-interface-skill.md` · `Skills/energy-dashboard-skill.md` · `data/greenways-tenant-agent-packs.json`  
**Last updated:** 23 Jul 2026

---

## Purpose

Greenways has **two agent layers**:

| Layer | Owns | Example |
|-------|------|---------|
| **Transition Agents** | Europe-wide sustainability & energy transition knowledge | Andrieus, Vincent, Artemis, Zara, Cheryce, Zyanne, Edwardo |
| **Tenant (restaurant) agents** | One chain’s sites, equipment, local events, ops | Wok Assist (`wok-to-walk`) |

Tenant agents are the **front door for a client**. They hand off to Transition Agents when the question needs platform / EU knowledge, optionally with `chainId`, `companyId`, `siteId` in the brief.

**Do not** clone seven Transition Agents per restaurant. Clone a **tenant pack**.

---

## Reference pack: Wok to Walk

| Piece | Location |
|-------|----------|
| Pack manifest | `data/tenant-agent-packs/wok-to-walk.json` |
| Registry row | `data/greenways-tenant-agent-packs.json` |
| Assist UI | `HTMLS GWM GWB/Chef 3 W2W .html` → `/greenways/wok-assist` |
| Events / catering | `HTMLS GWM GWB/Events Ticker W2W .html` |
| Equipment slim list | `data/restaurant-assets/wok-to-walk-equipment-list.json` |
| Buildings map data | `data/company-map-buildings.json` (`companyId: wok-to-walk`) |
| Chain hub (shell) | `/greenways/tenants/wok-to-walk` |
| API | `GET /api/tenant-packs`, `GET /api/tenant-packs/:chainId` |

Treat W2W as the **live reference**. Next chains copy the pack shape, not the Transition Agent roster.

---

## Pack contents (required)

Every `data/tenant-agent-packs/{chainId}.json` should declare:

1. **Identity** — `chainId`, `brandName`, `companyId`, `status`, optional `brandImageUrl`
2. **Story block** — `storyIntro`, `bestFor[]`, `valuePoints[]`, `collaborationFlow[]`, `journeys[]`, `tips[]` (powers the chain hub explain page)
3. **Primary assist** — route, HTML, ask API, `imageUrl`
4. **Surfaces** — chat, tickers, dashboard, deep dive links — each with `howUsed`
5. **Assets** — paths under `data/restaurant-assets/` (and map JSON)
6. **Tenant agents** — local characters (start with one assist; grow later)
7. **Handoffs to platform** — Transition Agent slug + when + optional `w2wExample` / chain example
8. **`handoffBriefDefaults`** — chain/sector hints for platform `/ask`
9. **`cloneChecklist`** — steps for the next brand

Register the pack in `data/greenways-tenant-agent-packs.json`.

---

## Handoff rules

1. Tenant agent answers **chain-local** questions from pack assets first.
2. If topic is grants / finance / marketplace / deals feed / news / sustainable catalogue / systems health → **handoff** to the matching Transition Agent slug.
3. Always pass **`chainId`** (and `siteId` / `companyId` when known) in the handoff brief.
4. Transition Agents do **not** invent site equipment lists — they use tenant asset data or stay general.
5. After a platform answer, optional **return** to tenant assist with “apply to site X”.

Reuse the platform handoff pattern in `services/greenways-agent-handoff.js` for specialist↔specialist; tenant→platform uses the same `gw-team-handoff-v1` brief (`fromSlug: wok-assist`, plus `chainId` / `siteId` / `companyId`). **Wok Assist UI:** chips in `Chef 3 W2W .html` (sidebar + welcome + after replies) write the brief via `GreenwaysAgentTeam.writeHandoff`, then open `/greenways/{slug}?q=…`. Referral welcomes treat `wok-assist` as a live tenant source for all seven Transition Agents.

---

## Clone a new restaurant chain

1. Copy `data/tenant-agent-packs/wok-to-walk.json` → `{new-chainId}.json`; rewrite ids and labels.
2. Add `data/restaurant-assets/{chainId}-equipment-list.json` (slim schema — see `data/restaurant-assets/README.md`).
3. Fork assist HTML (or parameterise W2W shell with `?companyId=`).
4. Add `app.get('/greenways/…-assist')` in `server-new.js`.
5. Append registry entry in `greenways-tenant-agent-packs.json`.
6. Point deep dive / dashboard merges at `?site={chainId}`.
7. Smoke: assist loads, equipment JSON loads, one handoff link to Andrieus works.

---

## Admin / product split

| Who | Controls |
|-----|----------|
| **Master admin** (Greenways) | Transition Agents + pack registry + which handoffs exist |
| **Chain / member admin** (future) | Tenant prefs, local shortlists, which sites are active — **not** `schemes.json` |
| **End users** | Chain hub + assist; Transition Agents via handoff or Orchestra |

Staff demo entry: **Staff · Agents admin** (password-gated). Tenant packs appear under API + chain hub; surface in Agents Admin in a later story.

---

## Out of scope (for this skill’s first slice)

- Per-chain clone of all seven Transition Agent chats
- Full LLM “self-updating” research pipeline (platform roadmap)
- Password roles for chain admins (after master staff gate)

---

## Routing (orchestrator)

| Ask | Route |
|-----|--------|
| Wok Assist, W2W events, venue equipment list | This skill + energy-dashboard-skill |
| Andrieus / Vincent / … Europe-wide | `greenways-transition-agents.md` |
| New restaurant chain agents | This skill — clone pack from W2W |
| Customer Hub (member, multi-agent) | `tasks/prd-customer-hub.json` / customer hub HTML |
