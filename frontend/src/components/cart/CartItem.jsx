import { useTranslation } from 'react-i18next';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { getImageUrl } from '../../services/api';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
};

const CartItem = ({ item }) => {
  const { t } = useTranslation();
  const { updateQuantity, removeItem } = useCart();

  const itemTotal = parseFloat(item.price) * item.quantity;

  const imageUrl = getImageUrl(item.imageUrl);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-4 border-b border-gray-200">
      {/* Top row on mobile: Image + Details + Remove */}
      <div className="flex items-start gap-3 sm:contents">
        {/* Image */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8"
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
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2">{item.name}</h3>
          <p className="text-xs sm:text-sm text-gray-500">
            {formatCurrency(item.price)} / {item.unit || 'piece'}
          </p>
          {parseFloat(item.discountPercent) > 0 && (
            <p className="text-xs text-green-600">
              {item.discountPercent}% discount
            </p>
          )}
        </div>

        {/* Remove Button - visible on mobile in top row */}
        <button
          onClick={() => removeItem(item.id)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors sm:hidden"
        >
          <FiTrash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom row on mobile: Quantity + Total */}
      <div className="flex items-center justify-between sm:contents pl-0 sm:pl-0">
        {/* Quantity Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="p-2 sm:p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <FiMinus className="w-4 h-4" />
          </button>
          <span className="w-10 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="p-2 sm:p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Total */}
        <div className="text-right min-w-[80px] sm:min-w-[100px]">
          <p className="font-semibold text-gray-900 text-sm sm:text-base">{formatCurrency(itemTotal)}</p>
        </div>

        {/* Remove Button - hidden on mobile, visible on desktop */}
        <button
          onClick={() => removeItem(item.id)}
          className="hidden sm:block p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <FiTrash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
