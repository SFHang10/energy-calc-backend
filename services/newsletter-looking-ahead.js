/**
 * Newsletter "Looking Ahead" extraction + carry-forward tracking.
 * Used by run-newsletter and agent feed builders.
 */

const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs');

const ROOT = path.join(__dirname, '..');

const EDITION_DIRS = {
  sustainability: [
    path.join(ROOT, 'content-ops', 'review', 'sustainability-news'),
    path.join(ROOT, 'content-ops', 'drafts', 'sustainability-news')
  ],
  tech: [
    path.join(ROOT, 'content-ops', 'review', 'new-in-tech'),
    path.join(ROOT, 'content-ops', 'drafts', 'sustainability-news')
  ]
};

function decodeHtml(text) {
  return String(text || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function editionFromFilename(name) {
  const m = String(name).match(/(\d{4}-\d{2})/);
  return m ? m[1] : null;
}

function editionFilePattern(editionType) {
  return editionType === 'tech'
    ? /^\d{4}-\d{2}-new-in-tech\.html$/
    : /^\d{4}-\d{2}-sustainability-news\.html$/;
}

function sourcesFilePattern(editionType) {
  return editionType === 'tech'
    ? /^\d{4}-\d{2}-new-in-tech-sources\.md$/
    : /^\d{4}-\d{2}-sustainability-news-sources\.md$/;
}

async function listEditionFiles(editionType) {
  const pattern = editionFilePattern(editionType);
  const raw = [];
  for (const dir of EDITION_DIRS[editionType] || []) {
    if (!fsSync.existsSync(dir)) continue;
    const entries = await fs.readdir(dir);
    for (const name of entries) {
      if (!pattern.test(name)) continue;
      const base = name.replace('.html', '');
      raw.push({
        edition: editionFromFilename(name),
        editionType,
        htmlPath: path.join(dir, name),
        sourcesPath: path.join(dir, `${base}-sources.md`),
        folder: dir.includes('review') ? 'review' : 'drafts',
        fileName: name
      });
    }
  }
  // One row per edition — prefer review HTML over drafts copy
  const byEdition = new Map();
  for (const row of raw) {
    const existing = byEdition.get(row.edition);
    if (!existing || (row.folder === 'review' && existing.folder !== 'review')) {
      byEdition.set(row.edition, row);
    }
  }
  const out = [...byEdition.values()];
  for (const row of out) {
    row.sourcesPath = resolveSourcesPath(row.htmlPath, row.editionType);
  }
  out.sort((a, b) => String(b.edition).localeCompare(String(a.edition)));
  return out;
}

function resolveSourcesPath(htmlPath, editionType) {
  const base = path.basename(htmlPath, '.html');
  const candidates = [
    path.join(path.dirname(htmlPath), `${base}-sources.md`),
    ...(EDITION_DIRS[editionType] || []).map((dir) => path.join(dir, `${base}-sources.md`))
  ];
  for (const candidate of candidates) {
    if (fsSync.existsSync(candidate)) return candidate;
  }
  return path.join(path.dirname(htmlPath), `${base}-sources.md`);
}

function extractLookingAheadFromHtml(raw) {
  const sectionMatch = raw.match(/<section[^>]*\sid="upcoming"[^>]*>([\s\S]*?)<\/section>/i);
  if (!sectionMatch) return [];
  const section = sectionMatch[1];
  const items = [];
  const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let match;
  while ((match = liRe.exec(section)) !== null) {
    const inner = match[1];
    const strongMatch = inner.match(/<strong[^>]*>([^<]+)<\/strong>/i);
    const when = strongMatch ? decodeHtml(strongMatch[1].replace(/:$/, '')) : null;
    let plain = decodeHtml(inner.replace(/<[^>]+>/g, ' '));
    if (when && plain.toLowerCase().startsWith(when.toLowerCase())) {
      plain = plain.slice(when.length).replace(/^:\s*/, '').trim();
    }
    const links = [];
    const linkRe = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let linkMatch;
    while ((linkMatch = linkRe.exec(inner)) !== null) {
      links.push({
        href: linkMatch[1],
        label: decodeHtml(linkMatch[2].replace(/<[^>]+>/g, ''))
      });
    }
    const headline = plain.slice(0, 180);
    if (headline.length < 12) continue;
    items.push({
      when,
      headline,
      links,
      id: `${when || 'item'}-${headline.slice(0, 40).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    });
  }
  return items;
}

function parseCarryForwardFromSources(raw) {
  const rows = [];
  let inTable = false;
  for (const line of raw.split('\n')) {
    if (/^## .*(continuity|carry[-‑ ]forward)/i.test(line)) {
      inTable = true;
      continue;
    }
    if (inTable && line.startsWith('## ')) break;
    if (!inTable || !line.startsWith('|')) continue;
    if (line.includes('---') || /looking ahead item/i.test(line)) continue;
    const cells = line
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length < 2) continue;
    rows.push({
      priorItem: cells[0].replace(/^"|"$/g, ''),
      coverage: cells[1]
    });
  }
  return rows;
}

function normalizeKey(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .slice(0, 80);
}

function matchCoverage(priorItem, carryRows) {
  const key = normalizeKey(priorItem);
  for (const row of carryRows) {
    const rowKey = normalizeKey(row.priorItem);
    if (rowKey.includes(key.slice(0, 24)) || key.includes(rowKey.slice(0, 24))) {
      return row;
    }
  }
  return null;
}

async function loadEditionPack(editionType, edition = null) {
  const files = await listEditionFiles(editionType);
  const pick = edition ? files.find((f) => f.edition === edition) : files[0];
  if (!pick) return null;

  const htmlRaw = await fs.readFile(pick.htmlPath, 'utf8');
  let carryForward = [];
  let sourcesExists = false;
  try {
    const sourcesRaw = await fs.readFile(pick.sourcesPath, 'utf8');
    sourcesExists = true;
    carryForward = parseCarryForwardFromSources(sourcesRaw);
  } catch (_) {
    /* optional */
  }

  const quoteMatch = htmlRaw.match(/<div class="quote">\s*([\s\S]*?)\s*<\/div>/);
  const summary = quoteMatch
    ? decodeHtml(quoteMatch[1].replace(/<[^>]+>/g, '').slice(0, 400))
    : null;

  return {
    ...pick,
    pageHref: `/${path.relative(ROOT, pick.htmlPath).split(path.sep).join('/')}`,
    lookingAhead: extractLookingAheadFromHtml(htmlRaw),
    carryForward,
    sourcesExists,
    summary
  };
}

async function buildLookingAheadWatchlist(options = {}) {
  const strict = Boolean(options.strict);
  const now = new Date();
  const types = ['sustainability', 'tech'];
  const editions = {};

  for (const type of types) {
    const files = await listEditionFiles(type);
    const current = files[0] ? await loadEditionPack(type) : null;
    const previous = files[1] ? await loadEditionPack(type, files[1].edition) : null;

    const openFromPrior = [];
    if (previous?.lookingAhead?.length) {
      for (const item of previous.lookingAhead) {
        const label = item.when ? `${item.when}: ${item.headline}` : item.headline;
        const covered = current?.carryForward?.length
          ? matchCoverage(label, current.carryForward)
          : null;
        openFromPrior.push({
          priorEdition: previous.edition,
          item: label,
          status: covered ? 'covered_in_sources' : 'needs_review',
          coverageNote: covered?.coverage || null
        });
      }
    }

    editions[type] = {
      current: current
        ? {
            edition: current.edition,
            folder: current.folder,
            htmlPath: current.htmlPath,
            sourcesPath: current.sourcesPath,
            pageHref: current.pageHref,
            lookingAheadCount: current.lookingAhead.length,
            carryForwardCount: current.carryForward.length,
            sourcesExists: current.sourcesExists,
            summary: current.summary
          }
        : null,
      previous: previous
        ? {
            edition: previous.edition,
            pageHref: previous.pageHref,
            lookingAheadCount: previous.lookingAhead.length
          }
        : null,
      lookingAhead: current?.lookingAhead || [],
      carryForward: current?.carryForward || [],
      priorLookingAheadFollowUp: openFromPrior
    };
  }

  const gaps = [];
  for (const type of types) {
    const pack = editions[type];
    if (!pack.current) {
      gaps.push({ type, level: 'error', message: `No ${type} edition HTML found in review or drafts` });
      continue;
    }
    if (pack.current.folder !== 'review' && !strict) {
      gaps.push({
        type,
        level: 'warn',
        message: `Latest ${type} edition (${pack.current.edition}) is still in drafts — move to content-ops/review before publish`
      });
    }
    if (!pack.current.lookingAheadCount) {
      gaps.push({
        type,
        level: 'error',
        message: `Missing #upcoming "Looking Ahead" section in ${pack.current.edition} ${type} HTML`
      });
    }
    if (!pack.current.sourcesExists) {
      gaps.push({
        type,
        level: strict ? 'error' : 'warn',
        message: `Missing sources file for ${pack.current.edition} ${type} — add carry-forward table in *-sources.md`
      });
    }
    for (const row of pack.priorLookingAheadFollowUp) {
      if (row.status === 'needs_review') {
        gaps.push({
          type,
          level: 'warn',
          message: `Prior "Looking Ahead" may need coverage: ${row.item.slice(0, 90)}… (${row.priorEdition} → ${pack.current.edition})`
        });
      }
    }
  }

  const sust = editions.sustainability?.current;
  const tech = editions.tech?.current;
  const pairedEdition =
    sust?.edition && tech?.edition && sust.edition === tech.edition ? sust.edition : null;

  if (sust?.edition && tech?.edition && sust.edition !== tech.edition) {
    gaps.push({
      type: 'pair',
      level: 'error',
      message: `Edition mismatch — Sustainability ${sust.edition} vs New in Tech ${tech.edition}. Both newsletters must share the same YYYY-MM month.`
    });
  }

  if (strict) {
    if (!sust?.edition || !tech?.edition) {
      gaps.push({
        type: 'pair',
        level: 'error',
        message: 'Monthly pair incomplete — both Sustainability News and New in Tech HTML are required before publish.'
      });
    }
    if (sust && sust.folder !== 'review') {
      gaps.push({
        type: 'pair',
        level: 'error',
        message: `Sustainability News (${sust.edition}) must be in content-ops/review/ before publish (currently ${sust.folder}).`
      });
    }
    if (tech && tech.folder !== 'review') {
      gaps.push({
        type: 'pair',
        level: 'error',
        message: `New in Tech (${tech.edition}) must be in content-ops/review/new-in-tech/ before publish (currently ${tech.folder}).`
      });
    }
  } else {
    if (sust && sust.folder !== 'review') {
      gaps.push({
        type: 'sustainability',
        level: 'warn',
        message: `Latest sustainability edition (${sust.edition}) is still in drafts — move to content-ops/review/ before publish`
      });
    }
    if (tech && tech.folder !== 'review') {
      gaps.push({
        type: 'tech',
        level: 'warn',
        message: `Latest tech edition (${tech.edition}) is still in drafts — move to content-ops/review/new-in-tech/ before publish`
      });
    }
  }

  return {
    meta: {
      version: 1,
      generatedAt: now.toISOString(),
      playbook: 'Skills/newsletter-run-playbook.md',
      pairedEdition,
      bothRequired: true,
      bothInReview: Boolean(sust?.folder === 'review' && tech?.folder === 'review'),
      editions: {
        sustainability: sust?.edition || null,
        tech: tech?.edition || null
      }
    },
    editions,
    gaps,
    readyToPublish: gaps.every((g) => g.level !== 'error')
  };
}

module.exports = {
  ROOT,
  listEditionFiles,
  resolveSourcesPath,
  extractLookingAheadFromHtml,
  parseCarryForwardFromSources,
  loadEditionPack,
  buildLookingAheadWatchlist,
  normalizeKey,
  matchCoverage
};
