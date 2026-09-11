const express = require('express');
const router = express.Router();
const governanceController = require('./governance.controller');

// Default Categories
router.get('/categories', governanceController.getDefaultCategories);
router.put('/categories/:code', governanceController.updateDefaultCategory);

// Privacy Policy & Compliance
router.get('/privacy-policy', governanceController.getPrivacyPolicies);
router.put('/privacy-policy', governanceController.updatePrivacyPolicy);

// App Versions & Mobile Releases
router.get('/app-versions', governanceController.getAppVersions);
router.post('/app-versions', governanceController.createAppVersion);

// Audit Logs & Telemetry
router.get('/audit-logs', governanceController.getAuditLogs);
router.get('/api-metrics', governanceController.getApiMetrics);

// System Settings
router.get('/settings', governanceController.getSystemSettings);
router.put('/settings/:key', governanceController.updateSystemSetting);

module.exports = router;
