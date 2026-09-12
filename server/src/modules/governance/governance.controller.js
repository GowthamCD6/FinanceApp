const governanceService = require('./governance.service');

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
      res.status(201).json({ success: true, message: 'Category created successfully', data });
    } catch (err) {
      next(err);
    }
  },

  updateDefaultCategory: async (req, res, next) => {
    try {
      const { code } = req.params;
      const data = await governanceService.updateDefaultCategory(code, req.body);
      res.json({ success: true, message: 'Category updated successfully', data });
    } catch (err) {
      next(err);
    }
  },

  deleteDefaultCategory: async (req, res, next) => {
    try {
      const { code } = req.params;
      const data = await governanceService.deleteDefaultCategory(code);
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
      res.status(201).json({ success: true, message: 'Broadcast sent successfully', data });
    } catch (err) {
      next(err);
    }
  },

  deleteBroadcast: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await governanceService.deleteBroadcast(id);
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
      res.json({ success: true, message: 'Setting updated successfully', data });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = governanceController;
