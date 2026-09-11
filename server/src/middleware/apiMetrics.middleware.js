const { query } = require('../config/database');

/**
 * Lightweight Asynchronous API Telemetry Middleware
 * Captures method, endpoint, status code, latency (ms), organization, IP, and timestamp
 */
const apiMetricsMiddleware = (req, res, next) => {
  const startHrTime = process.hrtime();
  const startTime = Date.now();

  res.on('finish', () => {
    // Only capture /api/* routes, avoid recursive logging of telemetry itself
    if (!req.originalUrl.startsWith('/api') || req.originalUrl.includes('/governance/api-metrics')) {
      return;
    }

    const elapsedHrTime = process.hrtime(startHrTime);
    const responseTimeMs = (elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6).toFixed(2);

    // Clean endpoint path (strip query params)
    const cleanEndpoint = req.originalUrl.split('?')[0];
    const method = req.method.toUpperCase();
    const statusCode = res.statusCode || 200;
    const ipAddress = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '127.0.0.1').toString().slice(0, 45);
    const orgId = req.headers['x-organization-id'] || req.user?.organization_id || null;
    const userId = req.user?.id || null;

    // Asynchronous non-blocking insert into database
    query(
      `INSERT INTO api_metrics (endpoint, method, status_code, response_time_ms, organization_id, user_id, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [cleanEndpoint, method, statusCode, parseFloat(responseTimeMs), orgId, userId, ipAddress]
    ).catch((err) => {
      // Swallowed silently so telemetry never fails the client response
      if (process.env.NODE_ENV === 'development') {
        // console.debug('API telemetry record skipped:', err.message);
      }
    });
  });

  next();
};

module.exports = apiMetricsMiddleware;
