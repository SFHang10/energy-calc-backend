const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');

const ROOT = path.join(__dirname, '..');
const CHANNELS_PATH = path.join(ROOT, 'data', 'wix-youtube-channels.json');
const KNOWLEDGE_PATH = path.join(ROOT, 'data', 'greenways-video-knowledge.json');
const DRAFTS_DIR = path.join(ROOT, 'content-ops', 'drafts', 'video-knowledge');
const DRAFTS_PATH = path.join(DRAFTS_DIR, 'drafts.json');
const TRANSCRIPTS_DIR = path.join(DRAFTS_DIR, 'transcripts');

const CATEGORY_MODULES = {
  building: ['sustainable-renovations', 'insulation-guide', 'sustainability-map'],
  restaurant: ['restaurant-energy-monitoring-guide', 'energy-cost-guide', 'savings-projection'],
  energy: ['energy-prices-ticker', 'european-energy', 'site-energy-reading'],
  water: ['water-saving-finder', 'water-resources'],
  monitoring: ['sensor-dashboard', 'restaurant-energy-monitoring-guide', 'greenways-dashboard'],
  refurbishment: ['sustainable-renovations', 'insulation-guide', 'eco-project-planner'],
  etl: ['etl-finder', 'equipment-deep-dive'],
  news: ['sustainability-news', 'sustainability-map'],
  general: ['sustainability-map', 'eco-project-planner']
};

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function loadSourceVideos() {
  const channels = readJson(CHANNELS_PATH, { videos: [] });
  return (channels.videos || []).filter((v) => String(v.videoId || '').trim());
}

function loadKnowledge() {
  return readJson(KNOWLEDGE_PATH, { items: [], meta: {}, updatedAt: null });
}

function loadDrafts() {
  return readJson(DRAFTS_PATH, {
    updatedAt: null,
    meta: {
      title: 'Video knowledge drafts',
      description: 'Human-approve rows (status: approved) then run npm run enrich:video-knowledge -- --merge'
    },
    items: []
  });
}

function saveDrafts(drafts) {
  drafts.updatedAt = new Date().toISOString().slice(0, 10);
  writeJson(DRAFTS_PATH, drafts);
}

function stripXml(text) {
  return String(text || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function guessModules(video = {}) {
  const cat = String(video.category || 'general').toLowerCase();
  return (CATEGORY_MODULES[cat] || CATEGORY_MODULES.general).slice(0, 3);
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; GreenwaysVideoEnrich/1.0)',
      Accept: 'text/*,application/xml'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

/**
 * Fetch auto/manual captions via YouTube timedtext list + track.
 * Fails open when captions are disabled.
 */
async function fetchYoutubeCaptions(videoId) {
  const id = String(videoId || '').trim();
  if (!id) return { text: '', lang: null, error: 'missing videoId' };

  try {
    const listXml = await fetchText(`https://video.google.com/timedtext?type=list&v=${encodeURIComponent(id)}`);
    const tracks = [...listXml.matchAll(/<track\b([^>]*)\/?>/gi)].map((m) => {
      const attrs = m[1] || '';
      const lang = (attrs.match(/\blang_code="([^"]+)"/i) || [])[1] || '';
      const name = (attrs.match(/\bname="([^"]*)"/i) || [])[1] || '';
      const kind = (attrs.match(/\bkind="([^"]*)"/i) || [])[1] || '';
      return { lang, name, kind };
    });

    const prefer = ['en', 'en-US', 'en-GB', 'a.en'];
    let pick =
      tracks.find((t) => prefer.includes(t.lang) && t.kind !== 'asr') ||
      tracks.find((t) => prefer.some((p) => t.lang.startsWith(p.split('-')[0]))) ||
      tracks[0];

    if (!pick) {
      return { text: '', lang: null, error: 'no caption tracks' };
    }

    const params = new URLSearchParams({
      lang: pick.lang,
      v: id,
      fmt: 'srv3'
    });
    if (pick.name) params.set('name', pick.name);

    const captionXml = await fetchText(`https://video.google.com/timedtext?${params}`);
    const text = stripXml(captionXml);
    if (!text || text.length < 40) {
      return { text: '', lang: pick.lang, error: 'empty caption text' };
    }
    return { text, lang: pick.lang, error: null };
  } catch (error) {
    return { text: '', lang: null, error: error.message || String(error) };
  }
}

function heuristicSummary(video, transcript) {
  const title = String(video.title || 'This video').trim();
  const description = String(video.description || '').trim();
  const clip = String(transcript || '')
    .slice(0, 480)
    .replace(/\s+/g, ' ')
    .trim();

  let summary = description;
  if (clip && clip.length > 80) {
    const sentences = clip.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [clip];
    summary = sentences.slice(0, 2).join(' ').trim();
  }
  if (!summary) {
    summary = `${title} — a Greenways-curated clip on ${video.category || 'sustainability'} themes for hospitality and buildings.`;
  }
  if (summary.length > 320) summary = `${summary.slice(0, 317).trim()}…`;

  const takeaways = [];
  const cat = String(video.category || '').toLowerCase();
  if (cat === 'restaurant') {
    takeaways.push('Kitchen loads (cold rooms, cooking, HVAC) usually dominate hospitality energy use.');
    takeaways.push('Pair efficient equipment with staff habits and setpoints for durable savings.');
  } else if (cat === 'energy' || cat === 'monitoring') {
    takeaways.push('Measure before you upgrade — metering turns anecdotes into a business case.');
    takeaways.push('Tariff timing and control often beat buying new kit on day one.');
  } else if (cat === 'building' || cat === 'refurbishment') {
    takeaways.push('Fabric and passive design can cut loads before you size new systems.');
    takeaways.push('Check local codes, climate, and installer experience before copying a showcase project.');
  } else {
    takeaways.push('Use the clip as inspiration, then map it to your building type and region.');
  }
  takeaways.push('Ask Cheryce for related tools, or Artemis/Vincent for equipment and payback next steps.');

  return {
    summary,
    takeaways: takeaways.slice(0, 4),
    relatedModuleIds: guessModules(video),
    source: clip ? 'captions+heuristic' : 'metadata-heuristic'
  };
}

async function llmSummary(video, transcript) {
  let maybeCallGreenwaysLlm;
  try {
    ({ maybeCallGreenwaysLlm } = require('./greenways-agent-llm'));
  } catch (_) {
    return null;
  }

  const clip = String(transcript || '').slice(0, 6000);
  const answer = await maybeCallGreenwaysLlm({
    prefix: 'MEDIA_AGENT',
    maxTokens: 500,
    systemPrompt:
      'You summarise sustainability / energy videos for Greenways Cheryce (media agent). ' +
      'Return strict JSON only: {"summary":"max 60 words","takeaways":["3-5 short bullets"],"relatedModuleIds":["optional module ids"]}. ' +
      'No markdown. Practical hospitality/building lens. Do not invent grants or prices.',
    userPayload: {
      title: video.title,
      description: video.description,
      category: video.category,
      channelId: video.channelId,
      transcriptExcerpt: clip || null
    }
  });

  if (!answer) return null;
  try {
    const jsonMatch = String(answer).match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    const summary = String(parsed.summary || '').trim();
    const takeaways = Array.isArray(parsed.takeaways)
      ? parsed.takeaways.map((t) => String(t || '').trim()).filter(Boolean).slice(0, 5)
      : [];
    if (!summary || takeaways.length < 2) return null;
    return {
      summary,
      takeaways,
      relatedModuleIds: Array.isArray(parsed.relatedModuleIds) && parsed.relatedModuleIds.length
        ? parsed.relatedModuleIds.map(String).slice(0, 4)
        : guessModules(video),
      source: clip ? 'captions+llm' : 'metadata+llm'
    };
  } catch (_) {
    return null;
  }
}

async function enrichOne(video, options = {}) {
  const saveTranscript = options.saveTranscript !== false;
  const captions = options.skipCaptions
    ? { text: '', lang: null, error: 'skipped' }
    : await fetchYoutubeCaptions(video.videoId);

  if (saveTranscript && captions.text) {
    await fsp.mkdir(TRANSCRIPTS_DIR, { recursive: true });
    await fsp.writeFile(
      path.join(TRANSCRIPTS_DIR, `${video.id || video.videoId}.txt`),
      captions.text,
      'utf8'
    );
  }

  const llm = options.skipLlm ? null : await llmSummary(video, captions.text);
  const built = llm || heuristicSummary(video, captions.text);

  return {
    id: video.id,
    videoId: video.videoId,
    title: video.title,
    summary: built.summary,
    takeaways: built.takeaways,
    relatedModuleIds: built.relatedModuleIds,
    agentNotes: {
      cheryce: 'Draft from enrich:video-knowledge — human approve before merge.'
    },
    status: 'pending',
    enrichMeta: {
      enrichedAt: new Date().toISOString(),
      captionLang: captions.lang,
      captionError: captions.error,
      transcriptChars: captions.text ? captions.text.length : 0,
      source: built.source
    }
  };
}

function upsertDraft(drafts, row) {
  const items = Array.isArray(drafts.items) ? drafts.items.slice() : [];
  const idx = items.findIndex(
    (d) =>
      (row.id && d.id === row.id) ||
      (row.videoId && d.videoId && d.videoId === row.videoId)
  );
  if (idx >= 0) {
    const prev = items[idx];
    // Preserve human approval / edits unless forceOverwrite
    if (prev.status === 'approved' || prev.status === 'rejected') {
      items[idx] = {
        ...row,
        status: prev.status,
        summary: prev.summary || row.summary,
        takeaways: prev.takeaways?.length ? prev.takeaways : row.takeaways,
        relatedModuleIds: prev.relatedModuleIds?.length ? prev.relatedModuleIds : row.relatedModuleIds,
        agentNotes: prev.agentNotes || row.agentNotes,
        enrichMeta: { ...(row.enrichMeta || {}), previousStatus: prev.status }
      };
    } else {
      items[idx] = { ...prev, ...row, status: prev.status || 'pending' };
    }
  } else {
    items.push(row);
  }
  drafts.items = items;
  return drafts;
}

function knowledgePointerFromDraft(draft) {
  return {
    id: draft.id,
    videoId: draft.videoId || '',
    title: draft.title,
    summary: draft.summary,
    takeaways: Array.isArray(draft.takeaways) ? draft.takeaways : [],
    relatedModuleIds: Array.isArray(draft.relatedModuleIds) ? draft.relatedModuleIds : [],
    ...(draft.agentNotes ? { agentNotes: draft.agentNotes } : {})
  };
}

function mergeApprovedDrafts(options = {}) {
  const drafts = loadDrafts();
  const knowledge = loadKnowledge();
  const approved = (drafts.items || []).filter((d) => d.status === 'approved');
  if (!approved.length) {
    return { merged: 0, knowledge, drafts, message: 'No approved drafts to merge' };
  }

  const items = Array.isArray(knowledge.items) ? knowledge.items.slice() : [];
  let merged = 0;
  for (const draft of approved) {
    const pointer = knowledgePointerFromDraft(draft);
    const idx = items.findIndex(
      (p) =>
        (pointer.id && p.id === pointer.id) ||
        (pointer.videoId && p.videoId && p.videoId === pointer.videoId)
    );
    if (idx >= 0) items[idx] = { ...items[idx], ...pointer };
    else items.push(pointer);
    merged += 1;
    draft.status = 'merged';
    draft.mergedAt = new Date().toISOString();
  }

  knowledge.items = items;
  knowledge.updatedAt = new Date().toISOString().slice(0, 10);
  if (!options.dryRun) {
    writeJson(KNOWLEDGE_PATH, knowledge);
    saveDrafts(drafts);
  }
  return { merged, knowledge, drafts };
}

module.exports = {
  CHANNELS_PATH,
  KNOWLEDGE_PATH,
  DRAFTS_PATH,
  TRANSCRIPTS_DIR,
  loadSourceVideos,
  loadKnowledge,
  loadDrafts,
  saveDrafts,
  fetchYoutubeCaptions,
  heuristicSummary,
  enrichOne,
  upsertDraft,
  mergeApprovedDrafts,
  guessModules
};
