const { StoreSettings } = require('../models');
const path = require('path');
const fs = require('fs');

// Get store settings (public)
const getStoreSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();

    if (!settings) {
      // Create default settings
      settings = await StoreSettings.create({
        storeName: 'Bharath Kids',
        tagline: 'Your trusted partner for quality products',
        workingHours: 'Mon-Sat: 9:00 AM - 7:00 PM'
      });
    }

    res.json({ settings });
  } catch (error) {
    console.error('Get store settings error:', error);
    res.status(500).json({ message: 'Server error while fetching settings.' });
  }
};

// Update store settings (admin only)
const updateStoreSettings = async (req, res) => {
  try {
    const {
      storeName,
      tagline,
      address,
      city,
      state,
      pincode,
      phone,
      alternatePhone,
      email,
      whatsapp,
      gstin,
      proprietorName,
      proprietorPhone,
      website,
      facebook,
      instagram,
      workingHours,
      aboutText,
      mission,
      vision,
      aboutWebsite,
      footerText,
      primaryColor
    } = req.body;

    let settings = await StoreSettings.findOne();

    const updateData = {
      storeName,
      tagline,
      address,
      city,
      state,
      pincode,
      phone,
      alternatePhone,
      email,
      whatsapp,
      gstin,
      proprietorName,
      proprietorPhone,
      website,
      facebook,
      instagram,
      workingHours,
      aboutText,
      mission,
      vision,
      aboutWebsite,
      footerText,
      primaryColor
    };

    // Handle logo upload if present
    if (req.file) {
      // Delete old logo if exists
      if (settings?.logoUrl) {
        const oldLogoPath = path.join(__dirname, '../../', settings.logoUrl);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
      updateData.logoUrl = `/uploads/store/${req.file.filename}`;
    }

    if (!settings) {
      settings = await StoreSettings.create(updateData);
    } else {
      await settings.update(updateData);
    }

    res.json({
      message: 'Settings updated successfully.',
      settings
    });
  } catch (error) {
    console.error('Update store settings error:', error);
    res.status(500).json({ message: 'Server error while updating settings.' });
  }
};

// Upload store logo
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    let settings = await StoreSettings.findOne();

    // Delete old logo if exists
    if (settings?.logoUrl) {
      const oldLogoPath = path.join(__dirname, '../../', settings.logoUrl);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }

    const logoUrl = `/uploads/store/${req.file.filename}`;

    if (!settings) {
      settings = await StoreSettings.create({ logoUrl });
    } else {
      await settings.update({ logoUrl });
    }

    res.json({
      message: 'Logo uploaded successfully.',
      logoUrl
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({ message: 'Server error while uploading logo.' });
  }
};

// Delete store logo
const deleteLogo = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();

    if (settings?.logoUrl) {
      const logoPath = path.join(__dirname, '../../', settings.logoUrl);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }
      await settings.update({ logoUrl: null });
    }

    res.json({ message: 'Logo deleted successfully.' });
  } catch (error) {
    console.error('Delete logo error:', error);
    res.status(500).json({ message: 'Server error while deleting logo.' });
  }
};

module.exports = {
  getStoreSettings,
  updateStoreSettings,
  uploadLogo,
  deleteLogo
};
