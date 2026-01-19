const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'image_url'
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  hsnCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'hsn_code'
  },
  unit: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'piece'
  },
  igstRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'igst_rate'
  },
  cgstRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'cgst_rate'
  },
  sgstRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'sgst_rate'
  },
  discountPercent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'discount_percent'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'items',
  timestamps: true,
  underscored: true
});

module.exports = Item;
