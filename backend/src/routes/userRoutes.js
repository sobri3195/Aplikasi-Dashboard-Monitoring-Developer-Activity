const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { validateRequest } = require('../utils/validators');
const Joi = require('joi');

const passwordChangeSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required()
});

const passwordResetRequestSchema = Joi.object({
  email: Joi.string().email().required()
});

const passwordResetSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).required()
});

router.get('/', protect, authorize('ADMIN'), userController.getAllUsers);
router.get('/stats', protect, authorize('ADMIN'), userController.getUserStats);
router.get('/:id', protect, userController.getUserById);
router.put('/:id', protect, authorize('ADMIN'), userController.updateUser);
router.delete('/:id', protect, authorize('ADMIN'), userController.deleteUser);
router.post('/change-password', protect, validateRequest(passwordChangeSchema), userController.changePassword);
router.post('/request-password-reset', validateRequest(passwordResetRequestSchema), userController.requestPasswordReset);
router.post('/reset-password', validateRequest(passwordResetSchema), userController.resetPassword);

module.exports = router;
