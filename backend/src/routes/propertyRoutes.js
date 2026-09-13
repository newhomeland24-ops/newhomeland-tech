const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middleware/verifyAdmin');
const {
  getPublicProperties,
  getPublicProperty,
  getAllAdminProperties,
  createProperty,
  updateProperty,
  markSold,
  deleteProperty,
  getCloudinarySignature
} = require('../controllers/propertyController');
const { publicLimiter } = require('../middleware/rateLimiter');

// Public routes
router.get('/', publicLimiter, getPublicProperties);
router.get('/:propertyId', publicLimiter, getPublicProperty);

// Admin routes
router.get('/admin/all', verifyAdmin, getAllAdminProperties);
router.post('/', verifyAdmin, createProperty);
router.put('/:propertyId', verifyAdmin, updateProperty);
router.patch('/:propertyId/sold', verifyAdmin, markSold);
router.delete('/:propertyId', verifyAdmin, deleteProperty);

// Cloudinary upload
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 300 * 1024 * 1024 } }); // 300MB
router.post('/admin/upload', verifyAdmin, upload.array('files', 6), require('../controllers/propertyController').uploadMedia);

module.exports = router;
