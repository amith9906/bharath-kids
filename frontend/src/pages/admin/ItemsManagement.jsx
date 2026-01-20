import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiDownload, FiUpload, FiImage, FiFilter } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { adminAPI, itemsAPI, getImageUrl } from '../../services/api';
import AddEditItem from './AddEditItem';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const ItemsManagement = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const bulkFileInputRef = useRef(null);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [page, selectedBrand, selectedCategory]);

  const fetchFilters = async () => {
    try {
      const [brandsRes, categoriesRes] = await Promise.all([
        itemsAPI.getBrands(),
        itemsAPI.getCategories()
      ]);
      setBrands(brandsRes.data.brands || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (selectedBrand) params.brand = selectedBrand;
      if (selectedCategory) params.category = selectedCategory;

      const response = await adminAPI.getItems(params);
      setItems(response.data.items);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(t('admin.items.confirmDelete'))) return;

    try {
      await adminAPI.deleteItem(item.id);
      toast.success(t('admin.items.itemDeleted'));
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleSave = async (itemData) => {
    try {
      if (editingItem) {
        await adminAPI.updateItem(editingItem.id, itemData);
        toast.success(t('admin.items.itemUpdated'));
      } else {
        await adminAPI.createItem(itemData);
        toast.success(t('admin.items.itemCreated'));
      }
      setShowModal(false);
      fetchItems();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error(error.response?.data?.message || 'Failed to save item');
      throw error;
    }
  };

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      const response = await adminAPI.downloadTemplate();
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'items_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await adminAPI.bulkUpload(formData);
      const { created, updated, errors } = response.data;

      let message = `Bulk upload complete: ${created} created, ${updated} updated`;
      if (errors && errors.length > 0) {
        message += `, ${errors.length} errors`;
        errors.forEach((err, idx) => {
          if (idx < 3) {
            toast.warning(`Row ${err.row}: ${err.error}`, { autoClose: 5000 });
          }
        });
        if (errors.length > 3) {
          toast.warning(`...and ${errors.length - 3} more errors`);
        }
      }

      toast.success(message);
      fetchItems();
    } catch (error) {
      console.error('Error bulk uploading:', error);
      toast.error(error.response?.data?.message || 'Failed to upload items');
    } finally {
      setBulkUploading(false);
      if (bulkFileInputRef.current) {
        bulkFileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('admin.items.title')}</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadTemplate}
            disabled={downloadingTemplate}
            className="btn btn-secondary flex items-center gap-2 text-sm"
          >
            <FiDownload className="w-4 h-4" />
            <span className="hidden xs:inline">Template</span>
          </button>
          <input
            type="file"
            ref={bulkFileInputRef}
            onChange={handleBulkUpload}
            accept=".xlsx,.xls"
            className="hidden"
          />
          <button
            onClick={() => bulkFileInputRef.current?.click()}
            disabled={bulkUploading}
            className="btn btn-secondary flex items-center gap-2 text-sm"
          >
            <FiUpload className="w-4 h-4" />
            {bulkUploading ? 'Uploading...' : <span className="hidden xs:inline">Bulk Upload</span>}
            {!bulkUploading && <span className="xs:hidden">Bulk</span>}
          </button>
          <button onClick={handleAddNew} className="btn btn-primary flex items-center gap-2 text-sm">
            <FiPlus className="w-4 h-4" />
            {t('admin.items.addItem')}
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <form onSubmit={handleSearch} className="space-y-3">
          {/* Search Row */}
          <div className="flex gap-2 sm:gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items..."
                className="input pl-10 text-sm"
              />
            </div>
            <button type="submit" className="btn btn-secondary text-sm">
              {t('common.search')}
            </button>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FiFilter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters:</span>
            </div>

            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setPage(1);
              }}
              className="input text-sm py-2 w-full sm:w-40"
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="input text-sm py-2 w-full sm:w-40"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {(selectedBrand || selectedCategory) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedBrand('');
                  setSelectedCategory('');
                  setPage(1);
                }}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Clear filters
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('admin.items.itemName')}
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                    Brand
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">
                    {t('admin.items.category')}
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('admin.items.price')}
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">
                    {t('admin.items.discount')}
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">
                    Tax
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getImageUrl(item.imageUrl) ? (
                          <img
                            src={getImageUrl(item.imageUrl)}
                            alt={item.name}
                            className="w-10 h-10 rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                            <FiImage className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{item.name}</p>
                          {item.hsnCode && (
                            <p className="text-xs text-gray-500">HSN: {item.hsnCode}</p>
                          )}
                          {/* Show brand on mobile */}
                          {item.brand && (
                            <p className="text-xs text-primary-600 md:hidden">{item.brand}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-primary-600 font-medium hidden md:table-cell">
                      {item.brand || '-'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                      {item.category || '-'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 font-semibold text-sm">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm hidden lg:table-cell">
                      {parseFloat(item.discountPercent) > 0 ? (
                        <span className="text-green-600">{item.discountPercent}%</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm hidden xl:table-cell">
                      {parseFloat(item.igstRate) > 0 && (
                        <p>IGST: {item.igstRate}%</p>
                      )}
                      {parseFloat(item.cgstRate) > 0 && (
                        <p>CGST: {item.cgstRate}%</p>
                      )}
                      {parseFloat(item.sgstRate) > 0 && (
                        <p>SGST: {item.sgstRate}%</p>
                      )}
                      {!parseFloat(item.igstRate) && !parseFloat(item.cgstRate) && '-'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                      <span
                        className={`badge text-xs ${
                          item.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.isActive ? t('admin.items.active') : t('admin.items.inactive')}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-primary-600 hover:text-primary-700 p-1 mr-1"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

      {/* Add/Edit Modal */}
      {showModal && (
        <AddEditItem
          item={editingItem}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ItemsManagement;
