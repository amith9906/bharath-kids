import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSave, FiRefreshCw, FiUpload, FiTrash2, FiImage, FiEye, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { adminAPI, getImageUrl } from '../../services/api';
import { useStore } from '../../contexts/StoreContext';

const StoreSettings = () => {
  const { t } = useTranslation();
  const { refreshSettings } = useStore();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [settings, setSettings] = useState({
    storeName: '',
    tagline: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    alternatePhone: '',
    email: '',
    whatsapp: '',
    gstin: '',
    proprietorName: '',
    proprietorPhone: '',
    website: '',
    facebook: '',
    instagram: '',
    workingHours: '',
    aboutText: '',
    mission: '',
    vision: '',
    aboutWebsite: '',
    footerText: '',
    primaryColor: '#4F46E5'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getStoreSettings();
      if (response.data.settings) {
        setSettings(response.data.settings);
        if (response.data.settings.logoUrl) {
          setLogoPreview(getImageUrl(response.data.settings.logoUrl));
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo size must be less than 2MB');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPEG, PNG, SVG images are allowed');
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      await adminAPI.deleteLogo();
      setLogoPreview(null);
      setLogoFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success('Logo removed');
    } catch (error) {
      console.error('Error removing logo:', error);
      toast.error('Failed to remove logo');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.keys(settings).forEach(key => {
        if (key !== 'logoUrl' && key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
          formData.append(key, settings[key] || '');
        }
      });

      if (logoFile) {
        formData.append('logo', logoFile);
      }

      await adminAPI.updateStoreSettings(formData);
      toast.success('Settings saved successfully');
      setLogoFile(null);
      // Refresh the store context so changes reflect across the site
      await refreshSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const getPreviewAddress = () => {
    const parts = [
      settings.address,
      settings.city,
      settings.state,
      settings.pincode
    ].filter(Boolean);
    return parts.join(', ');
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
      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center overflow-y-auto py-8">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 relative">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
              <h3 className="text-lg font-semibold">Preview Store Appearance</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Preview Header */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-3 py-1 text-xs text-gray-500 border-b">Header Preview</div>
                <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {logoPreview && (
                        <img src={logoPreview} alt="Logo" className="h-10 w-auto bg-white rounded p-1" />
                      )}
                      <div>
                        <div className="font-bold text-lg">{settings.storeName || 'Store Name'}</div>
                        {settings.tagline && (
                          <div className="text-primary-100 text-sm">{settings.tagline}</div>
                        )}
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-sm">
                      {settings.phone && <span>{settings.phone}</span>}
                      {settings.workingHours && <span>{settings.workingHours}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Hero Section */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-3 py-1 text-xs text-gray-500 border-b">Homepage Hero Preview</div>
                <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white p-8 text-center">
                  {logoPreview && (
                    <img src={logoPreview} alt="Logo" className="h-16 w-auto mx-auto mb-4 bg-white rounded-lg p-2" />
                  )}
                  <h1 className="text-2xl font-bold mb-2">{settings.storeName || 'Store Name'}</h1>
                  {settings.tagline && (
                    <p className="text-primary-100">{settings.tagline}</p>
                  )}
                </div>
              </div>

              {/* Preview About Section */}
              {settings.aboutText && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-3 py-1 text-xs text-gray-500 border-b">About Section Preview</div>
                  <div className="p-6 bg-white text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">About Us</h2>
                    <p className="text-gray-600">{settings.aboutText}</p>
                  </div>
                </div>
              )}

              {/* Preview Contact Section */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-3 py-1 text-xs text-gray-500 border-b">Contact Section Preview</div>
                <div className="p-6 bg-white">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Contact Us</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {settings.phone && (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Phone</div>
                        <div className="font-medium">{settings.phone}</div>
                      </div>
                    )}
                    {settings.whatsapp && (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">WhatsApp</div>
                        <div className="font-medium">{settings.whatsapp}</div>
                      </div>
                    )}
                    {settings.email && (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Email</div>
                        <div className="font-medium text-sm break-all">{settings.email}</div>
                      </div>
                    )}
                    {getPreviewAddress() && (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Address</div>
                        <div className="font-medium text-sm">{getPreviewAddress()}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Preview Footer */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-3 py-1 text-xs text-gray-500 border-b">Footer Preview</div>
                <div className="bg-gray-900 text-white p-6">
                  <div className="flex flex-wrap justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {logoPreview && (
                          <img src={logoPreview} alt="Logo" className="h-8 w-auto bg-white rounded p-1" />
                        )}
                        <span className="font-bold">{settings.storeName || 'Store Name'}</span>
                      </div>
                      {settings.tagline && (
                        <p className="text-gray-400 text-sm">{settings.tagline}</p>
                      )}
                    </div>
                    <div className="text-sm">
                      {getPreviewAddress() && <div className="text-gray-400">{getPreviewAddress()}</div>}
                      {settings.phone && <div className="text-gray-400">Phone: {settings.phone}</div>}
                      {settings.email && <div className="text-gray-400">Email: {settings.email}</div>}
                    </div>
                    {settings.proprietorName && (
                      <div className="text-sm">
                        <div className="text-gray-400">Proprietor: {settings.proprietorName}</div>
                        {settings.gstin && <div className="text-gray-400">GSTIN: {settings.gstin}</div>}
                      </div>
                    )}
                  </div>
                  {settings.footerText && (
                    <div className="border-t border-gray-700 mt-4 pt-4 text-center text-gray-400 text-sm">
                      {settings.footerText}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end rounded-b-xl border-t">
              <button
                onClick={() => setShowPreview(false)}
                className="btn btn-secondary"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="btn btn-secondary"
          >
            <FiEye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={fetchSettings}
            className="btn btn-secondary"
            disabled={loading}
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo & Basic Info */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Identity</h2>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo Upload */}
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Logo
              </label>
              <div className="w-40 h-40 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <FiImage className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="mt-2 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoSelect}
                  accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary text-sm w-full"
                >
                  <FiUpload className="w-4 h-4" />
                  {logoPreview ? 'Change' : 'Upload'}
                </button>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="btn btn-danger text-sm w-full"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Max 2MB. JPG, PNG, SVG</p>
            </div>

            {/* Store Name & Tagline */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name *
                </label>
                <input
                  type="text"
                  name="storeName"
                  value={settings.storeName}
                  onChange={handleChange}
                  className="input"
                  placeholder="Your Store Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tagline / Slogan
                </label>
                <input
                  type="text"
                  name="tagline"
                  value={settings.tagline}
                  onChange={handleChange}
                  className="input"
                  placeholder="Your trusted partner for quality products"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="primaryColor"
                    value={settings.primaryColor}
                    onChange={handleChange}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="input w-32"
                    placeholder="#4F46E5"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                className="input"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alternate Phone
              </label>
              <input
                type="text"
                name="alternatePhone"
                value={settings.alternatePhone}
                onChange={handleChange}
                className="input"
                placeholder="+91 98765 43211"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="input"
                placeholder="contact@store.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Number
              </label>
              <input
                type="text"
                name="whatsapp"
                value={settings.whatsapp}
                onChange={handleChange}
                className="input"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="text"
                name="website"
                value={settings.website}
                onChange={handleChange}
                className="input"
                placeholder="https://www.yourstore.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Working Hours
              </label>
              <input
                type="text"
                name="workingHours"
                value={settings.workingHours}
                onChange={handleChange}
                className="input"
                placeholder="Mon-Sat: 9:00 AM - 7:00 PM"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <textarea
                name="address"
                value={settings.address}
                onChange={handleChange}
                rows={2}
                className="input"
                placeholder="123, Main Street, Near Landmark"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={settings.city}
                onChange={handleChange}
                className="input"
                placeholder="Bangalore"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                name="state"
                value={settings.state}
                onChange={handleChange}
                className="input"
                placeholder="Karnataka"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode
              </label>
              <input
                type="text"
                name="pincode"
                value={settings.pincode}
                onChange={handleChange}
                className="input"
                placeholder="560001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GSTIN
              </label>
              <input
                type="text"
                name="gstin"
                value={settings.gstin}
                onChange={handleChange}
                className="input"
                placeholder="29AAAAA0000A1Z5"
              />
            </div>
          </div>
        </div>

        {/* Proprietor Info */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Proprietor Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proprietor Name
              </label>
              <input
                type="text"
                name="proprietorName"
                value={settings.proprietorName}
                onChange={handleChange}
                className="input"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proprietor Phone
              </label>
              <input
                type="text"
                name="proprietorPhone"
                value={settings.proprietorPhone}
                onChange={handleChange}
                className="input"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facebook Page
              </label>
              <input
                type="text"
                name="facebook"
                value={settings.facebook}
                onChange={handleChange}
                className="input"
                placeholder="https://facebook.com/yourstore"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instagram
              </label>
              <input
                type="text"
                name="instagram"
                value={settings.instagram}
                onChange={handleChange}
                className="input"
                placeholder="https://instagram.com/yourstore"
              />
            </div>
          </div>
        </div>

        {/* About & Footer */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">About & Footer</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About Text (for homepage)
              </label>
              <textarea
                name="aboutText"
                value={settings.aboutText}
                onChange={handleChange}
                rows={3}
                className="input"
                placeholder="Tell customers about your store..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mission
              </label>
              <textarea
                name="mission"
                value={settings.mission}
                onChange={handleChange}
                rows={3}
                className="input"
                placeholder="What is your mission statement?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vision
              </label>
              <textarea
                name="vision"
                value={settings.vision}
                onChange={handleChange}
                rows={3}
                className="input"
                placeholder="What is your vision for the future?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About Website
              </label>
              <textarea
                name="aboutWebsite"
                value={settings.aboutWebsite}
                onChange={handleChange}
                rows={4}
                className="input"
                placeholder="Describe your website and what it offers..."
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
                placeholder="© 2024 Your Store. All rights reserved."
              />
            </div>
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

export default StoreSettings;
