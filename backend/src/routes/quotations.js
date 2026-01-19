const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth, optionalAuth } = require('../middleware/auth');
const {
  createQuotation,
  getMyQuotations,
  getQuotation
} = require('../controllers/quotationController');

// Validation rules
const createQuotationValidation = [
  body('customerName').trim().notEmpty().withMessage('Customer name is required'),
  body('customerEmail').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('customerPhone').trim().notEmpty().withMessage('Phone number is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.itemId').isInt({ min: 1 }).withMessage('Valid item ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

// Routes
router.post('/', optionalAuth, createQuotationValidation, createQuotation);
router.get('/my', auth, getMyQuotations);
router.get('/:id', optionalAuth, getQuotation);

module.exports = router;
