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
  fileFilter
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
 * Helper to upload to Cloudinary using standard upload or chunked upload_large
 */
const uploadToCloudinary = (filePath, options, isLargeOrVideo) => {
  if (isLargeOrVideo) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_large(
        filePath,
        {
          ...options,
          chunk_size: 6000000 // 6MB chunks for reliability and preventing 413
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });
  }
  return cloudinary.uploader.upload(filePath, options);
};

/**
 * Upload batch media files into respective Cloudinary directories with Guaranteed Cleanup
 */
const uploadMediaBatch = async (files, category = 'auto') => {
  if (!files || files.length === 0) return [];

  const uploadPromises = files.map(async (file) => {
    try {
      const isVideo = file.mimetype.startsWith('video/') || file.fieldname === 'videos' || category === 'video';
      const isFloorPlan = file.fieldname === 'floorPlans' || category === 'floorPlan';
      const isPdf = file.mimetype === 'application/pdf';

      let folder = 'newhomeland/properties/images';
      let resource_type = 'image';

      if (isVideo) {
        folder = 'newhomeland/properties/videos';
        resource_type = 'video';
      } else if (isFloorPlan) {
        folder = 'newhomeland/properties/floorplans';
        resource_type = isPdf ? 'raw' : 'image';
      }

      const uploadOptions = {
        folder,
        resource_type,
        quality_analysis: false,
        colors: false,
        use_filename: false,
        unique_filename: true
      };

      const isLargeOrVideo = isVideo || (file.size && file.size > 8 * 1024 * 1024);
      let res;
      try {
        res = await uploadToCloudinary(file.path, uploadOptions, isLargeOrVideo);
      } catch (uploadErr) {
        // If standard upload returned 413 or entity too large, retry with chunked upload_large
        const errMsg = String(uploadErr?.message || '');
        if (uploadErr?.http_code === 413 || errMsg.includes('413') || errMsg.toLowerCase().includes('too large')) {
          res = await uploadToCloudinary(file.path, uploadOptions, true);
        } else {
          throw uploadErr;
        }
      }

      return {
        url: res.secure_url,
        publicId: res.public_id,
        format: res.format,
        resourceType: res.resource_type,
        originalName: file.originalname,
        mimeType: file.mimetype,
        isFloorPlan
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

  await Promise.allSettled(
    ids.map(async (id) => {
      for (const rType of ['image', 'video', 'raw']) {
        try {
          const res = await cloudinary.uploader.destroy(id, { resource_type: rType });
          if (res && res.result === 'ok') break;
        } catch (err) {}
      }
    })
  );
};

module.exports = {
  upload,
  uploadStreamToCloudinary,
  uploadMediaBatch,
  deleteCloudinaryAssets
};
