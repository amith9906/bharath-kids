import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiX, FiUpload, FiTrash2, FiImage } from 'react-icons/fi';
import { getImageUrl } from '../../services/api';

const AddEditItem = ({ item, onClose, onSave }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    brand: '',
    category: '',
    hsnCode: '',
    unit: 'piece',
    discountPercent: '0',
    igstRate: '0',
    cgstRate: '0',
    sgstRate: '0',
    warranty: '',
    isActive: true
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        price: item.price?.toString() || '',
        brand: item.brand || '',
        category: item.category || '',
        hsnCode: item.hsnCode || '',
        unit: item.unit || 'piece',
        discountPercent: item.discountPercent?.toString() || '0',
        igstRate: item.igstRate?.toString() || '0',
        cgstRate: item.cgstRate?.toString() || '0',
        sgstRate: item.sgstRate?.toString() || '0',
        warranty: item.warranty || '',
        isActive: item.isActive !== false
      });
      if (item.imageUrl) {
        setImagePreview(getImageUrl(item.imageUrl));
      }
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: 'Image size must be less than 5MB' }));
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, image: 'Only JPEG, PNG, GIF, WebP images are allowed' }));
        return;
      }

      setImageFile(file);
      setRemoveImage(false);
      setErrors((prev) => ({ ...prev, image: '' }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = t('validation.required');
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      newErrors.price = 'Price must be a positive number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Create FormData for multipart upload
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('brand', formData.brand);
      submitData.append('category', formData.category);
      submitData.append('hsnCode', formData.hsnCode);
      submitData.append('unit', formData.unit);
      submitData.append('discountPercent', formData.discountPercent);
      submitData.append('igstRate', formData.igstRate);
      submitData.append('cgstRate', formData.cgstRate);
      submitData.append('sgstRate', formData.sgstRate);
      submitData.append('warranty', formData.warranty);
      submitData.append('isActive', formData.isActive);

      if (imageFile) {
        submitData.append('image', imageFile);
      }

      if (removeImage) {
        submitData.append('removeImage', 'true');
      }

      await onSave(submitData);
    } catch (error) {
      // Error is handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-4 sm:my-8 max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between p-4 sm:p-6 border-b z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {item ? t('admin.items.editItem') : t('admin.items.addItem')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Preview */}
              <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FiImage className="w-10 h-10" />
                  </div>
                )}
              </div>

              {/* Upload controls */}
              <div className="flex flex-col justify-center gap-2 flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary text-sm"
                >
                  <FiUpload className="w-4 h-4" />
                  {imagePreview ? 'Change Image' : 'Upload Image'}
                </button>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="btn btn-danger text-sm"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Remove Image
                  </button>
                )}
                <p className="text-xs text-gray-500">
                  Max 5MB. JPEG, PNG, GIF, WebP
                </p>
                {errors.image && (
                  <p className="text-red-500 text-xs">{errors.image}</p>
                )}
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.items.itemName')} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.items.description')}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.items.price')} *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`input ${errors.price ? 'border-red-500' : ''}`}
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.items.unit')}
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="input"
              >
                <option value="piece">Piece</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="l">Litre (l)</option>
                <option value="ml">Millilitre (ml)</option>
                <option value="m">Metre (m)</option>
                <option value="cm">Centimetre (cm)</option>
                <option value="box">Box</option>
                <option value="pack">Pack</option>
                <option value="set">Set</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g., Anchor, Legrand, Cona"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.items.category')}
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Switches, MCB, Cables"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.items.hsnCode')}
              </label>
              <input
                type="text"
                name="hsnCode"
                value={formData.hsnCode}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warranty
              </label>
              <input
                type="text"
                name="warranty"
                value={formData.warranty}
                onChange={handleChange}
                placeholder="e.g., 1 Year, 2 Years, 6 Months"
                className="input"
              />
            </div>
          </div>

          {/* Discount */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              {t('admin.items.discount')}
            </h3>
            <div className="flex items-center">
              <input
                type="number"
                name="discountPercent"
                value={formData.discountPercent}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.1"
                className="input w-24 sm:w-32"
              />
              <span className="ml-2 text-gray-500">%</span>
            </div>
          </div>

          {/* Tax Rates */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Tax Rates</h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {t('admin.items.igst')}
                </label>
                <input
                  type="number"
                  name="igstRate"
                  value={formData.igstRate}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {t('admin.items.cgst')}
                </label>
                <input
                  type="number"
                  name="cgstRate"
                  value={formData.cgstRate}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {t('admin.items.sgst')}
                </label>
                <input
                  type="number"
                  name="sgstRate"
                  value={formData.sgstRate}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="input"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Use IGST for inter-state, CGST+SGST for intra-state sales.
            </p>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-5 h-5 text-primary-600 rounded"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              {t('admin.items.active')} (visible to customers)
            </label>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary w-full sm:w-auto"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full sm:w-auto"
            >
              {loading ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditItem;
