import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiShoppingCart, FiZoomIn, FiPlus, FiMinus, FiTrash2, FiCheck } from 'react-icons/fi';
import { TbArrowsExchange } from 'react-icons/tb';
import { useCart } from '../../contexts/CartContext';
import { useCompare } from '../../contexts/CompareContext';
import { getImageUrl } from '../../services/api';
import ImageZoom from '../common/ImageZoom';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const ItemCard = ({ item }) => {
  const { t } = useTranslation();
  const { addItem, decreaseItem, removeItem, getItemQuantity } = useCart();
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare();
  const [showZoom, setShowZoom] = useState(false);
  const quantityInCart = getItemQuantity(item.id);
  const inCompare = isInCompare(item.id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(item);
  };

  const handleDecrease = (e) => {
    e.stopPropagation();
    decreaseItem(item.id);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    removeItem(item.id);
  };

  const handleCompareToggle = (e) => {
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(item.id);
    } else if (canAddMore()) {
      addToCompare(item);
    }
  };

  const handleImageClick = () => {
    if (item.imageUrl) {
      setShowZoom(true);
    }
  };

  const hasDiscount = parseFloat(item.discountPercent) > 0;
  const hasTax = parseFloat(item.igstRate) > 0 || parseFloat(item.cgstRate) > 0;
  const imageUrl = getImageUrl(item.imageUrl);

  return (
    <>
      <div className="card hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
        {/* Image */}
        <div
          className="aspect-square bg-gray-100 rounded-lg mb-3 sm:mb-4 overflow-hidden relative group cursor-pointer"
          onClick={handleImageClick}
        >
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              {/* Zoom icon overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <FiZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg
                className="w-12 h-12 sm:w-16 sm:h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Discount badge on image */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{item.discountPercent}%
            </div>
          )}

          {/* Compare button on image */}
          <button
            onClick={handleCompareToggle}
            disabled={!inCompare && !canAddMore()}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all shadow-sm ${
              inCompare
                ? 'bg-primary-600 text-white'
                : canAddMore()
                ? 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title={inCompare ? 'Remove from compare' : canAddMore() ? 'Add to compare' : 'Compare limit reached'}
          >
            {inCompare ? <FiCheck className="w-4 h-4" /> : <TbArrowsExchange className="w-4 h-4" />}
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 space-y-1.5 sm:space-y-2">
          {/* Brand & Category */}
          <div className="flex items-center gap-2 flex-wrap">
            {item.brand && (
              <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                {item.brand}
              </span>
            )}
            {item.category && (
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                {item.category}
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
            {item.name}
          </h3>

          {item.description && (
            <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 flex-1">
              {item.description}
            </p>
          )}

          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg sm:text-xl font-bold text-primary-600">
              {formatCurrency(item.price)}
            </span>
            {item.unit && (
              <span className="text-xs sm:text-sm text-gray-500">/ {item.unit}</span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {hasTax && (
              <span className="badge bg-blue-100 text-blue-800 text-xs">
                GST: {item.igstRate > 0 ? item.igstRate : (parseFloat(item.cgstRate) + parseFloat(item.sgstRate))}%
              </span>
            )}
            {item.warranty && (
              <span className="badge bg-purple-100 text-purple-800 text-xs">
                Warranty: {item.warranty}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          {quantityInCart > 0 ? (
            <div className="mt-auto flex items-center gap-2">
              <div className="flex items-center bg-gray-100 rounded-lg">
                <button
                  onClick={handleDecrease}
                  className="p-2.5 sm:p-2 text-gray-600 hover:text-red-600 hover:bg-gray-200 rounded-l-lg transition-colors"
                >
                  {quantityInCart === 1 ? <FiTrash2 className="w-5 h-5" /> : <FiMinus className="w-5 h-5" />}
                </button>
                <span className="px-4 py-2 font-semibold text-gray-900 min-w-[3rem] text-center">
                  {quantityInCart}
                </span>
                <button
                  onClick={handleAddToCart}
                  className="p-2.5 sm:p-2 text-gray-600 hover:text-green-600 hover:bg-gray-200 rounded-r-lg transition-colors"
                >
                  <FiPlus className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={handleRemove}
                className="p-2.5 sm:p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove from cart"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-full mt-auto flex items-center justify-center gap-2 py-3 sm:py-2.5 px-4 rounded-lg font-medium transition-all text-sm sm:text-base bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800"
            >
              <FiShoppingCart className="w-5 h-5" />
              {t('items.addToCart')}
            </button>
          )}
        </div>
      </div>

      {/* Image Zoom Modal */}
      {showZoom && imageUrl && (
        <ImageZoom
          src={imageUrl}
          alt={item.name}
          onClose={() => setShowZoom(false)}
        />
      )}
    </>
  );
};

export default ItemCard;
