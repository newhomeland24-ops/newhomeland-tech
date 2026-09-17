const Property = require('../models/Property');
const { uploadMediaBatch, deleteCloudinaryAssets } = require('../middleware/upload');

// Generate prefix from location string (locality or city)
const getLocationPrefix = (seed = 'LOC') => {
  const lettersOnly = (seed || '').replace(/[^a-zA-Z]/g, '').toUpperCase();
  let prefix = lettersOnly.slice(0, 3);
  if (prefix.length < 3) {
    prefix = (prefix + 'LOC').slice(0, 3);
  }
  return prefix;
};

// Generate unique propertyId in format "{LOC}-XXXXX"
const generateUniquePropertyId = async (seed = '') => {
  const prefix = getLocationPrefix(seed);
  let isUnique = false;
  let customId = '';
  while (!isUnique) {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    customId = `${prefix}-${randomNum}`;
    const existing = await Property.findOne({ propertyId: customId });
    if (!existing) {
      isUnique = true;
    }
  }
  return customId;
};

/**
 * Standardize property payload from either nested structure or legacy flat form fields
 */
const normalizePropertyPayload = (body) => {
  const payload = { ...body };

  // Pricing normalization
  if (body.pricing) {
    payload.pricing = {
      price: Number(body.pricing.price) || 0,
      priceNegotiable: Boolean(body.pricing.priceNegotiable),
      maintenanceCharges: Number(body.pricing.maintenanceCharges) || 0
    };
  } else if (body.price !== undefined) {
    payload.pricing = {
      price: Number(body.price) || 0,
      priceNegotiable: Boolean(body.priceNegotiable),
      maintenanceCharges: Number(body.maintenanceCharges) || 0
    };
  }

  // Location normalization
  if (body.location && typeof body.location === 'object') {
    payload.location = {
      address: body.location.address || '',
      locality: body.location.locality || '',
      city: body.location.city || '',
      state: body.location.state || 'Telangana',
      pincode: body.location.pincode || '',
      landmark: body.location.landmark || '',
      coordinates: body.location.coordinates || { lat: null, lng: null }
    };
  } else if (typeof body.location === 'string') {
    const parts = body.location.split(',').map(s => s.trim());
    payload.location = {
      address: body.location,
      locality: parts[0] || 'Prime Area',
      city: parts[1] || parts[0] || 'Hyderabad',
      state: 'Telangana',
      pincode: '',
      landmark: '',
      coordinates: { lat: null, lng: null }
    };
  }

  // Specifications normalization
  if (body.specifications) {
    payload.specifications = {
      bedrooms: Number(body.specifications.bedrooms) || 0,
      bathrooms: Number(body.specifications.bathrooms) || 0,
      balconies: Number(body.specifications.balconies) || 0,
      carpetAreaSqFt: Number(body.specifications.carpetAreaSqFt) || Number(body.area) || 0,
      superBuiltUpAreaSqFt: Number(body.specifications.superBuiltUpAreaSqFt) || 0,
      furnishingStatus: body.specifications.furnishingStatus || 'Unfurnished',
      facing: body.specifications.facing || '',
      floorNumber: Number(body.specifications.floorNumber) || 0,
      totalFloors: Number(body.specifications.totalFloors) || 1,
      parkingSlots: Number(body.specifications.parkingSlots) || 0,
      ageOfPropertyYears: Number(body.specifications.ageOfPropertyYears) || 0
    };
  } else if (body.area !== undefined) {
    payload.specifications = {
      bedrooms: Number(body.bedrooms) || 0,
      bathrooms: Number(body.bathrooms) || 0,
      balconies: Number(body.balconies) || 0,
      carpetAreaSqFt: Number(body.area) || 0,
      superBuiltUpAreaSqFt: Number(body.superBuiltUpAreaSqFt) || 0,
      furnishingStatus: body.furnishingStatus || 'Unfurnished',
      facing: body.facing || '',
      floorNumber: Number(body.floorNumber) || 0,
      totalFloors: Number(body.totalFloors) || 1,
      parkingSlots: Number(body.parkingSlots) || 0,
      ageOfPropertyYears: Number(body.ageOfPropertyYears) || 0
    };
  }

  // Media normalization
  if (!payload.media) {
    payload.media = {
      images: [],
      videos: [],
      floorPlans: []
    };
  }

  // Support legacy flat images array: string URLs or objects
  if (Array.isArray(body.images) && payload.media.images.length === 0) {
    payload.media.images = body.images.map((img, idx) => {
      if (typeof img === 'string') {
        const publicIdMatch = img.match(/\/([^/]+)\.[a-zA-Z0-9]+$/);
        return {
          url: img,
          publicId: (body.cloudinaryPublicIds && body.cloudinaryPublicIds[idx]) || (publicIdMatch ? publicIdMatch[1] : `img_${idx}`),
          caption: '',
          isFeatured: idx === 0
        };
      }
      return img;
    });
  }

  // Support legacy single videoUrl string
  if (body.videoUrl && payload.media.videos.length === 0) {
    payload.media.videos = [{
      url: body.videoUrl,
      publicId: 'external_or_custom_video',
      title: 'Walkthrough Video'
    }];
  }

  return payload;
};

const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

/**
 * Fetch all properties for public listing with filtering, pagination, and sorting
 */
const getPublicProperties = asyncHandler(async (req, res) => {
    const {
      search,
      location,
      city,
      locality,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      sortBy,
      status,
      page = 1,
      limit = 50
    } = req.query;

    const query = {
      publishedAt: { $lte: new Date() }
    };

    // Status filter
    if (status && status !== 'All') {
      const s = status.toLowerCase();
      if (s === 'published' || s === 'available') {
        query.status = { $in: ['Available', 'published'] };
      } else if (s === 'sold') {
        query.status = { $in: ['Sold', 'sold'] };
      } else {
        query.status = status;
      }
    } else {
      query.status = { $in: ['Available', 'Sold', 'Under Offer', 'published', 'sold'] };
    }

    // Keyword search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { propertyId: { $regex: search, $options: 'i' } },
        { 'location.locality': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } }
      ];
    }

    // Location / City / Locality
    if (city && city !== 'All') {
      query['location.city'] = { $regex: city, $options: 'i' };
    }
    if (locality && locality !== 'All') {
      query['location.locality'] = { $regex: locality, $options: 'i' };
    }
    if (location && location !== 'All' && !city && !locality) {
      query.$or = [
        { 'location.locality': { $regex: location, $options: 'i' } },
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.address': { $regex: location, $options: 'i' } }
      ];
    }

    // Property Type
    if (propertyType && propertyType !== 'All') {
      query.propertyType = { $regex: propertyType, $options: 'i' };
    }

    // Price range
    if (minPrice || maxPrice) {
      query['pricing.price'] = {};
      if (minPrice) query['pricing.price'].$gte = Number(minPrice);
      if (maxPrice) query['pricing.price'].$lte = Number(maxPrice);
    }

    // Bedrooms
    if (bedrooms && bedrooms !== 'All') {
      query['specifications.bedrooms'] = Number(bedrooms);
    }

    // Sorting
    let sortObj = { createdAt: -1 };
    if (sortBy === 'price_asc') sortObj = { 'pricing.price': 1 };
    else if (sortBy === 'price_desc') sortObj = { 'pricing.price': -1 };
    else if (sortBy === 'newest') sortObj = { publishedAt: -1, createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [total, properties] = await Promise.all([
      Property.countDocuments(query),
      Property.find(query).select('-meta -__v').sort(sortObj).skip(skip).limit(limitNum).lean()
    ]);

    // Send envelope with array root or direct compatibility
    res.status(200).json(properties);
});

/**
 * Fetch all properties for admin dashboard
 */
const getAllAdminProperties = asyncHandler(async (req, res) => {
  const properties = await Property.find({}).sort({ createdAt: -1 }).lean();
  res.status(200).json(properties);
});

/**
 * Get single property by propertyId
 */
const getPublicProperty = asyncHandler(async (req, res) => {
    const targetId = (req.params.propertyId || req.params.id || '').trim().toUpperCase();
    if (!targetId) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const property = await Property.findOne({
      $or: [
        { propertyId: targetId },
        ...(targetId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: targetId }] : [])
      ]
    }).select('-meta -__v').lean();

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.status(200).json(property);
});

/**
 * Create a new property with media upload and automatic rollback
 */
const createProperty = asyncHandler(async (req, res) => {
  const uploadedPublicIds = [];

    let body = req.body;
    // Parse JSON string if sent as multipart form-data text field
    if (typeof body.data === 'string') {
      try {
        body = JSON.parse(body.data);
      } catch (e) {}
    }

    // If files are attached directly in this multipart request
    if (req.files) {
      const fileList = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      if (fileList.length > 0) {
        const uploadResults = await uploadMediaBatch(fileList);
        uploadResults.forEach(r => uploadedPublicIds.push(r.publicId));

        if (!body.media) body.media = { images: [], videos: [], floorPlans: [] };

        uploadResults.forEach(item => {
          if (item.resourceType === 'video') {
            body.media.videos.push({ url: item.url, publicId: item.publicId, title: item.originalName });
          } else if (item.isFloorPlan) {
            body.media.floorPlans.push({ url: item.url, publicId: item.publicId, title: item.originalName });
          } else {
            body.media.images.push({ url: item.url, publicId: item.publicId, caption: '', isFeatured: body.media.images.length === 0 });
          }
        });
      }
    }

    const payload = normalizePropertyPayload(body);

    // Validate or generate propertyId
    let customPropertyId = (payload.propertyId || '').trim().toUpperCase();
    if (customPropertyId) {
      const formatRegex = /^[A-Z0-9_-]{3,30}$/;
      if (!formatRegex.test(customPropertyId)) {
        // Rollback uploaded media
        await deleteCloudinaryAssets(uploadedPublicIds);
        return res.status(400).json({
          message: 'Invalid Property ID format. Use 3-30 characters of uppercase letters, numbers, hyphens or underscores.'
        });
      }

      const existing = await Property.findOne({ propertyId: customPropertyId });
      if (existing) {
        await deleteCloudinaryAssets(uploadedPublicIds);
        return res.status(409).json({
          message: `Property ID "${customPropertyId}" already exists. Please choose another or leave blank to auto-generate.`
        });
      }
      payload.propertyId = customPropertyId;
    } else {
      payload.propertyId = await generateUniquePropertyId(payload.location?.locality || payload.location?.city);
    }

    const property = await Property.create(payload);
    res.status(201).json(property);
});

/**
 * Update an existing property, including media addition / deletion
 */
const updateProperty = asyncHandler(async (req, res) => {
  const newlyUploadedPublicIds = [];

    const targetId = (req.params.propertyId || req.params.id || '').trim().toUpperCase();
    const property = await Property.findOne({
      $or: [
        { propertyId: targetId },
        ...(targetId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: targetId }] : [])
      ]
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    let body = req.body;
    if (typeof body.data === 'string') {
      try {
        body = JSON.parse(body.data);
      } catch (e) {}
    }

    // Handle files attached in this update request
    if (req.files) {
      const fileList = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      if (fileList.length > 0) {
        const uploadResults = await uploadMediaBatch(fileList);
        uploadResults.forEach(r => newlyUploadedPublicIds.push(r.publicId));

        if (!body.media) {
          body.media = {
            images: [...(property.media?.images || [])],
            videos: [...(property.media?.videos || [])],
            floorPlans: [...(property.media?.floorPlans || [])]
          };
        }

        uploadResults.forEach(item => {
          if (item.resourceType === 'video') {
            body.media.videos.push({ url: item.url, publicId: item.publicId, title: item.originalName });
          } else if (item.isFloorPlan) {
            body.media.floorPlans.push({ url: item.url, publicId: item.publicId, title: item.originalName });
          } else {
            body.media.images.push({ url: item.url, publicId: item.publicId, caption: '', isFeatured: false });
          }
        });
      }
    }

    // Identify and delete media removed by the admin
    if (body.media) {
      const oldPublicIds = [
        ...(property.media?.images || []).map(i => i.publicId),
        ...(property.media?.videos || []).map(v => v.publicId),
        ...(property.media?.floorPlans || []).map(f => f.publicId)
      ];

      const newPublicIds = new Set([
        ...(body.media.images || []).map(i => i.publicId),
        ...(body.media.videos || []).map(v => v.publicId),
        ...(body.media.floorPlans || []).map(f => f.publicId)
      ]);

      const removedIds = oldPublicIds.filter(id => id && !newPublicIds.has(id));
      if (removedIds.length > 0) {
        logger.info('Deleting removed media from Cloudinary:', removedIds);
        deleteCloudinaryAssets(removedIds); // async fire-and-forget or awaited
      }
    }

    const payload = normalizePropertyPayload(body);

    // Apply updates
    if (payload.title !== undefined) property.title = payload.title.trim();
    if (payload.description !== undefined) property.description = payload.description.trim();
    if (payload.propertyType !== undefined) property.propertyType = payload.propertyType;
    if (payload.listingType !== undefined) property.listingType = payload.listingType;
    if (payload.pricing !== undefined) property.pricing = payload.pricing;
    if (payload.specifications !== undefined) property.specifications = payload.specifications;
    if (payload.location !== undefined) property.location = payload.location;
    if (payload.amenities !== undefined) property.amenities = payload.amenities;
    if (payload.media !== undefined) property.media = payload.media;
    if (payload.meta !== undefined) property.meta = payload.meta;
    if (payload.publishedAt !== undefined) property.publishedAt = new Date(payload.publishedAt);

    if (payload.status !== undefined) {
      property.status = payload.status;
      if (payload.status === 'Sold' || payload.status === 'sold') {
        if (!property.soldAt) property.soldAt = new Date();
      } else {
        property.soldAt = null;
      }
    }

    const updated = await property.save();
    res.status(200).json(updated);
});

/**
 * Mark a property as sold
 */
const markSold = asyncHandler(async (req, res) => {
    const targetId = (req.params.propertyId || req.params.id || '').trim().toUpperCase();
    const property = await Property.findOne({
      $or: [
        { propertyId: targetId },
        ...(targetId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: targetId }] : [])
      ]
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.status = 'Sold';
    property.soldAt = new Date();
    const updated = await property.save();
    res.status(200).json(updated);
});

/**
 * Delete property and purge all associated Cloudinary assets
 */
const deleteProperty = asyncHandler(async (req, res) => {
    const targetId = (req.params.propertyId || req.params.id || '').trim().toUpperCase();
    const property = await Property.findOne({
      $or: [
        { propertyId: targetId },
        ...(targetId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: targetId }] : [])
      ]
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Collect all public IDs across media
    const allPublicIds = [
      ...(property.media?.images || []).map(i => i.publicId),
      ...(property.media?.videos || []).map(v => v.publicId),
      ...(property.media?.floorPlans || []).map(f => f.publicId)
    ].filter(Boolean);

    // Also check legacy cloudinaryPublicIds field if migrating
    if (Array.isArray(property.cloudinaryPublicIds)) {
      property.cloudinaryPublicIds.forEach(id => {
        if (id && !allPublicIds.includes(id)) allPublicIds.push(id);
      });
    }

    if (allPublicIds.length > 0) {
      logger.info(`Purging ${allPublicIds.length} Cloudinary assets for property ${targetId}...`);
      await deleteCloudinaryAssets(allPublicIds);
    }

    await property.deleteOne();
    res.status(200).json({ propertyId: targetId, message: 'Property and assets deleted successfully' });
});

/**
 * Direct media upload endpoint for admin pre-uploading files
 */
const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

    const category = req.query.category || 'auto';
    const uploadResults = await uploadMediaBatch(req.files, category);

    const results = uploadResults.map(item => ({
      url: item.url,
      publicId: item.publicId,
      isVideo: item.resourceType === 'video',
      isFloorPlan: item.isFloorPlan,
      format: item.format,
      originalName: item.originalName
    }));

    res.status(200).json({ results });
});

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
