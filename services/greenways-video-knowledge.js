const path = require('path');
const fs = require('fs/promises');

const KNOWLEDGE_PATH = path.join(__dirname, '..', 'data', 'greenways-video-knowledge.json');

let cache = null;

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

async function loadVideoKnowledge() {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(KNOWLEDGE_PATH, 'utf8');
    cache = JSON.parse(raw);
  } catch (_) {
    cache = { items: [], meta: {} };
  }
  return cache;
}

function findVideoPointer(pointers = [], video = {}) {
  const id = String(video.id || '').trim();
  const videoId = String(video.videoId || '').trim();
  const title = normalizeText(video.title);

  if (!Array.isArray(pointers) || !pointers.length) return null;

  if (id) {
    const match = pointers.find((p) => String(p.id || '').trim() === id);
    if (match) return match;
  }
  if (videoId) {
    const match = pointers.find((p) => String(p.videoId || '').trim() === videoId);
    if (match) return match;
  }
  if (title) {
    const match = pointers.find((p) => normalizeText(p.title) === title);
    if (match) return match;
  }
  return null;
}

module.exports = {
  loadVideoKnowledge,
  findVideoPointer
};

