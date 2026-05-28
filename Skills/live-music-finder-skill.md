# Live Music Finder Skill

**Skill type:** Product workflow + UI/data cohesion  
**Purpose:** Keep the Live Music Finder map, events feed, ticker, and map linking consistent and low-maintenance  
**Location:** `Skills/live-music-finder-skill.md`

---

## When to use this skill

Use when the user mentions:

- Live Music Finder, live jam map, open mic Amsterdam, music venues map
- `live-music-finder.html`, `live-events-ticker.html`, `live-events-updates.html`
- Music guide, venue inquiries, `music-venues.json`, events feed / ticker
- Linking ticker listings to map pins, `venueId`, `?venue=`
- Wix embeds for the music finder site

**Do not use `file://`** for any of these pages — they `fetch()` JSON and APIs. Always test via **`npm start`** → `http://localhost:4000/...` or Render.

---

## System map

```mermaid
flowchart LR
  subgraph data [Data layer]
    MV[data/music-venues.json]
    SEEDS[data/live-events-seeds.json]
    WEEKLY[data/live-events-weekly-input.json]
    FEED[data/live-events-feed.json]
  end
  subgraph build [Build]
    B1[npm run import:music-venues]
    B2[npm run build:live-events-feed]
  end
  subgraph api [API server-new.js]
    V[/api/music-venues]
    I[/api/music-venue-inquiries]
    G[/api/music-guide/ask]
  end
  subgraph ui [HTML pages]
    MAP[live-music-finder.html]
    TICK[live-events-ticker.html]
    UPD[live-events-updates.html]
  end
  MV --> V
  SEEDS --> B2
  WEEKLY --> B2
  B2 --> FEED
  FEED --> TICK
  FEED --> UPD
  V --> MAP
  MAP -->|"?venue=id"| MAP
  TICK -->|venueId link| MAP
  UPD -->|venueId link| MAP
```

---

## Key files

| Role | Path |
|------|------|
| **Hub shell (Wix primary)** | `HTMLS GWM GWB/live-music-hub.html` — events tabs top, **map fixed below**, `postMessage` venue sync |
| **Map (main)** | `HTMLS GWM GWB/live-music-finder.html` |
| **Events ticker** | `HTMLS GWM GWB/live-events-ticker.html` (`?embed=1` ≈ 112px iframe) |
| **What's on hub** | `HTMLS GWM GWB/live-events-updates.html` |
| **Venue data** | `data/music-venues.json` |
| **Events seeds (edit)** | `data/live-events-seeds.json` |
| **Generated feed** | `data/live-events-feed.json` |
| **Agent proposals** | `data/live-events-candidates.json` → approve → `live-events-weekly-input.json` |
| **Venues API** | `routes/music-venues.js` |
| **Inquiries API** | `routes/music-venue-inquiries.js` |
| **Music guide API** | `routes/music-guide.js` |
| **Venue import** | `scripts/import-music-venues.js` → `npm run import:music-venues` |
| **Events feed build** | `scripts/build-live-events-feed.js` → `npm run build:live-events-feed` |
| **Venues admin** | `HTMLS GWM GWB/music-venues-admin.html` |
| **Inquiries admin** | `HTMLS GWM GWB/music-inquiries-admin.html` |

Ticker visual language matches **`Events Ticker W2W .html`** and **`deals-ticker-hub.html`**: dual lanes, blue (#4da6ff) + orange (#ff8c1a), Space Grotesk / JetBrains Mono, `?embed=1` strips chrome.

---

## Local development

```bash
cd energy-cal-backend
npm start
# default http://localhost:4000
```

| Page | URL |
|------|-----|
| Map | `http://localhost:4000/HTMLS%20GWM%20GWB/live-music-finder.html` |
| Ticker (full) | `http://localhost:4000/HTMLS%20GWM%20GWB/live-events-ticker.html` |
| Ticker (embed) | `.../live-events-ticker.html?embed=1` |
| What's on | `http://localhost:4000/HTMLS%20GWM%20GWB/live-events-updates.html` |
| Deep-link venue | `.../live-music-finder.html?venue=3` |

**Populate / refresh data:**

```bash
npm run build:live-events-feed    # seeds + approved weekly → feed JSON
npm run import:music-venues       # optional CSV → music-venues.json
npm run sync:music-venues-fallback # refresh inline fallback in map HTML
```

---

## Wix / Render embeds

**Primary Wix embed:** use the hub shell (one iframe, three tabs inside):

| Embed | URL |
|-------|-----|
| **Hub (recommended)** | `/HTMLS%20GWM%20GWB/live-music-hub.html` |
| Map only | `/HTMLS%20GWM%20GWB/live-music-finder.html` |
| Ticker strip | `/HTMLS%20GWM%20GWB/live-events-ticker.html?embed=1` |
| Events list only | `/HTMLS%20GWM%20GWB/live-events-updates.html` |

**Hub layout:** top = sidebar tabs (events ticker · listings · music news soon); **bottom = jam map always visible** (not a tab). Events panels use `postMessage` → map selects pin.

**Hub backdrop photo:** edit `--music-hub-backdrop-image` in `live-music-hub.html` (Wix static URL). Body class `music-hub--backdrop` enables the layer.

Child panels use `?embed=hub` to hide duplicate chrome when loaded inside the hub iframe.

- Add `<meta name="wix-html-scroll" content="no-scroll">` on full pages (already on map + updates).
- Match iframe height to content; hub shell ≈ **full viewport**; ticker embed ≈ **112px**.
- After seed changes: run build, **commit `data/live-events-feed.json`**, push for Render.

---

## Venue photos (Wix)

Upload in **Wix Media Manager**, then paste **`https://static.wixstatic.com/media/...`** into **`data/music-venues.json`** → **`imageUrl`**. Run **`npm run sync:music-venues-fallback`**. Orchestrator routes: **Media Skill**, **html-content-creator**, **Greenways Market Manager**.

Optional event hero: **`imageUrl`** on a row in **`live-events-seeds.json`** (e.g. Rooftop Open Mic), then **`npm run build:live-events-feed`**.

---

## Events feed schema

Edit **`data/live-events-seeds.json`** → run **`npm run build:live-events-feed`**.

**Event row (minimal):**

```json
{
  "id": "venue-bimhuis-jam",
  "category": "jazz",
  "date": "Tuesdays",
  "title": "Bimhuis Jam Session",
  "line": "Short subtitle",
  "venue": "Bimhuis",
  "venueId": 3,
  "desc": "Longer copy for spotlight cards.",
  "href": "https://www.bimhuis.nl",
  "web": "bimhuis.nl",
  "webUrl": "https://www.bimhuis.nl",
  "email": "info@bimhuis.nl",
  "source": "venue",
  "spotlight": true,
  "isNew": false,
  "addedAt": "2026-05-28"
}
```

**Categories → ticker lanes**

| Lane (ticker label) | `category` values |
|------------------------|-------------------|
| Open mic & jams (blue) | `open-mic`, `open-jam`, `jazz`, `jams` |
| Gigs & festivals (orange) | `gigs`, `festival`, `concert` |

City-wide items (no single pin): omit **`venueId`** — no “On map” button.

**Weekly agent intake** — `data/live-events-weekly-input.json`:

```json
{
  "events": [
    {
      "approved": true,
      "category": "gigs",
      "date": "12 Jun",
      "title": "Example gig",
      "venue": "Paradiso",
      "line": "Listing line",
      "href": "https://www.paradiso.nl/en",
      "desc": "Optional detail"
    }
  ]
}
```

Only rows with **`approved: true`** (or missing `approved`, treated as approved) merge on build.

---

## Map ↔ feed linking (required pattern)

1. Every venue on the map has numeric **`id`** in `music-venues.json` (and API).
2. Feed rows for that venue include **`venueId`** matching that `id`.
3. UI builds map URL: `live-music-finder.html?venue={venueId}`.
4. Map **`applyDeepLinkVenue()`** clears filters, calls **`selectVenue(id)`**, zooms + opens popup.

**Where links appear**

- Ticker spotlight cards: **View on Live Music Map**
- What's on grid: **📍 On map** (+ **Source ↗** for external listing)
- Map header: links to ticker + event listings

**Adding a new linked venue**

1. Add venue to `data/music-venues.json` (or POST `/api/music-venues`, note returned `id`).
2. Add event row(s) in `live-events-seeds.json` with same **`venueId`**.
3. `npm run build:live-events-feed` → commit feed JSON → test `?venue=` URL.

---

## Map page behaviour (do not break)

- **D3 map** centred on Amsterdam; genre filters + sidebar list.
- **`selectVenue(id)`** — zoom, popup, highlight marker.
- **Popup:** verification badge, vibes, maps link, lazy YouTube, inquiry form → `/api/music-venue-inquiries`.
- **Music guide** panel → `POST /api/music-guide/ask` (optional LLM via env).
- **Suggest venue** modal → POST `/api/music-venues`.
- Venue fields: `verificationStatus`, `lastVerified`, `contactEmail`, `vibeTags`, `mapsUrl`, `youtubeVideos`.

---

## Agent workflows (low maintenance)

| Agent | Input | Output | Human step |
|-------|--------|--------|------------|
| **Venue finder** | Web / lists | Update `music-venues.json` or admin | Verify pin + contact |
| **Events scout** | I amsterdam, Eventbrite, venue sites | `live-events-candidates.json` | Approve → seeds or weekly input |
| **Artist spotlight** (later) | YouTube / uploads | Wix media + metadata | Curate on Wix |

**Preferred external sources (Amsterdam):** I amsterdam calendar, venue own URLs, Eventbrite/Bandsintown (API + approval). Avoid brittle scrapers early.

---

## Common tasks (checklists)

### Add a curated event with map pin

- [ ] Confirm venue exists and note `id`
- [ ] Add event to `live-events-seeds.json` with `venueId`, `category`, `spotlight` if needed
- [ ] `npm run build:live-events-feed`
- [ ] Test ticker card + `live-music-finder.html?venue={id}`
- [ ] Commit `live-events-feed.json` if deploying

### Add city-wide gig (no map button)

- [ ] Add row **without** `venueId`, category `gigs` or `festival`
- [ ] Rebuild feed

### New HTML / Wix page in this product

- [ ] Reuse ticker CSS patterns from `live-events-ticker.html` or `Events Ticker W2W .html`
- [ ] Load feed via `../data/live-events-feed.json` and `/data/live-events-feed.json`
- [ ] `wix-html-scroll` meta if embedded
- [ ] Link back to map + sibling pages in nav

### Troubleshooting empty ticker / updates

- [ ] Not using `file://` — use localhost or Render
- [ ] `data/live-events-feed.json` exists (run build)
- [ ] Server running (`npm start`)

---

## Related project docs

- `AGENTS.md` — key paths table (Live Music Finder rows)
- `Skills/energy-dashboard-skill.md` — deals/events ticker patterns (`build:deals-feed` analogue)
- `WIX-SCROLL-FIX.md` — iframe height / scroll
- `config-template.env` — `MUSIC_*`, `SMTP_*`, `MUSIC_GUIDE_*`

---

## NPM scripts (reference)

```json
"build:live-events-feed": "node scripts/build-live-events-feed.js",
"build:live-music-finder": "node scripts/build-live-music-finder-html.js",
"import:music-venues": "node scripts/import-music-venues.js"
```
