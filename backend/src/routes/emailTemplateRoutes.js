const express = require('express');
const router = express.Router();
const emailTemplateController = require('../controllers/emailTemplateController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/', emailTemplateController.getAllTemplates);
router.get('/:templateKey', emailTemplateController.getTemplateByKey);
router.post('/', emailTemplateController.createTemplate);
router.put('/:id', emailTemplateController.updateTemplate);
router.delete('/:id', emailTemplateController.deleteTemplate);
router.post('/:id/preview', emailTemplateController.previewTemplate);
router.post('/:id/test', emailTemplateController.sendTestEmail);

module.exports = router;
