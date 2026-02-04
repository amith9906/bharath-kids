const express = require('express');
const router = express.Router();
const { getCourses, getCourse, getCategories, registerCourse, sendWhatsAppMessage } = require('../controllers/courseController');

// Public routes
router.get('/', getCourses);
router.get('/categories', getCategories);
router.get('/:id', getCourse);

// User registers for a course
// router.post('/register', registerCourse); // Uncomment and secure as needed

// Admin sends WhatsApp message
// router.post('/send-whatsapp', sendWhatsAppMessage); // Uncomment and secure as needed

module.exports = router;