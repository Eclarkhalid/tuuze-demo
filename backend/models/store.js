// backend/models/store.js
const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true,
    maxlength: [50, 'Store name cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Store description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  logo: {
    type: String,
    default: 'default-store.png'
  },
  coverImage: {
    type: String,
    default: 'default-cover.png'
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required']
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  contact: {
    email: String,
    phone: String,
    website: String
  },
  operatingHours: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    open: {
      type: Boolean,
      default: true
    },
    openTime: {
      type: String,
      default: '09:00'
    },
    closeTime: {
      type: String,
      default: '17:00'
    }
  }],
  categories: [{
    type: String,
    trim: true
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for location-based queries
storeSchema.index({ location: '2dsphere' });

// Update the updatedAt field on save
storeSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual field for products
storeSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'store'
});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;