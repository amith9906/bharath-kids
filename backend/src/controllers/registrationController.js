const { Registration, User, Course } = require('../models');
const bcrypt = require('bcrypt');

// Get all registrations with user and course details
const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'name', 'phone']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'description', 'category', 'price']
        }
      ],
      order: [['registeredAt', 'DESC']]
    });
    res.json({ registrations });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ message: 'Server error while fetching registrations.' });
  }
};

// Create a new registration (Admin only)
const createRegistration = async (req, res) => {
  try {
    const { email, name, phone, password, courseIds, city, state } = req.body;

    // Validate required fields
    if (!email || !name || !phone || !password || !courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({ message: 'All fields are required and at least one course must be selected' });
    }

    // Check if courses exist
    const courses = await Course.findAll({
      where: { id: courseIds }
    });
    
    if (courses.length !== courseIds.length) {
      return res.status(404).json({ message: 'One or more courses not found' });
    }

    // Check if user already exists
    let user = await User.findOne({ where: { email } });
    
    if (!user) {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        email,
        password: hashedPassword,
        name,
        phone,
        city,
        state,
        role: 'user'
      });
    }

    // Create registrations for each course
    const createdRegistrations = [];
    const skippedCourses = [];

    for (const courseId of courseIds) {
      // Check if already registered for this course
      const existingReg = await Registration.findOne({
        where: { userId: user.id, courseId }
      });
      
      if (existingReg) {
        skippedCourses.push(courseId);
        continue;
      }

      const registration = await Registration.create({
        userId: user.id,
        courseId,
        status: 'active'
      });

      createdRegistrations.push(registration);
    }

    // Fetch complete registration data
    const completeRegistrations = await Registration.findAll({
      where: { id: createdRegistrations.map(r => r.id) },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'name', 'phone']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'description', 'category', 'price']
        }
      ]
    });

    const message = skippedCourses.length > 0
      ? `${createdRegistrations.length} registration(s) created successfully. ${skippedCourses.length} course(s) skipped (already registered).`
      : `${createdRegistrations.length} registration(s) created successfully`;

    res.status(201).json({ 
      message,
      registrations: completeRegistrations,
      skippedCount: skippedCourses.length
    });
  } catch (error) {
    console.error('Error creating registration:', error);
    res.status(500).json({ message: 'Server error while creating registration.' });
  }
};

// Update registration status
const updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const registration = await Registration.findByPk(id);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    registration.status = status;
    await registration.save();

    // Fetch complete registration data
    const updatedRegistration = await Registration.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'name', 'phone']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'description', 'category', 'price']
        }
      ]
    });

    res.json({ 
      message: 'Registration status updated successfully',
      registration: updatedRegistration 
    });
  } catch (error) {
    console.error('Error updating registration status:', error);
    res.status(500).json({ message: 'Server error while updating registration status.' });
  }
};

// Delete a registration
const deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await Registration.findByPk(id);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    await registration.destroy();
    res.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({ message: 'Server error while deleting registration.' });
  }
};

module.exports = {
  getAllRegistrations,
  createRegistration,
  updateRegistrationStatus,
  deleteRegistration
};
