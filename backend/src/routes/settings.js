const express = require('express');
const router = express.Router();
const { getStoreSettings } = require('../controllers/settingsController');

// Public route to get store settings
router.get('/store', getStoreSettings);

module.exports = router;
