const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');

// Support authenticated requests (with optional fallback for initial enrollment)
router.use((req, res, next) => {
  if (req.headers.authorization) {
    return authenticate(req, res, next);
  }
  next();
});

// Biometric & Fingerprint Security Settings
router.post('/security/biometrics', userController.saveBiometrics);
router.get('/security/biometrics', userController.getBiometrics);

// GPS Location Management
router.post('/locations', userController.saveLocation);
router.get('/locations', userController.getLocation);

// Admin View All Locations
router.get('/locations/all', userController.getAdminUserLocations);

router.post('/', userController.createUser);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.patch('/:id/status', userController.updateUserStatus);

module.exports = router;

