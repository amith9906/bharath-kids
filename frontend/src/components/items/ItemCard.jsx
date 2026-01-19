import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiShoppingCart, FiCheck, FiZoomIn } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
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
  const { addItem, getItemQuantity } = useCart();
  const [showZoom, setShowZoom] = useState(false);
  const quantityInCart = getItemQuantity(item.id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(item);
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
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 space-y-1.5 sm:space-y-2">
          {item.category && (
            <span className="text-xs text-primary-600 font-medium uppercase tracking-wide">
              {item.category}
            </span>
          )}

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
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className={`w-full mt-auto flex items-center justify-center gap-2 py-3 sm:py-2.5 px-4 rounded-lg font-medium transition-all text-sm sm:text-base ${
              quantityInCart > 0
                ? 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
                : 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800'
            }`}
          >
            {quantityInCart > 0 ? (
              <>
                <FiCheck className="w-5 h-5" />
                <span className="hidden xs:inline">{t('items.addedToCart')}</span>
                <span className="xs:hidden">Added</span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
                  {quantityInCart}
                </span>
              </>
            ) : (
              <>
                <FiShoppingCart className="w-5 h-5" />
                {t('items.addToCart')}
              </>
            )}
          </button>
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
