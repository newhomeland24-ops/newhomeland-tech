const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middleware/verifyAdmin');
const { getSettings, updateSettings } = require('../controllers/settingsController');

router.get('/', getSettings);
router.put('/', verifyAdmin, updateSettings);

module.exports = router;
