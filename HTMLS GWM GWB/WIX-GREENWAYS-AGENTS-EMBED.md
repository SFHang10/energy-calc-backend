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

| Agent | `{agent}` slug |
|-------|----------------|
| Grants | `grants-agent` |
| Finance | `finance-agent` |
| Equipment | `equipment-agent` |
| Sustainable Products | `sustainable-products-agent` |
| Deals | `deals-agent` |
| Media | `media-agent` |
| Systems | `systems-agent` |
| Guide (WIP) | `guide-agent` — hub conductor, not live yet |

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
