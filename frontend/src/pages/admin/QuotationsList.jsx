import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FiEye, FiSearch } from 'react-icons/fi';
import { adminAPI } from '../../services/api';

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

const QuotationsList = () => {
  const { t } = useTranslation();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchQuotations();
  }, [selectedStatus, page]);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (selectedStatus) params.status = selectedStatus;

      const response = await adminAPI.getQuotations(params);
      setQuotations(response.data.quotations);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchQuotations();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('admin.quotations.title')}</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="input pl-10 text-sm sm:text-base"
              />
            </div>
          </form>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="input sm:w-48 text-sm sm:text-base"
          >
            <option value="">{t('common.all')}</option>
            <option value="pending">{t('quotations.statuses.pending')}</option>
            <option value="under_review">{t('quotations.statuses.under_review')}</option>
            <option value="approved">{t('quotations.statuses.approved')}</option>
            <option value="rejected">{t('quotations.statuses.rejected')}</option>
            <option value="converted">{t('quotations.statuses.converted')}</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Mobile: Card View */}
            <div className="sm:hidden divide-y divide-gray-200">
              {quotations.map((quotation) => (
                <Link
                  key={quotation.id}
                  to={`/admin/quotations/${quotation.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-primary-600 text-sm">{quotation.quotationNumber}</p>
                      <p className="font-medium text-gray-900">{quotation.customerName}</p>
                      {quotation.customerCompany && (
                        <p className="text-xs text-gray-500">{quotation.customerCompany}</p>
                      )}
                    </div>
                    <span className={`badge badge-${quotation.status} text-xs`}>
                      {t(`quotations.statuses.${quotation.status}`)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    <p>{quotation.customerEmail}</p>
                    <p>{quotation.customerPhone}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(quotation.grandTotal)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {quotation.items?.length || 0} items • {formatDate(quotation.createdAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop: Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('quotations.quotationNumber')}
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('admin.quotations.customer')}
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">
                      {t('admin.quotations.contact')}
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                      {t('quotations.items')}
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('quotations.total')}
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('quotations.status')}
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                      {t('quotations.date')}
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      {t('common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {quotations.map((quotation) => (
                    <tr key={quotation.id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-primary-600 text-sm">
                          {quotation.quotationNumber}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{quotation.customerName}</p>
                          {quotation.customerCompany && (
                            <p className="text-xs text-gray-500">{quotation.customerCompany}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 hidden lg:table-cell">
                        <div className="text-sm">
                          <p className="truncate max-w-[180px]">{quotation.customerEmail}</p>
                          <p className="text-gray-500">{quotation.customerPhone}</p>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {quotation.items?.length || 0}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-sm">
                          {formatCurrency(quotation.grandTotal)}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`badge badge-${quotation.status} text-xs`}>
                          {t(`quotations.statuses.${quotation.status}`)}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {formatDate(quotation.createdAt)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          to={`/admin/quotations/${quotation.id}`}
                          className="text-primary-600 hover:text-primary-700 p-2 inline-block"
                        >
                          <FiEye className="w-5 h-5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
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
    </div>
  );
};

export default QuotationsList;
