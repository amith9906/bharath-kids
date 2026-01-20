import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FiX, FiShoppingCart, FiArrowLeft, FiCheck, FiMinus } from 'react-icons/fi';
import { useCompare } from '../contexts/CompareContext';
import { useCart } from '../contexts/CartContext';
import { getImageUrl } from '../services/api';
import { toast } from 'react-toastify';

const Compare = () => {
  const { t } = useTranslation();
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const { addItem } = useCart();

  const handleAddToCart = (item) => {
    addItem(item);
    toast.success(`${item.name} added to cart`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getLowestPrice = () => {
    if (compareItems.length === 0) return null;
    return Math.min(...compareItems.map(item => parseFloat(item.price)));
  };

  const getHighestPrice = () => {
    if (compareItems.length === 0) return null;
    return Math.max(...compareItems.map(item => parseFloat(item.price)));
  };

  const lowestPrice = getLowestPrice();

  if (compareItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiMinus className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No items to compare
            </h2>
            <p className="text-gray-600 mb-6">
              Add items to compare by clicking the compare button on product cards.
            </p>
            <Link to="/items" className="btn btn-primary">
              <FiArrowLeft className="w-4 h-4" />
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Collect all unique attributes to compare
  const allCategories = [...new Set(compareItems.map(i => i.category).filter(Boolean))];
  const allBrands = [...new Set(compareItems.map(i => i.brand).filter(Boolean))];
  const hasWarranty = compareItems.some(i => i.warranty);
  const hasDiscount = compareItems.some(i => i.discountPercent > 0);
  const hasHsn = compareItems.some(i => i.hsnCode);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Compare Products</h1>
            <p className="text-gray-600 mt-1">
              Comparing {compareItems.length} product{compareItems.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/items" className="btn btn-secondary">
              <FiArrowLeft className="w-4 h-4" />
              Add More
            </Link>
            <button
              onClick={clearCompare}
              className="btn btn-danger"
            >
              <FiX className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>

        {/* Price Summary Card */}
        {compareItems.length > 1 && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-wrap items-center justify-center gap-6 text-center">
              <div>
                <div className="text-sm text-gray-500">Lowest Price</div>
                <div className="text-2xl font-bold text-green-600">{formatPrice(lowestPrice)}</div>
              </div>
              <div className="text-gray-300 text-2xl">|</div>
              <div>
                <div className="text-sm text-gray-500">Highest Price</div>
                <div className="text-2xl font-bold text-red-600">{formatPrice(getHighestPrice())}</div>
              </div>
              <div className="text-gray-300 text-2xl">|</div>
              <div>
                <div className="text-sm text-gray-500">Price Difference</div>
                <div className="text-2xl font-bold text-primary-600">
                  {formatPrice(getHighestPrice() - lowestPrice)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 w-32 sm:w-40">
                    Feature
                  </th>
                  {compareItems.map((item) => (
                    <th key={item.id} className="text-center px-4 py-3 min-w-[200px]">
                      <div className="relative">
                        <button
                          onClick={() => removeFromCompare(item.id)}
                          className="absolute -top-1 -right-1 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Product Image */}
                <tr>
                  <td className="px-4 py-4 text-sm font-medium text-gray-700">Image</td>
                  {compareItems.map((item) => (
                    <td key={item.id} className="px-4 py-4 text-center">
                      <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={getImageUrl(item.imageUrl)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Product Name */}
                <tr className="bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-700">Name</td>
                  {compareItems.map((item) => (
                    <td key={item.id} className="px-4 py-4 text-center">
                      <Link
                        to={`/items/${item.id}`}
                        className="font-semibold text-primary-600 hover:underline"
                      >
                        {item.name}
                      </Link>
                    </td>
                  ))}
                </tr>

                {/* Price */}
                <tr>
                  <td className="px-4 py-4 text-sm font-medium text-gray-700">Price</td>
                  {compareItems.map((item) => {
                    const price = parseFloat(item.price);
                    const isLowest = price === lowestPrice && compareItems.length > 1;
                    return (
                      <td key={item.id} className="px-4 py-4 text-center">
                        <span className={`text-lg font-bold ${isLowest ? 'text-green-600' : 'text-gray-900'}`}>
                          {formatPrice(price)}
                        </span>
                        {isLowest && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Lowest
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Discount */}
                {hasDiscount && (
                  <tr className="bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-700">Discount</td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="px-4 py-4 text-center">
                        {item.discountPercent > 0 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            {item.discountPercent}% OFF
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Category */}
                {allCategories.length > 0 && (
                  <tr>
                    <td className="px-4 py-4 text-sm font-medium text-gray-700">Category</td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="px-4 py-4 text-center text-gray-600">
                        {item.category || '-'}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Brand */}
                {allBrands.length > 0 && (
                  <tr className="bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-700">Brand</td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="px-4 py-4 text-center text-gray-600">
                        {item.brand || '-'}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Warranty */}
                {hasWarranty && (
                  <tr>
                    <td className="px-4 py-4 text-sm font-medium text-gray-700">Warranty</td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="px-4 py-4 text-center">
                        {item.warranty ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <FiCheck className="w-4 h-4" />
                            {item.warranty}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}

                {/* HSN Code */}
                {hasHsn && (
                  <tr className="bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-700">HSN Code</td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="px-4 py-4 text-center text-gray-600 font-mono text-sm">
                        {item.hsnCode || '-'}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Description */}
                <tr>
                  <td className="px-4 py-4 text-sm font-medium text-gray-700">Description</td>
                  {compareItems.map((item) => (
                    <td key={item.id} className="px-4 py-4 text-center">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {item.description || '-'}
                      </p>
                    </td>
                  ))}
                </tr>

                {/* Add to Cart */}
                <tr className="bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-700">Action</td>
                  {compareItems.map((item) => (
                    <td key={item.id} className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="btn btn-primary"
                      >
                        <FiShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compare;
