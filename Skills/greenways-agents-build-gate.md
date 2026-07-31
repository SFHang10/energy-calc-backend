# Greenways Agents — Build Gate (grow without break)

**Purpose:** Keep agents professional, precise, and conversational while knowledge and tools grow.  
**Use when:** Adding modules, intents, demo prefills, shortlist surfaces, or ingest pipelines.  
**Related:** `greenways-chat-interface-skill.md` · `greenways-agents-go-live.md` · `agents-data-refresh-playbook.md` · `greenways-agents-improvements-master.md`

---

## North star

Agents are **advisors over catalogues** — not a single brain that absorbs every file.

| Grow freely | Keep stable |
|-------------|-------------|
| Schemes, deals, news, products, video pointers, site cards | Chat shell, turn UI, handoffs |
| New **modules** agents can open/prime | One demo system, one shortlist key |
| Enrichment: draft → approve → publish | `/ask` shape: answer + blocks + samples |
| Member/site context when ready | Fail-open if data missing |

**Ingest rule:** Ingest → draft → approve → publish to known JSON/module → smoke. Never crawl straight into live prompts.

---

## Three build lanes only

| Lane | Examples | Rule |
|------|----------|------|
| **Chat** | intents, knowledge answers, handoffs | Structured `blocks[]` — no one-off chat layouts |
| **Module** | Shortlist Compare, Finance Finder, Agent Market | Register in `data/greenways-content-modules.json`; support embed/return/demo |
| **Data** | `schemes.json`, deals feed, catalogs | Edit source of truth → refresh/validate — no forked product JSON |

If work does not fit a lane, stop and design the contract first.

---

## Agent-first HTML checklist

Before calling a new page done:

1. Opens via `GreenwaysAgentContentModule`
2. Accepts `embed` + `return` / `from` (Back works)
3. Prefill / `demo=1` works when an agent suggests it (`services/greenways-module-demo.js` + client banner)
4. Uses existing shortlist / `etl_*` / `sust_*` — no new product database
5. One smoke or manual open-from-agent proves open + prime + Back

---

## Conversational quality (don’t bog down)

Each `/ask` answer should stay:

- **Left:** short summary (why it matters)
- **Right:** 1–3 tablets/modules (or handoffs)
- **Optional:** one clear next step

Avoid: catalogue dumps, ops jargon (Wix/iframe/bridge), five competing CTAs.

---

## Pre-push gate (2–4 minutes)

When the change touches agents, modules, or agent data:

```bash
npm run smoke:agent-modules
npm run smoke:agents-ask
```

Also run when relevant:

```bash
npm run validate:agent-data    # data / pipeline changes
npm run sync:agent-sidebar     # data/greenways-agent-sidebar-config.json changed
npm run smoke:agent-links      # external reference URLs (slower)
```

Manual (new module): open from Artemis or Zyanne Quick links → confirm demo banner + **Back**.

### Combined shortcut

```bash
npm run smoke:agents-gate
```

Runs `smoke:agent-modules` then `smoke:agents-ask`.

---

## Contracts not to fork

| Contract | Location |
|----------|----------|
| Module registry | `data/greenways-content-modules.json` |
| Demo / prefill helpers | `services/greenways-module-demo.js` + `HTMLS GWM GWB/js/greenways-module-demo.js` |
| Product shortlist key | `greenways-product-shortlist` (`greenways-agent-product-shortlist.js`) |
| Content module shell | `HTMLS GWM GWB/js/greenways-agent-content-module.js` |
| Chat clone pattern | `Skills/greenways-chat-interface-skill.md` |

Extend these — do not invent a second prefill, shortlist, or chat layout system.

---

## Knowledge growth path

1. Identify customer desire (scheme, product lane, video, site fact)
2. Land in the right catalogue (or draft queue under `content-ops/drafts/`)
3. Wire agent intent / module tablet / demo prefill
4. Run build gate smokes
5. Log one line in `Skills/greenways-agents-improvements-master.md` if it is a lasting capability

**Do not** add an 8th consumer chat until Orchestra + Customer Hub feel solid — depth beats headcount.

---

## Orchestrator triggers

*agents build gate* · *smoke agent modules* · *grow without break* · *pre-push agents* · *ingest approve publish*
