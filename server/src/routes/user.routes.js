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

// Notification Preferences
router.post('/preferences/notifications', userController.saveNotificationPreferences);
router.get('/preferences/notifications', userController.getNotificationPreferences);
router.post('/preferences', userController.saveNotificationPreferences);
router.get('/preferences', userController.getNotificationPreferences);

// GPS Location Management
router.post('/locations', userController.saveLocation);
router.get('/locations', userController.getLocation);

// Admin View All Locations
router.get('/locations/all', userController.getAdminUserLocations);

// Session Verification & Force Logout Controls
router.get('/session/verify', userController.verifySession);
router.post('/session/clear-force-logout', userController.clearForceLogout);
router.post('/force-logout', userController.forceLogout);
router.post('/block', userController.blockUserHandler);
router.post('/unblock', userController.unblockUserHandler);
router.get('/admin/all', userController.getAllUsersForAdmin);
router.get('/getAllUsers', userController.getAllUsersForAdmin);

// Password Management Endpoints
router.get('/:id/passwordDetails', userController.getUserPasswordDetails);
router.get('/passwordDetails/:id', userController.getUserPasswordDetails);
router.post('/updatePassword', userController.updateUserPassword);
router.post('/:id/updatePassword', userController.updateUserPassword);
router.post('/resetPassword', userController.resetUserPassword);
router.post('/:id/resetPassword', userController.resetUserPassword);

router.post('/', userController.createUser);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.patch('/:id/status', userController.updateUserStatus);

module.exports = router;

