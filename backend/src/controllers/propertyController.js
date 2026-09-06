const Land = require('../models/Land');
const cloudinary = require('../config/cloudinary');

const getPublicProperties = async (req, res) => {
  const { search, location, propertyType, minPrice, maxPrice, minArea, maxArea, sortBy, status } = req.query;
  
  const query = {
    publishedAt: { $lte: new Date() }
  };

  if (status && status !== 'All') {
    query.status = status.toLowerCase();
  } else {
    query.status = { $in: ['published', 'sold'] };
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  if (location && location !== 'All') {
    query.location = { $regex: location, $options: 'i' };
  }
  if (propertyType && propertyType !== 'All') {
    query.propertyType = { $regex: propertyType, $options: 'i' };
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
    else if (sortBy === 'newest') sortObj = { publishedAt: -1, createdAt: -1 };
  }

  const properties = await Land.find(query).sort(sortObj);
  res.status(200).json(properties);
};

const mongoose = require('mongoose');

const getPublicProperty = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: 'Property not found' });
  }

  const property = await Land.findOne({
    _id: req.params.id,
    status: { $in: ['published', 'sold'] },
    publishedAt: { $lte: new Date() }
  });

  if (!property) {
    return res.status(404).json({ message: 'Property not found' });
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

// Secure backend upload endpoint
const uploadMedia = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  try {
    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const isVideo = file.mimetype.startsWith('video/');
        
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto' },
          (error, result) => {
            if (error) reject(error);
            else resolve({ url: result.secure_url, publicId: result.public_id, isVideo });
          }
        );
        
        uploadStream.end(file.buffer);
      });
    });

    const results = await Promise.all(uploadPromises);
    res.status(200).json({ results });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ message: 'Failed to upload media to Cloudinary' });
  }
};

module.exports = {
  getPublicProperties,
  getPublicProperty,
  getAllAdminProperties,
  createProperty,
  markSold,
  deleteProperty,
  uploadMedia
};
