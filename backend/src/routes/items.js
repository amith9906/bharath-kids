const express = require('express');
const router = express.Router();
const { getItems, getItem, getCategories } = require('../controllers/itemController');

// Public routes
router.get('/', getItems);
router.get('/categories', getCategories);
router.get('/:id', getItem);

module.exports = router;
