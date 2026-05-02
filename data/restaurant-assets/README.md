# Restaurant asset sources

Large vendor decks (**not** tracked) can stay on Desktop or cloud. Regenerate structured lists with `scripts/extract-pptx-text.py` when the source changes.

## Tracked slim list (dashboard)

**`wok-to-walk-equipment-list.json`** — small venue inventory (~32 rows) used by:

- `HTMLS GWM GWB/restaurant-equipment-deep-dive.html` — first **6** items as chips, rest in **dropdown**; each row drives the deep dive + alternatives API.
- `HTMLS GWM GWB/equipment_intelligence_tool.html` — same pattern for quick search prefill + deep-dive link.

Served as static JSON when you run the app from repo root (`http://localhost:4000/data/restaurant-assets/wok-to-walk-equipment-list.json`).

### Refresh from PowerPoint

```bash
python scripts/extract-pptx-text.py "C:/path/to/Wok To Walk Assets.pptx" --json-out "%TEMP%/wok-full.json"
python -c "import json, pathlib; p=pathlib.Path(r'%TEMP%/wok-full.json'); d=json.load(open(p,encoding='utf-8')); slim={'schemaVersion':1,'brand':'Wok To Walk','label':'Wok To Walk site equipment','equipment':[{'id':e['id'],'name':e['name'],'slug':e['slug'],'utilities':e.get('utilities',[]),'equipmentIntelligenceType':e.get('equipmentIntelligenceType','other')} for e in d.get('equipment',[])]}; json.dump(slim, open('data/restaurant-assets/wok-to-walk-equipment-list.json','w',encoding='utf-8'), indent=2, ensure_ascii=False)"
```

(Adjust temp path on non-Windows.)

### Still ignored (heavy / regenerable)

- `data/restaurant-assets/*.pptx`
- `data/restaurant-assets/wok-to-walk-assets.json` (full extract dump)
