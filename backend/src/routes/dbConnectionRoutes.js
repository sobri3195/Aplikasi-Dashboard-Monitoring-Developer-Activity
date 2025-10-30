const express = require('express');
const router = express.Router();
const dbConnectionController = require('../controllers/dbConnectionController');

// Public routes - can be accessed without authentication for setup
router.get('/status', dbConnectionController.getConnectionStatus);
router.get('/test', dbConnectionController.testConnection);
router.get('/guide', dbConnectionController.getConnectionGuide);

module.exports = router;
