const organizationService = require('./organization.service');

const organizationController = {
  // GET /api/organizations
  getAllOrganizations: async (req, res, next) => {
    try {
      const data = await organizationService.getAllOrganizations();
      res.json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/organizations/:id
  getOrganizationById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await organizationService.getOrganizationById(id);
      res.json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/organizations
  createOrganization: async (req, res, next) => {
    try {
      const data = await organizationService.createOrganization(req.body);
      res.status(201).json({
        success: true,
        message: 'Organization created successfully',
        data,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  },

  // PATCH /api/organizations/:id/status
  updateOrganizationStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const data = await organizationService.updateOrganizationStatus(id, status);
      res.json({
        success: true,
        message: `Organization status updated to ${status}`,
        data,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  },
};

module.exports = organizationController;
