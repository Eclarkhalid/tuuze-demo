// backend/controllers/store.js
const Store = require('../models/store');
const User = require('../models/user');

// Create a new store
exports.createStore = async (req, res) => {
  try {
    // Check if user already has a store
    const existingStore = await Store.findOne({ owner: req.user._id });
    
    if (existingStore && req.user.role === 'vendor') {
      return res.status(400).json({
        success: false,
        message: 'You already have a store. You can only have one store per account.'
      });
    }

    // If user is not a vendor, update their role
    if (req.user.role !== 'vendor') {
      await User.findByIdAndUpdate(req.user._id, { role: 'vendor' });
    }

    // Create operating hours array with default values
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const operatingHours = days.map(day => ({
      day,
      open: true,
      openTime: '09:00',
      closeTime: '17:00'
    }));

    // Create the new store
    const store = await Store.create({
      owner: req.user._id,
      name: req.body.name,
      description: req.body.description,
      address: req.body.address,
      location: {
        type: 'Point',
        coordinates: [req.body.longitude, req.body.latitude]
      },
      contact: req.body.contact,
      operatingHours,
      categories: req.body.categories || []
    });

    res.status(201).json({
      success: true,
      data: {
        store
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get store by ID
exports.getStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('products');

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        store
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get current user's store
exports.getMyStore = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id })
      .populate('products');

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'You do not have a store yet'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        store
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update store
exports.updateStore = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Fields to update
    const fieldsToUpdate = {
      name: req.body.name,
      description: req.body.description,
      address: req.body.address,
      contact: req.body.contact,
      categories: req.body.categories,
      operatingHours: req.body.operatingHours
    };

    // Update location if coordinates are provided
    if (req.body.longitude && req.body.latitude) {
      fieldsToUpdate.location = {
        type: 'Point',
        coordinates: [req.body.longitude, req.body.latitude]
      };
    }

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const updatedStore = await Store.findByIdAndUpdate(
      store._id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: {
        store: updatedStore
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get nearby stores
exports.getNearbyStores = async (req, res) => {
  try {
    const { longitude, latitude, distance = 10000 } = req.query; // distance in meters, default 10km

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide longitude and latitude coordinates'
      });
    }

    // Find stores within the given distance
    const stores = await Store.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(distance)
        }
      },
      isActive: true,
      isVerified: true
    }).select('-operatingHours');

    res.status(200).json({
      success: true,
      count: stores.length,
      data: {
        stores
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all stores (admin only)
exports.getAllStores = async (req, res) => {
  try {
    const stores = await Store.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: stores.length,
      data: {
        stores
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Verify store (admin only)
exports.verifyStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        store
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Deactivate store
exports.deactivateStore = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    store.isActive = false;
    await store.save();

    res.status(200).json({
      success: true,
      message: 'Store deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};