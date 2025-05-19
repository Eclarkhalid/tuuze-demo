// backend/controllers/order.js
const Order = require('../models/order');
const Product = require('../models/product');
const Store = require('../models/store');

// Create a new order (reservation)
exports.createOrder = async (req, res) => {
  try {
    const { storeId, orderItems, pickupDate, pickupTime, notes } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items provided'
      });
    }

    // Verify store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Verify and process order items
    const processedItems = [];
    let totalAmount = 0;

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`
        });
      }

      if (!product.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}" is not available`
        });
      }

      if (product.inventory < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough inventory for "${product.name}"`
        });
      }

      processedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });

      totalAmount += product.price * item.quantity;

      // Update inventory
      product.inventory -= item.quantity;
      await product.save();
    }

    // Create the order
    const order = await Order.create({
      customer: req.user._id,
      store: storeId,
      orderItems: processedItems,
      totalAmount,
      pickupDate,
      pickupTime,
      notes
    });

    res.status(201).json({
      success: true,
      data: {
        order
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get customer orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('store', 'name address location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: {
        orders
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single order
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('store', 'name address location contact')
      .populate('customer', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if the user is authorized to view this order
    if (
      req.user.role !== 'admin' && 
      order.customer._id.toString() !== req.user._id.toString()
    ) {
      // If user is a vendor, check if the order is for their store
      const store = await Store.findOne({ owner: req.user._id });
      
      if (!store || order.store._id.toString() !== store._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view this order'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        order
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get store orders (for vendors)
exports.getStoreOrders = async (req, res) => {
  try {
    // Get store id of the logged-in vendor
    const store = await Store.findOne({ owner: req.user._id });
    
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Get query parameters
    const { status, sort = '-createdAt' } = req.query;
    
    // Build query
    const query = { store: store._id };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .sort(sort);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: {
        orders
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update order status (for vendors)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
      });
    }

    // Find the order
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if the order belongs to the vendor's store
    const store = await Store.findOne({ owner: req.user._id });
    
    if (!store || order.store.toString() !== store._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this order'
      });
    }

    // Update the order status
    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      data: {
        order
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Cancel order (for customers)
exports.cancelOrder = async (req, res) => {
  try {
    // Find the order
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if the order belongs to the customer
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this order'
      });
    }

    // Check if order can be cancelled
    if (['completed', 'ready', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled when in ${order.status} status`
      });
    }

    // Update the order status
    order.status = 'cancelled';
    await order.save();

    // Restore inventory
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { inventory: item.quantity }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        order
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};