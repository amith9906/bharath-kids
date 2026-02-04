const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { adminAuth } = require('../middleware/auth');
const { uploadCourseImage, uploadExcel, uploadStoreImage } = require('../middleware/upload');
const {
  adminGetCourses,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');
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

// Courses management
router.get('/courses', adminGetCourses);
router.post('/courses', uploadCourseImage.single('image'), createCourse);
router.put('/courses/:id', uploadCourseImage.single('image'), updateCourse);
router.delete('/courses/:id', deleteCourse);

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
router.put('/settings/store', uploadStoreImage.single('logo'), updateStoreSettings);
router.post('/settings/store/logo', uploadStoreImage.single('logo'), uploadLogo);
router.delete('/settings/store/logo', deleteLogo);

module.exports = router;
