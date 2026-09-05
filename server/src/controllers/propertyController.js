const Land = require('../models/Land');
const cloudinary = require('../config/cloudinary');

const getPublicProperties = async (req, res) => {
  const { search, propertyType, minPrice, maxPrice, minArea, maxArea, sortBy } = req.query;
  
  const query = {
    status: { $in: ['published', 'sold'] },
    publishedAt: { $lte: new Date() }
  };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } }
    ];
  }
  if (propertyType && propertyType !== 'All') {
    query.propertyType = propertyType;
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (minArea || maxArea) {
    query.area = {};
    if (minArea) query.area.$gte = Number(minArea);
    if (maxArea) query.area.$lte = Number(maxArea);
  }

  let sortObj = { createdAt: -1 };
  if (sortBy) {
    if (sortBy === 'price_asc') sortObj = { price: 1 };
    else if (sortBy === 'price_desc') sortObj = { price: -1 };
    else if (sortBy === 'newest') sortObj = { publishedAt: -1 };
  }

  const properties = await Land.find(query).sort(sortObj);
  res.status(200).json(properties);
};

const getPublicProperty = async (req, res) => {
  const property = await Land.findOne({
    _id: req.params.id,
    status: { $in: ['published', 'sold'] },
    publishedAt: { $lte: new Date() }
  });

  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  res.status(200).json(property);
};

const getAllAdminProperties = async (req, res) => {
  const properties = await Land.find({}).sort({ createdAt: -1 });
  res.status(200).json(properties);
};

const createProperty = async (req, res) => {
  const property = await Land.create(req.body);
  res.status(201).json(property);
};

const markSold = async (req, res) => {
  const property = await Land.findById(req.params.id);
  
  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  property.status = 'sold';
  property.soldAt = new Date();
  property.expireAt = new Date(); // triggers TTL deletion in 5 days
  
  const updatedProperty = await property.save();
  res.status(200).json(updatedProperty);
};

const deleteProperty = async (req, res) => {
  const property = await Land.findById(req.params.id);
  
  if (!property) {
    res.status(404);
    throw new Error('Property not found');
  }

  // Delete assets from Cloudinary
  if (property.cloudinaryPublicIds && property.cloudinaryPublicIds.length > 0) {
    for (const publicId of property.cloudinaryPublicIds) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error(`Failed to delete Cloudinary asset ${publicId}:`, error);
      }
    }
  }

  await property.deleteOne();
  res.status(200).json({ id: req.params.id });
};

// Endpoint to get Cloudinary signature
const getCloudinarySignature = async (req, res) => {
  const timestamp = Math.round((new Date).getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request({
    timestamp: timestamp
  }, process.env.CLOUDINARY_API_SECRET);
  
  res.status(200).json({ 
    timestamp, 
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY
  });
};

module.exports = {
  getPublicProperties,
  getPublicProperty,
  getAllAdminProperties,
  createProperty,
  markSold,
  deleteProperty,
  getCloudinarySignature
};
