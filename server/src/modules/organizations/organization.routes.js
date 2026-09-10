const express = require('express');
const router = express.Router();
const organizationController = require('./organization.controller');

// List all organizations
router.get('/', organizationController.getAllOrganizations);

// Get single organization
router.get('/:id', organizationController.getOrganizationById);

// Create new organization
router.post('/', organizationController.createOrganization);

// Update organization status
router.patch('/:id/status', organizationController.updateOrganizationStatus);

module.exports = router;
