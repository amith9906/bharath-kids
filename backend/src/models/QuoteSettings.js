const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QuoteSettings = sequelize.define('QuoteSettings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  companyName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'company_name'
  },
  companyAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'company_address'
  },
  companyPhone: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'company_phone'
  },
  companyEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'company_email'
  },
  companyGstin: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'company_gstin'
  },
  logoUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'logo_url'
  },
  disclaimer: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: 'This quotation is valid for 15 days from the date of issue. Prices are subject to change without prior notice. GST will be charged extra as applicable.'
  },
  termsAndConditions: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'terms_and_conditions'
  },
  footerText: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'footer_text'
  },
  showGstDisclaimer: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'show_gst_disclaimer'
  },
  validityDays: {
    type: DataTypes.INTEGER,
    defaultValue: 15,
    field: 'validity_days'
  }
}, {
  tableName: 'quote_settings',
  timestamps: true,
  underscored: true
});

module.exports = QuoteSettings;
