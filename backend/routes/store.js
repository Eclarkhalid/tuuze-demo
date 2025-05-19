// backend/routes/store.js
const express = require('express');
const storeController = require('../controllers/store');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/nearby', storeController.getNearbyStores);
router.get('/:id', storeController.getStore);

// Protected routes (require authentication)
router.use(protect);
router.post('/', storeController.createStore);
router.get('/me/store', storeController.getMyStore);
router.patch('/me/store', storeController.updateStore);
router.patch('/me/store/deactivate', storeController.deactivateStore);

// Admin only routes
router.use(restrictTo('admin'));
router.get('/', storeController.getAllStores);
router.patch('/:id/verify', storeController.verifyStore);

module.exports = router;