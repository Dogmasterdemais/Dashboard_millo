const express = require('express');
const router = express.Router();
const appointmentService = require('../services/appointmentService');

// GET /api/appointments?period=day
router.get('/', async (req, res) => {
  try {
    const { period = 'day', startDate, endDate } = req.query;
    const appointments = await appointmentService.getAppointmentsByPeriod(period, startDate, endDate);
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/appointments/filtered
router.get('/filtered', async (req, res) => {
  try {
    const filters = {
      period: req.query.period || 'day',
      insurance: req.query.insurance || null,
      ageGroup: req.query.ageGroup || null,
      specialty: req.query.specialty || null,
      unitId: req.query.unitId || null,
      status: req.query.status || null,
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
    };

    const appointments = await appointmentService.getAppointmentsFiltered(filters);
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/appointments/by-insurance/:insurance?period=day
router.get('/by-insurance/:insurance', async (req, res) => {
  try {
    const { insurance } = req.params;
    const { period = 'day' } = req.query;
    const appointments = await appointmentService.getAppointmentsByInsurance(insurance, period);
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/appointments/by-unit/:unitId?period=day
router.get('/by-unit/:unitId', async (req, res) => {
  try {
    const { unitId } = req.params;
    const { period = 'day' } = req.query;
    const appointments = await appointmentService.getAppointmentsByUnit(unitId, period);
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
