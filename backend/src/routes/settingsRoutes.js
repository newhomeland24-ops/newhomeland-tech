const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middleware/verifyAdmin');
const { getSettings, updateSettings, requestSettingsOtp } = require('../controllers/settingsController');

router.get('/', getSettings);
router.post('/request-otp', verifyAdmin, requestSettingsOtp);
router.put('/', verifyAdmin, updateSettings);

module.exports = router;
