const express = require('express');
const { readStore, writeStore } = require('../services/finance-headline-candidates');

const router = express.Router();

function toText(value, maxLen) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

router.get('/', async (req, res) => {
  try {
    const store = await readStore();
    const approved = toText(req.query.approved || '', 10).toLowerCase();
    const region = toText(req.query.region || '', 8).toUpperCase();
    let candidates = store.candidates || [];

    if (region && region !== 'ALL') {
      candidates = candidates.filter((c) => String(c.region || '').toUpperCase() === region);
    }
    if (approved === 'true') {
      candidates = candidates.filter((c) => c.approved === true);
    } else if (approved === 'false') {
      candidates = candidates.filter((c) => c.approved !== true);
    }

    res.json({
      candidates,
      meta: store.meta || null,
      count: candidates.length
    });
  } catch (error) {
    console.error('Failed to read finance headline candidates:', error);
    res.status(500).json({ error: 'Failed to load finance headline candidates' });
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
      if (next.approved) next.rejectedAt = null;
    }
    if (req.body?.rejected === true) {
      next.approved = false;
      next.rejectedAt = new Date().toISOString().slice(0, 10);
    }
    if (req.body?.notes != null) {
      next.notes = toText(req.body.notes, 500);
    }
    if (req.body?.title != null) {
      next.title = toText(req.body.title, 200);
    }
    if (req.body?.summary != null) {
      next.summary = toText(req.body.summary, 320);
    }
    if (req.body?.promotedAt === null) {
      next.promotedAt = null;
    }

    candidates[index] = next;
    await writeStore({ ...store, candidates });

    res.json({ candidate: next });
  } catch (error) {
    console.error('Failed to update finance headline candidate:', error);
    res.status(500).json({ error: 'Failed to update finance headline candidate' });
  }
});

module.exports = router;
