import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSave, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { adminAPI } from '../../services/api';

const QuoteSettings = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyGstin: '',
    disclaimer: 'This quotation is valid for 15 days from the date of issue.',
    termsAndConditions: '',
    footerText: 'Thank you for your business!',
    showGstDisclaimer: true,
    validityDays: 15
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getQuoteSettings();
      if (response.data.settings) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.updateQuoteSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quote Template Settings</h1>
        <button
          onClick={fetchSettings}
          className="btn btn-secondary"
          disabled={loading}
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
          <p className="text-sm text-gray-500 mb-4">This information will appear on the quotation header.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={settings.companyName}
                onChange={handleChange}
                className="input"
                placeholder="Your Company Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GSTIN
              </label>
              <input
                type="text"
                name="companyGstin"
                value={settings.companyGstin}
                onChange={handleChange}
                className="input"
                placeholder="22AAAAA0000A1Z5"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Address
              </label>
              <textarea
                name="companyAddress"
                value={settings.companyAddress}
                onChange={handleChange}
                rows={2}
                className="input"
                placeholder="Full company address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="companyPhone"
                value={settings.companyPhone}
                onChange={handleChange}
                className="input"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="companyEmail"
                value={settings.companyEmail}
                onChange={handleChange}
                className="input"
                placeholder="sales@company.com"
              />
            </div>
          </div>
        </div>

        {/* Quote Settings */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quote Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Validity Period (Days)
              </label>
              <input
                type="number"
                name="validityDays"
                value={settings.validityDays}
                onChange={handleChange}
                min="1"
                max="365"
                className="input w-32"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of days the quotation is valid for
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="showGstDisclaimer"
                id="showGstDisclaimer"
                checked={settings.showGstDisclaimer}
                onChange={handleChange}
                className="w-5 h-5 text-primary-600 rounded"
              />
              <label htmlFor="showGstDisclaimer" className="text-sm text-gray-700">
                Show GST disclaimer on quotes without tax
              </label>
            </div>
            <p className="text-xs text-gray-500 -mt-2 ml-8">
              When enabled, displays "This quotation does not include GST" in red on quotes without tax calculations
            </p>
          </div>
        </div>

        {/* Content Templates */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Templates</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Disclaimer Text
              </label>
              <textarea
                name="disclaimer"
                value={settings.disclaimer}
                onChange={handleChange}
                rows={2}
                className="input"
                placeholder="This quotation is valid for 15 days..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Shown at the bottom of quotations
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Terms & Conditions
              </label>
              <textarea
                name="termsAndConditions"
                value={settings.termsAndConditions}
                onChange={handleChange}
                rows={4}
                className="input"
                placeholder="1. Payment terms: 50% advance, 50% on delivery&#10;2. Delivery within 7-10 working days&#10;3. Prices are subject to change without notice"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Footer Text
              </label>
              <input
                type="text"
                name="footerText"
                value={settings.footerText}
                onChange={handleChange}
                className="input"
                placeholder="Thank you for your business!"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="card bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
          <div className="bg-white border rounded-lg p-6 space-y-4">
            <div className="text-center border-b pb-4">
              <h3 className="text-xl font-bold text-gray-900">{settings.companyName || 'Your Company Name'}</h3>
              <p className="text-sm text-gray-600">{settings.companyAddress || 'Company Address'}</p>
              {(settings.companyPhone || settings.companyEmail) && (
                <p className="text-sm text-gray-600">
                  {[settings.companyPhone, settings.companyEmail].filter(Boolean).join(' | ')}
                </p>
              )}
              {settings.companyGstin && (
                <p className="text-sm text-gray-600">GSTIN: {settings.companyGstin}</p>
              )}
            </div>

            <div className="text-center">
              <span className="text-lg font-bold text-gray-800">QUOTATION</span>
            </div>

            <div className="bg-gray-100 p-3 rounded text-sm text-gray-600">
              [Items table will appear here]
            </div>

            {settings.showGstDisclaimer && (
              <p className="text-red-600 font-semibold text-sm">
                * This quotation does not include GST. GST will be charged as applicable.
              </p>
            )}

            {settings.disclaimer && (
              <p className="text-sm text-gray-500 italic">{settings.disclaimer}</p>
            )}

            {settings.termsAndConditions && (
              <div>
                <p className="text-sm font-semibold text-gray-700">Terms & Conditions:</p>
                <p className="text-sm text-gray-500 whitespace-pre-line">{settings.termsAndConditions}</p>
              </div>
            )}

            {settings.footerText && (
              <p className="text-center text-sm text-gray-600 pt-4 border-t">{settings.footerText}</p>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? (
              <>
                <FiRefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuoteSettings;
