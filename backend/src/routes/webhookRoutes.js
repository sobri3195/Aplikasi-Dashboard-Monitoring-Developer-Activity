const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

router.post('/gitlab', webhookController.handleGitLabWebhook);
router.get('/test', webhookController.testWebhook);

module.exports = router;
