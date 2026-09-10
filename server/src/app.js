const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const path = require('path');

const authRoutes = require('./modules/auth/auth.routes');
const organizationRoutes = require('./modules/organizations/organization.routes');
const customerRoutes = require('./modules/customers/customer.routes');
const loanRoutes = require('./modules/loans/loan.routes');
const paymentRoutes = require('./modules/payments/payment.routes');
const fundRoutes = require('./modules/fund/fund.routes');
const reportRoutes = require('./modules/reports/report.routes');
const reconciliationRoutes = require('./modules/reconciliation/reconciliation.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static web portal assets
const publicDirectory = path.join(__dirname, '../public');
app.use(express.static(publicDirectory));
app.use('/portal', express.static(publicDirectory));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    system: 'Fund Circulation & Lending Management Engine',
    timestamp: new Date().toISOString(),
  });
});

// Mount modular routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/funds', fundRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/reconciliation', reconciliationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Endpoint ${req.method} ${req.originalUrl} not found.` });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
