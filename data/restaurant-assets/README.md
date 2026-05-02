# Restaurant asset sources

## Wok-To-Walk-Assets.pptx

Local copy (**not tracked in Git** — file is ~200 MB): `Wok-To-Walk-Assets.pptx`

Source: Desktop `Wok To Walk Assets.pptx`.

**GitHub:** Files over 100 MB cannot be pushed to GitHub without [Git Large File Storage (LFS)](https://git-lfs.com/) or an external archive.

## Structured export for dashboards

Tracked file:

- **`wok-to-walk-assets.json`** — regenerated from the deck when the `.pptx` changes.

Fields (schemaVersion `2`, high level):

- `equipment[]` — one row per equipment slide  
  `id`, `slideNumber`, `slug`, `name`, `measurementsSummary`, `utilities[]`, `equipmentIntelligenceType`
- `items[]` — compact list for UI tiles (`id`, `name`, `slideNumber`)
- `slides[]` — raw slide text (for audit / re-parsing)
- `itemsLegacyFlattened[]` — optional flat dump of unique text blocks (legacy)

### Regenerate from PowerPoint

From repo root (PowerPoint must exist at the path below):

```bash
python scripts/extract-pptx-text.py data/restaurant-assets/Wok-To-Walk-Assets.pptx --json-out data/restaurant-assets/wok-to-walk-assets.json
```

Extractor script: `scripts/extract-pptx-text.py` (stdlib only).
