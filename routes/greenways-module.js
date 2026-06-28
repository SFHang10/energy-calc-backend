const express = require('express');
const {
  askFinanceFinder,
  summarizeTariffPack,
  askEquipmentIntelligence,
  askWaterFinder,
  summarizeWaterFinderPack,
  isLlmConfigured
} = require('../services/greenways-module-llm');

const router = express.Router();

router.get('/status', (_req, res) => {
  res.json({
    ok: true,
    modules: {
      financeFinder: { llm: isLlmConfigured('FINANCE_AGENT') },
      tariffPortal: { llm: isLlmConfigured('DEALS_AGENT') },
      equipmentIntelligence: { llm: isLlmConfigured('EQUIPMENT_AGENT') },
      waterFinder: { llm: isLlmConfigured('SUSTAINABLE_PRODUCTS_AGENT') }
    },
    envHint: 'Set ASSISTANT_PROVIDER, ASSISTANT_API_KEY, ASSISTANT_MODEL (or FINANCE_AGENT_*, etc.) on the server.'
  });
});

router.post('/finance-finder/ask', async (req, res) => {
  try {
    const payload = await askFinanceFinder(req.body || {});
    if (!payload.ok) {
      return res.status(payload.error === 'prompt is required.' ? 400 : 503).json(payload);
    }
    return res.json(payload);
  } catch (error) {
    console.error('Finance finder module ask error:', error.message);
    return res.status(500).json({ ok: false, error: 'Failed to run finance finder search.' });
  }
});

router.post('/tariff-portal/summarize', async (req, res) => {
  try {
    const payload = await summarizeTariffPack(req.body || {});
    return res.json(payload);
  } catch (error) {
    console.error('Tariff portal summarize error:', error.message);
    return res.status(500).json({ ok: false, error: 'Failed to summarize energy pack.' });
  }
});

router.post('/equipment-intelligence/ask', async (req, res) => {
  try {
    const payload = await askEquipmentIntelligence(req.body || {});
    if (!payload.ok) {
      return res.status(400).json(payload);
    }
    return res.json(payload);
  } catch (error) {
    console.error('Equipment intelligence module ask error:', error.message);
    return res.status(500).json({ ok: false, error: 'Failed to run equipment intelligence ask.' });
  }
});

router.post('/water-finder/ask', async (req, res) => {
  try {
    const payload = await askWaterFinder(req.body || {});
    if (!payload.ok) {
      return res.status(payload.error === 'prompt is required.' ? 400 : 503).json(payload);
    }
    return res.json(payload);
  } catch (error) {
    console.error('Water finder module ask error:', error.message);
    return res.status(500).json({ ok: false, error: 'Failed to run water finder search.' });
  }
});

router.post('/water-finder/summarize', async (req, res) => {
  try {
    const payload = await summarizeWaterFinderPack(req.body || {});
    return res.json(payload);
  } catch (error) {
    console.error('Water finder summarize error:', error.message);
    return res.status(500).json({ ok: false, error: 'Failed to summarize water finder pack.' });
  }
});

module.exports = router;
