import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FiFileText, FiEye } from 'react-icons/fi';
import { quotationsAPI } from '../services/api';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const MyQuotations = () => {
  const { t } = useTranslation();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchQuotations();
  }, [selectedStatus, page]);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (selectedStatus) params.status = selectedStatus;

      const response = await quotationsAPI.getMyQuotations(params);
      setQuotations(response.data.quotations);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`badge badge-${status}`}>
        {t(`quotations.statuses.${status}`)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('quotations.title')}</h1>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="input w-full md:w-48"
          >
            <option value="">{t('common.all')}</option>
            <option value="pending">{t('quotations.statuses.pending')}</option>
            <option value="under_review">{t('quotations.statuses.under_review')}</option>
            <option value="approved">{t('quotations.statuses.approved')}</option>
            <option value="rejected">{t('quotations.statuses.rejected')}</option>
            <option value="converted">{t('quotations.statuses.converted')}</option>
          </select>
        </div>

        {quotations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t('quotations.noQuotations')}</p>
            <Link to="/items" className="btn btn-primary mt-4">
              {t('home.browseProducts')}
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('quotations.quotationNumber')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('quotations.date')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('quotations.items')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('quotations.total')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('quotations.status')}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        {t('common.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {quotations.map((quotation) => (
                      <tr key={quotation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-primary-600">
                            {quotation.quotationNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(quotation.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {quotation.items?.length || 0} items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold">
                            {formatCurrency(quotation.grandTotal)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(quotation.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link
                            to={`/quotations/${quotation.id}`}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <FiEye className="w-5 h-5 inline" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  {t('common.back')}
                </button>
                <span className="flex items-center px-4 text-gray-600">
                  {page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  {t('common.next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyQuotations;
