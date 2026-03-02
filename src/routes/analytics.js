const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');

// GET /api/analytics/dashboard?period=day
router.get('/dashboard', async (req, res) => {
  try {
    const filters = {
      period: req.query.period || 'day',
      insurance: req.query.insurance || null,
      // ageGroup is deprecated in favor of minAge/maxAge
      minAge: req.query.minAge ? Number(req.query.minAge) : null,
      maxAge: req.query.maxAge ? Number(req.query.maxAge) : null,
      specialty: req.query.specialty || null,
      unitId: req.query.unitId || null,
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
    };

    const dashboard = await analyticsService.getAnalyticsDashboard(filters);
    res.json({ success: true, data: dashboard });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/analytics/specialty-distribution?period=day
router.get('/specialty-distribution', async (req, res) => {
  try {
    const filters = {
      period: req.query.period || 'day',
      insurance: req.query.insurance || null,
      minAge: req.query.minAge ? Number(req.query.minAge) : null,
      maxAge: req.query.maxAge ? Number(req.query.maxAge) : null,
      unitId: req.query.unitId || null,
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
    };

    const distribution = await analyticsService.getSpecialtyDistribution(filters);
    res.json({ success: true, data: distribution });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/analytics/insurance-distribution?period=day
router.get('/insurance-distribution', async (req, res) => {
  try {
    const filters = {
      period: req.query.period || 'day',
      specialty: req.query.specialty || null,
      minAge: req.query.minAge ? Number(req.query.minAge) : null,
      maxAge: req.query.maxAge ? Number(req.query.maxAge) : null,
      unitId: req.query.unitId || null,
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
    };

    const distribution = await analyticsService.getInsuranceDistribution(filters);
    res.json({ success: true, data: distribution });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/analytics/unit-distribution?period=day
router.get('/unit-distribution', async (req, res) => {
  try {
    const filters = {
      period: req.query.period || 'day',
      specialty: req.query.specialty || null,
      insurance: req.query.insurance || null,
      minAge: req.query.minAge ? Number(req.query.minAge) : null,
      maxAge: req.query.maxAge ? Number(req.query.maxAge) : null,
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
    };

    const distribution = await analyticsService.getUnitDistribution(filters);
    res.json({ success: true, data: distribution });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/analytics/unit-comparison?period=day
router.get('/unit-comparison', async (req, res) => {
  try {
    const filters = {
      period: req.query.period || 'day',
      specialty: req.query.specialty || null,
      insurance: req.query.insurance || null,
      minAge: req.query.minAge ? Number(req.query.minAge) : null,
      maxAge: req.query.maxAge ? Number(req.query.maxAge) : null,
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
    };

    const comparison = await analyticsService.getUnitComparison(filters);
    res.json({ success: true, data: comparison });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/analytics/age-distribution?period=day
router.get('/age-distribution', async (req, res) => {
  try {
    const filters = {
      period: req.query.period || 'day',
      insurance: req.query.insurance || null,
      specialty: req.query.specialty || null,
      unitId: req.query.unitId || null,
      minAge: req.query.minAge ? Number(req.query.minAge) : null,
      maxAge: req.query.maxAge ? Number(req.query.maxAge) : null,
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
    };

    const distribution = await analyticsService.getAgeGroupDistribution(filters);
    res.json({ success: true, data: distribution });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/analytics/specialty-comparison/:specialty?period1=day&period2=week
router.get('/specialty-comparison/:specialty', async (req, res) => {
  try {
    const { specialty } = req.params;
    const { period1 = 'day', period2 = 'week' } = req.query;

    const comparison = await analyticsService.getSpecialtyComparison(specialty, period1, period2);
    res.json({ success: true, data: comparison });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
