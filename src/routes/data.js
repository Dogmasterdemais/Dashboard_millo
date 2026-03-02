const express = require('express');
const router = express.Router();
const { 
  getAppointmentsWithNames, 
  getUnitsWithNames, 
  getInsurancesWithNames 
} = require('../services/dataService');

// GET /api/data/appointments - Agendamentos com nomes reais
router.get('/appointments', async (req, res) => {
  try {
    const filters = {
      period: req.query.period || 'month',
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
      insurance: req.query.insurance || null,
      unitId: req.query.unitId || null,
      specialty: req.query.specialty || null,
      status: req.query.status || null,
      minAge: req.query.minAge ? Number(req.query.minAge) : null,
      maxAge: req.query.maxAge ? Number(req.query.maxAge) : null,
    };

    const appointments = await getAppointmentsWithNames(filters);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/data/units - Lista de unidades com nomes
router.get('/units', async (req, res) => {
  try {
    const units = await getUnitsWithNames();
    res.json(units);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/data/insurances - Lista de convênios com nomes
router.get('/insurances', async (req, res) => {
  try {
    const insurances = await getInsurancesWithNames();
    res.json(insurances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
