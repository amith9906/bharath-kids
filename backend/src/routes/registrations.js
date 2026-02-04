const express = require('express');
const router = express.Router();
const { 
  getAllRegistrations, 
  createRegistration, 
  updateRegistrationStatus,
  deleteRegistration 
} = require('../controllers/registrationController');
const { auth } = require('../middleware/auth');

// GET /api/registrations - Get all registrations with user and course details
router.get('/', auth, getAllRegistrations);

// POST /api/registrations - Create a new registration (Admin only)
router.post('/', auth, createRegistration);

// PATCH /api/registrations/:id/status - Update registration status
router.patch('/:id/status', auth, updateRegistrationStatus);

// DELETE /api/registrations/:id - Delete a registration
router.delete('/:id', auth, deleteRegistration);

module.exports = router;
