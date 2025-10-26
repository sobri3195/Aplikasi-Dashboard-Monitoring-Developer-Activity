const Joi = require('joi');

const deviceRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  deviceName: Joi.string().min(3).max(100).required(),
  fingerprint: Joi.string().required(),
  hostname: Joi.string().optional(),
  macAddress: Joi.string().optional(),
  cpuInfo: Joi.string().optional(),
  osInfo: Joi.string().optional(),
  ipAddress: Joi.string().ip({ version: ['ipv4', 'ipv6'] }).optional()
});

const activityLogSchema = Joi.object({
  deviceId: Joi.string().uuid().required(),
  activityType: Joi.string().valid(
    'GIT_CLONE',
    'GIT_PULL',
    'GIT_PUSH',
    'GIT_COMMIT',
    'GIT_CHECKOUT',
    'REPO_ACCESS',
    'REPO_COPY',
    'UNAUTHORIZED_ACCESS'
  ).required(),
  repository: Joi.string().optional(),
  branch: Joi.string().optional(),
  commitHash: Joi.string().optional(),
  details: Joi.object().optional(),
  ipAddress: Joi.string().ip().optional()
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const userRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(3).max(100).required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('ADMIN', 'DEVELOPER', 'VIEWER').optional()
});

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }
    
    req.validatedData = value;
    next();
  };
};

module.exports = {
  deviceRegistrationSchema,
  activityLogSchema,
  userLoginSchema,
  userRegistrationSchema,
  validateRequest
};
