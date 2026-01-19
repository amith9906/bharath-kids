import { useTranslation } from 'react-i18next';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';

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

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-200">
      {/* Image */}
      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              className="w-8 h-8"
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
        <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
        <p className="text-sm text-gray-500">
          {formatCurrency(item.price)} / {item.unit || 'piece'}
        </p>
        {parseFloat(item.discountPercent) > 0 && (
          <p className="text-xs text-green-600">
            {item.discountPercent}% discount applied
          </p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          <FiMinus className="w-4 h-4" />
        </button>
        <span className="w-10 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Total */}
      <div className="text-right min-w-[100px]">
        <p className="font-semibold text-gray-900">{formatCurrency(itemTotal)}</p>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeItem(item.id)}
        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
      >
        <FiTrash2 className="w-5 h-5" />
      </button>
    </div>
  );
};

export default CartItem;
