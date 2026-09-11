const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { authenticate } = require('../../middleware/auth');

// Support authenticated requests (with optional fallback for initial enrollment)
router.use((req, res, next) => {
  if (req.headers.authorization) {
    return authenticate(req, res, next);
  }
  next();
});

router.post('/', userController.createUser);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);

module.exports = router;
