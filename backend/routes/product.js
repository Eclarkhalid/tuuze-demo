// backend/routes/product.js
const express = require('express');
const productController = require('../controllers/product');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/search', productController.searchProducts);
router.get('/store/:storeId', productController.getStoreProducts);
router.get('/:id', productController.getProduct);

// Protected routes (require authentication)
router.use(protect);
router.get('/me/products', restrictTo('vendor'), productController.getMyProducts);
router.post('/', restrictTo('vendor'), productController.createProduct);
router.patch('/:id', restrictTo('vendor'), productController.updateProduct);
router.delete('/:id', restrictTo('vendor'), productController.deleteProduct);

module.exports = router;