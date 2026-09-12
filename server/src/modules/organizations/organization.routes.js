const express = require('express');
const router = express.Router();
const organizationController = require('./organization.controller');

// List all organizations
router.get('/', organizationController.getAllOrganizations);

// Get single organization
router.get('/:id', organizationController.getOrganizationById);

// Create new organization
router.post('/', organizationController.createOrganization);

// Update organization details
router.put('/:id', organizationController.updateOrganization);

// Update organization status
router.patch('/:id/status', organizationController.updateOrganizationStatus);

// Branches management
router.get('/:id/branches', organizationController.getBranches);
router.post('/:id/branches', organizationController.createBranch);

// Lending schemes & Interest rate configuration
router.get('/:id/lending-config', organizationController.getLendingConfig);
router.put('/:id/lending-config', organizationController.updateLendingConfig);

module.exports = router;
