const { Course } = require('../models');
const { sendCourseRegistrationNotification, sendCustomWhatsAppMessage } = require('../services/whatsappService');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const { deleteFile, uploadDir } = require('../middleware/upload');

// Get all active courses (public)
const getCourses = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = { isActive: true };
    if (category) {
      where.category = category;
    }
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { instructor: { [Op.iLike]: `%${search}%` } }
      ];
    }
    const { rows: courses, count: total } = await Course.findAndCountAll({
      where,
      order: [['title', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { include: ['discountPercent', 'finalFee'] }
    });
    res.json({
      courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error while fetching courses.' });
  }
};

// Get single course (public)
const getCourse = async (req, res) => {
  try {
    const course = await Course.findOne({
      where: { id: req.params.id, isActive: true },
      attributes: { include: ['discountPercent', 'finalFee'] }
    });
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    res.json({ course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error while fetching course.' });
  }
};

// Get categories (public)
const getCategories = async (req, res) => {
  try {
    const categories = await Course.findAll({
      attributes: ['category'],
      where: { isActive: true, category: { [Op.ne]: null } },
      group: ['category'],
      order: [['category', 'ASC']]
    });
    res.json({
      categories: categories.map(c => c.category).filter(Boolean)
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error while fetching categories.' });
  }
};

// Admin: Get all courses (including inactive)
const adminGetCourses = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (category) {
      where.category = category;
    }
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { instructor: { [Op.iLike]: `%${search}%` } }
      ];
    }
    const { rows: courses, count: total } = await Course.findAndCountAll({
      where,
      order: [['title', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { include: ['discountPercent', 'finalFee'] }
    });
    res.json({
      courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin get courses error:', error);
    res.status(500).json({ message: 'Server error while fetching courses.' });
  }
};

// Admin: Create course
const createCourse = async (req, res) => {
  try {
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/courses/${req.file.filename}`;
    } else {
      imageUrl = req.body.imageUrl;
    }
    const { title, description, instructor, duration, category, price, discountPercent = 0, isActive } = req.body;
    // Calculate finalFee if discountPercent is provided
    let finalFee = price;
    if (discountPercent && discountPercent > 0) {
      finalFee = (price - (price * discountPercent / 100)).toFixed(2);
    }
    const course = await Course.create({
      title,
      description,
      instructor,
      duration,
      imageUrl,
      category,
      price,
      discountPercent,
      finalFee,
      isActive
    });
    res.status(201).json({
      message: 'Course created successfully.',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error while creating course.' });
  }
};

// User: Register for a course (example endpoint)
const registerCourse = async (req, res) => {
  try {
    // Example: Assume user is authenticated and req.user is available
    const userId = req.user.id;
    const courseId = req.body.courseId;
    // Add registration logic here (e.g., create a CourseRegistration model)
    // ...
    // Fetch course details for confirmation
    const course = await Course.findByPk(courseId);
    // Send WhatsApp notification (to admin or user)
    await sendCourseRegistrationNotification({ userId, courseId });
    res.json({
      message: 'Registered for course and WhatsApp notification sent.',
      course: course ? {
        id: course.id,
        title: course.title,
        price: course.price,
        discountPercent: course.discountPercent,
        finalFee: course.finalFee
      } : null
    });
  } catch (error) {
    console.error('Register course error:', error);
    res.status(500).json({ message: 'Server error while registering for course.' });
  }
};

// Admin: Send custom WhatsApp message
const sendWhatsAppMessage = async (req, res) => {
  try {
    const { to, message } = req.body;
    await sendCustomWhatsAppMessage(to, message);
    res.json({ message: 'WhatsApp message sent.' });
  } catch (error) {
    console.error('Send WhatsApp message error:', error);
    res.status(500).json({ message: 'Failed to send WhatsApp message.' });
  }
};

// Admin: Update course
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    let imageUrl = course.imageUrl;
    if (req.file) {
      // Delete old image if exists
      if (imageUrl) {
        deleteFile(path.join(uploadDir, 'courses', path.basename(imageUrl)));
      }
      imageUrl = `/uploads/courses/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }
    const { title, description, instructor, duration, category, price, discountPercent = 0, isActive } = req.body;
    let finalFee = price;
    if (discountPercent && discountPercent > 0) {
      finalFee = (price - (price * discountPercent / 100)).toFixed(2);
    }
    await course.update({
      title,
      description,
      instructor,
      duration,
      imageUrl,
      category,
      price,
      discountPercent,
      finalFee,
      isActive
    });
    res.json({
      message: 'Course updated successfully.',
      course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error while updating course.' });
  }
};

// Admin: Delete course
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    if (course.imageUrl) {
      deleteFile(path.join(uploadDir, 'courses', path.basename(course.imageUrl)));
    }
    await course.destroy();
    res.json({ message: 'Course deleted successfully.' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error while deleting course.' });
  }
};

module.exports = {
  getCourses,
  getCourse,
  getCategories,
  adminGetCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  registerCourse,
  sendWhatsAppMessage
};