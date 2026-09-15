const governanceService = require('../services/governance.service');

const governanceController = {
  getDefaultCategories: async (req, res, next) => {
    try {
      const data = await governanceService.getDefaultCategories();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  createDefaultCategory: async (req, res, next) => {
    try {
      const data = await governanceService.createDefaultCategory(req.body);
      governanceService.logAudit({
        user_id: req.user?.id || null,
        user_name: req.user?.name || 'Super Admin',
        user_email: req.user?.email || 'admin@fundlending.com',
        action: 'CATEGORY_CREATED',
        entity_type: 'GOVERNANCE',
        entity_id: req.body?.code || 'CAT',
        reason: `Created lending category blueprint: ${req.body?.name || ''}`,
        status: 'SUCCESS',
      });
      res.status(201).json({ success: true, message: 'Category created successfully', data });
    } catch (err) {
      next(err);
    }
  },

  updateDefaultCategory: async (req, res, next) => {
    try {
      const { code } = req.params;
      const data = await governanceService.updateDefaultCategory(code, req.body);
      governanceService.logAudit({
        user_id: req.user?.id || null,
        user_name: req.user?.name || 'Super Admin',
        user_email: req.user?.email || 'admin@fundlending.com',
        action: 'CATEGORY_UPDATED',
        entity_type: 'GOVERNANCE',
        entity_id: code,
        reason: `Updated lending category blueprint: ${req.body?.name || code}`,
        status: 'SUCCESS',
      });
      res.json({ success: true, message: 'Category updated successfully', data });
    } catch (err) {
      next(err);
    }
  },

  deleteDefaultCategory: async (req, res, next) => {
    try {
      const { code } = req.params;
      const data = await governanceService.deleteDefaultCategory(code);
      governanceService.logAudit({
        user_id: req.user?.id || null,
        user_name: req.user?.name || 'Super Admin',
        user_email: req.user?.email || 'admin@fundlending.com',
        action: 'CATEGORY_DELETED',
        entity_type: 'GOVERNANCE',
        entity_id: code,
        reason: `Archived lending category blueprint: ${code}`,
        status: 'SUCCESS',
      });
      res.json({ success: true, message: 'Category deleted successfully', data });
    } catch (err) {
      next(err);
    }
  },

  getPrivacyPolicies: async (req, res, next) => {
    try {
      const data = await governanceService.getPrivacyPolicies();
      const active = await governanceService.getActivePrivacyPolicy();
      res.json({ success: true, data, active });
    } catch (err) {
      next(err);
    }
  },

  updatePrivacyPolicy: async (req, res, next) => {
    try {
      const data = await governanceService.updatePrivacyPolicy(req.body);
      governanceService.logAudit({
        user_id: req.user?.id || null,
        user_name: req.user?.name || 'Super Admin',
        user_email: req.user?.email || 'admin@fundlending.com',
        action: 'POLICY_UPDATED',
        entity_type: 'PRIVACY_POLICY',
        entity_id: req.body?.version || 'POLICY',
        reason: `Published Privacy Policy update version ${req.body?.version || 'v2.1'}`,
        status: 'SUCCESS',
      });
      res.json({ success: true, message: 'Privacy Policy updated & published', data });
    } catch (err) {
      next(err);
    }
  },

  getAppVersions: async (req, res, next) => {
    try {
      const { platform } = req.query;
      const data = await governanceService.getAppVersions(platform);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  createAppVersion: async (req, res, next) => {
    try {
      const data = await governanceService.createAppVersion(req.body);
      governanceService.logAudit({
        user_id: req.user?.id || null,
        user_name: req.user?.name || 'Super Admin',
        user_email: req.user?.email || 'admin@fundlending.com',
        action: 'APP_VERSION_RELEASED',
        entity_type: 'MOBILE_APP',
        entity_id: `${req.body?.platform || 'APP'}-${req.body?.version || '1.0'}`,
        reason: `Released ${req.body?.platform || 'Mobile'} app version ${req.body?.version || ''}`,
        status: 'SUCCESS',
      });
      res.status(201).json({ success: true, message: 'App version release created', data });
    } catch (err) {
      next(err);
    }
  },

  getAuditLogs: async (req, res, next) => {
    try {
      const data = await governanceService.getAuditLogs(req.query);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  getBroadcasts: async (req, res, next) => {
    try {
      const data = await governanceService.getBroadcasts();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  createBroadcast: async (req, res, next) => {
    try {
      const data = await governanceService.createBroadcast(req.body);
      governanceService.logAudit({
        user_id: req.user?.id || null,
        user_name: req.user?.name || 'Super Admin',
        user_email: req.user?.email || 'admin@fundlending.com',
        action: 'BROADCAST_DISPATCHED',
        entity_type: 'BROADCAST',
        entity_id: `BC-${data?.id || 'NEW'}`,
        reason: `Broadcast dispatched to ${req.body?.audience || 'ALL_USERS'}: "${req.body?.title || ''}"`,
        status: 'SUCCESS',
      });
      res.status(201).json({ success: true, message: 'Broadcast sent successfully', data });
    } catch (err) {
      next(err);
    }
  },

  deleteBroadcast: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await governanceService.deleteBroadcast(id);
      governanceService.logAudit({
        user_id: req.user?.id || null,
        user_name: req.user?.name || 'Super Admin',
        user_email: req.user?.email || 'admin@fundlending.com',
        action: 'BROADCAST_DELETED',
        entity_type: 'BROADCAST',
        entity_id: `BC-${id}`,
        reason: `Archived broadcast announcement #${id}`,
        status: 'SUCCESS',
      });
      res.json({ success: true, message: 'Broadcast deleted successfully', data });
    } catch (err) {
      next(err);
    }
  },

  getApiMetrics: async (req, res, next) => {
    try {
      const data = await governanceService.getApiMetrics(req.query);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  getSystemSettings: async (req, res, next) => {
    try {
      const data = await governanceService.getSystemSettings();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  updateSystemSetting: async (req, res, next) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      const data = await governanceService.updateSystemSetting(key, value);
      governanceService.logAudit({
        user_id: req.user?.id || null,
        user_name: req.user?.name || 'Super Admin',
        user_email: req.user?.email || 'admin@fundlending.com',
        action: 'SETTINGS_UPDATED',
        entity_type: 'SYSTEM',
        entity_id: key,
        reason: `Updated global system setting ${key}`,
        status: 'SUCCESS',
      });
      res.json({ success: true, message: 'Setting updated successfully', data });
    } catch (err) {
      next(err);
    }
  },

  getLendingConfig: async (req, res, next) => {
    try {
      const orgId = req.params.orgId || req.query.orgId || 1;
      const data = await governanceService.getLendingConfig(orgId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  updateLendingConfig: async (req, res, next) => {
    try {
      const orgId = req.params.orgId || req.query.orgId || 1;
      const data = await governanceService.updateLendingConfig(orgId, req.body);
      res.json({ success: true, message: 'Organization lending schemes updated', data });
    } catch (err) {
      next(err);
    }
  },

  getClusterNodes: async (req, res, next) => {
    try {
      const data = await governanceService.getClusterNodes();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  getClusterTelemetry: async (req, res, next) => {
    try {
      const data = await governanceService.getClusterTelemetry();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  actionClusterNode: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { action } = req.body;
      const data = await governanceService.actionClusterNode(id, action);
      res.json({ success: true, message: `Node action '${action}' applied successfully`, data });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = governanceController;
