import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { quotationsAPI } from '../services/api';
import { FiArrowLeft } from 'react-icons/fi';

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
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const QuotationDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotation();
    // eslint-disable-next-line
  }, [id]);

  const fetchQuotation = async () => {
    setLoading(true);
    try {
      const response = await quotationsAPI.getQuotation(id);
      setQuotation(response.data.quotation);
    } catch (error) {
      setQuotation(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">{t('quotations.notFound')}</p>
        <Link to="/quotations" className="btn btn-primary">
          <FiArrowLeft className="inline mr-2" /> {t('common.back')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-lg shadow-sm p-6">
        <Link to="/quotations" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
          <FiArrowLeft className="inline mr-2" /> {t('common.back')}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('quotations.detailsTitle')}</h1>
        <div className="mb-4">
          <span className="font-semibold text-primary-600">{quotation.quotationNumber}</span>
          <span className="ml-4 text-gray-500">{formatDate(quotation.createdAt)}</span>
        </div>
        <div className="mb-4">
          <span className="font-medium">{t('quotations.status')}:</span> {t(`quotations.statuses.${quotation.status}`)}
        </div>
        <div className="mb-4">
          <span className="font-medium">{t('quotations.total')}:</span> {formatCurrency(quotation.grandTotal)}
        </div>
        <div className="mb-4">
          <span className="font-medium">{t('quotations.items')}:</span>
          <ul className="list-disc ml-6 mt-2">
            {quotation.items?.map((item) => (
              <li key={item.id}>
                {item.itemName} - {item.quantity} x {formatCurrency(item.unitPrice)}
              </li>
            ))}
          </ul>
        </div>
        {quotation.notes && (
          <div className="mb-4">
            <span className="font-medium">{t('quotations.notes')}:</span> {quotation.notes}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationDetails;
