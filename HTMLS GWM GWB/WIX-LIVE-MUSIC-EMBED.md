# Wix embed — Live Music Finder (Render Version)

Use this on [livemusic4artists.com](https://www.livemusic4artists.com/). The full app runs on **Render**; Wix only shows a thin **iframe wrapper** (a few lines of HTML).

**Copy-paste file:** `live-music-wix-embed-snippet.html` (open in editor → copy between START COPY / END COPY).

---

## Which Wix option do you have?

| Wix option | What you do |
|------------|-------------|
| **Embed HTML** / **Custom embed** / **Enter code** | Paste the snippet from `live-music-wix-embed-snippet.html` — **this is the usual case** |
| **Embed a website** / **iframe URL** field | Paste only the Render URL (below), set height 1320px |
| **Upload HTML file to Media** | **Do not** — the app will not load data (API/JSON are on Render) |

You do **not** upload `live-music-hub-render.html` to Wix. That file is ~600 lines and must be served from Render.

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

## Wix Editor — Embed HTML (recommended)

1. **Add** (+) → **Embed Code** → **Embed HTML** (wording may be “Custom Element” on some sites).
2. Click **Enter code** / **Paste code**.
3. Copy from `live-music-wix-embed-snippet.html` (between START COPY and END COPY).
4. **Update** / **Apply**.
5. Stretch the element to **full width** of the section.
6. If the bottom is clipped, edit the snippet and change `height:1320px` to `1500px` or `1600px`.
7. **Publish** the site.

## Wix Editor — URL-only embed (if available)

1. **Add** → **Embed** → **Embed a site** (or Website iframe).
2. Paste the Render URL above.
3. Height **1320px** (or more), width **100%**.
4. Publish.

## What visitors get

- Events ticker + listings tabs (top)
- Amsterdam **jam map** with venue popups, photos/videos lightbox, music guide (bottom)
- Data and APIs load from the same Render deploy (`/data/…`, `/api/music-venues`)

Updates: push to GitHub → Render redeploys → iframe content refreshes (no Wix republish needed for data/UI changes).

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
