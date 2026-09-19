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
  uploadMedia,
  getAllPropertyTypes,
  getActivePropertyTypes,
  getAllAreaUnits,
  getAllAmenities,
  getFilterOptions
} = require('../controllers/propertyController');
const { publicLimiter } = require('../middleware/rateLimiter');
const { upload } = require('../middleware/upload');
const validate = require('../middleware/validate');
const { propertySchema } = require('../schemas/propertyValidation');

// Public routes
router.get('/', publicLimiter, getPublicProperties);
router.get('/filter-options', publicLimiter, getFilterOptions);
router.get('/types/active', publicLimiter, getActivePropertyTypes);
router.get('/:propertyId', publicLimiter, getPublicProperty);

// Admin routes
router.get('/admin/all', verifyAdmin, getAllAdminProperties);
router.get('/admin/types', verifyAdmin, getAllPropertyTypes);
router.get('/admin/units', verifyAdmin, getAllAreaUnits);
router.get('/admin/amenities', verifyAdmin, getAllAmenities);
router.post('/', verifyAdmin, upload.any(), validate(propertySchema), createProperty);
router.put('/:propertyId', verifyAdmin, upload.any(), validate(propertySchema), updateProperty);
router.patch('/:propertyId/sold', verifyAdmin, markSold);
router.delete('/:propertyId', verifyAdmin, deleteProperty);

// Dedicated direct media upload endpoint for admin UI
router.post('/admin/upload', verifyAdmin, upload.any(), uploadMedia);

module.exports = router;
