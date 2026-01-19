const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QuotationStatusHistory = sequelize.define('QuotationStatusHistory', {
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
  status: {
    type: DataTypes.ENUM('pending', 'under_review', 'approved', 'rejected', 'converted'),
    allowNull: false
  },
  changedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'changed_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'quotation_status_history',
  timestamps: true,
  underscored: true,
  updatedAt: false
});

module.exports = QuotationStatusHistory;
