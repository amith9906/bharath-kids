const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { adminAuth } = require('../middleware/auth');
const { uploadItemImage, uploadExcel } = require('../middleware/upload');
const {
  adminGetItems,
  createItem,
  updateItem,
  deleteItem,
  uploadImage,
  downloadTemplate,
  bulkUpload
} = require('../controllers/itemController');
const {
  adminGetQuotations,
  getQuotation,
  updateQuotationStatus
} = require('../controllers/quotationController');
const { getDashboardStats } = require('../controllers/dashboardController');

// All routes require admin authentication
router.use(adminAuth);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Items management
router.get('/items', adminGetItems);
router.post('/items', uploadItemImage.single('image'), createItem);
router.put('/items/:id', uploadItemImage.single('image'), updateItem);
router.delete('/items/:id', deleteItem);

// Image upload
router.post('/items/upload-image', uploadItemImage.single('image'), uploadImage);

// Bulk upload
router.get('/items/template', downloadTemplate);
router.post('/items/bulk-upload', uploadExcel.single('file'), bulkUpload);

// Quotations management
router.get('/quotations', adminGetQuotations);
router.get('/quotations/:id', getQuotation);
router.patch('/quotations/:id/status', updateQuotationStatus);

module.exports = router;
