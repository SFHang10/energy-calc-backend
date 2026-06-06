/* 
  Import sustainability organisations from CSVs into data/companies.json
  - Merges two CSV files
  - Normalizes fields to current map schema
  - Assigns lng/lat using country or region centroids (approximate)
  - Leaves imageUrl empty for later enrichment
  - Avoids duplicates by Organisation name (case-insensitive)
*/

const fs = require('fs');
const path = require('path');

// INPUT FILES (Windows absolute paths are supported, but we also resolve relative to repo)
const INPUT_FILES = [
  'HTMLS GWM GWB/200_sustainability_organisations.csv',
  'HTMLS GWM GWB/200_more_sustainability_organisations.csv',
];

const OUTPUT_JSON = 'data/companies.json';

// Minimal CSV parser supporting quoted fields with commas and embedded quotes
function parseCsv(content) {
  const rows = [];
  let i = 0, field = '', row = [], inQuotes = false;
  while (i < content.length) {
    const char = content[i];
    if (inQuotes) {
      if (char === '"') {
        // Lookahead for escaped quote
        if (content[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        field += char;
        i++;
        continue;
      }
    } else {
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
  }
  // Push last field/row if file doesn't end with newline
  if (field.length > 0 || row.length > 0) {
    row.push(field.trim());
    rows.push(row);
  }
  return rows;
}

// Basic normalization helpers
function normalizeSector(value) {
  if (!value) return 'other';
  const v = value.toLowerCase();
  if (v.includes('hospitality')) return 'hospitality';
  if (v.includes('health')) return 'healthcare';
  if (v.includes('retail')) return 'retail';
  if (v.includes('leisure')) return 'leisure';
  if (v.includes('insulation')) return 'insulation';
  if (v.includes('office')) return 'office';
  if (v.includes('education')) return 'education';
  if (v.includes('transport')) return 'transport';
  if (v.includes('solar')) return 'solar';
  if (v.includes('wind')) return 'wind';
  if (v.includes('battery')) return 'battery';
  if (v.includes('water')) return 'water';
  if (v.includes('waste')) return 'waste';
  if (v.includes('agri')) return 'agriculture';
  if (v.includes('carbon')) return 'carbon';
  if (v.includes('finance')) return 'finance';
  if (v.includes('city') || v.includes('urban')) return 'urban';
  return v.replace(/\s+/g, '-');
}

// Country and region centroids (approximate)
const CENTROIDS = {
  // Regions
  'Global': { lng: 0, lat: 20 },
  'Europe': { lng: 10, lat: 50 },
  'North America': { lng: -100, lat: 45 },
  'South America': { lng: -58, lat: -15 },
  'Africa': { lng: 20, lat: 5 },
  'East Africa': { lng: 36, lat: 0 },
  'West Africa': { lng: -1, lat: 8 },
  'Asia': { lng: 90, lat: 30 },
  'Southeast Asia': { lng: 105, lat: 5 },
  'Oceania': { lng: 135, lat: -25 },
  'Middle East': { lng: 45, lat: 25 },

  // Countries (add as needed)
  'UK': { lng: -1.5, lat: 52.5 },
  'United Kingdom': { lng: -1.5, lat: 52.5 },
  'Netherlands': { lng: 5.3, lat: 52.1 },
  'France': { lng: 2.3, lat: 46.6 },
  'Germany': { lng: 10.4, lat: 51.2 },
  'Italy': { lng: 12.5, lat: 41.9 },
  'Spain': { lng: -3.7, lat: 40.4 },
  'Portugal': { lng: -8.2, lat: 39.4 },
  'Belgium': { lng: 4.5, lat: 50.5 },
  'Ireland': { lng: -8.2, lat: 53.3 },
  'Sweden': { lng: 18.0, lat: 59.3 },
  'Denmark': { lng: 10.2, lat: 56.0 },
  'Norway': { lng: 10.7, lat: 59.9 },
  'Switzerland': { lng: 8.2, lat: 46.8 },
  'Austria': { lng: 14.5, lat: 47.5 },
  'Poland': { lng: 19.1, lat: 52.2 },
  'USA': { lng: -98.35, lat: 39.5 },
  'United States': { lng: -98.35, lat: 39.5 },
  'Canada': { lng: -106.3468, lat: 56.1304 },
  'Mexico': { lng: -102, lat: 23.6 },
  'Brazil': { lng: -51.9, lat: -14.2 },
  'Argentina': { lng: -64, lat: -34 },
  'Chile': { lng: -71, lat: -33 },
  'Colombia': { lng: -73, lat: 4.6 },
  'Peru': { lng: -75, lat: -9.2 },
  'Kenya': { lng: 37.9, lat: -0.02 },
  'Rwanda': { lng: 29.9, lat: -1.94 },
  'Uganda': { lng: 32.29, lat: 0.35 },
  'Tanzania': { lng: 34.9, lat: -6.36 },
  'South Africa': { lng: 24, lat: -29 },
  'Nigeria': { lng: 8.7, lat: 9.1 },
  'Ghana': { lng: -1.02, lat: 7.95 },
  'Ethiopia': { lng: 40.5, lat: 9.15 },
  'Morocco': { lng: -7.1, lat: 31.8 },
  'Egypt': { lng: 30.8, lat: 26.8 },
  'Saudi Arabia': { lng: 45, lat: 23.9 },
  'UAE': { lng: 54.4, lat: 23.4 },
  'Qatar': { lng: 51.2, lat: 25.3 },
  'Turkey': { lng: 35.2, lat: 39.1 },
  'Israel': { lng: 35, lat: 31.4 },
  'India': { lng: 78.96, lat: 20.59 },
  'Pakistan': { lng: 69.35, lat: 30.38 },
  'Bangladesh': { lng: 90.35, lat: 23.68 },
  'Nepal': { lng: 84.1, lat: 28.4 },
  'Myanmar': { lng: 95.96, lat: 21.91 },
  'Thailand': { lng: 100.99, lat: 15.87 },
  'Vietnam': { lng: 108.3, lat: 14.1 },
  'Malaysia': { lng: 102.3, lat: 4.2 },
  'Singapore': { lng: 103.82, lat: 1.35 },
  'Indonesia': { lng: 113.9, lat: -0.8 },
  'Philippines': { lng: 121.77, lat: 12.88 },
  'China': { lng: 104.2, lat: 35.9 },
  'Japan': { lng: 138, lat: 37 },
  'South Korea': { lng: 127.98, lat: 36.5 },
  'Australia': { lng: 133.78, lat: -25.27 },
  'New Zealand': { lng: 174.89, lat: -41.28 },
  'Russia': { lng: 105, lat: 61.5 },
  'Ukraine': { lng: 31.2, lat: 48.4 },
};

function deriveRegion(countryOrRegionRaw) {
  if (!countryOrRegionRaw) return 'Global';
  const text = countryOrRegionRaw.trim();
  // If a composite like "USA/Global" or "USA/Peru", split on / and take first as country, second as region fallback
  const slashParts = text.split('/');
  const primary = slashParts[0].trim();
  const secondary = slashParts[1]?.trim();

  // Known region keywords
  const lowered = text.toLowerCase();
  if (lowered.includes('africa')) return lowered.includes('west') ? 'West Africa' :
                                      lowered.includes('east') ? 'East Africa' : 'Africa';
  if (lowered.includes('europe')) return 'Europe';
  if (lowered.includes('asia')) return lowered.includes('southeast') ? 'Southeast Asia' : 'Asia';
  if (lowered.includes('middle east')) return 'Middle East';
  if (lowered.includes('latin america') || lowered.includes('south america')) return 'South America';
  if (lowered.includes('north america') || lowered.includes('usa') || lowered.includes('canada')) return 'North America';
  if (lowered.includes('global') || lowered.includes('international')) return 'Global';

  // If secondary looks like a region keyword, prefer that
  if (secondary) {
    const secLower = secondary.toLowerCase();
    if (secLower.includes('africa')) return 'Africa';
    if (secLower.includes('europe')) return 'Europe';
    if (secLower.includes('asia')) return 'Asia';
    if (secLower.includes('america')) return 'South America';
    if (secLower.includes('global') || secLower.includes('international')) return 'Global';
  }

  // Default by country rough mapping
  const c = primary.toLowerCase();
  if (['uk','united kingdom','ireland','france','germany','italy','spain','portugal','netherlands',
       'belgium','sweden','denmark','norway','poland','switzerland','austria'].includes(c)) return 'Europe';
  if (['usa','united states','canada','mexico'].includes(c)) return 'North America';
  if (['brazil','argentina','chile','peru','colombia'].includes(c)) return 'South America';
  if (['kenya','rwanda','uganda','tanzania','south africa','nigeria','ghana','ethiopia','morocco','egypt'].includes(c)) return 'Africa';
  if (['india','pakistan','bangladesh','nepal','thailand','vietnam','malaysia','singapore','indonesia','philippines','china','japan','south korea','myanmar'].includes(c)) return 'Asia';
  if (['australia','new zealand'].includes(c)) return 'Oceania';
  return 'Global';
}

function normalizeCountry(countryOrRegionRaw) {
  if (!countryOrRegionRaw) return 'Global';
  const text = countryOrRegionRaw.trim();
  // prefer the first token before "/" or "(" as the country token
  const first = text.split('/')[0].split('(')[0].trim();
  return first || 'Global';
}

function pickCentroid(countryOrRegionRaw) {
  const country = normalizeCountry(countryOrRegionRaw);
  if (CENTROIDS[country]) return CENTROIDS[country];
  const region = deriveRegion(countryOrRegionRaw);
  if (CENTROIDS[region]) return CENTROIDS[region];
  return CENTROIDS['Global'];
}

function loadCsvRows(filePath) {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`CSV not found: ${abs}`);
  }
  const raw = fs.readFileSync(abs, 'utf8');
  const rows = parseCsv(raw);
  if (!rows.length) return [];
  const header = rows[0].map(h => h.toLowerCase());
  const dataRows = rows.slice(1).filter(r => r.length && r.some(x => (x || '').trim().length));
  return dataRows.map(r => {
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
    return { items: [] };
  }
  try {
    const raw = fs.readFileSync(outAbs, 'utf8');
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return { items: parsed };
    if (parsed && Array.isArray(parsed.items)) return { items: parsed.items };
    return { items: [] };
  } catch {
    return { items: [] };
  }
}

function toCompany(rec) {
  const name = rec['organisation'] || rec['organization'] || rec['name'] || '';
  const cr = rec['country/region'] || rec['country'] || rec['region'] || '';
  const type = rec['type'] || '';
  const sector = normalizeSector(rec['sector'] || '');
  const desc = rec['description'] || '';
  const region = deriveRegion(cr);
  const country = normalizeCountry(cr);
  const { lng, lat } = pickCentroid(cr);
  return {
    // id assigned later
    name: name,
    country: country,
    city: country, // placeholder; refined later if needed
    lng,
    lat,
    sector,
    color: undefined, // renderer falls back to sector color
    desc,
    imageUrl: undefined, // to be added later
    region,
    stats: { savings: '', energy: '', co2: '', payback: '' }
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
  const allRecs = [];
  for (const f of INPUT_FILES) {
    const rows = loadCsvRows(f);
    rows.forEach(r => allRecs.push(r));
  }
  const imported = allRecs.map(toCompany);
  const importedUnique = uniqueByName(imported);

  const existing = readExisting().items;
  const existingByName = new Map(existing.map(it => [(it.name || '').toLowerCase(), it]));

  // Merge: keep existing, add new where name not present
  const merged = existing.slice();
  for (const it of importedUnique) {
    const key = (it.name || '').toLowerCase();
    if (existingByName.has(key)) continue;
    merged.push(it);
  }

  // Assign IDs for any missing
  let maxId = merged.reduce((m, it) => Math.max(m, Number(it.id) || 0), 0);
  for (const it of merged) {
    if (it.id == null) {
      maxId += 1;
      it.id = maxId;
    }
  }

  // Write back
  const outAbs = path.join(process.cwd(), OUTPUT_JSON);
  const payload = { updatedAt: new Date().toISOString(), items: merged };
  fs.writeFileSync(outAbs, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Merged ${importedUnique.length} imported records into ${OUTPUT_JSON}. Total: ${merged.length}`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error('Import failed:', err.message);
    process.exit(1);
  }
}

