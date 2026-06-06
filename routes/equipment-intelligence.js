const express = require('express');
const { EquipmentIntelligenceService } = require('../services/equipment-intelligence-service');

const router = express.Router();
const service = new EquipmentIntelligenceService();

router.get('/search', (req, res) => {
  try {
    const payload = service.search({
      name: req.query.name,
      brand: req.query.brand,
      model: req.query.model,
      serial: req.query.serial,
      type: req.query.type
    });

    if (!payload.success) {
      return res.status(400).json(payload);
    }

    return res.json(payload);
  } catch (error) {
    console.error('❌ Equipment intelligence search error:', error.message);
    return res.status(500).json({
      success: false,
      found: false,
      message: 'Failed to run equipment intelligence search.'
    });
  }
});

router.get('/compare', (req, res) => {
  try {
    const payload = service.compare({
      name: req.query.name,
      brand: req.query.brand,
      model: req.query.model,
      serial: req.query.serial,
      type: req.query.type,
      actualDailyKwh: req.query.actualDailyKwh
    });

    if (!payload.success) {
      return res.status(400).json(payload);
    }

    return res.json(payload);
  } catch (error) {
    console.error('❌ Equipment intelligence compare error:', error.message);
    return res.status(500).json({
      success: false,
      found: false,
      message: 'Failed to compare actual usage against benchmark.'
    });
  }
});

router.get('/alternatives', (req, res) => {
  try {
    const payload = service.getAlternatives({
      name: req.query.name,
      brand: req.query.brand,
      model: req.query.model,
      type: req.query.type,
      actualDailyKwh: req.query.actualDailyKwh,
      actualDailyWaterLitres: req.query.actualDailyWaterLitres,
      actualDailyGasKwh: req.query.actualDailyGasKwh,
      persistCatalog: req.query.persistCatalog,
      saveToCatalog: req.query.saveToCatalog,
      finderSource: req.query.finderSource,
      source: req.query.source,
      region: req.query.region,
      country: req.query.country
    });

    if (!payload.success) {
      return res.status(400).json(payload);
    }

    return res.json(payload);
  } catch (error) {
    console.error('❌ Equipment intelligence alternatives error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to get sustainable alternatives.'
    });
  }
});

router.get('/decision-matrix', (req, res) => {
  try {
    const payload = service.getDecisionMatrix({
      name: req.query.name,
      brand: req.query.brand,
      model: req.query.model,
      type: req.query.type,
      actualDailyKwh: req.query.actualDailyKwh,
      actualDailyWaterLitres: req.query.actualDailyWaterLitres,
      actualDailyGasKwh: req.query.actualDailyGasKwh,
      electricityRateEurPerKwh: req.query.electricityRateEurPerKwh,
      gasRateEurPerKwh: req.query.gasRateEurPerKwh,
      waterRateEurPerLitre: req.query.waterRateEurPerLitre
    });

    if (!payload.success) {
      return res.status(400).json(payload);
    }
    return res.json(payload);
  } catch (error) {
    console.error('❌ Equipment intelligence decision matrix error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to build decision matrix.'
    });
  }
});

router.post('/marketplace-intake-suggestions', (req, res) => {
  try {
    const payload = service.saveIntakeSuggestion(req.body || {});
    if (!payload.success) {
      return res.status(400).json(payload);
    }
    return res.status(201).json(payload);
  } catch (error) {
    console.error('❌ Equipment intelligence intake suggestion error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to save marketplace intake suggestion.'
    });
  }
});

router.get('/marketplace-intake-suggestions', (req, res) => {
  try {
    const payload = service.listIntakeSuggestions();
    return res.json(payload);
  } catch (error) {
    console.error('❌ Equipment intelligence list intake suggestions error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to list marketplace intake suggestions.'
    });
  }
});

router.get('/marketplace-intake-shortlist', (req, res) => {
  try {
    const payload = service.getIntakeShortlist({
      status: req.query.status,
      limit: req.query.limit
    });
    return res.json(payload);
  } catch (error) {
    console.error('❌ Equipment intelligence intake shortlist error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load marketplace intake shortlist.'
    });
  }
});

router.get('/sustainable-products', (req, res) => {
  try {
    const payload = service.listSustainableCatalog({
      status: req.query.status
    });
    return res.json(payload);
  } catch (error) {
    console.error('❌ Sustainable products list error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to list sustainable products catalog.'
    });
  }
});

router.post('/finder-session', (req, res) => {
  try {
    const payload = service.runFinderSession(req.body || {});
    if (!payload.success) {
      return res.status(400).json(payload);
    }
    return res.json(payload);
  } catch (error) {
    console.error('❌ Equipment intelligence finder session error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to run sustainable product finder session.'
    });
  }
});

router.post('/sustainable-products', (req, res) => {
  try {
    const payload = service.upsertSustainableCatalogProduct(req.body || {});
    if (!payload.success) {
      return res.status(400).json(payload);
    }
    return res.status(201).json(payload);
  } catch (error) {
    console.error('❌ Sustainable products upsert error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to save sustainable catalog product.'
    });
  }
});

router.patch('/marketplace-intake-suggestions/:id/status', (req, res) => {
  try {
    const payload = service.updateIntakeSuggestionStatus({
      id: req.params.id,
      status: req.body?.status
    });
    if (!payload.success) {
      return res.status(400).json(payload);
    }
    return res.json(payload);
  } catch (error) {
    console.error('❌ Equipment intelligence intake status update error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update intake suggestion status.'
    });
  }
});

module.exports = router;
