# Live Music Video Finder

**Skill type:** Web research + candidate queue (human approve before publish)  
**Pairs with:** `Skills/live-music-media-scout.md`, `Skills/sustainability-video-finder.md`, `data/music-media-candidates.json`  
**Admin page:** `HTMLS GWM GWB/music-media-admin.html`  
**API:** `GET/PATCH /api/music-media-candidates`

---

## Purpose

Find **photos and YouTube clips** for Live Music Finder venue popups — live jams, venue vibe, food/atmosphere — using **web search** (no YouTube API). Proposals land in the candidate queue; you approve on the admin page, then merge into `music-venues.json`.

**Pilot (May 2026):** 5 Amsterdam venues — Bimhuis, The Waterhole, Café Engelbewaarder, Zaal 100, Café de Pianist.

---

## User decisions (locked)

| Topic | Choice |
|-------|--------|
| Approval | **Admin page** (`music-media-admin.html`), not JSON-only |
| Clip types | **All** — live music, venue vibe, food/atmosphere |
| Languages | **English + Dutch** search queries and captions |
| Scope | **5 venues first**, then scale |
| Map UI | **One inline preview** + hint that more exist (gallery button) |
| Discovery | **Web search** like sustainability video finder |

---

## Pipeline

```text
1. Research (this skill)     →  data/music-media-candidates.json  (approved: false)
2. Review                    →  music-media-admin.html  (approve / reject / notes)
3. Merge                     →  npm run merge:music-media
4. Sync map fallback         →  (included in merge script)
```

Optional OG images: `npm run propose:music-media-og`

---

## Target per venue

- **Up to 3** strong items per venue in the queue (merge caps gallery at **8** total).
- Mix **youtube** + **image** when clips are thin.
- Prefer **in-room** footage; reject unrelated concerts or wrong venue.

---

## Search queries (EN + NL)

Run per venue. Use `site:youtube.com` plus venue name variants.

### Bimhuis (id 3)

```
site:youtube.com BIMHUIS Amsterdam live jazz
site:youtube.com "Live at Bimhuis" Amsterdam
site:youtube.com BIMHUIS TV concert Amsterdam
```

### The Waterhole (id 14)

```
site:youtube.com "Amsterdam Jam Collective" Waterhole
site:youtube.com "The Waterhole" Amsterdam open jam
site:youtube.com Waterhole Amsterdam live music bar
```

### Café Engelbewaarder (id 5)

```
site:youtube.com "Engelbewaarder" jazz Amsterdam
site:youtube.com "Café Engelbewaarder" jazzsessie
site:youtube.com Jazzengel Amsterdam zondag jazz
```

### Zaal 100 (id 10)

```
site:youtube.com "Zaal 100" Amsterdam impro jazz
site:youtube.com "Impro Jazzcafé" Zaal 100
site:youtube.com Doek Zaal 100 Amsterdam
```

### Café de Pianist (id 6)

```
site:youtube.com "Cafe De Pianist" Amsterdam jazz
site:youtube.com "Café de Pianist" gypsy jazz Amsterdam
site:youtube.com Casual Acoustics De Pianist Amsterdam
```

---

## Scoring (pick top 3)

| Signal | Points |
|--------|--------|
| Title/description names venue or street | +3 |
| Visible stage / bar / brown café | +2 |
| Jam / open session / live music bar | +2 |
| Official venue or BIMHUIS / Doek channel | +2 |
| Food / borrelplank / café atmosphere (user OK) | +1 |
| Wrong city, pop song homonym, long unrelated gig | −5 |

---

## Candidate row (append to JSON or via future POST)

```json
{
  "id": "mc-waterhole-yt-001",
  "venueId": 14,
  "venueName": "The Waterhole",
  "type": "youtube",
  "youtubeId": "D5g_QWJGwqM",
  "title": "Amsterdam Jam Collective — Monday open jam",
  "caption": "",
  "url": "",
  "source": "youtube-search",
  "sourceUrl": "https://www.youtube.com/watch?v=D5g_QWJGwqM",
  "region": "Amsterdam",
  "language": "en",
  "approved": false,
  "proposedAt": "2026-05-28",
  "mergedAt": null,
  "notes": "Verify Waterhole stage in audio/transcript"
}
```

---

## Admin workflow

1. Open `http://localhost:4000/HTMLS%20GWM%20GWB/music-media-admin.html` (or Render URL).
2. Filter **Pending** → preview YouTube / image links.
3. **Approve** good rows; **Reject** with optional note.
4. Run `npm run merge:music-media`.
5. Refresh map popup — inline preview + **Photos & videos (n)** lightbox.

Also linked from **Music Venues Admin** header.

---

## Map behaviour (after merge)

- Popup shows **first gallery item** inline (thumb).
- If **2+ items**, corner hint **+N more** and button **Photos & videos (n) →**.
- Lightbox: tap-to-play YouTube (lazy load).

---

## Related

| File | Role |
|------|------|
| `data/music-media-candidates.json` | Queue |
| `scripts/merge-music-media-candidates.js` | Approved → venues |
| `HTMLS GWM GWB/live-music-finder.html` | Map + lightbox |
| `Skills/live-music-finder-skill.md` | Map hub context |

---

## Out of scope

- Auto-approve without human review  
- YouTube Data API quota setup  
- Non-map venue types (events ticker uses separate feeds)
