const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const path = require('path');
const apiMetricsMiddleware = require('./middleware/apiMetrics.middleware');

const authRoutes = require('./routes/auth.routes');
const organizationRoutes = require('./routes/organization.routes');
const customerRoutes = require('./routes/customer.routes');
const loanRoutes = require('./routes/loan.routes');
const paymentRoutes = require('./routes/payment.routes');
const fundRoutes = require('./routes/fund.routes');
const reportRoutes = require('./routes/report.routes');
const reconciliationRoutes = require('./routes/reconciliation.routes');
const userRoutes = require('./routes/user.routes');
const governanceRoutes = require('./routes/governance.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(apiMetricsMiddleware);

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
app.use('/api/users', userRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/funds', fundRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/reconciliation', reconciliationRoutes);
app.use('/api/governance', governanceRoutes);

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
