import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FiFileText, FiPackage, FiUsers, FiDollarSign, FiEye, FiTrendingUp, FiMapPin, FiUserCheck, FiUserPlus } from 'react-icons/fi';
import { adminAPI } from '../../services/api';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric'
  });
};

const formatMonth = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric'
  });
};

const Dashboard = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const { 
    stats, 
    recentQuotations, 
    userGrowthTrend, 
    stateDistribution, 
    cityDistribution, 
    popularCourses,
    stateRegistrations 
  } = data || {};

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: FiUsers,
      color: 'bg-blue-500',
      subtext: `${stats?.newUsersThisMonth || 0} new this month`
    },
    {
      title: 'Active Students',
      value: stats?.activeRegistrations || 0,
      icon: FiUserCheck,
      color: 'bg-green-500',
      subtext: `${stats?.totalRegistrations || 0} total registrations`
    },
    {
      title: t('admin.dashboard.totalQuotations'),
      value: stats?.totalQuotations || 0,
      icon: FiFileText,
      color: 'bg-purple-500',
      subtext: `${stats?.todayQuotations || 0} ${t('admin.dashboard.todayQuotations')}`
    },
    {
      title: t('admin.dashboard.totalRevenue'),
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: FiDollarSign,
      color: 'bg-orange-500',
      subtext: `${formatCurrency(stats?.thisMonthRevenue || 0)} this month`
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('admin.dashboard.title')}</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
            <div className="flex items-start sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 truncate">{card.title}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1 truncate">{card.value}</p>
                {card.subtext && (
                  <p className="text-xs text-gray-400 mt-1 truncate hidden sm:block">{card.subtext}</p>
                )}
              </div>
              <div className={`${card.color} p-2 sm:p-3 rounded-lg flex-shrink-0`}>
                <card.icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Status Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            {t('admin.dashboard.statusBreakdown')}
          </h2>
          <div className="space-y-3">
            {Object.entries(stats?.statusBreakdown || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`badge badge-${status}`}>
                  {t(`quotations.statuses.${status}`)}
                </span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Quotations */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              {t('admin.dashboard.recentQuotations')}
            </h2>
            <Link
              to="/admin/quotations"
              className="text-xs sm:text-sm text-primary-600 hover:text-primary-700"
            >
              View All
            </Link>
          </div>

          {/* Mobile: Card View */}
          <div className="sm:hidden space-y-3">
            {recentQuotations?.slice(0, 5).map((quotation) => (
              <Link
                key={quotation.id}
                to={`/admin/quotations/${quotation.id}`}
                className="block bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-primary-600 text-sm">{quotation.quotationNumber}</p>
                    <p className="text-sm text-gray-900">{quotation.customerName}</p>
                  </div>
                  <span className={`badge badge-${quotation.status} text-xs`}>
                    {t(`quotations.statuses.${quotation.status}`)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className="font-semibold text-gray-900">{formatCurrency(quotation.grandTotal)}</span>
                  <span>{formatDate(quotation.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop: Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="pb-3">#</th>
                  <th className="pb-3">{t('admin.quotations.customer')}</th>
                  <th className="pb-3">{t('quotations.total')}</th>
                  <th className="pb-3">{t('quotations.status')}</th>
                  <th className="pb-3">{t('quotations.date')}</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentQuotations?.slice(0, 5).map((quotation) => (
                  <tr key={quotation.id} className="border-t">
                    <td className="py-3 font-medium text-primary-600">
                      {quotation.quotationNumber}
                    </td>
                    <td className="py-3">{quotation.customerName}</td>
                    <td className="py-3 font-semibold">
                      {formatCurrency(quotation.grandTotal)}
                    </td>
                    <td className="py-3">
                      <span className={`badge badge-${quotation.status}`}>
                        {t(`quotations.statuses.${quotation.status}`)}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">
                      {formatDate(quotation.createdAt)}
                    </td>
                    <td className="py-3">
                      <Link
                        to={`/admin/quotations/${quotation.id}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <FiEye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* User Growth Trend */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiTrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">User Growth (Last 6 Months)</h2>
          </div>
          <div className="space-y-3">
            {userGrowthTrend && userGrowthTrend.length > 0 ? (
              userGrowthTrend.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{formatMonth(item.month)}</span>
                  <div className="flex items-center gap-3 flex-1 mx-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${(item.count / Math.max(...userGrowthTrend.map(i => i.count))) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900 min-w-[40px] text-right">{item.count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No user growth data available</p>
            )}
          </div>
        </div>

        {/* Popular Courses */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <FiPackage className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Popular Courses</h2>
          </div>
          <div className="space-y-3">
            {popularCourses && popularCourses.length > 0 ? (
              popularCourses.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3 pb-3 border-b last:border-b-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.course?.title}</p>
                    <p className="text-xs text-gray-500">{item.course?.category}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full whitespace-nowrap">
                    {item.registrationCount} students
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No course data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Geographical Analytics */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* State-wise Users */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FiMapPin className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Top States - User Registrations</h2>
              <p className="text-xs text-gray-500">Focus your marketing on these states</p>
            </div>
          </div>
          <div className="space-y-2">
            {stateDistribution && stateDistribution.length > 0 ? (
              stateDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{item.state || 'Not specified'}</span>
                  </div>
                  <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded">
                    {item.count} users
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No state data available. Users need to provide their state during registration.</p>
            )}
          </div>
        </div>

        {/* City-wise Users */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <FiMapPin className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Top Cities - User Registrations</h2>
              <p className="text-xs text-gray-500">Concentrate marketing efforts here</p>
            </div>
          </div>
          <div className="space-y-2">
            {cityDistribution && cityDistribution.length > 0 ? (
              cityDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-sm font-medium text-gray-900">{item.city || 'Not specified'}</span>
                      {item.state && <span className="text-xs text-gray-500 ml-1">({item.state})</span>}
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded">
                    {item.count} users
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No city data available. Users need to provide their city during registration.</p>
            )}
          </div>
        </div>
      </div>

      {/* State-wise Course Registrations */}
      {stateRegistrations && stateRegistrations.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary-100 p-3 rounded-lg">
              <FiUserPlus className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">State-wise Course Registrations</h2>
              <p className="text-xs text-gray-500">States with highest course enrollments</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stateRegistrations.map((item, idx) => (
              <div key={idx} className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">{item.state || 'Unknown'}</p>
                <p className="text-2xl font-bold text-primary-600">{item.count}</p>
                <p className="text-xs text-gray-500">registrations</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
