// backend/routes/order.js
const express = require('express');
const orderController = require('../controllers/order');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Customer routes
router.post('/', orderController.createOrder);
router.get('/me', orderController.getMyOrders);
router.patch('/:id/cancel', orderController.cancelOrder);

// Vendor routes
router.get('/store', restrictTo('vendor'), orderController.getStoreOrders);
router.patch('/:id/status', restrictTo('vendor'), orderController.updateOrderStatus);

// Both customer and vendor can view order details
router.get('/:id', orderController.getOrder);

module.exports = router;