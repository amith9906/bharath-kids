import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { FiCheck, FiArrowLeft, FiDownload, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { quotationsAPI } from '../services/api';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || '';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
};

const Checkout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, subtotal, discountTotal, taxTotal, grandTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    customerCompany: user?.company || '',
    customerAddress: user?.address || '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [quotation, setQuotation] = useState(null);
  const [errors, setErrors] = useState({});
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) {
      newErrors.customerName = t('validation.required');
    }
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = t('validation.required');
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = t('validation.invalidEmail');
    }
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = t('validation.required');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (items.length === 0) {
      toast.error('Cart is empty');
      navigate('/items');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        items: items.map((item) => ({
          itemId: item.id,
          quantity: item.quantity
        }))
      };

      const response = await quotationsAPI.create(payload);
      setQuotation(response.data.quotation);
      setSubmitted(true);
      clearCart();
      toast.success(t('checkout.successTitle'));
    } catch (error) {
      console.error('Quotation submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit quotation');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!quotation) return;

    setDownloadingPDF(true);
    try {
      const response = await quotationsAPI.downloadPDF(quotation.id);
      const pdfUrl = response.data.pdfUrl;

      // Open PDF in new tab or download
      const fullUrl = `${API_BASE_URL}${pdfUrl}`;
      window.open(fullUrl, '_blank');
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error('Failed to download PDF');
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (items.length === 0 && !submitted) {
    navigate('/cart');
    return null;
  }

  if (submitted && quotation) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('checkout.successTitle')}
            </h1>
            <p className="text-gray-600 mb-6">
              {t('checkout.successMessage')}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">{t('checkout.quotationNumber')}</p>
              <p className="text-2xl font-bold text-primary-600">
                {quotation.quotationNumber}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">{t('cart.grandTotal')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(quotation.grandTotal)}
              </p>
            </div>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPDF}
              className="btn btn-primary w-full mb-6 py-3 flex items-center justify-center gap-2"
            >
              {downloadingPDF ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <FiDownload className="w-5 h-5" />
                  Download Quotation PDF
                </>
              )}
            </button>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/" className="btn btn-secondary">
                {t('checkout.backToHome')}
              </Link>
              <Link to="/items" className="btn btn-secondary">
                {t('cart.continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 text-sm sm:text-base"
        >
          <FiArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </Link>

        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-8">{t('checkout.title')}</h1>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Customer Details Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
                {t('checkout.customerDetails')}
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.name')} *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder={t('checkout.namePlaceholder')}
                    className={`input ${errors.customerName ? 'border-red-500' : ''}`}
                  />
                  {errors.customerName && (
                    <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.email')} *
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    placeholder={t('checkout.emailPlaceholder')}
                    className={`input ${errors.customerEmail ? 'border-red-500' : ''}`}
                  />
                  {errors.customerEmail && (
                    <p className="text-red-500 text-xs mt-1">{errors.customerEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.phone')} *
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    placeholder={t('checkout.phonePlaceholder')}
                    className={`input ${errors.customerPhone ? 'border-red-500' : ''}`}
                  />
                  {errors.customerPhone && (
                    <p className="text-red-500 text-xs mt-1">{errors.customerPhone}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.company')}
                  </label>
                  <input
                    type="text"
                    name="customerCompany"
                    value={formData.customerCompany}
                    onChange={handleChange}
                    placeholder={t('checkout.companyPlaceholder')}
                    className="input"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.address')}
                  </label>
                  <textarea
                    name="customerAddress"
                    value={formData.customerAddress}
                    onChange={handleChange}
                    placeholder={t('checkout.addressPlaceholder')}
                    rows={2}
                    className="input"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.notes')}
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder={t('checkout.notesPlaceholder')}
                    rows={3}
                    className="input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full mt-4 sm:mt-6 py-3 text-sm sm:text-base"
              >
                {loading ? t('checkout.submitting') : t('checkout.submitQuotation')}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sticky top-20 sm:top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t('checkout.orderSummary')}
              </h2>

              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cart.subtotal')}</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>{t('cart.discountTotal')}</span>
                  <span>-{formatCurrency(discountTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cart.taxTotal')}</span>
                  <span className="font-medium">{formatCurrency(taxTotal)}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>{t('cart.grandTotal')}</span>
                    <span className="text-primary-600">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
