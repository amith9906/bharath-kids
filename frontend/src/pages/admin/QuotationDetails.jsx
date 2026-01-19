import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaBuilding } from 'react-icons/fa';
import { toast } from 'react-toastify';
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
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const fetchQuotation = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getQuotation(id);
      setQuotation(response.data.quotation);
      setNewStatus(response.data.quotation.status);
    } catch (error) {
      console.error('Error fetching quotation:', error);
      toast.error('Failed to load quotation');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (newStatus === quotation.status) {
      toast.info('Status is the same');
      return;
    }

    setUpdating(true);
    try {
      await adminAPI.updateQuotationStatus(id, {
        status: newStatus,
        notes: statusNotes
      });
      toast.success(t('admin.quotations.statusUpdated'));
      fetchQuotation();
      setStatusNotes('');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Quotation not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/admin/quotations"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <FiArrowLeft className="w-4 h-4" />
        {t('common.back')}
      </Link>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {quotation.quotationNumber}
          </h1>
          <p className="text-gray-500">{formatDate(quotation.createdAt)}</p>
        </div>
        <span className={`badge badge-${quotation.status} text-base px-4 py-2`}>
          {t(`quotations.statuses.${quotation.status}`)}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('checkout.customerDetails')}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('checkout.name')}</p>
                <p className="font-medium">{quotation.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <FiMail className="w-4 h-4" /> {t('checkout.email')}
                </p>
                <p className="font-medium">{quotation.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <FiPhone className="w-4 h-4" /> {t('checkout.phone')}
                </p>
                <p className="font-medium">{quotation.customerPhone}</p>
              </div>
              {quotation.customerCompany && (
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <FaBuilding className="w-4 h-4" /> {t('checkout.company')}
                  </p>
                  <p className="font-medium">{quotation.customerCompany}</p>
                </div>
              )}
              {quotation.customerAddress && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <FiMapPin className="w-4 h-4" /> {t('checkout.address')}
                  </p>
                  <p className="font-medium">{quotation.customerAddress}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('quotations.items')}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-xs text-gray-500 uppercase border-b">
                  <tr>
                    <th className="text-left pb-3">{t('cart.item')}</th>
                    <th className="text-center pb-3">{t('cart.quantity')}</th>
                    <th className="text-right pb-3">{t('cart.unitPrice')}</th>
                    <th className="text-right pb-3">{t('items.discount')}</th>
                    <th className="text-right pb-3">{t('items.tax')}</th>
                    <th className="text-right pb-3">{t('cart.total')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {quotation.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3">
                        <p className="font-medium">{item.itemName}</p>
                        {item.hsnCode && (
                          <p className="text-xs text-gray-500">HSN: {item.hsnCode}</p>
                        )}
                      </td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 text-right text-green-600">
                        {item.discountPercent > 0 ? `-${item.discountPercent}%` : '-'}
                      </td>
                      <td className="py-3 text-right text-sm">
                        {item.igstRate > 0 && <p>IGST: {item.igstRate}%</p>}
                        {item.cgstRate > 0 && <p>CGST: {item.cgstRate}%</p>}
                        {item.sgstRate > 0 && <p>SGST: {item.sgstRate}%</p>}
                      </td>
                      <td className="py-3 text-right font-semibold">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('cart.subtotal')}</span>
                <span className="font-medium">{formatCurrency(quotation.subtotal)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>{t('cart.discountTotal')}</span>
                <span>-{formatCurrency(quotation.discountTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('cart.taxTotal')}</span>
                <span className="font-medium">{formatCurrency(quotation.taxTotal)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>{t('cart.grandTotal')}</span>
                <span className="text-primary-600">{formatCurrency(quotation.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quotation.notes && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Customer Notes
              </h2>
              <p className="text-gray-600">{quotation.notes}</p>
            </div>
          )}
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-6">
          {/* Update Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('admin.quotations.updateStatus')}
            </h2>
            <div className="space-y-4">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="input"
              >
                <option value="pending">{t('quotations.statuses.pending')}</option>
                <option value="under_review">{t('quotations.statuses.under_review')}</option>
                <option value="approved">{t('quotations.statuses.approved')}</option>
                <option value="rejected">{t('quotations.statuses.rejected')}</option>
                <option value="converted">{t('quotations.statuses.converted')}</option>
              </select>

              <textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder={t('admin.quotations.addNotes')}
                rows={3}
                className="input"
              />

              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="btn btn-primary w-full"
              >
                {updating ? t('common.loading') : t('admin.quotations.updateStatus')}
              </button>
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('admin.quotations.statusHistory')}
            </h2>
            <div className="space-y-4">
              {quotation.statusHistory?.map((history, index) => (
                <div key={history.id} className="border-l-2 border-primary-200 pl-4">
                  <span className={`badge badge-${history.status} text-xs`}>
                    {t(`quotations.statuses.${history.status}`)}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(history.createdAt)}
                  </p>
                  {history.changedByUser && (
                    <p className="text-xs text-gray-400">
                      by {history.changedByUser.name}
                    </p>
                  )}
                  {history.notes && (
                    <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationDetails;
