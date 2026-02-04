const { sequelize } = require('../config/database');

// Ensure all models are loaded and registered before associations
const User = require('./User');
const Course = require('./Course');
const Quotation = require('./Quotation');
const QuotationItem = require('./QuotationItem');
const QuotationStatusHistory = require('./QuotationStatusHistory');
const QuoteSettings = require('./QuoteSettings');
const StoreSettings = require('./StoreSettings');
const Registration = require('./Registration');

// User - Course (Many-to-Many through Registration)
User.belongsToMany(Course, { through: Registration, foreignKey: 'userId', as: 'registeredCourses' });
Course.belongsToMany(User, { through: Registration, foreignKey: 'courseId', as: 'registeredUsers' });
Registration.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Registration.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
User.hasMany(Registration, { foreignKey: 'userId', as: 'registrations' });
Course.hasMany(Registration, { foreignKey: 'courseId', as: 'registrations' });

// Define associations

// User - Quotation (One-to-Many)
User.hasMany(Quotation, { foreignKey: 'userId', as: 'quotations' });
Quotation.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Quotation - QuotationItem (One-to-Many)
Quotation.hasMany(QuotationItem, { foreignKey: 'quotationId', as: 'items' });
QuotationItem.belongsTo(Quotation, { foreignKey: 'quotationId', as: 'quotation' });

// Course - QuotationItem (One-to-Many)
Course.hasMany(QuotationItem, { foreignKey: 'courseId', as: 'quotationItems' });
QuotationItem.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Quotation - QuotationStatusHistory (One-to-Many)
Quotation.hasMany(QuotationStatusHistory, { foreignKey: 'quotationId', as: 'statusHistory' });
QuotationStatusHistory.belongsTo(Quotation, { foreignKey: 'quotationId', as: 'quotation' });

// User - QuotationStatusHistory (One-to-Many)
User.hasMany(QuotationStatusHistory, { foreignKey: 'changedBy', as: 'statusChanges' });
QuotationStatusHistory.belongsTo(User, { foreignKey: 'changedBy', as: 'changedByUser' });

// Sync database
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: !force });
    console.log('Database synchronized successfully.');

    // Create default admin user if not exists
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    if (!adminExists) {
      await User.create({
        email: 'admin@quotationgen.com',
        password: 'admin123',
        name: 'Admin',
        role: 'admin'
      });
      console.log('Default admin user created (email: admin@quotationgen.com, password: admin123)');
    }
  } catch (error) {
    console.error('Error synchronizing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Course,
  Quotation,
  QuotationItem,
  QuotationStatusHistory,
  QuoteSettings,
  StoreSettings,
  Registration,
  syncDatabase
};
