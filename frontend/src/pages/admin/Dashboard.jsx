import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FiFileText, FiPackage, FiUsers, FiDollarSign, FiEye } from 'react-icons/fi';
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

  const { stats, recentQuotations } = data || {};

  const statCards = [
    {
      title: t('admin.dashboard.totalQuotations'),
      value: stats?.totalQuotations || 0,
      icon: FiFileText,
      color: 'bg-blue-500',
      subtext: `${stats?.todayQuotations || 0} ${t('admin.dashboard.todayQuotations')}`
    },
    {
      title: t('admin.dashboard.totalRevenue'),
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: FiDollarSign,
      color: 'bg-green-500',
      subtext: `${formatCurrency(stats?.thisMonthRevenue || 0)} ${t('admin.dashboard.thisMonth')}`
    },
    {
      title: t('admin.dashboard.totalItems'),
      value: stats?.totalItems || 0,
      icon: FiPackage,
      color: 'bg-purple-500'
    },
    {
      title: t('admin.dashboard.totalUsers'),
      value: stats?.totalUsers || 0,
      icon: FiUsers,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('admin.dashboard.title')}</h1>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                {card.subtext && (
                  <p className="text-xs text-gray-400 mt-1">{card.subtext}</p>
                )}
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('admin.dashboard.recentQuotations')}
            </h2>
            <Link
              to="/admin/quotations"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
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
    </div>
  );
};

export default Dashboard;
