# Restaurant asset sources

Large vendor decks (**not** tracked here) belong on your Desktop, cloud drive, or Git LFS if you truly need version control.

## Extract only (recommended)

Keep the `.pptx` outside the repo. When you want structured data for a dashboard sprint, run locally and write JSON **anywhere convenient** (or under this folder—it will stay untracked):

```bash
python scripts/extract-pptx-text.py "C:/Users/you/Desktop/Wok To Walk Assets.pptx" --json-out data/restaurant-assets/wok-to-walk-assets.json
```

- **Git ignores** `data/restaurant-assets/*.pptx` and `data/restaurant-assets/wok-to-walk-assets.json` so nothing huge or regenerable is committed accidentally.
- The **tooling** lives in-repo: `scripts/extract-pptx-text.py` (stdlib only).

### JSON shape (quick reference)

`schemaVersion: 2` output includes:

- `equipment[]` — parsed rows (`name`, `measurementsSummary`, `utilities`, `equipmentIntelligenceType`, …)
- `items[]` — compact `{ id, name, slideNumber }` for tiles
- `slides[]` — raw slide text audit trail
