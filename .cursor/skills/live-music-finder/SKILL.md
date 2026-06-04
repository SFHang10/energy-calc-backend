---
name: live-music-finder
description: >-
  Live Music Finder for Artists — Amsterdam venue map, events feed, dual-lane ticker,
  what's-on hub, map deep-links via venueId, music guide and inquiries APIs.
  Use when editing live-music-finder.html, live-events-ticker, live-events-updates,
  music-venues, live-events-seeds, build:live-events-feed, or Wix music finder embeds.
---

# Live Music Finder

Read **`Skills/live-music-finder-skill.md`** (UI/data). For **auto-populating** venues, events, and media: **`Skills/live-music-discovery-scout.md`** → `npm run merge:music-discovery`.

## Quick rules

1. **Never test with `file://`** — use `npm start` → `http://localhost:4000/HTMLS%20GWM%20GWB/...`
2. **Events data:** edit `data/live-events-seeds.json` → `npm run build:live-events-feed` → commit `data/live-events-feed.json`
3. **Discovery (full info):** venue + event + media queues — **`Skills/live-music-discovery-scout.md`** → `npm run merge:music-discovery`
4. **Media only:** `data/music-media-candidates.json` → **`Skills/live-music-media-scout.md`**
5. **Map link:** feed rows need `"venueId": <music-venues id>` → UI opens `live-music-finder.html?venue={id}`
6. **Ticker lanes:** blue = open-mic/open-jam/jazz; orange = gigs/festival/concert — match `Events Ticker W2W` styling; embed `?embed=1`
7. **Venues:** `data/music-venues.json` + `/api/music-venues`; guide `POST /api/music-guide/ask`; inquiries `POST /api/music-venue-inquiries`

## Key paths

| Page | File |
|------|------|
| **Hub** | `HTMLS GWM GWB/live-music-hub.html` |
| Map | `HTMLS GWM GWB/live-music-finder.html` |
| Ticker | `HTMLS GWM GWB/live-events-ticker.html` |
| Listings | `HTMLS GWM GWB/live-events-updates.html` |

Full detail: **`Skills/live-music-finder-skill.md`**
