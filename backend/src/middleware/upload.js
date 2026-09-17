const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const os = require('os');
const fs = require('fs');

// Disk Storage for safe temporary cross-platform buffering
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir());
  }
});

// File type filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  const allowedDocTypes = ['application/pdf'];

  if (
    allowedImageTypes.includes(file.mimetype) ||
    allowedVideoTypes.includes(file.mimetype) ||
    allowedDocTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max global limit (Video limit)
  }
});

/**
 * Uploads a file stream directly to Cloudinary
 */
const uploadStreamToCloudinary = (filePath, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        let finalUrl = result.secure_url;
        // Apply optimized streaming flags for video playback
        if (options.resource_type === 'video' && finalUrl && finalUrl.includes('/upload/') && !finalUrl.includes('/q_auto')) {
          finalUrl = finalUrl.replace('/upload/', '/upload/c_limit,w_1920,h_1080,q_auto:best,vc_auto,fl_fast_start/');
        }
        resolve({
          url: finalUrl,
          publicId: result.public_id,
          format: result.format,
          resourceType: result.resource_type
        });
      }
    );
    fs.createReadStream(filePath).pipe(uploadStream);
  });
};

/**
 * Upload batch media files into respective Cloudinary directories with Guaranteed Cleanup
 */
const uploadMediaBatch = async (files, category = 'auto') => {
  if (!files || files.length === 0) return [];

  const uploadPromises = files.map(async (file) => {
    try {
      const isVideo = file.mimetype.startsWith('video/');
      const isPdf = file.mimetype === 'application/pdf';
      const isImage = file.mimetype.startsWith('image/');

      // Enforce strict size limits per type since Multer limit is global 50MB
      if ((isImage || isPdf || category === 'floorPlan') && file.size > 10 * 1024 * 1024) {
        throw new Error(`File ${file.originalname} exceeds the 10MB limit for images/floor plans.`);
      }

      let folder = 'newhomeland/properties/images';
      let resource_type = 'image';
      let transformation = [{ quality: 'auto', fetch_format: 'auto' }];

      if (isVideo || category === 'video') {
        folder = 'newhomeland/properties/videos';
        resource_type = 'video';
        transformation = [
          {
            width: 1920,
            height: 1080,
            crop: 'limit',
            quality: 'auto:best',
            video_codec: 'auto',
            flags: 'fast_start'
          }
        ];
      } else if (category === 'floorPlan') {
        folder = 'newhomeland/properties/floorplans';
        resource_type = isPdf ? 'raw' : 'image';
        transformation = isPdf ? undefined : [{ quality: 'auto', fetch_format: 'auto' }];
      }

      const res = await uploadStreamToCloudinary(file.path, {
        folder,
        resource_type,
        transformation
      });

      return {
        ...res,
        originalName: file.originalname,
        mimeType: file.mimetype,
        isFloorPlan: category === 'floorPlan'
      };
    } finally {
      // Guaranteed Cleanup: Ensure tmp file is unlinked whether upload succeeds or fails
      try {
        if (file.path) {
          await fs.promises.unlink(file.path);
        }
      } catch (cleanupErr) {
        console.error(`Failed to cleanup temp file ${file.path}:`, cleanupErr);
      }
    }
  });

  return Promise.all(uploadPromises);
};

/**
 * Safely delete single or multiple assets from Cloudinary
 */
const deleteCloudinaryAssets = async (publicIds) => {
  if (!publicIds) return;
  const ids = Array.isArray(publicIds) ? publicIds.filter(Boolean) : [publicIds].filter(Boolean);
  if (ids.length === 0) return;

  const resourceTypes = ['image', 'video', 'raw'];
  for (const id of ids) {
    for (const rType of resourceTypes) {
      try {
        const res = await cloudinary.uploader.destroy(id, { resource_type: rType });
        if (res && res.result === 'ok') {
          break; // Successfully destroyed
        }
      } catch (err) {
        // Silently continue to try next resource type
      }
    }
  }
};

module.exports = {
  upload,
  uploadStreamToCloudinary,
  uploadMediaBatch,
  deleteCloudinaryAssets
};
