const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true, trim: true },
  publicId: { type: String, required: true, trim: true },
  caption: { type: String, trim: true, default: '' },
  isFeatured: { type: Boolean, default: false }
}, { _id: false });

const videoSchema = new mongoose.Schema({
  url: { type: String, required: true, trim: true },
  publicId: { type: String, required: true, trim: true },
  title: { type: String, trim: true, default: '' }
}, { _id: false });

const floorPlanSchema = new mongoose.Schema({
  url: { type: String, required: true, trim: true },
  publicId: { type: String, required: true, trim: true },
  title: { type: String, trim: true, default: '' }
}, { _id: false });

const propertySchema = new mongoose.Schema({
  propertyId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Property description is required'],
    trim: true
  },
  propertyType: {
    type: String,
    required: [true, 'Property type is required'],
    index: true
  },
  listingType: {
    type: String,
    required: true,
    enum: ['Sale', 'Rent', 'Lease'],
    default: 'Sale',
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Available', 'Under Offer', 'Sold', 'published', 'draft', 'sold'],
    default: 'Available',
    index: true
  },
  pricing: {
    price: {
      type: Number,
      required: [true, 'Property price is required'],
      min: [0, 'Price cannot be negative'],
      index: true
    },
    priceType: {
      type: String,
      enum: ['Total', 'Per Unit'],
      required: [true, 'Price type is required']
    },
    priceNegotiable: {
      type: Boolean,
      default: false
    },
    maintenanceCharges: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  specifications: {
    carpetAreaSqFt: { type: Number, min: 0, default: 0 },
    areaUnit: { type: String, default: '' },
    bhkType: { type: String, default: '' }
  },
  location: {
    address: { type: String, required: [true, 'Address is required'], trim: true },
    locality: { type: String, trim: true, index: true, default: '' },
    city: { type: String, required: [true, 'City is required'], trim: true, index: true },
    state: { type: String, required: [true, 'State is required'], trim: true },
    pincode: { type: String, required: [true, 'Pincode is required'], trim: true },
    landmark: { type: String, trim: true, default: '' },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    }
  },
  amenities: [{
    type: String,
    trim: true
  }],
  media: {
    images: [imageSchema],
    videos: [videoSchema],
    floorPlans: [floorPlanSchema]
  },
  meta: {
    isVerified: { type: Boolean, default: true },
    featuredPriority: { type: Number, default: 0 }
  },
  publishedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  soldAt: {
    type: Date,
    default: null
  },
  expireAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Compound & Performance Indexes
propertySchema.index({ status: 1, 'pricing.price': 1 });
propertySchema.index({ 'location.city': 1, 'pricing.price': 1 });

module.exports = mongoose.model('Property', propertySchema);
