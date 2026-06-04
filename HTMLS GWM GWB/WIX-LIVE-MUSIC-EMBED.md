# Wix embed — Live Music Finder (Render Version)

Use this on [livemusic4artists.com](https://www.livemusic4artists.com/). The full app runs on **Render** — same model as the **membership site** and **energy ticker** (Wix shell + Render iframe URL, or link straight to Render).

You can **delete** any uploaded HTML / old **Embed HTML** block on Wix and replace it with a **Render area** (URL only).

### Common mistake: ticker on Render, map as Wix HTML

The **Sustainability Map** workflow uses a large HTML file on Wix. **Live Music must not copy that** for the jam map.

| Piece | Wrong (broken) | Right |
|-------|----------------|-------|
| Whole page | Wix-uploaded `live-music-finder.html` | **One** Embed a site → `/live-music/render` |
| Ticker only | Render + separate Wix HTML for map | Use **only** `/live-music/render` (ticker + map inside one Render page) |
| Map only (second box) | Wix HTML / Media upload | Second Embed a site → `/live-music/map` |

If the map shows **Music venues 0** and a blank blue panel, you are almost certainly on **Wix-hosted HTML**, not Render. The orange warning bar on the map page confirms that.

---

## Recommended: “Render area” (membership-style)

Same as Greenways membership pages and `wix-integration/energy-ticker-embed.html`:

1. In Wix Editor, **delete** the old embed (uploaded HTML file, broken HTML element, or pasted code).
2. **Add** (+) → **Embed** → **Embed a site** (sometimes **Website** / **Custom embed** with URL field only).
3. **Website address:** paste **only** this URL (no HTML file, no Media upload):

```
https://energy-calc-backend.onrender.com/live-music/render
```

4. **Size:** width **100%** of the section; height **1320px** minimum (use **1500–1600px** if the map is clipped).
5. **Publish**.

Wix keeps your header, menu, and footer; the section is a live window into Render. Updates ship when you push to GitHub and Render redeploys — no Wix republish for data/UI-only changes.

**Optional:** `live-music-wix-embed-snippet.html` is only if your plan has **Embed HTML** but not **Embed a site** — same URL inside a tiny iframe wrapper.

---

## Which Wix option to use

| Wix option | What you do |
|------------|-------------|
| **Embed a site** / **iframe URL** | **Preferred** — paste Render URL only (table above) |
| **Embed HTML** / **Enter code** | Use `live-music-wix-embed-snippet.html` only if URL-only embed is unavailable |
| **Upload HTML to Media** | **Remove** — breaks APIs; do not use |
| **Full-page on Render** | Menu link opens Render URL in same tab or new tab — no iframe (see below) |

You do **not** host `live-music-hub-render.html` on Wix. It is served from Render only.

---

## Render paid tier (always on)

Upgrading from free Render removes cold starts — important for iframes on a public site.

| Setting | Suggestion |
|---------|------------|
| **Instance type** | Paid web service (not free) |
| **Auto-deploy** | On — deploy from `main` after each push |
| **Health check** | `GET /health` |
| After upgrade | **Manual Deploy** once, then verify `/live-music/render` returns the hub (not JSON “Route not found”) |

Paid does not change the Wix setup — you still point **Embed a site** at the same URL. First load is faster and the API stays warm for map, ticker, and music guide.

**Later (optional):** Custom domain on Render (e.g. `app.yourdomain.com`) — update the Wix embed URL once; no app code change required beyond `<base href>` if you use a custom host.

---

## Render URL (inside the snippet or URL field)

**Use this short URL in Wix** (no spaces in path):

```
https://energy-calc-backend.onrender.com/live-music/render
```

Alternate (same page):

```
https://energy-calc-backend.onrender.com/HTMLS%20GWM%20GWB/live-music-hub-render.html
```

---

## Wix Editor — Embed HTML (fallback only)

Use only if **Embed a site** is not on your plan:

1. **Add** (+) → **Embed Code** → **Embed HTML**.
2. Copy from `live-music-wix-embed-snippet.html` (START COPY / END COPY).
3. Full width; height **1320px+**; **Publish**.

## Full page on Render (no iframe)

For a dedicated “app” page with no Wix chrome:

- Wix **menu link** → `https://energy-calc-backend.onrender.com/live-music/render` (new tab recommended), or
- Wix **redirect** page to that URL.

The hub already has **Full page ↗** in the header for the same URL. Good for sharing; you lose Wix nav on that view unless you add a “Back to site” link in the hub.

## What visitors get

- Events ticker + listings tabs (top)
- Amsterdam **jam map** with venue popups, photos/videos lightbox, music guide (bottom)
- Data and APIs load from the same Render deploy (`/data/…`, `/api/music-venues`)

Updates: push to GitHub → Render redeploys → iframe content refreshes (no Wix republish needed for data/UI changes).

## Troubleshooting “Route not found” on Render

If Wix shows JSON like `The route /live-music/render does not exist`:

1. Confirm GitHub `main` includes commits with `server-new.js` live-music routes (after May 2026).
2. In [Render Dashboard](https://dashboard.render.com/) → your **energy-calc-backend** service → **Manual Deploy** → **Deploy latest commit**.
3. Wait until deploy is **Live**, then verify in a browser (all should return **200**, not JSON errors):
   - `https://energy-calc-backend.onrender.com/live-music/render`
   - `https://energy-calc-backend.onrender.com/api/music-venues`
   - `https://energy-calc-backend.onrender.com/data/live-events-feed.json`
4. Update the Wix embed snippet if it still points at the old long path; prefer the short URL above.

## Optional query params

| Param | Example |
|-------|---------|
| Tab | `?tab=listings` |
| Venue on map | `?venue=15` |

## Full page (new tab)

`live-music-hub-render.html` header **Full page ↗** opens the same hub on Render in a new browser tab.

## Wix MCP

Use Wix MCP to locate/update the embed element URL and confirm iframe dimensions after publish.

## Do not

- Upload the HTML file into Wix Media (breaks API/data paths).
- Point the iframe at `livemusic4artists.com` only — that is the Wix shell; the app must load from **Render**.
