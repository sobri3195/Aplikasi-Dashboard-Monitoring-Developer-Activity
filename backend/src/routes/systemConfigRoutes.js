const express = require('express');
const router = express.Router();
const systemConfigController = require('../controllers/systemConfigController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/', systemConfigController.getAllConfigs);
router.get('/categories', systemConfigController.getCategories);
router.post('/', systemConfigController.createConfig);
router.post('/bulk', systemConfigController.bulkUpdate);
router.get('/:key', systemConfigController.getConfig);
router.put('/:key', systemConfigController.updateConfig);
router.delete('/:key', systemConfigController.deleteConfig);

module.exports = router;
