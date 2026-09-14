const express = require('express');
const router = express.Router();
const { login, googleLogin, getProfile } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', authenticate, getProfile);

module.exports = router;
