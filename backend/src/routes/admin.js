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
  updateQuotationStatus,
  adminEditQuotation,
  generatePDF,
  downloadPDF,
  sendQuotationToCustomer,
  getQuoteSettings,
  updateQuoteSettings
} = require('../controllers/quotationController');
const { getDashboardStats } = require('../controllers/dashboardController');
const {
  getStoreSettings,
  updateStoreSettings,
  uploadLogo,
  deleteLogo
} = require('../controllers/settingsController');

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
router.put('/quotations/:id/edit', adminEditQuotation);
router.post('/quotations/:id/generate-pdf', generatePDF);
router.get('/quotations/:id/pdf', downloadPDF);
router.post('/quotations/:id/send', sendQuotationToCustomer);

// Quote settings
router.get('/settings/quote', getQuoteSettings);
router.put('/settings/quote', updateQuoteSettings);

// Store settings
router.get('/settings/store', getStoreSettings);
router.put('/settings/store', uploadItemImage.single('logo'), updateStoreSettings);
router.post('/settings/store/logo', uploadItemImage.single('logo'), uploadLogo);
router.delete('/settings/store/logo', deleteLogo);

module.exports = router;
