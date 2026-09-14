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

const crypto = require('crypto');

// Extract first 3 letters of location in uppercase, falling back to 'LOC' if shorter than 3 letters
const getLocationPrefix = (location = '') => {
  const lettersOnly = (location || '').replace(/[^a-zA-Z]/g, '').toUpperCase();
  let prefix = lettersOnly.slice(0, 3);
  if (prefix.length < 3) {
    prefix = (prefix + 'LOC').slice(0, 3);
  }
  return prefix;
};

// Generate unique propertyId in format "{LOC}-XXXXX" using first 3 letters of location
const generateUniquePropertyId = async (location = '') => {
  const prefix = getLocationPrefix(location);
  let isUnique = false;
  let customId = '';
  while (!isUnique) {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    customId = `${prefix}-${randomNum}`;
    const existing = await Land.findOne({ propertyId: customId });
    if (!existing) {
      isUnique = true;
    }
  }
  return customId;
};

const getPublicProperty = async (req, res) => {
  const targetId = (req.params.propertyId || req.params.id || '').trim().toUpperCase();
  if (!targetId) {
    return res.status(404).json({ message: 'Property not found' });
  }

  const property = await Land.findOne({
    propertyId: targetId,
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
  try {
    let { propertyId, ...rest } = req.body;

    if (propertyId && typeof propertyId === 'string' && propertyId.trim()) {
      propertyId = propertyId.trim().toUpperCase();

      // Format validation: alphanumeric and hyphens/underscores, 3-30 chars
      const formatRegex = /^[A-Z0-9_-]{3,30}$/;
      if (!formatRegex.test(propertyId)) {
        return res.status(400).json({ 
          message: 'Invalid Property ID format. Use 3-30 characters of uppercase letters, numbers, hyphens or underscores.' 
        });
      }

      // Check uniqueness
      const existing = await Land.findOne({ propertyId });
      if (existing) {
        return res.status(409).json({ 
          message: `Property ID "${propertyId}" already exists. Please choose a different ID or leave it blank to auto-generate.` 
        });
      }
    } else {
      propertyId = await generateUniquePropertyId(rest.location);
    }

    const property = await Land.create({
      ...rest,
      propertyId
    });

    res.status(201).json(property);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ 
        message: 'A property with this Property ID already exists.' 
      });
    }
    throw err;
  }
};

const markSold = async (req, res) => {
  const targetId = (req.params.propertyId || req.params.id || '').trim().toUpperCase();
  const property = await Land.findOne({ propertyId: targetId });
  
  if (!property) {
    return res.status(404).json({ message: 'Property not found' });
  }

  property.status = 'sold';
  property.soldAt = new Date();
  property.expireAt = new Date(); // triggers TTL deletion in 5 days
  
  const updatedProperty = await property.save();
  res.status(200).json(updatedProperty);
};

const updateProperty = async (req, res) => {
  const targetId = (req.params.propertyId || req.params.id || '').trim().toUpperCase();
  const property = await Land.findOne({ propertyId: targetId });

  if (!property) {
    return res.status(404).json({ message: 'Property not found' });
  }

  const {
    title,
    description,
    price,
    location,
    area,
    areaUnit,
    propertyType,
    status,
    videoUrl,
    publishedAt,
    images,
    cloudinaryPublicIds
  } = req.body;

  if (title !== undefined) property.title = title.trim();
  if (description !== undefined) property.description = description ? description.trim() : '';
  if (price !== undefined) property.price = Number(price);
  if (location !== undefined) property.location = location.trim();
  if (area !== undefined) property.area = Number(area);
  if (areaUnit !== undefined) property.areaUnit = areaUnit;
  if (propertyType !== undefined) property.propertyType = propertyType;
  if (status !== undefined) {
    property.status = status;
    if (status === 'sold' && !property.soldAt) {
      property.soldAt = new Date();
      property.expireAt = new Date();
    } else if (status !== 'sold') {
      property.soldAt = null;
      property.expireAt = null;
    }
  }
  if (videoUrl !== undefined) property.videoUrl = videoUrl ? videoUrl.trim() : null;
  if (publishedAt !== undefined) property.publishedAt = new Date(publishedAt);
  if (Array.isArray(images)) property.images = images;
  if (Array.isArray(cloudinaryPublicIds)) property.cloudinaryPublicIds = cloudinaryPublicIds;

  const updatedProperty = await property.save();
  res.status(200).json(updatedProperty);
};

const deleteProperty = async (req, res) => {
  const targetId = (req.params.propertyId || req.params.id || '').trim().toUpperCase();
  const property = await Land.findOne({ propertyId: targetId });
  
  if (!property) {
    return res.status(404).json({ message: 'Property not found' });
  }

  // Delete assets from Cloudinary
  if (property.cloudinaryPublicIds && property.cloudinaryPublicIds.length > 0) {
    for (const publicId of property.cloudinaryPublicIds) {
      try {
        const destroyRes = await cloudinary.uploader.destroy(publicId);
        if (destroyRes && destroyRes.result === 'not found') {
          // If not found as image, try deleting as video
          await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
        }
      } catch (error) {
        console.error(`Failed to delete Cloudinary asset ${publicId}:`, error);
      }
    }
  }

  await property.deleteOne();
  res.status(200).json({ propertyId: targetId });
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
        const uploadOptions = { 
          resource_type: isVideo ? 'video' : 'image' 
        };

        if (isVideo) {
          // High-fidelity video compression (auto:best):
          // - 1080p limit (c_limit, w:1920, h:1080)
          // - auto:best perceptual quality (maintains crisp visuals, cuts ~30-40% file size)
          // - vc_auto (optimal browser codec)
          // - fast_start (instant playback without buffering full file)
          uploadOptions.transformation = [
            {
              width: 1920,
              height: 1080,
              crop: 'limit',
              quality: 'auto:best',
              video_codec: 'auto',
              flags: 'fast_start'
            }
          ];
        } else {
          uploadOptions.transformation = [
            { quality: 'auto', fetch_format: 'auto' }
          ];
        }
        
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              let finalUrl = result.secure_url;
              // Ensure video delivery URL applies high-fidelity transformation parameters
              if (isVideo && finalUrl && finalUrl.includes('/upload/') && !finalUrl.includes('/q_auto')) {
                finalUrl = finalUrl.replace('/upload/', '/upload/c_limit,w_1920,h_1080,q_auto:best,vc_auto,fl_fast_start/');
              }
              resolve({ url: finalUrl, publicId: result.public_id, isVideo });
            }
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
  updateProperty,
  markSold,
  deleteProperty,
  uploadMedia
};
