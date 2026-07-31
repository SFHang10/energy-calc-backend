/**
 * GET /api/upgrade-plan — shared upgrade plan for chat studio / HTML.
 * Query: vertical=fridge|dishwasher|wok-burner, region=, q=
 */
const express = require('express');
const { getUpgradePlanStudioPayload, detectVertical } = require('../services/greenways-upgrade-plan');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const vertical = String(req.query.vertical || '').trim() || detectVertical(req.query.q || '');
    const profile = {
      region: String(req.query.region || req.query.country || '').trim() || undefined,
      sector: String(req.query.sector || 'restaurant').trim()
    };
    const payload = await getUpgradePlanStudioPayload({
      vertical,
      profile,
      question: String(req.query.q || req.query.question || '').trim()
    });
    if (!payload) {
      return res.status(404).json({ ok: false, error: 'No upgrade plan for that vertical.' });
    }
    res.json(payload);
  } catch (error) {
    console.error('upgrade-plan error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to build upgrade plan.' });
  }
});

module.exports = router;
