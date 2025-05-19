// backend/controllers/product.js
const Product = require('../models/product');
const Store = require('../models/store');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    // Get store id of the logged-in vendor
    const store = await Store.findOne({ owner: req.user._id });
    
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found. Please create a store first.'
      });
    }

    // Check if store is verified
    if (!store.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your store needs to be verified before adding products.'
      });
    }

    // Create new product
    const product = await Product.create({
      store: store._id,
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      subcategory: req.body.subcategory,
      inventory: req.body.inventory,
      tags: req.body.tags
    });

    res.status(201).json({
      success: true,
      data: {
        product
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all products for a store
exports.getStoreProducts = async (req, res) => {
  try {
    const { storeId } = req.params;
    
    const products = await Product.find({ store: storeId, isAvailable: true })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: {
        products
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get a single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('store', 'name address location');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        product
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    // Find the product
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if the product belongs to the vendor's store
    const store = await Store.findOne({ owner: req.user._id });
    
    if (!store || product.store.toString() !== store._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this product'
      });
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: {
        product: updatedProduct
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    // Find the product
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if the product belongs to the vendor's store
    const store = await Store.findOne({ owner: req.user._id });
    
    if (!store || product.store.toString() !== store._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this product'
      });
    }

    // Delete the product
    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get vendor products
exports.getMyProducts = async (req, res) => {
  try {
    // Get store id of the logged-in vendor
    const store = await Store.findOne({ owner: req.user._id });
    
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    const products = await Product.find({ store: store._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: {
        products
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const { query, category } = req.query;
    
    const searchQuery = {};
    
    // Add text search if query parameter exists
    if (query) {
      searchQuery.$text = { $search: query };
    }
    
    // Add category filter if category parameter exists
    if (category) {
      searchQuery.category = category;
    }
    
    // Add availability filter
    searchQuery.isAvailable = true;

    const products = await Product.find(searchQuery)
      .populate('store', 'name location')
      .sort({ 
        score: { $meta: 'textScore' }
      });

    res.status(200).json({
      success: true,
      count: products.length,
      data: {
        products
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};