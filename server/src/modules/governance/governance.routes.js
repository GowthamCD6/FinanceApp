const express = require('express');
const router = express.Router();
const governanceController = require('./governance.controller');

// Default Categories
router.get('/categories', governanceController.getDefaultCategories);
router.post('/categories', governanceController.createDefaultCategory);
router.put('/categories/:code', governanceController.updateDefaultCategory);
router.delete('/categories/:code', governanceController.deleteDefaultCategory);

// Privacy Policy & Compliance
router.get('/privacy-policy', governanceController.getPrivacyPolicies);
router.put('/privacy-policy', governanceController.updatePrivacyPolicy);

// App Versions & Mobile Releases
router.get('/app-versions', governanceController.getAppVersions);
router.post('/app-versions', governanceController.createAppVersion);

// Audit Logs & Telemetry
router.get('/audit-logs', governanceController.getAuditLogs);
router.get('/api-metrics', governanceController.getApiMetrics);

// Broadcast Notifications
router.get('/broadcasts', governanceController.getBroadcasts);
router.post('/broadcasts', governanceController.createBroadcast);
router.delete('/broadcasts/:id', governanceController.deleteBroadcast);

// System Settings
router.get('/settings', governanceController.getSystemSettings);
router.put('/settings/:key', governanceController.updateSystemSetting);

// Organization Lending Schemes & Interest Rates
router.get('/lending-config', governanceController.getLendingConfig);
router.get('/lending-config/:orgId', governanceController.getLendingConfig);
router.put('/lending-config/:orgId', governanceController.updateLendingConfig);

module.exports = router;
