require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const appointmentRoutes = require('./routes/appointments');
const analyticsRoutes = require('./routes/analytics');
const dataRoutes = require('./routes/data');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Rotas
app.use('/api/appointments', appointmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/data', dataRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Dashboard API is running' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Dashboard API rodando em http://localhost:${PORT}`);
});
