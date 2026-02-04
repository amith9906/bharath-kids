const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StoreSettings = sequelize.define('StoreSettings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  storeName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'store_name',
    defaultValue: 'My Store'
  },
  tagline: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: ''
  },
  logoUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'logo_url'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  pincode: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  alternatePhone: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'alternate_phone'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  whatsapp: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  gstin: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  proprietorName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'proprietor_name'
  },
  proprietorPhone: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'proprietor_phone'
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  facebook: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  instagram: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  workingHours: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'working_hours',
    defaultValue: 'Mon-Sat: 9:00 AM - 7:00 PM'
  },
  aboutText: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'about_text'
  },
  mission: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  vision: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  aboutWebsite: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'about_website'
  },
  footerText: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'footer_text'
  },
  primaryColor: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'primary_color',
    defaultValue: '#4F46E5'
  }
}, {
  tableName: 'store_settings',
  timestamps: true,
  underscored: true
});

module.exports = StoreSettings;
