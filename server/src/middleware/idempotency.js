const crypto = require('crypto');
const { query } = require('../config/database');

/**
 * Idempotency Middleware for mobile financial requests (Disbursement, Payments, Reversals)
 * Prevents double execution when mobile devices re-submit requests over unstable cellular networks.
 */
function idempotencyMiddleware(options = { required: false }) {
  return async (req, res, next) => {
    const key = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];

    if (!key) {
      if (options.required) {
        return res.status(400).json({
          success: false,
          message: 'Idempotency-Key header is required for this financial transaction.',
        });
      }
      return next();
    }

    const userId = req.user?.id || 0;
    const endpoint = `${req.method} ${req.originalUrl}`;
    const requestHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(req.body || {}))
      .digest('hex');

    try {
      // 1. Check existing record
      const [existing] = await query(
        `SELECT * FROM idempotency_keys WHERE idempotency_key = ? LIMIT 1`,
        [key]
      );

      if (existing.length > 0) {
        const record = existing[0];

        if (record.status === 'COMPLETED') {
          return res.status(record.response_status || 200).json(
            typeof record.response_body === 'string'
              ? JSON.parse(record.response_body)
              : record.response_body
          );
        }

        if (record.status === 'PENDING') {
          return res.status(409).json({
            success: false,
            message: 'A request with this idempotency key is currently being processed. Please retry in a few seconds.',
          });
        }
      }

      // 2. Reserve the key in PENDING state
      await query(
        `INSERT INTO idempotency_keys (idempotency_key, user_id, endpoint, request_hash, status)
         VALUES (?, ?, ?, ?, 'PENDING')
         ON DUPLICATE KEY UPDATE status = status`,
        [key, userId, endpoint, requestHash]
      );

      // 3. Intercept response to store completed result
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        // Asynchronously save response cache
        const status = res.statusCode >= 200 && res.statusCode < 300 ? 'COMPLETED' : 'FAILED';
        query(
          `UPDATE idempotency_keys 
           SET status = ?, response_status = ?, response_body = ? 
           WHERE idempotency_key = ?`,
          [status, res.statusCode, JSON.stringify(body), key]
        ).catch((err) => console.error('Failed to update idempotency key:', err));

        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error('Idempotency error:', err);
      next();
    }
  };
}

module.exports = idempotencyMiddleware;
