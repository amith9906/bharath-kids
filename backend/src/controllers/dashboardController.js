const { Quotation, QuotationItem, Course, User, Registration } = require('../models');
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

    // Total courses count
    const totalCourses = await Course.count({ where: { isActive: true } });

    // Total users count (all users who registered)
    const totalUsers = await User.count({ where: { role: 'user' } });

    // Active users count
    const activeUsers = await User.count({ where: { role: 'user', isActive: true } });

    // New users this month
    const newUsersThisMonth = await User.count({
      where: {
        role: 'user',
        createdAt: { [Op.gte]: startOfMonth }
      }
    });

    // Total registrations count
    const totalRegistrations = await Registration.count();

    // Active registrations count
    const activeRegistrations = await Registration.count({ where: { status: 'active' } });

    // Today's quotations
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayQuotations = await Quotation.count({
      where: {
        createdAt: { [Op.gte]: startOfDay }
      }
    });

    // User growth trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowthTrend = await User.findAll({
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        role: 'user',
        createdAt: { [Op.gte]: sixMonthsAgo }
      },
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'ASC']]
    });

    // State-wise user distribution
    const stateDistribution = await User.findAll({
      attributes: [
        'state',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        role: 'user',
        state: { [Op.ne]: null }
      },
      group: ['state'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10
    });

    // City-wise user distribution (top 10 cities)
    const cityDistribution = await User.findAll({
      attributes: [
        'city',
        'state',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        role: 'user',
        city: { [Op.ne]: null }
      },
      group: ['city', 'state'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10
    });

    // Popular courses (by registration count)
    const popularCourses = await Registration.findAll({
      attributes: [
        'courseId',
        [sequelize.fn('COUNT', sequelize.col('Registration.id')), 'registrationCount']
      ],
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'category', 'price']
        }
      ],
      group: ['courseId', 'course.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('Registration.id')), 'DESC']],
      limit: 5
    });

    // State-wise registrations
    const stateRegistrations = await Registration.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('Registration.id')), 'count']
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['state'],
          where: {
            state: { [Op.ne]: null }
          }
        }
      ],
      group: ['user.state', 'user.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('Registration.id')), 'DESC']],
      limit: 10,
      subQuery: false
    });

    // Monthly trend (last 6 months)
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
        totalCourses,
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        totalRegistrations,
        activeRegistrations
      },
      recentQuotations,
      monthlyTrend: monthlyTrend.map(item => ({
        month: item.get('month'),
        count: parseInt(item.get('count')),
        total: parseFloat(item.get('total')) || 0
      })),
      userGrowthTrend: userGrowthTrend.map(item => ({
        month: item.get('month'),
        count: parseInt(item.get('count'))
      })),
      stateDistribution: stateDistribution.map(item => ({
        state: item.state,
        count: parseInt(item.get('count'))
      })),
      cityDistribution: cityDistribution.map(item => ({
        city: item.city,
        state: item.state,
        count: parseInt(item.get('count'))
      })),
      popularCourses: popularCourses.map(item => ({
        course: item.course,
        registrationCount: parseInt(item.get('registrationCount'))
      })),
      stateRegistrations: stateRegistrations.map(item => ({
        state: item.user?.state,
        count: parseInt(item.get('count'))
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
