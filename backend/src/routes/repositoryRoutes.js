const express = require('express');
const router = express.Router();
const repositoryController = require('../controllers/repositoryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, repositoryController.getAllRepositories);
router.get('/stats', protect, repositoryController.getRepositoryStats);
router.get('/:id', protect, repositoryController.getRepositoryById);
router.post('/', protect, authorize('ADMIN'), repositoryController.createRepository);
router.put('/:id', protect, authorize('ADMIN'), repositoryController.updateRepository);
router.put('/:id/decrypt', protect, authorize('ADMIN'), repositoryController.decryptRepository);
router.delete('/:id', protect, authorize('ADMIN'), repositoryController.deleteRepository);

module.exports = router;
