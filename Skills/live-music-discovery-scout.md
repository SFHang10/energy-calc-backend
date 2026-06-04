# Live Music Discovery Scout (master)

**Skill type:** End-to-end research → candidate queues → approve → publish  
**Purpose:** Populate **as much jam/open-mic information as possible** (venue profile, session detail, listings, photos, video) for NL and beyond — same **draft → review → merge** model as sustainability news and the sustainable product finder.  
**Use this skill first** for regional expansion; use child skills for deep dives on one layer.

---

## When to use

- “Find jams in [city/region]”
- “Fill in missing info on venues”
- “Auto-populate the music map like the newsletter”
- Batch work before a country/region launch

**Always:** propose with `approved: false` → human review → merge commands.  
**Never:** publish unreviewed rows directly to `music-venues.json` or `live-events-seeds.json`.

---

## Three candidate queues (one pipeline)

| Queue | File | What it holds | Merge command |
|-------|------|---------------|---------------|
| **Venue profile** | `data/music-venue-candidates.json` | Pin, address, schedule, jam copy, contact, vibes, coords | `npm run merge:music-venues` |
| **Media** | `data/music-media-candidates.json` | Photos (Wix/og:image), YouTube clips | `npm run merge:music-media` |
| **Events / listings** | `data/live-events-candidates.json` | Ticker + “What’s on” rows (`venueId` link) | `npm run merge:live-events-candidates` |

**All approved queues at once:**

```bash
npm run merge:music-discovery
```

Dry-run:

```bash
node scripts/merge-music-discovery.js --dry-run
```

---

## Field coverage — “as much info as possible”

Agents should try to fill every column the map popup and feed use. **Enrich** mode only overwrites **empty** fields unless `overwrite: true` or `overwriteFields: ["desc","schedule"]`.

### Venue profile (`music-venue-candidates.json`)

| Field | User sees it as | Agent sources |
|-------|-----------------|---------------|
| `name` | Pin title | Venue site, directories |
| `genre` | Filter chip | `open-jam`, `open-mic`, `jazz`, `gypsy-swing`, … |
| `format` | Orange popup line | “Sunday jazz jam”, “Open mic + band” |
| `schedule` | Green When row | Agenda / directory |
| `sessionTime` | Green Hours | e.g. `20:00–22:00` |
| `recurrence` | Green Repeats | e.g. `Every Sunday` |
| `nextSession` | Green Starts | First known date |
| `signUpNotes` | Feel block | Sign-up, arrival, gear |
| `entryCost` | Feel block | Free / drinks only |
| `skillLevel` | Feel block | Welcoming / intermediate |
| `jamDetails` | Feel block | Sit-in rules, house band |
| `address`, `city`, `country` | Location | Official address |
| `lng`, `lat` | Map pin | Geocode / Maps |
| `desc` | Main blurb | 2–4 sentences, musician-focused |
| `url`, `agendaUrl` | Blue links | Canonical site |
| `contactEmail`, `phone` | Contact | Listed contact only |
| `instagramUrl` | Contact | Public profile URL |
| `mapsUrl` | Blue Maps link | Google Maps search URL |
| `vibeTags` | Chips | 3–6 tags |
| `imageUrl` | Hero thumb | Wix upload preferred |
| `verificationStatus`, `lastVerified` | Trust line | Set `unverified` + today on new rows |

Detail skill for photos/video: **`Skills/live-music-media-scout.md`**.

### Events row (`live-events-candidates.json`)

| Field | Purpose |
|-------|---------|
| `title`, `line`, `date`, `category` | Ticker + listings |
| `venue`, `venueId` | **Required** for map button |
| `desc` | Spotlight cards |
| `href`, `webUrl`, `email`, `phone` | External + contact |
| `spotlight`, `isNew`, `newHint` | Ticker prominence |
| `imageUrl` | Optional card photo (or from venue) |

### Media (`music-media-candidates.json`)

See **`live-music-media-scout.md`**. Run `npm run propose:music-media-og` after venue URLs exist.

---

## Agent runbook (per city or region)

### 1. Discover sessions (text)

Sources (in order):

1. Regional jazz/open-mic directories (e.g. jazzinamsterdam.com for NL capital)
2. I amsterdam / local tourism calendars
3. Venue agenda pages
4. Eventbrite / Bandsintown (verify jam vs one-off gig)

Output: draft rows in **`live-events-candidates.json`** and/or **`music-venue-candidates.json`**.

### 2. Build or enrich venue profiles

**New venue** — `mode: "create"`:

```json
{
  "id": "vc-utrecht-example-001",
  "mode": "create",
  "approved": false,
  "proposedAt": "2026-05-28",
  "source": "directory",
  "sourceUrl": "https://…",
  "region": "Utrecht",
  "venue": {
    "name": "Example Café",
    "genre": "jazz",
    "format": "Sunday jazz jam",
    "schedule": "Sundays 17:00–21:00",
    "sessionTime": "17:00–21:00",
    "recurrence": "Every Sunday",
    "address": "Oudegracht 1, Utrecht",
    "city": "Utrecht",
    "country": "Netherlands",
    "lng": 5.12,
    "lat": 52.09,
    "desc": "…",
    "url": "https://…",
    "vibeTags": ["jazz-club", "sit-in"]
  },
  "event": {
    "id": "jam-utrecht-example-sun",
    "category": "jazz",
    "date": "Sundays",
    "title": "Sunday Jazz Jam",
    "line": "17:00–21:00 · centre",
    "venue": "Example Café",
    "venueId": null,
    "desc": "…",
    "href": "https://…",
    "spotlight": true,
    "isNew": false
  }
}
```

After merge, set `event.venueId` to returned `mergedVenueId` on next pass or fix in seeds manually.

**Existing venue** — `mode: "enrich"`, `venueId: 5`:

```json
{
  "id": "vc-engel-enrich-001",
  "mode": "enrich",
  "venueId": 5,
  "approved": false,
  "venue": {
    "sessionTime": "16:30–20:00",
    "jamDetails": "…",
    "signUpNotes": "…"
  }
}
```

Use `"overwrite": true` only when correcting bad data after verification.

### 3. Propose media

```bash
npm run propose:music-media-og
```

Add YouTube candidates manually (see media scout skill).

### 4. Human review (short checklist)

- [ ] Pin location correct
- [ ] Schedule matches venue site
- [ ] Musician-useful copy (not marketing fluff only)
- [ ] `venueId` on events matches map
- [ ] Photos/videos show the room or jam
- [ ] Set `approved: true` on good rows only

### 5. Publish

```bash
npm run merge:music-discovery
```

Test: `live-music-finder.html?venue={id}`, hub, ticker.

### 6. Manual polish

Add Wix images, fix edge cases, set `isNew` on new sessions — normal editorial pass.

---

## NPM reference

| Command | When |
|---------|------|
| `npm run propose:music-media-og` | After venues have `url` — propose og:image rows |
| `npm run merge:music-venues` | Approved venue candidates only |
| `npm run merge:music-media` | Approved media + sync map fallback |
| `npm run merge:live-events-candidates` | Approved events → seeds + rebuild feed |
| `npm run merge:music-discovery` | **All three** + map sync |
| `npm run build:live-events-feed` | After hand-editing seeds |
| `npm run sync:music-venues-fallback` | After hand-editing venues |

---

## Child skills

| Skill | Scope |
|-------|--------|
| **`Skills/live-music-finder-skill.md`** | UI, Wix embeds, map behaviour, feed schema |
| **`Skills/live-music-media-scout.md`** | Photos + YouTube only |
| **This file** | Full discovery orchestration |

---

## Scaling NL → EU

1. One **region per agent run** (e.g. Rotterdam, then Utrecht).  
2. Cap ~15–25 venues per batch for review quality.  
3. Reuse enrich mode for Amsterdam gaps instead of re-creating pins.  
4. Commit `music-venues.json`, `live-events-seeds.json`, `live-events-feed.json` after merge.

---

## Out of scope

- Native mobile apps  
- Fully unattended publish (no review)  
- Instagram scraping bots
