const { Item } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const { deleteFile, uploadDir } = require('../middleware/upload');

// Get all active items (public)
const getItems = async (req, res) => {
  try {
    const { category, brand, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = { isActive: true };

    if (category) {
      where.category = category;
    }

    if (brand) {
      where.brand = brand;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { brand: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { rows: items, count: total } = await Item.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error while fetching items.' });
  }
};

// Get single item (public)
const getItem = async (req, res) => {
  try {
    const item = await Item.findOne({
      where: { id: req.params.id, isActive: true }
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    res.json({ item });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ message: 'Server error while fetching item.' });
  }
};

// Get categories (public)
const getCategories = async (req, res) => {
  try {
    const categories = await Item.findAll({
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

// Get brands (public)
const getBrands = async (req, res) => {
  try {
    const brands = await Item.findAll({
      attributes: ['brand'],
      where: { isActive: true, brand: { [Op.ne]: null } },
      group: ['brand'],
      order: [['brand', 'ASC']]
    });

    res.json({
      brands: brands.map(b => b.brand).filter(Boolean)
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ message: 'Server error while fetching brands.' });
  }
};

// Admin: Get all items (including inactive)
const adminGetItems = async (req, res) => {
  try {
    const { category, brand, search, isActive, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (category) {
      where.category = category;
    }

    if (brand) {
      where.brand = brand;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { hsnCode: { [Op.iLike]: `%${search}%` } },
        { brand: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { rows: items, count: total } = await Item.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin get items error:', error);
    res.status(500).json({ message: 'Server error while fetching items.' });
  }
};

// Admin: Create item
const createItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      price,
      category,
      brand,
      hsnCode,
      unit,
      igstRate,
      cgstRate,
      sgstRate,
      discountPercent
    } = req.body;

    // Handle image upload
    let imageUrl = req.body.imageUrl || null;
    if (req.file) {
      imageUrl = `/uploads/items/${req.file.filename}`;
    }

    const item = await Item.create({
      name,
      description,
      price,
      imageUrl,
      category,
      brand,
      hsnCode,
      unit,
      igstRate: igstRate || 0,
      cgstRate: cgstRate || 0,
      sgstRate: sgstRate || 0,
      discountPercent: discountPercent || 0
    });

    res.status(201).json({
      message: 'Item created successfully.',
      item
    });
  } catch (error) {
    console.error('Create item error:', error);
    // Clean up uploaded file if error occurs
    if (req.file) {
      deleteFile(req.file.path);
    }
    res.status(500).json({ message: 'Server error while creating item.' });
  }
};

// Admin: Update item
const updateItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const item = await Item.findByPk(req.params.id);

    if (!item) {
      if (req.file) deleteFile(req.file.path);
      return res.status(404).json({ message: 'Item not found.' });
    }

    const {
      name,
      description,
      price,
      category,
      brand,
      hsnCode,
      unit,
      igstRate,
      cgstRate,
      sgstRate,
      discountPercent,
      isActive,
      removeImage
    } = req.body;

    // Handle image
    let imageUrl = item.imageUrl;

    // If new file uploaded
    if (req.file) {
      // Delete old image if it's a local file
      if (item.imageUrl && item.imageUrl.startsWith('/uploads/')) {
        const oldPath = path.join(uploadDir, path.basename(item.imageUrl));
        deleteFile(oldPath);
      }
      imageUrl = `/uploads/items/${req.file.filename}`;
    }

    // If remove image requested
    if (removeImage === 'true' || removeImage === true) {
      if (item.imageUrl && item.imageUrl.startsWith('/uploads/')) {
        const oldPath = path.join(uploadDir, path.basename(item.imageUrl));
        deleteFile(oldPath);
      }
      imageUrl = null;
    }

    await item.update({
      name: name !== undefined ? name : item.name,
      description: description !== undefined ? description : item.description,
      price: price !== undefined ? price : item.price,
      imageUrl: imageUrl,
      category: category !== undefined ? category : item.category,
      brand: brand !== undefined ? brand : item.brand,
      hsnCode: hsnCode !== undefined ? hsnCode : item.hsnCode,
      unit: unit !== undefined ? unit : item.unit,
      igstRate: igstRate !== undefined ? igstRate : item.igstRate,
      cgstRate: cgstRate !== undefined ? cgstRate : item.cgstRate,
      sgstRate: sgstRate !== undefined ? sgstRate : item.sgstRate,
      discountPercent: discountPercent !== undefined ? discountPercent : item.discountPercent,
      isActive: isActive !== undefined ? isActive : item.isActive
    });

    res.json({
      message: 'Item updated successfully.',
      item
    });
  } catch (error) {
    console.error('Update item error:', error);
    if (req.file) deleteFile(req.file.path);
    res.status(500).json({ message: 'Server error while updating item.' });
  }
};

// Admin: Delete item (soft delete by setting isActive to false)
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    await item.update({ isActive: false });

    res.json({ message: 'Item deleted successfully.' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Server error while deleting item.' });
  }
};

// Admin: Upload item image
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided.' });
    }

    const imageUrl = `/uploads/items/${req.file.filename}`;

    res.json({
      message: 'Image uploaded successfully.',
      imageUrl
    });
  } catch (error) {
    console.error('Upload image error:', error);
    if (req.file) deleteFile(req.file.path);
    res.status(500).json({ message: 'Server error while uploading image.' });
  }
};

// Admin: Download bulk upload template
const downloadTemplate = async (req, res) => {
  try {
    // Create template workbook
    const wb = XLSX.utils.book_new();

    const templateData = [
      {
        'Name*': 'Sample Product',
        'Description': 'Product description',
        'Price*': 1000,
        'Brand': 'Anchor',
        'Category': 'Switches',
        'HSN Code': '8471',
        'Unit': 'piece',
        'Discount %': 10,
        'IGST %': 18,
        'CGST %': 0,
        'SGST %': 0
      },
      {
        'Name*': 'Another Product',
        'Description': 'Another description',
        'Price*': 500,
        'Brand': 'Legrand',
        'Category': 'Switches',
        'HSN Code': '8473',
        'Unit': 'piece',
        'Discount %': 5,
        'IGST %': 0,
        'CGST %': 9,
        'SGST %': 9
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, // Name
      { wch: 40 }, // Description
      { wch: 12 }, // Price
      { wch: 15 }, // Brand
      { wch: 15 }, // Category
      { wch: 12 }, // HSN Code
      { wch: 10 }, // Unit
      { wch: 12 }, // Discount
      { wch: 10 }, // IGST
      { wch: 10 }, // CGST
      { wch: 10 }  // SGST
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Items');

    // Write to buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=items_template.xlsx');
    res.send(buffer);
  } catch (error) {
    console.error('Download template error:', error);
    res.status(500).json({ message: 'Server error while generating template.' });
  }
};

// Admin: Bulk upload items from Excel
const bulkUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No Excel file provided.' });
    }

    // Read Excel file from buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      return res.status(400).json({ message: 'Excel file is empty.' });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2; // Excel row number (accounting for header)

      try {
        const name = row['Name*'] || row['Name'];
        const price = parseFloat(row['Price*'] || row['Price']);

        if (!name) {
          results.failed++;
          results.errors.push({ row: rowNum, error: 'Name is required' });
          continue;
        }

        if (isNaN(price) || price < 0) {
          results.failed++;
          results.errors.push({ row: rowNum, error: 'Valid price is required' });
          continue;
        }

        await Item.create({
          name: name.toString().trim(),
          description: row['Description'] ? row['Description'].toString().trim() : null,
          price: price,
          brand: row['Brand'] ? row['Brand'].toString().trim() : null,
          category: row['Category'] ? row['Category'].toString().trim() : null,
          hsnCode: row['HSN Code'] ? row['HSN Code'].toString().trim() : null,
          unit: row['Unit'] ? row['Unit'].toString().trim().toLowerCase() : 'piece',
          discountPercent: parseFloat(row['Discount %']) || 0,
          igstRate: parseFloat(row['IGST %']) || 0,
          cgstRate: parseFloat(row['CGST %']) || 0,
          sgstRate: parseFloat(row['SGST %']) || 0,
          isActive: true
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({ row: rowNum, error: error.message });
      }
    }

    res.json({
      message: `Bulk upload completed. ${results.success} items created, ${results.failed} failed.`,
      results
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ message: 'Server error while processing bulk upload.' });
  }
};

module.exports = {
  getItems,
  getItem,
  getCategories,
  getBrands,
  adminGetItems,
  createItem,
  updateItem,
  deleteItem,
  uploadImage,
  downloadTemplate,
  bulkUpload
};
