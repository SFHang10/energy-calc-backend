# Wix embed — Greenways chat agents (one agent per page)

**Full detail:** `Skills/greenways-chat-interface-skill.md` § **Wix site pattern**

**Pattern:** Agents **hub** (character group image, links to specialists) → optional **Guide** conductor iframe (WIP) → each **agent Wix page** (character hero + **one** Render iframe).

---

## Hub conductor (WIP)

When **Greenways Guide** ships, the hub page may embed **one** chat:

```
https://energy-calc-backend.onrender.com/greenways/guide-agent?embed=1
```

Routes to specialist pages — **not live** until HTML + `server-new.js` mount. See `Skills/greenways-chat-interface-skill.md` § Guide Agent.

---

## Embed a site (preferred)

1. Wix **Add** (+) → **Embed** → **Embed a site**
2. Paste URL (replace `{agent}`):

```
https://energy-calc-backend.onrender.com/greenways/{agent}?embed=1
```

3. Width **100%** · height start **900px** (bump to **1100–1300px** if clipped)
4. **Publish**

### Agent URLs

| Name | Role | `{agent}` slug |
|------|------|----------------|
| **Andrieus** | Grants & schemes | `grants-agent` |
| **Vincent** | Finance & payback | `finance-agent` |
| **Artemis** | Equipment & renovation | `equipment-agent` |
| **Zyanne** | Sustainable products | `sustainable-products-agent` |
| **Zara** | Deals & spotlights | `deals-agent` |
| **Cheryce** | News & media | `media-agent` |
| **Edwardo** | Systems health | `systems-agent` |
| Guide (WIP) | Hub conductor | `guide-agent` — not live yet |

Full roster + skills map: `Skills/greenways-transition-agents.md`

---

## Starter question from hub (optional)

Add to iframe URL or Wix link:

```
?q=Your+question+here
```

Example:

```
https://energy-calc-backend.onrender.com/greenways/deals-agent?q=What+product+deals+are+live%3F
```

(`?prompt=` works the same.)

---

## Do not

- Seven chat iframes on one Wix page (one specialist embed per agent page; hub may add **one** Guide conductor when live)
- Upload agent HTML to Wix Media — breaks API paths
- Local image paths in Wix marketing — use `static.wixstatic.com` only

---

## After backend changes

Push GitHub → wait for Render deploy → test `/health` → hard-refresh Wix page (iframe cache).

**Full-page iframe (recommended):** use the agent URL **without** `?embed=1` and set Wix height **900–1100px** — sidebar + compose stay visible. Example:

```
https://energy-calc-backend.onrender.com/greenways/deals-agent
```

---

## Prototypes — character + compact embed (saved for later)

Not used in production now (full iframe is simpler), but kept in the repo for per-agent experiments.

| File | Local open | Render (when deployed) |
|------|------------|------------------------|
| `greenways-deals-agent-embed-test.html` | Simulated Wix page: Zara art beside a **480px** iframe + parent expand script | `/greenways/deals-agent-embed-test` |
| `greenways-deals-agent-wix-frame.html` | **One embed**: character column + inner chat iframe | `/greenways/deals-agent-wix-frame` |
| `js/greenways-agent-embed-expand.js` | **⛶ Full chat** in agent header (`?embed=1`) | same path under `/HTMLS GWM GWB/js/` |
| `js/wix-greenways-embed-parent.js` | Wix page listener — resizes outer iframe | same path under `/HTMLS GWM GWB/js/` |
| `wix-zara-expand-snippet.html` | Copy-paste HTML embed for Wix parent script | — |

**Clone pattern for another agent:** copy the wix-frame + embed-test pair, swap portrait URL, inner iframe slug, and `agent: "deals"` in `postMessage` payloads.

