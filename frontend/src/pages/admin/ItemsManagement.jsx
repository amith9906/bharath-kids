import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { adminAPI } from '../../services/api';
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
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [page]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.items.title')}</h1>
        <button onClick={handleAddNew} className="btn btn-primary flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          {t('admin.items.addItem')}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              className="input pl-10"
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            {t('common.search')}
          </button>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('admin.items.itemName')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('admin.items.category')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('admin.items.price')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('admin.items.discount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tax
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-400 text-xs">N/A</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.hsnCode && (
                            <p className="text-xs text-gray-500">HSN: {item.hsnCode}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.category || '-'}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {parseFloat(item.discountPercent) > 0 ? (
                        <span className="text-green-600">{item.discountPercent}%</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
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
                    <td className="px-6 py-4">
                      <span
                        className={`badge ${
                          item.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.isActive ? t('admin.items.active') : t('admin.items.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-primary-600 hover:text-primary-700 mr-3"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-red-600 hover:text-red-700"
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
