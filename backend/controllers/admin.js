// backend/controllers/admin.js
const User = require('../models/user');
const Store = require('../models/store');
const Product = require('../models/product');
const Order = require('../models/order');

// Get platform statistics
exports.getStats = async (req, res) => {
  try {
    // Perform aggregations to get counts
    const userCount = await User.countDocuments();
    const storeCount = await Store.countDocuments();
    const pendingStores = await Store.countDocuments({ isVerified: false });
    const verifiedStores = await Store.countDocuments({ isVerified: true });
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    const activeOrders = await Order.countDocuments({ 
      status: { $in: ['pending', 'accepted', 'ready'] } 
    });
    const completedOrders = await Order.countDocuments({ status: 'completed' });

    res.status(200).json({
      success: true,
      data: {
        userCount,
        storeCount,
        pendingStores,
        verifiedStores,
        productCount,
        orderCount,
        activeOrders,
        completedOrders
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve platform statistics'
    });
  }
};

// Get all users with pagination and search
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    // Build search query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Count total users matching query
    const totalCount = await User.countDocuments(query);
    
    // Get paginated users
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      totalCount,
      data: {
        users
      }
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users'
    });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Validate role
    if (!['customer', 'vendor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role'
    });
  }
};

// Update user active status
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    
    // Validate active status
    if (typeof active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Invalid active status specified'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { active },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

// Get stores with filter
exports.getStores = async (req, res) => {
  try {
    const { filter = 'all' } = req.query;
    
    // Build filter query
    const query = {};
    if (filter === 'pending') {
      query.isVerified = false;
    } else if (filter === 'verified') {
      query.isVerified = true;
    }
    
    // Get stores
    const stores = await Store.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: {
        stores
      }
    });
  } catch (error) {
    console.error('Error getting stores:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve stores'
    });
  }
};