const express = require('express');
const router = express.Router();
const { getItems, getItem, getCategories, getBrands } = require('../controllers/itemController');

// Public routes
router.get('/', getItems);
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/:id', getItem);

module.exports = router;
