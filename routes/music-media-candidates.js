const express = require('express');
const path = require('path');
const fs = require('fs/promises');

const router = express.Router();
const dataPath = path.join(__dirname, '..', 'data', 'music-media-candidates.json');

async function readStore() {
  try {
    const raw = await fs.readFile(dataPath, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      meta: parsed.meta || {},
      candidates: Array.isArray(parsed.candidates) ? parsed.candidates : [],
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { meta: {}, candidates: [] };
    }
    throw error;
  }
}

async function writeStore(store) {
  await fs.mkdir(path.dirname(dataPath), { recursive: true });
  const payload = {
    meta: store.meta || {},
    candidates: store.candidates || [],
  };
  await fs.writeFile(dataPath, JSON.stringify(payload, null, 2) + '\n');
  return payload;
}

function toText(value, maxLen) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

router.get('/', async (req, res) => {
  try {
    const store = await readStore();
    const venueId = req.query.venueId != null ? Number(req.query.venueId) : null;
    const approved = toText(req.query.approved || '', 10).toLowerCase();
    let candidates = store.candidates || [];

    if (Number.isFinite(venueId)) {
      candidates = candidates.filter((c) => Number(c.venueId) === venueId);
    }
    if (approved === 'true') {
      candidates = candidates.filter((c) => c.approved === true);
    } else if (approved === 'false') {
      candidates = candidates.filter((c) => c.approved !== true);
    }

    res.json({
      candidates,
      meta: store.meta || null,
      count: candidates.length,
    });
  } catch (error) {
    console.error('Failed to read music media candidates:', error);
    res.status(500).json({ error: 'Failed to load media candidates' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const id = toText(req.params.id, 80);
    if (!id) {
      return res.status(400).json({ error: 'Invalid candidate id' });
    }

    const store = await readStore();
    const candidates = store.candidates || [];
    const index = candidates.findIndex((c) => String(c.id) === id);
    if (index < 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const current = candidates[index];
    const next = { ...current };

    if (req.body?.approved != null) {
      next.approved = Boolean(req.body.approved);
    }
    if (req.body?.rejected === true) {
      next.approved = false;
      next.rejectedAt = new Date().toISOString().slice(0, 10);
    }
    if (req.body?.notes != null) {
      next.notes = toText(req.body.notes, 500);
    }
    if (req.body?.title != null) {
      next.title = toText(req.body.title, 120);
    }
    if (req.body?.caption != null) {
      next.caption = toText(req.body.caption, 160);
    }
    if (req.body?.mergedAt === null) {
      next.mergedAt = null;
    }

    candidates[index] = next;
    await writeStore({ ...store, candidates });

    res.json({ candidate: next });
  } catch (error) {
    console.error('Failed to update music media candidate:', error);
    res.status(500).json({ error: 'Failed to update media candidate' });
  }
});

module.exports = router;
