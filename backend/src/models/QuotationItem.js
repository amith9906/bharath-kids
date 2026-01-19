const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QuotationItem = sequelize.define('QuotationItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quotationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'quotation_id',
    references: {
      model: 'quotations',
      key: 'id'
    }
  },
  itemId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'item_id',
    references: {
      model: 'items',
      key: 'id'
    }
  },
  itemName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'item_name'
  },
  itemDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'item_description'
  },
  hsnCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'hsn_code'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  unit: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'piece'
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'unit_price'
  },
  discountPercent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'discount_percent'
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'discount_amount'
  },
  taxableAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'taxable_amount'
  },
  igstRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'igst_rate'
  },
  igstAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'igst_amount'
  },
  cgstRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'cgst_rate'
  },
  cgstAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'cgst_amount'
  },
  sgstRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'sgst_rate'
  },
  sgstAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'sgst_amount'
  },
  totalPrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: 'total_price'
  }
}, {
  tableName: 'quotation_items',
  timestamps: true,
  underscored: true
});

module.exports = QuotationItem;
