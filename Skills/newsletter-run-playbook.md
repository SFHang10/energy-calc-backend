# Newsletter run playbook

**Skill type:** Staff operations (Administrator)  
**Trigger:** *“Run newsletter”*, *“publish newsletter”*, *“newsletter pipeline”*, *“rebuild agent news from edition”*  
**Orchestrator:** `Skills/SKILL-ORCHESTRATOR.md` → this file  
**Related:** `Skills/sustainability-news-finder.md` · `Skills/tech-news-finder.md` · `Skills/content-operations.md` · `Skills/agents-data-refresh-playbook.md`  
**Command:** `npm run run:newsletter`  
**Last updated:** 17 Aug 2026

---

## Purpose

One repeatable path from **monthly HTML editions** (Sustainability News **and** New in Tech, same month) → **agent-ready JSON** so Cheryce and Vincent feel live without manual copy-paste.

```text
Draft BOTH HTML + sources.md (same YYYY-MM)  →  review/  →  npm run run:newsletter -- --publish  →  git push  →  Render
```

**Rule:** Never publish one newsletter without the other — both must share the same `YYYY-MM` and sit in `review/` before `--publish`.

Agents **never write** at runtime. Staff (or cron) publishes; agents read generated files.

---

## Say “Run newsletter” — what happens

| Mode | Command | Does |
|------|---------|------|
| **Checklist** (default) | `npm run run:newsletter` | Looking Ahead report, gap warnings, pipeline preview |
| **Validate** | `npm run run:newsletter -- --validate` | Fail if either edition missing, month mismatch, or not in review |
| **Publish** | `npm run run:newsletter -- --publish` | Full rebuild + smokes (both editions required) |
| **Watchlist only** | `npm run run:newsletter -- --watchlist` | `data/newsletter-looking-ahead-watchlist.json` |

### Publish pipeline (automatic)

1. **Looking Ahead watchlist** — `data/newsletter-looking-ahead-watchlist.json` (both editions)
2. **Cheryce daily brief** — `data/media-daily-brief.json` (sustainability stories + **techStories**)
3. **Vincent daily review** — `data/finance-daily-review.json`
4. **Vincent finance news feed** — `data/finance-news-feed.json`
5. **Agent highlights** — `data/greenways-agent-highlights.json` (sidebar “This week”)
6. **Smoke** — `npm run smoke:agents-ask`

### Manual (still required)

- Draft research → HTML in `content-ops/drafts/`
- **Carry-forward table** in `*-sources.md` (see below)
- Move approved files to `content-ops/review/`
- Wix catalog + image uploads when the public site listing changes
- `git commit` → push → `/health`

---

## Looking Ahead continuity (important)

Every sustainability and tech edition has a **`#upcoming`** section titled **Looking Ahead** — upcoming dates and milestones.

### When drafting the *next* month

1. Open the **previous edition** HTML → scroll to **Looking Ahead**.
2. In the new `*-sources.md`, add a carry-forward table:

```markdown
## May → June continuity (covered in this edition)

| May "Looking Ahead" item | June coverage |
|--------------------------|---------------|
| Late Q2 2026 — Energy Omnibus labelling proposal | Lead story — published 24 June 2026 |
| Q3 2026 — Circular Economy Act proposal | Policy section + Looking Ahead |
| 31 August 2026 — CBAM declaration | Top story (~2 months remaining) |
```

3. Weave covered items into narrative (exec summary, top stories, or policy).
4. Items still open stay in the new **Looking Ahead** list or roll forward with an updated date.

`npm run run:newsletter` compares prior **Looking Ahead** bullets to this table and warns on gaps.

---

## Edition file locations

| Edition | Draft / review HTML | Sources |
|---------|---------------------|---------|
| Sustainability News | `content-ops/…/YYYY-MM-sustainability-news.html` | `…-sources.md` |
| New in Tech | `content-ops/…/YYYY-MM-new-in-tech.html` | `…-sources.md` |

**Publish reads `review/` first**, then `drafts/`. Latest `YYYY-MM` wins.

Templates: `content-ops/drafts/sustainability-news/TEMPLATE_*.html`

---

## Agent outputs (what gets fresh)

| Agent | Generated file | Source |
|-------|----------------|--------|
| **Cheryce** | `media-daily-brief.json` | Latest review HTML + news catalogue |
| **Cheryce** | Chat `/ask` news intents | Same catalogue via `media-news-loader.js` |
| **Vincent** | `finance-daily-review.json` | Ticker + news brief |
| **Vincent** | `finance-news-feed.json` | Edition stories + Looking Ahead (policy/funding lens) |
| **Edwardo** (planned) | `systems-tech-news-feed.json` | New in Tech edition + Looking Ahead — **how new tech helps sustainability** (monitoring, sensors, dashboards). Page not built yet; interim module `tech-news-edition` / planned `systems-tech-news`. |
| **All seven** | `greenways-agent-highlights.json` | Grounded `/ask` snapshot (weekly nudge) |

Optional LLM polish for Vincent daily review: `FINANCE_DAILY_REVIEW_LLM=1` on the build host.

### Edwardo tech round-up (planned — do not build yet)

Same pipeline as Vincent’s finance news:

| Vincent (live) | Edwardo (planned) |
|----------------|-------------------|
| `data/finance-news-feed.json` | `data/systems-tech-news-feed.json` |
| `/greenways/finance-news` | `/greenways/systems-tech-news` (or module `systems-tech-news`) |
| Policy / funding / prices lens | **How new tech could help sustainability** — measure, control, prove savings |
| Source: Sustainability News + ticker | Source: **New in Tech** edition + Looking Ahead |

Until that page exists: Cheryce owns the monthly HTML; Edwardo’s briefing and module `tech-news-edition` already point him at the same edition with a systems lens. Add `build:systems-tech-news-feed` to `run:newsletter -- --publish` when the page is built.

---

## Standard monthly workflow

### Phase A — Research & draft (human + finder skills)

1. Run **`sustainability-news-finder.md`** and **`tech-news-finder.md`** for the **same month** (or say *“draft July newsletters”*).
2. Check **prior Looking Ahead** + carry-forward tables in **both** `*-sources.md` files.
3. Save to `content-ops/drafts/sustainability-news/` (both HTML files use this drafts folder).
4. **Hero photos:** pick 3 images **different from last month** — see `hero-photo-pool.json` + `data/newsletter-hero-rotation.json`. Quick scaffold: `npm run scaffold:newsletter-edition -- --month 2026-07 --from 2026-06`

### Phase B — Review

1. Fact-check both editions; Wix image URLs.
2. Move to **`content-ops/review/sustainability-news/`** and **`content-ops/review/new-in-tech/`**.
3. `npm run run:newsletter -- --validate` (must show paired month + both in review)

### Phase C — Publish to agents

```bash
npm run run:newsletter -- --publish
git add data/media-daily-brief.json data/finance-daily-review.json data/finance-news-feed.json data/newsletter-looking-ahead-watchlist.json data/greenways-agent-highlights.json
git commit -m "Publish newsletter feeds for [YYYY-MM]"
git push
```

Spot-check: `/greenways/media-agent`, `/greenways/finance-agent`, `/greenways/finance-news`

---

## Automation (cron)

On Render, enable the in-process daily build on the **web service**:

```bash
GREENWAYS_FINANCE_DAILY_CRON_ENABLED=1
GREENWAYS_FINANCE_DAILY_CRON=0 6 * * *
```

This runs `npm run build:finance-daily` at 06:00 UTC (EU/EIB auto-publish + RVO queue upsert + merge approved + daily review).

**NL headlines:** RVO rows land in `data/finance-headline-candidates.json` — approve at `/greenways/finance-headlines-admin`, then `npm run merge:finance-headlines` (included in `build:finance-daily`).

For monthly newsletter editions, schedule after staff drops files in `review/`:

```bash
npm run run:newsletter -- --validate && npm run run:newsletter -- --publish
```

Daily (without new edition): `npm run build:finance-daily` — EU/EIB RSS + RVO queue + Vincent wire brief + finance news feed refresh.

Weekly: `npm run refresh:agents-weekly` — deals + highlights (independent of newsletter).

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| “Missing #upcoming” | Add `<section id="upcoming">` with Looking Ahead list in HTML |
| “Still in drafts” | Move to `content-ops/review/` before `--publish` |
| Prior ahead items flagged | Add/update carry-forward table in `*-sources.md` |
| Edition mismatch on publish | Ensure `YYYY-MM-sustainability-news` and `YYYY-MM-new-in-tech` share the same month |
| Tech brief empty | Move tech HTML to `content-ops/review/new-in-tech/` and re-run publish |
| Cheryce shows old edition | Confirm review path; run `build:media-daily-brief` |

---

## Success criteria

- [ ] **Both** Sustainability + New in Tech in `review/` for the **same YYYY-MM**
- [ ] Looking Ahead present; sources.md carry-forward table filled
- [ ] `npm run run:newsletter -- --publish` exits 0
- [ ] Cheryce spot-check shows **both** edition modules; Vincent wire/finance news updated
- [ ] Pushed to Render; `/health` OK

---

**Edwardo verify:** `news` check in `/api/systems-agent/status` reflects catalogue freshness after deploy.
