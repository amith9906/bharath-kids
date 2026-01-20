import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { TbArrowsExchange } from 'react-icons/tb';
import { itemsAPI, getImageUrl } from '../services/api';
import { useCompare } from '../contexts/CompareContext';
import ItemCard from '../components/items/ItemCard';

const Items = () => {
  const { t } = useTranslation();
  const { compareItems, removeFromCompare } = useCompare();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [search, selectedCategory, selectedBrand, page]);

  const fetchFilters = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        itemsAPI.getCategories(),
        itemsAPI.getBrands()
      ]);
      setCategories(categoriesRes.data.categories || []);
      setBrands(brandsRes.data.brands || []);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedBrand) params.brand = selectedBrand;

      const response = await itemsAPI.getItems(params);
      setItems(response.data.items);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSearch('');
    setPage(1);
  };

  const hasActiveFilters = selectedCategory || selectedBrand || search;

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">{t('items.title')}</h1>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden btn btn-secondary flex items-center gap-2"
          >
            <FiFilter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
            )}
          </button>
        </div>

        {/* Filters */}
        <div className={`bg-white rounded-lg shadow-sm p-4 mb-4 sm:mb-8 ${showFilters ? 'block' : 'hidden sm:block'}`}>
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search Row */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('items.searchPlaceholder')}
                  className="input pl-10 text-sm"
                />
              </div>
              <button type="submit" className="btn btn-primary text-sm sm:hidden">
                <FiSearch className="w-4 h-4" />
              </button>
            </form>

            {/* Filter Dropdowns */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Brand Filter */}
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setPage(1);
                }}
                className="input text-sm sm:w-48"
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="input text-sm sm:w-48"
              >
                <option value="">{t('items.allCategories')}</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn btn-secondary text-sm flex items-center gap-2"
                >
                  <FiX className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Active Filters Pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
              {selectedBrand && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                  Brand: {selectedBrand}
                  <button onClick={() => setSelectedBrand('')}>
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('')}>
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                  Search: "{search}"
                  <button onClick={() => setSearch('')}>
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('common.noData')}</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
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

        {/* Compare Floating Bar */}
        {compareItems.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-x-auto">
                <div className="flex items-center gap-2 text-sm text-gray-600 flex-shrink-0">
                  <TbArrowsExchange className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">{compareItems.length} items</span>
                </div>
                <div className="flex gap-2">
                  {compareItems.map((item) => (
                    <div
                      key={item.id}
                      className="relative flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg overflow-hidden"
                    >
                      {item.imageUrl ? (
                        <img
                          src={getImageUrl(item.imageUrl)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No img
                        </div>
                      )}
                      <button
                        onClick={() => removeFromCompare(item.id)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <Link
                to="/compare"
                className="btn btn-primary flex-shrink-0"
              >
                <TbArrowsExchange className="w-4 h-4" />
                Compare Now
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Add bottom padding when compare bar is visible */}
      {compareItems.length > 0 && <div className="h-20" />}
    </div>
  );
};

export default Items;
