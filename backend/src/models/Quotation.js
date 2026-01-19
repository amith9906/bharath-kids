const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const Quotation = sequelize.define('Quotation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quotationNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'quotation_number'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  customerName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'customer_name'
  },
  customerEmail: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'customer_email',
    validate: {
      isEmail: true
    }
  },
  customerPhone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'customer_phone'
  },
  customerCompany: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'customer_company'
  },
  customerAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'customer_address'
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  discountTotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'discount_total'
  },
  taxTotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'tax_total'
  },
  grandTotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'grand_total'
  },
  status: {
    type: DataTypes.ENUM('pending', 'under_review', 'approved', 'rejected', 'converted'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'admin_notes'
  }
}, {
  tableName: 'quotations',
  timestamps: true,
  underscored: true
});

// Generate quotation number before creating
Quotation.beforeCreate(async (quotation) => {
  try {
    console.log('Running Quotation.beforeCreate hook...');
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    // Get first and last day of current month
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

    // Count quotations for this month (cross-database compatible)
    const count = await Quotation.count({
      where: {
        createdAt: {
          [Op.gte]: firstDay,
          [Op.lte]: lastDay
        }
      }
    });

    const serialNumber = (count + 1).toString().padStart(4, '0');
    quotation.quotationNumber = `QT${year}${month}${serialNumber}`;
    console.log('Generated quotationNumber:', quotation.quotationNumber);
  } catch (err) {
    console.error('Error in Quotation.beforeCreate hook:', err);
    throw err;
  }
});

module.exports = Quotation;
