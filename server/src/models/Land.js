const mongoose = require('mongoose');

const landSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, index: true },
  description: { type: String, trim: true },
  price: { type: Number, required: true, index: true },
  location: { type: String, required: true, index: true },
  area: { type: Number, required: true },
  areaUnit: { 
    type: String, 
    enum: ['Sq. Ft', 'Sq. Yds', 'Acres', 'Cents', 'Guntas'], 
    default: 'Sq. Ft' 
  },
  propertyType: { 
    type: String, 
    enum: ['Residential', 'Commercial', 'Agricultural', 'Industrial'], 
    default: 'Residential',
    index: true 
  },
  images: [{ type: String }],
  videoUrl: { type: String, default: null },
  cloudinaryPublicIds: [{ type: String }],
  status: { 
    type: String, 
    enum: ['draft', 'published', 'sold'], 
    default: 'published',
    index: true 
  },
  publishedAt: { type: Date, default: Date.now, index: true },
  soldAt: { type: Date, default: null },
  expireAt: { 
    type: Date, 
    default: null, 
    expires: 432000 // 5 days in seconds
  }
}, { timestamps: true });

module.exports = mongoose.model('Land', landSchema);
