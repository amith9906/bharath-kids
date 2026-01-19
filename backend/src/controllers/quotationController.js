const { Quotation, QuotationItem, QuotationStatusHistory, Item, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const emailService = require('../services/emailService');
const whatsappService = require('../services/whatsappService');

// Create quotation (public - no auth required)
const createQuotation = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      customerCompany,
      customerAddress,
      items,
      notes
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required.' });
    }

    // Calculate totals
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    const quotationItemsData = [];

    for (const cartItem of items) {
      const item = await Item.findByPk(cartItem.itemId);

      if (!item || !item.isActive) {
        await transaction.rollback();
        return res.status(400).json({ message: `Item ${cartItem.itemId} not found or inactive.` });
      }

      const quantity = cartItem.quantity || 1;
      const unitPrice = parseFloat(item.price);
      const itemSubtotal = unitPrice * quantity;

      // Calculate discount
      const discountPercent = parseFloat(item.discountPercent) || 0;
      const discountAmount = (itemSubtotal * discountPercent) / 100;
      const taxableAmount = itemSubtotal - discountAmount;

      // Calculate taxes
      const igstRate = parseFloat(item.igstRate) || 0;
      const cgstRate = parseFloat(item.cgstRate) || 0;
      const sgstRate = parseFloat(item.sgstRate) || 0;

      const igstAmount = (taxableAmount * igstRate) / 100;
      const cgstAmount = (taxableAmount * cgstRate) / 100;
      const sgstAmount = (taxableAmount * sgstRate) / 100;

      const totalPrice = taxableAmount + igstAmount + cgstAmount + sgstAmount;

      subtotal += itemSubtotal;
      discountTotal += discountAmount;
      taxTotal += igstAmount + cgstAmount + sgstAmount;

      quotationItemsData.push({
        itemId: item.id,
        itemName: item.name,
        itemDescription: item.description,
        hsnCode: item.hsnCode,
        quantity,
        unit: item.unit,
        unitPrice,
        discountPercent,
        discountAmount,
        taxableAmount,
        igstRate,
        igstAmount,
        cgstRate,
        cgstAmount,
        sgstRate,
        sgstAmount,
        totalPrice
      });
    }

    const grandTotal = subtotal - discountTotal + taxTotal;

    // Create quotation
    const quotation = await Quotation.create({
      userId: req.user?.id || null,
      customerName,
      customerEmail,
      customerPhone,
      customerCompany,
      customerAddress,
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal,
      notes,
      status: 'pending',
      // Fallback: set a debug value if not set by hook
      quotationNumber: 'QT-FALLBACK'
    }, { transaction });

    // Create quotation items
    for (const itemData of quotationItemsData) {
      await QuotationItem.create({
        quotationId: quotation.id,
        ...itemData
      }, { transaction });
    }

    // Create initial status history
    await QuotationStatusHistory.create({
      quotationId: quotation.id,
      status: 'pending',
      notes: 'Quotation created'
    }, { transaction });

    await transaction.commit();

    // Fetch complete quotation with items
    const completeQuotation = await Quotation.findByPk(quotation.id, {
      include: [{ model: QuotationItem, as: 'items' }]
    });

    // Send notifications (async, don't wait)
    try {
      await emailService.sendQuotationNotificationToAdmin(completeQuotation);
      await emailService.sendQuotationConfirmationToCustomer(completeQuotation);
      await whatsappService.sendQuotationNotification(completeQuotation);
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
      // Don't fail the request if notifications fail
    }

    res.status(201).json({
      message: 'Quotation created successfully.',
      quotation: completeQuotation
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create quotation error:', error);
    res.status(500).json({ message: 'Server error while creating quotation.' });
  }
};

// Get user's quotations (requires auth)
const getMyQuotations = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };

    if (status) {
      where.status = status;
    }

    const { rows: quotations, count: total } = await Quotation.findAndCountAll({
      where,
      include: [{ model: QuotationItem, as: 'items' }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      quotations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my quotations error:', error);
    res.status(500).json({ message: 'Server error while fetching quotations.' });
  }
};

// Get single quotation by ID
const getQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findByPk(req.params.id, {
      include: [
        { model: QuotationItem, as: 'items' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        {
          model: QuotationStatusHistory,
          as: 'statusHistory',
          include: [{ model: User, as: 'changedByUser', attributes: ['id', 'name'] }],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found.' });
    }

    // Check access - admin can see all, users can only see their own
    if (req.user?.role !== 'admin' && quotation.userId !== req.user?.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json({ quotation });
  } catch (error) {
    console.error('Get quotation error:', error);
    res.status(500).json({ message: 'Server error while fetching quotation.' });
  }
};

// Admin: Get all quotations
const adminGetQuotations = async (req, res) => {
  try {
    const { status, search, startDate, endDate, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { quotationNumber: { [Op.iLike]: `%${search}%` } },
        { customerName: { [Op.iLike]: `%${search}%` } },
        { customerEmail: { [Op.iLike]: `%${search}%` } },
        { customerPhone: { [Op.iLike]: `%${search}%` } },
        { customerCompany: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      where.createdAt = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      where.createdAt = { [Op.lte]: new Date(endDate) };
    }

    const { rows: quotations, count: total } = await Quotation.findAndCountAll({
      where,
      include: [
        { model: QuotationItem, as: 'items' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      quotations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin get quotations error:', error);
    res.status(500).json({ message: 'Server error while fetching quotations.' });
  }
};

// Admin: Update quotation status
const updateQuotationStatus = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { status, notes } = req.body;

    const validStatuses = ['pending', 'under_review', 'approved', 'rejected', 'converted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const quotation = await Quotation.findByPk(req.params.id, { transaction });

    if (!quotation) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Quotation not found.' });
    }

    const oldStatus = quotation.status;

    await quotation.update({ status, adminNotes: notes }, { transaction });

    // Create status history entry
    await QuotationStatusHistory.create({
      quotationId: quotation.id,
      status,
      changedBy: req.user.id,
      notes: notes || `Status changed from ${oldStatus} to ${status}`
    }, { transaction });

    await transaction.commit();

    const updatedQuotation = await Quotation.findByPk(quotation.id, {
      include: [
        { model: QuotationItem, as: 'items' },
        { model: QuotationStatusHistory, as: 'statusHistory' }
      ]
    });

    res.json({
      message: 'Quotation status updated successfully.',
      quotation: updatedQuotation
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Update quotation status error:', error);
    res.status(500).json({ message: 'Server error while updating quotation status.' });
  }
};

module.exports = {
  createQuotation,
  getMyQuotations,
  getQuotation,
  adminGetQuotations,
  updateQuotationStatus
};
