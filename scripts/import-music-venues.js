/**
 * Import live-music venues from CSV into data/music-venues.json
 *
 * Expected CSV columns (header row, case-insensitive):
 *   venue | genre / format | day / time | address | contact / source
 *
 * Usage:
 *   node scripts/import-music-venues.js [path/to/venues.csv]
 *   npm run import:music-venues
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_JSON = 'data/music-venues.json';
const DEFAULT_CSV = 'data/music-venues-seed.csv';

const AMSTERDAM = { lng: 4.9041, lat: 52.3676 };

const GENRE_COLORS = {
  jazz: '#c45e0a',
  'open-mic': '#e9c46a',
  'open-jam': '#2a9d8f',
  'gypsy-swing': '#f4845f',
  mixed: '#6c91c2',
  'live-music': '#8ecae6',
  other: '#aaa',
};

function parseCsv(content) {
  const rows = [];
  let i = 0;
  let field = '';
  let row = [];
  let inQuotes = false;
  while (i < content.length) {
    const char = content[i];
    if (inQuotes) {
      if (char === '"') {
        if (content[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += char;
      i++;
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (char === ',') {
      row.push(field.trim());
      field = '';
      i++;
      continue;
    }
    if (char === '\r') {
      i++;
      continue;
    }
    if (char === '\n') {
      row.push(field.trim());
      rows.push(row);
      row = [];
      field = '';
      i++;
      continue;
    }
    field += char;
    i++;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field.trim());
    rows.push(row);
  }
  return rows;
}

function normalizeGenre(text) {
  const v = (text || '').toLowerCase();
  if (v.includes('gypsy') || v.includes('swing')) return 'gypsy-swing';
  if (v.includes('open jam')) return 'open-jam';
  if (v.includes('open mic')) return 'open-mic';
  if (v.includes('jazz')) return 'jazz';
  if (v.includes('mixed')) return 'mixed';
  if (v.includes('live music')) return 'live-music';
  return 'other';
}

function pickCoords(address, index) {
  const a = (address || '').toLowerCase();
  const known = [
    { match: 'weesperstraat 105', lng: 4.9056, lat: 52.361 },
    { match: 'rhoneweg 6', lng: 4.8268, lat: 52.3867 },
    { match: 'piet heinkade 3', lng: 4.9136, lat: 52.3731 },
    { match: 'czaar peterstraat', lng: 4.929, lat: 52.363 },
    { match: 'kloveniersburgwal', lng: 4.8992, lat: 52.3698 },
    { match: 'utrechtsestraat', lng: 4.8935, lat: 52.3595 },
    { match: 'eerste helmersstraat', lng: 4.8725, lat: 52.3662 },
    { match: 'plantage middenlaan', lng: 4.9128, lat: 52.3668 },
    { match: 'timorplein', lng: 4.9276, lat: 52.3663 },
    { match: 'piratenweg', lng: 4.8912, lat: 52.4012 },
    { match: 'haarlemmerstraat', lng: 4.8931, lat: 52.3784 },
    { match: 'cruquiusweg', lng: 4.9352, lat: 52.3648 },
    { match: 'amstelvlietstraat', lng: 4.934, lat: 52.352 },
  ];
  for (const k of known) {
    if (a.includes(k.match)) return { lng: k.lng, lat: k.lat };
  }
  const jitter = (index % 7) * 0.008 - 0.024;
  return {
    lng: AMSTERDAM.lng + jitter,
    lat: AMSTERDAM.lat + (index % 5) * 0.006 - 0.012,
  };
}

function isUrl(value) {
  return /^https?:\/\//i.test((value || '').trim());
}

function loadCsvRows(filePath) {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`CSV not found: ${abs}`);
  }
  const raw = fs.readFileSync(abs, 'utf8');
  const rows = parseCsv(raw);
  if (!rows.length) return [];
  const header = rows[0].map((h) => h.toLowerCase().replace(/\s+/g, ' ').trim());
  const dataRows = rows.slice(1).filter((r) => r.length && r.some((x) => (x || '').trim().length));
  return dataRows.map((r) => {
    const rec = {};
    for (let i = 0; i < header.length; i++) {
      rec[header[i]] = (r[i] ?? '').trim();
    }
    return rec;
  });
}

function readExisting() {
  const outAbs = path.join(process.cwd(), OUTPUT_JSON);
  if (!fs.existsSync(outAbs)) {
    return { items: [], meta: {} };
  }
  const parsed = JSON.parse(fs.readFileSync(outAbs, 'utf8'));
  return {
    items: Array.isArray(parsed.items) ? parsed.items : [],
    meta: parsed.meta || {},
  };
}

function toVenue(rec, index) {
  const name =
    rec.venue ||
    rec['venue name'] ||
    rec.name ||
    rec.organisation ||
    '';
  const format = rec['genre / format'] || rec.genre || rec.format || '';
  const schedule = rec['day / time'] || rec.schedule || rec['day/time'] || '';
  const address = rec.address || '';
  const contact = rec['contact / source'] || rec.contact || rec.source || rec.url || '';
  const genre = normalizeGenre(format);
  const { lng, lat } = pickCoords(address, index);
  const city = /amsterdam/i.test(address) ? 'Amsterdam' : 'Amsterdam';

  return {
    name,
    genre,
    format,
    schedule,
    address,
    city,
    country: 'Netherlands',
    lng,
    lat,
    desc: format ? `${format}. ${schedule}`.trim() : schedule,
    imageUrl: '',
    url: isUrl(contact) ? contact : '',
    sourceNote: isUrl(contact) ? '' : contact,
  };
}

function uniqueByName(items) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    const key = (it.name || '').toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

function main() {
  const csvPath = process.argv[2] || DEFAULT_CSV;
  const rows = loadCsvRows(csvPath);
  const imported = rows.map((r, i) => toVenue(r, i)).filter((v) => v.name);
  const importedUnique = uniqueByName(imported);

  const existing = readExisting();
  const existingByName = new Map(existing.items.map((it) => [(it.name || '').toLowerCase(), it]));

  const merged = existing.items.slice();
  for (const it of importedUnique) {
    const key = it.name.toLowerCase();
    if (existingByName.has(key)) continue;
    merged.push(it);
  }

  let maxId = merged.reduce((m, it) => Math.max(m, Number(it.id) || 0), 0);
  for (const it of merged) {
    if (it.id == null) {
      maxId += 1;
      it.id = maxId;
      if (!it.color) it.color = GENRE_COLORS[it.genre] || GENRE_COLORS.other;
    }
  }

  const payload = {
    updatedAt: new Date().toISOString(),
    meta: {
      ...existing.meta,
      title: 'Live Music Finder For Artists',
      defaultCity: 'Amsterdam',
      defaultCountry: 'Netherlands',
      mapCenter: AMSTERDAM,
    },
    items: merged,
  };

  const outAbs = path.join(process.cwd(), OUTPUT_JSON);
  fs.writeFileSync(outAbs, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Imported ${importedUnique.length} venue(s) from ${csvPath} → ${OUTPUT_JSON} (total: ${merged.length})`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error('Import failed:', err.message);
    process.exit(1);
  }
}

module.exports = { normalizeGenre, toVenue, pickCoords };
