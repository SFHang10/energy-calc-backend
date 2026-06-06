# Live Music Media Scout

**Skill type:** Research + candidate queue (approve before publish)  
**Purpose:** Propose photos and YouTube clips for jam/open-mic venues without manually editing every `mediaGallery` row  

**Orchestration:** For full venue + event + media population, start with **`Skills/live-music-discovery-scout.md`**. This skill is the **media layer only**.

**Pairs with:** `Skills/live-music-finder-skill.md`, `data/music-media-candidates.json`

---

## When to use

- Scaling Live Music Finder beyond Amsterdam (NL regions, then other countries)
- Batch-filling venue photos / jam videos
- After adding new venues to `music-venues.json` (scout media before sync)

**Do not** hotlink random Google Images or scrape Instagram at scale — use sources below.

---

## Pipeline (same idea as sustainability news + product `persistCatalog`)

```text
1. Discover / propose  →  data/music-media-candidates.json  (approved: false)
2. Human review        →  `music-media-admin.html` (or set `approved: true` in JSON)
3. Merge               →  npm run merge:music-media  →  music-venues.json mediaGallery
4. Sync map fallback   →  npm run sync:music-venues-fallback
```

Optional: `npm run propose:music-media-og` auto-adds **og:image** proposals from each venue `url`.

---

## Candidate row schema

Edit **`data/music-media-candidates.json`**:

```json
{
  "id": "mc-waterhole-yt-001",
  "venueId": 14,
  "venueName": "The Waterhole",
  "type": "youtube",
  "youtubeId": "dQw4w9WgXcQ",
  "title": "Open jam night clip",
  "caption": "",
  "url": "",
  "source": "youtube-search",
  "sourceUrl": "https://www.youtube.com/watch?v=...",
  "region": "Amsterdam",
  "approved": false,
  "proposedAt": "2026-05-28",
  "mergedAt": null,
  "notes": "Verify audio/venue match"
}
```

| Field | Image | YouTube |
|-------|-------|---------|
| `type` | `"image"` | `"youtube"` |
| `url` | Required (https) | — |
| `youtubeId` | — | Required (11-char id) |
| `venueId` | Match `music-venues.json` `id` | Same |
| `approved` | `true` only when ready to merge | Same |

Max **8** gallery items per venue after merge (deduped by URL / video id).

---

## Agent workflow: photos

### A. Venue website (automated proposal)

```bash
npm run propose:music-media-og
npm run propose:music-media-og -- --venue-id=14 --limit=1
```

- Reads each venue `url` or `agendaUrl`
- Fetches HTML, extracts `og:image` / `twitter:image`
- Appends rows with `source: "og-image"`, `approved: false`

**Review:** Check image is the venue (not a generic logo). For production, upload best shot to **Wix Media Manager** and replace `url` with `static.wixstatic.com` before approving.

### B. Wix uploads (manual, preferred for heroes)

1. Upload to Wix Media Manager  
2. Add candidate row with Wix `url`, `source: "wix"`, `approved: true` after check  
3. `npm run merge:music-media`

### C. Licensed / official press

`source: "venue-press"` + `sourceUrl` to the page you found the image on.

---

## Agent workflow: YouTube videos

Use **`Skills/live-music-video-finder.md`** (pilot queries, EN/NL, admin page). Also mirrors **`Skills/sustainability-video-finder.md`**:

1. Run web searches per venue, e.g.  
   `site:youtube.com "Café Engelbewaarder" jazz jam Amsterdam`  
   `site:youtube.com "The Waterhole" open jam Amsterdam`
2. Pick **one** clear jam-room clip per venue (avoid long unrelated concerts).
3. Add candidate rows: `type: "youtube"`, `youtubeId`, `title`, `source: "youtube-search"`, `sourceUrl`.
4. Leave `approved: false` until a human confirms the venue/audio.

**Do not** embed until merged — the map lightbox loads YouTube on tap only.

---

## Agent workflow: new regions (NL / EU)

1. **Venues first** — extend `music-venues.json` or `live-events-candidates.json` (events scout in live-music-finder-skill).  
2. **Media second** — run `propose:music-media-og` for venues with URLs.  
3. **YouTube batch** — one agent pass per city (10–20 search queries → candidate rows).  
4. **Review block** — 30–60 min to approve/reject candidates for that city.  
5. **Merge + sync** — `npm run merge:music-media` && `npm run sync:music-venues-fallback`.

Sources for venue discovery (text): jazzinamsterdam.com, I amsterdam calendar, venue agendas, open-mic directories — same as events scout.

---

## NPM commands

| Command | Action |
|---------|--------|
| `npm run propose:music-media-og` | Probe venue URLs → propose og:image rows |
| `npm run merge:music-media` | Merge `approved: true` → `music-venues.json` + sync fallback |

Dry run:

```bash
node scripts/propose-music-media-og.js --dry-run --limit=3
node scripts/merge-music-media-candidates.js --dry-run
```

Re-merge same candidate: `node scripts/merge-music-media-candidates.js --force` (sets `mergedAt` again).

---

## Review checklist (per candidate)

- [ ] Correct venue (`venueId` / name matches pin on map)
- [ ] Image is in-room or clearly the pub/café (not stock unrelated)
- [ ] YouTube clip shows jam/open-mic vibe (or stage you'd join)
- [ ] Prefer Wix URL for hero images on Wix embeds
- [ ] `approved: true` only when ready

---

## Related files

| File | Role |
|------|------|
| `data/music-media-candidates.json` | Proposal queue |
| `data/music-venues.json` | Published `mediaGallery` + `imageUrl` |
| `scripts/propose-music-media-og.js` | OG image fetcher |
| `scripts/merge-music-media-candidates.js` | Approved → venues |
| `scripts/lib/music-media-gallery.js` | Dedupe / merge helpers |
| `HTMLS GWM GWB/live-music-finder.html` | Photos & videos lightbox |

---

## Explicitly out of scope

- Native iOS/Android apps  
- Instagram/TikTok scraping bots  
- Auto-approve without human review
