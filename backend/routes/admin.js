// backend/routes/admin.js
const express = require('express');
const adminController = require('../controllers/admin');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(restrictTo('admin'));

// Platform statistics
router.get('/stats', adminController.getStats);

// User management
router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id/status', adminController.updateUserStatus);

// Store management
router.get('/stores', adminController.getStores);

module.exports = router;