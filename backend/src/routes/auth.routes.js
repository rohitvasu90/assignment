const express = require('express');
const authController = require('../controllers/auth.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { loginValidator } = require('../validators');

const router = express.Router();

router.post('/login', loginValidator, validate, authController.login);
router.get('/me', authenticate, authController.getProfile);

module.exports = router;
