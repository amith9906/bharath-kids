const { Quotation, QuotationItem, Item, User } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Total quotations count
    const totalQuotations = await Quotation.count();

    // Status-wise breakdown
    const statusCounts = await Quotation.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const statusBreakdown = {
      pending: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      converted: 0
    };

    statusCounts.forEach(item => {
      statusBreakdown[item.status] = parseInt(item.get('count'));
    });

    // Total revenue (from approved and converted quotations)
    const revenueResult = await Quotation.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('grand_total')), 'totalRevenue']
      ],
      where: {
        status: { [Op.in]: ['approved', 'converted'] }
      }
    });

    const totalRevenue = parseFloat(revenueResult?.get('totalRevenue')) || 0;

    // This month's quotations
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthQuotations = await Quotation.count({
      where: {
        createdAt: { [Op.gte]: startOfMonth }
      }
    });

    // This month's revenue
    const thisMonthRevenueResult = await Quotation.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('grand_total')), 'monthRevenue']
      ],
      where: {
        status: { [Op.in]: ['approved', 'converted'] },
        createdAt: { [Op.gte]: startOfMonth }
      }
    });

    const thisMonthRevenue = parseFloat(thisMonthRevenueResult?.get('monthRevenue')) || 0;

    // Recent quotations (last 10)
    const recentQuotations = await Quotation.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Total items count
    const totalItems = await Item.count({ where: { isActive: true } });

    // Total users count
    const totalUsers = await User.count({ where: { role: 'user', isActive: true } });

    // Today's quotations
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayQuotations = await Quotation.count({
      where: {
        createdAt: { [Op.gte]: startOfDay }
      }
    });

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Quotation.findAll({
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('grand_total')), 'total']
      ],
      where: {
        createdAt: { [Op.gte]: sixMonthsAgo }
      },
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'ASC']]
    });

    res.json({
      stats: {
        totalQuotations,
        statusBreakdown,
        totalRevenue,
        thisMonthQuotations,
        thisMonthRevenue,
        todayQuotations,
        totalItems,
        totalUsers
      },
      recentQuotations,
      monthlyTrend: monthlyTrend.map(item => ({
        month: item.get('month'),
        count: parseInt(item.get('count')),
        total: parseFloat(item.get('total')) || 0
      }))
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard stats.' });
  }
};

module.exports = {
  getDashboardStats
};
