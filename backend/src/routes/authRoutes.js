const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRequest, userRegistrationSchema, userLoginSchema } = require('../utils/validators');

router.post('/register', validateRequest(userRegistrationSchema), authController.register);
router.post('/login', validateRequest(userLoginSchema), authController.login);
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);

module.exports = router;
